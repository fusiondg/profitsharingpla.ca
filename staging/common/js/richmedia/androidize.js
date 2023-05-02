/**
 * rmlibrary-template - RM Library module template
 * @version 1.0.0
 * 
 * This code is developed using Rich Media's proprietary code library
 * and may not be reproduced, altered, reverse engineered, or otherwise
 * copied or distributed in whole or in part, without the express
 * written permission of Rich Media.
 */
(function (root, factory) { 
if (typeof define === 'function' && define.amd) { define(["jquery"], factory); } else { if (!root.rmlibrary) root.rmlibrary = {}; root.rmlibrary.carousel = factory(jQuery); }
}(this, function (jQuery) {
null
/**
 * rm-amd-loader - AMD Loader for the RM Library
 * @version 0.1.6
 * 
 * This code is developed using Rich Media's proprietary code library
 * and may not be reproduced, altered, reverse engineered, or otherwise
 * copied or distributed in whole or in part, without the express
 * written permission of Rich Media.
 */
var define,require;!function(){function r(r,e){if(Array.prototype.map)return r.map(e);var t=[];if("function"!=typeof e)throw new TypeError;for(var o=0;o<r.length;o++)t.push(e.call(null,r[o],o,r));return t}function e(r,e){for(var t=0;t<r.length;t+=1)if(r[t]===e)return t;return-1}function t(r,e){if(!/^\.\.?\//.test(e))return e;for(var t=r.split("/"),o=t.slice(0,t.length-1).concat(e.split("/")),n=[],u=0;u<o.length;u+=1)"."===o[u]||(".."===o[u]?n.pop():n.push(o[u]));return n.join("/")}function o(r){return function(e){return u(e,r)}}function n(e,t,n){return r(e,function(r){return"require"===r?o(t):"exports"===r?i[t].module.exports:"module"===r?i[t].module:u(r,t)})}function u(r,o,u){o&&(r=t(o,r)),u||(u=[]);var p=i[r];if(!p||!p.factory)throw"Error loading mod.";if(-1!==e(u,r))throw"No circular dependancies.";if(u.push(r),!p.loaded){p.module.exports={};var f=p.deps&&n(p.deps,r,u);p.module.exports=p.factory.apply(null,f),p.loaded=!0}return p.module.exports}var i={};define=function(r,e,t){if("string"!=typeof r)throw new Error("Modules must be names with a string.");"[object Array]"!==Object.prototype.toString.call(e)&&(t=e,e=["require","exports","module"]),i[r]={id:r,deps:e,factory:t},i[r].module={id:r,exports:i[r].exports}},define.amd={},require=function(r,e){return"string"==typeof r?u(r):("[object Array]"!==Object.prototype.toString.call(r)&&(e=r,r=[]),r=n(r),"function"==typeof e&&e.apply(null,r),void 0)}}();
/*global window */


define('polyfillIE',['jquery'],function ($) {
	function addIE8Tag(){
		var DEBUG_TAG = "";
		//var DEBUG_TAG = "IE8";
		if((/MSIE 8/i).test(window.navigator.userAgent)){
			$('html').addClass("IE8");
		}
		else {
			$('html').addClass(DEBUG_TAG);
		}
	}
	function polyfillBind(){
		if (!Function.prototype.bind) {
		  Function.prototype.bind = function(oThis) {
			if (typeof this !== 'function') {
			  // closest thing possible to the ECMAScript 5
			  // internal IsCallable function
			  throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}
			var aArgs   = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP    = function() {},
				fBound  = function() {
				  return fToBind.apply(this instanceof fNOP ? this : oThis,
						 aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			if (this.prototype) {
			  // Function.prototype doesn't have a prototype property
			  fNOP.prototype = this.prototype; 
			}
			fBound.prototype = new fNOP();
			
			return fBound;
		  };
		}
	}
	function fixConsole(){
		//console fix for older versions of IE
	    try{
	        window.console.log('Console detected.');
	    }
	    catch(err){
	        window.console = {};
	        window.console.log = window.console.error = window.console.info = window.console.debug = window.console.warn = window.console.trace = window.console.dir = window.console.dirxml = window.console.group = window.console.groupEnd = window.console.time = window.console.timeEnd = window.console.assert = window.console.profile = function(/*obj*/) { /*alert(obj.toString());*/ };
	    }
	}
	return function(){
		polyfillBind();
		addIE8Tag();
		fixConsole();
	};
});

define('index',['jquery','./polyfillIE'],function ($, polyfill) {
	polyfill();
	var IE8 = $('html').hasClass("IE8"); 

    $.fn.androidize = function(options){    
        console.log("loading");
        var _options = {
            color : "#666" //Color of the expanding circle
        }     
        $.extend(_options, options);
        //$(this).on("touchstart", function(){});
        $(this).on("mousedown touchstart", function(event){
            var $span = $(document.createElement('span'));
            var circleSize = 0;
            //X and Y coords 
            var x = _getPosX(event);
            var y = _getPosY(event);
            //Offsets
            var ol = $(this).offset().left;
            var ot = $(this).offset().top;
            //Element width
            var width = $(this).outerWidth();
            
            //Calculate offset from the center of the button
            var offset = Math.abs(x - ol - (width/2));
            //add the offset from the center to the width of the button. This will ensure the button is always entirely covered
            circleSize = offset * 2.1 + width;
            //Apply Widths to circle
            $span.css({"width" : circleSize , "height" : circleSize});
            //Center Circle within button
            $span.css({"left" : (x - ol -(circleSize/2)) , "top" : y - ot - (circleSize/2)}).addClass("btn-press").addClass("RMAndroid");
            //Append to element
            $(this).append($span);
            
            $span.on("webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend",
            function(event) { 
                if(event.originalEvent.animationName == "circle-press"){
                    $span.data("complete", 1);
                } 
            }); 
            
        });
        $(this).on("mouseup mouseout touchend", function(){
            var $span = $(this).children("span.RMAndroid").last();   
            if($span.data("complete")){
                $span.addClass("btn-release");
            }
            else{
                $span.on("webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend",
                function(event) { 
                    if(event.originalEvent.animationName == "circle-press"){
                        $span.addClass("btn-release");
                    } 
                    if(event.originalEvent.animationName == "circle-release"){
                        $span.remove(); 
                    }
                });
            }
            setTimeout(function(){
                $span.remove(); 
            },500);
        });
    }
	

	//Helper Functions ----------------------------------------------------------------------------------------------------------------------
    function _getPosX(evt) {
		if(typeof (evt.pageX) !== 'undefined') {
            return evt.pageX;
        } else if(typeof (evt.clientX) !== 'undefined'){
            return evt.clientX;
        } else if(typeof (evt.originalEvent.touches[0].pageX) !== 'undefined') {
            return evt.originalEvent.touches[0].pageX;
        }
    }
    function _getPosY(evt) {
		if(typeof (evt.pageY) !== 'undefined') {
            return evt.pageY;
        } else if(typeof (evt.clientY) !== 'undefined'){
            return evt.clientY;
        } else if(typeof (evt.originalEvent.touches[0].pageY) !== 'undefined') {
            return evt.originalEvent.touches[0].pageY;
        }
    }
    //---------------------------------------------------------------------------------------------------------------------------------------

});
define('jquery', [], function () { return jQuery; });
    return require('index')
}));