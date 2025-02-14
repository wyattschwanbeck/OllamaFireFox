
    /* Set the width of the sidebar to 250px (show it) */
function openNav() {
  window.open('panel.html', 'extensionWindow',resizable=true);
  document.getElementById("mySidepanel").style.width = "600px";
  //let update = browser.windows.getCurrent.update(browser.windows.getCurrent().windowId, {"width" : 600});
  //browser.windows.getCurrent().WindowState = "minimized";
  
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("mySidepanel").style.width = "0";
  //let update = browser.windows.getCurrent.update(browser.windows.getCurrent().windowId, {"width" : 5});
  //browser.windows.getCurrent().WindowState = "docked";
  
} 

