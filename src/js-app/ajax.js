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
function get(path, data){
	return ajax('GET', path, data, null);
}

// use for create 
function post(path, data, asBody){
	return ajax('POST', path, data, asBody);
}

// use for update
function put(path, data, asBody){
	return ajax('PUT', path, data, asBody);
}

// use for delete
function _delete(path, data){
	return ajax('DELETE', path, data, null);
}


function ajax(type, path, data, asBody){

	// if asBody is not defined
	if (asBody == null && (type === 'POST' || type === 'PUT' )){
		asBody = true;
	}

	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		
		var url = path; 

		if (data && !asBody){
			url += "?" + param(data);
		}

		xhr.open(type, url);
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.onload = function() {
			if (xhr.status === 200) {
				try{
					var response = JSON.parse(xhr.responseText);
					resolve(response);
					return;
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
