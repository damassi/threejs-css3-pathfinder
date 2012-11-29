
/**
 * Application Initializer 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var pacMan = require('PacMan');

$(function() {

	// Initialize Application
	pacMan.initialize();

	// Start Backbone router
  	Backbone.history.start();
});
