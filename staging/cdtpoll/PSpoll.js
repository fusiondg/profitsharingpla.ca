(function(){	
	$.support.cors = true;
	if (typeof console == "undefined") {
    this.console = {log: function() {}};
}
	var api_url = "http://profitsharingplan.ca/cdtpoll/php/pollAPI.php"
	try{			
		if(typeof RMLink !== undefined){
			api_url = RMLink;		
		}
	}
	catch(e){};
	console.log(api_url)
	function supports_html5_storage() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	function randStr(l) {
		var i,num,rt='',c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";		
		for (i=0; i<l; ++i) {
			num = Math.floor(Math.random() * c.length);
			rt += c.substring(num,num+1);
		}
		return rt;
	}
	
	// Given values and a total, return percentages rounded to integers s.t. inaccuracy is minimized
	function roundPercentages(values, total) {
		var percentages = [];
		var cumulative = 0; // Cumulative precise percentages
		var baseline = 0; // Cumulative rounded percentages (set after each calculation)
		for (var i = 0; i < values.length; i++) {
			var percent = (values[i]/total) * 100; // These are precise percentages
			cumulative += percent;
			var rounded = Math.round(cumulative);
			percentages[i] = rounded - baseline; // Imprecise percentage based current value and previous rounding
			baseline = rounded;
		}
		
		return percentages;
	}
	
	
	function getPollData(e,data,dataStr,type){	
		console.log(data);	
		ajaxCall(dataStr,data,
			function(msg){
				console.log(msg);
				msg = $.parseJSON(msg);
				createPollUI(e,msg,type);
			}
		);
	}
	function populateResults(el,d){
		console.log('pop res',el,d);
		//var frontHeight = el.find('.front').height();
		//console.log('height',frontHeight)
		//el.find('.back').css('height',frontHeight+"px")
		el.find('.flipper').addClass('flipped');
		//build top label section
		var o,objLbls = $('<div class="results-number">');
		var total = 0;
		var question = el.find('.pollHeader').clone();
		var counts = []; // Array of submit counts for all options; needed to convert into percentages
		
		var idx = $('.option-radio:checked').val();
		// If user is re-visiting the page (no checked option to find), pull from database
		if(idx == undefined) {
			idx = localStorage["completed"+d.id];
		}
		$.each(d.options,function(i,e){	
			if(idx == e.id){
				o = $('<label for=""> <span class="result-option-split yourselection"></span>'+e.text+'</label>');
			}
			else {
				o = $('<label for=""> <span class="result-option-split notselected">'+String.fromCharCode(65+i)+ ' </span>'+e.text+'</label>');
			}
			//<label for="option6"> <span class="radio-img">A</span>My rotar all I need <span class="results">Rotary Phones Rock!</span></label>		
			//data.push({"value":e.rawPercentage,"color" : colors[i], "highlight" : colors[i], "label" : e.text});
			
			objLbls.append(o);
			counts[i] = e.count;
			total += e.count;
		});
		
		var percentages = roundPercentages(counts, total); // Rounded percentages; used to build bar graph
		var largestPercent = 0;
		
		// A straight loop should be faster than sorting the array for the largest element
		for (var i = 0; i < percentages.length; i++) {
			if (percentages[i] > largestPercent)
				largestPercent = percentages[i];
		}
		el.find('.poll,.pollSubmit').remove();
		el.find('.front').append(objLbls).append($("<img class='answerCardFlipper' src='http://profitsharingplan.ca/cdtpoll/img/default-flipper.png'>"));
		el.find('.answerCardFlipper').off('click touchstart').on('click touchstart',function(e){
			$(e.currentTarget).closest('.flipper').addClass('flipped');
		});
		//build bar chart
		var barContainer = $('<div class="option-bars colour">');
		
		$.each(d.options,function(i,e){
			if(idx == e.id){
			console.log(e.count);
				if(e.count<=10)	{
					o = $('<div class="result"><div class="option-results-value">'+percentages[i] + '%' +'</div><div><img src="http://profitsharingplan.ca/cdtpoll/img/selected-above.png" style="margin-left: auto; margin-right: auto; display: block;  margin-bottom: 2px;"></div><div class="option-results widthElem blue" style="width:100%; height:'+111/largestPercent *percentages[i]+'px ;"></div><div class="option-results-text">'+String.fromCharCode(65+i)+'</div></div>');
				}
				else {
					o = $('<div class="result"><div class="option-results-value">'+percentages[i] + '%' +'</div><div class="option-results widthElem blue" style="width:100%; height:'+111/largestPercent *percentages[i]+'px ;"><img src="http://profitsharingplan.ca/cdtpoll/img/selected-above.png" style="position:absolute; bottom:0; left:0px; right:0px; margin-left:auto;margin-right:auto;"></div><div class="option-results-text">'+String.fromCharCode(65+i)+'</div></div>');
				}
			}
			else {
				o = $('<div class="result"><div class="option-results-value">'+percentages[i] + '%' +'</div><div class="option-results widthElem blue" style="width:100%; height:'+111/largestPercent *percentages[i]+'px ;"></div><div class="option-results-text">'+String.fromCharCode(65+i)+'</div></div>');
			}
			
			barContainer.append(o);
		});
		var flipper = $("<div class='theflipperarea' style='position: absolute;    bottom: -5px;  right: -1px;'><img class='' src='http://profitsharingplan.ca/cdtpoll/img/default-flipper.png'  /></div>");
		el.find('.back').append(question).append($('<div class="RMPWrap"></div>').append(barContainer)).append(flipper);
		//el.append(back);
		// Change poll title from POLL to RESULTS
		$('.polltitle').html("POLL RESULTS:");
		
	}
	$(document).on('click touchstart','.theflipperarea',function(){
		$(this).closest('.flipper').removeClass('flipped');
	});
	function getResultData(el,data,datastr,type){		
		ajaxCall(datastr,data,
			function(msg){
				msg =$.parseJSON(msg);
				createPollUI(el,msg,type);
				$.each(msg.options,function(i,e){
					msg.options[i].percentage = (e.count/msg.total*100).toFixed(2)+"%";
					msg.options[i].rawPercentage = (e.count/msg.total*100).toFixed(2);
					el.find('.option').eq(i).find('.result').html(msg.options[i].percentage);
				});
				populateResults(el, msg);
			}
		);
	}	
	function submitPollAnswer(el,dataStr,data){
		total = 0;
		ajaxCall(dataStr,data,
			function(msg){
				msg =$.parseJSON(msg);
				console.log('rt',msg)
				$.each(msg.options,function(i,e){
					console.log(i,e.text,(e.count/msg.total*100).toFixed(2)+"%");
					msg.options[i].percentage = (e.count/msg.total*100).toFixed(2)+"%";
					el.find('.option').eq(i).find('.result').html(msg.options[i].percentage);
					msg.options[i].rawPercentage = (e.count/msg.total*100).toFixed(2);
				});
				populateResults(el,msg);
			}
		);
		
	}
	
	function ajaxCall(datastr,data,successCall,err){
		$.get(api_url+datastr,{},successCall);		
	}
	// {question: "Do you like Polls?", id: 1, options: Array[3]}
	function createPollUI(e,data,type){
		var pid;		
		//q = e.find('.question').eq(0).detach();
		q = $("<div class='pollHeader'>"+
					"<span class='polltitle'>POLL:</span>"+
					"<span class='headerTxt'>Question</span>"+
				"</div>");		
		obj = $("<div class='option'>"+
					"<div class='qcontainer'>"+
						"<input type='radio' name='opt' class='optRadio'/>"+
						"<span class='text'>Option</span>"+
					"</div>"+
				"</div>");		
		var o = $('<div class="option-container">'+
					'<div class="option">'+
						'<input type="radio" name="options" class="option-radio" >'+
						'<div class="radio-img"></div>'+
						'<label for="option6"></label>'+
					'</div>'+
				'</div>');
		e.empty();	
		//e.append($('<div class="branding-box"> <img src="../img/small-logo.png" alt="Rich Opinions logo"> </div>'));
		q.find('.headerTxt').html(data.question);
		var tt = $('<div class="poll"></div>');
		$('#poll-container').height('auto');
		$.each(data.options,function(i,e){
			pid = e.poll_id;
			r = o.clone();
			r.find('input').val(e.id);
			r.find('label').html(e.text);
			r.find('.radio-img').addClass('select-' + String.fromCharCode(97+i));
			tt.append(r);
		});
		var flipper = $('<div class="flipper"></div>');
		var front = $('<div class="front"></div>');
		var back = $('<div class="back"></div>');
		var ps = $('<div class="pollSubmit">Submit</div>');
		
		front.append(q);
		front.append(tt);
		front.append(ps);
		e.append(flipper);
		
		flipper.append(front);
		flipper.append(back);
		//e.append(q);
		//e.append(tt);
		//e.append(tt);
		
		
		console.log('adding poll submit',ps)
		//$('#poll-container').height($('#poll-container').height()+"px");
		 if(localStorage["completed"+data.id] !="true"){
			e.find('.pollSubmit').one('click',function(){
				console.log('submitting')
				//get val
				var v = $('input[name=options]:checked').val();
				//validate
				if(!v){
					return;
				}
				//store				
				localStorage["completed"+e.attr('data-id')] = $('.option-radio:checked').val();
				ls =  typeof localStorage["RMKey"] == "undefined" ? randStr(32) : localStorage["RMKey"];
				localStorage["RMKey"] = ls; // +'/'+  data.id+":"+$('.option-radio:checked').val();
				submitPollAnswer(e,
				"?call=submitAnswer&id="+ pid+"&val="+ v+"&RMUserID="+localStorage["RMKey"]+"&RMPoll="+ localStorage["RMKey"],{"call" : "submitAnswer","id": pid,"val": v,"RMUserID":localStorage["RMKey"],"RMPoll": localStorage["RMKey"]});
				
			});
			$('.radio-img, label').click(function(){
				console.log('click');
				$('.selectedOption').removeClass('selectedOption');
				var c = $(this).closest('.option-container');
				c.find('.radio-img').addClass('selectedOption');
				c.find('input').click()
				return false;
			});
			$('label').hover(function(){
				var c = $(this).closest('.option-container').find('.radio-img');
				if (c.hasClass('hovered')) {
					c.removeClass('hovered');
				} else {
					c.addClass('hovered');
				}
			});
		 }
	}
	
	$.fn.RMPoll = function(type) {
		//console.log(randStr(10));
		this.attr('id','poll-container')
		var id= Number(this.attr('data-id'));
		type = type || "none";
		var complete;
		if(this.selector == ''){
			throw new Error( 'RM Poll object selector not defined');
		}
		console.log(id);
		console.log('registering poll');
        if (typeof id === 'number' && isFinite(id) ) {
			if(supports_html5_storage()){
				complete = localStorage["completed"+id];
			}
			if(complete === undefined ){
			console.log('reached');
				this.attr('resize',false);
				console.log('fetching new poll');
				getPollData(this,{"call":"getPoll", "id": id},"?call=getPoll&id="+ id,type);
			}
			else {
				console.log('fetching poll results');
				this.attr('resize',true);
				getResultData(this,{ "call" : "getResults", "id": id }, "?call=getResults&id="+ id,type);
			}
		} 
    };
	$(function(){
		setTimeout(function(){
			$('#poll-container').RMPoll();			
		},200);
	})
})();
