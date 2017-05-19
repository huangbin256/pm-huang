var d = mvdom; // global lib dependency
var ajax = require("./ajax");


/**
 * Remote Rest implementatio nof the DataService ("ds"). 
 **/

// opts {filter, orderBy}: dso.all and ds.first take an extra parameters for the declarative filtering & orderBy
//
// 	- filters: 
//    {"completed": true, "projectId": 123}: completed == true && projectId == 123
//    [{"stage;>": 1}, {"completed": true, projectId: 123 }]: stage > 1 || completed == true && projectId == 123
//	- offset: 
//    
//  - orderBy:
//    "title": order by title asc
//    "!title": oder by title desc
//    "projectId, !id" oder by projectId asc, id desc


function DsoRest(type){
	this._type = type;
}

module.exports = DsoRest;


// --------- DSO Apis --------- //
DsoRest.prototype.create = function(entity){
	var type = this._type;

	return ajax.post("/api/"+type.toLowerCase()+"/create", {entity: JSON.stringify(entity)}).then(function(entity){
		// we publish the dataservice event
		d.hub("dataHub").pub(type,"create",entity);
		return entity;
	});
};


DsoRest.prototype.update = function(id, entity){
	var type = this._type;
	return ajax.post("/api/"+type.toLowerCase()+"/update", {id: id, entity: JSON.stringify(entity)}).then(function(entity){
		// we public the dataservice event
		d.hub("dataHub").pub(type, "update", entity);
		return entity;
	});
};

DsoRest.prototype.get = function(id){
	var type = this._type;
	return ajax.get("/api/"+type.toLowerCase()+"/get", {id: id});
};

DsoRest.prototype.list = function(opts){
	var type = this._type;

	// TODO: need to add the filtering support
	return ajax.get("/api/"+type.toLowerCase()+"/list", opts);
};

DsoRest.prototype.first = function(opts){
	var type = this._type;
	// FIXME: need to implement
};

DsoRest.prototype.remove = function(id){
	var type = this._type;

	return ajax.post("/api/"+type.toLowerCase()+"/delete", {id: id}).then(function(id){
		// we publish the dataservice event
		d.hub("dataHub").pub(type,"delete",id);
		return id;
	});
};
// --------- /DSO Apis --------- //