$.fn.editable.defaults.mode = 'inline';

var am = new function () {
	this.config = {}; // set in config.js; TODO load repo by js name?
	
	this.getRecords = function (objectkey, callback) {
		switch (typeof this.config.objects[objectkey].source) {
			case 'string': // ajax url
				jQuery.ajaxSetup({async:false});
				my.get({
					url: this.config.objects[objectkey].source,
					success: function (records) {
						callback (records);
					}
				});
				break;
			case 'object': // array
				callback (this.config.objects[objectkey].source);
				break;
			case 'function': // function
				callback (this.config.objects[objectkey].source());
				break;
			default:
				my.error ('Unknown data source', this.config.objects[objectkey].source);
		}
	};

	this.drawDatatable = function ($table, objectkey) {
		var config = this.config,
			columns = [{
				checkbox: true
			},
			{
				field: 'ID',
				visible: false
			}];
		$.each (config.objects[objectkey].fields, function (fieldkey, field) {
			var editor = {
				name: fieldkey,
				onblur: 'submit',
				showbuttons: false,
				success: function(response, newValue) {}
			};
			editor.type = 'text';
			switch (field.type) {
				case 'string':
				case 'email':
					break; // valid
				case 'text':
					editor.type = 'textarea';
					break;
				case 'boolean':
					editor.type = 'checkbox';
					break;
				case 'list':
				case 'multivalue':
					if (field.type == 'list')
						editor.type = 'select';
					else {
						editor.type = 'checklist';
						editor.display = function(value) {
							if (value.length)
								$(this).html (value.join (', '));
							else
								$(this).empty();
						};
					}
					var options = [];
					if (field.object) {
						editor.source = config.objects[field.object].source;
					} else {
						$.each (field.options, function (key, option) {
							options.push ({
								value: key,
								text: option.display
							});
						});
						editor.source = options;
					}
					break;
				default:
					console.warn ('Unknown type', field.type, 'for field', field.label);
			}
			columns.push ({
				title: field.label,
				field: fieldkey,
				sortable: true,
				editable: editor
			});
			
		});
		
		this.getRecords (objectkey, function (records) {
			for (var i=0; i<records.length; i++) {
				records[i].ID = i;
			}
			$table.bootstrapTable ({
				columns: columns,
				data: records,
				pagination: true,
				search: true,
				clickToSelect: true,
				singleSelect: true
			});
		});
		
	};

	this.getData = function ($table) {
		return $table.bootstrapTable ('getData').map (function (record) {
			var copy = $.extend({}, record); // clone to preserve datatable
			delete copy.ID; // remove fake ID
			return copy;
		});
	};

	this.addRow = function ($table, record) {
		var records = $table.bootstrapTable ('getData');
		record.ID = Math.max.apply(Math,records.map(function(r){return r.ID;}))+1;
		$table.bootstrapTable ('append', record);
	};

	this.removeChecked = function ($table) {
	    var selects = $table.bootstrapTable('getSelections');
        ids = $.map(selects, function (row) {
            return row.ID;
        });
        $table.bootstrapTable('remove', {
			field: 'ID',
			values: ids
        });
	};
} ();