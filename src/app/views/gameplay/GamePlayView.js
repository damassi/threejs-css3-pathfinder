/**
 * Primary gameplay view container
 * 
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var PacMan 		   = require('PacMan');
var GamePlayConfig = require('config/GamePlayConfig');
var View           = require('core/View');
var BoardView      = require('./BoardView');
var template       = require('templates/homeViewTemplate');

var GamePlayView = View.extend({

  	/*
   	 * The id of the view
	 */
	id: 'container-gameplay',

	/*
   	 * The .hbs template
   	*/
	template: template,

	/**
	 * Backbone.Mediator subscriptions
	 * @type {Object}
	 */
	subscriptions: {
		'views:dispose': 'dispose',
		'board:update' : '_onUpdateBoard'
	},


	//--------------------------------------
  	//+ PRIVATE VARIABLES
  	//--------------------------------------

  	/**
  	 * The PacMan board
  	 * @type {BoardView}
  	 */
  	_boardView: null,

	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

	/*
	 * Initializes the view
	 */
	initialize: function() {
		
	},

	/*
	 * Renders the view
	 */
	render: function() {
		this._super();
		this.$el.html('');

		this._boardView = new BoardView();
		this._boardView.$el.appendTo( this.el );
		this._boardView.render();

		this.rendered = true;

		return this;
	},

	//--------------------------------------
	//+ PUBLIC METHODS / GETTERS / SETTERS
	//--------------------------------------

	/**
	 * Disposes of the view
	 * @param  {Object} options 
	 *  - animated : {Boolean}
	 *  - currView : {Object}
	 * 
	 */
	dispose: function( options ) {
		options = options || {};
		
		if( !this.rendered ) return;
		if( options.currView === this ) return; 

		this.$el.remove();
		this._boardView.dispose();
		this._super();
	},
	
	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------

	/**
	 * Updates the board with a new grid matrix
	 * @param  {Object} options an options hash containing
	 *   - boardMatrix : {Array}
	 *   
	 */
	_onUpdateBoard: function( options ) {
		options = options || {};

		GamePlayConfig.drawModeEnabled( false );
		GamePlayConfig.setBoardLayout( options.boardMatrix );
		PacMan.router.navigate( 'gameplay', { silent: true });

		this._boardView.update({
			animated: true
		});
	}

	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

});

module.exports = GamePlayView;