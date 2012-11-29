var ID = ID || {};


//swipe events
//@param - $el - the element we should check for swipes on
//@param - $callbackFunct - a callback function
ID.mobileSwipe = function($el, $callbackFunct) {
	//check to see if we allow touch events
	var touchBool = Boolean(document.ontouchstart !==undefined);
	var startTimeNum = 0;
	var startXNum = 0;
	var startYNum = 0;
	var currentXNum;
	var currentYNum;
	//what is the minimum amount that should count as a swipe
	var minDistNum = 50;
	//what is the maximum amount of time to count a swipe in milliseconds
	//if a user is over this number, they held too long to count as a swipe
	var maxTimeNum = 1000;
	//set this up to work on either phone or 
	var touchStartEvent = touchBool ? 'touchstart' : 'mousedown';
	var touchMoveEvent = touchBool ? 'touchmove' : 'mousemove';
	var touchEndEvent = touchBool ? 'touchend' : 'mouseup';
	var cancelEvent = touchBool ? 'touchcancel' : 'mouseleave';

	//add our listeners
	$el.on(touchStartEvent,touchStartHandler);

	//touch start
	function touchStartHandler($event){
		startTimeNum = $event.timeStamp;
		startXNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageX : $event.pageX;
		startYNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageY : $event.pageY;
		//add our listeners so they don't stick around
		$el.on(touchMoveEvent,touchMoveHandler);
		$el.on(touchEndEvent,touchEndHandler);
		$el.on(cancelEvent,touchCancelHandler);
	}
	//touch move
	function touchMoveHandler($event){
		$event.preventDefault();
		//could just capture these in touch end - leaving for now if we want to use elsewhere
		currentXNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageX : $event.pageX;
		currentYNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageY : $event.pageY;
		//if we're swiping one of these ways; kill our dragging around
		//if (Math.abs(currentXNum-startXNum)>10 || Math.abs(currentYNum-startYNum)>10) {e.preventDefault();}
	}
	//touch end
	function touchEndHandler($event){
		var endTimeNum = $event.timeStamp;
		var timeDiffNum = endTimeNum - startTimeNum;
		//hold our return values for our x/yspeed
		var xSwipeSpeedNum = 0
		var ySwipeSpeedNum = 0;
		//before we do anything else, make sure we should even count a swipe
		if(timeDiffNum < maxTimeNum){
			//get our x distance to make sure we should be a swipe
			var endXDist = Math.abs(currentXNum - startXNum);
			var endYDist = Math.abs(currentYNum - startYNum);
			//if we don't reach the minimum requirement for a swipe, we'll just pass 0
			if(endXDist > minDistNum){
				xSwipeSpeedNum = (currentXNum - startXNum)/timeDiffNum;
			}
			if(endYDist > minDistNum){ 
				ySwipeSpeedNum = (currentYNum - startYNum)/timeDiffNum;
			}
			//call us back
			$callbackFunct({"x":xSwipeSpeedNum,"y":ySwipeSpeedNum});
		}
		touchCancelHandler(null);
	}
	//on cancel event
	function touchCancelHandler($event){
		$el.off(touchMoveEvent,touchMoveHandler);
		$el.off(touchEndEvent,touchEndHandler);
		$el.off(cancelEvent,touchCancelHandler);
	}

}
