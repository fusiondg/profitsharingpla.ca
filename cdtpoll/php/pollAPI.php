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
$lang;
try{
	$call =$_GET['call'];
	$id =$_GET['id'];
	$val =$_GET['val'];
	$userID =$_GET['RMUserID'];	
	$lang = $_GET['lang'];
}
catch(Exception $e){}
echo handleRequest($con,$post,$call,$id,$val,$userID,$lang);
function handleRequest($con,$req,$call,$id,$val,$userID = 0,$lang){
	$rt;
	switch($call){
		case "getPoll":
			$rt = new Poll($con,$id);
			return json_encode($rt->getPoll($lang));
			break;
		case "submitAnswer":
			$rt = new Poll($con,$id);
			$rt->submitAnswer($val,$userID);
			return json_encode($rt->getPollResults());
			break;
		case "getResults":
			$rt = new Poll($con,$id);
			return json_encode($rt->getPollResults($lang));
			break;
	}
}
?>