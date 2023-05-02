define(['jquery'], function ($) {
	var _lang = "";
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
		ajaxCall(dataStr,data,
			function(msg){
				msg = $.parseJSON(msg);
				createPollUI(e,msg,type);
			}
		);
	}
	function populateResults(el,d){
		var that = el;
		$(".poll-results").show();

		//build top label section
		var o,objLbls = $('<div class="results-number">');
		var total = 0;
		var question = el.find('.pollHeader').clone();
		var counts = []; // Array of submit counts for all options; needed to convert into percentages

		var idx = $('.option-radio:checked').val();
		// If user is re-visiting the page (no checked option to find), pull from database
		if(idx == undefined) {
			idx = localStorage["completed"+d.id+_lang];
		}
		$.each(d.options,function(i,e){
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

		$.each(d.options,function(i,e){
			if(idx == e.id){
				$(".poll-results .arrow:eq("+i+")").show();
			}
			$(that).find(".poll-results .poll-result:eq("+i+") .percent").html(percentages[i] + '%');
			$(".poll-results .poll-bar-fill:eq("+i+")").css('width',percentages[i] + '%');

		});
	}

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
				$.each(msg.options,function(i,e){
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
		var that = e;
		//_lang = $('html').attr('lang');

		$(e).find('h4 b').html(decodeURI(data.question));
		$.each(data.options,function(i,e){
			pid = e.poll_id;
			$(that).find(".poll-options .poll-option:eq("+i+") .text").html(decodeURI(e.text));
			$(that).find(".poll-options .poll-option:eq("+i+")").attr('data-val',e.id)
			$(that).find(".poll-results .poll-result:eq("+i+") .text").html(decodeURI(e.text));
		});
		 if(typeof(localStorage["completed"+data.id+_lang]) =="undefined"){
			$(".poll-options").show();
			e.find('.poll-options .poll-option').one('click',function(){
				var v = $(".poll-options .poll-option .selected").parent().attr('data-val');
				//validate
				if(!v){
					return;
				}
				//store
				localStorage["completed"+e.attr('data-id')+_lang] = v;
				ls =  typeof localStorage["RMKey"] == "undefined" ? randStr(32) : localStorage["RMKey"];
				localStorage["RMKey"] = ls; // +'/'+  data.id+":"+$('.option-radio:checked').val();
				submitPollAnswer(e,
				"?call=submitAnswer&id="+ pid+"&lang="+ _lang+"&val="+ v+"&RMUserID="+localStorage["RMKey"]+"&RMPoll="+ localStorage["RMKey"],{"call" : "submitAnswer","id": pid,"val": v,"RMUserID":localStorage["RMKey"],"RMPoll": localStorage["RMKey"]});

			});
		 }
	}

	$.fn.RMPoll = function(type) {
		this.attr('id','poll-container')
		var id= Number(this.attr('data-id'));
		type = type || "none";
		var complete;
		_lang = $('html').attr('lang');
		if(this.selector == ''){
			throw new Error( 'RM Poll object selector not defined');
		}
        if (typeof id === 'number' && isFinite(id) ) {
			if(supports_html5_storage()){
				complete = localStorage["completed"+id+_lang];
			}
			if(complete === undefined ){
				this.attr('resize',false);
				getPollData(this,{"call":"getPoll", "id": id},"?call=getPoll&id="+ id+"&lang="+ _lang,type);
			}
			else {
				this.attr('resize',true);
				getResultData(this,{ "call" : "getResults", "id": id }, "?call=getResults&id="+ id+"&lang="+ _lang,type);
			}
		}
    };
    if ($("#poll-container").length > 0) {
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
        $(function(){
            setTimeout(function(){
                $('#poll-container').RMPoll();
            },200);
        })
    }
});
