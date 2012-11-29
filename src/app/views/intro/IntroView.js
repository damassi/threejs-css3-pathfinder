/**
 * WordFly intro
 * 
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var View     = require('core/View');
var template = require('templates/intro/introViewTemplate');

var IntroView = View.extend({

  	/*
   	 * The id of the view
	 */
	id: 'container-intro',

	/*
   	 * The .hbs template
   	*/
	template: template,

	/**
	 * Backbone.Mediator subscriptions
	 * @type {Object}
	 */
	subscriptions: {
		'views:dispose': 'dispose'
	},


	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

	/*
	 * Initializes the view
	 */
	initialize: function() {
		this._super();
	},

	/*
	 * Renders the view
	 */
	render: function() {
		this._super();

		this.$el.html( this.template() );
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
		this._super();
	}

	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------

	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

});

module.exports = IntroView;