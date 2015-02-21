<?php
/*
	!!! MODIFICATION OU REPRODUCTION INTERDITE !!!
	L.111-1 et L.123-1 du code de la propriété intellectuelle
	En cas de demande particulière, veuillez me contacter
	Alexandre Mély - alexandre.mely@gmail.com
*/

ini_set('display_errors', 1);

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
		$absolute = $config['photopath'].$dir;
		$json = @file_get_contents($absolute.'.myphotos');
		$settings = json_decode($json);
		$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];

		if (!($dir == './' || hasaccess ($visibility)))
			respond ("You don't have access to this $visibility album", true);

		$name = @$settings->name?$settings->name:basename($dir);
		$folder = array (
			'name'			=> $name,
			'filepath'		=> $dir,
			'visibility'	=> $visibility,
			'parentpath'	=> dirname($dir).'/',
			'groups'		=> isadmin ()?@$settings->groups:[]
		);
		$folders = array ();
		$files = array ();

        if ($handle = opendir($absolute)) {
            while (false !== ($file = readdir($handle))) { 
                if ($file[0] != ".") { // skip '.', '..' & hidden files
                	$filepath = $dir.$file;
                    if (is_dir($absolute.$file)) { 
                        $json = @file_get_contents($config['photopath'].$filepath.'/.myphotos'); // in case no .myphotos yet
						$settings = @json_decode($json);
						$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];
						if (hasaccess ($visibility))
							$folders[] = array (
								'filepath'		=> $filepath.'/',
								'coverurl'		=> 'img.php?f='.$filepath.'/'.$config['thumbsdir'].@$settings->cover,
								'visibility'	=> $visibility,
								'filename'		=> @$settings->name?$settings->name:$file,
								'updated'		=> filemtime($absolute.$file)
							);
                    } else {
                        $ext = strtolower(substr(strrchr($file, "."), 1)); // mime_content_type has perf issues
                        $files[] = array (
							'filepath'	=> $filepath,
							'fileurl'	=> 'img.php?f='.$filepath,
							'thumburl'	=> 'img.php?f='.$dir.$config['thumbsdir'].$file,
							'filename'	=> $file,
							'size'		=> filesize ($absolute.$file),
							//'type'		=> $type,
							'updated'	=> filemtime ($absolute.$file)
						);
                    }
                }
            }
            closedir($handle);
        } else {
        	respond ('not possible to access directory: '.$absolute, true);
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
		$settings->groups = $_REQUEST['groups'];
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
		$json = @json_decode(file_get_contents($config['photopath'].'.groups'));
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