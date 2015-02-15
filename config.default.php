<?php
// CONFIG file for MyPhotos
// 1) Create a copy / rename to config.php
// 2) Specify config variable as per requested

$admins = array ( // comma seperated email adresses of admin users
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
	// Name for hidden thumb directories (.thumbsdir/)
	'thumbsdir'			=> '.thumbs/',
	// Default visibility for photo albums (private, restricted, public)
	'defaultvisibility'	=> 'private'
);
?>