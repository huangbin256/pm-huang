var d = mvdom; // external/global lib
var render = require("../js-app/render.js").render;
var utils = require("../js-app/utils.js");

var pathToView = {
	"": "HomeView", 
	"todo": "TodoMainView"
};


d.register("MainView",{
	create: function(data, config){
		return render("MainView");
	}, 

	postDisplay: function(){
		var view = this; // best practice, set the view variable first. 
	}, 

	hubEvents: {
		"routeHub; CHANGE": function(routeInfo){				
			displayView.call(this, routeInfo);
		}
	}

});


// --------- Private Methods --------- //

function displayView(routeInfo){
	var view = this;

	var path0 = routeInfo.pathAt(0);

	// if null or undefined, make it empty string.
	path0 = (!path0)?"":path0;


	// We change the subView only if the path0 is different
	if (view.path0 !== path0){
		// Remove the eventual active
		d.all(view.el,".main-nav a.active").forEach(function(itemEl){
			itemEl.classList.remove("active");
		});

		// activate the main-nav a link
		var activeEl = d.first(view.el,".main-nav a[href='#" + path0 + "']");
		if (activeEl){
			activeEl.classList.add("active");
		}		

		// chang ethe subview
		var subViewName = pathToView[path0];
		// display the view (empty first)
		var contentEl = d.first(view.el, ".main-content");
		d.empty(contentEl);
		d.display(subViewName, contentEl);

		// change the current path0
		view.path0 = path0;
	}
	
}

// --------- /Private Methods --------- //