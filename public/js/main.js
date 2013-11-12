$(function(){
	var chat = new RTCCryptoChat();
	
	//client
	if (window.location.hash)
	{
		chat.onConnected(function() {
			chat.join( window.location.hash.substr(1) );
			$("#status").addClass("connected");
		});
		
		chat.onMessage(function(data){
			$("#message").val( data );
		});
	}
	//server
	else {
		chat.onConnected(function(id) {
			console.log("Your id: " + id);
			$("#sharelink")
				.attr("href", window.location.href + "client#" + chat.getShareHash() )
				.text("Share link");
		
			$("#status").addClass("connected");
		});
		
		$("#message").keyup(function(){
			chat.send( $("#message").val() );
		});
	}
});