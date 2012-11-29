/** 
* Core.Gesture
*       - Defines Gesture event-constants and platform normalization
*
*	AUTHOR: christopher.pappas@popagency.com
*	DEPENDENCIES: 
*		jquery 1.7.2
*
**/

Gesture = (function(){
	
	var _namespace  = '.Fuse';
	var _touchstart = 'touchstart';
	var _touchmove  = 'touchmove';
	var _touchend   = 'touchend';
	var _tap        = 'tap';
	
	return {
		TOUCH_START: _touchstart + _namespace,
		TOUCH_MOVE: _touchmove + _namespace,
		TOUCH_END: _touchend + _namespace,
		TAP: _tap + _namespace
	};

}).call();

module.exports = Gesture;