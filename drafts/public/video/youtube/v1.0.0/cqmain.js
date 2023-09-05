function rsYouTubeVideo(rsQno, rsSubqIndex, rsParams) {
    HideEmAll();
    const QuestionID = "#" + rsQno;
    rsParams.strVideoID = (typeof rsParams.strVideoID === "undefined") ? "ZBQN8LAofnw" : rsParams.strVideoID;
    rsParams.blnFollowUp = (typeof rsParams.blnFollowUp === "undefined") ? true : rsParams.blnFollowUp;
    rsParams.blnHideQuestionTextOnPlay = (typeof rsParams.blnHideQuestionTextOnPlay === "undefined") ? false : rsParams.blnHideQuestionTextOnPlay;
    rsParams.intShowNextDelay = (typeof rsParams.intShowNextDelay === "undefined") ? 2 : rsParams.intShowNextDelay;

    var htmlYT = "<div id='YTplayerContainers'><div id='YTplayerC'></div></div><div id='time' class='hidden'></div>";
    $(QuestionID).find(".cQuestionText").children(".rs-ht").eq(0).after(htmlYT);

    let player;
    let playerContainer = document.getElementById('YTplayerContainers');

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('YTplayerContainers', {
            videoId: rsParams.strVideoID,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            },
            playerVars: {
                'origin': window.location.origin,
                'iv_load_policy': 3,
                'disablekb': 1,
                'autoplay': 0,
                'controls': 0,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'SameSite': 'None'
            }
        });
    }

    function onPlayerReady(event) {
        //event.target.playVideo();
        //console.log("Player ready");
        // console.log(player);
        resizePlayer(player.playerInfo.size.width, player.playerInfo.size.height);
        //console.log("Width: " + player.playerInfo.size.width);
        //console.log("Height: " + player.playerInfo.size.height);
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            //Lets put the parent div ot top to block any kinds of hover/clicks
            $("#YTplayerContainers").css({
                "z-index": "9999",
                "background-color": "rgba(255, 255, 255, 0.7)",
                "pointer-events": " none"
            });
            if (rsParams.blnHideQuestionTextOnPlay) {
                $(".rs-ht").eq(0).hide();
            }

            //setInterval(function() {document.getElementById("time").innerHTML = `Current Time: ${player.getCurrentTime()} seconds`;}, 100);
            if (rsParams.intShowNextDelay) {
                setTimeout(function() {
                    $("#btnNext").show();
                    if (rsParams.blnFollowUp) {
                        $(".rsRow").show();
                        $(".say").show();
                    }
                }, rsParams.intShowNextDelay * 1000);
            }
            resizePlayer(player.playerInfo.size.width, player.playerInfo.size.height);
        }
        if (event.data === YT.PlayerState.ENDED) {
            OnVideoEnd(rsParams.blnFollowUp);
        }
    }

    $(document).ready(function() {
        $.getScript("https://www.youtube.com/iframe_api", function() {
            $.getScript("https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js", function() {
                onYouTubeIframeAPIReady();
            });
        });
    });
    window.addEventListener('resize', function() {
        resizePlayer(player.playerInfo.size.width, player.playerInfo.size.height);
    });

    function resizePlayer(theWidth, theHeight) {
        let videoAspectRatio = theHeight / theWidth;
        let containerWidth = playerContainer.offsetWidth;
        let playerHeight = containerWidth * videoAspectRatio;
        playerContainer.style.height = playerHeight + 'px';
        player.setSize(containerWidth, playerHeight);
    }

    function HideEmAll() {
        $("#btnNext").hide();
        $(".rsRow").hide();
        $(".say").hide();
    }

    function OnVideoEnd(followup) {
        let fu = followup;
        $("#btnNext").show();
        $("#YTplayerContainers").hide();
        $(".regular").hide();
        $(player).remove();
        $(playerContainer).remove();
        $("#YTplayerContainers").remove();
        if (fu) {
            $(".rsRow").show();
            $(".say").show();
        } else {
            $(".cRadio:input").eq(0).click();
            $("#btnNext").click();
        }
    }
}