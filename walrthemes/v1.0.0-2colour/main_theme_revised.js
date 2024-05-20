$(document).ready(function () {
  // Call your initial setup function
  cthemeff();
  cthemePageReady();
  tooltipshandle();
  
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("call from DR");
  
  // Create a MutationObserver when the document is fully loaded
  const targetNode = document.getElementById("rsPanelMain");
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
              cthemePageReady(); // Call your function here
              if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("log from Before Break and after cThemePageReady was called");
              break; // We've handled the mutation, no need to continue
          }
      }
  });
  observer.observe(targetNode, config);
});

function cthemeff() {
  // Detect Firefox using JavaScript
  if (navigator.userAgent.indexOf("Firefox") != -1) {
      // User is using Firefox
      const firefoxStyles = document.createElement("link");
      firefoxStyles.rel = "stylesheet";
      firefoxStyles.type = "text/css";
      firefoxStyles.href = "https://quenchtec.github.io/visualisations/walrthemes/v1.0.0-2colour/main_theme_ff_only.css"; // Link to your Firefox-specific styles
      document.head.appendChild(firefoxStyles);
  }
}

function putSomeClasses() {
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("putSomeClasses start");
  
  const $cTables = $(".cTable");
  $cTables.each(function () {
      const $this = $(this);
      const isGrid = $this.hasClass("rsSingle") || $this.hasClass("rsMulti");
      const isMobile = $this.hasClass("mobileGrid");
      const isDesktop = $this.hasClass("desktopGrid");

      if (isGrid && !isMobile && !isDesktop) {
          $this.find(".rsRow").each(function () {
              const $row = $(this);
              $row.children(".cRowBlockText:not(:has(select))").addClass("GroupingHeader");
              $row.toggleClass("rsSelected", $row.find("input").prop("checked"));
          });

          $this.find(".rsRow, .rsRow .cCellOpenText .cTextInput").on("click keyup", function () {
              $(".rsRow").each(function () {
                  const $row = $(this);
                  $row.toggleClass("rsSelected", $row.find("input").prop("checked"));
              });
          });

      } else if (isMobile) {
          $this.find(".rsRow .cCell").on("click", function () {
              const $cell = $(this);
              $cell.parent().find(".cCell").each(function () {
                  $(this).toggleClass("rsSelected", $(this).find("input").prop("checked"));
              });
              $cell.parent().find(".rsRow").removeClass("rsSelected");
          });

      } else if (isDesktop) {
          $this.find(".rsRow input").on("change", function () {
              const $input = $(this);
              $input.parent().parent().find(".cCell").each(function () {
                  $(this).toggleClass("rsGridCellSelected", $(this).find("input").prop("checked"));
              });
          });
      }
  });
}

function isMobileDevice() {
  if (navigator.userAgent.indexOf('iPhone') > -1) {
      document.querySelector("[name=viewport]").setAttribute("content", "");
      document.querySelector("[name=viewport]").setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || navigator.vendor || window.opera);
}

function cthemePageReady() {
  const strID = $('#rs_lang').val();
  let customNext = "";
  let customPrev = "";
  let customError = "";

  try {
      removeFocusFromAllElements();
  } catch (error) {
      console.error('An error occurred while scrolling:', error);
  }

  if (typeof CustomGhostMessage === "undefined") { CustomGhostMessage = "Please, type in..."; }
  if (typeof myCustomGhost != "undefined") { CustomGhostMessage = myCustomGhost[strID]; }

  if (strID == "sv") { CustomGhostMessage = "Snälla, skriv in..."; }

  if (typeof myCustomNext != "undefined") { customNext = myCustomNext[strID]; }
  if (typeof myCustomPrevious != "undefined") { customPrev = myCustomPrevious[strID]; }
  if (typeof myCustomError != "undefined") { customError = myCustomError[strID]; }

  ghostText(CustomGhostMessage);
  custNavigationText(customNext, customPrev, customError);

  $(".rsSingleGrid, .rsMultiGrid").each(function () {
      const $this = $(this);
      if (!$this.hasClass("rsProcessedGrid") && !$this.hasClass("rsCQ")) {
          gridUpdate($this);
          if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("gridUpdate cthemePageReady");
      }
  });

  if (navigator.userAgent.indexOf('iPhone') > -1) {
      document.querySelector("[name=viewport]").setAttribute("content", "");
      document.querySelector("[name=viewport]").setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  }

  const scrollFunc = () => {
      const targetElement = document.querySelector('.progressContainer');
      if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          debouncedScrollFunc();
      }
  };

  const debouncedScrollFunc = debounce(scrollFunc, 200); // Adjust the delay as needed
  $("#btnNext").click(function () { debouncedScrollFunc(); });
  putSomeClasses();
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("putSomeClasses from theme ready");
}

function removeFocusFromAllElements() {
  const btnNext = document.getElementById("btnNext");
  if (btnNext === document.activeElement) {
      btnNext.blur();
  }
}

