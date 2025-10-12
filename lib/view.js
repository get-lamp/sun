module.exports = function(canvas, options){

	options = options || {};

	this._canvas = document.getElementById(canvas);
	this._ctx = this._canvas.getContext('2d');
	this._factor = options.factor || 10;

	this.ctx = function(){
		return this._ctx;
	}

	this.factor = function(){
		return this._factor;
	}
}