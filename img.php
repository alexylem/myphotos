<?php

$file = '/Users/alex/Documents/photo.jpg';
$type = 'image/jpeg';
header('Content-Type:'.$type);
readfile($file);
exit;

?>