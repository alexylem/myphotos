<?php
/*
	!!! MODIFICATION OU REPRODUCTION INTERDITE !!!
	L.111-1 et L.123-1 du code de la propriété intellectuelle
	En cas de demande particulière, veuillez me contacter
	Alexandre Mély - alexandre.mely@gmail.com
*/

ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');

// Settings
include_once ('config.php');
include_once ('utils.php');

session_start();

if (!isset($_REQUEST['action']))
	respond ('missing action parameter', true);
$dir = isset ($_REQUEST['dir'])?$_REQUEST['dir']:'';

switch($_REQUEST['action']) {
	case 'test':
		respond ('ok');
		break;

	case 'list':
		$json = @file_get_contents($config['photopath'].$dir.'.myphotos');
		$settings = json_decode($json);
		$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];

		if (!($dir == './' || hasaccess ($visibility)))
			respond ("You don't have access to this $visibility album", true);

		$name = @$settings->name?$settings->name:basename($dir);
		$folder = array (
			'name'			=> $name,
			'filepath'		=> $dir,
			'visibility'	=> $visibility,
			'parentpath'	=> dirname($dir).'/'
		);
		$folders = array ();
		$files = array ();
		foreach (new DirectoryIterator($config['photopath'].$dir) as $file) {
			if (substr($file->getFilename(),0,1) == '.')
				continue; // ignore . .. & hidden files
			if ($file->getType() == "dir") {
				// get json
				$filepath = $dir.$file->getFilename().'/';
				$json = @file_get_contents($config['photopath'].$filepath.'.myphotos');
				$settings = json_decode($json);
				$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];
				if (hasaccess ($visibility))
					$folders[] = array (
						'filepath'		=> $filepath,
						'coverurl'		=> 'img.php?f='.$filepath.$config['thumbsdir'].@$settings->cover,
						'visibility'	=> @$settings->visibility,
						'filename'		=> $file->getFilename(),
						'updated'		=> $file->getMTime()
					);
			} else {
				$type = mime_content_type($file->getRealPath());
				if (explode ('/', $type)[0] == 'image')
					$files[] = array (
						'filepath'	=> $dir.$file->getFilename(),
						'fileurl'	=> 'img.php?f='.$dir.$file->getFilename(),
						'thumburl'	=> 'img.php?f='.$dir.$config['thumbsdir'].$file->getFilename(),
						'filename'	=> $file->getFilename(),
						'size'		=> $file->getSize(),
						'type'		=> $type,
						'updated'	=> $file->getMTime()
					);
			}
		}
		respond (json_encode(array (
			'folder'	=> $folder,
			'folders'	=> $folders,
			'files'		=> $files
		)));
		break;
	case 'changeVisibility':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$jsonpath = $config['photopath'].$dir.'.myphotos';
		$json = file_get_contents($jsonpath);
		$settings = json_decode($json);
		$settings->visibility = $_REQUEST['visibility'];
		$json = fopen($jsonpath, 'w');
		if ($json
			&& fwrite($json, json_encode($settings))
			&& fclose($json))
			respond ();
		else
			respond ('Error while trying to write the folder settings file', true);
		break;

	case 'getGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$json = json_decode(file_get_contents($config['photopath'].'.groups'));
		respond (json_encode(array (
			'groups' => @$json->groups?$json->groups:[],
			'users'  => @$json->users?$json->users:[]
		)));
		break;

	case 'saveGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$jsonpath = $config['photopath'].'.groups';
		$json = fopen($jsonpath, 'w+');
		if ($json
			&& fwrite($json, json_encode(array (
				'groups' => isset ($_REQUEST['groups'])?$_REQUEST['groups']:[],
				'users' => isset ($_REQUEST['users'])?$_REQUEST['users']:[])))
			&& fclose($json))
			respond ();
		else
			respond ('Error while trying to write the groups file', true);
		break;

	default: respond ("unknown action ".$_REQUEST['action'], true);
}

function hasaccess ($visibility) {
	if ($visibility == 'public')
		return true;
	if ($visibility == 'restricted') {
		// todo
	}
	return isadmin ();
}

function isadmin () {
	global $admins;
	return isset ($_SESSION['me']) && in_array($_SESSION['me']['email'], $admins);
}
?>