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
			var left = deltaX / _currentBarWidth;
			left = left > 1 ? 1 : left;
			left = left < 0 ? 0 : left;
			left = parseInt(left * 100);
			_dragItem.style.left = left + "%";

			var slideBarEl = d.closest(_dragItem, ".ui-progress-bar");
		}
	});

	d.on(document, "mouseup", function(evt){
		if(_dragItem && _dragItem.classList.contains("ui-progress-item")){
			_dragItem = null;
		}
	});
});

function getOffset(el){
	var offset = {left: el.offsetLeft, top: el.offsetTop};
	if(el.offsetParent != null){
		var topOffset = getOffset(el.offsetParent);
		offset.left += topOffset.left;
		offset.top += topOffset.top;
	}
	return offset; 
}


