function syncDelay(milliseconds){
    alert("in promise");
     $('#html').hide();
    var start = new Date().getTime();
    var end = 0;

    while((end - start) < milliseconds){
        end = new Date().getTime();
    }
  alert("wait done");
  $('#html').show();
}
