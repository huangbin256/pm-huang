var d = mvdom;
var scheduler = require("./scheduler.js");


function schNs(view){
	return "view_sch_ns_" + view.id;
}

d.hook("didCreate", function(view){
	var ns = schNs(view);

	if (view.schedules){
		view.schedules.forEach(function(schedule){

			// Note: This is just a best practice, better to work on a copy. 
			//       Technically not really needed, since scheduler.add
			//       makes it own copy, and this is a view instance copy as well. 
			schedule = Object.assign({}, schedule);

			schedule.ns = ns;
			schedule.ctx = view;
			scheduler.add(schedule);
		});
	}
});

d.hook("willRemove", function(view){
	var ns = schNs(view);

	if (view.schedules){
		scheduler.remove(ns);
	}

});