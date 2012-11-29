/**
 * Application Configuration 
 * 
 * @author 
 * @since  
 */

var AppConfig = (function() {

	/*
   	 * Public interface
	 */
	return {

		/**
		 * The application base-url
		 * @type {String}
		 */
		BASE_URL: "/",

		/**
		 * Primary container for application views
		 * @type {String}
		 */
		DOM_CONTAINER: 'body',
	}

}).call()

module.exports = AppConfig;