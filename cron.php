<?php
session_start();
ini_set('display_errors', 1);
ini_set('memory_limit', '-1'); // http://stackoverflow.com/questions/415801/allowed-memory-size-of-33554432-bytes-exhausted-tried-to-allocate-43148176-byte
//header('Access-Control-Allow-Origin: *');
set_time_limit(0); // unlimited script time limit

$_SESSION['error'] = false;

// Settings
include ('defines.php');
include ('config.php');

if (STEPPED_DISPLAY) {
	header( 'Content-Encoding: none; ' ); // disable compression for stepped display
	ob_start(); // start output buffering
}

// Libraries
include ('lib/wideimage/WideImage.php');
include ('utils.php');

// Security check
if (!isadmin ())
	error ('Operation not authorized');

// Values
$actions = array (
	'genthumbs'	=> 'Update Library (generate settings, thumbs, cache photos)',
	'reset'		=> 'Reset (will remove all myPhotos files)' );
$outputs = array (
	4 => 'Debug',
	3 => 'Verbose',
	2 => 'Summary',
	1 => 'Errors only',
	0 => 'Webservice');

// URL Parameters
$action = isset($_REQUEST['action'])?$_REQUEST['action']:'form';
$output = isset($_REQUEST['output'])?$_REQUEST['output']:3;

switch ($action) {
	case 'reset':
	case 'genthumbs':
    	$_SESSION['tasks'] = array ();
    	$_SESSION['tasks_done'] = 0;

		prepare ($config['photopath'], ($action == 'reset'), $output);
		$_SESSION['tasks'] = array_reverse($_SESSION['tasks']); // reverse for using pop (faster than shift)
		$_SESSION['tasks_total'] = count($_SESSION['tasks']);
		
		if ($output == 0)
			respond ($_SESSION['tasks_total']);
		else
			summary ();
    	break;

    case 'execute':
    	/*
    	if (count ($_SESSION['tasks']))
    		header('refresh:0;url=cron.php?action=execute&output=$output');
    	*/
    	$remaining = remainingtime ($_SESSION['tasks_done'], $_SESSION['tasks_total']);
    	if ($output > 0) {
    		echo '<html><head><title>'.round($_SESSION['tasks_done']/$_SESSION['tasks_total']*100).'%</title></head><body><h1>Execution</h1>';
	    	echo '<pre>'.progressbar ($_SESSION['tasks_done'], $_SESSION['tasks_total']).' '.$remaining.'</pre>';
	    	myflush ();
    	}

    	manage (TASK_NB);

    	if ($_SESSION['error'])
    		error ('Process interrupted due to error');
    	if ($output == 0)
			respond (array (
				'todo' => count ($_SESSION['tasks']),
				'done' => $_SESSION['tasks_done'],
				'total' => $_SESSION['tasks_total'],
				'remaining' => $remaining
			));
    	if (count ($_SESSION['tasks'])) {
    		echo '<script>parent.window.location.reload(true);</script>';
    	}
    	echo '</body></html>';
    	myflush();
    	break;
    case 'form':
    default:
    	echo '<form method="GET" action="#">'.
    		 '<strong>Action</strong><br/>';
    	foreach ($actions as $value => $label)
    		 echo '<input id="'.$value.'" type="radio" name="action" value="'.$value.'" />'.
    		 '<label for="'.$value.'">'.$label.'</label><br />';
    	echo '<strong>Sortie</strong><br/>';
    	foreach ($outputs as $value => $label)
    		 echo '<input id="'.$value.'" type="radio" name="output" value="'.$value.'" />'.
    		 '<label for="'.$value.'">'.$label.'</label><br />';
    	echo  '<input type="submit" value="Next" />'.
    		  '</form>';
    	echo 'Process will run as '.exec('whoami');
    	break;
}

