<?php
class Poll { 
    protected $con;
	protected $ID;
	protected $question;
	protected $options;
	
	protected function validateID($ID){ return preg_match("/[0-9]+/i", $ID); }
	
	public function getID(){ return $this->ID;	}
    public function __construct($con, $ID = null){ 
		$this->con = $con;
		if($this->validateID($ID)){
			$this->ID = $ID;
		}
	}
    public function getQuestion(){
		if($this->question == null){
			$this->getPoll();
		}
		return $this->question;
	}	
    public function getPoll(){
		if(!$this->validateID($this->ID)){ return "No poll ID found"; }
		$result = array();
		$results = array();
		$stmt = $this->con->stmt_init();
		//get question
		$stmt->prepare( "SELECT id,question from poll_question where id=? and deleted =0");
		$stmt->bind_param( "i", $this->ID);
		$stmt->execute();
		$stmt->bind_result($id, $q);
		$stmt->fetch();
		$results['question'] = $q;
		$results['id'] = $id;
		//get options
		$stmt->prepare( "SELECT id,poll_question_id,optionText from poll_options where poll_question_id=? and deleted=0");
		$stmt->bind_param( "i", $this->ID);
		$stmt->execute();
		$results['options'] = array();		
		$stmt->bind_result($id, $pid, $txt);
		while ($stmt->fetch()) {
			array_push($results['options'],array("id"=>$id, "poll_id"=>$pid,"text"=>$txt));
		}
		$stmt->free_result();
		$stmt->close();
		$this->options = $results['options'];
		$this->question = $results['question'];
		return $results;
	}
	public function submitAnswer($answer,$guid){
		if(!$this->validateID($this->ID)){ return "No poll ID found"; }
		$stmt = $this->con->stmt_init();
		$stmt->prepare( "INSERT INTO poll_answers ( poll_question_id, poll_options_id,guid,time) VALUES ( ?,?,?,now())");
		$stmt->bind_param( "iis", $this->ID,$answer,$guid);
		$stmt->execute();
		$stmt->close();
	}
	public function getPollResults(){
		if(!$this->validateID($this->ID)){ return "No poll ID found"; }
		$return = array("id" => $this->getID(), "question"=>$this->getQuestion(), "options"=>array());
		$return['total'] = 0;
		$stmt = $this->con->stmt_init();
		$stmt->prepare( "SELECT po.id,po.poll_question_id,IF(ISNULL(`resultShortCopy`),`optionText`,IF(STRCMP(`resultShortCopy`,''),`resultShortCopy`,`optionText`))`optionText`,(count(*)-IF(ISNULL(time),1,0)) 'count' FROM `poll_options` po left join poll_answers pa on po.id = pa.poll_options_id where po.poll_question_id =? and po.deleted=0 group by (`optionText`) ORDER BY po.id");
		$stmt->bind_param( "i", $this->ID);
		$stmt->execute();
		$stmt->bind_result($id, $pid, $txt,$count);
		while ($stmt->fetch()) {
			array_push($return['options'],array("id"=>$id, "poll_id"=>$pid,"text"=>$txt,"count"=>$count));
			$return['total'] += $count;
		}		
		return $return;
	}	
}
class PollAdmin extends Poll {
	function __construct($con,$ID = null) {
       parent::__construct($con,$ID);
   }
	public function newPoll($question = null,$optionsArray =null){
		$stmt = $this->con->stmt_init();
		if($this->ID != null){ 				return "can not add poll to this instance. Create a new poll object and try again."; 		}		
		if(!$question){ 	return 'Not enough info'; 		}
		$question = str_replace('\\', '', $question); // Get rid of backslashes
		$stmt->prepare("INSERT INTO `poll_question` ( `id` , `question` ) VALUES ( NULL ,  ? );");
		$stmt->bind_param( "s", $question);
		$stmt->execute();
		$id = $stmt->insert_id;
		//remove blank options
		
		if ($optionsArray) {
			$filteredOptionsArray = array_filter( $optionsArray, 'strlen' );
		
			foreach ($filteredOptionsArray as $value) {
				// Remove backslashes (for RM server)
				$value = str_replace('\\', '', $value);
			
				$stmt->prepare( "INSERT INTO `poll_options` (`id`, `poll_question_id`, `optionText`) VALUES (NULL, ?, ?) ");
				$stmt->bind_param( 'is', $id, $value );
				$stmt->execute();
			}
		}
		$this->ID= $id;
		$stmt->close();
		return $this->getPoll();
	}
	public function removePoll(){ 
		if(!$this->validateID($this->ID)){ return "No poll ID found"; }
		$stmt = $this->con->stmt_init();
		$stmt->prepare("update `poll_question` set `deleted`=1 where id=?;");
		$stmt->bind_param( "i", $this->ID);
		$stmt->execute();
		$stmt->close();
	}
	public function updateQuestionText($text = null){
		if(!$this->validateID($this->ID) ){ return "No poll ID found"; }
		if($text == null || $text == "") {  return "Invalid Text";}
		$text = str_replace('\\', '', $text); // Get rid of backslashes
		$stmt = $this->con->stmt_init();
		$stmt->prepare("update `poll_question` set `question`=? where id=?;");
		$stmt->bind_param( "si",  $text,$this->ID);
		$stmt->execute();
		$stmt->close();
		$this->question = $text;
	}
	//[question] => string
	//[optionIDArray] =>       Array   ( [0] => 70    [1] => 71  [2] => 72       [3] => 73 ) 
	//[optionQuestionArray] => Array   ( [0] => A lot [1] => Yes [2] => A Little [3] => No ) 
	//[optionDeletedArray] =>  Array   ( [0] => 0	  [1] => 1   [2] => 0		 [3] => 0  )
	public function updatePoll($question,$optionIDArray,$optionQuestionArray,$optionDeletedArray){
		if(!$this->validateID($this->ID) ){ return "No poll ID found"; }
		$stmt = $this->con->stmt_init();
		$this->updateQuestionText($question);
		$i=0;
		$questionID = $this->ID;
		foreach ($optionQuestionArray as $value) {
			// Remove backslashes (for RM server)
			$value = str_replace('\\', '', $value);
			if ($optionIDArray[$i] == -1) { // New option added during the edit
				$stmt->prepare( "INSERT INTO `poll_options` (`id`, `poll_question_id`, `optionText`, `deleted`) VALUES (NULL, ?, ?, ?) ");
				$stmt->bind_param( 'isi', $questionID, $value, $optionDeletedArray[$i++]);
				$stmt->execute();
			} else {
				$stmt->prepare( "update `poll_options` set `optionText`=?,`deleted`=?  where id=?");
				$stmt->bind_param( 'sii', $value, $optionDeletedArray[$i],$optionIDArray[$i++] );
				$stmt->execute();
			}
		}
		$stmt->close();
	}
} 
?>