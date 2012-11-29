/**
 * Level maker for outputting Pac Man array sets 
 * 
 * @author Christopher Pappas 
 * @since 11.26.12   
 */

var ApplicationEvent   = require('events/ApplicationEvent');
var GamePlayConfig		= require('config/GamePlayConfig');
var levelMakerTemplate	= require('templates/levelmaker/levelMakerMenuTemplate');

var LevelMaker = (function() {

	/**
	 * Menu .hbs template
	 * @type {Function}
	 */
	var _menuTemplate = levelMakerTemplate;

	/**
	 * An array of grid items
	 * @type {Array} containing {Object} with
	 *   - instance : {DOMElement} the square instance
	 *   - x: the x-position of the element
	 *   - y: the y-position of the element
	 */
	var _gridArray = [];

	/**
	 * Array of currently active boxes
	 * @type {Array}
	 */
	var _activeBoxesArray = [];

	/**
	 * Flag toggle for mousedown / mouseup painting
	 * @type {Boolean}
	 */
	var _isPaintMode = true;

	/**
	 * Flag for mousedown paint toggle
	 * @type {Boolean}
	 */
	var _isMouseDown = false;

	/**
	 * Alert message indicating LevelMaker paint status
	 * @type {$}
	 */
	var $alertLevelMaker = null;


	//--------------------------------------
	//+ EVENT HANDLERS
	//--------------------------------------

	/**
	 * Handler for document level clicks.  Toggles continuous-draw flag
	 * @param  {MouseEvent} event 
	 */
	function onDocumentClick( event ) {
		( _isPaintMode !== true ) ?
			_isPaintMode = true :
			_isPaintMode = false;

		togglePaintModeBanner();
	}

	/**
	 * Handler for mouseup events
	 * @param  {MouseEvent} event 
	 * 
	 */
	function onDocumentMouseDown( event ) {
		if( _isMouseDown !== true )
			_isMouseDown = true;
	}

	/**
	 * Handler for document down events
	 * @param  {MouseEvent} event 
	 */
	function onDocumentMouseUp( event ) {
		if( _isMouseDown !== false )
			_isMouseDown = false;
	}

	/**
	 * Handler for box clicks.  Toggles state for matrix output
	 * @param  {MouseEvent} event 
	 */
	function onBoxItemMouseOver( event ) {
		
		// start painting grid
		if( _isPaintMode ) {
			var scale = .7;
			if( _isMouseDown ) {
				TweenMax.to( this, .3, {
					css: {
						scaleX: scale,
						scaleY: scale,
						backgroundColor: '#ff0000'
					}
				});

				_activeBoxesArray.push( this );
				$(this).data('color', '1');
			}
		} 

		// remove grid item
		else {
			var scale = 1;
			if( _isMouseDown ) {
				TweenMax.to( this, .3, {
					css: {
						scaleX: scale,
						scaleY: scale,
						backgroundColor: '#000000'
					}
				});

				_activeBoxesArray = _.without( _activeBoxesArray, this );
				$(this).data('color', '0');
			}
		}
	}

	/**
	 * Handler for Save Matrix button clicks
	 * @param  {MouseEvent} event 
	 * 
	 */
	function onSaveButtonClick( event ) {
		event.stopPropagation();

		var config = GamePlayConfig.DRAW_MODE(),
			len = config.items,
			rows = len / config.cols,
			cols = config.cols,
			boardMatrix = [],
			leftArr = [],
			count = 0,
			$items = $(document.getElementById('container-board')).find('div'),
			$box, colorId, i, j;

		for(i = 0; i < rows; ++i) {
			leftArr = [];
			for(j = 0; j < cols; ++j) {
				$box = $($items[count]);
				colorId = $box.data('color');
				if( _.isUndefined( colorId )) colorId = 0;
				leftArr[j] = colorId;
				++count;
			}

			boardMatrix[i] = leftArr;
		}

		// dispatch board layout back to GamePlayView and update.
		Backbone.Mediator.pub( ApplicationEvent.UPDATE_BOARD, {
			boardMatrix: boardMatrix
		});

		_destroy();
	}

	/**
	 * Handler for reset button clicks
	 * @param  {MouseEvent} event 
	 * 
	 */
	function onResetButtonClick( event ) {
		event.stopPropagation();
		var len = _activeBoxesArray.length;
		for(var i = 0; i < len; ++i ) {
			var box = _activeBoxesArray[i];
			TweenMax.to( box, .3, {
				css: {
					scaleX: 1,
					scaleY: 1,
					backgroundColor: '#000000'
				}, 
				delay: Math.random() * .8,
				ease: Sine.easeInOut,
				onComplete: function() {
					_activeBoxesArray = _.without( _activeBoxesArray, this.target );
				}
			});

			$(box).data('color', '0');
		}
	}

	//--------------------------------------
	//+ PRIVATE AND PROTECTED METHODS
	//--------------------------------------

	/**
	 * Adds event listeners to the items in array
	 * 
	 */
	function addEventListeners() {
		var len = _gridArray.length;
		for(var i = 0; i < len; ++i ) {
			var $box = $(_gridArray[i].instance.el);
			$box.on( 'mouseover', onBoxItemMouseOver );
			//$box.on( 'touchend', onBoxItemMouseOver );
		}

		$(document).on( 'tap', onDocumentClick );
		$(document).on( 'mousedown', onDocumentMouseDown );
		$(document).on( 'mouseup', onDocumentMouseUp );
		$alertLevelMaker.find('.save').on('click', onSaveButtonClick );
		$alertLevelMaker.find('.reset').on('click', onResetButtonClick );
	}	

	/**
	 * Removes event listeners from array
	 * 
	 */
	function removeEventListeners() {
		var len = _gridArray.length;
		for(var i = 0; i < len; ++i ) {
			var $box = $(_gridArray[i].instance.el);
			$box.off( 'mouseover', onBoxItemMouseOver );
			$box.off( 'tap', onBoxItemMouseOver );
		}

		$(document).off( 'click', onDocumentClick );
		$(document).off( 'mousedown', onDocumentMouseDown );
		$(document).off( 'mouseup', onDocumentMouseUp );
	}

	/**
	 * Toggles the 'on' banner
	 * @param {Object} an options hash consisting of
	 *   - remove : {Boolean}
	 */
	function togglePaintModeBanner( options ) {
		if( _.isUndefined( $alertLevelMaker[0] )) return;

		options = options || {};

		if( _isPaintMode ) {
			$('html').css('cursor', 'crosshair');
			TweenMax.to( $alertLevelMaker[0], .3, {
				css: { opacity: 1 }
			})
		} else {
			$('html').css('cursor', 'auto');
			TweenMax.to( $alertLevelMaker[0], .3, {
				css: { opacity: 0 },
				onComplete: function() {
					if( options.remove )
						$(this.target).remove();
				}
			})
		}
	}

	function _destroy() {
		_isPaintMode = false;
		_isMouseDown = false;
		removeEventListeners();
		togglePaintModeBanner({ 
			remove: true 
		});
	}
	
	//--------------------------------------
	//+ PUBLIC INTERFACE
	//--------------------------------------

	return {

		/**
		 * Initializes the LevelMaker
		 * @param  {Array} gridArray an array of grid elements
		 * 
		 */
		init: function( gridArray ) {
			_gridArray = gridArray;

			$alertLevelMaker = $('<div id="alert-levelmaker" />');
			$alertLevelMaker.html( _menuTemplate() ).appendTo('body');

			addEventListeners();

			_.delay( togglePaintModeBanner, 2000 );
		},

		/**
		 * Destroys the LevelMaker
		 * @param  {Array} gridArray an array of grid elements
		 * 
		 */
		destroy: function() {
			_destroy();
		}
	}

}).call(this);

module.exports = LevelMaker;