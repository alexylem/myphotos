// x-editable options
$.extend($.fn.editable.defaults, {
    inputclass: 'input-sm',
    mode: 'inline',
    //toggle: 'dblclick', // default 'click'
    showbuttons: false,
    onblur: 'submit'
});

// function to validate required fields
function frequired (value) {
	if ($.trim(value) === '')
        return 'This field is required';
}

function listenTabs ($table) {
	$table.find ('td > a.editable').on('shown', function () {
		var $td = $(this).parent();
	    $(this).data('editable').input.$input.on('keydown', function(e) {
	        if (e.keyCode == 9) {
	            e.preventDefault();
	            if (e.shiftKey)
	                $td.prev('td').find ('a.editable').editable('show');
	            else
	                $td.next('td').find ('a.editable').editable('show');
	        }
	    });
	});
}

var am = new function () {
	this.config = {}; // must be initialized with am.config = XXX
	
	this.getRecords = function (objectkey, callback) {
		switch (typeof this.config.objects[objectkey].source) {
			case 'string': // ajax url
				jQuery.ajaxSetup({async:false});
				my.getJSON(this.config.objects[objectkey].source, function (records) {
					callback (records);
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
		//my.debug ('drawing datatable for', objectkey, 'on table', $table);
		var config = this.config, // this.config out of function scopes
			columns = [{
				field: '_selected',
				checkbox: true
			},
			{
				field: 'ID',
				visible: false // true for debug
			}];
		$.each (config.objects[objectkey].fields, function (fieldkey, field) {
			var editor = {
				name: fieldkey,
				success: function(response, newValue) {}
			};
			if (field.required)
				editor.validate = frequired;
			editor.type = 'text';
			switch (field.type) {
				case 'integer':
					editor.type = 'number';
					break;
				case 'string':
				case 'email':
					break; // valid
				case 'text':
					editor.type = 'textarea';
					break;
				case 'boolean':
					editor.type = 'checklist';
					editor.source = [{value: '1', text:field.label}];
					editor.display = function (value) {
						$(this).html(value == '1'?'Y':'N');
					};
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
					} else if (field.list) {
						editor.source = 'getList.php?type='+field.list;
					} else if (field.options) {
						$.each (field.options, function (key, option) {
							options.push ({
								value: key,
								text: option.display
							});
						});
						editor.source = options;
					} else {
						my.error ('no data source provided for field', field.label);
					}
					break;
				default:
					console.warn ('Unknown type', field.type, 'for field', field.label);
			}
			columns.push ({
				title: field.label,
				field: fieldkey,
				clickToSelect: false,
				sortable: false, // newrecord
				editable: editor
			});
		});
		
		this.getRecords (objectkey, function (records) {
			for (var i=0; i<records.length; i++) {
				records[i].ID = i;
			}
			//my.debug ('ready to draw on', $table, 'with columns', columns, 'data', records);
			
			// Generate toolbar
			if ($('#am_toolbar').length === 0) {
				$toolbar = $('<div id="am_toolbar" class="btn-toolbar"></div>').insertBefore ($table);
				$newbtn = $('<button on-click="adduser" type="button" class="btn btn-default">'+
						'<span class="glyphicon glyphicon-plus"></span> New'+
					'</button>').click (function () {
					am.newRecord ($table, objectkey);
				}).appendTo ($toolbar);
				$deletebtn = $('<button on-click="removeuser" type="button" class="btn btn-default">'+
						'<span class="glyphicon glyphicon-remove"></span> Delete'+
					'</button>').click (function () {
					if (confirm (i18n.t('are_you_sure')))
						am.removeChecked ($('#users'));
				}).appendTo ($toolbar);
			}

			// Destroy previous table
			$table.bootstrapTable ('destroy');

			// Create table
			$table.bootstrapTable ({
				columns: columns,
				data: records,
				idField: 'ID',
				pagination: true,
				search: true,
				toolbar: '#am_toolbar',
				clickToSelect: true, // enable checkbox selection
				searchTimeOut: 200,
				singleSelect: true
			}).on ('editable-init.bs.table', function () {
				listenTabs ($(this));
			});
			listenTabs ($table);
		});
	};

	this.getData = function ($table) {
		return $table.bootstrapTable ('getOptions').data.map (function (record) {
			var copy = $.extend({}, record); // clone to preserve datatable
			delete copy.ID; // remove fake ID
			delete copy._selected; // remove internal selection field
			return copy;
		});
	};

	this.newID = function ($table) {
		var records = $table.bootstrapTable ('getData');
		return Math.max.apply(Math,records.map(function(r){return r.ID;}))+1;
	};

	this.newRecord = function ($table, objectkey) {
		var record = {};
		$.each (this.config.objects[objectkey].fields, function (fieldkey, field) {
			record[fieldkey] = field.default || ''; // TODO default
		});
		this.addRecord ($table, record, true);
	};

	this.addRecord = function ($table, record, editnow) {
		record.ID = this.newID ($table);
		$('.bootstrap-table .search > input').val('').trigger('drop'); // keyup not always work
		$table.bootstrapTable ('selectPage', 1);
		$table.bootstrapTable ('prepend', record); // needs nosort !
		setTimeout (function () {
			$table.bootstrapTable ('checkBy', { field: 'ID', values: [record.ID] });
			if (editnow)
				$('a[data-pk='+record.ID+']').first().editable('show');
		}, 300); // has to be greater than bootstrap table search timeout
	};

	this.removeChecked = function ($table) {
	    var selects = $table.bootstrapTable('getSelections');
	    if (selects.length) {
	        ids = $.map(selects, function (row) {
	            return row.ID;
	        });
	        $table.bootstrapTable('remove', {
				field: 'ID',
				values: ids
	        });
	    } else
	    	my.error ('Please select a record first');
	};
} ();