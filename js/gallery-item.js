(function() {
  function setup() {
    if (localStorage.getItem("dismissed-width-notice")) {
      $("#width-notice").classList.add("hidden");
    }
    $("#width-notice button").addEventListener("click", onDismissWidthNotice);
  }

  // events
  function onDismissWidthNotice() {
    localStorage.setItem("dismissed-width-notice", "true");
    $("#width-notice").classList.add("hidden");
  }

  setup();
})();
