<?php


session_start();

define("SERVERHOST", "sql5c0c.megasqlservers.com");
define("USERNAME", "profitshar902372");
define("PASSWORD", "profitsharingPoll1#");

if($_SESSION && $_SESSION['staging'] == true){
	define("DEFAULTDB","pspolltest_profitshar902372");
	echo "stagingDB = ".$_SESSION['staging'];
}
else {
	define("DEFAULTDB","pspolltest_profitshar902372");
}

// Create connection
$con = mysqli_connect(SERVERHOST,USERNAME,PASSWORD,DEFAULTDB);
// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

?>