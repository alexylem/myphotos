<?php
// Fonction pour la construction du message de retour
function respond ($message = '', $iserror = false) {
	exit (json_encode (array ('error' => $iserror, 'message' => $message)));
}

// Fonction exécuter
function execute ($command, &$iserror = false, $sep = PHP_EOL) {
    exec($command.' 2>&1', $output, $iserror);
    if ($sep)
        return implode ($sep, $output);
    return $output;
}

function time_elapsed ($secs){
	$ret = array ();
    $bit = array(
    	'y' => $secs / 31556926 % 12,
    	'w' => $secs / 604800 % 52,
    	'd' => $secs / 86400 % 7,
    	'h' => $secs / 3600 % 24,
    	'm' => $secs / 60 % 60,
    	's' => $secs % 60
       );
	foreach($bit as $k => $v)
		if($v > 0)
            $ret[] = $v.$k;
	return join(' ', $ret);
}

function mime_type_from_ext ($file) {
	// MIME types array
	$mimeTypes = array(
		"323"	   => "text/h323",
		"acx"	   => "application/internet-property-stream",
		"ai"		=> "application/postscript",
		"aif"	   => "audio/x-aiff",
		"aifc"	  => "audio/x-aiff",
		"aiff"	  => "audio/x-aiff",
		"asf"	   => "video/x-ms-asf",
		"asr"	   => "video/x-ms-asf",
		"asx"	   => "video/x-ms-asf",
		"au"		=> "audio/basic",
		"avi"	   => "video/x-msvideo",
		"axs"	   => "application/olescript",
		"bas"	   => "text/plain",
		"bcpio"	 => "application/x-bcpio",
		"bin"	   => "application/octet-stream",
		"bmp"	   => "image/bmp",
		"c"		 => "text/plain",
		"cat"	   => "application/vnd.ms-pkiseccat",
		"cdf"	   => "application/x-cdf",
		"cer"	   => "application/x-x509-ca-cert",
		"class"	 => "application/octet-stream",
		"clp"	   => "application/x-msclip",
		"cmx"	   => "image/x-cmx",
		"cod"	   => "image/cis-cod",
		"cpio"	  => "application/x-cpio",
		"crd"	   => "application/x-mscardfile",
		"crl"	   => "application/pkix-crl",
		"crt"	   => "application/x-x509-ca-cert",
		"csh"	   => "application/x-csh",
		"css"	   => "text/css",
		"dcr"	   => "application/x-director",
		"der"	   => "application/x-x509-ca-cert",
		"dir"	   => "application/x-director",
		"dll"	   => "application/x-msdownload",
		"dms"	   => "application/octet-stream",
		"doc"	   => "application/msword",
		"dot"	   => "application/msword",
		"dvi"	   => "application/x-dvi",
		"dxr"	   => "application/x-director",
		"eps"	   => "application/postscript",
		"etx"	   => "text/x-setext",
		"evy"	   => "application/envoy",
		"exe"	   => "application/octet-stream",
		"fif"	   => "application/fractals",
		"flr"	   => "x-world/x-vrml",
		"gif"	   => "image/gif",
		"gtar"	  => "application/x-gtar",
		"gz"		=> "application/x-gzip",
		"h"		 => "text/plain",
		"hdf"	   => "application/x-hdf",
		"hlp"	   => "application/winhlp",
		"hqx"	   => "application/mac-binhex40",
		"hta"	   => "application/hta",
		"htc"	   => "text/x-component",
		"htm"	   => "text/html",
		"html"	  => "text/html",
		"htt"	   => "text/webviewhtml",
		"ico"	   => "image/x-icon",
		"ief"	   => "image/ief",
		"iii"	   => "application/x-iphone",
		"ins"	   => "application/x-internet-signup",
		"isp"	   => "application/x-internet-signup",
		"jfif"	  => "image/pipeg",
		"jpe"	   => "image/jpeg",
		"jpeg"	  => "image/jpeg",
		"jpg"	   => "image/jpeg",
		"js"		=> "application/x-javascript",
		"latex"	 => "application/x-latex",
		"lha"	   => "application/octet-stream",
		"lsf"	   => "video/x-la-asf",
		"lsx"	   => "video/x-la-asf",
		"lzh"	   => "application/octet-stream",
		"m13"	   => "application/x-msmediaview",
		"m14"	   => "application/x-msmediaview",
		"m3u"	   => "audio/x-mpegurl",
		"man"	   => "application/x-troff-man",
		"mdb"	   => "application/x-msaccess",
		"me"		=> "application/x-troff-me",
		"mht"	   => "message/rfc822",
		"mhtml"	 => "message/rfc822",
		"mid"	   => "audio/mid",
		"mny"	   => "application/x-msmoney",
		"mov"	   => "video/quicktime",
		"movie"	 => "video/x-sgi-movie",
		"mp2"	   => "video/mpeg",
		"mp3"	   => "audio/mpeg",
		"mpa"	   => "video/mpeg",
		"mpe"	   => "video/mpeg",
		"mpeg"	  => "video/mpeg",
		"mpg"	   => "video/mpeg",
		"mpp"	   => "application/vnd.ms-project",
		"mpv2"	  => "video/mpeg",
		"ms"		=> "application/x-troff-ms",
		"mvb"	   => "application/x-msmediaview",
		"nws"	   => "message/rfc822",
		"oda"	   => "application/oda",
		"p10"	   => "application/pkcs10",
		"p12"	   => "application/x-pkcs12",
		"p7b"	   => "application/x-pkcs7-certificates",
		"p7c"	   => "application/x-pkcs7-mime",
		"p7m"	   => "application/x-pkcs7-mime",
		"p7r"	   => "application/x-pkcs7-certreqresp",
		"p7s"	   => "application/x-pkcs7-signature",
		"pbm"	   => "image/x-portable-bitmap",
		"pdf"	   => "application/pdf",
		"pfx"	   => "application/x-pkcs12",
		"pgm"	   => "image/x-portable-graymap",
		"pko"	   => "application/ynd.ms-pkipko",
		"pma"	   => "application/x-perfmon",
		"pmc"	   => "application/x-perfmon",
		"pml"	   => "application/x-perfmon",
		"pmr"	   => "application/x-perfmon",
		"pmw"	   => "application/x-perfmon",
		"png"		=> "image/png",
		"pnm"	   => "image/x-portable-anymap",
		"pot"	   => "application/vnd.ms-powerpoint",
		"ppm"	   => "image/x-portable-pixmap",
		"pps"	   => "application/vnd.ms-powerpoint",
		"ppt"	   => "application/vnd.ms-powerpoint",
		"prf"	   => "application/pics-rules",
		"ps"		=> "application/postscript",
		"pub"	   => "application/x-mspublisher",
		"qt"		=> "video/quicktime",
		"ra"		=> "audio/x-pn-realaudio",
		"ram"	   => "audio/x-pn-realaudio",
		"ras"	   => "image/x-cmu-raster",
		"rgb"	   => "image/x-rgb",
		"rmi"	   => "audio/mid",
		"roff"	  => "application/x-troff",
		"rtf"	   => "application/rtf",
		"rtx"	   => "text/richtext",
		"scd"	   => "application/x-msschedule",
		"sct"	   => "text/scriptlet",
		"setpay"	=> "application/set-payment-initiation",
		"setreg"	=> "application/set-registration-initiation",
		"sh"		=> "application/x-sh",
		"shar"	  => "application/x-shar",
		"sit"	   => "application/x-stuffit",
		"snd"	   => "audio/basic",
		"spc"	   => "application/x-pkcs7-certificates",
		"spl"	   => "application/futuresplash",
		"src"	   => "application/x-wais-source",
		"sst"	   => "application/vnd.ms-pkicertstore",
		"stl"	   => "application/vnd.ms-pkistl",
		"stm"	   => "text/html",
		"svg"	   => "image/svg+xml",
		"sv4cpio"   => "application/x-sv4cpio",
		"sv4crc"	=> "application/x-sv4crc",
		"t"		 => "application/x-troff",
		"tar"	   => "application/x-tar",
		"tcl"	   => "application/x-tcl",
		"tex"	   => "application/x-tex",
		"texi"	  => "application/x-texinfo",
		"texinfo"   => "application/x-texinfo",
		"tgz"	   => "application/x-compressed",
		"tif"	   => "image/tiff",
		"tiff"	  => "image/tiff",
		"tr"		=> "application/x-troff",
		"trm"	   => "application/x-msterminal",
		"tsv"	   => "text/tab-separated-values",
		"txt"	   => "text/plain",
		"uls"	   => "text/iuls",
		"ustar"	 => "application/x-ustar",
		"vcf"	   => "text/x-vcard",
		"vrml"	  => "x-world/x-vrml",
		"wav"	   => "audio/x-wav",
		"wcm"	   => "application/vnd.ms-works",
		"wdb"	   => "application/vnd.ms-works",
		"wks"	   => "application/vnd.ms-works",
		"wmf"	   => "application/x-msmetafile",
		"wps"	   => "application/vnd.ms-works",
		"wri"	   => "application/x-mswrite",
		"wrl"	   => "x-world/x-vrml",
		"wrz"	   => "x-world/x-vrml",
		"xaf"	   => "x-world/x-vrml",
		"xbm"	   => "image/x-xbitmap",
		"xla"	   => "application/vnd.ms-excel",
		"xlc"	   => "application/vnd.ms-excel",
		"xlm"	   => "application/vnd.ms-excel",
		"xls"	   => "application/vnd.ms-excel",
		"xlsx"	  => "vnd.ms-excel",
		"xlt"	   => "application/vnd.ms-excel",
		"xlw"	   => "application/vnd.ms-excel",
		"xof"	   => "x-world/x-vrml",
		"xpm"	   => "image/x-xpixmap",
		"xwd"	   => "image/x-xwindowdump",
		"z"		 => "application/x-compress",
		"zip"	   => "application/zip"
       );
	$ext = strtolower(substr(strrchr($file, "."), 1));
		return $mimeTypes[$ext]; // return the array value
}

