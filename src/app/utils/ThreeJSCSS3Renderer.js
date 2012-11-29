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
			