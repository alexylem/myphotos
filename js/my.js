// Log levels
my.loglevel = Config.log_level;
Ractive.DEBUG = (Config.log_level >= 4);

// Google analytics
if (Config.ga_client_id) {
	ga('create', Config.ga_client_id, 'auto');
	ga('send', 'pageview', { // send hash to google analytics
		'page': location.pathname + location.search  + location.hash
	});
}

// Enable localization
if (!Config.language) // user chose automatic detection
	Config.language = navigator.language;
window.___gcfg = { lang: Config.language }; // Google sign-in in local language
i18n.init({
	lng: Config.language,
	fallbackLng: Config.fallback_language,
	//useLocalStorage: (Config.log_level <= 2), // true for Production
	getAsync: false,
	debug: (Config.log_level >= 4),
	sendMissing: true,
	missingKeyHandler: function(lng, ns, key, defaultValue, lngs) { // NOT WORKING! I think it is
		console.error ("Translation missing for key", key, "in language",lng);
	}
});

var gallery = new Ractive({
	el: 'container',
	template: '#template',
	data: {
		// localization
		t: i18n.t,
		// For display
		view: 'home',
		loading: true,
		touch: Modernizr.touch,
		// parameters
		client: Config,
		version: 1, // increment this when updating config structure
		album_sort_options: {
			'title_asc': {
				'title': i18n.t('by_title'),
				'field': 'filename',
				'order': '<'},
			'date_desc': {
				'title': i18n.t('newest_first'),
				'field': 'date',
				'order': '>'},
			'date_asc': {
				'title': i18n.t('oldest_first'),
				'field': 'date',
				'order': '<'
		}},
		album_sort_field: Config.default_album_sort, // default album sort
		// Photos
		photos: [],
		photoid: false,
		showhidden: false, // don't show hidden photos by default
		// Smart Albums
		// TODO
		// Albums
		folder: {
			name: false,
			date: '',
			visibility: '',
			filepath: '',
			parentpath: false,
			groups: []
		},
		folders: [],
		search: '', // user search criterias
		structure: false, // full visible album structure, for search results
		sort: function (array, column, order) {
			//my.debug ('sorting', array, 'by', column, 'order', order);
			array = array.slice(); // clone, don't modify inderlying data
			//my.debug ('copied array is', array);
			array = array.sort (function (a,b) {
				if (order == '<')
					return a[column] < b[column]? -1 : 1;
				return a[column] > b[column]? -1 : 1;
			});
			//my.debug ('sorted array is', array);
			return array;
		},
		filter: function (array, field, criteria) {
			my.debug ('filtering', array, 'on', field, 'for', criteria);
			return array.filter (function (a) {
				var found = a[field].match(new RegExp(criteria, "i"));
				if (found)
					my.debug ('found', criteria, 'on', a[field]);
				return found;
			});
		},
		getpublink: function () {
			return location.href.replace(/ /g, '%20').split('&k=')[0]+'&k='+this.get('folder.key');
		},
		// Groups
		groups: [],
		see_as: '',
		// Users
		user: false,
		users: [],
		// Synchonization
		cron: {} // object to store info during Sychronization
	}
});

// Enable tooptips on non-touch devices
	if (!Modernizr.touch)
		$('.addtooltip').i18n().tooltip({
			container: 'body',
			placement: 'bottom',
			html: true
		}); // need to translate title before

// Get direct link dir
var dir = decodeURIComponent (window.location.hash.slice(1)) || './';

if (dir == './') // Only root should be added to homescreen (to limit auth errors)
	addToHomescreen(); // Add 2 homescreen

// Init
my.get({
	url: 'plus.php',
	data: { action: 'init' },
	success: function (user) {
		gallery.set ('client.client_id', 'TTTEEEESSSTTT'); // to be removed??
		if (user) { // logged in
			gallery.set ('user', user);
			ga('set', '&uid', user.email); // send user id to google analytics
			if (user.isadmin) {
				
				// Config version
				if (Config.version != gallery.get ('version')) {
					my.warn ('Your configuration does not exist or is outdated. Opening settings panel.');
					$('#configModal').modal ('show');
				}

				my.get ({
				url: 'backend.php',
				data: { action: 'getGroups' },
				success: function (sdata) {
					gallery.set ('groups', JSON.parse (sdata));
					if (Config.check_updates)
						gallery.fire ('checkupdates');
					/*
					try { // DEBUG ractive freeze
						gallery.set ('groups', groups);
					} catch (err) {
						console.error ('Ractive error', err);
						location.reload();
					}
					*/
				}
			});
			}
		}
		else {
			gallery.set ('user', false);
		}
		cwd (dir);
	},
	error: function () { // is needed?
		gallery.set ('user', false);
		cwd (dir);
	}
});

