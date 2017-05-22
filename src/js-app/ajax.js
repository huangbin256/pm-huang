module.exports = {
	get: get,
	post: post,
	put: put,
	delete: _delete
};

// --------- AJAX Wrapper --------- //
// Very simple AJAX wrapper that allow us to simply normalize request/response accross the application code.
// 
// Note: We start with just a minimalistic implementation, if more is needed, we can use some AJAX library while keeping the same
// application APIs. 

// use for get and list
function get(path, data, opts){
	return ajax('GET', path, data, opts);
}

// use for create 
function post(path, data, opts){
	return ajax('POST', path, data, opts);
}

// use for update
function put(path, data, opts){
	return ajax('PUT', path, data, opts);
}

// use for delete
function _delete(path, data){
	return ajax('DELETE', path, data, null);
}

var defaultOpts = {
	contentType: "application/json"
};

function ajax(type, path, data, opts){
	opts = Object.assign({}, defaultOpts, opts);

	// if asBody is not defined
	var asBody = (opts.asBody == null && (type === 'POST' || type === 'PUT' ));

	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		
		var url = path; 

		if (data && !asBody){
			url += "?" + param(data);
		}

		xhr.open(type, url);
		xhr.setRequestHeader("Content-Type", opts.contentType);

		xhr.onload = function() {
			if (xhr.status === 200) {
				try{
					var response = xhr.responseText;
					// if the content type was application/json, then, just parse it
					if (opts.contentType === "application/json"){
						response = JSON.parse(response);
					}
					// parse the XML as well
					else if (opts.contentType === "application/xml"){
						response = new DOMParser().parseFromString(response, "application/xml");
					}

					resolve(response);
				} catch (ex){
					reject("Cannot do ajax request to '" + url + "' because \n\t" + ex);
				}
			}else{
				console.log("xhr.status '" + xhr.status + "' for ajax " + url, xhr);
				reject("xhr.status '" + xhr.status + "' for ajax " + url);
			}
		};

		// pass body
		if(asBody){
			xhr.send(JSON.stringify(data));
		}else{
			xhr.send();
		}
		
	});		
}

function param(object) {
	var encodedString = '';
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (encodedString.length > 0) {
				encodedString += '&';
			}
			encodedString += encodeURI(prop + '=' + object[prop]);
		}
	}
	return encodedString;
}
