/**
 * Random utilities
 * 
 * @author Christopher Pappas 
 * @since 11.27.12   
 */

var Utils = (function() {

	//--------------------------------------
	//+ PUBLIC INTERFACE
	//--------------------------------------

	return {

		/**
		 * Returns a random nunber within two ranges
		 * @param {Number} min 
		 * @param {Number} max 
		 */
		randRange: function( min, max ) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		/**
		 * Returns a random hex color
		 * 
		 */
		returnRandomHexColor: function() {
			var letters = '0123456789ABCDEF'.split('');
		    var color = '#';
		    for ( var i = 0; i < 6; i++ ) {
		        color += letters[ Math.round( Math.random() * 15 ) ];
		    }

		    return color;
		},

		/**
		 * Rotates a 2-Dimensional array to the right
		 * @param  {Array} array		 
		 */
		rotateArrayRight: function( array ) {
			var transformedArray = new Array();
			var aLen = array[0].length;
			for( var i = 0; i < aLen; i++ ) {
				transformedArray[i] = new Array();
				
				// fill the row with everything in the appropriate column of the source array
				var transformedArrayColumn = -1;
				var bLen = array.length - 1;
				for ( var j = bLen; j > -1; j-- ) {
					transformedArrayColumn++;
					transformedArray[i][transformedArrayColumn] = array[j][i]
				}
			}
			
			return transformedArray;
		},

		/**
		 * Rotates a 2-Dimensional array to the left
		 * @param  {Array} array		 
		 */
		rotateArrayLeft: function( array )  {
			var transformedArray = new Array();
			
			var row = -1;
			var aLen = array[0].length;
			for( var i = aLen - 1; i > -1; i-- ) {
				row++;
				transformedArray[row] = new Array();
				
				var bLen = array.length;
				for ( var j = 0; j < bLen; j++ ) {
					transformedArray[row][j] = array[j][i];
				}
			}
			
			return transformedArray;
		},

		/**
		 * Finds real-world coordinates from 2d array-maps
		 * @param  {Array} path  The path to translate
		 * @param  {Array} gridItems An array of items in the grid, with 2d and rw attributes
		 * @return {Array}
		 */
		gridRouteToRealPositions: function( path, gridItems ) {
			var posArray = _.map( path, function( node, index ) {
				var foundItem = _.find( gridItems, function( item ) {
					if(( node[0] === item.gridCoord[0] ) && ( node[1] === item.gridCoord[1] ))
						return item;
				});

				return {
					gridCoord: foundItem.gridCoord,
					xPos: foundItem.xPos,
					yPos: foundItem.yPos
				}
			})

			return posArray;
		}
	}

}).call();

module.exports = Utils;
