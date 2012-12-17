(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"PacMan": function(exports, require, module) {
  //JavaScript////////////////////////////////////////////////////////////////////
  // 
  // Copyright 2012 | POP Agency
  // 
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Three.js CSS3(d) A* Pathfinder
   * 
   * @author Christopher Pappas 
   * @since 11.26.12 
   */

  PacMan = {

      /**
       * Start the app
       * 
       */
      initialize: function() {

          // Import views
          var IntroView = require('views/intro/IntroView');
          var GamePlayView = require( 'views/gameplay/GamePlayView');
          var ApplicationRouter = require('routers/ApplicationRouter');

          // Initialize views
          this.introView = new IntroView();
          this.gamePlayView = new GamePlayView();
          this.router = new ApplicationRouter();

          if( typeof Object.freeze === 'function' ) Object.freeze(this);
      }
  }

  module.exports = PacMan;
  
}});

window.require.define({"collection/SquaresCollection": function(exports, require, module) {
  
}});

window.require.define({"config/AppConfig": function(exports, require, module) {
  /**
   * Application Configuration 
   * 
   * @author 
   * @since  
   */

  var AppConfig = (function() {

  	/*
     	 * Public interface
  	 */
  	return {

  		/**
  		 * The application base-url
  		 * @type {String}
  		 */
  		BASE_URL: "/",

  		/**
  		 * Primary container for application views
  		 * @type {String}
  		 */
  		DOM_CONTAINER: 'body',
  	}

  }).call()

  module.exports = AppConfig;
}});

