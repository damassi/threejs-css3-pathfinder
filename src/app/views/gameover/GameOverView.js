/**
 * GameOver View 
 *  
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var View     = require('core/View');
var template = require('templates/homeViewTemplate');

var GameOverView = View.extend({

  	/*
   	 * The id of the view
	 */
	id: 'container-gameover',

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

module.exports = GameOverView;