/*
 * Photoedit - scale widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.scale", {
		data: {
			scale: 1,
			width:	null,
			height: null,
		},
		_create: function() {
			var data = this.data;
			var canvas = this.element[0];
			data.width = canvas.width;
			data.height = canvas.height;
		},
		draw: function(img,width,height) {
			var data = this.data;
			var options = this.options;
			data.width = img.width;
			data.height = img.height;
			var canvas = this.element[0];
			if (img.width > width || img.height > height) {
				data.scale  = Math.min(width / img.width,height / img.height);
				canvas.width = img.width * data.scale;
				canvas.height = img.height * data.scale;
			} else {
				data.scale = 1;
				canvas.width = img.width;
				canvas.height = img.height;
			}
			var context = canvas.getContext('2d');
			context.scale(data.scale,data.scale);
			context.drawImage(img,0,0);
		},
		get: function() {
			return this.data.scale;
		},
		eval: function(x) {
			return x/this.data.scale;
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
		_setOption: function( key, value ) {tes
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});