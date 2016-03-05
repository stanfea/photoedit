/*
 * Photoedit - cords widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.cords", {
		data: {
			mx: 0,
			my: 0,
			offsetX: 0,
			offsetY: 0,
		},
		// default options
		options: {
			callback: function(x,y) {},
		},
		// the constructor
		_create: function() {
			var data = this.data;
			this._calculateOffset();
			this.on();
		},
		_calculateOffset: function() {
			var data = this.data;
			var element = this.element[0];
			if (element.offsetParent) {
				do {
					data.offsetX += element.offsetLeft;
					data.offsetY += element.offsetTop;
				} while ((element = element.offsetParent));
			}
		},
		getMouse : function(e) {	// on mousemove on canvas
			var data = this.data;
			// Sets mx,my to the mouse position relative to the canvas
			data.mx = e.pageX - data.offsetX;
			data.my = e.pageY - data.offsetY
			return {'mx': data.mx, 'my': data.my};
		},
		on: function () {
			var that = this;
			var data = this.data;
			var options = this.options;
			$(this.element)
				.on('mousemove.cords', function(e) {
					that.getMouse(e);
					options.callback(data.mx,data.my); // On arrondit pour eviter d'avoir des flottants
				})
				.on('mouseout.cords', options.callback(-1,-1))
			;
		},
		off: function() {
			$(this.element).off('.cords');
		},

		
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
		},
		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});