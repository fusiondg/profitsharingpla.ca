/* globals window, define, setTimeout, ga */
define(['jquery', 'richmedia/carousel', 'richmedia/PSpoll'], function ($, RMCarousel, poll) {

    //google analytics
    var analytics;
    if (typeof ga === "undefined") {
        console.log("Error starting analytics");
        analytics = function(){console.log(arguments[2].eventCategory);};
    } else {
        analytics = ga;
    }
    $("[target='_blank']").on('mouseup touchend', sendAnalyticsEvent);   //use mouseup - "click" doesn't track middle-button clicks!


    function sendAnalyticsEvent(e){
        var langSuffix, bannerSuffix, category, categories;
        if (e.which !== 1 && e.which !== 2) return; //
        e.stopPropagation();

        langSuffix = document.documentElement.lang === "fr" ? " (French)" : " (English)";   //for language-specified clicks
        category = $(this).attr("data-category") || "default"; //default links
        bannerSuffix = $(this).closest("[data-banner]").length > 0 ? " (banner click)" : "";    //for click events in the banner
        categories = {
            video: "Video view" + langSuffix,
            pdf: "PDF View",
            slf: "Sun Life visit",
            trackRecord: "Track Record view",
            glance: "At-a-glance view",
            report: "Annual report view",
            welcome: "Welcome Brochure",
            survey: "Survey",
            default: "Outbound link"
        };

        analytics('send', 'event', {
            eventCategory: categories[category] + bannerSuffix,
            eventAction: "click",
            eventLabel: $(this).attr("href"),
            transport: 'beacon'
        });
    }



    //carousel initialization
    if($('#carouselOne').length > 0){
        $('#carouselOne').RMCarousel({
            transitionTimer: 5,
            autoTransition : true,
            previousBtn : $(".carousel .large-left-arrow"),
            nextBtn :  $(".carousel .large-right-arrow"),
            pagination : $(".carousel-pagination"),
            paginationTemplate : $("<li tabindex='0'><span class='sr-only'></span></li>"),
            paginationPauseTemplate : $("<li tabindex='0' class='carousel-pagination-pause'><span class='sr-only'>Play/Pause</span></li>"),
            paginationPause: ".carousel-pagination-pause"
        });
       window.setTimeout(function(){
            $('#carouselOne').RMCarousel("TOGGLE");
        },2000);
    }
    //$(".circle-active").androidize();
    $(".circle-active").on("touchstart", function(){});

    //email subscription
    $("#submit-newsletter").on("click", function(){
        var that = this;
        if(validateEmail($("#email-field").val())){
            $.ajax({
                url: "common/php/email.php",
                type: "POST",
                data: {address: $("#email-field").val()},
                success: function(result) {
                    //console.log(result);
                    $(that).parents(".newsletter").addClass("complete").removeClass("invalid");
                    if (ga) {   //email signup analytics
                        ga('send', 'event', {
                            eventCategory: "Email signup",
                            eventAction: "click",
                            eventLabel: "Email signup"
                        });
                    }
                }
            });
        }
        else{
          $(this).parents(".newsletter").addClass("error");
            setTimeout(function(){
                $(this).parents(".newsletter").removeClass("error");
            }.bind(this), 150);
        }
    });

    //page build animations
    $(window).on("scroll", function(){
       $(".reveal-down").each(function(){
          if(isOnScreen($(this)))$(this).addClass("animate");
       });
    });

    //mobile menu display
    $(window).on('resize', function(){
        if($('body').width() > 974){
            $('body').removeClass('mob-nav-open');
        }
    });
    $('.btn-mobile-menu').on('click', function(){
        $('body').addClass('mob-nav-open').css("overflow-y", "hidden");
    });
    $('.nav-list .btn-close, .blocker').on('click', function(){
        $('body').removeClass('mob-nav-open').css("overflow-y", "scroll");
    });


    //Poll code
    if ($("#poll-container").length > 0) {
        var _tempResult = 0;
        $(".poll-options .poll-option").on('click',function(){
            //console.log($(this).attr('val'))
            $(this).parent().find('.poll-option .icon').removeClass('selected');
            $(this).children().eq(0).addClass('selected');
            _tempResult = $(this).attr('val');
            //
            $(".poll-options").hide();
            $(".poll-results").show();
            $(".poll-results .arrow:eq("+_tempResult+")").show();
            /* $(".poll-results .poll-bar-fill:eq(0)").css('width','20%');
            $(".poll-results .poll-bar-fill:eq(1)").css('width','15%');
            $(".poll-results .poll-bar-fill:eq(2)").css('width','15%');
            $(".poll-results .poll-bar-fill:eq(3)").css('width','40%');
            $(".poll-results .poll-bar-fill:eq(4)").css('width','10%'); */
        });
        $("#pollresult").on('click', function(){
            $(".poll-options").hide();
            $(".poll-results").show();
            $(".poll-results .arrow:eq("+_tempResult+")").show();
        });
    }

    //force menu to display appropriately
    setTimeout(function(){
        $(window).trigger("scroll");
    }, 500);

    function isOnScreen(element){
        //console.log(element.offset().top > $(window).height());
        return (element.offset().top + 150 > $(window).scrollTop() + $(window).height()) ? false : true;
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
});
