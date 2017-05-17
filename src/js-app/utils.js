var d = mvdom;


module.exports = {



	asNumber: function(n){
		return (this.isNumeric(n)?n * 1:null);
	},

	isNumeric: function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}, 	


	// Build a key/value object dictionary from an Array. 
	// Note: No key value conflict resolution, last one wins.
	dic: function(arr, keyName){
		return arr.reduce(function(map, item) {
			var key = item[keyName];
			map[key] = item;
			return map;
		}, {});

		// alternative: var result = new Map(arr.map((i) => [i.key, i.val]));
	},


	entityRef: entityRef
};


// --------- Util APIs --------- //
/**
Look for the closest (up) dom element that have a matching "data-entity" attribute and return 
the reference of the entitye {id, type, el}

- @param el: the element to start the search from (it will be inclusive)
- @param type: (optional) the value of the "data-entity" to be match with. 
							 If absent, will return the first element that have a 'data-entity'.

- @return {type, id, el}, where .type will be the 'data-entity', .id the 'data-entity-id' (as number), 
													and .el the dom element that contain those attributes
*/
function entityRef(el, type){
	var selector = (type != null)?("[data-entity='" + type + "']"):"[data-entity]";
	var entityEl = d.closest(el,selector);
	if (entityEl){
		var entity = {};
		entity.el = entityEl;
		entity.type = entityEl.getAttribute("data-entity");
		entity.id = entityEl.getAttribute("data-entity-id") * 1; // make it a number
		return entity;
	}
	return null;
}
// --------- Util APIs --------- //

