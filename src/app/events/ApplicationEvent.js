/**
 * Application Events 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12 
 */

var ApplicationEvent = (function() {

	/*
   	 * Public interface
	 */
	return {
		DISPOSE_VIEWS: 'views:dispose',
		UPDATE_BOARD: 'board:update'
	}
	
}).call();

module.exports = ApplicationEvent;