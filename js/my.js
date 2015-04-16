var tooltipopts = {
	container: 'body',
	placement: 'bottom',
	html: true
};

// Enable internationalization
i18n.init({
	fallbackLng: 'en',
	useLocalStorage: false, // true for Production
	getAsync: false,
	debug: true,
	sendMissing: true,
	missingKeyHandler: function(lng, ns, key, defaultValue, lngs) { // NOT WORKING!
		console.error ("Translation missing for key", key, "in language",lng);
	}
}, function (t) { // translations loaded
	// Enable tooptips
	$('.addtooltip').i18n().tooltip(tooltipopts); // need to translate title before
});

var gallery = new Ractive({
	el: 'container',
	template: '#template',
	data: {
		// i18next
		t: i18n.t,
		// For display
		view: 'loading',
		// data
		folder: {
			name: false,
			visibility: '',
			filepath: '',
			parentpath: false,
			groups: []
		},
		folders: [],
		photos: [],
		photoid: false,
		user: false,
		groups: [],
		users: [],
		userfilter: false,
		filter: function (user) {
			var userfilter = this.get('userfilter');
			my.log ('checking if', user, 'is on filter', userfilter);
			return !userfilter ||
				   $.inArray (userfilter, user.groups) > -1;
		},
		human_size: function (size) {
			return filesize(size);
		},
		cron: {
			striped: true,
			progress: 0,
			status: '',
			class: 'primary'
		}
	}
	//lazy: true
});

// Start
$(document).ready (function () {
	my.get({
		url: 'plus.php',
		data: { action: 'init' },
		success: function (user) {
			if (user) { // logged in
				gallery.set ('user', user);
				if (user.isadmin) {
					my.get ({
					url: 'backend.php',
					data: { action: 'getGroups' },
					success: function (sdata) {
						var data = JSON.parse (sdata);
						gallery.set ({
							groups: data.groups,
							users: data.users
						});
					}
				});
				}
			}
			else {
				gallery.set ('user', false);
			}
			cwd ('./');
		},
		error: function () { // is needed?
			gallery.set ('user', false);
			cwd ('./');
		}
	});
});

// Actions
gallery.on ('cwd', function (event, dir) {
	cwd (dir);
});
gallery.on ('view', function (event, photoid) {
	my.log ('setting photoid to', photoid);
	this.set ('photoid', photoid);
	this.set ('view', 'photo');
});
gallery.on ('previous', function (event) {
	this.add ('photoid', -1);
});
gallery.on ('next', function (event) {
	this.add ('photoid', 1);
});
gallery.on ('close', function (event) {
	this.set ('photoid', false);
	this.set ('view', 'album');
});
gallery.on ('hide', function (event) {
	this.set ('photos['+this.get('photodid')+'].hidden', true);
	this.set ('photoid', false);
	this.set ('view', 'album');
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
gallery.on ('removegroup', function (event, index) {
	if (confirm ('Are you sure?')) {
    	gallery.splice('groups', index, 1);
    	$('#multiselect').multiselect('rebuild');
	}	
});
gallery.on ('adduser', function (event) {
	event.original.preventDefault();
	this.push ('users', {
		name:  gallery.get ('newname'),
		email: gallery.get ('newemail'),
		groups: gallery.get ('newgroups')
	});
	this.set({ newname: '', newemail: '', newgroups: [] });
	$('#multiselect').multiselect('rebuild');
});
gallery.on ('removeuser', function (event, index) {
	if (confirm ('Are you sure?'))
    	gallery.splice('users', index, 1);
});
gallery.on ('filterpeople', function (event, group) {
	my.log ('filtering poeple on', group);
	this.set ('userfilter', group);
});
gallery.on ('ignore', function (event, group) {
	this.set ({
		'cron.status': '',
		'cron.class': 'primary'
	});
	continueCron ();
});
gallery.on ('logout', function () {
	my.get({
		url: 'plus.php',
		data: { action: 'logout' },
		success: function() {
			gallery.set ('user', false);
			cwd ('./');
		}
	});
});

// Keyboard shortcuts
$(document).keydown(function(e) {
	var photoid = gallery.get ('photoid');
	switch(e.keyCode) {
		case 27: // esc
			if (photoid !== false)
				gallery.set ('photoid', false);
				gallery.set ('view', 'album');
			break;
		case 37 : // left
			if (photoid)
				gallery.add ('photoid', -1);
			break;
		case 39 : // right
			if (photoid !== false && photoid < gallery.get ('photos').length - 1)
				gallery.add ('photoid', 1);
			break;
	}
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
	$('#multiselect').multiselect({
		onChange: function (option, checked, select) { // fix ractive not seing multiselect updates
			gallery.set('newgroups', $('#multiselect').val ());
		}
	});
});
$('#groupsModal').on('hide.bs.modal', function () {
	my.get ({
		url: 'backend.php',
		data: {
			action: 'saveGroups',
			groups: gallery.get('groups'),
			users: gallery.get('users')
		},
		success: function () {
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
});
$('#folderModal').on('hide.bs.modal', function (e) {
	my.get ({
		url: 'backend.php',
		data: {
			action: 'updateFolder',
			dir: gallery.get ('folder.filepath'),
			visibility: gallery.get ('folder.visibility'),
			groups: gallery.get ('folder.groups') || false // else undefined index groups even with []
		},
		success: function () {
			my.success ('Album settings saved successfuly.');
		}
	});
});
$('#cronModal').on('shown.bs.modal', function (e) {
  gallery.set ({
		'cron.class': 'primary',
		'cron.striped': true,
		'cron.progress': 100,
		'cron.status': 'Checking what to do...'
	});
  my.get({
  	url: 'cron.php',
  	data: {action: 'genthumbs', output: 0}, // 0: Webservice
  	success: function (nbtask) {
  		gallery.set ({
  			'cron.striped': false,
			'cron.progress': 0,
			'cron.status': 'Execution of '+nbtask+' tasks...'
  		});
  		continueCron ();
  	}
  });
});

// Main functions
function cwd (dir) {
	gallery.set ('view', 'loading');
	my.log ('loading...');
	my.get ({
		url: 'backend.php',
		data: {
			action: 'list',
			dir: dir
		},
		success: function (smessage) {
			var message = JSON.parse (smessage);

			gallery.set ('folder', message.folder);
			gallery.set ('folders', message.folders);
			gallery.set ('photos', message.files);

			if (message.folder.filepath !== './') { // in a directory
				gallery.set ('view', 'album');
			} else { // root
				gallery.set ('parentpath', false);
				gallery.set ('view', 'home');
			}
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
				if (user.isadmin) {
					my.get ({
						url: 'backend.php',
						data: { action: 'getGroups' },
						success: function (sdata) {
							var data = JSON.parse (sdata);
							gallery.set ({
								groups: data.groups,
								users: data.users
							});
						}
					});
				}
				cwd ('./');
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
				'cron.progress': Math.round ((status.total?status.done/status.total:1)*100),
				'cron.status': status.done+'/'+status.total+' completed - '+status.remaining
	  		});
	  		if (status.todo)
				continueCron ();
			else
				gallery.set ({
					'cron.class': 'success',
					'cron.status': 'Your photo library is up to date!'
				});
		},
		error: function (error) {
			gallery.set ({
				'cron.class': 'danger',
				'cron.status': error
			});
		}
	});
}
