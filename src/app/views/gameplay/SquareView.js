/**
 * Board square instance
 *  
 * @author Christopher Pappas 
 * @since 11.28.12
 */

var GamePlayConfig = require('config/GamePlayConfig');
var View           = require('core/View');
var GameEvent 	   = require('events/GameEvent');
var Utils          = require('utils/Utils');

var SquareView = View.extend({

	/**
	 * View class
	 * @type {String}
	 */
	className: 'board-square',	

	/**
	 * View property model
	 * @type {SquareModel}
	 */
	model: null,

	/**
	 * View events-hash
	 * @type {Object}
	 */
	events: {
		'click'		: '_onSquareClick',
		'mouseover'	: '_onRollOver',
		'mouseout'	: '_onRollOut'
	},


	//--------------------------------------
  	//+ PRIVATE VARIABLES
  	//--------------------------------------

  	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

  	/**
  	 * Renders the view
  	 * 
  	 */
  	render: function() {
  		var props = this.model.toJSON();
  	
  		this.$el.css({
  			'position': 'absolute',
  			'background': props.colorId,
  			'width': props.width,
  			'height': props.height,
  			'left': props.xPos,
  			'top': props.yPos,
  			'opacity': 0
  		});

  		if( props.colorId === GamePlayConfig.COLOR_MATRIX[ 2 ].hex ){ 
  			this.$el.css( 'z-index', '100' );
  		}

  	},


  	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------

	_onSquareClick: function( event ) {
		var props = this.model.toJSON();
		//this.model.set( 'enemy', true );
		//TweenMax.to( this.el, .5, { css: { backgroundColor: '#ff0000' }, overwrite: 'all' });
		this.trigger( GameEvent.SQUARE_SELECTED, { 
			matrixId: props.matrixId, 
			gridCoord: props.gridCoord 
		});
	},

	_onRollOver: function( event ) {

	},

	_onRollOut: function( event ) {

	}

});

module.exports = SquareView;