const Ring = require('./lib/ring');
const View = require('./lib/view');
const solar = require('./lib/declination');

var ring = new Ring({diameter:18.5, width: 12});

var oView = new View('open-ring', {factor: 16});
//var cView = new View('closed-ring', {factor: 16});

ring.drawOpen(oView, 20, 20);
//ring.drawClosed(cView, 100, 100);
