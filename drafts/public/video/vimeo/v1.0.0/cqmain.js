function rsVimeoVideo(rsQno, rsSubqIndex, rsParams) {
    HideEmAll();
    const QuestionID = "#" + rsQno;
    //console.log("BEFORE :  ", rsParams.strVideoID)
    rsParams.strVideoID = (typeof rsParams.strVideoID === "undefined") ? "801159651" : rsParams.strVideoID.toString();
    //console.log("AFTER :  ", rsParams.strVideoID)

    rsParams.blnFollowUp = (typeof rsParams.blnFollowUp === "undefined") ? true : rsParams.blnFollowUp;
    rsParams.blnBlockPlayer = (typeof rsParams.blnBlockPlayer === "undefined") ? true : rsParams.blnBlockPlayer;
    rsParams.blnHideQuestionTextOnPlay = (typeof rsParams.blnHideQuestionTextOnPlay === "undefined") ? false : rsParams.blnHideQuestionTextOnPlay;
    rsParams.intShowNextDelay = (typeof rsParams.intShowNextDelay === "undefined") ? 2 : rsParams.intShowNextDelay;


    let htmlVimeo = "<div id='VimeoPlayerContainerC'><div id='VimeoPlayerC'></div></div><div id='time' class='hidden'></div>";
    var player;
    $(QuestionID).find(".cQuestionText").children(".rs-ht").eq(0).after(htmlVimeo);

    function onVimeoAPIReady() {
        player = new Vimeo.Player('VimeoPlayerC', {
            id: rsParams.strVideoID,
            loop: false,
            height: $("#VimeoPlayerContainerC").width() * 0.6,
            width: $("#VimeoPlayerContainerC").width()
        });
        Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(dimensions => {
            const [width, height] = dimensions;
            //console.log(width, height, player)
        });
    }

    $(document).ready(function() {
        $.getScript("https://player.vimeo.com/api/player.js", function() {
            onVimeoAPIReady();
            player.getDuration().then(function(duration) {
                //console.log('The video length is: ' + duration);
            });

            // Listen for the 'play' event
            player.on('play', function() {
                //console.log('The video has started playing');
                if (rsParams.blnBlockPlayer) {
                    $("#VimeoPlayerContainerC").css({
                        "z-index": "9999",
                        "background-color": "rgba(255, 255, 255, 0.7)",
                        "pointer-events": " none"
                    });
                }
                if (rsParams.blnHideQuestionTextOnPlay) {
                    $(".cQuestionText > .rs-ht").eq(0).hide();
                }
                if (rsParams.intShowNextDelay) {
                    setTimeout(function() {
                        $("#btnNext").show();
                        if (rsParams.blnFollowUp) {
                            $(".rsRow").show();
                            $(".say").show();
                        }
                    }, rsParams.intShowNextDelay * 1000);
                }
            });

            // Listen for the 'pause' event
            player.on('pause', function() {
                //console.log('The video has been paused');
            });

            // Listen for the 'ended' event
            player.on('ended', function() {
                console.log('The video has ended');
                OnVideoEnd(rsParams.blnFollowUp);
            });

            // Listen for the 'timeupdate' event
            player.on('timeupdate', function(data) {
                //console.log('The current playback time is: ' + data.seconds);
            });
        });
    });
    window.addEventListener('resize', function() {
        let intHei = $("#VimeoPlayerContainerC").width() * 0.6;
        let intWid = $("#VimeoPlayerContainerC").width();

        resizePlayer(intWid, intHei);
    });

    function HideEmAll() {
        $("#btnNext").hide();
        $(".rsRow").hide();
        $(".say").hide();
    }

    function OnVideoEnd(followup) {
        let fu = followup;
        $("#btnNext").show();
        $("#VimeoPlayerContainerC").hide();
        $(".cQuestionText > .rs-ht").eq(0).hide();
        $(player).remove();
        $(htmlVimeo).remove();
        $("#VimeoPlayerContainerC").remove();

        if (fu) {
            $(".rsRow").show();
            $(".say").show();
        } else {
            $(".cRadio:input").eq(0).click();
            $("#btnNext").click();
        }
    }

    function resizePlayer(theWidth, theHeight) {
        $("#VimeoPlayerC").find("iframe").width(theWidth)
        $("#VimeoPlayerC").find("iframe").height(theHeight)
    }
}