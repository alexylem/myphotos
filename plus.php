<?php
session_start();
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');

// Settings
include_once ('config.php');

// Includes
include_once ('utils.php');
set_include_path("lib/google-api/src/" . PATH_SEPARATOR . get_include_path());
require_once 'Google/Client.php';
require_once 'Google/Service.php';
require_once 'Google/Service/Plus.php';

/************************************************
 Check CSRF attack
*************************************************/
/* TODO
if (isset($_POST['state']) && isset($_SESSION['state'])) {
	if (!($_POST['state'] == $_SESSION['state'])) {
		header($_SERVER['SERVER_PROTOCOL'] . ' Unauthorized' , true, 401);
		exit;
	}
} else {
	header($_SERVER['SERVER_PROTOCOL'] . ' Unauthorized' , true, 401);
	exit;
}
*/
  
$client = new Google_Client();
$client->setClientId($config['client_id']);
$client->setClientSecret($config['client_secret']);
$client->setRedirectUri('postmessage');
$client->setAccessType('offline'); // for refresh token, but never received it...
$client->addScope("https://www.googleapis.com/auth/plus.me");
$client->addScope("https://www.googleapis.com/auth/userinfo.email");

if (!isset($_REQUEST['action']))
  respond ('missing action parameter', true);

switch($_REQUEST['action']) {
  case 'init':
    if (isset ($_SESSION['me']))
        respond ($_SESSION['me']);
    elseif ($admin_mode)
        respond (array (
            'displayName' => 'Admin Mode',
            'email'       => '',
            'picture'     => '',
            'isadmin'     => true
        ));
    else
        respond ();
    break;

  case 'logout':
    unset ($_SESSION['me']);
    unset($_SESSION['access_token']);
    respond ('Logged out');
    break;

  case 'revoke':
    unset ($_SESSION['me']);
    $token = json_decode($_SESSION['access_token'])->access_token;
    $discon = $client->revokeToken($token); 
    unset($_SESSION['access_token']);
    respond ('Revoked');
    break;

  case 'login':
    if (isset($_REQUEST['code'])) {
      $client->authenticate($_REQUEST['code']);
      unset($_SESSION['logout']);
      $_SESSION['access_token'] = $client->getAccessToken();
      $_SESSION['me'] = getInfo ($_SESSION['access_token']);
      respond ($_SESSION['me']);
    } else
      respond ('missing code', true);
      break;

  default: respond ("unknown action", true);
}

function getInfo ($access_token) {
  global $client, $admins;
  $client->setAccessToken($_SESSION['access_token']);
  $plus = new Google_Service_Plus($client);
  try {
     $me = $plus->people->get('me');
  } catch (Exception $e) {
    respond ($e->getMessage(), true);
  }
  $email = $me->getEmails()[0]['value'];
  return array (
      'displayName' => $me->displayName,
      'email'       => $email,
      'picture'     => $me->getImage()->getUrl(),
      'isadmin'     => in_array($email, $admins)
  );
}