// Main functions
function prepare ($dir, $reset = false, $output = 'verbose') {
	global $config, $summary;

	debug ("entering in $dir");
	$dir = rtrim($dir, '\\/');
	debug ("trimmed dir is $dir");

	debug ('checking '.MYPHOTOS_DIR.' exists...');
	$myphotospath = $dir.'/'.MYPHOTOS_DIR;
	if (is_dir($myphotospath)) {
		debug ('ok it exists');
		if ($reset) {
			info ("will delete $myphotospath");
			addTask ('directory', 'delete', $myphotospath);
		}
	} else {
		debug ("does not exist");
		if (!$reset) {
			info ("will create $myphotospath");
			addTask ('directory', 'create', $myphotospath);
		}
	}

	debug ('checking '.THUMB_DIR.' exists...');
	$thumbspath = $dir.'/'.MYPHOTOS_DIR.THUMB_DIR;
	if (is_dir($thumbspath)) {
		debug ('ok it exists');
	} else {
		debug ("does not exist");
		if (!$reset) {
			info ("will create $thumbspath");
			addTask ('directory', 'create', $thumbspath);
		}
	}

	debug ('checking '.PREVIEW_DIR.' exists...');
	$previewspath = $dir.'/'.MYPHOTOS_DIR.PREVIEW_DIR;
	if (is_dir($previewspath)) {
		debug ('ok it exists');
	} else {
		debug ("does not exist");
		if (!$reset) {
			info ("will create $previewspath");
			addTask ('directory', 'create', $previewspath);
		}
	}

	// Scan directory
	foreach (scandir($dir) as $f) {
		if (strpos($f, '.') !== 0) {
			if (is_dir("$dir/$f")) {
				prepare("$dir/$f", $reset, $output);
			} elseif (!$reset) {
				// Read extension instead of mime type for perf
				$ext = strtolower(substr(strrchr($f, "."), 1));
				switch ($ext) {
					case 'gif':
					case 'jpg':
					case 'jpeg':
					case 'png':
					case 'bmp':
					case 'png':
						debug ("checking if thumb exists for $dir/$f");
						$thumbfile = $dir.'/'.MYPHOTOS_DIR.THUMB_DIR.$f;
						if (file_exists($thumbfile)) {
							debug ("$thumbfile already exists");
						} else {
							info ("$thumbfile does not exist, will create it");
							addTask ('thumb', 'create', "$dir/$f");
						}

						debug ("checking if preview exists for $dir/$f");
						$previewfile = $dir.'/'.MYPHOTOS_DIR.PREVIEW_DIR.$f;
						if (file_exists($previewfile)) {
							debug ("$previewfile already exists");
						} else {
							info ("$previewfile does not exist, will create it");
							addTask ('preview', 'create', "$dir/$f");
						}
						break;

					// TODO Add other supported types here
					
					default:
						warning ('Unsupported media: '.$f);
				}
			}
		}
	}
	// At the end to make sure all thumbs/previews are generated for stats
	debug ('checking '.SETTINGS_FILE.' exists...');
	$jsonpath = $dir.'/'.MYPHOTOS_DIR.SETTINGS_FILE;
	if (!$reset) {
		info ("will create $jsonpath");
		addTask ('setting', 'upsert', "$jsonpath");
	}
}