// function to create zip archives
// usages: 
// myZip ('/home/domotiqul/www/', 'backups/backup.zip', ['/home/domotiqul/www/backups/'])
// myZip (['/media/NAS/Pictures/pic1.jpg','/media/NAS/Pictures/pic2.jpg'], '/media/NAS/Pictures/album.zip')
function myZip ($fs_source, $zipfile, $ignore_dirs = array ()) {
	$zip = new ZipArchive();
	if (!$zip->open($zipfile, ZipArchive::CREATE))
		respond ("Error while creating $zipfile", true);
	if (is_array($fs_source)) {
		foreach ($fs_source as $absolute)
			if (!$zip->addFile ($absolute, basename ($absolute)))
	            respond ("Error while adding $absolute to zip archive", true);
	} else {
		$iter = new RecursiveDirectoryIterator($fs_source);
		$iter->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
		$files = new RecursiveIteratorIterator($iter, RecursiveIteratorIterator::SELF_FIRST);
		foreach ($files as $absolute => $finfo) {
		    if (in_array_beginning_with ($absolute, $ignore_dirs))
		        continue;
		    $relative = str_replace ($fs_source, '', $absolute);
		    $filename = $finfo->getFilename ();
		    if ($finfo->isDir ())
		        $zip->addEmptyDir ($relative);
		    elseif (!$zip->addFile ($absolute, $relative))
		        respond ("Error while adding $absolute to zip archive", true);
		}
	}
	$numFiles = $zip->numFiles;
	if (!$zip->close())
	    respond ('Error while closing the zip archive', true);
	return true;
}

?>