window.require.define({"templates/homeViewTemplate": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = "";
    buffer += "\n  			<li>";
    depth0 = typeof depth0 === functionType ? depth0() : depth0;
    buffer += escapeExpression(depth0) + "</li>\n  		";
    return buffer;}

    buffer += "<div id=\"content\">\n  <div id=\"artist\">";
    foundHelper = helpers.artist;
    if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
    else { stack1 = depth0.artist; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
    buffer += escapeExpression(stack1) + "</div>\n  <div id=\"operas\">\n  	<ul>\n  		";
    stack1 = depth0.operas;
    stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </div>\n</div>\n";
    return buffer;});
}});

window.require.define({"templates/intro/introViewTemplate": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    


    return "<h1>\n	INTRO VIEW\n</h1>\n<a href='#gameplay'>Play game</a>\n<a href='#scores'>Hi-scores</a>\n<a href='#drawmode'>Drawmode</a>";});
}});

window.require.define({"templates/levelmaker/levelMakerMenuTemplate": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    


    return "PAINT MODE ON\n\n<div id='menu-levelmaker'>	\n	<div class='controls'>\n		<button class='save'>Save Matrix</button>\n		<button class='reset'>Reset</button>\n	</div>\n</div>";});
}});

