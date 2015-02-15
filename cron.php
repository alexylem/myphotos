<?php
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');
set_time_limit(0); // unlimited script time limit
header( 'Content-Encoding: none; ' ); // disable compression for stepped display
ob_start(); // start output buffering

// Settings
include ('config.php');
include ('lib/wideimage/WideImage.php');

// Values
$actions = array (
	'genthumbs'	=> 'Generate Thumbs',
	'reset'		=> 'Delete Thumbs' );
$outputs = array (
	4 => 'Debug',
	3 => 'Verbose',
	2 => 'Summary',
	1 => 'Errors only' );

// URL Parameters
$action = isset($_REQUEST['action'])?$_REQUEST['action']:'form';
$output = isset($_REQUEST['output'])?$_REQUEST['output']:3;
$simulate = isset($_REQUEST['simulate']);

switch ($action) {
	case 'reset':
		genThumbs ($config['photopath'], $config['thumbsdir'], true, $output, $simulate);
		break;
    case 'genthumbs':
		genThumbs ($config['photopath'], $config['thumbsdir'], false, $output, $simulate);
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
    	echo  '<strong>Options</strong><br/>'.
    		  '<label><input type="checkbox" name="simulate" value="true" checked>Simulate</label><br />'.
    		  '<input type="submit" value="Go" />'.
    		  '</form>';
    	break;
}

// Main functions
function genThumbs ($dir, $thumbsdir, $reset = false, $output = 'verbose', $simulate = false) {
	global $config;

	debug ("entering in $dir");
	$dir = rtrim($dir, '\\/');
	debug ("trimmed dir is $dir");

	debug ("checking .thumbs/ exists...");
	$thumbspath = $dir.'/'.$thumbsdir;
	if (is_dir($thumbspath)) {
		debug ('ok it exists');
		if ($reset) {
			ongoing ("deleting $thumbspath");
			if ($simulate) warning ('Simulated');
			elseif (delTree ($thumbspath)) success ();
			else error ();
		}
	} else {
		debug ("does not exist");
		if (!$reset) {
			ongoing ("creating $thumbspath");
			if ($simulate) warning ('Simulated');
			elseif (mkdir ($thumbspath)) success ();
			else error ();
		}
	}

	debug ("checking .myphotos exists...");
	$jsonpath = $dir.'/.myphotos';
	if (file_exists ($jsonpath)) {
		debug ('ok it exists');
		if ($reset) {
			ongoing ("deleting $jsonpath");
			if ($simulate) warning ('Simulated');
			elseif (unlink ($jsonpath)) success ();
			else error ();
		}
	} else {
		debug ("does not exist");
		if (!$reset) {
			debug ('searching for album default cover in thumbs');
			
			$photos = glob($thumbspath . "{*.jpeg,*.jpg,*.png,*.gif,*.bmp}", GLOB_BRACE|GLOB_NOSORT);
			$cover = '';
			if (count($photos)) {
				$cover = basename ($photos[0]);
				debug ("found $cover");
			} else
				warning ('no cover found');
			
			$settings = array (
				'cover' => $cover,
				'visibility' => $config['defaultvisibility']
			);
			
			ongoing ("creating $jsonpath");
			if ($simulate) warning ('Simulated');
			
			else {
				$json = fopen($jsonpath, 'w+');
				if ($json
					&& fwrite($json, json_encode($settings))
					&& fclose($json))
					success ();
				else
					error ();
			}
		}
	}
	
	foreach (scandir($dir) as $f) {
		if (strpos($f, '.') !== 0) {
			if (is_dir("$dir/$f")) {
				genThumbs("$dir/$f", $thumbsdir, $reset, $output, $simulate);
			} elseif (!$reset) {
				if (in_array (strtolower(substr($f, strrpos($f, '.') + 1)), array ('jpeg', 'jpg', 'png', 'gif', 'bmp'))) {
					debug ("checking if thumb exists for $dir/$f");
					$thumbfile = $dir.'/'.$thumbsdir.$f;
					if (file_exists($thumbfile)) {
						debug ("$thumbfile already exists");
					} else {
						ongoing ("$thumbfile does not exist, creating it");
						if ($simulate)
							warning ('Simulated');
						else {
							$original = WideImage::loadFromFile("$dir/$f");
							$thumb = $original->resize(200, 200, 'outside');
							$thumb->saveToFile($thumbfile);
							success ();
						}
					}
				}
				else
					warning ("$f is not an image");
			}
		}
	}
}


// Helper functions
function ongoing ($task) { 
    global $output;
	if ($output > 2) {
		echo $task.'... ';
	    echo str_repeat(' ',1024*64); // minimum buffer size to flush data
	    ob_flush();
	    flush ();
	    // sleep (1); // to test stepped display
	}
}
function debug ($message) {
	global $output;
	if ($output > 3)
    	echo '<pre>'.$message.'</pre>';
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
    echo '<font color="red">'.$message.'</font><br />';
    exit ();
}
function attempt ($function, $simulate = false) {
	if ($simulate)
		warning ('Simulated');
	else
		if ($function())
			success ();
		else
			error ();
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

ob_end_flush(); // end output buffering and flush
?>