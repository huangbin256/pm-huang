'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const exec = require( 'child_process' ).exec;

const HapiAsync = require('./utils.js').HapiAsync;

var isWin = /^win/.test( process.platform );

// Default app config. 
// Depending on the properties, it will be used for the connection properties or 
var defaultCfg = {
	//host: 'localhost',    // connection host (if we do this only does not work when deployed)
	port: 8080,			    // connection port
	clientRoot: process.cwd() + '/web/', // root of the client files (which will be served statically)	
	routes: {cors: 
	{origin: ['*'], 
		additionalHeaders: ["Accept-language"]
	}
	}
};

// App is a simple convenience Hapi/Server wrapper. 
class Server{
	
	constructor(){
	}

	async init(cfg){

		this.cfg = Object.assign({},defaultCfg,cfg);

		async function _init(){
			console.log("___init");
			var r = await initServer.call(this);
			return r;
		}	

		return _init.call(this);

	}

	// Load an extension for this application. 
	// An extension can contains a list routes extension.routes = [] 
	// and eventually (not yet) extension.exts = [] 
	// A extension is usually loaded from 
	load(routes){
		if (typeof routes === 'undefined' || !(routes instanceof Array)){
			throw new Error("App - cannot load routes " + routes);
		}	

		for (var route of routes){
			this.hapiServer.route(route);
		}
	}

	start(){
		// Start the server
		var self = this;
		self.hapiServer.start((err) => {

			if (err) {
				throw err;
			}

			// open browser
			if( isWin ){
				exec( 'start http://localhost:' + self.cfg.port, function( error, stdout, stderr ){});
			}else{
				exec( 'open http://localhost:' + self.cfg.port, function( error, stdout, stderr ){});
			}

			console.log('Server running at:', self.hapiServer.info.uri);
		});	
	}	
}

// --------- App Private Methods --------- //
function initServer(){
	var self = this;
	self.hapiServer = new Hapi.Server();

	// register plugins
	self.hapiServer.register(HapiAsync, function() {});
	self.hapiServer.register(Inert, function () {});		
	
	// start server
	self.hapiServer.connection({host: self.cfg.host, port: self.cfg.port});		

	// Bind static files to Inert plugin
	self.hapiServer.route({
		method: '*',
		path: '/{path*}',
		handler: {
			directory: {
				path: function( request ){
					console.log( ' > ' + new Date().getTime() + ' ' + request.method.toUpperCase() + ' ' + request.path );
					return self.cfg.clientRoot;
				},
				listing: true,
				index: [ 'index.html', 'default.html' ]
			}
		}
	});

	// self.load(require('./api/os-usage.js'));

	// bind APIs
	//this.load(require('./api/api-spherechart.js'));
	// this.load(require('./api/api-dashpanel.js'));		
	// this.load(require('./api/api-cruds.js'));
	// this.load(require('./api/api-volumes.js'));	
	// this.load(require('./api/api-shares.js'));

}
// --------- /App Private Methods --------- //

module.exports = new Server();