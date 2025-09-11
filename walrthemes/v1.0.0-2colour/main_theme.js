var devTest = false;
$(window).on('load', function () {
	devTest = window.location.search.includes('devtest');
	cthemeff();
	cthemePageReady("ready");
	
	// Create a MutationObserver when the document is fully loaded
	var targetNode = document.getElementById("rsPanelMain");
	var config = { childList: true, subtree: true }; // Observe only child list changes
	
	var observer = new MutationObserver(function (mutationsList, observer) {
		let shouldScroll = false;
		
		for (var mutation of mutationsList) {
			if (mutation.type === "childList") {
				if (mutation.target.closest('.rsScrollGridContent')) {
					continue;
				}
				// check if relevant nodes are added or removed
				let relevantMutation = false;
					
				// check added nodes
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						let nodeName = node.nodeName.toLowerCase();
						if (nodeName === 'div' || nodeName === 'span' || nodeName === 'table') {
						    relevantMutation = true;
						}
					}
				});
				
				// check removed nodes
				mutation.removedNodes.forEach(function(node) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						let nodeName = node.nodeName.toLowerCase();
						if (nodeName === 'div' || nodeName === 'span' || nodeName === 'table') {
							relevantMutation = true;
						}
					}
				});
				
				if (relevantMutation) {
					cthemePageReady("mutation");
					putSomeClasses();
					
					// Adjust viewport settings for iPhone
					if (navigator.userAgent.indexOf('iPhone') > -1) {
						let viewport = document.querySelector("[name=viewport]");
						viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes");
					}
					
					// Attach event handlers
					$("#btnNext").off('click').on('click', function() {
						// any clicks on next button are here
						shouldScroll = true;
					});
					
					$(".rsBtnGridSingle").off('click').on('click', function() {
					//document.querySelector('.mainContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
						document.body.scrollTop = 0;
						document.documentElement.scrollTop = 0;
					});
					
					shouldScroll = true;
					break; // Exit after handling the first relevant mutation
				}
			}
		}
		
		if (shouldScroll) {
			//document.querySelector('.mainContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
			removeFocusFromAllElements();
			shouldScroll = false;
		}
	});
	observer.observe(targetNode, config);
});



function cthemeff() {
  // Detect Firefox using JavaScript
  if (navigator.userAgent.indexOf("Firefox") != -1) {
      // User is using Firefox
      var firefoxStyles = document.createElement("link");
      firefoxStyles.rel = "stylesheet";
      firefoxStyles.type = "text/css";
      firefoxStyles.href = "https://quenchtec.github.io/visualisations/walrthemes/v1.0.0-2colour/main_theme_ff_only.css"; // Link to your Firefox-specific styles
      document.head.appendChild(firefoxStyles);
  }
}

function putSomeClasses() {
	  if (devTest) console.log("putSomeClasses start");
	  var $cTables = $(".cTable");
	  $cTables.each(function () {
		if (($(this).hasClass("rsSingle") || $(this).hasClass("rsMulti")) && !$(this).hasClass("mobileGrid") && !$(this).hasClass("desktopGrid")) {
			//console.log("if", $(this).prop("class"));
			$(this).find(".rsRow").each(function(){
				$(this).children(".cRowBlockText:not(:has(select))").addClass("GroupingHeader");
				if ($(this).find("input").prop("checked")) {
					$(this).addClass("rsSelected");
				} else {
					$(this).removeClass("rsSelected");
				}
			});

			$(this).find(".rsRow, .rsRow .cCellOpenText .cTextInput").on("click keyup", function () {
				$(".rsRow").each(function () {
					if ($(this).find("input").prop("checked")) {
						$(this).addClass("rsSelected");
					} else {
						$(this).removeClass("rsSelected");
					}
				});
			});
		} else if ($(this).hasClass("mobileGrid")) {
			//console.log("else if A ", $(this).prop("class"));
			$(this).find(".rsRow").find(".cCell").each(function() {
				if ($(this).find(".cRadio").prop("checked")) {
					$(this).addClass("rsSelected");
				}
			});
			$(this).find(".rsRow").find(".cCell").on("click", function () {
				$(this).parent().find(".cCell").each(function () {
					if ($(this).find("input").prop("checked")) {
						$(this).addClass("rsSelected");
					} else {
						$(this).removeClass("rsSelected");
					}
				});
				$(this).parent().find(".rsRow").removeClass("rsSelected");
			});
		} else if ($(this).hasClass("desktopGrid")) {
			//console.log("else if B ", $(this).prop("class"));
			$(this).find(".rsRow").find("input").on("change", function () {
				$(this).parent().parent().find(".cCell").each(function () {
					if ($(this).find("input").prop("checked")) {
						$(this).addClass("rsGridCellSelected");
					} else {
						$(this).removeClass("rsGridCellSelected");
					}
				});
			});
		}
	});
}

