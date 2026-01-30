const View = require('./lib/view');
const {
    buildAnglesData,
    buildMonthLinesData,
    buildHoursData,
    drawAngles,
    drawMonthLines,
    drawHole,
    drawHours,
	drawHourLines,
	DialMask,
	drawOutline,
} = require('./lib/sundial');

const moment = require('moment');

const AE_SS = moment('2025-02-15');
const SUMMER_SOLSTICE = moment('2025-12-21');
const VE_SS = moment('2025-10-15');
const VERNAL_EQUINOX = moment('2025-09-22');
const WS_VE = moment('2025-07-15');
const WINTER_SOLSTICE = moment('2025-06-21');
const AE_WS = moment('2025-04-15');
const AUTUMN_EQUINOX = moment('2025-03-20');

const DAYS = [
	SUMMER_SOLSTICE,
	VE_SS,
	VERNAL_EQUINOX,
	WS_VE,
	WINTER_SOLSTICE,
	AE_WS,
	AUTUMN_EQUINOX,
	AE_SS,
	SUMMER_SOLSTICE
];

const DAY_LABEL = [
	"Summer Solstice",
	"Nov / Oct",
	"Vernal Equinox",
	"Jul / Aug",
	"Winter Solstice",
	"Apr / May",
	"Autumn Equinox",
	"Jan / Feb",
	"Summer Solstice"
]

const RingData = {
	width: 12,
	diameter: 18.5,
	x: 0,
	y: 0,
}


const HOUR_SUNRISE = 5;
const HOUR_DIV = 1;
const HOURS = [...Array(8/HOUR_DIV).keys()].map(i => (i * HOUR_DIV) + HOUR_SUNRISE);


const width = 12;
const diameter = 18.5;
const x = 20;
const y = 20;

var view = new View('open-ring', {factor: 16});

const anglesData = buildAnglesData(diameter, width);
const daysData = buildMonthLinesData(DAYS, width, anglesData[0].y0, anglesData[4].y0, DAY_LABEL);
const hoursData = buildHoursData(DAYS, width, HOURS, anglesData[0].deg, diameter/2);

const mask = DialMask(view, width, diameter/2, x, y);

drawAngles(view, anglesData, x, y);
drawMonthLines(view, daysData, anglesData[4].y0, x, y);
drawHourLines(view, hoursData, width, diameter/2, x, y, mask);
drawHours(view, hoursData, HOURS, x, y, mask);
drawHole(view, width, 45, diameter/2, x, y);
drawOutline(view, width, diameter, x, y);

