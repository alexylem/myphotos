<?php
// CONFIG file for MyPhotos
// 1) Create a copy / rename to config.php
// 2) Specify below variables as per requested

$admins = array ( // comma seperated gmail adresses of admin users
	'email.address.1@gmail.com',
	'email.address.2@gmail.com'
);

$config = array (
	// Google API Client Id (https://console.developers.google.com/project)
	'client_id'			=> 'XXXXXXXXXX.apps.googleusercontent.com',
	// Google API Client secret
	'client_secret'		=> 'YYYYYYYYYY',
	// System path to original photo directory are stored (/path/to/photos/)
	'photopath'			=> '/Users/me/Pictures/',
	// Default visibility for photo albums (private, restricted, public)
	'defaultvisibility'	=> 'private',
	// Gmail email address of the sender for email notification to people
	'notif_email'		=> 'email.address@gmail.com',
	// Display name for the above account
	'notif_from'		=> 'MyPhotos',
	// Gmail password for the above account
	'notif_password'	=> 'ZZZZZZZZZZ'
);

$admin_mode = false; // true will make everyone an admin! Useful for testing/working offline
?>