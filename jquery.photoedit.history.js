/*
 * Photoedit - history widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.history", {
		data: {
			restorePoints: new Array(),
			thumbnails: new Array(),
			head: 0,
		},
		// default options
		options: {
			maxHistory: 10,
			callback: function() {},
		},
		thumbnail: function(img,width,height) {
			// pixastic resize
			var copy = document.createElement("canvas");
			copy.width = width;
			copy.height = height;
			copy.getContext("2d").drawImage(img,0,0,width,height);
			return copy.toDataURL();
		},
		// the constructor
		_create: function() {
		},
		save: function (name,img) {
			var data = this.data;
			var options = this.options;
			if (data.head < data.restorePoints.length) {
				// on ecrase l'historique qui n'est plus valide
				while(data.head < data.restorePoints.length) { 
					data.restorePoints.pop();
					data.thumbnails.pop();
					$(this.element).find('li:last-child').remove();
				}
			} else {
				var length = data.restorePoints.length;
				if (length == options.maxHistory) {
					// on enleve le premier element
					$(this.element).find('li:first-child').remove();
					data.restorePoints.shift();
					data.thumbnails.shift();
					data.head = data.head -1;
					var list = $(this.element).find('li');
					// on repare les liens
					$.each(list, function(index, elem) {
						var a = $(elem).find('a');
						a.attr('href', index);
					});
				} else if ( length == 0) {
					$('<ul></ul>').appendTo(this.element);
				}
			}
			data.thumbnails.push(this.thumbnail(img,60,60));
			if (img.tagName == 'CANVAS') {
				data.restorePoints.push(img.toDataURL());
			} else {
				data.restorePoints.push(img.src);
			}
			var that = this;
			var li = $('<li/>')
			.append($('<a/>', {
				href : data.head,
				click: function (e) {
					e.preventDefault();
					var index = parseInt($(this).attr('href'));
					that.load(index);
				},
			})
			.append($('<img/>', {
					width: 60,
					height: 60,
					src: data.thumbnails[data.head],
					title: name,
			})))
			.appendTo($(this.element).find('ul'));
			data.head = data.head+1;
		},
		load: function(index) {
			var data = this.data;
			var options = this.options;
			options.callback(data.restorePoints[index]);
			data.head = index+1;
		},
		
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			this.element.remove();
		},
		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			//this._refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});