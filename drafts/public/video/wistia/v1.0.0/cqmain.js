function rsWistiaVideo(rsQno, rsSubqIndex, rsParams) {
    HideEmAll();
    const QuestionID = "#" + rsQno;
    //console.log("before we assign     ", rsParams.strVideoID)
    rsParams.strVideoID = (typeof rsParams.strVideoID === "undefined") ? "g2s6z25505" : rsParams.strVideoID;
    // console.log("after we assign     ", rsParams.strVideoID)
    rsParams.blnPopup = (typeof rsParams.blnPopup === "undefined") ? false : rsParams.blnPopup;
    rsParams.blnResponsiveThumbnail = (typeof rsParams.blnResponsiveThumbnail === "undefined") ? false : rsParams.blnResponsiveThumbnail;
    rsParams.blnFollowUp = (typeof rsParams.blnFollowUp === "undefined") ? false : rsParams.blnFollowUp;
    rsParams.blnHideQuestionTextOnPlay = (typeof rsParams.blnHideQuestionTextOnPlay === "undefined") ? false : rsParams.blnHideQuestionTextOnPlay;
    rsParams.blnDisablePause = (typeof rsParams.blnDisablePause === "undefined") ? true : rsParams.blnDisablePause;
    rsParams.blnReplay = (typeof rsParams.blnReplay === "undefined") ? true : rsParams.blnReplay;
    rsParams.intShowNextDelay = (typeof rsParams.intShowNextDelay === "undefined") ? 0 : rsParams.intShowNextDelay;
    //wistia  test video id  g2s6z25505
    var htmlWistia;
    $(document).ready(function() {
        var origin = window.location.origin;
        blnStatus = (origin.indexOf("preview") != -1 || origin.indexOf("test") != -1);
        //console.log(blnStatus);

        WistiaHtmlCreator(rsParams.strVideoID, rsParams.blnPopup, rsParams.blnResponsiveThumbnail);

        $.when(
            $.getScript("https://fast.wistia.com/embed/medias/" + rsParams.strVideoID + ".jsonp"),
            $.getScript("https://fast.wistia.com/assets/external/E-v1.js")
        ).done(function() {
            // Both scripts/libs have loaded, let's do some work!
            window._wq = window._wq || [];
            _wq.push({
                id: rsParams.strVideoID,
                controlsVisible: false,
                onReady: function(video) {
                    video.bind("pause", function() {
                        if (rsParams.blnDisablePause) {
                            video.play();
                        }
                    });
                    video.bind("play", function() {
                        if (rsParams.blnHideQuestionTextOnPlay) {
                            $(".cQuestionText > .rs-ht").eq(0).hide();
                        }
                        $(".w-bpb-wrapper.w-css-reset.w-css-reset-tree").hide();
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
                    video.bind("end", function() {
                        OnVideoEnd(rsParams.blnFollowUp);
                    });
                    video.bind('beforeIntrinsicIframe', function() {
                        // Prevent the "Escape" key from exiting full screen mode
                        $(document).on('keydown', function(event) {
                            if (event.keyCode === 27) {
                                event.stopPropagation();
                                event.preventDefault();
                            }
                        });
                    });
                }
            });
        });
    });

    function OnVideoEnd(followup) {
        let fu = followup;
        $("#btnNext").show();

        if (!rsParams.blnReplay) {
            $(".vid-player-holder").hide();
            $(".cQuestionText > .rs-ht").eq(0).hide();
            $(htmlWistia).remove();
        } else {
            $(".w-bpb-wrapper.w-css-reset.w-css-reset-tree").show();
        }


        if (fu) {
            $(".rsRow").show();
            $(".say").show();
        } else {
            $(".cRadio:input").eq(0).click();
            if (!rsParams.blnReplay) {
                $("#btnNext").click();
            }
        }
    }

    function HideEmAll() {
        $("#btnNext").hide();
        $(".rsRow").hide();
        $(".say").hide();
    }

    function WistiaHtmlCreator(strVidID, blnPopUps, blnThumbnail) {
        let _strVidID = strVidID;
        let _blnPopUps = blnPopUps;
        let _blnThumbnail = blnThumbnail;
        if (_blnPopUps) {
            if (_blnThumbnail) {
                htmlWistia = "<center class='vid-player-holder'><div class='wistia_responsive_padding' style='padding:56.25% 0 0 0;position:relative;'><div class='wistia_responsive_wrapper' style='height:100%;left:0;position:absolute;top:0;width:100%;'><span class='wistia_embed wistia_async_" + _strVidID + " popover=true popoverAnimateThumbnail=false videoFoam=true' style='display:inline-block;height:100%;position:relative;width:100%'>&nbsp;</span></div></div></center>";
            } else {
                htmlWistia = "<center class='vid-player-holder'><span class='wistia_embed wistia_async_" + _strVidID + " popover=true popoverAnimateThumbnail=false' style='display:inline-block;height:140px;position:relative;width:250px'>&nbsp;</span></center>";
            }
        } else {
            htmlWistia = "<center class='vid-player-holder'><div onclick='return false;' id='idA0' class='wistia_responsive_padding' style='padding:56.25% 0 0 0;position:relative;'><div class='wistia_responsive_wrapper' style='height:100%;left:0;position:absolute;top:0;width:100%;'>" +
                "<div class='wistia_embed wistia_async_" + _strVidID + " seo=false videoFoam=true fullscreenOnRotateToLandscape=false' style='height:100%;position:relative;width:100%'>" +
                "<div class='wistia_swatch' style='height:100%;left:0;opacity:0;overflow:hidden;position:absolute;top:0;transition:opacity 200ms;width:100%;'>" +
                "<img src='https://fast.wistia.com/embed/medias/" + _strVidID + "/swatch' style='filter:blur(5px);height:100%;object-fit:contain;width:100%;' alt='' onload='this.parentNode.style.opacity=1;' />" +
                "</div></div></div></div><br/></center>";
        }

        //$(QuestionID).find(".rs-ht").eq(0).after(htmlWistia);
        $(QuestionID).find(".cQuestionText").children(".rs-ht").eq(0).after(htmlWistia);

    }
}