window.require.define({"config/GamePlayConfig": function(exports, require, module) {
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
  		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  		[1,2,2,0,0,0,0,2,0,0,0,0,0,2,1],
  		[1,0,1,0,1,0,1,1,0,1,0,1,1,0,1],
  		[1,0,1,0,1,2,1,1,0,1,2,1,1,0,1],
  		[1,0,0,0,0,0,2,0,0,0,0,2,0,0,1],
  		[1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
  		[1,0,0,2,0,0,0,0,2,0,0,0,0,0,1],
  		[1,0,1,1,1,0,1,1,1,1,0,1,1,0,1],
  		[1,0,1,1,1,0,1,1,1,1,0,1,1,0,1],
  		[1,0,0,2,0,0,0,0,2,0,0,0,0,0,1],
  		[1,0,1,0,1,0,1,1,0,1,0,1,1,0,1],
  		[1,0,0,0,2,2,2,0,0,2,2,2,0,2,1],
  		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
}});

window.require.define({"core/Collection": function(exports, require, module) {
  /**
   * Base Class for all Backbone Collections 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12 
   */

  Collection = Backbone.Collection.extend({

  	//--------------------------------------
  	//+ PUBLIC PROPERTIES / CONSTANTS
  	//--------------------------------------

  	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------
  	
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

  module.exports = Collection;
}});

window.require.define({"core/Event": function(exports, require, module) {
  /** 
  * Event
  *       - Defines Event Constants for FUSE namespace
  *
  *	AUTHOR: ML
  *	DEPENDENCIES: 
  *		jquery 1.7.2
  *
  **/

  Event = (function(){
  	
  	var _namespace = ".PacMan";
  	var _back = "back" + _namespace;
  	var _cancel = "cancel" + _namespace;
  	var _change = "change" + _namespace;
  	var _clear = "clear" + _namespace;
  	var _close = "close" + _namespace;
  	var _complete = 'complete' + _namespace;
  	var _confirm = 'confirm' + _namespace;
  	var _done = "done" + _namespace;
  	var _forward = "forward" + _namespace;
  	var _keyPress = "keyPress" + _namespace;
  	var _preloaded = 'preloaded' + _namespace;
  	var _ready = "pageReady" + _namespace;
  	var _remove = 'remove' + _namespace;
  	var _released = "released" + _namespace;
  	var _selected = "selected" + _namespace;
  	var _submit = "submit" + _namespace;
  	
  	return {
  		namespace: _namespace,
  		BACK: _back,
  		CANCEL: _cancel,
  		CHANGE: _change,
  		CLEAR: _clear,
  		CLOSE: _close,
  		COMPLETE: _complete,
  		CONFIRM: _confirm,
  		DONE: _done,
  		FORWARD: _forward,
  		KEY_PRESS: _keyPress,
  		PRELOADED: _preloaded,
  		READY: _ready,
  		RELEASED: _released,
  		REMOVE: _remove,
  		SELECTED: _selected,
  		SUBMIT: _submit
  	};

  })();

  module.exports = Event;
}});

window.require.define({"core/Gesture": function(exports, require, module) {
  /** 
  * Core.Gesture
  *       - Defines Gesture event-constants and platform normalization
  *
  *	AUTHOR: christopher.pappas@popagency.com
  *	DEPENDENCIES: 
  *		jquery 1.7.2
  *
  **/

  Gesture = (function(){
  	
  	var _namespace  = '.Fuse';
  	var _touchstart = 'touchstart';
  	var _touchmove  = 'touchmove';
  	var _touchend   = 'touchend';
  	var _tap        = 'tap';
  	
  	return {
  		TOUCH_START: _touchstart + _namespace,
  		TOUCH_MOVE: _touchmove + _namespace,
  		TOUCH_END: _touchend + _namespace,
  		TAP: _tap + _namespace
  	};

  }).call();

  module.exports = Gesture;
}});

window.require.define({"core/Model": function(exports, require, module) {
  /**
   * Base Class for all Backbone Models 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  Model = Backbone.Model.extend({

  	//--------------------------------------
  	//+ PUBLIC PROPERTIES / CONSTANTS
  	//--------------------------------------

  	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------
  	
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

  module.exports = Model;
  
}});

window.require.define({"core/Router": function(exports, require, module) {
  /**
   * Backbone Primary Router 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  Router = Backbone.Router.extend({

  	//--------------------------------------
      //+ INHERITED / OVERRIDES
      //--------------------------------------
      
  	routes: {},

      /**
       * Initializes the Base router
       * @param  {Object} options 
       * 
       */
      initialize: function( options ) {
          _.bindAll( this );
      }
  });

  module.exports = Router;
}});

window.require.define({"core/Swipe": function(exports, require, module) {
  var ID = ID || {};


  //swipe events
  //@param - $el - the element we should check for swipes on
  //@param - $callbackFunct - a callback function
  ID.mobileSwipe = function($el, $callbackFunct) {
  	//check to see if we allow touch events
  	var touchBool = Boolean(document.ontouchstart !==undefined);
  	var startTimeNum = 0;
  	var startXNum = 0;
  	var startYNum = 0;
  	var currentXNum;
  	var currentYNum;
  	//what is the minimum amount that should count as a swipe
  	var minDistNum = 50;
  	//what is the maximum amount of time to count a swipe in milliseconds
  	//if a user is over this number, they held too long to count as a swipe
  	var maxTimeNum = 1000;
  	//set this up to work on either phone or 
  	var touchStartEvent = touchBool ? 'touchstart' : 'mousedown';
  	var touchMoveEvent = touchBool ? 'touchmove' : 'mousemove';
  	var touchEndEvent = touchBool ? 'touchend' : 'mouseup';
  	var cancelEvent = touchBool ? 'touchcancel' : 'mouseleave';

  	//add our listeners
  	$el.on(touchStartEvent,touchStartHandler);

  	//touch start
  	function touchStartHandler($event){
  		startTimeNum = $event.timeStamp;
  		startXNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageX : $event.pageX;
  		startYNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageY : $event.pageY;
  		//add our listeners so they don't stick around
  		$el.on(touchMoveEvent,touchMoveHandler);
  		$el.on(touchEndEvent,touchEndHandler);
  		$el.on(cancelEvent,touchCancelHandler);
  	}
  	//touch move
  	function touchMoveHandler($event){
  		$event.preventDefault();
  		//could just capture these in touch end - leaving for now if we want to use elsewhere
  		currentXNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageX : $event.pageX;
  		currentYNum = $event.originalEvent.touches ? $event.originalEvent.touches[0].pageY : $event.pageY;
  		//if we're swiping one of these ways; kill our dragging around
  		//if (Math.abs(currentXNum-startXNum)>10 || Math.abs(currentYNum-startYNum)>10) {e.preventDefault();}
  	}
  	//touch end
  	function touchEndHandler($event){
  		var endTimeNum = $event.timeStamp;
  		var timeDiffNum = endTimeNum - startTimeNum;
  		//hold our return values for our x/yspeed
  		var xSwipeSpeedNum = 0
  		var ySwipeSpeedNum = 0;
  		//before we do anything else, make sure we should even count a swipe
  		if(timeDiffNum < maxTimeNum){
  			//get our x distance to make sure we should be a swipe
  			var endXDist = Math.abs(currentXNum - startXNum);
  			var endYDist = Math.abs(currentYNum - startYNum);
  			//if we don't reach the minimum requirement for a swipe, we'll just pass 0
  			if(endXDist > minDistNum){
  				xSwipeSpeedNum = (currentXNum - startXNum)/timeDiffNum;
  			}
  			if(endYDist > minDistNum){ 
  				ySwipeSpeedNum = (currentYNum - startYNum)/timeDiffNum;
  			}
  			//call us back
  			$callbackFunct({"x":xSwipeSpeedNum,"y":ySwipeSpeedNum});
  		}
  		touchCancelHandler(null);
  	}
  	//on cancel event
  	function touchCancelHandler($event){
  		$el.off(touchMoveEvent,touchMoveHandler);
  		$el.off(touchEndEvent,touchEndHandler);
  		$el.off(cancelEvent,touchCancelHandler);
  	}

  }
  
}});

window.require.define({"core/View": function(exports, require, module) {
  /**
   * View Base Class 
   * 
   * @author ML
   * @since 11.26.12
   */

  var Model = require( 'core/Model' );

  View = Backbone.View.extend({

    /*
     * Ref to .hbs template
     */
    template: function() {},

    /**
     * The view model
     * @type {Model}
     */
    model: null,
    /**
     * Flag to determine if view is rendered
     * @type {Boolean}
     */
    rendered: false,


    //--------------------------------------
    //+ INHERITED / OVERRIDES
    //--------------------------------------
    
    /*
     * @private
     */
    initialize: function( options ) {
      this.options = options || {};
      
      _.bindAll(this);
    },

    /**
     * Renders this View's template and attaches to element
     * @return {View} this View
     * @private
     */
    render: function( data ) {
      if( !this.template ) return;
      data = data || this.model || {};
      if( data instanceof Model ) data = this.model.attributes;
      this.$el.html( this.template( data ));
      this.delegateEvents();
      
      return this;
    },

    /**
     * Disposes of the view
     * @return {View}
     */
    dispose: function( options ) {
      options = options || {};
      this.rendered = false;
      if( options.currView === this ) return; 
      this.undelegateEvents();
      if (this.model && this.model.off) this.model.off(null, null, this);
      if (this.collection && this.collection.off) this.collection.off(null, null, this);
      this.$el.remove();
      
      return this;
    },

    /**
     * Shows view
     * @return {undefined} 
     */
    show: function() {
      this.$el.css( 'display', 'block' );
    },
    
    /**
     * Hides view
     * @return {undefined} 
     */
    hide: function() {
      this.$el.css( 'display', 'none' );
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

  module.exports = View;
  
}});

window.require.define({"events/ApplicationEvent": function(exports, require, module) {
  /**
   * Application Events 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12 
   */

  var ApplicationEvent = (function() {

  	/*
     	 * Public interface
  	 */
  	return {
  		DISPOSE_VIEWS: 'views:dispose',
  		UPDATE_BOARD: 'board:update'
  	}
  	
  }).call();

  module.exports = ApplicationEvent;
}});

window.require.define({"events/GameEvent": function(exports, require, module) {
  /**
   * Gameplay Events 
   * 
   * @author Christopher Pappas 
   * @since 11.28.12 
   */

  var GameEvent = (function() {

  	/*
     	 * Public interface
  	 */
  	return {
  		SQUARE_SELECTED: 'onSquareSelected'
  	}
  	
  }).call();

  module.exports = GameEvent;
}});

window.require.define({"helpers/ViewHelper": function(exports, require, module) {
  /**
   * Handlebars Template Helpers 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */


  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  /*
  * @return String
  */
  Handlebars.registerHelper( 'link', function( text, url ) {

    text = Handlebars.Utils.escapeExpression( text );
    url  = Handlebars.Utils.escapeExpression( url );

    var result = '<a href="' + url + '">' + text + '</a>';

    return new Handlebars.SafeString( result );
  });
  
}});

window.require.define({"initialize": function(exports, require, module) {
  
  /**
   * Application Initializer 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  var pacMan = require('PacMan');

  $(function() {

  	// Initialize Application
  	pacMan.initialize();

  	// Start Backbone router
    	Backbone.history.start();
  });
  
}});

window.require.define({"models/gameplay/SquareModel": function(exports, require, module) {
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
}});

window.require.define({"routers/ApplicationRouter": function(exports, require, module) {
  /**
   * Backbone Primary Router 
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  var ApplicationEvent = require('events/ApplicationEvent');
  var GamePlayConfig    = require('config/GamePlayConfig');
  var AppConfig         = require('config/AppConfig');
  var Router            = require('core/Router');
  var PacMan            = require('PacMan');

  ApplicationRouter = Router.extend({

  	//--------------------------------------
  	//+ Routes
  	//--------------------------------------
  	
  	/**
  	 * Primary route hash
  	 * @type {Object}
  	 */
  	routes: {
  		''          : 'gamePlay',
  		'intro'     : 'intro',
  		'gameplay'  : 'gamePlay',
  		'drawmode'  : 'drawMode'
  	},

  	//--------------------------------------
  	//+ INHERITED / OVERRIDES
  	//--------------------------------------

  	/**
  	 * Overrides the default Router method and dispatches cleanup event to View BaseClass
  	 * @param  {String}   route    the route
  	 * @param  {String}   name     the name of the route
  	 * @param  {Function} callback The function to execute upon view transition
  	 */
  	route: function( route, name, callback ) {
  		this._super( route, name, callback );
  	},

  	//--------------------------------------
  	//+ Route Handlers
  	//--------------------------------------

  	/**
  	 * Intro / home view for app
  	 * 
  	 */
  	intro: function() {
  		var view = PacMan.introView;
  		view.$el.appendTo( AppConfig.DOM_CONTAINER );
  		view.render();

  		this._cleanupViews({ 
  			currView: view,
  			animated: true 
  		});
  	},

  	/**
  	 * Gameplay view
  	 * 
  	 */
  	gamePlay: function() {
  		GamePlayConfig.drawModeEnabled( false );

  		var view = PacMan.gamePlayView;
  		view.$el.appendTo( AppConfig.DOM_CONTAINER );
  		view.render()

  		this._cleanupViews({ 
  			currView: view,
  			animated: true
  		});
  	},

  	/**
  	 * DrawMode
  	 * 
  	 */
  	drawMode: function() {
  		GamePlayConfig.drawModeEnabled( true );

  		var view = PacMan.gamePlayView;
  		view.$el.appendTo( AppConfig.DOM_CONTAINER );
  		view.render()

  		this._cleanupViews({ 
  			currView: view,
  			animated: true
  		});
  	},


  	//--------------------------------------
  	//+ PRIVATE AND PROTECTED METHODS
  	//--------------------------------------

  	/**
  	 * Generic method which publishes cleanup event to all registered views
  	 * @param {Object} options  an options has consisting of
  	 *   - animated : {Boolean}  should we animate out the view?
  	 */
  	_cleanupViews: function( options ) {
  		Backbone.Mediator.pub( ApplicationEvent.DISPOSE_VIEWS, options );
  	}
  });

  module.exports = ApplicationRouter;
}});

window.require.define({"utils/BackboneView": function(exports, require, module) {
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
}});

window.require.define({"utils/LevelMaker": function(exports, require, module) {
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
}});

window.require.define({"utils/ThreeJSCSS3Renderer": function(exports, require, module) {
  /**
   * Three.js CSS3 3D Renderer wrapper 
   * 
   * @author Christopher Pappas 
   * @since 11.27.12 
   */

  var Utils = require( 'utils/Utils' )

  var ThreeJSCSS3Renderer = function() {

  	/**
  	 * An array of grid items
  	 * @type {Array} containing {Object} with
  	 *   - instance : {DOMElement} the square instance
  	 *   - x: the x-position of the element
  	 *   - y: the y-position of the element
  	 */
  	var _elementsArray;

  	/**
  	 * The parent DOM Element to append scene to
  	 */
  	var _parent;

  	/**
  	 * Required scene objects
  	 */
  	var geometry, material, mesh;
  	var scene, renderer;
  	var controls;
  	var requestId; //requestAnimationFrame poller

  	/**
  	 * Builds the TREE.js CSS3d renderer
  	 * 
  	 */
  	function _init() {

  		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  		camera.position.set( 0, -200, 500 );

  		controls = new THREE.TrackballControls( camera );

  		controls.rotateSpeed = 1.0;
  		controls.zoomSpeed = 1.2;
  		controls.panSpeed = 0.8;

  		controls.noRotate = false;
  		controls.noZoom = false;
  		controls.noPan = false;

  		controls.staticMoving = false;
  		controls.dynamicDampingFactor = 0.8;

  		controls.keys = [ 65, 83, 68 ];

  		scene = new THREE.Scene(camera);

  		var len = _elementsArray.length;
  		for ( var i = 0; i < len; i ++ ) {
  			var instance = _elementsArray[ i ].instance;
  			var element = instance.el;
  			var object = new THREE.CSS3DObject( element );
  			scene.add( object );

  			if( !instance.model.get( 'enemy' )) {
  				TweenMax.to( object.position, 1, {
  					//x: Utils.randRange(-100, 100),
  					//y: Utils.randRange(-100, 100),
  					//z: Utils.randRange(-10, 10),
  					yoyo: true,
  					repeat: -1,
  					ease: Back.easeInOut
  				})
  			}
  		}

  		renderer = new THREE.CSS3DRenderer();
  		renderer.setSize( window.innerWidth, window.innerHeight );
  		renderer.domElement.style.position = 'absolute';
  		renderer.domElement.style.top = 0;

  		camera.position.set(0, -200, 500);
  		camera.lookAt( new THREE.Vector3(0, 190, -50) );

  		_parent.appendChild( renderer.domElement );
  	}

  	function _destroy() {
  		stop();

  		_.defer(function(){
  			_.each( scene.__objects, function( object ) {
  				scene.remove( object );
  			})

  			$( renderer.domElement ).remove();
  			renderer.domElement = null;

  			camera = null;
  			controls = null;
  			scene = null;
  			render = null;
  		})
  	}

  	/**
  	 * Start the animation loop
  	 * @return {[type]} [description]
  	 */
  	function animate() {
  		controls.update();
  		renderer.render( scene, camera );
  		requestId = window.requestAnimationFrame( animate );
  	}

  	function start() {
  	    if( !requestId ) {
  	       	animate();
  	    }
  	}

  	function stop() {
  	    if( requestId ) {
  	       	window.cancelAnimationFrame( requestId );
  	       	requestId = null;
  	    }
  	}

  	//--------------------------------------
  	//+ PUBLIC INTERFACE
  	//--------------------------------------

  	return {

  		/**
  		 * Initializes the renderer
  		 * @param  {Array} elementsArray An array of dom elements to push into the renderer
  		 * 
  		 */
  		init: function( elementsArray, parent ) {
  			_elementsArray = elementsArray;
  			_parent = parent;

  			_init();
  			start();
  		},

  		/**
  		 * Destroys the renderer
  		 * 
  		 */
  		destroy: function() {
  			_destroy();
  		}
  	}
  }

  module.exports = ThreeJSCSS3Renderer;
  			
}});

window.require.define({"utils/Utils": function(exports, require, module) {
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
  
}});

window.require.define({"views/gameover/GameOverView": function(exports, require, module) {
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
}});

window.require.define({"views/gameplay/BoardView": function(exports, require, module) {
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
}});

window.require.define({"views/gameplay/GamePlayView": function(exports, require, module) {
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
}});

window.require.define({"views/gameplay/SquareView": function(exports, require, module) {
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
}});

window.require.define({"views/help/HelpView": function(exports, require, module) {
  /**
   * Help and instructions
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  var View     = require('core/View');
  var template = require('templates/homeViewTemplate');

  var HelpView = View.extend({

    	/*
     	 * The id of the view
  	 */
  	id: 'container-help',

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

  module.exports = HelpView;
}});

window.require.define({"views/intro/IntroView": function(exports, require, module) {
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
}});

window.require.define({"views/scores/ScoresView": function(exports, require, module) {
  /**
   * Hi-scores view
   * 
   * @author Christopher Pappas 
   * @since 11.26.12
   */

  var View     = require('core/View');
  var template = require('templates/homeViewTemplate');

  var ScoresView = View.extend({

    	/*
     	 * The id of the view
  	 */
  	id: 'container-scores',

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

  module.exports = ScoresView;
}});

