/*
 * Photoedit - selection widget
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
$(function() {
	// extend photoedit.cords
	$.widget( "photoedit.selection", $.photoedit.cords, {
		options: {
			interval: 10,
			mySelColor: '#CC0000',
			mySelWidth: 2,
			mySelBoxColor: 'darkred',
			mySelBoxSize: 5,
			fill: 'rgba(0, 0, 0, 0.5)',
			callbackDimensions: function(w,h) {},
			callbackCords: function(x,y) {},
			offCallback: function() {},
		},
		data: {
			isOn: false, // indique si le module de sélection est activé ou non.
			canvas: null,
			ctx: null,
			ghostcanvas: null,
			gctx: null,
			selectionHandles: [],
			isDrag: false,
			expectResize: -1,
			rectangle: null,
			offsetx: 0,
			offsety: 0,
			intervalId: null,
			mx: null,
			my: null,
			canvasValid : true,
		},
		// the constructor
		_create: function() {
			var options = this.options;
			var data = this.data;
			if (this.element.tagName != 'CANVAS') {
				// error
			}
			data.canvas = this.element[0];
			data.ctx = data.canvas.getContext('2d');
			data.ghostcanvas = document.createElement('canvas');
			data.ghostcanvas.width = data.canvas.width;
			data.ghostcanvas.height = data.canvas.height;
			data.gctx = data.ghostcanvas.getContext('2d');
		},
		getMouse: function(e) {
			var data = this.data;
			var cords = $.photoedit.cords.prototype.getMouse(e);
			data.mx = cords.mx;
			data.my = cords.my;
		},
		off: function() {
			var options = this.options;
			var data = this.data;
			var that = this;
			data.rectangle = null;
			clearInterval(data.intervalId);
			$(data.canvas).unbind('.selection');
			// clear canvas of selection
			data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height); 
			data.isOn = false;
			options.offCallback();
		},
		hasSelection: function() {
			var data = this.data;
			return data.rectangle != null;
		},
		isOn: function() {
			var data  = this.data;
			return data.isOn;
		},
		on: function() {
			var options = this.options;
			var data = this.data;
			var that = this;
			data.isOn = true;
						
						
			// Box object to hold data
			function Box2() {
				this.x = 0;
				this.y = 0;
				this.w = 1; // default width and height?
				this.h = 1;
				this.fill = '#444444';
			}

			// New methods on the Box class
			Box2.prototype = {
				// we used to have a solo draw function
				// but now each box is responsible for its own drawing
				// mainDraw() will call this with the normal canvas
				// myDown will call this with the ghost canvas with 'black'
				draw: function (context, data, options) {
					var WIDTH = data.canvas.width;
					var HEIGHT = data.canvas.height;
					if (context === data.gctx) {
						context.fillStyle = 'black'; // always want black for the ghost canvas
					} else {
						context.fillStyle = this.fill;
					}

					// on limite au canvas
					if (this.x < 0) {
						this.x = 0;
					}
					if (this.x + this.w > WIDTH) {
						this.x = WIDTH - this.w - 1; //hack to keep the selection handles inside canvas
					}
					if (this.y < 0) {
						this.y = 0;
					}
					if (this.y + this.h > HEIGHT) {
						this.y = HEIGHT - this.h;
					}
					if (context === data.gctx) {
						context.fillRect(this.x, this.y, this.w, this.h);
					} else {
						context.clearRect(this.x, this.y, this.w, this.h);
						context.strokeStyle = options.mySelColor;
						context.lineWidth = options.mySelWidth;
						context.strokeRect(this.x, this.y, this.w, this.h);

						// draw the boxes
						var half = options.mySelBoxSize / 2;

						// 0  1  2
						// 3     4
						// 5  6  7
						// top left, middle, right
						data.selectionHandles[0].x = this.x - half;
						data.selectionHandles[0].y = this.y - half;

						data.selectionHandles[1].x = this.x + this.w / 2 - half;
						data.selectionHandles[1].y = this.y - half;

						data.selectionHandles[2].x = this.x + this.w - half;
						data.selectionHandles[2].y = this.y - half;

						//middle left
						data.selectionHandles[3].x = this.x - half;
						data.selectionHandles[3].y = this.y + this.h / 2 - half;

						//middle right
						data.selectionHandles[4].x = this.x + this.w - half;
						data.selectionHandles[4].y = this.y + this.h / 2 - half;

						//bottom left, middle, right
						data.selectionHandles[6].x = this.x + this.w / 2 - half;
						data.selectionHandles[6].y = this.y + this.h - half;

						data.selectionHandles[5].x = this.x - half;
						data.selectionHandles[5].y = this.y + this.h - half;

						data.selectionHandles[7].x = this.x + this.w - half;
						data.selectionHandles[7].y = this.y + this.h - half;


						context.fillStyle = options.mySelBoxColor;
						for (var i = 0; i < 8; i++) {
							var cur = data.selectionHandles[i];
							context.fillRect(cur.x, cur.y, options.mySelBoxSize, options.mySelBoxSize);
						}
					}
				}
			} // end Box2.prototype
			// set up the selection handle boxes
            for (var i = 0; i < 8; i++) {
                data.selectionHandles.push(new Box2());
            }
			// see mainDraw
			function invalidate() {	
                    data.canvasValid = false;
            }
			//wipes the canvas context
            function clear(c) {
                c.clearRect(0, 0, data.canvas.width, data.canvas.height);
            }
			// Main draw loop.
            // While draw is called as often as the INTERVAL variable demands,
            // It only ever does something if the canvas gets invalidated by our code
            function mainDraw(data) {
				if (data.canvasValid == false) {
					clear(data.ctx);
					data.ctx.fillStyle = options.fill;
					data.ctx.fillRect(0, 0, data.canvas.width, data.canvas.height); // on rend le canvas opaque pour mettre en valeur la selection

					// Add stuff you want drawn in the background all the time here
					data.rectangle.draw(data.ctx,data,options); // we used to call drawshape, but now each box draws itself
					// Add stuff you want drawn on top all the time here
					data.canvasValid = true;
				}
			}
			// on verifie qu'on a pas dépassé le canvas
			// on vérifie et répare les cordonnées d'une sélection à valeurs négatives, 
			// qui n'est pas compatible en paramètre aux actions pixastic
			function sanitize() {
				data.rectangle.w = Math.min(data.rectangle.w,data.canvas.width);
				data.rectangle.h = Math.min(data.rectangle.h,data.canvas.height);
				if (data.rectangle.w < 0) {
					data.rectangle.x = data.rectangle.x + data.rectangle.w;
					data.rectangle.w = - data.rectangle.w;
				}
				if (data.rectangle.h < 0) {
					data.rectangle.y = data.rectangle.y + data.rectangle.h;
					data.rectangle.h = - data.rectangle.h;
				}
				data.rectangle.x = Math.max(0, data.rectangle.x);
				data.rectangle.y = Math.max(0, data.rectangle.y);
				data.rectangle.x = Math.min(data.canvas.width, data.rectangle.x);
				data.rectangle.y = Math.min(data.canvas.height, data.rectangle.y);
			}
			function myDown(e) {
				var xoffs = $(this).offset().left;
				var yoffs = $(this).offset().top;
				data.rectangle = new Box2();
				data.rectangle.x = e.pageX - xoffs;
				data.rectangle.y = e.pageY - yoffs;
				data.rectangle.fill = options.fill;
				data.isDrag = true;
            }
			function myUp() {
				if (data.rectangle != null) {
					//clearInterval(data.intervalId);
					data.canvasValid = true;
					$(data.canvas).off('.selection');
					data.isDrag = false;
					// selection box created bind the resize and move handlers
					data.isResizeDrag = false;
					data.expectResize = -1;
				   $(data.canvas)
						.on('mousedown.selection', myDown2)
						.on('mousemove.selection', myMove2)
						.on('mouseup.selection', myUp2)
					;
				   sanitize(); // get's rid of negative width and height, changes x and y accordingly
				   options.callbackDimensions(data.rectangle.w,data.rectangle.h);
				}
			}
			function myMove(e) {
				that.getMouse(e);
				if (data.isDrag) {
					var xoffs = $(this).offset().left;
					var yoffs = $(this).offset().top;
					data.rectangle.w = e.pageX - xoffs - data.rectangle.x;
					data.rectangle.h = e.pageY - yoffs - data.rectangle.y;
					invalidate();
					options.callbackDimensions(data.rectangle.w, data.rectangle.h);
				} else {
					options.callbackCords(data.mx,data.my);
				}
			}
			function myDown2(e) {
				that.getMouse(e);
				//we are over a selection box
				if (data.expectResize !== -1) {
					data.isResizeDrag = true;
					return;
				}
				// draw shape onto ghost context
				if (data.rectangle != null) {
					data.rectangle.draw(data.gctx, data, options);
					// get image data at the mouse x,y pixel
					var imageData = data.gctx.getImageData(data.mx, data.my, 1, 1);
					clear(data.gctx); // on efface le ghostcanvas pour la prochaine fois
					// if the mouse pixel exists, select and break
					if (imageData.data[3] > 0) {
						data.offsetx = data.mx - data.rectangle.x;
						data.offsety = data.my - data.rectangle.y;
						data.isDrag = true;
						return;
					}
				}
				// haven't returned means we have selected nothing
				// let's reset the plugin to the initial state
				$(data.canvas).off('.selection');
				data.rectangle = null;
				options.callbackDimensions(data.canvas.width, data.canvas.height); // reset les dimensions affichées a ceux du canvas
				clear(data.ctx); // on efface le canvas
				$(data.canvas)
					.on('mousedown.selection', myDown)
					.on('mousemove.selection', myMove)
					.on('mouseup.selection', myUp)
				;
			}
			function myUp2() {
                data.isDrag = false;
                data.isResizeDrag = false;
                data.expectResize = -1;
				sanitize(); // on vérifie et répare les cordonnées d'une selection à valeurs négatives, qui n'est pas compatible en paramètre aux actions pixastic
				options.callbackDimensions(data.rectangle.w,data.rectangle.h);
            }
			function myMove2(e) {	
                if (data.isDrag) {
					that.getMouse(e);
                    data.rectangle.x = data.mx - data.offsetx;
                    data.rectangle.y = data.my - data.offsety;
                    // something is changing position so we better invalidate the canvas!
                    invalidate();
					options.callbackCords(data.rectangle.x,data.rectangle.y);
                } else if (data.isResizeDrag) {
                    // time ro resize!
                    var oldx = data.rectangle.x;
                    var oldy = data.rectangle.y;
                    // 0  1  2
                    // 3     4
                    // 5  6  7
                    switch (data.expectResize) {
                    case 0:
                        data.rectangle.x = data.mx;
                        data.rectangle.y = data.my;
                        data.rectangle.w += oldx - data.mx;
                        data.rectangle.h += oldy - data.my;
                        break;
                    case 1:
                        data.rectangle.y = data.my;
                        data.rectangle.h += oldy - data.my;
                        break;
                    case 2:
                        data.rectangle.y = data.my;
                        data.rectangle.w = data.mx - oldx;
                        data.rectangle.h += oldy - data.my;
                        break;
                    case 3:
                        data.rectangle.x = data.mx;
                        data.rectangle.w += oldx - data.mx;
                        break;
                    case 4:
                        data.rectangle.w = data.mx - oldx;
                        break;
                    case 5:
                        data.rectangle.x = data.mx;
                        data.rectangle.w += oldx - data.mx;
                        data.rectangle.h = data.my - oldy;
                        break;
                    case 6:
                        data.rectangle.h = data.my - oldy;
                        break;
                    case 7:
                        data.rectangle.w = data.mx - oldx;
                        data.rectangle.h = data.my - oldy;
                        break;
                    }
                    invalidate();
					options.callbackCords(data.rectangle.x,data.rectangle.y);
					options.callbackDimensions(data.rectangle.w,data.rectangle.h); // on renvoit les nouvelle dimensions de la selection a afficher.
                }
				that.getMouse(e);
                // if there's a selection see if we grabbed one of the selection handles
                if (data.rectangle !== null && !data.isResizeDrag) {
                    for (var i = 0; i < 8; i++) {
                        // 0  1  2
                        // 3     4
                        // 5  6  7
                        var cur = data.selectionHandles[i];
                        // we dont need to use the ghost context because
                        // selection handles will always be rectangles
						// On rajoute une imprécision de 5 pixels pour rendre la selection plus facile
                        if (data.mx >= cur.x - 5 && data.mx <= cur.x + 5 + options.mySelBoxSize && data.my >= cur.y -5 && data.my <= cur.y + 5 + options.mySelBoxSize) {
                            // we found one!
                            data.expectResize = i;
                            invalidate();
                            switch (i) {
                            case 0:
                                this.style.cursor = 'nw-resize';
                                break;
                            case 1:
                                this.style.cursor = 'n-resize';
                                break;
                            case 2:
                                this.style.cursor = 'ne-resize';
                                break;
                            case 3:
                                this.style.cursor = 'w-resize';
                                break;
                            case 4:
                                this.style.cursor = 'e-resize';
                                break;
                            case 5:
                                this.style.cursor = 'sw-resize';
                                break;
                            case 6:
                                this.style.cursor = 's-resize';
                                break;
                            case 7:
                                this.style.cursor = 'se-resize';
                                break;
                            }
                            return;
                        }
                    }
                    // not over a selection box, return to normal
                    data.isResizeDrag = false;
                    data.expectResize = -1;
                    this.style.cursor = 'auto';
                }
            } //end myMove2
			$(data.canvas)
				.on('mousedown.selection', myDown)
				.on('mousemove.selection', myMove)
				.on('mouseup.selection', myUp)
			;
			data.intervalId = setInterval(function() {mainDraw(data)}, options.interval);
		},
		getSelection: function() {
			var options = this.options;
			var data = this.data;
			var selection = null;
			if (data.rectangle != null) {
				selection = {"left": Math.round(data.rectangle.x), "top": Math.round(data.rectangle.y), "width": Math.round(data.rectangle.w), "height": Math.round(data.rectangle.h)}
			} else {
					selection = {"left": 0, "top": 0, "width": data.canvas.width, "height": data.canvas.height};
			}	
			return selection;
		},
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			var options = this.options;
			var data = this.data;
			clearInterval(data.intervalId);
			$(data.canvas).unbind('.selection');
			// clear canvas of selection
			data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height); 
			options.offCallback();
		},
		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			//this.show();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});