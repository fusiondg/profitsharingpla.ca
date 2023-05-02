<?php
header('Access-Control-Allow-Origin: *');
require 'connect.php';
require 'pollClass.php';
//error_reporting(0);

$json = file_get_contents('php://input');	
$post = json_decode($json);	
$call;
$id;
$val;
$userID;
try{
	$call =$_GET['call'];
	$id =$_GET['id'];
	$val =$_GET['val'];
	$userID =$_GET['RMUserID'];	
}
catch(Exception $e){}
echo handleRequest($con,$post,$call,$id,$val,$userID);
function handleRequest($con,$req,$call,$id,$val,$userID = 0){
	$rt;
	switch($call){
		case "getPoll":
			$rt = new Poll($con,$id);
			return json_encode($rt->getPoll());
			break;
		case "submitAnswer":
			$rt = new Poll($con,$id);
			$rt->submitAnswer($val,$userID);
			return json_encode($rt->getPollResults());
			break;
		case "getResults":
			$rt = new Poll($con,$id);
			return json_encode($rt->getPollResults());
			break;
	}
}
?>