/**************
* Open Albums *
**************/
$(window).on('hashchange', function() { // change album
	var folder = decodeURIComponent (window.location.hash.slice(1));
	cwd (folder);
	if (Config.ga_client_id)
		ga('send', 'pageview', { // send hash to google analytics
	 		'page': location.pathname + location.search  + location.hash
		});
});
/*******************
* View Photo/Video *
*******************/
gallery.on ('view', function (event, photoid) {
	my.debug ('setting photoid to', photoid);
	if (Modernizr.touch)
		my.info (i18n.t('swipe_to_navigate'));
	this.set ('photoid', photoid);
	this.set ('view', 'photo');
	// cache next image
	var src = this.get ('photos['+(photoid+1)+'].previewurl');
	my.debug ('preloading image', src);
	(new Image()).src = src; // TODO don't preload videos
});
gallery.on ('previous', function (event) {
	this.add ('photoid', -1);
	while (!this.get ('showhidden') && this.get('photos['+this.get('photoid')+'].hidden'))
		this.add ('photoid', -1);
	// cache previous image
	//(new Image()).src = this.get ('photos['+(this.get('photoid')-1)+'].previewurl');
});
gallery.on ('next', function (event) {
	this.add ('photoid', 1);
	// go to next visible photo
	while (!this.get ('showhidden') && this.get('photos['+this.get('photoid')+'].hidden'))
		this.add ('photoid', 1);
	// cache next image // TODO next visible image!
	var src = this.get ('photos['+(this.get('photoid')+1)+'].previewurl');
	my.debug ('preloading image', src);
	(new Image()).src = src;
});
gallery.on ('close', function (event) {
	this.set ('photoid', false);
	this.set ('view', 'album');
});
gallery.on ('favorite', function (event) {
	var photoid = this.get ('photoid'),
		photo = this.get ('photos')[photoid];
	if (photo.favorite) { // was favorite
		if (this.get ('folder.filepath') == 'favorites') {
			this.splice('photos', photoid, 1);
			removeObject ('mp_favorites', photoid);
			my.success (i18n.t('pic_unstarred'));
			this.set ('view', 'album');
		} else
			my.info ('Remove favorites from Favorite smart album');
	}
	else {
		photo.favorite = true;
		this.set('photos['+photoid+']', photo);
		addObject ('mp_favorites', photo);
		my.success (i18n.t('pic_starred'));
	}
});
gallery.on ('hide', function (event) {
	var photoid = this.get ('photoid'),
		photo = this.get ('photos')[photoid],
		hide = !photo.hidden;
	my.get ({
		url: 'backend.php',
		data: {
			action: 'updateFolder',
			dir: gallery.get ('folder.filepath'),
			filename: photo.filename,
			hidden: hide
		},
		success: function () {
			gallery.set ('photos['+photoid+'].hidden', hide);
			if (hide)
				my.warn (i18n.t ('pic_hidden'));
			else
				my.success (i18n.t ('pic_visible'));
		}
	});
});
gallery.on ('cover', function (event) {
	my.get ({
		url: 'backend.php',
		data: {
			action: 'updateFolder',
			dir: gallery.get ('folder.filepath'),
			cover: gallery.get('photos')[gallery.get('photoid')].filename
		},
		success: function () {
			my.success ('Album cover changed successfuly.');
		}
	});
});
// Download
gallery.on ('dl_album', function (e, format) {
	my.info (i18n.t ('dl_loading'));
	my.get ({
		url: 'backend.php',
		timeout: 60*1000, // 1m time to generate zip
		data: {
			action: 'list', // TODO to it progressively with progress bar for big albums
			dir: gallery.get ('folder.filepath'),
			zip: format
		},
		success: function (zipfile) {
			my.success (i18n.t ('dl_ready'));
			location.href = 'img.php?f='+zipfile+'&d=1';
		}
	});
});
// Send Report
gallery.on ('send_report', function (e, format) {
	my.debug ('send report, loading bowser...');
	cmd ('lib/bowser/bowser.min.js', function () {
		my.debug ('bowser loaded');
		var nl='\n',
			subject='MyPhotos Report',
			body='URL:'+nl+
				location.href+nl+
				'Platform:'+nl+
				JSON.stringify(bowser, null, '    ')+nl+
				'Data:'+nl+
				JSON.stringify(gallery.get(), null, '    ')+nl;
		location.href='mailto:alexandre.mely@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
	});
});

