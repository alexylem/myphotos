<?php
ini_set('display_errors', 1);
//header('Access-Control-Allow-Origin: *'); // only for WS

// Settings
include ('config.php');
include ('utils.php');

$file = $config['photopath'].$_GET['f'];

$filemtime = filemtime($file);
$gmt_mtime = gmdate('r', $filemtime);
header('ETag: "'.md5($filemtime.$file).'"');
header('Last-Modified: '.$gmt_mtime);
header('Cache-Control: public, max-age=31536000'); 

if(isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) || isset($_SERVER['HTTP_IF_NONE_MATCH'])) {
    if ($_SERVER['HTTP_IF_MODIFIED_SINCE'] == $gmt_mtime || str_replace('"', '', stripslashes($_SERVER['HTTP_IF_NONE_MATCH'])) == md5($filemtime.$file)) {
        header('HTTP/1.1 304 Not Modified');
        exit();
    }
}

header('Content-type: '.mime_type_from_ext ($file));
readfile($file); 
?>