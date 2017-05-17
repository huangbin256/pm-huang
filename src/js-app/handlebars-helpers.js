
Handlebars.registerHelper("echo", function (cond, val) {
	return (cond)?val:"";
});