// Keyboard shortcuts
$(document).keydown(function(e) {
	my.debug ('hotkey pressed', e.keyCode);
	if (gallery.get ('view') == 'photo') {
		var photoid = gallery.get ('photoid');
		switch(e.keyCode) {
			case 27: // esc
				gallery.fire ('close');
				break;
			case 37 : // left
				if (photoid > 0)
					gallery.fire ('previous');
				break;
			case 39 : // right
				if (photoid < gallery.get ('photos').length - 1)
					gallery.fire ('next');
				break;
			case 70 : // F
				gallery.fire ('favorite');
				break;
			case 72 : // H
				gallery.fire ('hide');
				break;
		}
	}
});
/******************
* Groups & People *
******************/
gallery.on ('removegroup', function (event, index) {
	if (confirm (i18n.t('are_you_sure'))) {
    	gallery.splice('groups', index, 1);
	}	
});
gallery.on ('filterpeople', function (event, group) {
	my.debug ('filtering poeple on', group);
	$('.bootstrap-table .search > input').val(group).trigger('drop'); // not working anymore??
});
// Update Library
gallery.on ('ignore', function (event, group) {
	this.set ({
		'cron.status': '',
		'cron.class': 'primary'
	}); 
	continueCron ();
});
// Check Updates
gallery.on ('checkupdates', function () {
	my.get({
		url: 'backend.php',
		data: { action: 'checkupdates' },
		timeout: 60*1000, // 1m
		success: function (updates) {
			if (updates.length === 0)
				my.success (i18n.t('up_to_date'));
			else {
				var message = 'A new version of MyPhotos is available:\n';
				$.each (updates, function (id, update) {
					message += '\n- '+update;
				});
				message += '\n\nWould you like to update?';
				if (confirm (message)) {
					my.get ({
						url: 'backend.php',
						data: { action: 'update' },
						timeout: 60*1000, // 1m
						success: function () {
							my.success (i18n.t('updated'));
							setTimeout(function(){
								location.reload();
							}, 3*1000); // 3 seconds
						}
					}); 
				}
			}
		}
	});
});
// Logout
gallery.on ('logout', function () {
	my.get({
		url: 'plus.php',
		data: { action: 'revoke' },
		success: function() {
			gallery.set ('user', false);
			gallery.set ('structure', false);
			cwd ('./');
		}
	});
});

