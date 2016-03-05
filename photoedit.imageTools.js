/*
 * Photoedit - imageTools
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 var photoedit_imageTools = {
		'selection': {
			optionName: 'selection',
			icon: '',
			options: {},
			requirements: {},
			fun: function() {
				// active la sélection si elle n'est pas active, désactive la sélection si elle est active
				var data = $('#photoedit').data('editor').data;
				if (data.selectionPlugin.isOn()) {
					data.selectionPlugin.off();
					data.cords.on();
					// id connu car créé de la sorte dans photoedit.inputs.js
					var id = this.optionName+'_checkbox';
					// décoche la checkbox
					$('#'+id).removeAttr('checked');
					// met à jour le bouton pour réfleter le changement
					$('#'+id).button('refresh');
				} else {
					// désactive le module coordonné
					data.cords.off();
					// active le module de sélection
					data.selectionPlugin.on();
				}
			},
		},
		// Rajouter vos nouveaux outils ici
}