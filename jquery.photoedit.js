/*
 * Photoedit v0.1
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 $(function() {
	$.widget( "photoedit.editor", {
		options: {
			width: 800,
			height: 600,
		},
		data: {
			canvas: null,
			canvas2: null,
			canvas3: null,
			ctx: null,
			img: new Image(),
			cords: null,
			scale: null, // scale widget
			info: null, // info widget
			selectionPlugin : null,	// selection widget
			history: null,	//history widget
			inputs: photoedit_inputs, // photoedit.inputs.js
			actions: photoedit_actions, // photoedit.actions.js
			imageTools: photoedit_imageTools, //photoedit.imageTools.js
			loadFromHistory: false,
			action: null,
			canvas3Load: true,
		},
		_requirements: function () {
			// requirements
			var requirements = {
					'canvas': Modernizr.canvas,
					'fileAPI': typeof(FileReader) == 'function',	
			}
			var error = 0;
			var error = 0;
			$.each(requirements, function (requirement, supported) {
				if (!supported) {
					error++;
					if (error == 1) {
						$('<p>Votre navigateur n\'est pas compatible:</p>').replaceAll($this);
						$('p').after($('<ul/>', {id: 'photoeditRequirements',}));
					}
					$('<li>Pas de '+requirement+'</li>').appendTo('#photoeditRequirements');
					$('<p>Utilisez une version récente de Firefox, Chrome ou Opera.</p>').insertAfter('#photoeditRequirements');								
				}
			});
			if (error > 0) {
				$.error("Browser not supported see error messages on page.");
				return false;
			}
			return true;
		},
		// the constructor
		_create: function() {
			if(!this._requirements) {
				return;
			}
			var options = this.options;
			var data = this.data;
			// canvas affiche l'image
			var canvas = $('<canvas/>', {
				id : 'canvas',
			});
			canvas.attr({
				width: options.width,
				height: options.height,
			});
			// canvas2 affiche la sélection rectangulaire
			var canvas2 = $('<canvas/>', {
				id : 'canvas2',
			});
			canvas2.attr({
				width: options.width,
				height: options.height,
			});
			// canvas3 est utilisé pour appliquer les actions
			// car canvas contient une image mise à l'échelle et non l'image d'origine
			var canvas3 = $('<canvas/>', {
				id : 'canvas3',
			});
			canvas3.attr({
				width: options.width,
				height: options.height,
			});
			var ctx = canvas[0].getContext('2d');
			//info widget
			var info = $('<div/>', {id: 'info'})
				.appendTo(this.element)
				.info()				//init info widget
				.data('info')		// get widget instance
			;
			//scale widget
			var scale = canvas.scale().data('scale'); //init and get instance
			$(this.element).append(canvas,canvas2);
			// on cache le canvas3 qui ne sert qu'à appliquer les actions sur l'image d'origine
			canvas3.hide().appendTo(this.element);
			//cords widget must be initialised after canvas2 has been added to the page
			var cords = canvas2.cords({
				callback: function(x,y) {
					// on borne les coordonnées
					// la taille du canvas est options.width x options.height
					// il faut prendre en compte le scale
					x = scale.eval(x);
					y = scale.eval(y);
					x = Math.min(x,scale.data.width);
					y = Math.min(y,scale.data.height);
					x = Math.max(x,0);
					y = Math.max(y,0);
					info.updateCords(x,y) 
				},
			}).data('cords'); // get instance
			// selection widget
			var selection = $(canvas2).selection({
				callbackDimensions: function(w,h) {
					data.info.updateDimensions(scale.eval(w),scale.eval(h))
				},
				offCallback: function() {
					data.info.updateDimensions(data.img.width,data.img.height);
				},
				callbackCords: function(x,y) {
					// l'image est chargé lors d'une selection 
					// on peut comparer directement au dimensions de l'image
					x = scale.eval(x);
					y = scale.eval(y);
					x = Math.min(x,data.img.width);
					y = Math.min(y,data.img.height);
					x = Math.max(0,x);
					y = Math.max(0,y);
					data.info.updateCords(x,y);
				},
			}).data('selection');
			// history widget
			var history = $('<div/>',{id: 'history'}).appendTo(this.element)
				.history({
					callback: function(imageDataURL) {
						data.loadFromHistory = true;
						// va déclencher l'evenement on load de l'image
						data.img.src = imageDataURL;
					},
					// Ajouter autres options ici
			}).data('history'); //get instance	
			data.canvas = canvas[0];
			data.canvas2 = canvas2[0];
			data.canvas3 = canvas3[0];
			data.ctx = canvas[0].getContext('2d');
			data.info = info;
			data.cords = cords;
			data.selectionPlugin = selection;
			data.history = history;
			data.scale = scale;
			data.imageNoLoad = false;
			$.event.props.push('dataTransfer');  // needed for drag and drop
			this.show();
		},
		show: function() {
			var data = this.data;
			var options = this.options;
			var that = this;
			if (Modernizr.draganddrop) {
				data.ctx.fillText("Déposer une image pour commencer", 300, 300);
			}
			// glisser déposer
			$(data.canvas2)
				.on('dragenter',false)
				.on('dragover',false)
				.on('drop', function(e) {
					var files = e.dataTransfer.files; // FileList object.
					if (files.length > 0) {
						var file = files[0];
						that.load(file);
					}
					e.preventDefault();
				})
			;
			// appeler après chaque traitement
			$(data.img).on('load',function(e) {
				if (data.canvas3Load) {
					data.canvas3.width = data.img.width;
					data.canvas3.height = data.img.height;
					data.canvas3.getContext('2d').drawImage(this,0,0);
				}
				data.canvas3Load = true;
					if(!data.loadFromHistory) {
						// si le chargement ne vient pas de l'historique
						data.history.save(data.action, this);
					}
					// on réinitialise le flag pour le prochain chargement
					data.loadFromHistory = false;

					// on affiche l'image sur le canvas d'affichage
					data.scale.draw(this,options.width,options.height);
					if (data.selectionPlugin.isOn()) {
						// on ferme la sélection
						data.imageTools.selection.fun();
					}				
					data.canvas = $('#canvas')[0];
					data.canvas2.height = data.canvas.height;
					data.canvas2.width = data.canvas.width;
					// on met à jour les dimensions du div #info
					data.info.updateDimensions(this.width,this.height);

			});
			
			// on rajoute les outils (imageTools)
			$(data.canvas).before($('<div />', {id: 'imagetools'}));
				$('<br/>').insertBefore('#imagetools');
				$.each(data.imageTools, function(tool, obj) {
					obj = $.extend({type: 'checkbox',},obj);
					data.inputs.append(tool,obj,'imagetools');
					var id = obj.optionName+'_'+obj.type;
					$('#'+id).on('click', function(e) {
						e.preventDefault();
						var id = obj.optionName+'_'+obj.type;
						if(photoedit_requirementsFun(obj.requirements)) {
							obj.fun();
						} else {
							$(this).removeAttr('checked');
							$(this).button('refresh');
						}
					});
			});
			$('<br/>').insertAfter('#imagetools');
			
			// on rajoute les actions
			$('<div/>', {id: 'actions'}).insertBefore(data.canvas);
			$.each(data.actions, function (action, obj) {
					var id = 'actions'+obj.cat;
					if ($('#'+id).length == 0) { 
						// la catégorie n'existe pas encore
						$('<h3><a href="#">'+obj.cat+'</a></h3>').appendTo('#actions');
						$('<div/>', { id: id}).appendTo('#actions');
					}
					var myButton = $('<button/>', {
						text: action,
					});	
					myButton.appendTo('#'+id);
					$('<br/>').appendTo('#'+id);
					myButton.button({
						icons: { primary: obj.icon}
					});
					$(myButton).on('click', function(e) {
						//on ferme tous les autres dialogues pour éviter des conflits
						$(".ui-dialog-content").dialog('close').remove();
						e.preventDefault();
						var options2 = {};
						if (data.selectionPlugin.isOn()) {
							var rectangle = data.selectionPlugin.getSelection();
							$.each(rectangle, function(name,val) {
								rectangle[name] = data.scale.eval(val);
							});
							options2 = $.extend({rect: rectangle},obj.options);
						} else {
							options2 = $.extend({rect: {"left":0,"top":0,"width":data.img.width,"height":data.img.height}},obj.options);
						}
						if (typeof(obj.inputs)  !== 'undefined') {
							var id = obj.action;
							$('<div/>', { id: id+'_dialog', title: action})
								.appendTo('#photoedit')
							$.each(obj.inputs, function(input, obj) {
								data.inputs.append(input,obj,id+'_dialog');
								$('<div/>', { class: 'inputs-seperator'}).appendTo('#'+id+'_dialog');
							});
							// on crée le boutton ok du dialogue
							var myButton2 = $('<button/>', {
								text: 'Ok',
							});	
							myButton2.appendTo('#'+id+'_dialog');
							myButton2.button();
							$(myButton2).on('click', function(e) {
								e.preventDefault();
								var value = null;
								$.each(obj.inputs, function(index,input) {
									options2 = $.extend(options2,data.inputs.val(input));
								});
								$('#'+id+'_dialog').dialog('destroy').remove()
								obj.fun(data.canvas3,options2);
							});
							// montre le dialogue
							$('#'+id+'_dialog').dialog({
								close: function(event,ui) {
									 // on supprime le code html du dialogue à la fermeture
									$(this).remove();
								},
							});
						} else {						
							obj.fun(data.canvas3,options2);
						}
					});		


				});
				// stylise avec jQuery UI Accordion
				$( "#actions" ).accordion({collapsible:true});
			
		},
		load: function(file) {
			var data = this.data;
			data.action = "chargement d'image";
			if (file.type.match('image.*')) {
				var reader = new FileReader();
				reader.onload = function (e) {
					data.img.src = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		},
		update : function(action) { 
			var data = this.data;
			var options = this.options;
			// on recupère le canvas modifier
			data.canvas3 = $('#canvas3')[0];
			// on charge l'image
			data.action = action;
			data.loadFromHistory = false;
			// canvas3 est déjà à jour on ne veut pas le modifier dans l'évènement on load de data.img
			data.canvas3Load  = false;
			data.img.src = data.canvas3.toDataURL();
		},

		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			var options = this.options;
			var data = this.data;
			$(data.canvas).unbind();
		},
		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			//this.refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
});

//on initialise photoedit
$(function() {
	$('#photoedit').editor();
});