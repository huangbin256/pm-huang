/**
 * Simple "singleton" scheduler service that allows to add/remove some function to be called
 * periodically and have the data published. 
 **/

var nsSeq = 0; 

// default options
var defaultOpts = {
	delay: 1 // delay in second
};

// Start with the default options
var opts = Object.assign({}, defaultOpts);

var schedulesByNs = {};

module.exports = {
	add: add, 
	remove: remove,

	options: options

};

// - schedule {processFun, receiveFun, ns, ctx}
//   - performFn: The function that will be called with the optional "ctx". Must return a Promise.
//   - receiveFn: The function that will be called on each processFun completion.
//   - ns (optional): Optional namespace to remove this (or more) schedule having the same name space. A unique ns will be returned if not provided.
//   - ctx (optional): The context (i.e. this) that processFun and receiveFun will be called. 
// 
// Returns the ns (namespace) associated with this schedule
function add(schedule){
	// make sure we copy the schedule (so that we do not change the original copy)
	schedule = Object.assign({}, schedule);

	// make sure we have a ns
	schedule.ns = (schedule.ns)?schedule.ns: "sch_ns_" + (nsSeq++);

	var schedules = schedulesByNs[schedule.ns];
	if (!schedules){
		schedulesByNs[schedule.ns] = schedules = [];
	}

	schedules.push(schedule);

	run(schedule);

	//console.log("scheduler.add", schedule);

	return schedule.ns;
}


// Turn off and remove one of more schedule by their namespace
function remove(ns){
	var schedules = schedulesByNs[ns];

	if (schedules){
		schedules.forEach(function(schedule){
			schedule.off = true;
		});		
	}

	delete schedulesByNs[ns];
}


function options(opts){
	opts = Object.assign({}, defaultOpts, opts);
}


function run(schedule){
	if (!schedule.off){
		setTimeout(function(){
			if (!schedule.off){
				var ctx = schedule.ctx || null;

				//console.log("scheduler.run", schedule);
				schedule.performFn.call(ctx).then(function(data){
					schedule.receiveFn.call(ctx,data);
					run(schedule);
				});
			}
		}, opts.delay * 1000);
	}
}