<?php
$to =  "notifications@profitsharingplan.ca";
$from = htmlspecialchars($_POST['address']);
$subject = "New email signup";
$message = $from . " has signed up for email updates.";

// a random hash will be necessary to send mixed content
//$separator = md5(time());
// carriage return type (we use a PHP end of line constant)
$eol = PHP_EOL;



// main header (multipart mandatory)
$headers  = "From: ".$from.$eol;
//$headers .= "MIME-Version: 1.0".$eol;
//$headers .= "Content-Type: multipart/mixed; boundary=\"".$separator."\"".$eol.$eol;
//$headers .= "Content-Transfer-Encoding: 7bit".$eol;
//$headers .= "This is a MIME encoded message.".$eol.$eol;

// message
//$headers .= "--".$separator.$eol;
$headers .= "Content-Type: text/plain; charset=\"UTF-8\"".$eol;
$headers .= "Content-Transfer-Encoding: 8bit".$eol.$eol;
//$headers .= $message.$eol.$eol;


// send message
$out = mail($to, $subject, $message, $headers);
echo json_encode($out);
?>
