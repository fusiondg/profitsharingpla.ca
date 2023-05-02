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

	//Constructor
	function MouseAllax(elems, options){
		typeof options != "undefined" ? this.options(options):this.options({});
		this.elems = [];
        this.startPos = [];
		for(var i in elems){ //Cache elements as JQuery Objects
			(typeof elems[i] == "string")?this.elems.push(elem):this.elems.push(elems[i]); 
		}
		//Create Random string to name the event (used to destroy specific events)
	  	this.id = makeID(5);
        this.updatePositions();
	  	this.create();
	}
	
	MouseAllax.prototype.create = function(){      
        $(window).on("resize."+ this.id, (function(){
            this.updatePositions();
        }).bind(this));
        
		$(this.options.eventElement).on("mousemove."+ this.id, (function(event) {
			//Declare globals
			var layer = 1;

			for(var i in this.elems){
                layer = (this.elems[i].data("layer"))?this.elems[i].data("layer"):layer;
                
                //Front layer moves with mouse, all layers greater than one move away from the mouse, determines how far the offset will be based on the current layer.
	   			var layerOffset = (layer > 1)? -(this.options.offsetScale / layer) : this.options.offsetScale / layer; 
	   			var x = 0, y = 0;
                
	   			if(!this.options.disableX){
	   				x = (_getPosX(event) - ($(window).width()/2)) / layerOffset;
	 				//x = (x - ($(window).width() -  this.elems[i].outerWidth()) / 2) / layerOffset; Center Elem
		   			//Restrict X axis movements
			   		if(x > this.options.maxXOffset) x = this.options.maxXOffset; 
			   		if(Math.abs(x) > this.options.maxXOffset) x = -this.options.maxXOffset;
                    
			   	}

		   		if(!this.options.disableY){
		   			y = (_getPosY(event) - ($(window).height()/2)) / layerOffset;
					//y = (y - ($(window).height() -  this.elems[i].outerWidth()) / 2) / layerOffset; Center Elem
			   		//Restrict Y axis movements
				    if(y > this.options.maxYOffset) y = this.options.maxYOffset; 
				    if(Math.abs(y) >this.options. maxYOffset) y = -this.options.maxYOffset;
                   
		   		}
                
				if(!IE8){ //Currently Disabled. 3D translate causes text to blur
				     this.elems[i].css({
						'-webkit-transform' : 'translate3d(' + x + 'px,' + y + 'px,0)',
						'-moz-transform' : 'translate3d(' + x + 'px,' + y + 'px,0)',
						'-ms-transform' : 'translate3d(' + x + 'px,' + y + 'px,0)',
						'-o-transform' : 'translate3d(' + x + 'px,' + y + 'px,0)',
						'transform' : 'translate3d(' + x + 'px,' + y + 'px, 0)'
					});
				}
				else{
                    y += this.startPos[i].top;
                    x += this.startPos[i].left;
					 this.elems[i].css({'left' : x, 'top' : y});
				}

	   			++layer;
			}
		}).bind(this));
	};
	MouseAllax.prototype.destroy = function(reset){
		$(this.options.eventElement).unbind("mousemove." + this.id);
        $(window).unbind("resize." + this.id);
		if(reset || typeof reset == "undefined")this.reset();
	};
	MouseAllax.prototype.reset = function(){
		for(var i in this.elems){
			this.elems[i].removeAttr('style');
		}
	}
    MouseAllax.prototype.updatePositions = function(){
        this.startPos = [];
		for(var i in this.elems){
            this.reset();
			this.startPos.push(this.elems[i].position());
		}
	}
	MouseAllax.prototype.options = function(options){
        //Notes:
        // A data-layer property can be added to elements to override their default
        // Parallax layer. The higher the number the faster it moves. 1 is the furthest back.
        
		this.options = $.extend(
			{},{
                effectDistance: 5, //Determines how far the mouse moves before an effect takes place
				eventElement  : document, //Decides which element will recieve the movement event
		    	maxYOffset : 9000000, //Decides how far an element can travel on the Y Axis
		    	disableY   : false, //If true the Y axis will no longer parallax
				maxXOffset : 9000000, //Decides how far an element can travel on the X Axis
				disableX   : false, //If true the Y axis will no longer parallax
				offsetScale : 40 //The scale of the movements per pixel movement of mouse
	    	},
			options
		);
	};
	

	//Helper Functions ---------------------------------------------------------------------------------------------------------------------
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
    function makeID(len){
	    var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz";

	    for( var i=0; i < len; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}
    //---------------------------------------------------------------------------------------------------------------------------------------

    return MouseAllax;
});
define('jquery', [], function () { return jQuery; });
    return require('index')
}));