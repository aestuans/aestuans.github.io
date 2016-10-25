var ANIMATION_DELAY = 300;

var quotes = [];
var isFirst = true;
var curidx = 0;
function new_quote(){
	if(isFirst){
		var rand = Math.random();
		console.log(rand);
		var len = quotes.length;
		console.log(len);
		curidx = Math.floor(rand*len);
		console.log(curidx);
		isFirst = false;
		return quotes[curidx];
	}
	if(curidx < quotes.length-1){
		curidx++;
	}
	else{
		curidx = 0;
	}
	console.log(curidx);
	return quotes[curidx];
}
function change_quote(){
	var q = new_quote();
	var g = $("#genquote");
	g.finish();
	g.fadeOut(ANIMATION_DELAY);
	g.queue(function(next){
		g.text(q)
		next();
	});
	g.fadeIn(ANIMATION_DELAY);
	
}

$(document).ready(function(e) {
    var data_url = $("body").data("namesource");
	
	$.ajax({
		url: data_url,
		type: 'GET',
		dataType: 'json',
		error: function(data) {},
		success: function(data){
			quotes = data.quotes;
			change_quote();
		}
		});
	
	$("#myButton").click(function(e) {
        change_quote();
    });
});