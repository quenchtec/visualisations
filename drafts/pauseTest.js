function syncDelay(milliseconds){
    var start = new Date().getTime();
    var end = 0;

    while((end - start) < milliseconds){
        end = new Date().getTime();
    }
  alert("wait done");
  $('.contentContainer').show();
}
