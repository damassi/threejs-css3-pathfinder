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