// Observers
$('#groupsModal').on('show.bs.modal', function () {
	
	cmd ([
			'lib/validation/dist/jquery.validate.min.js',
			'lib/bootstrap-table/dist/bootstrap-table.min.js'
		],[
			'lib/bootstrap-table/dist/locale/bootstrap-table-fr-FR.min.js',
			'lib/bootstrap-table/dist/extensions/editable/bootstrap-table-editable.min.js',
			'lib/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min.js'
		],
		'js/framework.js',
		'repository.js',
		function () {
			am.drawDatatable($('#users'), 'people');

			$("#addgroupform").validate({
				errorClass: 'alert-danger',
				errorPlacement: function() {},
				submitHandler: function(form) {
					gallery.push ('groups', gallery.get ('newgroup'));
					gallery.set ('newgroup', '');
				}
			});
		}
	);
	
});
gallery.on ('saveGroups', function () {
	my.get ({
		url: 'backend.php',
		data: {
			action: 'saveGroups',
			groups: gallery.get('groups'),
			users: am.getData ($('#users'))
		},
		success: function () {
			$('#groupsModal').modal('hide');
			my.success ('Groups & People saved successfuly');
		}
	});
});
/******************
* Folder Settings *
******************/
$('#folderModal').on('show.bs.modal', function () {
	cmd ([
		'lib/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
		'lib/bootstrap-datepicker/dist/locales/bootstrap-datepicker.fr.min.js',
		'lib/multiselect/js/bootstrap-multiselect.js'
	], function () {
		$('input.datepicker').datepicker({
			format: "yyyy-mm-dd",
		    weekStart: Config.week_start,
			language: /[^-]*/.exec(Config.language)[0], // fr-FR does not exist in datepicker
		    autoclose: true,
		    todayHighlight: true,
		    orientation: 'top right'
		}).on ('hide', function (e) { // fix ractive not seing datepicker updates // onchange triggers twice
			gallery.set ('folder.date', $(e.target).val()); // would be better $( ).trigger(change) but doesnt work
		}).on('show.bs.modal', function(e) {
		    e.stopPropagation(); // https://github.com/eternicode/bootstrap-datepicker/issues/978
		});
		$('input.datepicker').datepicker('update'); // update selected date when opening other folders
		$('#foldergroups').multiselect({
			onChange: function (option, checked, select) { // fix ractive not seing multiselect updates
				gallery.set('folder.groups', $('#foldergroups').val ());
			}
		});
		$('#foldergroups').multiselect('rebuild'); // if groups added during session
	});
	if (gallery.get('folder.key')) {
		gallery.set('folder.haskey', true);
	}
	gallery.set('folder.notify', false);
});
gallery.observe ('folder.notify', function (notify) {
	if (notify)
		$('#notif_email_body').val (i18n.t('notif_email_body', {
			user: gallery.get ('user.displayName'),
			name: gallery.get ('folder.name'),
			url: this.get('folder.haskey')?this.get ('getpublink')():location.href.replace(/ /g, '%20')
		}));
});
gallery.on ('togglekey', function (e) {
	if (!e.context.haskey) {
		if (!this.get('folder.key'))
			changekey ();
	} else if (!confirm ('People using the old link will no longer be able to access this album. Are you sure?')) {
		$(e.node).prop('checked', true);
		this.set ('folder.key', '');
	}
		
});
gallery.on ('changekey', function () {
	if (confirm ('People using the old link will no longer be able to access this album. Are you sure?'))
		changekey ();
});
function changekey () {
	var newkey = Math.random().toString(36).substring(2);
	gallery.set ('folder.key', newkey);
}
gallery.on ('saveFolder', function (e) {
	$('#folderModal').modal('hide');
	gallery.set ('folder.name',gallery.get ('folder.name') || i18n.t('untitled')); // TODO required
	my.get ({
		url: 'backend.php',
		timeout: 10*1000, // 10s as email sending can be slow
		data: {
			action: 'updateFolder',
			dir: gallery.get ('folder.filepath'),
			name: gallery.get('folder.name'),
			date: gallery.get('folder.date'),
			visibility: gallery.get ('folder.visibility'),
			key: gallery.get ('folder.key'),
			notify: gallery.get ('folder.notify'),
			body: $('#notif_email_body').val (),
			groups: gallery.get ('folder.groups') || false // else undefined index groups even with []
		},
		success: function () {
			my.success ('Album settings saved'+(gallery.get('folder.notify')?' and emails sent':'')+' successfuly.');
		}
	});
});

/**************
* Synchronize *
**************/
$('#cronModal').on('show.bs.modal', function (e) {
  gallery.set ('cron.mode', false);
});
gallery.observe('cron.mode', function (mode) {
	if (!mode) return;
	gallery.set ({
		'cron.class': 'primary',
		'cron.striped': true,
		//'cron.percentage': 100, // needed?
		'cron.text': 'Checking what to do...'
	});
	my.get({
	  	url: 'cron.php',
	  	data: {
	  		action: mode,
	  		folder: this.get ('folder.filepath'),
	  		output: 0 // 0: Webservice
	  	}, 
	  	timeout: 60*1000, // 1m
	  	success: function (nbtask) {
	  		gallery.set ({
	  			'cron.striped': false,
				'cron.percentage': 0,
				'cron.text': 'Execution of '+nbtask+' tasks...'
	  		});
	  		continueCron ();
	  	}
  });
}, {init: false});
function continueCron () {
	if (!$('#cronModal').data('bs.modal').isShown)
		return; // modal has been closed
	my.get ({
		url: 'cron.php',
		data: {action: 'execute', output: 0},
		timeout: 60*1000, // 1m
		success: function (status) {
			document.title = status.done+'/'+status.total+' - '+(status.remaining || 'estimating...');
			gallery.set ({
				'cron.percentage': Math.round ((status.total?status.done/status.total:1)*100),
				'cron.progress': status.done+'/'+status.total,
				'cron.remaining': status.remaining || 'estimating...',
				'cron.text': status.next
	  		});
	  		if (status.todo)
				continueCron ();
			else
				gallery.set ({
					'cron.class': 'success',
					'cron.text': 'Your photo library is up to date!'
				});
		},
		error: function (error) {
			gallery.set ({
				'cron.class': 'danger',
				'cron.text': error
			});
		}
	});
}

