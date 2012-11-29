/**
 * General gameplay configuration 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12   
 */

var GamePlayConfig = (function() {

	/**
	 * Flag for drawmode
	 * @type {Boolean}
	 */
	var _drawModeEnabled = false;	

	/**
	 * Default board layout
	 * @type {Array}
	 */
	var _boardLayout = [ 
		[1,1,1,1,1,1,1,1,1,1],
		[1,2,0,0,0,0,0,0,2,1],
		[1,0,1,0,1,0,1,1,0,1],
		[1,0,1,0,1,0,1,1,0,1],
		[1,0,0,0,0,0,2,0,0,1],
		[1,0,1,1,1,1,1,1,0,1],
		[1,0,0,2,0,0,0,0,0,1],
		[1,0,1,1,1,0,1,1,0,1],
		[1,0,1,1,1,0,1,1,0,1],
		[1,0,0,2,0,0,0,0,0,1],
		[1,0,1,0,1,0,1,1,0,1],
		[1,0,0,0,0,0,0,0,2,1],
		[1,1,1,1,1,1,1,1,1,1]
	];

	/**
	 * Defines grid color types for the board
	 * @type {Array}
	 */
	var _colorMatrix = [
		{ hex: '#fff', id: 0 },	
		{ hex: '#333', id: 1 },	
		{ hex: '#ff0000', id: 2 }
	];

	/*
   	 * Public interface
	 */
	return {

		/**
		 * Return a board configuration
		 * @type {Object}
		 */
		BOARD: function() {
			return {
				squareWidth: 50,
				squareHeight: 50, 
				squarePadding: 3,
				boardLayout: _boardLayout
			}
		},

		/**
		 * Return a color matrix
		 * @type {Array}
		 */
		COLOR_MATRIX: _colorMatrix,

		/**
		 * Draw mode allows you to create pacman levels 
		 * @type {Boolean}
		 */
		DRAW_MODE: function(){
			return {
				enabled: _drawModeEnabled,
				cols: 10,
				items: 100
			}
		},

		/**
		 * Updates the board layout
		 * @param {Array} layoutArr a matrix consisting of a pacman board layout
		 */
		setBoardLayout: function( layoutArr ) {
			_boardLayout = layoutArr;
		},

		/**
		 * Enables or disables draw mode
		 * @param  {Boolean} enabled
		 * 
		 */
		drawModeEnabled: function( enabled ) { 
			_drawModeEnabled = enabled;
		}
	}

}).call()

module.exports = GamePlayConfig;