/*
 * Photoedit - Info widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.info", {
		data: {
			w : null,
			h : null,
			x : null,
			y : null,
		},
		// the constructor
		_create: function() {
			var data = this.data;
			data.x = $('<span/>');
			data.y = $('<span/>');
			data.w = $('<span/>');
			data.h = $('<span/>');
			$(this.element).append('Width:', data.w,'<br />','Height:', data.h,'<br />','X: ',data.x,'<br />','Y: ',data.y);
		},
		updateDimensions: function(w,h) {
			var data = this.data;
			if (w < 0) {
				data.w.text('');				
			} else {
				data.w.text(Math.round(w));
			}
			if (h<0) {
				data.h.text('');
			} else {
				data.h.text(Math.round(h));
			}
		},
		updateCords: function(x,y)  {
			var data = this.data;
			if (x < 0) {
				data.x.text('');				
			} else {
				data.x.text(Math.round(x));
			}
			if (y<0) {
				data.y.text('');
			} else {
				data.y.text(Math.round(y));
			}
		},
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			this.element.remove();
		},
	});
});