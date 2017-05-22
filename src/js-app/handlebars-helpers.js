
Handlebars.registerHelper("echo", function (cond, val) {
	return (cond)?val:"";
});

Handlebars.registerHelper("symbol", function(name, options) {
	var html = ['<svg class="symbol">'];
	html.push('<use xlink:href="#' + name + '"></use>');
	html.push('</svg>');
	return html.join('\n');
});