function isMobileDevice() {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
	if(userAgent.indexOf('iPhone') > -1 ){
		document.querySelector("[name=viewport]").setAttribute("content","");
		document.querySelector("[name=viewport]").setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
	}
	//return /Android|webOS|iPhone|IEMobile|Opera Mini|/i.test(userAgent) && !/iPad|Tablet/i.test(userAgent); // Exclude iPads and tablets
	//return /Android|webOS|iPhone|IEMobile|Opera Mini|iPad|Tablet/i.test(userAgent);
	return /Android|webOS|iPhone|IEMobile|Opera Mini/i.test(userAgent) || (/Macintosh/i.test(userAgent) && 'ontouchend' in document);
}

function cthemePageReady() {
	  var strID = $('#rs_lang').val();
	  var customNext = "";
	  var customPrev = "";
	  var customError = "";
	  var customDropDown = "";
	
	  try {
	  	  //removeFocusFromAllElements();
	  } catch (error) {
	  	  console.error('An error occurred while scrolling:', error);
	  }
	  if (typeof CustomGhostMessage === "undefined") {CustomGhostMessage = "Please, type in...";}
	  if (typeof myCustomGhost != "undefined") {CustomGhostMessage = myCustomGhost[strID];}

	  if (strID == "sv") {CustomGhostMessage = "Snälla, skriv in...";}

	  if (strID == "ar" || strID == "he" || strID == "iw" || strID == "ur" || strID == "fa" || strID == "ar-sa" || strID == "ar-ue") {
	      $(".panelMainContainer").css('direction', 'rtl');
	      $(".cRowSubQuestion").css('text-align', 'right');
	      $(".cCellSubQuestion").css('text-align', 'right');
	      $(".rs-ht").css({
			"direction": "rtl",
	        "text-align": "right",
	      });
	  }

	  if (typeof myCustomNext != "undefined") {
	      customNext = myCustomNext[strID];
	  }
	  if (typeof myCustomPrevious != "undefined") {
	      customPrev = myCustomPrevious[strID];
	  }
	  if (typeof myCustomError != "undefined") {
	      customError = myCustomError[strID];
	  }
	  if (typeof myCustomDropdown != "undefined") {
	      customDropDown = myCustomDropdown[strID];
	  }
	
	  ghostText(CustomGhostMessage);
	  custNavigationText(customNext,customPrev,customError,customDropDown);

	  $(".rsSingleGrid, .rsMultiGrid").each(function () {
	  	  if ((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))) {
	  	  	  gridUpdate($(this));
	  	  	  if (devTest) console.log("gridUpdate cthemePageReady");
	  	  }
	  });

	  if(navigator.userAgent.indexOf('iPhone') > -1 ){
	  	  document.querySelector("[name=viewport]").setAttribute("content","");
	  	  document.querySelector("[name=viewport]").setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
	  }

	  const scrollFunc = () => {
	  	  var targetElement = document.querySelector('.progressContainer');
	  	  if (targetElement) {
	  	  	  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
	  	  	  window.scrollTo({ top: 0, behavior: 'smooth' });
	  	  } else {
	  	  	  debouncedScrollFunc();
	  	  }
  	  };

	  const debouncedScrollFunc = debounce(scrollFunc, 200); // Adjust the delay as needed
	  $("#btnNext").click(function(){debouncedScrollFunc();});
	  putSomeClasses();
	  tooltipshandle()
	  if (devTest) console.log("putSomeClasses from theme ready"); 
}


function removeFocusFromAllElements() {
	//var focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
	var focusableElements = document.querySelectorAll('input, textarea');
	focusableElements.forEach(function(element) {
		element.blur();
	});
	/*
	var btnNext = document.getElementById("btnNext");
	if (btnNext === document.activeElement) {
		btnNext.blur();
	}*/
}

function custNavigationText(theNext, thePrevious, theError, theDropdown) {
  if (theNext && theNext.trim() !== "" && typeof theNext !== undefined) {$('#btnNext').val(theNext);}
  if (theError && theError.trim() !== "" && typeof theError !== undefined) {$('.cError').val(theError);}
  if (thePrevious && thePrevious.trim() !== "" && typeof thePrevious !== undefined) {$('#btnPrevious').val(thePrevious);}

	if (theDropdown && theDropdown.trim() !== "" && theDropdown !== "undefined") {
		document.querySelectorAll("select").forEach(sel => {
			let firstOption = sel.querySelector("option");
			if (firstOption) {
				firstOption.text = theDropdown;
			}
		});
	}

}


function ghostText(custText) {
	$('.cTextInput').each(function () {
		$(this).attr("placeholder", custText);
	});
}

