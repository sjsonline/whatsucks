  		var remoteurl = ""
		//remoteurl = "http://thisiswhatsucks.co/"
		
		function querystring(key) {
		   var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
		   var r=[], m;
		   while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
		   return r;
		}
		
		var indexPage = new RegExp('index\.html\/?$').test(location.pathname);
		//var nullPage = new RegExp('index\.html\/?$').test(location.pathname);
		console.log(location.pathname);
		
		if(location.pathname == '/' || location.pathname == '/whatsucks/' || indexPage){
			$(document).ready(function() {
		    	getThings();
			});
			
			//console.log("index-"+indexPage);
			
			window.fbAsyncInit = function() {
               FB.init({appId: '490379241020895', status: true, cookie: true, xfbml: true});
			/* All the events registered */
               FB.Event.subscribe('auth.login', function(response) {
                   // do something with response
                   login();
				pushToApi();
               });
               FB.Event.subscribe('auth.logout', function(response) {
                   // do something with response
                   logout();
				clearFB();
               });

               FB.getLoginStatus(function(response) {
                   if (response.session) {
                       // logged in and connected user, someone you know
                       login();
					//pushToApi();
					alreadyAuthed();
                   }else{
					alreadyAuthed();
				}

               });		
			(function() {
                var e = document.createElement('script');
                e.type = 'text/javascript';
                e.src = document.location.protocol +
                    '//connect.facebook.net/en_US/all.js';
                e.async = true;
                document.getElementById('fb-root').appendChild(e);
            }());
           };

		}else{
			var detailPage = new RegExp('suck\.html\/?$').test(location.pathname);
			if(detailPage){
				$(document).ready(function() {
					//console.log("detailpage-"+detailPage);
					getThing(querystring('id'));
					getSimilarThings(querystring('id'));
					getAltThings(querystring('id'));
				});
			}
			
		}
				//});

 
        function login(){
            FB.api('/me', function(response) {
                //document.getElementById('login').innerHTML = response.name + " succsessfully logged in!";
            });
        }

        function logout(){

        }

			//$.postJSON = function(url, data, func) { $.post(url+(url.indexOf("?") == -1 ? "?" : "&")+"callback=?", data, func, "json"); }
			
 
        //stream publish method
        function streamPublish(name, description, hrefTitle, hrefLink, userPrompt){
            FB.ui(
            {
                method: 'stream.publish',
                message: '',
                attachment: {
                    name: name,
                    caption: '',
                    description: (description),
                    href: hrefLink
                },
                action_links: [
                    { text: hrefTitle, href: hrefLink }
                ],
                user_prompt_message: userPrompt
            },
            function(response) {

            });

        }

        function showStream(){
            FB.api('/me', function(response) {
                //console.log(response.id);
                streamPublish(response.name, 'Testing WhatSucksApp', 'hrefTitle', 'http://whatsucksapp.co', "Tell your friends whatsucks.");
            });
        }
 
        function share(){
            var share = {
                method: 'stream.share',
                u: 'http://thinkdiff.net/'
            };

            FB.ui(share, function(response) { console.log(response); });
        }
 
        function graphStreamPublish(){
            var body = 'Silent Test of WhatSucksApp';
            FB.api('/me/feed', 'post', { message: body }, function(response) {
                if (!response || response.error) {
                    alert('Error occured');
                } else {
                    alert('Post ID: ' + response.id);
                }
            });
        }

		function clearFB(){
			document.getElementById('fbUser').innerHTML = ""
		
		}
 
         function setStatus(){
             status1 = document.getElementById('status').value;
             FB.api(
               {
                 method: 'status.set',
                 status: status1
               },
               function(response) {
                 if (response == 0){
                     alert('Your facebook status not updated. Give Status Update Permission.');
                 }
                 else{
                     alert('Your facebook status updated');
                 }
               }
             );
         }
 
         function pushToApi(){
             FB.api('/me', function(response) {
   		 var userid = response.id;
                  var query = FB.Data.query('select name, hometown_location, sex, pic_square, email, birthday_date, friend_count from user where uid={0}', response.id);
                  query.wait(function(rows) {
			
			var url=remoteurl+"api/users/newUserFromFacebook/";

			var request = $.ajax({
			        url: url,
			        type: "post",
			        data: {facebook_id : userid, name : rows[0].name, email : rows[0].email, birthdate : rows[0].birthday_date, image_source : rows[0].pic_square}
			    });

			// callback handler that will be called on success
			request.done(function (response, textStatus, jqXHR){
			    // log a message to the console
			    console.log("Added User to db-" + response.success);
			});
			'<img src="' + rows[0].pic_square + '" alt="" />' + "<br />";
		
                  });
             });
         }

		function alreadyAuthed(){
            FB.api('/me', function(response) {
			 var userid = response.id;
                 var query = FB.Data.query('select name, hometown_location, sex, pic_square, email, birthday_date, friend_count from user where uid={0}', response.id);
                 query.wait(function(rows) {
                   document.getElementById('fbUser').innerHTML = '<img src="' + rows[0].pic_square + '" alt="" />' + "<br />";
		
			var url=remoteurl+"api/users/fbauth/";

			var request = $.ajax({
			        url: url,
			        type: "post",
			        data: {facebook_id:userid}
			    });

			// callback handler that will be called on success
			request.done(function (response, textStatus, jqXHR){
			    // log a message to the console
				if(response.success == 'True'){
					console.log("Already Logged In -"+userid);
				}else{

				}
			});

			//send to api
            });

	
	
            });
        }

		function getThings(){
			$('#tileRows').empty();
		    var url=remoteurl+"api/things/popular";
			//console.log("getThings-"+url);
			
			var request = $.ajax({
			        url: url,
			        type: "get",
			        data: {}
			    });

			// callback handler that will be called on success
			request.done(function (response, textStatus, jqXHR){
				$.each(response.data,function(i,thing){
					//console.log(thing.image_for_display);
					if(thing.image_for_display != null || thing.image_for_display != ''){
						if(thing.image_for_display.toString() != ""){
						$('#tileRows').append('<div class="span3"><div class="box"><a href="suck.html?id='+thing.id+'"><img src="'+thing.image_for_display+'"/><span class="caption"><p>'+thing.name+'</p></span></a></div></div>');
					}
					}
					});
			});
		}
				
		function getThing(id){
		    var url=remoteurl+"api/things/thing/"+id;
			
			var request = $.ajax({
			        url: url,
			        type: "get",
			        data: {}
			    });

			// callback handler that will be called on success
			request.done(function (response, textStatus, jqXHR){
					$('#thingName').text(response.name + " Sucks");
					$('#thingImage').html('<img src="'+response.image_for_display+'" />');
					if (response.text_for_display != null){
					if (response.text_for_display.toString() != ''){
						$('#thingComment').text(response.text_for_display);
					}
					}
					$('#thingUrl').html('<a href="'+response.submitted_url+'"><div class="url">'+response.submitted_url+'</div></a>');
			});
		}
					
		function getSimilarThings(id){
			//console.log("getSimilarThings");
		    var url=remoteurl+"api/things/similarthings/"+id;

			var request = $.ajax({
			        url: url,
			        type: "get",
			        data: {}
			    });						
			
			request.done(function (response, textStatus, jqXHR){
				var tempUl = '<ul>';
				var i = 0;
				$.each(response.data,function(j,thing){
					if(i <= 4){
					if(thing.image_for_display.toString() !== ""){
					tempUl += '<li><a href=suck.html?id='+thing.id+'><img src="'+thing.image_for_display+'"></a></li>';
					//console.log("not null-"+thing.image_for_display+"-");
					i++
					}
					}
				});
				tempUl += "</ul>"
				$("#similarThings").html(tempUl);
			});
			
		}
						
		function getAltThings(id){
			var url=remoteurl+"api/things/alternatives/"+id;

			var request = $.ajax({
				url: url,
				type: "get",
				data: {}
			});						

			request.done(function (response, textStatus, jqXHR){
				var tempUl = '<ul>';
				$.each(response.data,function(i,thing){
				tempUl += '<li>'+thing.name+'</li>';
				//console.log(thing.id);
			});
			tempUl += "</ul>"
			//console.log(tempUl);
			$("#altThings").html(tempUl);
			});

		}

		function pushThing(){
			var url=remoteurl+"api/things/submitThing/";

			var name= $("#inputSucks").val();
			var tfd=$("#inputComment").val();
			var ifd=$("#inputImage").val();
			var su=$("#inputLink").val();			
	
			var request = $.ajax({
				url: url,
				type: "post",
				data: {name : name, text_for_display : tfd, image_for_display : ifd, submitted_url : su}
			});
																
			request.done(function (response, textStatus, jqXHR){
				console.log("success, got back-"+response);
			});

			$('#add-suck').modal('hide');
			getThings();
		}
	
	
		function pushThing2(){
			//console.log("pushThing2");
			var url=remoteurl+"api/things/submitThing/";

			var name= $("#inputSucks").val();
			var tfd=$("#inputComment").val();

			var request = $.ajax({
				url: url,
				type: "post",
				data: {name : name, text_for_display : tfd, image_for_display : querystring('img').toString(), submitted_url : querystring('link').toString()}
			});
																														
			request.done(function (response, textStatus, jqXHR){
				console.log(response.success);
			});
		}
						
		function pushAltThing(){
			//console.log("pushAltThing");
			var url=remoteurl+"api/things/addAlternative/";

			var name= $("#inputAlt").val();

			var request = $.ajax({
				url: url,
				type: "post",
				data: {thing_id : querystring('id').toString(), alternative_name : name}
			});
			request.done(function (response, textStatus, jqXHR){
				console.log(response.success);
			});
			getAltThings(querystring('id').toString());

		}
				