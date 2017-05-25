
Handlebars.registerHelper("echo", function (cond, val) {
	return (cond)?val:"";
});

Handlebars.registerHelper("symbol", function(name, options) {
	var html = ['<svg class="symbol">'];
	html.push('<use xlink:href="#' + name + '"></use>');
	html.push('</svg>');
	return html.join('\n');
});

Handlebars.registerHelper("echoNum", function (value, defaultVal) {
	if(typeof defaultVal == "undefined"){
		defaultVal = "";
	}
	return isNaN(value * 1) || !value ? defaultVal : value;
});