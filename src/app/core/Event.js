/** 
* Event
*       - Defines Event Constants for FUSE namespace
*
*	AUTHOR: ML
*	DEPENDENCIES: 
*		jquery 1.7.2
*
**/

Event = (function(){
	
	var _namespace = ".PacMan";
	var _back = "back" + _namespace;
	var _cancel = "cancel" + _namespace;
	var _change = "change" + _namespace;
	var _clear = "clear" + _namespace;
	var _close = "close" + _namespace;
	var _complete = 'complete' + _namespace;
	var _confirm = 'confirm' + _namespace;
	var _done = "done" + _namespace;
	var _forward = "forward" + _namespace;
	var _keyPress = "keyPress" + _namespace;
	var _preloaded = 'preloaded' + _namespace;
	var _ready = "pageReady" + _namespace;
	var _remove = 'remove' + _namespace;
	var _released = "released" + _namespace;
	var _selected = "selected" + _namespace;
	var _submit = "submit" + _namespace;
	
	return {
		namespace: _namespace,
		BACK: _back,
		CANCEL: _cancel,
		CHANGE: _change,
		CLEAR: _clear,
		CLOSE: _close,
		COMPLETE: _complete,
		CONFIRM: _confirm,
		DONE: _done,
		FORWARD: _forward,
		KEY_PRESS: _keyPress,
		PRELOADED: _preloaded,
		READY: _ready,
		RELEASED: _released,
		REMOVE: _remove,
		SELECTED: _selected,
		SUBMIT: _submit
	};

})();

module.exports = Event;