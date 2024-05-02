$(document).ready(function () {
  initialSetup();
  setupMutationObserver();
});

function initialSetup() {
  cthemeff();
  cthemePageReady();
  logIfDevelopment("Initial setup complete");
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
          if (mutation.type === "childList") {
              cthemePageReady();
              logIfDevelopment("Mutation observed - childList");
              observer.disconnect(); // Consider disconnecting if no longer needed
          }
      });
  });
  observer.observe(document.getElementById("rsPanelMain"), { attributes: true, childList: true, subtree: true });
}

function cthemeff() {
  if (navigator.userAgent.includes("Firefox")) {
      $("head").append('<link rel="stylesheet" type="text/css" href="https://quenchtec.github.io/visualisations/walrthemes/v1.0.0-2colour/main_theme_ff_only.css">');
  }
}

function putSomeClasses() {
  logIfDevelopment("putSomeClasses start");
  $(".cTable").each(function () {
      const table = $(this);
      handleTableClasses(table);
  });
}

function handleTableClasses(table) {
  if (table.hasClass("rsSingle") || table.hasClass("rsMulti")) {
      handleNonGridClasses(table);
  } else if (table.hasClass("mobileGrid") || table.hasClass("desktopGrid")) {
      handleGridClasses(table);
  }
}

function handleNonGridClasses(table) {
  table.find(".rsRow").each(function () {
      const row = $(this);
      row.children(".cRowBlockText:not(:has(select))").addClass("GroupingHeader");
      toggleRowSelection(row, row.find("input").prop("checked"));
  });

  table.on("click keyup", ".rsRow, .rsRow .cCellOpenText .cTextInput", function () {
      toggleRowSelection($(this), $(this).find("input").prop("checked"));
  });
}

function toggleRowSelection(row, isSelected) {
  row.toggleClass("rsSelected", isSelected);
}

function handleGridClasses(table) {
  table.find(".rsRow .cCell").on("click", function () {
      $(this).siblings().andSelf().each(function () {
          toggleRowSelection($(this), $(this).find("input").prop("checked"));
      });
  });
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function cthemePageReady() {
  const strID = $('#rs_lang').val();
  ghostText(resolveCustomMessage(strID));
  custNavigationText(resolveNavigationText(strID));
  $(".rsSingleGrid, .rsMultiGrid").not(".rsProcessedGrid, .rsCQ").each(function () {
      gridUpdate($(this));
      logIfDevelopment("gridUpdate called from cthemePageReady");
  });
}

function resolveCustomMessage(strID) {
  return myCustomGhost?.[strID] || "Please, type in...";
}

function resolveNavigationText(strID) {
  return {
      next: myCustomNext?.[strID] || "",
      prev: myCustomPrevious?.[strID] || "",
      error: myCustomError?.[strID] || ""
  };
}

function custNavigationText({ next, prev, error }) {
  $('#btnNext').val(next);
  $('#btnPrevious').val(prev);
  $('.cError').val(error);
}

function ghostText(custText) {
  $('.cTextInput').attr("placeholder", custText);
}

function logIfDevelopment(message) {
  if (/^(testlink|preview|review)\./.test(window.location.hostname)) {
      console.log(message);
  }
}

function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

$(window).on('resize', debounce(handleResize, 500));

function handleResize() {
  $(".rsProcessedGrid").toggleClass("mobileGrid", isMobileDevice()).toggleClass("desktopGrid", !isMobileDevice());
  cthemePageReady();
  logIfDevelopment("Resize event handled");
}
function gridUpdate(grid_this) {
  logIfDevelopment("Grid update start");
  let _grid_this = grid_this || findGridsToProcess();
  let gridID = _grid_this.prop("id");
  
  if (_grid_this.hasClass("rsSingleGrid") || _grid_this.hasClass("rsMultiGrid")) {
      if (!_grid_this.hasClass("rsProcessedGrid") && !_grid_this.hasClass("rsCQ")) {
          let gridIND = gridID.split("_")[1];
          _grid_this.addClass("rsProcessedGrid");
          handleGridRearrangement(_grid_this, gridIND);
      }
  }
}

function findGridsToProcess() {
  return $(".rsSingleGrid, .rsMultiGrid").not(".rsProcessedGrid, .rsCQ").first();
}

function handleGridRearrangement(grid, gridIND) {
  if (isMobileDevice()) {
      grid.addClass("mobileGrid").find(".rsRow").each(function () {
          $(this).children(".cCell").each(function (e) {
              $(this).append($("#h_" + gridIND + "_" + e).clone());
          });
      });
      $("td.cCellHeader").parent().remove();
  } else {
      grid.addClass("desktopGrid");
      adjustDesktopGrid(grid);
  }
}

function adjustDesktopGrid(grid) {
  setTimeout(() => {
      let colLength = grid.find(".cCellHeader").length;
      let gridWidth = grid.find(".rsHeaderRow")[0].clientWidth;
      adjustGridHeaders(grid, colLength, gridWidth);
      adjustRowHeight(grid);
  }, 200);
}

function adjustGridHeaders(grid, colLength, gridWidth) {
  let cWidth = 0;
  grid.find(".rsHeaderRow").css("width", gridWidth + "px");
  grid.find(".cCellFirstHeader").css({
      "min-width": "30%",
      "width": `${(gridWidth * 1.2) / colLength}px`
  }).addClass("revisedCellFirstHeader");

  grid.find(".cCellHeader").not(".cCellFirstHeader").each(function () {
      let headerWidth = $(this)[0].clientWidth;
      if (headerWidth > cWidth) {
          cWidth = headerWidth;
          $(this).addClass("revisedColumn");
      }
  }).css("width", `${cWidth}px`);
}

function adjustRowHeight(grid) {
  let maxCellHeight = 0;
  grid.find(".rs-ht").each(function () {
      let cellHeight = $(this)[0].clientHeight;
      if (cellHeight > maxCellHeight && cellHeight <= 70) {
          maxCellHeight = cellHeight;
      }
  });
  grid.find(".rsRow").css("height", `${maxCellHeight}px`);
}