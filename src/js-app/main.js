var d = mvdom; // external lib
var route = require("./route.js");
var ds = require("./ds.js");
var DsoMem = require("./dsoMem.js");

/**
 * This module do not externalize anything, but just start the application. 
 * We put it on DOMContentLoader (i.e. $.ready for modern browsers) to make sure it is run after all js are loaded.
 **/ 



// --------- DataService Initialization --------- //
// For the demo, we will have the Memory Dso fallback for any type the application might use. 	
ds.fallback(function(type){
	return new DsoMem(type);
});

// For production, you might want to have some Entity DSO object that you would register as follow
// ds.register("Task", new TaskDso());
// --------- /DataService Initialization --------- //

	
document.addEventListener("DOMContentLoaded", function(event) {

	var bodyEl = d.first("body");

	// first make sure we empty eventual body.
	d.empty(bodyEl);

	// then add this new MainView
	d.display("MainView", bodyEl).then(function(){

		// initialize the route, which will trigger a "CHANGE" on the routeHub hub. 
		// Note: we do that once the MainView has been added to the DOM so that it can react accordingly
		route.init();
	});


});
