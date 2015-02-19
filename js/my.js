var tooltipopts = {
	container: 'body',
	placement: 'bottom'
};

var gallery = new Ractive({
	el: 'container',
	template: '#template',

	data: {
		// For display
		view: 'home',
		// data
		folder: {
			name: false,
			visibility: '',
			filepath: '',
			parentpath: false
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
		messages: []
	},
	//lazy: true
});

// Start
$(document).ready (function () {
	$('.addtooltip').tooltip(tooltipopts);
	$('#multiselect').multiselect({
		onChange: function (option, checked, select) { // fix ractive not seing multiselect updates
			gallery.set('newgroups', $('#multiselect').val ());
		}
	});

	my.get({
		url: 'plus.php',
		data: { action: 'init' },
		success: function (user) {
			if (user) { // logged in
				gallery.set ('user', user);
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

// Buttons
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
$("#addgroupform").validate({
  errorClass: 'alert-danger',
  errorPlacement: function() {},
  submitHandler: function(form) {
    gallery.push ('groups', gallery.get ('newgroup'));
	$('#multiselect').multiselect('rebuild');
	gallery.set ('newgroup', '');
  }
});
/*
gallery.on ('addgroup', function (event) {
	event.original.preventDefault();
	this.push ('groups', gallery.get ('newgroup'));
	$('#multiselect').multiselect('rebuild');
	this.set ('newgroup', '');
});
*/
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
/*
gallery.on ('revoke', function () {
	my.get({
		url: 'plus.php',
		data: { action: 'revoke' },
		success: function() {
			gallery.set ('user', false);
			cwd ('./');
		}
	});
});
*/

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
$('#myModal').on('hide.bs.modal', function (e) {
	changeVisibility (gallery.get ('folder.filepath'), gallery.get ('folder.visibility'));
});
$('#groupsModal').on('show.bs.modal', function () {
	my.get ({
		url: 'backend.php',
		data: {
			action: 'getGroups',
		},
		success: function (sdata) {
			var data = JSON.parse (sdata);
			gallery.set ({
				groups: data.groups,
				users: data.users
			});
			$('#multiselect').multiselect('rebuild');
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
			my.info ('Groups & People saved successfuly');
		}
	});
});

// Main functions
function cwd (dir) {
	my.log ('opening', dir);
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
				gallery.set ('folder.name', false); // needed?
				gallery.set ('folder.visibility', false); // needed?
				gallery.set ('view', 'home');
			}			
		}
	});
}

function changeVisibility (dir, visibility) {
	my.log ('changing visibility of', dir, 'to', visibility);
	my.get ({
		url: 'backend.php',
		data: {
			action: 'changeVisibility',
			dir: dir,
			visibility: visibility
		},
		success: function () {
			my.info ('Album settings saved successfuly.');
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
				gallery.set ('user', JSON.parse(data).message);
				cwd ('./');
      		}
		);
	}
}
