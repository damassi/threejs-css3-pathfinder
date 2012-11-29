/**
 * Board square model
 *  
 * @author Christopher Pappas 
 * @since 11.28.12
 */

var SquareModel = Model.extend({

	/**
	 * Default model props
	 * @type {Object}
	 */
	defaults: {
		"name"		: 'Square',
		"matrixId"	: -1,
		"gridCoord"	: [],
		"colorId"   : '#000',
		"width"		: -1,
		"height"	: -1,
		"xPos"		: -1,
		"yPos"		: -1,
		"selected"  : false,
		"enemy"		: false,
	}

});

module.exports = SquareModel;