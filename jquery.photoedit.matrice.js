/*
 * Photoedit - matrix widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.matrice", {
		// default options
		options: {
			n: 3,
			m: 3,
			values: null,
		},

		_create: function() {
			this._refresh();
		},
		_refresh: function() {
				if (this.options.values == null) {
				// default matrix is identity
				this.options.values = new Array();
				for (var i =0; i < this.options.n; i++) {
					this.options.values[i] = new Array();
					for(var j = 0; j < this.options.m; j++) {
						this.options.values[i][j] = 1;
					}
				}
			}
			var form = $('<form/>');
			form.appendTo(this.element);
			var table = $('<table/>');
			table.appendTo(form);
			var that = this;
			// display the matrix input fields
			for (var i =0; i < this.options.n; i++) {
				$('<tr/>').appendTo(table);
				for(var j = 0; j < this.options.m; j++) {
					$('<input/>', {
						type: 'text',
						size: '2',
						value: this.options.values[i][j],
						change: function() {
							var number = parseInt($(this).val());
							if (that._isNumber(number)) {
								that.options.values[i,j] = number;
							} else {
								$(this).val("1");
							}
						}
					})
					.appendTo($('<td/>')).appendTo($(table).find('tr').last());
				}
			}
		},
		// check if the argument is a number
		_isNumber: function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},

		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			this.element.find('form').remove();
		},
		getArray: function() {
			return this.options.values;
		},

		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			this.element.find('form').remove();
			this._refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});