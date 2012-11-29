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
