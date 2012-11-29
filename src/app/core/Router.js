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