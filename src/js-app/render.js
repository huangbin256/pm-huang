module.exports = {
	render: render
};

// --------- Render --------- //
// Just a little indirection to render a template using handlebars.
// This simple indirection allows much flexibility later one, 
// when using pre-compiling or other templating engine are needed.

// The node.js hbsp process will put the precompile function in the Handlebars.templates
Handlebars.templates = Handlebars.templates || {};

document.addEventListener("DOMContentLoaded", function(event) {
	// Make all templates partials (no reason why they should not)
	// Note: We put this in a DOMContentLoaded to make sure the Handlebars.templates where loaded (assuming the "templates.js" 
	//       is loaded in the <head></head> (which is the case in our best practice)
	Handlebars.partials =  Handlebars.templates;	
});


function render(templateName, data, returnsFragment){
	var tmpl = Handlebars.templates[templateName];

	// if not found, throw an error
	if (!tmpl){
		throw "Not template found in pre-compiled and in DOM for " + templateName;
	}

	// call the function and return the result
	var html = tmpl(data);

	if (returnsFragment){
		var template = document.createElement("template");
		if (template.content){
			template.innerHTML = html;
			return template.content;
		}
		// for IE 11
		else{
			return document.createRange().createContextualFragment(html);
		}
	}else{
		return html;
	}
}
// --------- /Render --------- //