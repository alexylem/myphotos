my.loglevel = 2; // dev = 4, production = 2
Ractive.DEBUG = (my.loglevel >= 4);
window.___gcfg = { lang: navigator.language }; // Google sign-in in local language

// Enable localization
i18n.init({
	//lng: 'en', // to test in english
	fallbackLng: 'en',
	useLocalStorage: false, // true for Production
	getAsync: false,
	debug: (my.loglevel >= 4),
	sendMissing: true,
	missingKeyHandler: function(lng, ns, key, defaultValue, lngs) { // NOT WORKING!
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
		album_sort_options: {
			'title_asc': {
				'title': i18n.t('by_title'),
				'field': 'filename',
				'order': '<'},
			'modified_desc': {
				'title': i18n.t('newest_first'),
				'field': 'updated',
				'order': '>'},
			'modified_asc': {
				'title': i18n.t('oldest_first'),
				'field': 'updated',
				'order': '<'
		}},
		album_sort_field: 'modified_desc', // default album sort
		// Photos
		photos: [],
		photoid: false,
		showhidden: false, // don't show hidden photos by default
		// Albums
		folder: {
			name: false,
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
		// Groups
		groups: [],
		see_as: '',
		// Users
		user: false,
		users: [],
		// Synchonization
		cron: {}, // object to store info during Sychronization
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
		if (user) { // logged in
			gallery.set ('user', user);
			ga('set', '&uid', user.email); // send user id to google analytics
			if (user.isadmin) {
				my.get ({
				url: 'backend.php',
				data: { action: 'getGroups' },
				success: function (sdata) {
					var groups = JSON.parse (sdata);
					//try { // DEBUG ractive freeze
						gallery.set ('groups', groups);
					//} catch (err) {
					//	console.error ('Ractive error', err);
						//location.reload();
					//}
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

// Open Album
gallery.on ('cwd', function (event, dir) { // still needed? as now done by hash
	cwd (dir);
});
$(window).on('hashchange', function() { // change album
	cwd (decodeURIComponent (window.location.hash.slice(1)));
	ga('send', 'pageview', { // send hash to google analytics
 		'page': location.pathname + location.search  + location.hash
	});
});
/*******************
* View Photo/Video *
*******************/
gallery.on ('view', function (event, photoid) {
	my.debug ('setting photoid to', photoid);
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
// Keyboard shortcuts
$(document).keydown(function(e) {
	//my.debug ('hotkey pressed', e.keyCode);
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
    	$('#multiselect').multiselect('rebuild');
	}	
});
gallery.on ('filterpeople', function (event, group) {
	my.debug ('filtering poeple on', group);
	$('.bootstrap-table .search > input').val(group).trigger('drop');
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
			cwd ('./');
		}
	});
});

// Observers
$("#addgroupform").validate({
  errorClass: 'alert-danger',
  errorPlacement: function() {},
  submitHandler: function(form) {
    gallery.push ('groups', gallery.get ('newgroup'));
	$('#multiselect').multiselect('rebuild');
	gallery.set ('newgroup', '');
  }
});
$('#groupsModal').on('show.bs.modal', function () {
	am.drawDatatable($('#users'), 'people');
	$('#multiselect').multiselect({
		onChange: function (option, checked, select) { // fix ractive not seing multiselect updates
			gallery.set('newgroups', $('#multiselect').val ());
		}
	});
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
$('#folderModal').on('show.bs.modal', function () {
	$('#foldergroups').multiselect({
		onChange: function (option, checked, select) { // fix ractive not seing multiselect updates
			gallery.set('folder.groups', $('#foldergroups').val ());
		}
	});
	gallery.set('folder.notify', false);
	$('#notif_email_body').val (i18n.t('notif_email_body', {
		user: gallery.get ('user.displayName'),
		name: gallery.get ('folder.name'),
		url: location.href.replace(/ /g, '%20')
	}));
});
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
			visibility: gallery.get ('folder.visibility'),
			notify: gallery.get ('folder.notify'),
			body: $('#notif_email_body').val (),
			groups: gallery.get ('folder.groups') || false // else undefined index groups even with []
		},
		success: function () {
			my.success ('Album settings saved'+(gallery.get('folder.notify')?' and emails sent':'')+' successfuly.');
		}
	});
});
$('#cronModal').on('shown.bs.modal', function (e) {
  gallery.set ({
		'cron.class': 'primary',
		'cron.striped': true,
		//'cron.percentage': 100, // needed?
		'cron.text': 'Checking what to do...'
	});
  my.get({
  	url: 'cron.php',
  	data: {action: 'genthumbs', output: 0}, // 0: Webservice
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
gallery.observe( 'see_as', function (value) {
	cwd ('./');
});

// Main functions
function cwd (dir) {
	gallery.set ('loading', true);
	gallery.set ('search', '');
	my.log ('loading...');
	my.get ({
		url: 'backend.php',
		data: {
			action: 'list',
			dir: dir,
			see_as: gallery.get ('see_as')
		},
		timeout: 10*1000, // 10s in case HDD is on sleep
		success: function (smessage) {
			var message = JSON.parse (smessage);

			gallery.set ('folder', message.folder);
			gallery.set ('folders', message.folders);

			// Sort by updated
			message.files.sort(function compare(a,b) { return a.updated - b.updated; });

			// Humanize values
			$.each (message.files, function (i, file) {
				message.files[i].size = filesize (file.size);
				message.files[i].previewsize = filesize (file.previewsize);
			});

			gallery.set ('photos', message.files);

			// Set URL hash
			//window.location.hash = '#'+message.folder.filepath;

			if (message.folder.filepath !== './') { // in a directory
				document.title = message.folder.name;
				gallery.set ('view', 'album');
			} else { // root
				document.title = 'MyPhotos';
				gallery.set ('parentpath', false); // needed?
				gallery.set ('view', 'home');
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

function signInCallback(authResult) {
	if (authResult.code) {
		$.post('plus.php',
			{
				action: 'login',
				code: authResult.code,
				state: 'TODO'
			},
			function( data ) {
				var user = JSON.parse(data).message;
				gallery.set ('user', user);
				ga('set', '&uid', user.email); // send user id to google analytics
				if (user.isadmin) {
					my.get ({
						url: 'backend.php',
						data: { action: 'getGroups' },
						success: function (sdata) {
							var groups = JSON.parse (sdata);
							try { // Ractive crash DEBUG still needed?
								gallery.set ('groups', groups);
							} catch (err) {
								console.error ('Ractive error', err);
								location.reload();
							}
						}
					});
				}
				my.debug ('signInCallback, calling cwd after login...'); // TODO cwd only is user was false before
				cwd (decodeURIComponent (window.location.hash.slice(1)) || './'); // why?? this causes a refresh! apparently not anymore..
      		}
		);
	}
}

function continueCron () {
	if (!$('#cronModal').data('bs.modal').isShown)
		return; // modal has been closed
	my.get ({
		url: 'cron.php',
		data: {action: 'execute', output: 0},
		timeout: 60*1000, // 1m
		success: function (status) {
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
