/**
 * Primary gameplay view container
 *  
 * @author Christopher Pappas 
 * @since 11.26.12
 */

var View			= require('core/View');
var GamePlayConfig	= require('config/GamePlayConfig');
var GameEvent 		= require('events/GameEvent');
var LevelMaker 		= require('utils/LevelMaker');
var Utils 			= require('utils/Utils');
var CSS3Renderer    = require('utils/ThreeJSCSS3Renderer');
var SquareView      = require('views/gameplay/SquareView');
var SquareModel     = require('models/gameplay/SquareModel');

BoardView = View.extend({

  	/*
   	 * The id of the view
	 */
	id: 'container-board',


	//--------------------------------------
  	//+ PRIVATE VARIABLES
  	//--------------------------------------

  	/**
  	 * Holds all grid items
  	 * @type {Array}
  	 */
  	_gridArray: null,

  	/**
  	 * ThreeJSCSS3Renderer
  	 * @type {[type]}
  	 */
  	_renderer: null,


	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

	/*
	 * Renders the view
	 */
	render: function() {
		this._super();
		this.$el.html('');
		this._buildGrid();

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
		
		if( options.currView === this ) return; 
		
		if( this._renderer ) {
			this._renderer.destroy();
			this._renderer = null;
		}
		
		this.$el.remove();
		LevelMaker.destroy();
		this._super();
	},

	/**
	 * Updates the board with a new position matrix
	 * @param  {Array} boardMatrix 
	 * 
	 */
	update: function( boardMatrix ) {
		var self = this;
		var arr = this._gridArray;
		var len = arr.length;
		for( var i = 0; i < len; ++i ) {
			var box = this._gridArray[ i ];
			TweenMax.to( box, .3, {
				css: {
					opacity: 0
					//scaleY: 0,
				},
				delay: Math.random() * .8,
				ease: Sine.easeIn,
				onComplete: function() {
					arr = _.without( arr, this.target );
					$(this.target).remove();
					
					if( arr.length === 0 ) {
						self.$el.empty();
						self._buildGrid();
					}
				}
			});
		}
	},
	

	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------


	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

	/**
	 * Builds a PacMan grid
	 * 
	 */
	_buildGrid: function() {
		this._gridArray = [];

		var DRAW_MODE = GamePlayConfig.DRAW_MODE();
		var self = this;
		var board = GamePlayConfig.BOARD();
		var boardLayout = board.boardLayout //.reverse();
		var	boxNum = _.flatten( boardLayout ).length;
		var boxIndex = 0;
		var rows = board.boardLayout.length;
		var	cols = board.boardLayout[0].length;
		var	size = { 
			padding: board.squarePadding,
			width: board.squareWidth, 
			height: board.squareHeight 
		};

		var player,
			leftIndex,
			topIndex,
			matrixId,
			colorId,
			position,
			i;
		
		if( DRAW_MODE.enabled ) {
			cols = DRAW_MODE.cols
			boxNum = DRAW_MODE.items
		}
		 
		for(var i = 0; i < boxNum; i++) {
			leftIndex = ( i % cols );
			topIndex = Math.floor( i / cols );
			matrixId = ( DRAW_MODE.enabled ) ? 1 : boardLayout[ topIndex ][ leftIndex ];
			colorId = GamePlayConfig.COLOR_MATRIX[ matrixId ].hex;

			position = {
				left: ( leftIndex * ( size.padding + size.width )) - (( cols * size.width ) * .5 ),
				top: ( topIndex * ( size.padding + size.height )) - ((( boxNum / cols ) * size.height) * .5 )
			};
				
			// TODO update this to save grid (!== -1)
			if( DRAW_MODE.enabled )
				createBox();
			else
				if( matrixId !== -1 )
					createBox()
		}



		/**
		 * Create a grid box
		 * 
		 */
		function createBox() {
			
			var squareView = new SquareView({
				model: new SquareModel({
					name: 'square' + boxIndex,
					matrixId: matrixId,
					gridCoord: [ leftIndex, topIndex ],
					colorId: colorId,
					width: size.width,
					height: size.height,
					xPos: position.left,
					yPos: position.top,
					enemy: ( matrixId === GamePlayConfig.COLOR_MATRIX[ 2 ].id ) ? true : false
				})
			});

			squareView.render();

			// Generate random position
			var left = ( DRAW_MODE.enabled ) ? position.left : Utils.randRange( -1000, 1000 );
			var top = ( DRAW_MODE.enabled ) ? position.top : Utils.randRange( -1000, 1000 );
			squareView.$el.css({ left: left, top: top });

			TweenMax.to( squareView.el, 1, {
				css: {
					left: position.left,
					top: position.top,
					opacity: ( colorId === GamePlayConfig.COLOR_MATRIX[ 0 ].hex ) ? 0 : 1
				},
				ease: Expo.easeOut,
				delay: 1 + Math.random() * .6
			});

			// Add to dom
			squareView.$el.appendTo( self.el );
			var boxProps = squareView.model.toJSON() 
			boxProps.instance = squareView;
			
			// Store items in array to be used throughout game
			self._gridArray[ boxIndex ] = boxProps;

			++boxIndex;
		}



		/**
		 * Builds pathfinder functionality and listens for grid square events
		 * 
		 */
		function buildPathfinder() {
			var movePath = [];
			var realMovePath = [];
			var finder = new PF.AStarFinder();

			// filter enemies from square array
			var enemies = _.filter( self._gridArray, function( square ) {
				if( square.instance.model.get('enemy') )
					return square;
			});
				
			// Add click listeners to squares
			_.each(self._gridArray, function( square ) {
				square.instance.on( GameEvent.SQUARE_SELECTED, function( props ) {
					var endPos = props.gridCoord;

					moveEnemies( endPos );
				});
			});

			// start loop
			_.delay(function(){
				var interval = setInterval( moveEnemies, 1000 );
			}, 2000)
			

			function moveEnemies( endPos ) {

				_.each( enemies, function( enemy, index ) {
					var randGridCoord = self._gridArray[ Math.floor( Math.random() * self._gridArray.length-1 )];
					if( !_.isUndefined( randGridCoord )) {
						var endPos = randGridCoord.gridCoord;

					// find start and end paths
					var startPos = enemy.instance.model.get('gridCoord');

					// create a new representational grid
					var grid = new PF.Grid(cols, rows, boardLayout);

					// Find the A* computed path
					var path = finder.findPath( startPos[0], startPos[1], endPos[0], endPos[1], grid);
					
					// translate grid coords to actual coords
					var enemyMovePath = Utils.gridRouteToRealPositions( path, self._gridArray );

					// start player movement
					moveEnemy( enemy.instance, enemyMovePath );
					}
					
				});
			}


			function moveEnemy( enemy, enemyMovePath ) {
				if( enemyMovePath.length === 0 )
					return

				TweenMax.to( enemy.el, .2, {
					css: {
						left: enemyMovePath[0].xPos,
						top: enemyMovePath[0].yPos
					},
					ease: Linear.easeNone,
					overwrite: 'all',
					onComplete: function() {
						enemy.model.set( 'gridCoord', enemyMovePath[0].gridCoord )
						enemyMovePath.shift();
						moveEnemy( enemy, enemyMovePath );
					}
				});
			}
		}




		// Start the LevelMaker if enabled
		if( DRAW_MODE.enabled )
			LevelMaker.init( this._gridArray );

		buildPathfinder();

		// Start the three.js renderer
		_.delay(function() {
			self._renderer = new CSS3Renderer();
			self._renderer.init( self._gridArray, self.el );

		}, 0);
	}

});

module.exports = BoardView;