function manage ($nb) {
	global $simulate, $config;

	debug ("Will process maximum of $nb tasks");
	while ($nb-- > 0 && $task = array_pop ($_SESSION['tasks'])) {
		//debug (count ($_SESSION['tasks']).' tasks remaining after this one');
		$_SESSION['tasks_done']++;

		$file = $task['file'];
		switch ($task['type']) {

			case 'setting':
				if ($task['operation'] == 'upsert') {

					$dir = dirname(dirname($file));
					chdir($dir);
					$medias = glob('*.{jpeg,JPEG,jpg,JPG,png,PNG,gif,GIF,bmp,BMP,mov,MOV,avi,AVI}', GLOB_BRACE|GLOB_NOSORT);

					if (file_exists($file)) {
						$json = file_get_contents($file);
						$old_settings = json_decode($json);
						$new_name = isset ($old_settings->name)?$old_settings->name:basename($dir);
						$old_files = isset ($old_settings->files)?$old_settings->files:array ();
						$new_cover = $old_settings->cover;
						$new_visibility = $old_settings->visibility;
						$new_groups = isset ($old_settings->groups)?$old_settings->groups:array ();
					}
					else {
						$old_files = array ();
						$new_name = basename($dir);
						$new_cover = count($medias)?$medias[0]:false;
						$new_visibility = $config['defaultvisibility'];
						$new_groups = array ();
					}
/*
$old_files
'photo1' => [hidden => true],
'photo2' => [hidden => false, size => 12],

$medias (from glob)
'photo1'
'photo3' (added)
(photo2 removed)

$new_files
'photo1' => [hidden => true, size => 11],
'photo3' => [hidden => false, size => 13],
*/
					$new_files = array ();
					foreach ($medias as $media) {
						//print_r($old_files);
						$old_photo = isset ($old_files->{$media})?$old_files->{$media}:new stdClass();
						$new_files[$media] = array (
							'type' => strstr (mime_type_from_ext ($media), '/', true), // image/video
							'hidden' => isset($old_photo->hidden)?$old_photo->hidden:false,
							'size' => isset($old_photo->size)?$old_photo->size:filesize ($media),
							'updated' => filemtime ($media),
							'previewsize' => @filesize (MYPHOTOS_DIR.PREVIEW_DIR.$media) // if not thumbnail (ex: video for now..)
						);
					}
					$settings = array (
						'name' => $new_name,
						'files' => $new_files,
						'cover' => $new_cover,
						'visibility' => $new_visibility,
						'groups' => $new_groups
					);
					if ($simulate)
						warning ('Simulated');
					else {
						$json = fopen($file, 'w+');
						if ($json
							&& fwrite($json, json_encode($settings))
							&& fclose($json))
							success ();
						else
							error ();
					}
				}
				break;

			case 'directory':
				if ($task['operation'] == 'create') {
					ongoing ('creating '.$file);
					if ($simulate)
						warning ('Simulated');
					elseif (mkdir ($file))
						if (chmod ($file, 0777))
							success ();
						else
							error ("Couldn't change directory permissions");
					else
						error ("Couldn't create directory");
				} elseif ($task['operation'] == 'delete') {
					ongoing ('deleting '.$file);
					if ($simulate) warning ('Simulated');
					elseif (delTree ($file)) success ();
					else error ();
				}
				break;

			case 'thumb':
				//if ($task['operation'] == 'create')
				$thumbfile = dirname ($file).'/'.MYPHOTOS_DIR.THUMB_DIR.basename ($file);
				ongoing ('generating '.$thumbfile);
				if ($simulate)
					warning ('Simulated');
				elseif ($original = WideImage::loadFromFile($file)) {
					$original = $original->resize(THUMB_SIZE, THUMB_SIZE, 'outside');
					$exif = exif_read_data($file);
					if (isset ($exif['Orientation']))
						$original = $original->exifOrient($exif['Orientation']);
					$original->saveToFile($thumbfile, IMG_QUALITY);
					success ();
				} else
					error ("Unable to load $file");
				break;

			case 'preview':
				//if ($task['operation'] == 'create')
				$previewfile = dirname ($file).'/'.MYPHOTOS_DIR.PREVIEW_DIR.basename ($file);
				ongoing ('generating '.$previewfile);
				if ($simulate)
					warning ('Simulated');
				elseif ($original = WideImage::loadFromFile($file)) {
					$original->resize(null, PREVIEW_HEIGHT, 'inside', 'down');
					$exif = exif_read_data($file);
					if (isset ($exif['Orientation']))
						$original = $original->exifOrient($exif['Orientation']);
					$original->saveToFile($previewfile, IMG_QUALITY);
					success ();
				} else
					error ("Unable to load $file");
				break;

			default:
				error ('unknown task type: '.$task['type']);
		}
		debug ("Still $nb to do");
	}
}

