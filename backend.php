<?php
/*
	!!! MODIFICATION OU REPRODUCTION INTERDITE !!!
	L.111-1 et L.123-1 du code de la propriété intellectuelle
	En cas de demande particulière, veuillez me contacter
	Alexandre Mély - alexandre.mely@gmail.com
*/

ini_set('display_errors', 1);

// Settings
include_once ('defines.php');
include_once ('config.php');
include_once ('utils.php');

ini_set('session.gc_maxlifetime', SESSION_DURATION); // server side min validity
session_set_cookie_params(SESSION_DURATION); // client side duration
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
		if (!file_exists($absolute.MYPHOTOS_DIR.SETTINGS_FILE))
			respond ('Missing folder settings. Please update your Library.', true);
		
		$json = file_get_contents($absolute.MYPHOTOS_DIR.SETTINGS_FILE);
		$settings = json_decode($json);
		$visibility = isset ($settings->visibility)?$settings->visibility:$config['defaultvisibility'];
		
		if (!($dir == './' || hasaccess ($visibility, @$settings->groups)))
			respond ("You don't have access to this $visibility album. Please log back in.", true);

		$folder = array (
			'name'			=> isset($settings->name)?$settings->name:basename($dir),
			'filepath'		=> $dir, 
			'visibility'	=> $visibility,
			'parentpath'	=> dirname($dir).'/',
			'groups'		=> isadmin ()?@$settings->groups:[]
		);
		
		$files = array ();
		if (count ($settings->files))
		foreach ($settings->files as $filename => $fileinfo) {
			if (!isadmin() && $fileinfo->hidden)
				continue;
			$file = array (
				'filepath'		=> $dir.$filename,
				'filename'		=> $filename,
				'type'			=> $fileinfo->type,
				'hidden'		=> $fileinfo->hidden,
				'updated'		=> $fileinfo->updated,
				'fileurl'		=> 'img.php?f='.$dir.$filename,
				'size'			=> $fileinfo->size,
				'previewsize'	=> $fileinfo->previewsize
			);
			if ($fileinfo->type == 'video' &&
				preg_match (YOUTUBEID_REGEX, $filename, $matches)) {
					$youtubeid = $matches[1];
					$file['thumburl'] = str_replace (YOUTUBEID, $youtubeid, YOUTUBE_THUMB);
					$file['previewurl'] = str_replace (YOUTUBEID, $youtubeid, YOUTUBE_PLAYER);
				}
			else { // image
				$file['thumburl'] = 'img.php?f='.$dir.MYPHOTOS_DIR.THUMB_DIR.$filename;
				$file['previewurl'] = 'img.php?f='.$dir.MYPHOTOS_DIR.PREVIEW_DIR.$filename;
			}
			$files[] = $file;
		}

		chdir($absolute);
		$folders = array ();
		foreach (glob ('*', GLOB_ONLYDIR|GLOB_MARK) as $directory) {
			$folderpath = $dir.$directory; // already has trailing '/'
            $json = @file_get_contents($config['photopath'].$folderpath.MYPHOTOS_DIR.SETTINGS_FILE); // in case no .myphotos yet
			$settings = @json_decode($json);
			$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];
			if (hasaccess ($visibility, @$settings->groups))
				$folders[] = array (
					'filepath'		=> $folderpath,
					'coverurl'		=> 'img.php?f='.$folderpath.MYPHOTOS_DIR.THUMB_DIR.@$settings->cover,
					'visibility'	=> $visibility,
					'filename'		=> @$settings->name?$settings->name:$directory,
					'updated'		=> filemtime($absolute.$directory)
				);
		}

		respond (json_encode(array (
			'folder'	=> $folder,
			'folders'	=> $folders,
			'files'		=> $files
		)));
		break;

	case 'getStructure':
		function getStructure ($path='') {
			global $config;
			$folders = array ();
			foreach (glob ($path.'*', GLOB_MARK|GLOB_ONLYDIR|GLOB_NOSORT) as $folderpath) {
				$json = @file_get_contents($config['photopath'].$folderpath.MYPHOTOS_DIR.SETTINGS_FILE);
				$settings = @json_decode($json);
				$visibility = @$settings->visibility?:$config['defaultvisibility'];
				$folders = array_merge ($folders,
					array (array (
						'filepath'		=> $folderpath,
						'coverurl'		=> 'img.php?f='.$folderpath.MYPHOTOS_DIR.THUMB_DIR.@$settings->cover,
						'visibility'	=> $visibility,
						'filename'		=> @$settings->name?$settings->name:basename ($folderpath),
						'updated'		=> filemtime($config['photopath'].$folderpath)
					)), getStructure($folderpath));
			}
			return $folders;
		}
		
		if (!isset ($_SESSION['structure'])) {
			chdir($config['photopath']);
			$_SESSION['structure'] = getStructure ();
		}

		respond ($_SESSION['structure']);
		break;

	case 'updateFolder':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$jsonpath = $config['photopath'].$dir.MYPHOTOS_DIR.SETTINGS_FILE;
		$json = file_get_contents($jsonpath);
		$settings = json_decode($json, true);
		if (isset ($_REQUEST['name']))
			$settings['name'] = $_REQUEST['name'];
		if (isset ($_REQUEST['cover']))
			$settings['cover'] = $_REQUEST['cover'];
		if (isset ($_REQUEST['visibility']))
			$settings['visibility'] = $_REQUEST['visibility'];
		if (isset ($_REQUEST['groups']))
			$settings['groups'] = $_REQUEST['groups'];
		if (isset ($_REQUEST['filename'])) {
			if (isset ($_REQUEST['hidden']))
				$settings['files'][$_REQUEST['filename']]['hidden'] = ($_REQUEST['hidden'] == 'true');
		}
		if (($json = fopen($jsonpath, 'w'))
			&& fwrite($json, json_encode($settings))
			&& fclose($json)) {
			
			if (isset ($_REQUEST['notify']) // not set for set cover for example
				&& $_REQUEST['notify'] == 'true') {
				require 'lib/PHPMailer/PHPMailerAutoload.php';

				$mail = new PHPMailer;
				$mail->isSMTP();
				$mail->Host = 'smtp.gmail.com';
				$mail->Port = 587;
				$mail->SMTPSecure = 'tls';
				$mail->SMTPAuth = true;
				$mail->Username = $config['notif_email'];
				$mail->Password = $config['notif_password'];
				$mail->setFrom($config['notif_email'], $config['notif_from']);
				
				$emails = emailsInGroups ($_REQUEST['groups']);
				$emails = array_merge($emails, $admins); // add admins in bcc
				if (count ($emails))
					foreach ($emails as $email)
						$mail->addBCC($email);
				
				$mail->CharSet = 'UTF-8';
				$mail->Subject = 'MyPhotos'; // Define?
				$mail->Body = $_REQUEST['body'];
				// $mail->addAttachment('images/phpmailer_mini.png'); // TODO album cover?
				if (!$mail->send())
					respond ("Mailer Error: " . $mail->ErrorInfo, true);
			}
			respond ();
		} else
			respond ('Error while trying to write the folder settings file', true);
		break;

	case 'getGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$json = file_get_contents($config['photopath'].MYPHOTOS_DIR.'groups.json');
		respond ($json?$json:[]);
		break;

	case 'getPeople':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$json = file_get_contents($config['photopath'].MYPHOTOS_DIR.'people.json');
		exit ($json?$json:[]);
		break;
		
	case 'saveGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		// saving groups
		if (($json = fopen($config['photopath'].MYPHOTOS_DIR.'groups.json', 'w+'))
			&& fwrite($json, json_encode($_REQUEST['groups']))
			&& fclose($json)
			&& ($json = fopen($config['photopath'].MYPHOTOS_DIR.'people.json', 'w+'))
			&& fwrite($json, json_encode($_REQUEST['users']))
			&& fclose($json))
			respond ();
		else
			respond ('Error while writing groups & people files', true);
		break;

	case 'checkupdates':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$message = execute(GIT_CHECK, $iserror, false);
		respond ($message, $iserror);
		break;

	case 'update':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$message = execute(GIT_PULL, $iserror, '<br/>');
		respond ($message, $iserror);
		break;

	default: respond ("unknown action ".$_REQUEST['action'], true);
}

