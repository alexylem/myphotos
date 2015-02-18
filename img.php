<?php
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');

// Settings
include_once ('config.php');

$file = $config['photopath'].$_GET['f'];

// Set content type
$types = Array(
	'1'  => 'image/gif',
    '2'  => 'image/jpeg',
    '3'  => 'image/png',
    '6'  => 'image/bmp'
);
header('Content-Type: '.$types[exif_imagetype($file)]);

// Output file content
readfile($file);
?>