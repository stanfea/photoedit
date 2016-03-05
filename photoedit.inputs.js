/*
 * Photoedit - inputs
 * Copyright (c) 2012 Stefan Bacon, stefan.bacon@gmail.com
 */
 
 var photoedit_inputs = {
	append: function(input,obj,parentId) {
			var type = obj.type;
			var name = obj.optionName;
			var options = obj.options;
			switch(type) {
				case 'checkbox':
					var id = name+'_'+type;
					var input2 = $('<input/>', {type: 'checkbox',id: id});
					var label = $('<label/>', {for: id,text: input,});
					$('#'+parentId).append(input2,label);
					$('#'+id).button(options);
					break;
				case 'slider':
					var id = name+'_'+type;
					if (options.value == undefined) {
						options.value = 0;
					}
					var span = $('<span/>' ,{
						text: input+':',
					});
					var div = $('<div/>', {
						title: 'test',
						id: id,
					});
					var label = $('<label/>', {
						for: id,
						id: id+'_label',
						text: options.value,
					});
					var options = $.extend(options,{
						slide:  function( event, ui ) {
							$('#'+id+'_label').text(ui.value);
						},
					});
					$('#'+parentId).append(span,div,label);
					$('#'+id).slider(options);
					break;
				case 'matrice':
					var id = name+'_'+type;
					var span = $('<span/>' ,{
						text: input+':',
					});
					var div = $('<div/>', {
						id: id,
					});
					$('#'+parentId).append(span,div);
					$('#'+id).matrice(options);
					break;
				case 'selection':
					var id = name+'_'+type;
					var span = $('<span/>' ,{
						text: input+':',
					});
					var select = $('<select/>', {id: id});
					$('#'+parentId).append(span,select);
					$.each(options, function(name,value2) {
						var option = $('<option/>', {
							value: value2,
							text: name,
						});
						$('#'+id).append(option);
					});
					break;
				// Rajouter vos nouvelles entrées ici et dans val
				default:
					break;
					
			}
		},
	val: function(input) {
		var type = input.type;
		var name = input.optionName;
		var options = input.options;
		var id = name+'_'+type;
		switch (type) {
			case 'slider':
				var value = $('#'+id+'_label').text();
				break;
			case 'matrice':
				var value = $('#'+id).data('matrice').getArray();
				break;
			case 'checkbox':
				var value = $('#'+id).is(':checked');;
				break;
			case 'selection':
				var value = $('#'+id).val();
				break;
			// Rajouter vos nouvelles entrées ici
			default:
				return {};
		}
		var obj = {};
		obj[name] = parseFloat(value);
		return obj;
		
	},
};