function custNavigationText(theNext, thePrevious, theError) {
  const _theNext = typeof theNext !== "undefined" ? theNext : '';
  const _thePrevious = typeof thePrevious !== "undefined" ? thePrevious : '';
  const _theError = typeof theError !== "undefined" ? theError : '';

  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log(_theNext, _thePrevious, _theError);

  if (_theNext && _theNext.length > 1) { $('#btnNext').val(_theNext); }
  if (_thePrevious && _thePrevious.length > 1) { $('#btnPrevious').val(_thePrevious); }
  if (_theError && _theError.length > 1) { $('.cError').val(_theError); }
}

function ghostText(custText) {
  $('.cTextInput').attr("placeholder", custText);
}

function gridUpdate(grid_this) {
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) console.log("grid update start");
  const $grid_this = grid_this || $(".rsSingleGrid, .rsMultiGrid").not(".rsProcessedGrid, .rsCQ").first();

  if ($grid_this.length && !$grid_this.hasClass("rsProcessedGrid")) {
      const gridID = $grid_this.prop("id");

      $grid_this.addClass("rsProcessedGrid");
      if (isMobileDevice()) {
          $(".rsProcessedGrid").addClass("mobileGrid");
          setTimeout(() => {
              $(".rsRow .cCell").each(function (e) {
                  const gridIND = gridID.split("_")[1];
                  $(this).append($("#h_" + gridIND + "_" + e).clone());
              });
              $("td.cCellHeader").parent().remove();
          }, 200);
      } else {
          $(".rsProcessedGrid").addClass("desktopGrid");
          setTimeout(() => {
              const $headerRow = $('#' + gridID + ' .rsHeaderRow');
              const gridWidth = $headerRow[0].clientWidth;
              let cWidth = 0;
              const colLength = $headerRow.find(".cCellHeader").length;

              $headerRow.css("width", gridWidth + "px");
              $headerRow.find(".cCellFirstHeader")
                  .css({ "min-width": '30%', "width": ((gridWidth * 1.2) / colLength) + 'px' })
                  .addClass("revisedCellFirstHeader");

              $headerRow.find(".cCellHeader").not(".cCellFirstHeader")
                  .css({ "min-width": (50 / colLength - 1) + '%', "width": (50 / colLength - 1) + '%' })
                  .each(function () {
                      const $this = $(this);
                      if (cWidth < $this[0].clientWidth) {
                          cWidth = $this[0].clientWidth;
                          $this.addClass("revisedColumn");
                      }
                  }).css("width", cWidth + 'px');

              $(".cCellFirstHeader").css({ "max-width": (100 - (colLength * 10)) + "%", "width": "auto" });

              let cHeight = 40;
              $(".rsRow .rs-ht").each(function () {
                  const height = $(this)[0].clientHeight;
                  if (height > cHeight && height <= 70) {
                      cHeight = height;
                  }
              });

              $(".rsRow").css("height", cHeight + "px");
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
  const tooltipWidth = tooltip.outerWidth();
  let tooltipLeft = element.offset().left + element.outerWidth() / 2 - tooltipWidth / 2;
  const windowWidth = $(window).width();

  if (tooltipLeft < 0) {
      tooltipLeft = 0;
  } else if (tooltipLeft + tooltipWidth > windowWidth) {
      tooltipLeft = windowWidth - tooltipWidth;
  }

  tooltip.css('left', tooltipLeft);
}

function tooltipshandle() {
  let tooltipTimeout;

  $(".tooltip").hover(
      function () {
          const $tooltip = $(this).find('.tooltiptext');
          const $this = $(this);
          tooltipTimeout = setTimeout(function () {
              $tooltip.css("visibility", "visible").animate({ opacity: 1 }, 350);
              adjustTooltipPosition($tooltip, $this);
          }, 500);
      },
      function () {
          clearTimeout(tooltipTimeout);
          const $tooltip = $(this).find('.tooltiptext');
          $tooltip.css("visibility", "hidden").animate({ opacity: 0 }, 350);
      }
  );
}

window.addEventListener('resize', debounce(function () {
  const $tooltips = $('.tooltip .tooltiptext');

  // Check if there are any tooltips on the page
  if ($tooltips.length) {
      adjustTooltipPosition($tooltips, $('.tooltip'));
  }

  if (window.innerWidth > 800) {
      if ($(".rsProcessedGrid").hasClass("mobileGrid")) {
          $(".rsProcessedGrid").removeClass("mobileGrid").addClass("desktopGrid");
          cthemePageReady();
          gridUpdate();
      }
  } else if (isMobileDevice() && !$(".rsProcessedGrid").hasClass("mobileGrid")) {
      $(".rsProcessedGrid").addClass("mobileGrid").removeClass("desktopGrid");
      cthemePageReady();
      gridUpdate();
  }
}, 500));