function emailsInGroups ($groups) {
	global $config;
	$emails = array ();
	if (($json = @file_get_contents($config['photopath'].MYPHOTOS_DIR.'people.json'))
		&& ($users = json_decode($json))
		&& count ($users))
		foreach ($users as $user)
			if (count (array_intersect($groups, $user->groups))
				&& !in_array($user->email, $emails))
				$emails[] = $user->email;
	return $emails;
}

function hasaccess ($visibility, $groups) {
	if ($visibility == 'public' || isadmin ())
		return true;
	if ($visibility == 'restricted') {
		if (!isset ($_SESSION['me']) || !is_array($groups))
			return false;
		if (!isset ($_SESSION['groups'])) {
			global $config;
			$_SESSION['groups'] = array ();
			$json = @file_get_contents($config['photopath'].MYPHOTOS_DIR.'people.json');
			if ($users = json_decode($json))
			    foreach ($users as $user)
					if ($user->email == $_SESSION['me']['email']) {
			        	$_SESSION['groups'] = $user->groups;
						break;
			    	}
		}
		return count (array_intersect($groups, $_SESSION['groups']));
	}
	return false;
}

// Specific for myPhotos
function isadmin () {
	global $admins, $admin_mode;
	return $admin_mode || isset ($_SESSION['me']) && in_array($_SESSION['me']['email'], $admins);
}
?>