// Helper functions
function summary () {
	echo '<h1>Summary</h1>'.
		 'There are '.$_SESSION['tasks_total']. ' tasks to be executed.';

	if ($_SESSION['tasks_total']) {
		global $output, $simulate;
		echo '<form method="GET" action="#">'.
	    		'<input type="hidden" name="action" value="execute" />'.
	    		'<input type="hidden" name="output" value="'.$output.'" />'.
	    		'<input type="submit" value="Execute" />'.
			'</form>';
	}
}

function addTask ($type, $operation, $file) {
	$_SESSION['tasks'][] = array (
		'type' => $type,
		'operation' => $operation,
		'file' => $file
	);
}
function myflush ($text = '') {
	echo $text.str_repeat(' ',1024*64); // minimum buffer size to flush data
    if (STEPPED_DISPLAY) {
    	ob_flush();
	    flush ();
	    // sleep (1); // to test stepped display
    }
}
function ongoing ($task) { 
    global $output;
	if ($output > 2) {
		echo $task.'... ';
	    myflush ();
	}
}
function debug ($message) {
	global $output;
	if ($output > 3)
    	echo '<font color="gray">'.$message.'</font><br />';
}
function info ($message) {
	global $output;
	if ($output > 2)
    	echo $message.'<br />';
}
function success ($message = 'OK') { 
	global $output;
	if ($output > 2)
    	echo '<font color="green">'.$message.'</font><br />'; 
}
function warning ($message = 'KO') {
	global $output;
	if ($output > 2)
    	echo '<font color="orange">'.$message.'</font><br />'; 
}
function error ($message = 'KO') {
	global $output;
	if ($output == 0)
		respond ($message, true);
	else
    	echo '<font color="red">'.$message.'</font><br />';
    $_SESSION['error'] = true;
    //exit ();
}
function human_filesize($bytes, $decimals = 2) {
  $sz = 'BKMGTP';
  $factor = floor((strlen($bytes) - 1) / 3);
  return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}
function delTree($dir) { 
   $files = array_diff(scandir($dir), array('.','..')); 
    foreach ($files as $file) { 
      (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file"); 
    } 
    return rmdir($dir); 
}
function remainingtime ($done, $total) {
	if ($done > 0)
		return time_elapsed (round($total*(microtime(true)-$_SESSION['pb_started_at'])/$done)).' left';
	$_SESSION['pb_started_at'] = microtime(true);
	return false;
}
function progressbar($done = 0, $total = 100, $length = 50, $theme = '[=>.]')
{
	$start = $theme[0];
	$fg    = $theme[1];
	$head  = $theme[2];
	$bg    = $theme[3];
	$end   = $theme[4];

	// Percentage of progress
	$perc = sprintf('% 3.0f%%', ($done / $total) * 100);

	// Determine position of progress bar
	$pos = floor(($done / $total) * $length);

	// Remove 'head' character if progress is >= 100%
	$head = (($done / $total) >= 1) ? $fg : $head;

	// Summary
	$sum = $done.'/'.$total;

	// Create progress bar
	return $perc.' '.$start.str_repeat($fg, $pos).$head.str_repeat($bg, $length-$pos).$end.' '.$sum;
}

class WideImage_Operation_ExifOrient
{
  /**
   * Rotates and mirrors and image properly based on current orientation value
   *
   * @param WideImage_Image $img
   * @param int $orientation
   * @return WideImage_Image
   */
  function execute($img, $orientation)
  {
    switch ($orientation) {
      case 2:
        return $img->mirror();
        break;

      case 3:
        return $img->rotate(180);
        break;

      case 4:
        return $img->rotate(180)->mirror();
        break;

      case 5:
        return $img->rotate(90)->mirror();
        break;

      case 6:
        return $img->rotate(90);
        break;

      case 7:
        return $img->rotate(-90)->mirror();
        break;

      case 8:
        return $img->rotate(-90);
        break;

      default: return $img->copy();
    }
  }
}

if (STEPPED_DISPLAY)
	ob_end_flush(); // end output buffering and flush

// Specific for myPhotos
function isadmin () {
	global $admins, $admin_mode;
	return $admin_mode || isset ($_SESSION['me']) && in_array($_SESSION['me']['email'], $admins);
}
?>