$('#configModal').on('show.bs.modal', function () {
	my.get({
		url: 'backend.php',
		data: {action: 'getConfig'}, // 0: Webservice
		success: function (sserver) {
			gallery.set ('server', JSON.parse (sserver));
		}
	});
});
gallery.on ('saveConfig', function () {
	$('#configModal').modal('hide');
	this.set ('client.version', this.get ('version'));
	this.set ('client.client_id', this.get ('server.client_id')); // needed for button in index.html
	my.get ({
		url: 'backend.php',
		data: {
			action: 'saveConfig',
			client: JSON.stringify (this.get ('client')), // preserves types
			server: JSON.stringify (this.get ('server'))  // preserves types
		},
		success: function () {
			my.success (i18n.t('config_saved'));
			setTimeout(function(){
				location.reload();
			}, 3*1000); // 3 seconds
		}
	});
});

/*********
* Search *
*********/
gallery.observe( 'search', function (value) {
	if (value) {
		gallery.set ('view', 'search');
		var structure = gallery.get ('structure');
		if (structure !== false) { // in cache
			my.debug ('in cache');
		} else { // not in cache
			my.debug ('not in cache');
			gallery.set ('loading', true);
			my.get ({
				url: 'backend.php',
				data: { action: 'getStructure'},
				timeout: 20*1000, // 20s in case HDD is on sleep + search time
				success: function (structure) {
					gallery.set ('structure', structure);
					gallery.set ('loading', false);
				}
			});
		}
	} else
		gallery.set ('view', 'home');
});

/*********
* See as *
*********/
gallery.observe( 'see_as', function (value, oldvalue) {
	if (value || oldvalue) // skip initial set or direct link overriden
		cwd ('./');
});

// Main functions
function cwd (hash) { // hash without the #
	var vars = hash.split ('&k='),
		dir = vars[0],
		key = vars[1];

	gallery.set ('loading', true);
	gallery.set ('search', '');
	
	if (dir == 'favorites') {
		gallery.set ('folder', {
			name: i18n.t('favorites'),
			filepath: 'favorites',
			parentpath: './',
			smart: true // smart album
		});
		gallery.set ('folders', []);
		gallery.set ('photos', getObjects ('mp_favorites'));
		document.title = i18n.t('favorites');
		gallery.set ('view', 'album');
		gallery.set ('loading', false);
	} else {
		my.log ('loading...');
		my.get ({
			url: 'backend.php',
			data: {
				action: 'list',
				dir: dir,
				key: key,
				see_as: gallery.get ('see_as')
			},
			timeout: 10*1000, // 10s in case HDD is on sleep
			success: function (smessage) {
				var message = JSON.parse (smessage);

				// Sort by updated
				message.files.sort(function compare(a,b) { return a.updated - b.updated; });

				// Humanize values
				message.folder.previewsize = message.folder.previewsize?filesize (message.folder.previewsize):'';
				message.folder.originalsize = message.folder.originalsize?filesize (message.folder.originalsize):'';
				$.each (message.files, function (i, file) {
					message.files[i].size = filesize (file.size);
					message.files[i].previewsize = filesize (file.previewsize);
				});

				gallery.set ('folder', message.folder);
				gallery.set ('folders', message.folders);
				gallery.set ('photos', message.files);

				// Set URL hash
				//window.location.hash = '#'+message.folder.filepath;

				if (message.folder.filepath == './') { // root
					document.title = 'MyPhotos';
					gallery.set ('view', 'home');
				} else { // in a directory
					document.title = message.folder.name;
					gallery.set ('view', 'album');
				}
				gallery.set ('loading', false);
			},
			error: function (message) {
				my.error (message);
				gallery.set ('view', 'home');
				gallery.set ('loading', false);
			}
		});
	}
}

function signInCallback(authResult) {
	if (authResult.code) {
		$.post('plus.php', {
			action: 'login',
			code: authResult.code,
			state: 'TODO'
		}, function( data ) {
			var user = JSON.parse(data).message;
			gallery.set ('user', user);
			ga('set', 'dimension1', user.email);
			gallery.set ('structure', false);
			if (user.isadmin) {
				my.get ({
					url: 'backend.php',
					data: { action: 'getGroups' }, // why we need to get groups now? for folder edit restricted groups
					success: function (sdata) {
						gallery.set ('groups', JSON.parse (sdata));
						/*
						var groups = JSON.parse (sdata);
						try { // Ractive crash DEBUG still needed?
							gallery.set ('groups', groups);
						} catch (err) {
							console.error ('Ractive error', err);
							location.reload();
						}
						*/
					}
				});
			}
			my.debug ('signInCallback, calling cwd after login...');
			cwd (decodeURIComponent (window.location.hash.slice(1)) || './'); // TODO cwd only if user was false before (or not admin mode)
		});
	}
}
