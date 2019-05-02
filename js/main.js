
$("document").ready(function(){
	
     $('#wait').css('display','none');
     $("#search_text").keyup(function(event){
	if(event.keyCode==13){
	    $("#search_button").click();
	}
    });

    $('iframe').load(function(){
	$('#wait').css('display','none');
	$('iframe').show();
    });


    $('#search_button').click(function(){
	 var x = document.forms["hunt"]["searchstring"].value;
    	if (x == "") 
        alert("Search  must be filled out");
	else{
	$('#wait').show();
	$('iframe').hide();
	} 
    });
	$('#Add_new_map').click(function() {
    var IOS = document.forms["form_map"]["ios_cli"].value;
    var Polaris=document.forms["form_map"]["polaris_cli"].value;
	if (IOS == "") {
        alert("CLI can't be empty");
    }
	else if (Polaris == "") {
        alert("CLI can't be empty");
    }
	else
	{
		alert("Successfully Added");
		
	}


});

});


