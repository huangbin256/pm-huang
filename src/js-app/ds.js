
// The 'ds' module is the DataService module which is the layer to access data. The pattern here is that, 
// the first param is the object type, which allows to have a single access points to data and start with dynamic/generic
// CRUD behavior and customize as needed behind the scene.

// filter: {offset:0, limit: 300, cond, orderBy, }
// cond: {"title": "exactmatch", "firstName;ilike":"%jen%", "age;>": 30}
// orderBy: "lastName" or "!age" (age descending) or ["!age", "lastName"]

// ds("Task").create()

// ds.register("_fallback_",{create, update, remove, ...})
// ds.register("Task",)

// dso by name
var dsoDic = {};

// optional dso fallback factory
var _dsoFallbackFn;


module.exports = {
	dso: dsoFn,
	register: register,
	fallback: fallback
};


// return a DSO for a given type
function dsoFn(type){
	var dso = dsoDic[type];

	// if no dso found, but we have a dsoFallback factory, then, we create it.
	if (!dso && _dsoFallbackFn){
		dsoDic[type] = dso = _dsoFallbackFn(type);
	}

	// throw exception if still no dso
	if (!dso){
		throw new "No dso for type " + type;
	}

	return dso;

}

// register a dso for a given type
function register(type, dso){
	dsoDic[type] = dso;
}

function fallback(dsoFallbackFn){
	_dsoFallbackFn = dsoFallbackFn;
}
