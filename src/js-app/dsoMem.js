var d = mvdom; // global lib dependency


/**
 * InMemory (browser) implementatio nof the DataService ("ds"). 
 * 
 * - Use this during initial development or proof of concepts that cannot have server persistance.
 * 
 * - All APIs respect the "ds" async contract (return Promise) so that changing 
 * 		to the dsAjax.js would be completely transparent.
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


function DsoMem(type){
	this._type = type;
}

module.exports = DsoMem;


// --------- DSO Apis --------- //
DsoMem.prototype.create = function(entity){
	var type = this._type;

	return new Promise(function(resolve, reject){

		// get the next seq and put the new object
		var id = store.nextSeq();
		entity.id = id;
		store.put(type, id, entity);

		// get the new entity from the store (will have the .id)
		entity = store.get(type, id);

		// we resolve first, to allow the caller to do something before the event happen
		resolve(entity);

		// we publish the dataservice event
		d.hub("dataHub").pub(type,"create",entity);
	});
};


DsoMem.prototype.update = function(id, entity){
	var type = this._type;

	return new Promise(function(resolve, reject){
		var dbEntity = store.get(type, id);
		if (dbEntity){
			// make sure we do not change the .id (TODO: might want to throw an error if not match)
			delete entity.id;

			// put the new entity properties in the dbEntity
			Object.assign(dbEntity, entity);
			store.put(type, id, dbEntity);

			// we resolve 
			resolve(dbEntity);

			// we public the dataservice event
			d.hub("dataHub").pub(type,"update", dbEntity);

		}else{
			reject("Cannot update entity " + type + " because [" + id + "] not found");
		}
	});
};

DsoMem.prototype.get = function(id){
	var type = this._type;

	return new Promise(function(resolve, reject){
		var dbEntity = store.get(type, id);
		if (dbEntity){
			resolve(dbEntity);
		}else{
			reject("Entity " + type + " with id [" + id + "] not found");
		}
	});
};

DsoMem.prototype.list = function(opts){
	var type = this._type;

	// TODO: need to add the filtering support
	return new Promise(function(resolve, reject){
		resolve(store.list(type, opts));	
	});
};

DsoMem.prototype.first = function(opts){
	var type = this.type;
	// FIXME: need to implement
};

DsoMem.prototype.remove = function(id){
	var type = this.type;

	return new Promise(function(resolve, reject){
		resolve(store.remove(type, id));

		// we publish the dataservice event
		d.hub("dataHub").pub(type,"delete",id);		
	});
};
// --------- /DSO Apis --------- //


// --------- Local Mock Store --------- //
/*
	A very simple in-memory local store. 
*/

// entityStores: Entity Store by entity type. Entity Store are {} of format {id : entity}
var entityStores = {};

var seq = 1; // global sequence

var store = {

	nextSeq: function(){
		return seq++;
	},

	get: function(type, id){
		var entityStore = entityStores[type];
		var entity = (entityStore)?entityStore[id]:null;

		// make sure to return a copy (for now, shallow copy)
		return (entity)?Object.assign({}, entity):null;
	}, 

	put: function(type, id, entity){
		var entityStore = ensureObject(entityStores,type);
		if (entityStore){
			var dbEntity = Object.assign({}, entity);
			entityStore[id] = dbEntity; 
			return true;
		}
		return false;
	}, 

	remove: function(type, id){
		var entityStore = entityStores[type];
		if (entityStore && entityStore[id]){
			delete entityStore.delete(id);
			return true;
		}
		return false;		
	}, 

	first: function(type, opts){
		var entity = null;

		return entity;
	},

	list: function(type, opts){
		var tmpList = [], list;
		var entityStore = entityStores[type];		

		if (entityStore){
			var item;

			// get the eventual filters
			var filters = (opts && opts.filters)?opts.filters:null;
			if (filters){
				// make sure it is an array of filter
				filters = (filters instanceof Array)?filters:[filters];
			}


			// first, we go through the store to build the first list
			// NOTE: Here we do the filter here because we have to build the list anyway. 
			//       If we had the list as storage, we will sort first, and then, filter
			for (var k in entityStore){
				item = entityStore[k];
				// add it to the list if no filters or it passes the filters
				if (!filters || passFilter(item, filters)){
					tmpList.push(item);
				}
			}

			// TODO: implement the sorting
			// get the eventual orgerBy
			// var orderBy = (opts && opts.orderBy)?opts.orderBy:null;
			// tmpList.sort...

			// extract the eventual offset, limit from the opts, or set the default
			var offset = (opts && opts.offset)?opts.offset:0;
			var limit = (opts && opts.limit)?opts.limit:-1; // -1 means no limit
			
			// Set the "lastIndex + 1" for the for loop
			var l = (limit !== -1)?(offset + limit):tmpList.length;
			// make sure the l is maxed out by the tmpList.length
			l = (l > tmpList.length)?tmpList.length:l;

			list = [];
			for (var i = offset; i < l; i++){
				list.push(Object.assign({}, tmpList[i]));
			}

		}
		return list;
	}

};
// --------- /Local Mock Store --------- //



function ensureObject(root, name){
	var obj = root[name];
	if (!obj){
		obj = new Map();
		root[name] = obj;
	}
	return obj;
}


var filterDefaultOp = "=";

// Important: filters must be an array
function passFilter(item, filters){
	
	var pass;

	// each condition in a filter are OR, so, first match we can break out.
	// A condition item is a js object, and each property is a AND
	var i = 0, l = filters.length, cond, k, v, propName, op, itemV;
	for (; i < l; i++){
		pass = true;

		cond = filters[i];
		for (k in cond){
			// TODO: For now, just support the simple case where key is the property name
			//       Will need to add support for the operator in the key name
			propName = k;
			op = filterDefaultOp; // TODO: will need to get it for key

			// value to match
			v = cond[k];

			// item value
			itemV = item[propName];


			switch(op){
			case "=":
				// special case if v is null (need to test undefined)
				if (v === null){
					pass = pass && (itemV == null);
				}else{
					pass = pass && (v === itemV);	
				}
				
				break;				
			}

			// if one fail, break at false, since within an object, we have AND
			if (!pass){
				break;
			}
		}

		// if one of those condition pass, we can return true since within the top filter array we have OR.
		if (pass){
			break;
		}
	}

	return pass;
}
