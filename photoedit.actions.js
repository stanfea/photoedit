/*
 * Photoedit - actions
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
// fonction qui vérifie les prérequis d'une action
var photoedit_requirementsFun = function (requirements) {
		var data = $('#photoedit').data('editor').data;
		// on vérifie qu'une image a bien été chargé
		if (data.img.src == "") {
				return false;
		}
		// On vérifie les prérequis dans requirements
		if (typeof(requirements) != 'undefined') {
			var flag = true;
			$.each(requirements, function(requirement,val) {
						if (val == true) {
							switch(requirement) {
								case 'selection':
									if (!data.selectionPlugin.isOn()) {
										// you can decide to show an error message here, like a dialog
										flag = false;
									}
									break;
								// Rajouter vos nouveaux prérequis ici
								default:
									break;
							}
						}
			});
			return flag;
		}		
		return true;
}
// fonction générique pour les actions pixastic
var photoedit_defaultPixasticFun = function (canvas,options) {
			var editor = $('#photoedit').data('editor');
			if (!photoedit_requirementsFun(this.requirements)) {
				return;
			}
			$(canvas).pixastic(this.action,options);
			editor.update(this.action);
}
var photoedit_actions = {
	'Charger fichier' : {
				cat: 'Fichier',
				icon: '',
				html: $('<div title="Ouvir un fichier local">'
						+'Choisisser un fichier à charger.<br />'
						+'Les formats accepter sont PNG, JPEG, GIF et BMP.<br />'
						+'La taille maximale est 4Mo.<br /><br />'
						+'<form action="" method="post" enctype="multipart/form-data" accept-charset="utf-8">'
						+'<input id="file" name="file" type="file"/>'
						+'<input type="submit" id="submit" value="Charger"/>'
						+'</form>'),
				fun: function () {
						$(this.html).dialog({width: 500, resizable: false})
						.on('submit', function (e) {
							e.preventDefault();
							var file = $('#file')[0].files[0];
							$('#photoedit').data('editor').load(file)
							$(this).off('submit');
							$(this).dialog('destroy');
						});
					 },
		},
	"Récupérer l'image": { 
			icon: '',
			cat: 'Fichier',
			fun: function() {
					var editor = $('#photoedit').data('editor')
					var data = editor.data;
					if (data.img.src != "") {
						window.location = data.canvas3.toDataURL("image/jpeg");
					}
				},
		},
	'Inversion': {
		action: 'invert',
		icon: '',
		cat: 'Effets',
		fun: photoedit_defaultPixasticFun,
		options: {},
		requirements: {},
	},
	'180°': {
		action: 'fliph',
		icon: '',
		cat: 'Transformations',
		fun: photoedit_defaultPixasticFun,
		options: {},
		requirements: {},
	},
	'Couper': {
		action: 'crop',
		icon: '',
		cat: 'Transformations',
		fun: photoedit_defaultPixasticFun,
		options: {},
		requirements: {selection: true,},
	},
	'exemple': {
		action: 'rien',
		icon: '',
		cat: 'Transformations',
		fun: function(){},
		options: {},
		requirements: {},
		inputs: {
			'contraste': {
				optionName: 'contrast',
				type: 'slider',
				options: {min: 0,max: 100,step: 10,value:50}
			},
			'Surligner':  {
				optionName: 'highlight',
				type: 'matrice',
				options: {n: 3, m: 3, values: [[1,1,1],[1,1,1],[1,1,1]]},
			},
			'Activer': {
				optionName: 'activate',
				type: 'checkbox',
				options: {},
			},
		},
	},
	'Ajuster la couleur': {
		action: 'coloradjust',
		icon: '',
		cat: 'Ajuster',
		fun: photoedit_defaultPixasticFun,
		options: {},
		requirements: {},
		inputs: {
			'rouge': {
				optionName: 'red',
				type: 'slider',
				options: {min: -1,max: 1,step: 0.01,value:0},
			},
			'vert':  {
				optionName: 'green',
				type: 'slider',
				options: {min: -1,max: 1,step: 0.01,value:0},
			},
			'bleu': {
				optionName: 'blue',
				type: 'slider',
				options: {min: -1,max: 1,step: 0.01,value:0},
			},
		},
	},
	'Mosaic': {
		action: 'mosaic',
		icon: '',
		cat: 'Transformations',
		fun: photoedit_defaultPixasticFun,
		options: {},
		requirements: {},
		inputs: {
			'Taille des block': {
				optionName: 'blockSize',
				type: 'slider',
				options: {min: 1,max: 100,step: 1,value:10},
			},
		},
	},
	'Histogram': {
		action: 'histogram',
		icon: '',
		cat: 'Transformations',
		fun: photoedit_defaultPixasticFun,
		options: {paint:true},
		requirements: {},
	},
	'Relief': {
		action: 'emboss',
		icon: '',
		cat: 'Effets',
		fun: photoedit_defaultPixasticFun,
		options: {},
		inputs: {
			'Poids': {
				optionName: 'strength',
				type: 'slider',
				options: {min: 0,max: 10,step: 0.1,value:1},
			},
			'Niveau de gris': {
				optionName: 'greyLevel',
				type: 'slider',
				options: {min: 0,max: 255,step: 1,value:179}
			},
			'Direction': {
				type:'selection',
				optionName: 'direction',
				options: {'En Haut à gauche': 'topleft',
								'En haut': 'top',
								'En haut à droite': 'topright',
								'A droite':  'right',
								'En bas à droite': 'bottomright',
								'En bas': 'bottom',
								'En bas à gauche': 'bottomleft',
								'A gauche': 'left',
								},
			},
			'Mélanger': {
				type: 'checkbox',
				optionName: 'blend',
				options: {},
			}
		},
	},
	// Rajouter vos nouvelles actions ici

}