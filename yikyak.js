$(document).ready(function(){
     var longitude = 0;
     var latitude = 0;
     var badWords = new Array("Ass", "Ass-wipe", "Asshole", "Bitch" ,"Clit", "Cock", "Cunt", "dick", "Fuck", "Fucker", "Idiot", "Jack-ass", "Motherfucker", "Shit", "Slut", "Son of a bitch", "Whore");
     var globalEmail;
     
     $("#signup_page").hide();
     $("#forgotemail_page").hide();
     $("#nv").hide();
    	
     // on click SignIn Button checks for valid email and all field should be filled
	 $("#login").click(function(){
		if( $("#loginemail").val()=='' || $("#loginpassword").val()=='')
		{
		  alert("Please fill all fields");
		}
	
		else
		{
			globalEmail = $("#loginemail").val();
			var password = $("#loginpassword").val();
			$.post("serverSide.php", {useremail:globalEmail, userpassword:password, operation:'login'}, function(msg){
 
				if(msg == "good"){
					$("#login_page").hide();
					$("#YikYak").show();
					$("#nv").show();
					$("#yak_container").show();
					$("form")[0].reset();
					// display the yaks in the area 
					get_yaks();
					
				}
                               if(msg=="banned"){
                                    alert("this user has been banned for swearing"); 
                                    }
				if(msg=="bad"){
					alert("please try again");
				}
			});
			// send to php 
		}
	 
	 });
	 
	 $("#register").click(function(){
		var email = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
		
		if( $("#name").val()=='' || $("#registeremail").val()=='' || $("#registerpassword").val()=='')
		{
		  alert("Please fill all fields");
		}
		
		else if(!($("#registeremail").val()).match(email))
		{
			alert("Please enter valid Email");
		}
		
		else
		{
		
			var email = $("#registeremail").val();
			var password = $("#registerpassword").val();
		
			$.post("serverSide.php", {operation : 'add_user' , useremail:email, userpassword:password}, function(msg){
					if(msg == "true"){
					alert("You have successfully Signed up");
					$("form")[0].reset();
					$("#signup_page").slideUp("slow",function(){
	      					$("#login_page").show();
					});
				}
				else if (msg == "exists"){
					alert("this email has been taken");			
				}
				else{
					alert("this account has been banned for swearing");
				}
		
	   		});
		}
	 
	 });
	
	

	 $("#post_yak").click(function(){
		post_yak();
	 
	 });

	$("#refresh").click(function(){
			//refresh
			get_yaks();	
	 
	 });



	 
	 
	 // on click signup It Hide Login Form and Display Registration Form
	 $("#signup").click(function(){
       $("#login_page").slideUp("slow", function(){
		  $("#signup_page").slideDown("slow"); 
	   });	
	 });
	 
	 // on click signin It Hide Registration Form and Display Login Form
     $("#signin").click(function(){
       $("#signup_page").slideUp("slow",function(){
	      $("#login_page").slideDown("slow");
	   });
	 });

	//forgot email
	 $("#forgot").click(function(){
       $("#login_page").slideUp("slow", function(){
		  $("#forgotemail_page").slideDown("slow"); 
	   });	
	 });
	//go back to login from forgot email page
	$("#back").click(function(){
       $("#forgotemail_page").slideUp("slow", function(){
		  $("#login_page").slideDown("slow"); 
	   });	
	 });

	$("#retrieve").click(function(){
		
		var retrieveEmail = $("#Forgotemail").val();
		$.post("serverSide.php", {email: retrieveEmail, operation: 'send_email'}, function(data){
			alert(data);
		});
		
	
		
		
	});

	$("#hot").click(function(){
		empty_yaks();
		$.post("serverSide.php", {operation:'getHot_yaks'}, function(msg){
			populate_yaks(msg);
	});
	});
	
	$("#cold").click(function(){
		empty_yaks();
		$.post("serverSide.php", {operation:'getCold_yaks'}, function(msg){
			populate_yaks(msg);
			});
		}); 	
	
	

 // on click logout It Hides yikyak Form and Displays Login Form
     $("#logout").click(function(){
	logout();
	 });

     $("#yak1").dblclick(function(){
         console.log("clicked");
	 });


     function get_yaks(){
	//clear html
	//$("#yaks").empty();
    empty_yaks();
	navigator.geolocation.getCurrentPosition(function(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		// make a request to get yaks from the area 
 		$.post("serverSide.php", {latitude:position.coords.latitude, longitude:position.coords.longitude, operation:'getyaks'}, function(msg){
 			populate_yaks(msg);
 		});
	});
     }
     function populate_yaks(msg){
		var i =1;
		$.each(msg, function(index, element) {
			// add the yak to the yaks table
			$("#"+i).append(element.msg);
			// make a voteup button
			var bttn_tag = '<input type="button" class=' + element.id + ' id=' + element.id + 'up' + ' value="+1">';
			// add the voteup button to the table
			$("#vote"+i).append(bttn_tag);
			// add functionality to button 
			var bttn_ref="#"+ element.id + "up";
			$(bttn_ref).addClass("votedisplay");
			$(bttn_ref).click(function() {
		          $(this).attr("disabled", true);
		          var downbttn_ref= '#' + element.id + 'down';	
		          $(downbttn_ref).attr("disabled", false);
		    	  // post request operation: upvote id: bttn_id  p
		    	  var int_id = parseInt($(this).attr('class'));
		    	 $.post("serverSide.php", {operation:'upvote', id:int_id}, function(msg){

		    	 });
			 var rating_ref = '#rating_' + element.id;
			 var el = $(rating_ref);
				 var num = parseInt(el.text());
				 el.text(num+1);
		       });
		
			// add rating display to table 
			var rating_tag = "<p class='votedisplay' id=rating_" + element.id + ">" + element.rating + "</p>";
			$("#vote"+i).append(rating_tag);
			// make a votedown button
			var bttn_tag = '<input type="button" class=' + element.id + ' id=' + element.id + 'down' + ' value="-1">';
			// add the votedown button to the table
			$("#vote"+i).append(bttn_tag);
			// add functionality to button 
			var bttn_ref="#"+ element.id + "down";
			$(bttn_ref).addClass("votedisplay");
			$(bttn_ref).click(function() {
		          $(this).attr("disabled", true);
		          var upbttn_ref= '#' + element.id + 'up';	
		          $(upbttn_ref).attr("disabled", false);
		    	  // post request operation: upvote id: bttn_id  p
		    	  var int_id = parseInt($(this).attr('class'));
		    	 $.post("serverSide.php", {operation:'downvote', id:int_id}, function(msg){
		    	 });
			 var rating_ref = '#rating_' + element.id;
			 var el = $(rating_ref);
				 var num = parseInt(el.text());
				 el.text(num-1);
		       });
			 
			
			//the id for the td is i
			// append element.msg to the td with id "i"
			// increment i 
			i = i + 1;
		});
	
	}
	
	function logout(){
		$("#yak_container").hide();
		$("#nv").hide();
		//$("#ref").hide();
		//$("#Hot_button").hide();
		//$("#Cold_button").hide();
	        $("#YikYak").hide(function(){
		      $("#login_page").show();
		   });
	}

	function post_yak(){
			var yak = $("#yak").val();
			var words = yak.split(" ");
			var flag = "true";
			for (var i = 0; i<words.length; i++){
				for (var j = 0; j<badWords.length; j++){
					if(words[i].toLowerCase() == badWords[j].toLowerCase()){
						
						flag = "false";
					}
				}
			}
			if(yak.length >0 && yak.length < 140){
				if(flag == "true"){ 
					$.post("serverSide.php", {operation:'post_yak', postedyak: yak, latitude: latitude, longitude: longitude});
					get_yaks();
				}
				else{  // you swore 
					// log the user out
				
				
					// add the users email to a banned database   post request to remove from yakdb, and to add to banned 
					// send an alert saying that youve been banned 

					$.post("serverSide.php", {operation:'banned_user', useremail:globalEmail});
					alert("you have been banned for swearing");
					logout();
				
					// refresh 
				}	
			}
			else{
				alert("your yak does not meet the length requirements");
			}
	 
	 }
	function empty_yaks(){
		for (var i =1; i<= 10; i++){
			$("#"+i).empty();
			$("#vote"+i).empty();
		}
			
	}
	
	function populate_table(){
		// i = 1
		//for each element
		// grab the elements message 
		// append <p> element with id = yaks id
		// append <p> element to <td with id (i) 
		// 
	}

	
});


