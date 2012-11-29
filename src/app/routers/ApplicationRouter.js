/**
 * Backbone Primary Router 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var ApplicationEvent = require('events/ApplicationEvent');
var GamePlayConfig    = require('config/GamePlayConfig');
var AppConfig         = require('config/AppConfig');
var Router            = require('core/Router');
var PacMan            = require('PacMan');

ApplicationRouter = Router.extend({

	//--------------------------------------
	//+ Routes
	//--------------------------------------
	
	/**
	 * Primary route hash
	 * @type {Object}
	 */
	routes: {
		''          : 'gamePlay',
		'intro'     : 'intro',
		'gameplay'  : 'gamePlay',
		'drawmode'  : 'drawMode'
	},

	//--------------------------------------
	//+ INHERITED / OVERRIDES
	//--------------------------------------

	/**
	 * Overrides the default Router method and dispatches cleanup event to View BaseClass
	 * @param  {String}   route    the route
	 * @param  {String}   name     the name of the route
	 * @param  {Function} callback The function to execute upon view transition
	 */
	route: function( route, name, callback ) {
		this._super( route, name, callback );
	},

	//--------------------------------------
	//+ Route Handlers
	//--------------------------------------

	/**
	 * Intro / home view for app
	 * 
	 */
	intro: function() {
		var view = PacMan.introView;
		view.$el.appendTo( AppConfig.DOM_CONTAINER );
		view.render();

		this._cleanupViews({ 
			currView: view,
			animated: true 
		});
	},

	/**
	 * Gameplay view
	 * 
	 */
	gamePlay: function() {
		GamePlayConfig.drawModeEnabled( false );

		var view = PacMan.gamePlayView;
		view.$el.appendTo( AppConfig.DOM_CONTAINER );
		view.render()

		this._cleanupViews({ 
			currView: view,
			animated: true
		});
	},

	/**
	 * DrawMode
	 * 
	 */
	drawMode: function() {
		GamePlayConfig.drawModeEnabled( true );

		var view = PacMan.gamePlayView;
		view.$el.appendTo( AppConfig.DOM_CONTAINER );
		view.render()

		this._cleanupViews({ 
			currView: view,
			animated: true
		});
	},


	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

	/**
	 * Generic method which publishes cleanup event to all registered views
	 * @param {Object} options  an options has consisting of
	 *   - animated : {Boolean}  should we animate out the view?
	 */
	_cleanupViews: function( options ) {
		Backbone.Mediator.pub( ApplicationEvent.DISPOSE_VIEWS, options );
	}
});

module.exports = ApplicationRouter;