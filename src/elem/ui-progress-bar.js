var d = mvdom;

document.addEventListener("DOMContentLoaded", function(event) {

	var _dragItem, _lastPageX, _currentBarWidth, _startValue;

	d.on(document, "mousedown", ".ui-progress-bar .ui-progress-item", function(evt){
		_dragItem = evt.selectTarget;
		_lastPageX = evt.pageX;
		_currentBarWidth = d.closest(_dragItem, ".ui-progress-bar").clientWidth;
		// set init value
		_startValue = getOffset(_dragItem).left + _dragItem.clientWidth / 2 - getOffset(d.closest(_dragItem, ".ui-progress-bar")).left;

	});

	d.on(document, "mousemove", function(evt){
		if(_dragItem && _dragItem.classList.contains("ui-progress-item")){
			var deltaX = evt.pageX - _lastPageX + _startValue;
			var value = deltaX / _currentBarWidth * 100;
			var slideBarEl = d.closest(_dragItem, ".ui-progress-bar");
			change(slideBarEl, value, true);
		}
	});

	d.on(document, "mouseup", function(evt){
		if(_dragItem && _dragItem.classList.contains("ui-progress-item")){
			var deltaX = evt.pageX - _lastPageX + _startValue;
			var value = deltaX / _currentBarWidth * 100;
			var slideBarEl = d.closest(_dragItem, ".ui-progress-bar");
			change(slideBarEl, value);
			_dragItem = null;
		}
	});

	d.on(document, "keyup", ".ui-progress-bar + .ui-progress-input", function(evt){
		var inputEL = evt.selectTarget;
		if(evt.key == "Enter"){
			var val = inputEL.value;
			var barEl = d.prev(inputEL, ".ui-progress-bar");
			change(barEl, val);
		}
	});
});

function change(progressEl, value, changing){
	value = isNaN(value * 1) ? 0 : value * 1;
	value = value > 100 ? 100 : value;
	value = value < 0 ? 0 : value;
	value = parseInt(value);

	var item = d.first(progressEl, ".ui-progress-item");
	item.style.left = value + "%";

	var inputEl = d.next(progressEl, ".ui-progress-input");
	if(inputEl){
		inputEl.value = value;
	}

	var valueEl = d.first(progressEl, ".value");
	if(valueEl){
		valueEl.innerHTML = value + "%";
	}

	if(changing){
		d.trigger(progressEl, "changing", value);
	}else{
		d.trigger(progressEl, "change", value);
	}
}

function getOffset(el){
	var offset = {left: el.offsetLeft, top: el.offsetTop};
	if(el.offsetParent != null){
		var topOffset = getOffset(el.offsetParent);
		offset.left += topOffset.left;
		offset.top += topOffset.top;
	}
	return offset; 
}


