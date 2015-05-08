<?php
// System settings (CHANGE ONLY IF YOU KNOW WHAT YOU DO)
// Caution: is replaced at each MyPhoto Update - backup your own

// Authentication
define ('SESSION_DURATION', 3600); // secs

// Internal directories
define ('MYPHOTOS_DIR', '.myphotos/'); // trailing /, has to be hidden
define ('SETTINGS_FILE', 'myphotos'); // doesn't have to be hidden
define ('THUMB_DIR', 'thumbs/'); // trailing /, doesn't have to be hidden
define ('PREVIEW_DIR', 'previews/'); // trailing / doesn't have to be hidden

// Image settings
define ('IMG_QUALITY', 40); // 0 to 100
define ('THUMB_SIZE', 200); // px (square)
define ('PREVIEW_HEIGHT', 1080); // px, WIDTH is determined automatically

// Video settings
define ('YOUTUBEID_REGEX', '/\((.*)\)/'); // format: filename (YOUTUBEID).avi
define ('YOUTUBEID', '[youtubeid]');
define ('YOUTUBE_THUMB', 'http://img.youtube.com/vi/'.YOUTUBEID.'/0.jpg'); // YOUTUBEID automatically replaced
define ('YOUTUBE_PLAYER', 'https://www.youtube.com/embed/'.YOUTUBEID // YOUTUBEID automatically replaced
	.'?rel=0' // related videos
	.'&amp;disablekb=1' // disable keyboard shortcuts
	.'&amp;modestbranding=1' // no youtube logo (not working!)
	.'&amp;showinfo=0' // show video information
	.'&amp;color=white'); // progress bar color

// Library update
define ('STEPPED_DISPLAY', false); // display page progressively
define ('TASK_NB', 1); // nb of task to execute per page load

// MyPhoto Update
define ('GIT_CHECK', 'git fetch -q 2>&1 && git log HEAD..origin/master --oneline --format="%an: %s (%ar)"'); // command to show pending updates
define ('GIT_PULL', 'sudo git fetch --all && sudo git reset --hard origin/master 2>&1'); // command to update local repository
?>