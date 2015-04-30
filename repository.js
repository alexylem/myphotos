/*
am.config = {
	objects: {
		objectkey: {
			title: 'Object',
			source: url(ajax)/array(data)/function
			fields: {
				fieldkey: {
					label: 'Field'
					type: string/text/list/email/date/datetime/boolean/multivalue
					widget: select/radio for type list
							multiselect/checklist for type mutlivalue
					options: [ for type list
						optionkey: {
							display: 
							helper: 
						}
					]
					object: false/objectkey for type join/multi
					length: false/X
					required: false/true
					unique: false/true
				}
			}		
		}
	}
};
*/
am.config = {
	objects: {
		albums: {
			title: 'Album',
			source: null,
			fields: {
				title: {
					label: 'Title',
					type: 'string',
					length: 20,
					required: true,
					unique: false
				},
				visibility: {
					label: 'Visibility',
					type: 'list',
					widget: 'radio',
					options: {
						private: {
							display: 'Private',
							helper: 'Only visible by Admin accounts.'
						},
						public: {
							display: 'Public',
							helper: 'Visible by everyone without authentication.'
						},
						restricted: {
							display: 'Restricted',
							helper: 'Visible by a selection of groups',
						},
					}
				},
				groups: {
					label: null,
					type: 'multivalue',
					widget: 'multiple',
					object: 'groups'
				}
			}
		},
		photos: {
			title: 'Photo',
			source: null,
			fields: {
				title: {
					label: 'Title',
					type: 'string',
					length: 20,
					required: true,
					unique: false
				},
				previewurl: {
					label: null,
					type: 'url',

				}
			}
		},
		groups: {
			title: 'Group',
			source: function () {
				return $.map (gallery.get ('groups'), function (group) {
					return {
						value: group,
						text: group
					};
				});
			},
			fields: {
				name: {
					label: 'Name',
					type: 'string',
					length: 20,
					required: true,
					unique: true
				}
			}
		},
		people: {
			title: 'People',
			source: 'backend.php?action=getPeople',
			fields: {
				name: {
					label: 'Nickname',
					type: 'string',
					placeholder: 'ex: Mum',
					length: 20,
					required: true,
					unique: true
				},
				email: {
					label: 'Email address',
					type: 'email',
					placeholder: 'ex: mum@gmail.com',
					length: 50,
					required: true,
					unique: true
				},
				groups: {
					label: 'Groups',
					type: 'multivalue',
					widget: 'checklist',
					object: 'groups'
				}
			}
		}
	}
};