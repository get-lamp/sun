const dec = require('./declination');
const moment = require('moment');

const AE_SS = moment('2025-02-15');
const SUMMER_SOLSTICE = moment('2025-12-21');
const VE_SS = moment('2025-10-15');
const VERNAL_EQUINOX = moment('2025-09-22');
const WS_VE = moment('2025-07-15');
const WINTER_SOLSTICE = moment('2025-06-21');
const AE_WS = moment('2025-04-15');
const AUTUMN_EQUINOX = moment('2025-03-20');

const YEAR = [
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

module.exports = function(measures){

	this._width = measures.width;
	this._diameter = measures.diameter;
	this._radius = this._diameter / 2;

	this.width = function(){
		return this._width;
	}

	this.radius = function(){
		return this._radius;
	}

	this.diameter = function(){
		return this._diameter;
	}

	this.length = function(){
		return this._diameter * Math.PI;
	}

	this.radianArcRadianLength = function(angle){
		return this.radius() * angle;
	}

	this.degreeArcRadianLength = function(angle){
		return this.radianArcRadianLength(angle * (Math.PI / 180));
	}

	this.drawOpen = function(view, x, y){

		this.drawGrid(view, x, y);
		this.drawGridText(view, x, y);
		this.drawDots(view, x, y);
	}

	this.drawGrid = function(view, x,y){

		var yl = YEAR.length;
		var w = this.width() * view.factor();
		var lx = Math.round(w/(yl-1));

		// outline
		view.ctx().rect(x, y, w, this.length() * view.factor());
		view.ctx().stroke();
		
		// grid
		var angles = [45, 90, 135, 180, 225];
		var anglesY = [];

		// convert angles to length
		for(a in angles){
			anglesY.push(this.degreeArcRadianLength(angles[a]) * view.factor());
		}			

		// draw degree lines
		for(h in anglesY){
			view.ctx().beginPath();
			view.ctx().moveTo(x, y + anglesY[h]);
		    view.ctx().lineTo(x + w, y + anglesY[h]);
		    view.ctx().stroke();

			view.ctx().fillText(angles[h], x-10, y + anglesY[h]);

		}

		// draw solstice and equinox lines
		for(let i = 0; i < yl; i++){

			if(i%2 === 0) {
				view.ctx().strokeStyle = '#0099ff';
			} else {
				view.ctx().strokeStyle = '#dfdfdf';
			}

			view.ctx().beginPath();
			view.ctx().moveTo(x + lx*i, y + anglesY[0]);
			view.ctx().lineTo(x + lx*i, y + anglesY[4]);
			view.ctx().stroke();
		}

		var holeY = this.degreeArcRadianLength(360-45) * view.factor();

		view.ctx().beginPath();
		view.ctx().arc(x + w/2, holeY, 2.5, 0, 2 * Math.PI, false);
		view.ctx().fillStyle = 'gold';
		view.ctx().fill();
		view.ctx().closePath();

	}

	this.drawGridText = function(view, x, y){

		// grid
		var w = this.width() * view.factor();
		var angles = [45, 90, 135, 180, 225];
		var anglesY = [];
		var lx = Math.round(w/(YEAR.length-1));

		// convert angles to length
		for(a in angles){
			anglesY.push(this.degreeArcRadianLength(angles[a]) * view.factor());
		}

		view.ctx().save();
		view.ctx().rotate(-Math.PI / 2);
		view.ctx().font = "10px Arial";
		view.ctx().fillStyle = "black";
		view.ctx().textAlign = "right";
		view.ctx().textBaseline = "middle";
		view.ctx().fillStyle = "#0099ff";

		for(let i = 0; i < YEAR.length; i++){

			switch(i){
				case 0:
					view.ctx().fillText("Summer Solstice", -(y + anglesY[4] + 10), (x + lx*i) + 8);
					break;
				case 2:
					view.ctx().fillText("Vernal Equinox", -(y + anglesY[4] + 10), (x + lx*i));
					break;
				case 4:
					view.ctx().fillText("Winter Solstice", -(y + anglesY[4] + 10), (x + lx*i));
					break;
				case 6:
					view.ctx().fillText("Autumn Equinox", -(y + anglesY[4] + 10), (x + lx*i));
					break;
				case 8:
					view.ctx().fillText("Summer Solstice", -(y + anglesY[4] + 10), (x + lx * i) - 8);
					break;
			}
		}
		view.ctx().restore();
	}

	this.drawDots = function(view, x, y){

		view.ctx().font = "10px Arial";
		view.ctx().fillStyle = "black";
		view.ctx().textAlign = "center";
		view.ctx().textBaseline = "middle";

		var dotsize = 2.5;

		// the ring width
		var w = this.width() * view.factor();

		// origin point, -45 degree from the top.
		var o = this.degreeArcRadianLength(45) * view.factor();

		// dumb way to do range() in Javascript :/
		var hours = [...Array(8).keys()].map(i => (i * 1) + 5);

		// x offset for the dots, to fall in the time-of-the-year line
		var lx = Math.round(w/(YEAR.length-1));

		view.ctx().beginPath();
		view.ctx().rect(x-5, o, w+20, this.degreeArcRadianLength(225) * view.factor());
		view.ctx().save()
		view.ctx().clip()

		for(s in hours){

			var curve = [];
			view.ctx().lineWidth = 0;


			for(i=0; i < YEAR.length; i++){
				var alt = dec.altitude(YEAR[i], hours[s]);

				h = y + o + (this.degreeArcRadianLength(alt * 2) * view.factor());

				view.ctx().beginPath();
				view.ctx().arc(x + lx*i, h, dotsize, 0, 2 * Math.PI, false);
				view.ctx().fillStyle = 'tomato';
				view.ctx().fill();
				view.ctx().closePath();

				curve.push({x: x + lx*i, y: h})

				if (i === YEAR.length-1) {
					view.ctx().fillText(hours[s], x + 10+lx*i, h);
				}
			}

		    this.drawCurveThroughNPoints(view, curve);
			
		}	
		view.ctx().restore();
	}

	this.drawCurveThroughNPoints = function(view, points){

		var restore = view.ctx().lineWidth;

		view.ctx().beginPath();
		view.ctx().lineWidth = 1;
		view.ctx().strokeStyle = 'blue';

		// move to the first point
		view.ctx().moveTo(points[0].x, points[0].y);

		for (var i = 1; i < points.length - 1; i ++)
	   	{
			var cpx = (points[i].x + (points[i+1].x - points[i+1].x) / 2);
			var cpy = (points[i].y + (points[i+1].y - points[i+1].y) / 2);

			//var cpx = (points[i].x + points[i+1].x) / 2;
			//var cpy = (points[i].y + points[i+1].y) / 2;

			view.ctx().quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);

	   	}

		// curve through the last two points
		view.ctx().quadraticCurveTo(points[i].x, points[i].y, points[i].x,points[i].y);
		view.ctx().stroke();
		view.ctx().lineWidth = restore;
		view.ctx().closePath();
	}

	this.drawClosed = function(view, x, y){
		
		// outline
		view.ctx().beginPath();
		view.ctx().arc(x, y, this.radius() * view.factor(), 0, 2*Math.PI);
		view.ctx().stroke();

		
	}

}