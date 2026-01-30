const dec = require("./declination");

const ANGLES = [45, 90, 135, 180, 225];

function daysWidth(width, days) {
    return width/(days.length-1);
}


function drawDot(view, x, y, color) {
    view.ctx().beginPath();
    view.ctx().arc(x, y, 2.5, 0, 2 * Math.PI, false);
    view.ctx().fillStyle = color;
    view.ctx().fill();
    view.ctx().closePath();
}

module.exports.buildAnglesData = function (diameter, width){

    const radius = diameter / 2;
    let angles = [];

    for(let a in ANGLES){
        let h = dec.degreeArcRadianLength(ANGLES[a], radius);
        angles.push({ x0: 0, y0: h, x1: width, y1: h, deg: ANGLES[a]});
    }

    return angles;
}


module.exports.buildMonthLinesData = function(days, width, arc0, arc1, labels) {

    const lx = daysWidth(width, days);
    let lines = [];

    // draw solstice and equinox lines
    for(let i = 0; i < days.length; i++){
        lines.push({x0: lx*i, y0: arc0, x1: lx*i, y1: arc1, label: labels[i]});
    }

    return lines;
}

module.exports.buildHoursData = function(days, width, hours, originDeg, radius) {

    let rows = [];
    const lx = daysWidth(width, days);

    const o = dec.degreeArcRadianLength(originDeg, radius);

    for(let s in hours) {

        let cols = [];

        for(let i= 0; i < days.length; i++) {

            const alt = dec.altitude(days[i], hours[s]);
            const h = dec.degreeArcRadianLength(alt * 2, radius);

            cols.push({x: lx*i, y: o + h});
        }

        rows.push(cols);
    }

    return rows;
}

module.exports.drawAngles = function (view, data, x=0, y=0) {

    view.ctx().strokeStyle = '#000000';

    // draw degree lines
    for( let h in data ){

        const x0 = x + data[h].x0 * view.factor();
        const y0 = y + data[h].y0 * view.factor();
        const x1 = x + data[h].x1 * view.factor();
        const y1 = y + data[h].y1 * view.factor();

        view.ctx().beginPath();
        view.ctx().moveTo(x0, y0);
        view.ctx().lineTo(x1, y1);
        view.ctx().stroke();

        view.ctx().fillText( data[h].deg.toString(), x0-20, y0+5 );
    }
}

module.exports.drawMonthLines = function(view, days, arc1, x=0, y=0){

    let labels = [];

    for(let d = 0; d < days.length; d++){

        const x0 = x + days[d].x0 * view.factor();
        const y0 = y + days[d].y0 * view.factor();
        const x1 = x + days[d].x1 * view.factor();
        const y1 = y + days[d].y1 * view.factor();

        (d%2 === 0) ? view.ctx().strokeStyle = '#0099ff' : view.ctx().strokeStyle = '#dfdfdf';

        view.ctx().beginPath();
        view.ctx().moveTo(x0, y0);
        view.ctx().lineTo(x1, y1);
        view.ctx().stroke();

        labels.push({x: x1, y: y1, label: days[d].label});
    }

    view.ctx().save();
    view.ctx().rotate(-Math.PI / 2);
    view.ctx().font = "10px Arial";
    view.ctx().fillStyle = "black";
    view.ctx().textAlign = "right";
    view.ctx().textBaseline = "middle";
    view.ctx().fillStyle = "#0099ff";

    for(let l in labels) {
        let offset = (l == 0) ? 8 : (l == labels.length -1 ) ? -8 : 0;
        view.ctx().fillText(labels[l].label, -(labels[l].y + 10), labels[l].x + offset);
    }

    view.ctx().restore();
}


module.exports.drawHours = function(view, hours, hoursText, x=0, y=0, mask=null) {

    view.ctx().font = "10px Arial";
    view.ctx().fillStyle = "black";
    view.ctx().textAlign = "center";
    view.ctx().textBaseline = "middle";

    view.ctx().save();
    if(mask) { mask(); }

    for(let hy in hours) {

        for (let hx in hours[hy]) {

            var x0 = x + (hours[hy][hx].x * view.factor());
            var y0 = y + (hours[hy][hx].y * view.factor());

            drawDot(view, x0, y0, 'tomato');
        }
        view.ctx().fillText(hoursText[hy], x0 + 10, y0);
    }
    view.ctx().restore();
}

module.exports.drawHourLines = function(view, points, width, radius, x=0, y=0, mask=null) {

    view.ctx().save();
    view.ctx().lineWidth = 1;
    view.ctx().strokeStyle = 'blue';

    if(mask) { mask(); }

    var ctrl = [];

    for (let py in points) {

        const x0 = x + (points[py][0].x * view.factor());
        const y0 = y + (points[py][0].y * view.factor());

        view.ctx().beginPath();
        view.ctx().moveTo(x0, y0);

        for (let px = 1; px < points[py].length; px++) {

            const cpx = x + ((points[py][px-1].x + points[py][px].x) / 2) * view.factor();
            const cpy = y + ((points[py][px-1].y + points[py][px].y) / 2) * view.factor();

            const x1 = x + points[py][px].x * view.factor();
            const y1 = y + points[py][px].y * view.factor();

            const slope =  y1 - points[py][px-1].y / x1 - points[py][px-1].x

            //view.ctx().lineTo(x1, y1);
            view.ctx().quadraticCurveTo(cpx, cpy, x1, y1)

            ctrl.push({x: cpx, y: cpy})

        }

        view.ctx().stroke();
        view.ctx().closePath();
    }

    // draw ctrl points
    for(c in ctrl){
        drawDot(view, ctrl[c].x, ctrl[c].y, 'green');
    }

    view.ctx().restore();
}

module.exports.drawHole = function(view, width, deg, radius, x, y) {
    const x0 = x + width / 2 * view.factor();
    const y0 = y + dec.degreeArcRadianLength(360-deg, radius) * view.factor();

    view.ctx().beginPath();
    view.ctx().arc(x0, y0, 2.5, 0, 2 * Math.PI, false);
    view.ctx().fillStyle = 'gold';
    view.ctx().fill();
    view.ctx().closePath();
}

module.exports.drawOutline = function(view, width, diameter, x, y) {

    const w = width * view.factor();
    const h = diameter * Math.PI * view.factor();

    view.ctx().beginPath();
    view.ctx().strokeStyle = '#000000';
    view.ctx().rect(x, y, w, h);
    view.ctx().stroke();
}

module.exports.DialMask = function(view, width, radius, x, y) {
    return function(){
        const o = dec.degreeArcRadianLength(ANGLES[0], radius) * view.factor();
        const w = width * view.factor()

        view.ctx().beginPath();
        view.ctx().rect(x-5, o, w + 20, dec.degreeArcRadianLength(ANGLES[4], radius) * view.factor());
        view.ctx().save()
        view.ctx().clip()
    }
}

