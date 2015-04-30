<?php
// System settings (CHANGE ONLY IF YOU KNOW WHAT YOU DO)
define ('SESSION_DURATION', 3600); // secs
define ('THUMB_SIZE', 200); //px (square)
define ('MYPHOTOS_DIR', '.myphotos/'); // trailing /, has to be hidden
define ('SETTINGS_FILE', 'myphotos'); // doesn't have to be hidden
define ('THUMB_DIR', 'thumbs/'); // trailing /, doesn't have to be hidden
define ('PREVIEW_DIR', 'previews/'); // trailing / doesn't have to be hidden
define ('PREVIEW_HEIGHT', 1080); //px, WIDTH is determined automatically
define ('IMG_QUALITY', 40); // 0 to 100
define ('STEPPED_DISPLAY', false); // display page progressively
define ('TASK_NB', 1); // nb of task to execute per page load
define ('GIT_CHECK', 'git fetch -q 2>&1 && git log HEAD..origin/master --oneline --format="%an: %s (%ar)"'); // command to show pending updates
define ('GIT_PULL', 'git pull --recurse-submodules 2>&1'); // command to update local repository
?>