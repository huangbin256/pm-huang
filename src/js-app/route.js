var d = mvdom;
var utils = require("./utils.js");

/*
	A custom the 

	Status Events: 
		- routeHub.CHANGE 
		- e.g. ```mvdom.hub("routeHub").sub("CHANGE", function(){route.pathAt(0)})```
*/
// --------- Public API --------- //
var routeHub = d.hub("routeHub");

module.exports = {
	
	getInfo: function(){
		return new RouteInfo(parseHash());
	},

	init: function(){
		triggerRouteChange(this.getInfo());
	}

};

var route = module.exports;

// --------- /Public API --------- //	

// --------- RouteInfo object --------- //
function RouteInfo(data){
	this.data = data;
}

// return the value in path index if present, otherwise, null
RouteInfo.prototype.pathAt = function(idx){
	return (this.data.paths.length > idx)?this.data.paths[idx]:null;
};


// return the number at this path index, if not numeric or null or out of bound return null;
RouteInfo.prototype.pathAsNum = function(idx){		
	var num = this.pathAt(idx);
	return utils.asNumber(num);
};

RouteInfo.prototype.paths = function(){
	return this.data.paths; // TODO: need to clone it
};
// --------- /RouteInfo object --------- //




document.addEventListener("DOMContentLoaded", function(event) {
	d.on(window,"hashchange",function(){
		triggerRouteChange(route.getInfo());
	});
});

// --------- utilities --------- //
function triggerRouteChange(routeInfo){
	routeHub.pub("CHANGE", routeInfo);
}

function parseHash(){
	var hash = window.location.hash;
	var routeInfo = {}; // partial route
	if (hash){
		hash = hash.substring(1);
		
		var pathAndParam = hash.split("!"); // should get the first "!" as we should allow for param values to have "!"

		routeInfo.paths = pathAndParam[0].split("/");

		// TODO: need to add support for params
	}else{
		routeInfo.paths = [];
	}

	return routeInfo;
}
// --------- /utilities --------- //