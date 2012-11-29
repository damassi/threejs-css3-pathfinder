/**
 * View Description 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var View     = require('core/View');
var template = require('templates/HomeViewTemplate');

BackboneView = View.extend({

	//--------------------------------------
	//+ PUBLIC PROPERTIES / CONSTANTS
	//--------------------------------------

  	/*
   	 * The id of the view
	 */
	id: 'view',

	/*
   	 * The .hbs template
   	*/
	template: template,


	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

	/*
	 * Initializes the view
	 */
	initialize: function() {
		this.render = _.bind( this.render, this );
	},

	/*
	 * Renders the view
	 */
	render: function() {
		this.$el.html( this.template() );

		return this;
	},

	//--------------------------------------
	//+ PUBLIC METHODS / GETTERS / SETTERS
	//--------------------------------------

	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------

	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

});

module.exports = BackboneView;