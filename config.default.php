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
	// Default visibility for photo albums (private, restricted, public)
	'defaultvisibility'	=> 'private'
);

// System settings (CHANGE ONLY IF YOU KNOW WHAT YOU DO)
define ('THUMB_SIZE', 200); //px (square)
define ('MYPHOTOS_DIR', '.myphotos/'); // trailing /, has to be hidden
define ('SETTINGS_FILE', 'myphotos'); // doesn't have to be hidden
define ('THUMB_DIR', 'thumbs/'); // trailing /, doesn't have to be hidden
define ('PREVIEW_DIR', 'previews/'); // trailing /, doesn't have to be hidden
define ('PREVIEW_HEIGHT', 1080); //px, WIDTH is determined automatically
define ('IMG_QUALITY', 40); // 0 to 100
define ('BATCH_WAIT', 0.1); // secs, delay between two batch job sets
?>