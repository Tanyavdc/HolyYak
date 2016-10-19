<?php
$dbconn = mysql_connect('198.71.227.93','tanyavdc','Lubeto111');
header('Content-Type: application/json');
perform_operation($_POST["operation"]);

function perform_operation($op){
	if ($op == 'login'){
		validate_user($_POST["useremail"], $_POST["userpassword"]);
	}
	else if($op == 'getyaks'){
		get_yaks($_POST["longitude"], $_POST["latitude"]);
	}
	else if($op == 'post_yak'){
		post_yak($_POST["postedyak"],$_POST["latitude"],$_POST["longitude"]);
	}
	else if($op == 'banned_user'){
		banned_user($_POST["useremail"]);
	}
	else if($op == 'add_user'){
		add_user($_POST["useremail"], $_POST["userpassword"]);
	}
	else if($op == 'send_email'){
		send_email($_POST["email"]);
	}
	else if($op == 'getHot_yaks'){
		getHot_yaks();
	}
	else if($op == 'getCold_yaks'){
		getCold_yaks();
	}
	else if($op == 'upvote'){
		upvote($_POST["id"]);
	}
	else if($op == 'downvote'){
		downvote($_POST["id"]);
	}
	
	
}

function add_user($useremail, $password){
        global $dbconn; 
        $msg= "true";
       mysql_select_db('tanyavdc_');
       $exists= mysql_query("SELECT 1 FROM yakuser WHERE useremail='$useremail' LIMIT 1");
        $banned= mysql_query("SELECT 1 FROM  bannedusers WHERE useremail='$useremail' LIMIT 1");
        if(mysql_fetch_array($exists) !== false){
              $msg="exists";
         }
        if(mysql_fetch_array($banned) == true){
             $msg="banned";
       }
       if($msg == "true"){
       $sql = "INSERT INTO yakuser (useremail, userpassword) values ('$useremail','$password')";
       $retval = mysql_query( $sql, $dbconn );
    }
	leave: print json_encode($msg);
}

function validate_user($useremail, $password){
	global $dbconn; // reference $dbconn from global scope vs create a new local
        mysql_select_db('tanyavdc_');
        $reply="";
	$result = mysql_query("SELECT * FROM yakuser WHERE useremail='$useremail' AND userpassword='$password'");
	if (mysql_num_rows($result) > 0){
          $reply="good";
          }
        else{
           $reply="bad";
          }
         $is_banned = mysql_query("SELECT 1 FROM bannedusers WHERE useremail='$useremail' LIMIT 1");
            if(mysql_fetch_array($is_banned) !== false){
              $reply="banned";
           }
	leave: print json_encode($reply);
}

function get_yaks($long,$lat){
	global $dbconn; 
        mysql_select_db('tanyavdc_');
	$result = mysql_query("SELECT id,msg,rating FROM yakdb WHERE ((latitude between ($lat - 0.1) and ($lat + 0.1)) and ((longitude between ($long - 0.1) and ($lat + 0.1)))) order by timestamp DESC LIMIT 10;");
	$yaks=array();
	if (!result){
		$yaks[]="error";
	}
	else {
		while($r = mysql_fetch_assoc($result)) {
                  $yaks[] = $r;
                      }
            }

	leave: print json_encode($yaks);
}

function post_yak($yak, $lat, $long){
	global $dbconn; 
        mysql_select_db('tanyavdc_');
	$time = date("F j, Y, g:i a");        //March 11 2015 2:38 pm
	$dbtime = date("Y-m-d H:i:s");
	mysql_query("INSERT into yakdb (msg, latitude, longitude, timestamp) values('$yak', '$lat', '$long', '$dbtime')");
	$json = array();
	$json['yak'] = $yak;
	$json['longitude'] = $long;
	$json['latitude'] = $lat;
	$json['time'] = $time;
	
	leave: print json_encode($json);
}

function upvote($id){
		global $dbconn; 
               mysql_select_db('tanyavdc_');
		mysql_query("UPDATE  yakdb set rating= rating + 1 WHERE id=$id;");
}

function downvote($id){
		global $dbconn; 
                mysql_select_db('tanyavdc_');
		mysql_query($dbconn, "UPDATE  yakdb set rating= rating - 1 where id=$id");
}

function getHot_yaks(){
	global $dbconn; // reference $dbconn from global scope vs create a new local
        mysql_select_db('tanyavdc_');
	$result = mysql_query("SELECT * from yakdb order by rating DESC LIMIT 10");
	$yaks=array();
	if (!result){
		$yaks[]="error";
	}
	else {
		while($r = mysql_fetch_assoc($result)) {
                  $yaks[] = $r;
                      }
            }

	leave: print json_encode($yaks);
}

function getCold_yaks(){
	global $dbconn; // reference $dbconn from global scope vs create a new local
        mysql_select_db('tanyavdc_');
	$result = mysql_query("SELECT * from yakdb order by rating ASC LIMIT 10");
	$yaks=array();
	if (!result){
		$yaks[]="error";
	}
	else {
		while($r = mysql_fetch_assoc($result)) {
                  $yaks[] = $r;
                      }
            }

	leave: print json_encode($yaks);
}

function banned_user($useremail){
	global $dbconn;
        mysql_select_db('tanyavdc_');
	mysql_query("DELETE from yakuser where useremail='$useremail'");	
	mysql_query("INSERT into bannedusers (useremail) values ('$useremail')");
}

function send_email($email){
         global $dbconn; 
         mysql_select_db('tanyavdc_');
	$result= mysql_query("SELECT userpassword FROM yakuser WHERE useremail='$email'");
	$header = 'From: HolyYak <HolyYak@domain.com>';
        $password= mysql_result($result, 0);	
	mail($email, 'password', 'Your password is ' . $password, $header);
	leave: print json_encode("email has been sent");
}
?>





