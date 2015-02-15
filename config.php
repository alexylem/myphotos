<?php
$admins = array ( // email adresses of admin users
	'alexandre.mely@gmail.com',
	'nolwenn.mely@gmail.com'
);
$config = array (
	// Google API Client Id (https://console.developers.google.com/project)
	'client_id'			=> '320030776284-01dr10ur7ni4opbjgum9g266vrn29u4f.apps.googleusercontent.com',
	// Google API Client secret
	'client_secret'		=> 'nHnWoauT2Ri51upqJOzKmKi0',
	// System path to original photo directory are stored (/path/to/photos/)
	'photopath'			=> '/Users/alex/Documents/Dev Web/www/myphotos/photos/',
	// URL to the same photo directory (http://localhost/photos/)
	'photourl'			=> 'http://localhost/myphotos/photos/',
	// Name for hidden thumb directories (.thumbsdir/)
	'thumbsdir'			=> '.thumbs/',
	// Default visibility for photo albums (private, restricted, public)
	'defaultvisibility'	=> 'private'
);
?>