function gridUpdate(grid_this) {
	if (devTest) console.log("grid update start");
	var _grid_this;
	if (grid_this) {
		_grid_this = grid_this;
	} else {
		$(".rsSingleGrid, .rsMultiGrid").each(function () {
			if ((!$(this).hasClass("rsProcessedGrid")) && (!$(this).hasClass("rsCQ"))) {
				_grid_this = $(this);
			}
		});
	}

	let gridID = $(_grid_this).prop("id");

	if (($(_grid_this).hasClass("rsSingleGrid") || $(_grid_this).hasClass("rsMultiGrid")) && (!$(_grid_this).hasClass("rsCQ")) && (!$(_grid_this).hasClass("rsProcessedGrid"))) {
		let gridIND = gridID.split("_")[1];
		$("#" + gridID).addClass("rsProcessedGrid");
		if (isMobileDevice()) {
			$(".rsProcessedGrid").addClass("mobileGrid");
			setTimeout(function () {
				$(_grid_this).find(".rsRow").each(function () {
					$(this).children(".cCell").each(function (e) {
						$(this).append($("#h_" + gridIND + "_" + e).clone());
					});
				});
				$(_grid_this).find("td.cCellHeader").parent().remove();
          		}, 200);
		} else {
          		$(".rsProcessedGrid").addClass("desktopGrid");
          		setTimeout(function () {
				//let colLength = $('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").length;
				let colLength = $('#' + gridID).find(".cCellHeader").length;
				//let gridWidth = $('#' + gridID).find(".rsHeaderRow")[0].clientWidth;
				let gridWidth = $('#' + gridID).find(".rsHeaderRow")[0]?.clientWidth ?? $('#' + gridID).find("> tbody")[0].clientWidth;
				var cHeight = 40;
				var cWidth = 0;
				//console.log(gridWidth);
				$('#' + gridID).find(".rsHeaderRow").css("width", gridWidth+"px");
				$('#' + gridID).find(".cCellFirstHeader").css("min-width", '30%');
				$('#' + gridID).find(".cCellFirstHeader").css("width", ((gridWidth * 1.2) / colLength) + 'px');
				$('#' + gridID).find(".cCellFirstHeader").addClass("revisedCellFirstHeader");

				$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("min-width", (50 / colLength-1) + '%');
				//$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", (gridWidth / (colLength+1)) + 'px');
				$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", (80 / colLength-1) + '%');

				$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").each(function(){if(cWidth < $(this)[0].clientWidth) {cWidth = $(this)[0].clientWidth;$(this).addClass("revisedColumn");}});
				//$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("min-width", (cWidth * 0.8) + 'px');
				$('#' + gridID).find(".cCellHeader").not(".cCellFirstHeader").css("width", cWidth + 'px');
            
				$(".cCellFirstHeader").css("max-width", (100-(colLength*10))+"%");
				$(".cCellFirstHeader").css("width", "auto");
				//$(".cCellFirstHeader").css("width", gridWidth-((cWidth * 1.5)*colLength) + 'px');

				$('.rsRow').find(".rs-ht").each(function () {if (($(this)[0].clientHeight > cHeight) && ($(this)[0].clientHeight <=70)) { cHeight = $(this)[0].clientHeight; } });
				$(".rsRow").each(function () { $(this).css("height", cHeight + "px"); });
			}, 350);
		}
	}
}

function debounce(func, timeout = 500) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
}

function adjustTooltipPosition(tooltip, element) {
	var tooltipWidth = tooltip.outerWidth();
	var tooltipLeft = element.offset().left + element.outerWidth() / 2 - tooltipWidth / 2;
	var windowWidth = $(window).width();
	if (tooltipLeft < 0) {
		tooltipLeft=0;
		tooltip.css('left', '');
	} else if (tooltipLeft + tooltipWidth > windowWidth) {
		tooltipLeft = (windowWidth - tooltipWidth);
		tooltip.css('left', tooltipLeft);
	}
}
function tooltipshandle(){
	var tooltipTimeout;
	$(".tooltip").mouseenter(function(){
		var $tooltip = $(this).find('.tooltiptext');
		var _this = $(this);
		var delay = 500;
		tooltipTimeout = setTimeout(function(){
			$tooltip.css("visibility", "visible").animate({opacity: 1}, 350);
			adjustTooltipPosition($tooltip, _this);
		}, delay);
	}).mouseleave(function(){
		clearTimeout(tooltipTimeout);
		var $tooltip = $(this).find('.tooltiptext');
		$tooltip.css("visibility", "hidden").animate({opacity: 0}, 350);
	});
}
window.addEventListener('resize', debounce(function (event) {
	var $tooltips = $('.tooltip .tooltiptext');
	
	// Check if there are any tooltips on the page
	if ($tooltips.length > 0) {
		var $element = $('.tooltip');
		adjustTooltipPosition($tooltips, $element);
	}
	cthemePageReady();
	gridUpdate();/*
	if (window.innerWidth > 980) {
	if ($(".rsProcessedGrid").hasClass("mobileGrid")) {
	$(".rsProcessedGrid").removeClass("mobileGrid");
	$(".rsProcessedGrid").addClass("desktopGrid");
	cthemePageReady();
	gridUpdate();
	}
	} else {
	if (isMobileDevice()){
	if (!$(".rsProcessedGrid").hasClass("mobileGrid")) {
	$(".rsProcessedGrid").addClass("mobileGrid");
	$(".rsProcessedGrid").removeClass("desktopGrid");
	cthemePageReady();
	gridUpdate();
	}
	}
	}*/
}, 500));
