const moment = require('moment');

const TIME_ORIGIN = moment('2025-01-01');  // Reference date for day counting
const EARTH_TILT = 23.439281;              // Earth's axial tilt (degrees)

//const LATITUDE = -34.6037;                 // Observer latitude (e.g., Buenos Aires)
//const LONGITUDE = -58.3821;                // Observer longitude

const LATITUDE = 0.0;
const LONGITUDE = 0.0;

/**
 * Compute number of days since TIME_ORIGIN.
 * Used to parameterize the Earth's orbit (1 full orbit ≈ 365 days).
 */
function dayDiff(date){
	return date.diff(TIME_ORIGIN.year(date.year()), 'days') + 1;
}

/**
 * Convert degrees to radians.
 * All trig functions in JavaScript use radians.
 */
function rad(angle){
	return angle * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 */
function deg(angle){
	return angle * (180/Math.PI);
}

/**
 * Convert hours to minutes.
 */
function hourToMin(h){
	return h*60;
}

/**
 * Compute the hour angle (HA) of the Sun.
 *
 * Hour angle = 0° at local solar noon (when the Sun crosses the meridian).
 * The Sun moves 15° per hour (360° / 24h), or 1° every 4 minutes.
 *
 * Formula:
 *    HA = ((t * 60) - 720) / 4
 * where:
 *    t = local time in hours (e.g., 13.0 for 1 PM)
 *    720 min = 12 hours, i.e., the offset for solar noon
 */
function hourAngle(hour)
{
	return ((hour * 60) - 720) / 4; // 4 min/deg rotation rate
}

/**
 * Compute the solar declination (δ) angle.
 *
 * Declination is the latitude at which the Sun is directly overhead at solar noon.
 * It varies through the year as Earth’s tilt changes the Sun’s apparent north–south position.
 *
 * Approximation:
 *    δ = 23.44° × sin( (360° / 365) × (N + 284) )
 *
 * where:
 *    N = day of year
 *    23.44° = Earth’s axial tilt
 *    284 = phase offset aligning the sine wave to solstices/equinoxes
 */
function declination(date){
	var days = dayDiff(date);
	return EARTH_TILT * Math.sin( rad( ((days + 284)/365)*360) );
}

/**
 * Compute the Equation of Time (EoT), in minutes.
 *
 * The EoT corrects for the difference between "clock time" and "solar time".
 * It arises because:
 *   (1) Earth's orbit is elliptical (non-uniform angular speed),
 *   (2) the axis is tilted relative to the orbital plane.
 *
 * Approximation:
 *   B = 360° * (N - 81) / 365
 *   EoT = 9.87·sin(2B) - 7.53·cos(B) - 1.5·sin(B)
 *
 * Positive EoT means the sundial is *ahead* of clock time.
 */
function timeEquation(date){
	var days = dayDiff(date);

	function D(days){
		return 360 * ((days - 81) / 365 );
	}

	D = D(days);

	return (9.87 * Math.sin(rad(D*2))) - (7.53 * Math.cos(rad(D))) - ( 1.5 * Math.sin(rad(D)));
}

/**
 * Find the longitude of the nearest standard meridian (time zone center).
 *
 * Each time zone spans 15° of longitude (360° / 24h).
 * This value helps adjust from standard time to local solar time.
 */
function localStandardMeridian(lon){
	return 15 * Math.round(lon / 15);
}

/**
 * Compute the Apparent Solar Time (AST), in hours.
 *
 * Apparent Solar Time = clock time adjusted for:
 *   - longitude difference from time zone meridian
 *   - Equation of Time correction
 *
 * Formula:
 *   AST = LST + (4 × (LSM - lon)) + EoT
 *
 * Explanation:
 *   - 4 min per degree of longitude (Earth rotates 1° every 4 min)
 *   - LST = local standard time in minutes
 *   - EoT in minutes
 */
function apparentSolarTime(date, localStandardTime, lon){
	var lst = hourToMin(localStandardTime);
	var lsm = localStandardMeridian(lon);
	var et = parseFloat(timeEquation(date).toFixed(2));
	var ast = lst + (4 * (lsm - lon)) + et;
	return ast/60; // back to hours
}

/**
 * Compute the Sun’s altitude angle (height above the horizon).
 *
 * Using the standard spherical astronomy formula:
 *   sin(h) = sin(φ)·sin(δ) + cos(φ)·cos(δ)·cos(H)
 *
 * where:
 *   h = solar altitude (angle above horizon)
 *   φ = observer latitude
 *   δ = solar declination
 *   H = hour angle
 *
 * At solar noon (H=0), the Sun reaches its maximum altitude for the day:
 *   h_max = 90° - |φ - δ|
 */
function _altitude(dec, lat, ha){
	var lat = rad(lat);
	var dec = rad(dec);
	var ha = rad(ha);
	return Math.asin(Math.cos(lat) * Math.cos(dec) * Math.cos(ha) + (Math.sin(lat) * Math.sin(dec)));
}

radianArcRadianLength = function(angle, radius){
	return radius * angle;
}



/**
 * Public function: compute the Sun’s altitude at a given date and local hour.
 *
 * Steps:
 *   1. Convert local clock time to apparent solar time (correct for EoT and longitude)
 *   2. Convert solar time to hour angle (degrees from solar noon)
 *   3. Compute solar declination for that date
 *   4. Plug into altitude equation
 */
exports.altitude = function(date, hour){
	var ast = apparentSolarTime(date, hour, LONGITUDE);
	var ha = hourAngle(ast);
	var dec = declination(date);

	return deg(_altitude(dec, LATITUDE, ha));
}

exports.degreeArcRadianLength = function(angle, radius){
	return radianArcRadianLength(angle * (Math.PI / 180), radius);
}

exports.dayDiff = dayDiff;

exports.monthDiff = function(date) {
	return date.diff(TIME_ORIGIN.year(date.year()), 'months');
}
