var Handlebars = require("handlebars/runtime")["default"];
var mvdom = require("mvdom");

if (window){
	window.Handlebars = Handlebars;
	window.mvdom = mvdom;
}