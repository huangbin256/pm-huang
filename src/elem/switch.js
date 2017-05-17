var d = mvdom;

document.addEventListener("DOMContentLoaded", function(event) {

	d.on(document, "click", ".switch", function(evt){
		var switchEl = evt.selectTarget;
		toggle(switchEl);
	});

	d.on(document, "keyup", ".switch", function(evt){
		if (evt.code === "Space"){
			toggle(evt.selectTarget);
		}
	});
});


function toggle(switchEl){
	switchEl.classList.toggle("on");
}

