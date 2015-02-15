<?php
// Fonction pour la construction du message de retour
function respond ($message = '', $iserror = false) {
	exit (json_encode (array ('error' => $iserror, 'message' => $message)));
}
?>