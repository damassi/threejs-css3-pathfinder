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

// Make it safe to do console.log() always.
(function (con) {
  var method;
  var dummy = function() {};
  var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' + 
     'time,timeEnd,trace,warn').split(',');
  while (method = methods.pop()) {
    con[method] = con[method] || dummy;
  }
})(window.console = window.console || {});
;

/* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)
;

/*!
 * Lo-Dash 0.10.0 <http://lodash.com>
 * (c) 2012 John-David Dalton <http://allyoucanleet.com/>
 * Based on Underscore.js 1.4.2 <http://underscorejs.org>
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Available under MIT license <http://lodash.com/license>
 */
;(function(window, undefined) {

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports;

  /** Detect free variable `global` and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  /** Used for array and object method references */
  var arrayRef = [],
      // avoid a Closure Compiler bug by creatively creating an object
      objectRef = new function(){};

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = objectRef;

  /** Used by `cachedContains` as the default size when optimizations are enabled for large arrays */
  var largeArraySize = 30;

  /** Used to restore the original `_` reference in `noConflict` */
  var oldDash = window._;

  /** Used to detect template delimiter values that require a with-statement */
  var reComplexDelimiter = /[-?+=!~*%&^<>|{(\/]|\[\D|\b(?:delete|in|instanceof|new|typeof|void)\b/;

  /** Used to match HTML entities */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#x27);/g;

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to insert the data object variable into compiled template source */
  var reInsertVariable = /(?:__e|__t = )\(\s*(?![\d\s"']|this\.)/g;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    (objectRef.valueOf + '')
      .replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&')
      .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
  );

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{((?:(?=\\?)\\?[\s\S])*?)}/g;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to match HTML characters */
  var reUnescapedHtml = /[&<>"']/g;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowed = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** Native method shortcuts */
  var ceil = Math.ceil,
      concat = arrayRef.concat,
      floor = Math.floor,
      getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
      hasOwnProperty = objectRef.hasOwnProperty,
      push = arrayRef.push,
      propertyIsEnumerable = objectRef.propertyIsEnumerable,
      slice = arrayRef.slice,
      toString = objectRef.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeBind = reNative.test(nativeBind = slice.bind) && nativeBind,
      nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeIsFinite = window.isFinite,
      nativeIsNaN = window.isNaN,
      nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeRandom = Math.random;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /**
   * Detect the JScript [[DontEnum]] bug:
   *
   * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
   * made non-enumerable as well.
   */
  var hasDontEnumBug;

  /** Detect if own properties are iterated after inherited properties (IE < 9) */
  var iteratesOwnLast;

  /**
   * Detect if `Array#shift` and `Array#splice` augment array-like objects
   * incorrectly:
   *
   * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
   * and `splice()` functions that fail to remove the last element, `value[0]`,
   * of array-like objects even though the `length` property is set to `0`.
   * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
   * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
   */
  var hasObjectSpliceBug = (hasObjectSpliceBug = { '0': 1, 'length': 1 },
    arrayRef.splice.call(hasObjectSpliceBug, 0, 1), hasObjectSpliceBug[0]);

  /** Detect if an `arguments` object's indexes are non-enumerable (IE < 9) */
  var noArgsEnum = true;

  (function() {
    var props = [];
    function ctor() { this.x = 1; }
    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var prop in new ctor) { props.push(prop); }
    for (prop in arguments) { noArgsEnum = !prop; }

    hasDontEnumBug = !/valueOf/.test(props);
    iteratesOwnLast = props[0] != 'x';
  }(1));

  /** Detect if an `arguments` object's [[Class]] is unresolvable (Firefox < 4, IE < 9) */
  var noArgsClass = !isArguments(arguments);

  /** Detect if `Array#slice` cannot be used to convert strings to arrays (Opera < 10.52) */
  var noArraySliceOnStrings = slice.call('x')[0] != 'x';

  /**
   * Detect lack of support for accessing string characters by index:
   *
   * IE < 8 can't access characters by index and IE 8 can only access
   * characters by index on string literals.
   */
  var noCharByIndex = ('x'[0] + Object('x')[0]) != 'xx';

  /**
   * Detect if a node's [[Class]] is unresolvable (IE < 9)
   * and that the JS engine won't error when attempting to coerce an object to
   * a string without a `toString` property value of `typeof` "function".
   */
  try {
    var noNodeClass = ({ 'toString': 0 } + '', toString.call(window.document || 0) == objectClass);
  } catch(e) { }

  /* Detect if `Function#bind` exists and is inferred to be fast (all but V8) */
  var isBindFast = nativeBind && /\n|Opera/.test(nativeBind + toString.call(window.opera));

  /* Detect if `Object.keys` exists and is inferred to be fast (IE, Opera, V8) */
  var isKeysFast = nativeKeys && /^.+$|true/.test(nativeKeys + !!window.attachEvent);

  /**
   * Detect if sourceURL syntax is usable without erroring:
   *
   * The JS engine in Adobe products, like InDesign, will throw a syntax error
   * when it encounters a single line comment beginning with the `@` symbol.
   *
   * The JS engine in Narwhal will generate the function `function anonymous(){//}`
   * and throw a syntax error.
   *
   * Avoid comments beginning `@` symbols in IE because they are part of its
   * non-standard conditional compilation support.
   * http://msdn.microsoft.com/en-us/library/121hztk3(v=vs.94).aspx
   */
  try {
    var useSourceURL = (Function('//@')(), !window.attachEvent);
  } catch(e) { }

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[argsClass] = cloneableClasses[funcClass] = false;
  cloneableClasses[arrayClass] = cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] = cloneableClasses[regexpClass] =
  cloneableClasses[stringClass] = true;

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /*--------------------------------------------------------------------------*/

  /**
   * The `lodash` function.
   *
   * @name _
   * @constructor
   * @category Chaining
   * @param {Mixed} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   */
  function lodash(value) {
    // exit early if already wrapped
    if (value && value.__wrapped__) {
      return value;
    }
    // allow invoking `lodash` without the `new` operator
    if (!(this instanceof lodash)) {
      return new lodash(value);
    }
    this.__wrapped__ = value;
  }

  /**
   * By default, the template delimiters used by Lo-Dash are similar to those in
   * embedded Ruby (ERB). Change the following template settings to use alternative
   * delimiters.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  lodash.templateSettings = {

    /**
     * Used to detect `data` property values to be HTML-escaped.
     *
     * @static
     * @memberOf _.templateSettings
     * @type RegExp
     */
    'escape': /<%-([\s\S]+?)%>/g,

    /**
     * Used to detect code to be evaluated.
     *
     * @static
     * @memberOf _.templateSettings
     * @type RegExp
     */
    'evaluate': /<%([\s\S]+?)%>/g,

    /**
     * Used to detect `data` property values to inject.
     *
     * @static
     * @memberOf _.templateSettings
     * @type RegExp
     */
    'interpolate': reInterpolate,

    /**
     * Used to reference the data object in the template text.
     *
     * @static
     * @memberOf _.templateSettings
     * @type String
     */
    'variable': ''
  };

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Obect} data The data object used to populate the text.
   * @returns {String} Returns the interpolated text.
   */
  var iteratorTemplate = template(
    // conditional strict mode
    '<% if (obj.useStrict) { %>\'use strict\';\n<% } %>' +

    // the `iteratee` may be reassigned by the `top` snippet
    'var index, value, iteratee = <%= firstArg %>, ' +
    // assign the `result` variable an initial value
    'result = <%= firstArg %>;\n' +
    // exit early if the first argument is falsey
    'if (!<%= firstArg %>) return result;\n' +
    // add code before the iteration branches
    '<%= top %>;\n' +

    // array-like iteration:
    '<% if (arrayLoop) { %>' +
    'var length = iteratee.length; index = -1;\n' +
    'if (typeof length == \'number\') {' +

    // add support for accessing string characters by index if needed
    '  <% if (noCharByIndex) { %>\n' +
    '  if (isString(iteratee)) {\n' +
    '    iteratee = iteratee.split(\'\')\n' +
    '  }' +
    '  <% } %>\n' +

    // iterate over the array-like value
    '  while (++index < length) {\n' +
    '    value = iteratee[index];\n' +
    '    <%= arrayLoop %>\n' +
    '  }\n' +
    '}\n' +
    'else {' +

    // object iteration:
    // add support for iterating over `arguments` objects if needed
    '  <%  } else if (noArgsEnum) { %>\n' +
    '  var length = iteratee.length; index = -1;\n' +
    '  if (length && isArguments(iteratee)) {\n' +
    '    while (++index < length) {\n' +
    '      value = iteratee[index += \'\'];\n' +
    '      <%= objectLoop %>\n' +
    '    }\n' +
    '  } else {' +
    '  <% } %>' +

    // Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
    // (if the prototype or a property on the prototype has been set)
    // incorrectly sets a function's `prototype` property [[Enumerable]]
    // value to `true`. Because of this Lo-Dash standardizes on skipping
    // the the `prototype` property of functions regardless of its
    // [[Enumerable]] value.
    '  <% if (!hasDontEnumBug) { %>\n' +
    '  var skipProto = typeof iteratee == \'function\' && \n' +
    '    propertyIsEnumerable.call(iteratee, \'prototype\');\n' +
    '  <% } %>' +

    // iterate own properties using `Object.keys` if it's fast
    '  <% if (isKeysFast && useHas) { %>\n' +
    '  var ownIndex = -1,\n' +
    '      ownProps = objectTypes[typeof iteratee] ? nativeKeys(iteratee) : [],\n' +
    '      length = ownProps.length;\n\n' +
    '  while (++ownIndex < length) {\n' +
    '    index = ownProps[ownIndex];\n' +
    '    <% if (!hasDontEnumBug) { %>if (!(skipProto && index == \'prototype\')) {\n  <% } %>' +
    '    value = iteratee[index];\n' +
    '    <%= objectLoop %>\n' +
    '    <% if (!hasDontEnumBug) { %>}\n<% } %>' +
    '  }' +

    // else using a for-in loop
    '  <% } else { %>\n' +
    '  for (index in iteratee) {<%' +
    '    if (!hasDontEnumBug || useHas) { %>\n    if (<%' +
    '      if (!hasDontEnumBug) { %>!(skipProto && index == \'prototype\')<% }' +
    '      if (!hasDontEnumBug && useHas) { %> && <% }' +
    '      if (useHas) { %>hasOwnProperty.call(iteratee, index)<% }' +
    '    %>) {' +
    '    <% } %>\n' +
    '    value = iteratee[index];\n' +
    '    <%= objectLoop %>;' +
    '    <% if (!hasDontEnumBug || useHas) { %>\n    }<% } %>\n' +
    '  }' +
    '  <% } %>' +

    // Because IE < 9 can't set the `[[Enumerable]]` attribute of an
    // existing property and the `constructor` property of a prototype
    // defaults to non-enumerable, Lo-Dash skips the `constructor`
    // property when it infers it's iterating over a `prototype` object.
    '  <% if (hasDontEnumBug) { %>\n\n' +
    '  var ctor = iteratee.constructor;\n' +
    '    <% for (var k = 0; k < 7; k++) { %>\n' +
    '  index = \'<%= shadowed[k] %>\';\n' +
    '  if (<%' +
    '      if (shadowed[k] == \'constructor\') {' +
    '        %>!(ctor && ctor.prototype === iteratee) && <%' +
    '      } %>hasOwnProperty.call(iteratee, index)) {\n' +
    '    value = iteratee[index];\n' +
    '    <%= objectLoop %>\n' +
    '  }' +
    '    <% } %>' +
    '  <% } %>' +
    '  <% if (arrayLoop || noArgsEnum) { %>\n}<% } %>\n' +

    // add code to the bottom of the iteration function
    '<%= bottom %>;\n' +
    // finally, return the `result`
    'return result'
  );

  /** Reusable iterator options for `assign` and `defaults` */
  var assignIteratorOptions = {
    'args': 'object, source, guard',
    'top':
      'for (var argsIndex = 1, argsLength = typeof guard == \'number\' ? 2 : arguments.length; argsIndex < argsLength; argsIndex++) {\n' +
      '  if ((iteratee = arguments[argsIndex])) {',
    'objectLoop': 'result[index] = value',
    'bottom': '  }\n}'
  };

  /**
   * Reusable iterator options shared by `forEach`, `forIn`, and `forOwn`.
   */
  var forEachIteratorOptions = {
    'args': 'collection, callback, thisArg',
    'top': 'callback = createCallback(callback, thisArg)',
    'arrayLoop': 'if (callback(value, index, collection) === false) return result',
    'objectLoop': 'if (callback(value, index, collection) === false) return result'
  };

  /** Reusable iterator options for `forIn` and `forOwn` */
  var forOwnIteratorOptions = {
    'arrayLoop': null
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function optimized to search large arrays for a given `value`,
   * starting at `fromIndex`, using strict equality for comparisons, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to search from.
   * @param {Number} [largeSize=30] The length at which an array is considered large.
   * @returns {Boolean} Returns `true` if `value` is found, else `false`.
   */
  function cachedContains(array, fromIndex, largeSize) {
    fromIndex || (fromIndex = 0);

    var length = array.length,
        isLarge = (length - fromIndex) >= (largeSize || largeArraySize);

    if (isLarge) {
      var cache = {},
          index = fromIndex - 1;

      while (++index < length) {
        // manually coerce `value` to a string because `hasOwnProperty`, in some
        // older versions of Firefox, coerces objects incorrectly
        var key = array[index] + '';
        (hasOwnProperty.call(cache, key) ? cache[key] : (cache[key] = [])).push(array[index]);
      }
    }
    return function(value) {
      if (isLarge) {
        var key = value + '';
        return hasOwnProperty.call(cache, key) && indexOf(cache[key], value) > -1;
      }
      return indexOf(array, value, fromIndex) > -1;
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default `callback` when a given
   * `collection` is a string value.
   *
   * @private
   * @param {String} value The character to inspect.
   * @returns {Number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` values, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {Number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ai = a.index,
        bi = b.index;

    a = a.criteria;
    b = b.criteria;

    // ensure a stable sort in V8 and other engines
    // http://code.google.com/p/v8/issues/detail?id=90
    if (a !== b) {
      if (a > b || a === undefined) {
        return 1;
      }
      if (a < b || b === undefined) {
        return -1;
      }
    }
    return ai < bi ? -1 : 1;
  }

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any `partailArgs` to the arguments passed
   * to the bound function.
   *
   * @private
   * @param {Function|String} func The function to bind or the method name.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Array} partialArgs An array of arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   */
  function createBound(func, thisArg, partialArgs) {
    var isFunc = isFunction(func),
        isPartial = !partialArgs,
        key = thisArg;

    // juggle arguments
    if (isPartial) {
      partialArgs = thisArg;
    }
    if (!isFunc) {
      thisArg = func;
    }

    function bound() {
      // `Function#bind` spec
      // http://es5.github.com/#x15.3.4.5
      var args = arguments,
          thisBinding = isPartial ? this : thisArg;

      if (!isFunc) {
        func = thisArg[key];
      }
      if (partialArgs.length) {
        args = args.length
          ? partialArgs.concat(slice.call(args))
          : partialArgs;
      }
      if (this instanceof bound) {
        // get `func` instance if `bound` is invoked in a `new` expression
        noop.prototype = func.prototype;
        thisBinding = new noop;

        // mimic the constructor's `return` behavior
        // http://es5.github.com/#x13.2.2
        var result = func.apply(thisBinding, args);
        return isObject(result)
          ? result
          : thisBinding
      }
      return func.apply(thisBinding, args);
    }
    return bound;
  }

  /**
   * Produces an iteration callback bound to an optional `thisArg`. If `func` is
   * a property name, the callback will return the property value for a given element.
   *
   * @private
   * @param {Function|String} [func=identity|property] The function called per
   * iteration or property name to query.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Function} Returns a callback function.
   */
  function createCallback(func, thisArg) {
    if (!func) {
      return identity;
    }
    if (typeof func != 'function') {
      return function(object) {
        return object[func];
      };
    }
    if (thisArg !== undefined) {
      return function(value, index, object) {
        return func.call(thisArg, value, index, object);
      };
    }
    return func;
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {Object} [options1, options2, ...] The compile options object(s).
   *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
   *  args - A string of comma separated arguments the iteration function will accept.
   *  top - A string of code to execute before the iteration branches.
   *  arrayLoop - A string of code to execute in the array loop.
   *  objectLoop - A string of code to execute in the object loop.
   *  bottom - A string of code to execute after the iteration branches.
   *
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    var data = {
      'arrayLoop': '',
      'bottom': '',
      'hasDontEnumBug': hasDontEnumBug,
      'isKeysFast': isKeysFast,
      'objectLoop': '',
      'noArgsEnum': noArgsEnum,
      'noCharByIndex': noCharByIndex,
      'shadowed': shadowed,
      'top': '',
      'useHas': true
    };

    // merge options into a template data object
    for (var object, index = 0; object = arguments[index]; index++) {
      for (var key in object) {
        data[key] = object[key];
      }
    }
    var args = data.args;
    data.firstArg = /^[^,]+/.exec(args)[0];

    // create the function factory
    var factory = Function(
        'createCallback, hasOwnProperty, isArguments, isString, objectTypes, ' +
        'nativeKeys, propertyIsEnumerable',
      'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
    );
    // return the compiled function
    return factory(
      createCallback, hasOwnProperty, isArguments, isString, objectTypes,
      nativeKeys, propertyIsEnumerable
    );
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Used by `escape` to convert characters to HTML entities.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeHtmlChar(match) {
    return htmlEscapes[match];
  }

  /**
   * A no-operation function.
   *
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * Used by `unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {String} match The matched character to unescape.
   * @returns {String} Returns the unescaped character.
   */
  function unescapeHtmlChar(match) {
    return htmlUnescapes[match];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Assigns own enumerable properties of source object(s) to the `destination`
   * object. Subsequent sources will overwrite propery assignments of previous
   * sources.
   *
   * @static
   * @memberOf _
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {Object} [source1, source2, ...] The source objects.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'moe' }, { 'age': 40 });
   * // => { 'name': 'moe', 'age': 40 }
   */
  var assign = createIterator(assignIteratorOptions);

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return toString.call(value) == argsClass;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (noArgsClass) {
    isArguments = function(value) {
      return value ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

  /**
   * Iterates over `object`'s own and inherited enumerable properties, executing
   * the `callback` for each property. The `callback` is bound to `thisArg` and
   * invoked with three arguments; (value, key, object). Callbacks may exit iteration
   * early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Dog(name) {
   *   this.name = name;
   * }
   *
   * Dog.prototype.bark = function() {
   *   alert('Woof, woof!');
   * };
   *
   * _.forIn(new Dog('Dagny'), function(value, key) {
   *   alert(key);
   * });
   * // => alerts 'name' and 'bark' (order is not guaranteed)
   */
  var forIn = createIterator(forEachIteratorOptions, forOwnIteratorOptions, {
    'useHas': false
  });

  /**
   * Iterates over an object's own enumerable properties, executing the `callback`
   * for each property. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by explicitly
   * returning `false`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   alert(key);
   * });
   * // => alerts '0', '1', and 'length' (order is not guaranteed)
   */
  var forOwn = createIterator(forEachIteratorOptions, forOwnIteratorOptions);

  /**
   * A fallback implementation of `isPlainObject` that checks if a given `value`
   * is an object created by the `Object` constructor, assuming objects created
   * by the `Object` constructor have no inherited enumerable properties and that
   * there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if `value` is a plain object, else `false`.
   */
  function shimIsPlainObject(value) {
    // avoid non-objects and false positives for `arguments` objects
    var result = false;
    if (!(value && typeof value == 'object') || isArguments(value)) {
      return result;
    }
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings.
    // Also check that the constructor is `Object` (i.e. `Object instanceof Object`)
    var ctor = value.constructor;
    if ((!noNodeClass || !(typeof value.toString != 'function' && typeof (value + '') == 'string')) &&
        (!isFunction(ctor) || ctor instanceof ctor)) {
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      if (iteratesOwnLast) {
        forIn(value, function(value, key, object) {
          result = !hasOwnProperty.call(object, key);
          return false;
        });
        return result === false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return result === false || hasOwnProperty.call(value, result);
    }
    return result;
  }

  /**
   * A fallback implementation of `Object.keys` that produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   */
  function shimKeys(object) {
    var result = [];
    forOwn(object, function(value, key) {
      result.push(key);
    });
    return result;
  }

  /**
   * Used to convert characters to HTML entities:
   *
   * Though the `>` character is escaped for symmetry, characters like `>` and `/`
   * don't require escaping in HTML and have no special meaning unless they're part
   * of a tag or an unquoted attribute value.
   * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
   */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };

  /** Used to convert HTML entities to characters */
  var htmlUnescapes = invert(htmlEscapes);

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a clone of `value`. If `deep` is `true`, all nested objects will
   * also be cloned otherwise they will be assigned by reference. Functions, DOM
   * nodes, `arguments` objects, and objects created by constructors other than
   * `Object` are **not** cloned.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to clone.
   * @param {Boolean} deep A flag to indicate a deep clone.
   * @param- {Object} [guard] Internally used to allow this method to work with
   *  others like `_.map` without using their callback `index` argument for `deep`.
   * @param- {Array} [stackA=[]] Internally used to track traversed source objects.
   * @param- {Array} [stackB=[]] Internally used to associate clones with their
   *  source counterparts.
   * @returns {Mixed} Returns the cloned `value`.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 },
   *   { 'name': 'curly', 'age': 60 }
   * ];
   *
   * _.clone({ 'name': 'moe' });
   * // => { 'name': 'moe' }
   *
   * var shallow = _.clone(stooges);
   * shallow[0] === stooges[0];
   * // => true
   *
   * var deep = _.clone(stooges, true);
   * shallow[0] === stooges[0];
   * // => false
   */
  function clone(value, deep, guard, stackA, stackB) {
    if (value == null) {
      return value;
    }
    if (guard) {
      deep = false;
    }
    // inspect [[Class]]
    var isObj = isObject(value);
    if (isObj) {
      // don't clone `arguments` objects, functions, or non-object Objects
      var className = toString.call(value);
      if (!cloneableClasses[className] || (noArgsClass && isArguments(value))) {
        return value;
      }
      var isArr = className == arrayClass;
      isObj = isArr || (className == objectClass ? isPlainObject(value) : isObj);
    }
    // shallow clone
    if (!isObj || !deep) {
      // don't clone functions
      return isObj
        ? (isArr ? slice.call(value) : assign({}, value))
        : value;
    }

    var ctor = value.constructor;
    switch (className) {
      case boolClass:
      case dateClass:
        return new ctor(+value);

      case numberClass:
      case stringClass:
        return new ctor(value);

      case regexpClass:
        return ctor(value.source, reFlags.exec(value));
    }
    // check for circular references and return corresponding clone
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    // init cloned object
    var result = isArr ? ctor(value.length) : {};

    // add the source value to the stack of traversed objects
    // and associate it with its clone
    stackA.push(value);
    stackB.push(result);

    // recursively populate clone (susceptible to call stack limits)
    (isArr ? forEach : forOwn)(value, function(objValue, key) {
      result[key] = clone(objValue, deep, null, stackA, stackB);
    });

    return result;
  }

  /**
   * Assigns own enumerable properties of source object(s) to the `destination`
   * object for all `destination` properties that resolve to `null`/`undefined`.
   * Once a property is set, additional defaults of the same property will be
   * ignored.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The destination object.
   * @param {Object} [default1, default2, ...] The default objects.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var iceCream = { 'flavor': 'chocolate' };
   * _.defaults(iceCream, { 'flavor': 'vanilla', 'sprinkles': 'rainbow' });
   * // => { 'flavor': 'chocolate', 'sprinkles': 'rainbow' }
   */
  var defaults = createIterator(assignIteratorOptions, {
    'objectLoop': 'if (result[index] == null) ' + assignIteratorOptions.objectLoop
  });

  /**
   * Creates a sorted array of all enumerable properties, own and inherited,
   * of `object` that have function values.
   *
   * @static
   * @memberOf _
   * @alias methods
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names that have function values.
   * @example
   *
   * _.functions(_);
   * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
   */
  function functions(object) {
    var result = [];
    forIn(object, function(value, key) {
      if (isFunction(value)) {
        result.push(key);
      }
    });
    return result.sort();
  }

  /**
   * Checks if the specified object `property` exists and is a direct property,
   * instead of an inherited property.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to check.
   * @param {String} property The property to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   * @example
   *
   * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
   * // => true
   */
  function has(object, property) {
    return object ? hasOwnProperty.call(object, property) : false;
  }

  /**
   * Creates an object composed of the inverted keys and values of the given `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to invert.
   * @returns {Object} Returns the created inverted object.
   * @example
   *
   *  _.invert({ 'first': 'Moe', 'second': 'Larry', 'third': 'Curly' });
   * // => { 'Moe': 'first', 'Larry': 'second', 'Curly': 'third' } (order is not guaranteed)
   */
  function invert(object) {
    var result = {};
    forOwn(object, function(value, key) {
      result[value] = key;
    });
    return result;
  }

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return toString.call(value) == arrayClass;
  };

  /**
   * Checks if `value` is a boolean (`true` or `false`) value.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a boolean value, else `false`.
   * @example
   *
   * _.isBoolean(null);
   * // => false
   */
  function isBoolean(value) {
    return value === true || value === false || toString.call(value) == boolClass;
  }

  /**
   * Checks if `value` is a date.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a date, else `false`.
   * @example
   *
   * _.isDate(new Date);
   * // => true
   */
  function isDate(value) {
    return toString.call(value) == dateClass;
  }

  /**
   * Checks if `value` is a DOM element.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a DOM element, else `false`.
   * @example
   *
   * _.isElement(document.body);
   * // => true
   */
  function isElement(value) {
    return value ? value.nodeType === 1 : false;
  }

  /**
   * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
   * length of `0` and objects with no own enumerable properties are considered
   * "empty".
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Array|Object|String} value The value to inspect.
   * @returns {Boolean} Returns `true` if the `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({});
   * // => true
   *
   * _.isEmpty('');
   * // => true
   */
  function isEmpty(value) {
    var result = true;
    if (!value) {
      return result;
    }
    var className = toString.call(value),
        length = value.length;

    if ((className == arrayClass || className == stringClass ||
        className == argsClass || (noArgsClass && isArguments(value))) ||
        (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
      return !length;
    }
    forOwn(value, function() {
      return (result = false);
    });
    return result;
  }

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent to each other.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} a The value to compare.
   * @param {Mixed} b The other value to compare.
   * @param- {Object} [stackA=[]] Internally used track traversed `a` objects.
   * @param- {Object} [stackB=[]] Internally used track traversed `b` objects.
   * @returns {Boolean} Returns `true` if the values are equvalent, else `false`.
   * @example
   *
   * var moe = { 'name': 'moe', 'luckyNumbers': [13, 27, 34] };
   * var clone = { 'name': 'moe', 'luckyNumbers': [13, 27, 34] };
   *
   * moe == clone;
   * // => false
   *
   * _.isEqual(moe, clone);
   * // => true
   */
  function isEqual(a, b, stackA, stackB) {
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    // a strict comparison is necessary because `null == undefined`
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a);
    if (className != toString.call(b)) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0`, treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return a != +a
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.com/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == b + '';
    }
    // exit early, in older browsers, if `a` is array-like but not `b`
    var isArr = className == arrayClass || className == argsClass;
    if (noArgsClass && !isArr && (isArr = isArguments(a)) && !isArguments(b)) {
      return false;
    }
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      if (a.__wrapped__ || b.__wrapped__) {
        return isEqual(a.__wrapped__ || a, b.__wrapped__ || b);
      }
      // exit for functions and DOM nodes
      if (className != objectClass || (noNodeClass && (
          (typeof a.toString != 'function' && typeof (a + '') == 'string') ||
          (typeof b.toString != 'function' && typeof (b + '') == 'string')))) {
        return false;
      }
      var ctorA = a.constructor,
          ctorB = b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB && !(
            isFunction(ctorA) && ctorA instanceof ctorA &&
            isFunction(ctorB) && ctorB instanceof ctorB
          )) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.com/#x15.12.3)
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }

    var index = -1,
        result = true,
        size = 0;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      size = a.length;
      result = size == b.length;

      if (result) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          if (!(result = isEqual(a[size], b[size], stackA, stackB))) {
            break;
          }
        }
      }
      return result;
    }
    // deep compare objects
    for (var key in a) {
      if (hasOwnProperty.call(a, key)) {
        // count the number of properties.
        size++;
        // deep compare each property value.
        if (!(hasOwnProperty.call(b, key) && isEqual(a[key], b[key], stackA, stackB))) {
          return false;
        }
      }
    }
    // ensure both objects have the same number of properties
    for (key in b) {
      // The JS engine in Adobe products, like InDesign, has a bug that causes
      // `!size--` to throw an error so it must be wrapped in parentheses.
      // https://github.com/documentcloud/underscore/issues/355
      if (hasOwnProperty.call(b, key) && !(size--)) {
        // `size` will be `-1` if `b` has more properties than `a`
        return false;
      }
    }
    // handle JScript [[DontEnum]] bug
    if (hasDontEnumBug) {
      while (++index < 7) {
        key = shadowed[index];
        if (hasOwnProperty.call(a, key) &&
            !(hasOwnProperty.call(b, key) && isEqual(a[key], b[key], stackA, stackB))) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if `value` is, or can be coerced to, a finite number.
   *
   * Note: This is not the same as native `isFinite`, which will return true for
   * booleans and empty strings. See http://es5.github.com/#x15.1.2.5.
   *
   * @deprecated
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a finite number, else `false`.
   * @example
   *
   * _.isFinite(-101);
   * // => true
   *
   * _.isFinite('10');
   * // => true
   *
   * _.isFinite(true);
   * // => false
   *
   * _.isFinite('');
   * // => false
   *
   * _.isFinite(Infinity);
   * // => false
   */
  function isFinite(value) {
    return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
  }

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return toString.call(value) == funcClass;
    };
  }

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.com/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return value ? objectTypes[typeof value] : false;
  }

  /**
   * Checks if `value` is `NaN`.
   *
   * Note: This is not the same as native `isNaN`, which will return true for
   * `undefined` and other values. See http://es5.github.com/#x15.1.2.4.
   *
   * @deprecated
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is `NaN`, else `false`.
   * @example
   *
   * _.isNaN(NaN);
   * // => true
   *
   * _.isNaN(new Number(NaN));
   * // => true
   *
   * isNaN(undefined);
   * // => true
   *
   * _.isNaN(undefined);
   * // => false
   */
  function isNaN(value) {
    // `NaN` as a primitive is the only value that is not equal to itself
    // (perform the [[Class]] check first to avoid errors with some host objects in IE)
    return toString.call(value) == numberClass && value != +value
  }

  /**
   * Checks if `value` is `null`.
   *
   * @deprecated
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is `null`, else `false`.
   * @example
   *
   * _.isNull(null);
   * // => true
   *
   * _.isNull(undefined);
   * // => false
   */
  function isNull(value) {
    return value === null;
  }

  /**
   * Checks if `value` is a number.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a number, else `false`.
   * @example
   *
   * _.isNumber(8.4 * 5);
   * // => true
   */
  function isNumber(value) {
    return toString.call(value) == numberClass;
  }

  /**
   * Checks if a given `value` is an object created by the `Object` constructor.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Stooge(name, age) {
   *   this.name = name;
   *   this.age = age;
   * }
   *
   * _.isPlainObject(new Stooge('moe', 40));
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'name': 'moe', 'age': 40 });
   * // => true
   */
  var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
    if (!(value && typeof value == 'object')) {
      return false;
    }
    var valueOf = value.valueOf,
        objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

    return objProto
      ? value == objProto || (getPrototypeOf(value) == objProto && !isArguments(value))
      : shimIsPlainObject(value);
  };

  /**
   * Checks if `value` is a regular expression.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a regular expression, else `false`.
   * @example
   *
   * _.isRegExp(/moe/);
   * // => true
   */
  function isRegExp(value) {
    return toString.call(value) == regexpClass;
  }

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('moe');
   * // => true
   */
  function isString(value) {
    return toString.call(value) == stringClass;
  }

  /**
   * Checks if `value` is `undefined`.
   *
   * @deprecated
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is `undefined`, else `false`.
   * @example
   *
   * _.isUndefined(void 0);
   * // => true
   */
  function isUndefined(value) {
    return value === undefined;
  }

  /**
   * Creates an array composed of the own enumerable property names of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (order is not guaranteed)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    // avoid iterating over the `prototype` property
    return typeof object == 'function' && propertyIsEnumerable.call(object, 'prototype')
      ? shimKeys(object)
      : (isObject(object) ? nativeKeys(object) : []);
  };

  /**
   * Merges enumerable properties of the source object(s) into the `destination`
   * object. Subsequent sources will overwrite propery assignments of previous
   * sources.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The destination object.
   * @param {Object} [source1, source2, ...] The source objects.
   * @param- {Object} [indicator] Internally used to indicate that the `stack`
   *  argument is an array of traversed objects instead of another source object.
   * @param- {Array} [stackA=[]] Internally used to track traversed source objects.
   * @param- {Array} [stackB=[]] Internally used to associate values with their
   *  source counterparts.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe' },
   *   { 'name': 'larry' }
   * ];
   *
   * var ages = [
   *   { 'age': 40 },
   *   { 'age': 50 }
   * ];
   *
   * _.merge(stooges, ages);
   * // => [{ 'name': 'moe', 'age': 40 }, { 'name': 'larry', 'age': 50 }]
   */
  function merge(object, source, indicator) {
    var args = arguments,
        index = 0,
        length = 2,
        stackA = args[3],
        stackB = args[4];

    if (indicator !== indicatorObject) {
      stackA = [];
      stackB = [];

      // work with `_.reduce` by only using its callback `accumulator` and `value` arguments
      if (typeof indicator != 'number') {
        length = args.length;
      }
    }
    while (++index < length) {
      forOwn(args[index], function(source, key) {
        var found, isArr, value;
        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            found = stackA[stackLength] == source;
            if (found) {
              break;
            }
          }
          if (found) {
            object[key] = stackB[stackLength];
          }
          else {
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value = (value = object[key], isArr)
              ? (isArray(value) ? value : [])
              : (isPlainObject(value) ? value : {})
            );
            // recursively merge objects and arrays (susceptible to call stack limits)
            object[key] = merge(value, source, indicatorObject, stackA, stackB);
          }
        } else if (source != null) {
          object[key] = source;
        }
      });
    }
    return object;
  }

  /**
   * Creates a shallow clone of `object` excluding the specified properties.
   * Property names may be specified as individual arguments or as arrays of
   * property names. If `callback` is passed, it will be executed for each property
   * in the `object`, omitting the properties `callback` returns truthy for. The
   * `callback` is bound to `thisArg` and invoked with three arguments; (value, key, object).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The source object.
   * @param {Function|String} callback|[prop1, prop2, ...] The properties to omit
   *  or the function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns an object without the omitted properties.
   * @example
   *
   * _.omit({ 'name': 'moe', 'age': 40, 'userid': 'moe1' }, 'userid');
   * // => { 'name': 'moe', 'age': 40 }
   *
   * _.omit({ 'name': 'moe', '_hint': 'knucklehead', '_seed': '96c4eb' }, function(value, key) {
   *   return key.charAt(0) == '_';
   * });
   * // => { 'name': 'moe' }
   */
  function omit(object, callback, thisArg) {
    var isFunc = typeof callback == 'function',
        result = {};

    if (isFunc) {
      callback = createCallback(callback, thisArg);
    } else {
      var props = concat.apply(arrayRef, arguments);
    }
    forIn(object, function(value, key, object) {
      if (isFunc
            ? !callback(value, key, object)
            : indexOf(props, key, 1) < 0
          ) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Creates a two dimensional array of the given object's key-value pairs,
   * i.e. `[[key1, value1], [key2, value2]]`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns new array of key-value pairs.
   * @example
   *
   * _.pairs({ 'moe': 30, 'larry': 40, 'curly': 50 });
   * // => [['moe', 30], ['larry', 40], ['curly', 50]] (order is not guaranteed)
   */
  function pairs(object) {
    var result = [];
    forOwn(object, function(value, key) {
      result.push([key, value]);
    });
    return result;
  }

  /**
   * Creates a shallow clone of `object` composed of the specified properties.
   * Property names may be specified as individual arguments or as arrays of
   * property names. If `callback` is passed, it will be executed for each property
   * in the `object`, picking the properties `callback` returns truthy for. The
   * `callback` is bound to `thisArg` and invoked with three arguments; (value, key, object).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The source object.
   * @param {Function|String} callback|[prop1, prop2, ...] The properties to pick
   *  or the function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns an object composed of the picked properties.
   * @example
   *
   * _.pick({ 'name': 'moe', 'age': 40, 'userid': 'moe1' }, 'name', 'age');
   * // => { 'name': 'moe', 'age': 40 }
   *
   * _.pick({ 'name': 'moe', '_hint': 'knucklehead', '_seed': '96c4eb' }, function(value, key) {
   *   return key.charAt(0) != '_';
   * });
   * // => { 'name': 'moe' }
   */
  function pick(object, callback, thisArg) {
    var result = {};
    if (typeof callback != 'function') {
      var index = 0,
          props = concat.apply(arrayRef, arguments),
          length = props.length;

      while (++index < length) {
        var key = props[index];
        if (key in object) {
          result[key] = object[key];
        }
      }
    } else {
      callback = createCallback(callback, thisArg);
      forIn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result[key] = value;
        }
      });
    }
    return result;
  }

  /**
   * Creates an array composed of the own enumerable property values of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property values.
   * @example
   *
   * _.values({ 'one': 1, 'two': 2, 'three': 3 });
   * // => [1, 2, 3]
   */
  function values(object) {
    var result = [];
    forOwn(object, function(value) {
      result.push(value);
    });
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Checks if a given `target` element is present in a `collection` using strict
   * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
   * as the offset from the end of the collection.
   *
   * @static
   * @memberOf _
   * @alias include
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Mixed} target The value to check for.
   * @param {Number} [fromIndex=0] The index to search from.
   * @returns {Boolean} Returns `true` if the `target` element is found, else `false`.
   * @example
   *
   * _.contains([1, 2, 3], 1);
   * // => true
   *
   * _.contains([1, 2, 3], 1, 2);
   * // => false
   *
   * _.contains({ 'name': 'moe', 'age': 40 }, 'moe');
   * // => true
   *
   * _.contains('curly', 'ur');
   * // => true
   */
  function contains(collection, target, fromIndex) {
    var index = -1,
        length = collection ? collection.length : 0,
        result = false;

    fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
    if (typeof length == 'number') {
      result = (isString(collection)
        ? collection.indexOf(target, fromIndex)
        : indexOf(collection, target, fromIndex)
      ) > -1;
    } else {
      forEach(collection, function(value) {
        if (++index >= fromIndex) {
          return !(result = value === target);
        }
      });
    }
    return result;
  }

  /**
   * Creates an object composed of keys returned from running each element of
   * `collection` through a `callback`. The corresponding value of each key is
   * the number of times the key was returned by `callback`. The `callback` is
   * bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
   * The `callback` argument may also be the name of a property to count by (e.g. 'length').
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function|String} callback|property The function called per iteration
   *  or property name to count by.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the composed aggregate object.
   * @example
   *
   * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
   * // => { '4': 1, '6': 2 }
   *
   * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
   * // => { '4': 1, '6': 2 }
   *
   * _.countBy(['one', 'two', 'three'], 'length');
   * // => { '3': 2, '5': 1 }
   */
  function countBy(collection, callback, thisArg) {
    var result = {};
    callback = createCallback(callback, thisArg);
    forEach(collection, function(value, key, collection) {
      key = callback(value, key, collection);
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });
    return result;
  }

  /**
   * Checks if the `callback` returns a truthy value for **all** elements of a
   * `collection`. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias all
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Boolean} Returns `true` if all elements pass the callback check,
   *  else `false`.
   * @example
   *
   * _.every([true, 1, null, 'yes'], Boolean);
   * // => false
   */
  function every(collection, callback, thisArg) {
    var result = true;
    callback = createCallback(callback, thisArg);

    if (isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        if (!(result = !!callback(collection[index], index, collection))) {
          break;
        }
      }
    } else {
      forEach(collection, function(value, index, collection) {
        return (result = !!callback(value, index, collection));
      });
    }
    return result;
  }

  /**
   * Examines each element in a `collection`, returning an array of all elements
   * the `callback` returns truthy for. The `callback` is bound to `thisArg` and
   * invoked with three arguments; (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias select
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of elements that passed the callback check.
   * @example
   *
   * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
   * // => [2, 4, 6]
   */
  function filter(collection, callback, thisArg) {
    var result = [];
    callback = createCallback(callback, thisArg);

    if (isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        var value = collection[index];
        if (callback(value, index, collection)) {
          result.push(value);
        }
      }
    } else {
      forEach(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result.push(value);
        }
      });
    }
    return result;
  }

  /**
   * Examines each element in a `collection`, returning the first one the `callback`
   * returns truthy for. The function returns as soon as it finds an acceptable
   * element, and does not iterate over the entire `collection`. The `callback` is
   * bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias detect
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the element that passed the callback check,
   *  else `undefined`.
   * @example
   *
   * var even = _.find([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
   * // => 2
   */
  function find(collection, callback, thisArg) {
    var result;
    callback = createCallback(callback, thisArg);
    forEach(collection, function(value, index, collection) {
      if (callback(value, index, collection)) {
        result = value;
        return false;
      }
    });
    return result;
  }

  /**
   * Iterates over a `collection`, executing the `callback` for each element in
   * the `collection`. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, index|key, collection). Callbacks may exit iteration early
   * by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|String} Returns `collection`.
   * @example
   *
   * _([1, 2, 3]).forEach(alert).join(',');
   * // => alerts each number and returns '1,2,3'
   *
   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, alert);
   * // => alerts each number (order is not guaranteed)
   */
  var forEach = createIterator(forEachIteratorOptions);

  /**
   * Creates an object composed of keys returned from running each element of
   * `collection` through a `callback`. The corresponding value of each key is an
   * array of elements passed to `callback` that returned the key. The `callback`
   * is bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
   * The `callback` argument may also be the name of a property to group by (e.g. 'length').
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function|String} callback|property The function called per iteration
   *  or property name to group by.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the composed aggregate object.
   * @example
   *
   * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
   * // => { '4': [4.2], '6': [6.1, 6.4] }
   *
   * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
   * // => { '4': [4.2], '6': [6.1, 6.4] }
   *
   * _.groupBy(['one', 'two', 'three'], 'length');
   * // => { '3': ['one', 'two'], '5': ['three'] }
   */
  function groupBy(collection, callback, thisArg) {
    var result = {};
    callback = createCallback(callback, thisArg);
    forEach(collection, function(value, key, collection) {
      key = callback(value, key, collection);
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });
    return result;
  }

  /**
   * Invokes the method named by `methodName` on each element in the `collection`,
   * returning an array of the results of each invoked method. Additional arguments
   * will be passed to each invoked method. If `methodName` is a function it will
   * be invoked for, and `this` bound to, each element in the `collection`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function|String} methodName The name of the method to invoke or
   *  the function invoked per iteration.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
   * @returns {Array} Returns a new array of the results of each invoked method.
   * @example
   *
   * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
   * // => [[1, 5, 7], [1, 2, 3]]
   *
   * _.invoke([123, 456], String.prototype.split, '');
   * // => [['1', '2', '3'], ['4', '5', '6']]
   */
  function invoke(collection, methodName) {
    var args = slice.call(arguments, 2),
        isFunc = typeof methodName == 'function',
        result = [];

    forEach(collection, function(value) {
      result.push((isFunc ? methodName : value[methodName]).apply(value, args));
    });
    return result;
  }

  /**
   * Creates an array of values by running each element in the `collection`
   * through a `callback`. The `callback` is bound to `thisArg` and invoked with
   * three arguments; (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias collect
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of the results of each `callback` execution.
   * @example
   *
   * _.map([1, 2, 3], function(num) { return num * 3; });
   * // => [3, 6, 9]
   *
   * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
   * // => [3, 6, 9] (order is not guaranteed)
   */
  function map(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0,
        result = Array(typeof length == 'number' ? length : 0);

    callback = createCallback(callback, thisArg);
    if (isArray(collection)) {
      while (++index < length) {
        result[index] = callback(collection[index], index, collection);
      }
    } else {
      forEach(collection, function(value, key, collection) {
        result[++index] = callback(value, key, collection);
      });
    }
    return result;
  }

  /**
   * Retrieves the maximum value of an `array`. If `callback` is passed,
   * it will be executed for each value in the `array` to generate the
   * criterion by which the value is ranked. The `callback` is bound to
   * `thisArg` and invoked with three arguments; (value, index, collection).
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the maximum value.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 },
   *   { 'name': 'curly', 'age': 60 }
   * ];
   *
   * _.max(stooges, function(stooge) { return stooge.age; });
   * // => { 'name': 'curly', 'age': 60 };
   */
  function max(collection, callback, thisArg) {
    var computed = -Infinity,
        index = -1,
        length = collection ? collection.length : 0,
        result = computed;

    if (callback || !isArray(collection)) {
      callback = !callback && isString(collection)
        ? charAtCallback
        : createCallback(callback, thisArg);

      forEach(collection, function(value, index, collection) {
        var current = callback(value, index, collection);
        if (current > computed) {
          computed = current;
          result = value;
        }
      });
    } else {
      while (++index < length) {
        if (collection[index] > result) {
          result = collection[index];
        }
      }
    }
    return result;
  }

  /**
   * Retrieves the minimum value of an `array`. If `callback` is passed,
   * it will be executed for each value in the `array` to generate the
   * criterion by which the value is ranked. The `callback` is bound to `thisArg`
   * and invoked with three arguments; (value, index, collection).
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the minimum value.
   * @example
   *
   * _.min([10, 5, 100, 2, 1000]);
   * // => 2
   */
  function min(collection, callback, thisArg) {
    var computed = Infinity,
        index = -1,
        length = collection ? collection.length : 0,
        result = computed;

    if (callback || !isArray(collection)) {
      callback = !callback && isString(collection)
        ? charAtCallback
        : createCallback(callback, thisArg);

      forEach(collection, function(value, index, collection) {
        var current = callback(value, index, collection);
        if (current < computed) {
          computed = current;
          result = value;
        }
      });
    } else {
      while (++index < length) {
        if (collection[index] < result) {
          result = collection[index];
        }
      }
    }
    return result;
  }

  /**
   * Retrieves the value of a specified property from all elements in
   * the `collection`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {String} property The property to pluck.
   * @returns {Array} Returns a new array of property values.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 },
   *   { 'name': 'curly', 'age': 60 }
   * ];
   *
   * _.pluck(stooges, 'name');
   * // => ['moe', 'larry', 'curly']
   */
  function pluck(collection, property) {
    var result = [];
    forEach(collection, function(value) {
      result.push(value[property]);
    });
    return result;
  }

  /**
   * Boils down a `collection` to a single value. The initial state of the
   * reduction is `accumulator` and each successive step of it should be returned
   * by the `callback`. The `callback` is bound to `thisArg` and invoked with 4
   * arguments; for arrays they are (accumulator, value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias foldl, inject
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [accumulator] Initial value of the accumulator.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the accumulated value.
   * @example
   *
   * var sum = _.reduce([1, 2, 3], function(memo, num) { return memo + num; });
   * // => 6
   */
  function reduce(collection, callback, accumulator, thisArg) {
    var noaccum = arguments.length < 3;
    callback = createCallback(callback, thisArg);
    forEach(collection, function(value, index, collection) {
      accumulator = noaccum
        ? (noaccum = false, value)
        : callback(accumulator, value, index, collection)
    });
    return accumulator;
  }

  /**
   * The right-associative version of `_.reduce`.
   *
   * @static
   * @memberOf _
   * @alias foldr
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [accumulator] Initial value of the accumulator.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the accumulated value.
   * @example
   *
   * var list = [[0, 1], [2, 3], [4, 5]];
   * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
   * // => [4, 5, 2, 3, 0, 1]
   */
  function reduceRight(collection, callback, accumulator, thisArg) {
    var iteratee = collection,
        length = collection ? collection.length : 0,
        noaccum = arguments.length < 3;

    if (typeof length != 'number') {
      var props = keys(collection);
      length = props.length;
    } else if (noCharByIndex && isString(collection)) {
      iteratee = collection.split('');
    }
    forEach(collection, function(value, index, collection) {
      index = props ? props[--length] : --length;
      accumulator = noaccum
        ? (noaccum = false, iteratee[index])
        : callback.call(thisArg, accumulator, iteratee[index], index, collection);
    });
    return accumulator;
  }

  /**
   * The opposite of `_.filter`, this method returns the values of a
   * `collection` that `callback` does **not** return truthy for.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of elements that did **not** pass the
   *  callback check.
   * @example
   *
   * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
   * // => [1, 3, 5]
   */
  function reject(collection, callback, thisArg) {
    callback = createCallback(callback, thisArg);
    return filter(collection, function(value, index, collection) {
      return !callback(value, index, collection);
    });
  }

  /**
   * Creates an array of shuffled `array` values, using a version of the
   * Fisher-Yates shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to shuffle.
   * @returns {Array} Returns a new shuffled collection.
   * @example
   *
   * _.shuffle([1, 2, 3, 4, 5, 6]);
   * // => [4, 1, 6, 3, 5, 2]
   */
  function shuffle(collection) {
    var index = -1,
        result = Array(collection ? collection.length : 0);

    forEach(collection, function(value) {
      var rand = floor(nativeRandom() * (++index + 1));
      result[index] = result[rand];
      result[rand] = value;
    });
    return result;
  }

  /**
   * Gets the size of the `collection` by returning `collection.length` for arrays
   * and array-like objects or the number of own enumerable properties for objects.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to inspect.
   * @returns {Number} Returns `collection.length` or number of own enumerable properties.
   * @example
   *
   * _.size([1, 2]);
   * // => 2
   *
   * _.size({ 'one': 1, 'two': 2, 'three': 3 });
   * // => 3
   *
   * _.size('curly');
   * // => 5
   */
  function size(collection) {
    var length = collection ? collection.length : 0;
    return typeof length == 'number' ? length : keys(collection).length;
  }

  /**
   * Checks if the `callback` returns a truthy value for **any** element of a
   * `collection`. The function returns as soon as it finds passing value, and
   * does not iterate over the entire `collection`. The `callback` is bound to
   * `thisArg` and invoked with three arguments; (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @alias any
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Boolean} Returns `true` if any element passes the callback check,
   *  else `false`.
   * @example
   *
   * _.some([null, 0, 'yes', false], Boolean);
   * // => true
   */
  function some(collection, callback, thisArg) {
    var result;
    callback = createCallback(callback, thisArg);

    if (isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        if ((result = callback(collection[index], index, collection))) {
          break;
        }
      }
    } else {
      forEach(collection, function(value, index, collection) {
        return !(result = callback(value, index, collection));
      });
    }
    return !!result;
  }

  /**
   * Creates an array, stable sorted in ascending order by the results of
   * running each element of `collection` through a `callback`. The `callback`
   * is bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
   * The `callback` argument may also be the name of a property to sort by (e.g. 'length').
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function|String} callback|property The function called per iteration
   *  or property name to sort by.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of sorted elements.
   * @example
   *
   * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
   * // => [3, 1, 2]
   *
   * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
   * // => [3, 1, 2]
   *
   * _.sortBy(['larry', 'brendan', 'moe'], 'length');
   * // => ['moe', 'larry', 'brendan']
   */
  function sortBy(collection, callback, thisArg) {
    var result = [];
    callback = createCallback(callback, thisArg);
    forEach(collection, function(value, index, collection) {
      result.push({
        'criteria': callback(value, index, collection),
        'index': index,
        'value': value
      });
    });

    var length = result.length;
    result.sort(compareAscending);
    while (length--) {
      result[length] = result[length].value;
    }
    return result;
  }

  /**
   * Converts the `collection`, to an array.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to convert.
   * @returns {Array} Returns the new converted array.
   * @example
   *
   * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
   * // => [2, 3, 4]
   */
  function toArray(collection) {
    if (collection && typeof collection.length == 'number') {
      return (noArraySliceOnStrings ? isString(collection) : typeof collection == 'string')
        ? collection.split('')
        : slice.call(collection);
    }
    return values(collection);
  }

  /**
   * Examines each element in a `collection`, returning an array of all elements
   * that contain the given `properties`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Object} properties The object of property values to filter by.
   * @returns {Array} Returns a new array of elements that contain the given `properties`.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 },
   *   { 'name': 'curly', 'age': 60 }
   * ];
   *
   * _.where(stooges, { 'age': 40 });
   * // => [{ 'name': 'moe', 'age': 40 }]
   */
  function where(collection, properties) {
    var props = keys(properties);
    return filter(collection, function(object) {
      var length = props.length;
      while (length--) {
        var result = object[props[length]] === properties[props[length]];
        if (!result) {
          break;
        }
      }
      return !!result;
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates an array with all falsey values of `array` removed. The values
   * `false`, `null`, `0`, `""`, `undefined` and `NaN` are all falsey.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to compact.
   * @returns {Array} Returns a new filtered array.
   * @example
   *
   * _.compact([0, 1, false, 2, '', 3]);
   * // => [1, 2, 3]
   */
  function compact(array) {
    var index = -1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Creates an array of `array` elements not present in the other arrays
   * using strict equality for comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to process.
   * @param {Array} [array1, array2, ...] Arrays to check.
   * @returns {Array} Returns a new array of `array` elements not present in the
   *  other arrays.
   * @example
   *
   * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
   * // => [1, 3, 4]
   */
  function difference(array) {
    var index = -1,
        length = array ? array.length : 0,
        flattened = concat.apply(arrayRef, arguments),
        contains = cachedContains(flattened, length),
        result = [];

    while (++index < length) {
      var value = array[index];
      if (!contains(value)) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Gets the first element of the `array`. Pass `n` to return the first `n`
   * elements of the `array`.
   *
   * @static
   * @memberOf _
   * @alias head, take
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Number} [n] The number of elements to return.
   * @param- {Object} [guard] Internally used to allow this method to work with
   *  others like `_.map` without using their callback `index` argument for `n`.
   * @returns {Mixed} Returns the first element or an array of the first `n`
   *  elements of `array`.
   * @example
   *
   * _.first([5, 4, 3, 2, 1]);
   * // => 5
   */
  function first(array, n, guard) {
    if (array) {
      return (n == null || guard) ? array[0] : slice.call(array, 0, n);
    }
  }

  /**
   * Flattens a nested array (the nesting can be to any depth). If `shallow` is
   * truthy, `array` will only be flattened a single level.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to compact.
   * @param {Boolean} shallow A flag to indicate only flattening a single level.
   * @returns {Array} Returns a new flattened array.
   * @example
   *
   * _.flatten([1, [2], [3, [[4]]]]);
   * // => [1, 2, 3, 4];
   *
   * _.flatten([1, [2], [3, [[4]]]], true);
   * // => [1, 2, 3, [[4]]];
   */
  function flatten(array, shallow) {
    var index = -1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
      var value = array[index];

      // recursively flatten arrays (susceptible to call stack limits)
      if (isArray(value)) {
        push.apply(result, shallow ? value : flatten(value));
      } else {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Gets the index at which the first occurrence of `value` is found using
   * strict equality for comparisons, i.e. `===`. If the `array` is already
   * sorted, passing `true` for `fromIndex` will run a faster binary search.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @param {Boolean|Number} [fromIndex=0] The index to search from or `true` to
   *  perform a binary search on a sorted `array`.
   * @returns {Number} Returns the index of the matched value or `-1`.
   * @example
   *
   * _.indexOf([1, 2, 3, 1, 2, 3], 2);
   * // => 1
   *
   * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
   * // => 4
   *
   * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
   * // => 2
   */
  function indexOf(array, value, fromIndex) {
    var index = -1,
        length = array ? array.length : 0;

    if (typeof fromIndex == 'number') {
      index = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0) - 1;
    } else if (fromIndex) {
      index = sortedIndex(array, value);
      return array[index] === value ? index : -1;
    }
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Gets all but the last element of `array`. Pass `n` to exclude the last `n`
   * elements from the result.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Number} [n=1] The number of elements to exclude.
   * @param- {Object} [guard] Internally used to allow this method to work with
   *  others like `_.map` without using their callback `index` argument for `n`.
   * @returns {Array} Returns all but the last element or `n` elements of `array`.
   * @example
   *
   * _.initial([3, 2, 1]);
   * // => [3, 2]
   */
  function initial(array, n, guard) {
    return array
      ? slice.call(array, 0, -((n == null || guard) ? 1 : n))
      : [];
  }

  /**
   * Computes the intersection of all the passed-in arrays using strict equality
   * for comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} [array1, array2, ...] Arrays to process.
   * @returns {Array} Returns a new array of unique elements, in order, that are
   *  present in **all** of the arrays.
   * @example
   *
   * _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
   * // => [1, 2]
   */
  function intersection(array) {
    var args = arguments,
        argsLength = args.length,
        cache = {},
        result = [];

    forEach(array, function(value) {
      if (indexOf(result, value) < 0) {
        var length = argsLength;
        while (--length) {
          if (!(cache[length] || (cache[length] = cachedContains(args[length])))(value)) {
            return;
          }
        }
        result.push(value);
      }
    });
    return result;
  }

  /**
   * Gets the last element of the `array`. Pass `n` to return the last `n`
   * elements of the `array`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Number} [n] The number of elements to return.
   * @param- {Object} [guard] Internally used to allow this method to work with
   *  others like `_.map` without using their callback `index` argument for `n`.
   * @returns {Mixed} Returns the last element or an array of the last `n`
   *  elements of `array`.
   * @example
   *
   * _.last([3, 2, 1]);
   * // => 1
   */
  function last(array, n, guard) {
    if (array) {
      var length = array.length;
      return (n == null || guard) ? array[length - 1] : slice.call(array, -n || length);
    }
  }

  /**
   * Gets the index at which the last occurrence of `value` is found using strict
   * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
   * as the offset from the end of the collection.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=array.length-1] The index to search from.
   * @returns {Number} Returns the index of the matched value or `-1`.
   * @example
   *
   * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
   * // => 4
   *
   * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
   * // => 1
   */
  function lastIndexOf(array, value, fromIndex) {
    var index = array ? array.length : 0;
    if (typeof fromIndex == 'number') {
      index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
    }
    while (index--) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Creates an object composed from arrays of `keys` and `values`. Pass either
   * a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`, or
   * two arrays, one of `keys` and one of corresponding `values`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} keys The array of keys.
   * @param {Array} [values=[]] The array of values.
   * @returns {Object} Returns an object composed of the given keys and
   *  corresponding values.
   * @example
   *
   * _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
   * // => { 'moe': 30, 'larry': 40, 'curly': 50 }
   */
  function object(keys, values) {
    var index = -1,
        length = keys ? keys.length : 0,
        result = {};

    while (++index < length) {
      var key = keys[index];
      if (values) {
        result[key] = values[index];
      } else {
        result[key[0]] = key[1];
      }
    }
    return result;
  }

  /**
   * Creates an array of numbers (positive and/or negative) progressing from
   * `start` up to but not including `stop`. This method is a port of Python's
   * `range()` function. See http://docs.python.org/library/functions.html#range.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Number} [start=0] The start of the range.
   * @param {Number} end The end of the range.
   * @param {Number} [step=1] The value to increment or descrement by.
   * @returns {Array} Returns a new range array.
   * @example
   *
   * _.range(10);
   * // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   *
   * _.range(1, 11);
   * // => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
   *
   * _.range(0, 30, 5);
   * // => [0, 5, 10, 15, 20, 25]
   *
   * _.range(0, -10, -1);
   * // => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
   *
   * _.range(0);
   * // => []
   */
  function range(start, end, step) {
    start = +start || 0;
    step = +step || 1;

    if (end == null) {
      end = start;
      start = 0;
    }
    // use `Array(length)` so V8 will avoid the slower "dictionary" mode
    // http://www.youtube.com/watch?v=XAqIpGU8ZZk#t=16m27s
    var index = -1,
        length = nativeMax(0, ceil((end - start) / step)),
        result = Array(length);

    while (++index < length) {
      result[index] = start;
      start += step;
    }
    return result;
  }

  /**
   * The opposite of `_.initial`, this method gets all but the first value of
   * `array`. Pass `n` to exclude the first `n` values from the result.
   *
   * @static
   * @memberOf _
   * @alias drop, tail
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Number} [n=1] The number of elements to exclude.
   * @param- {Object} [guard] Internally used to allow this method to work with
   *  others like `_.map` without using their callback `index` argument for `n`.
   * @returns {Array} Returns all but the first value or `n` values of `array`.
   * @example
   *
   * _.rest([3, 2, 1]);
   * // => [2, 1]
   */
  function rest(array, n, guard) {
    return array
      ? slice.call(array, (n == null || guard) ? 1 : n)
      : [];
  }

  /**
   * Uses a binary search to determine the smallest index at which the `value`
   * should be inserted into `array` in order to maintain the sort order of the
   * sorted `array`. If `callback` is passed, it will be executed for `value` and
   * each element in `array` to compute their sort ranking. The `callback` is
   * bound to `thisArg` and invoked with one argument; (value). The `callback`
   * argument may also be the name of a property to order by.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to iterate over.
   * @param {Mixed} value The value to evaluate.
   * @param {Function|String} [callback=identity|property] The function called
   *  per iteration or property name to order by.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Number} Returns the index at which the value should be inserted
   *  into `array`.
   * @example
   *
   * _.sortedIndex([20, 30, 50], 40);
   * // => 2
   *
   * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
   * // => 2
   *
   * var dict = {
   *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
   * };
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return dict.wordToNumber[word];
   * });
   * // => 2
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return this.wordToNumber[word];
   * }, dict);
   * // => 2
   */
  function sortedIndex(array, value, callback, thisArg) {
    var low = 0,
        high = array ? array.length : low;

    // explicitly reference `identity` for better engine inlining
    callback = callback ? createCallback(callback, thisArg) : identity;
    value = callback(value);
    while (low < high) {
      var mid = (low + high) >>> 1;
      callback(array[mid]) < value
        ? low = mid + 1
        : high = mid;
    }
    return low;
  }

  /**
   * Computes the union of the passed-in arrays using strict equality for
   * comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} [array1, array2, ...] Arrays to process.
   * @returns {Array} Returns a new array of unique values, in order, that are
   *  present in one or more of the arrays.
   * @example
   *
   * _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
   * // => [1, 2, 3, 101, 10]
   */
  function union() {
    return uniq(concat.apply(arrayRef, arguments));
  }

  /**
   * Creates a duplicate-value-free version of the `array` using strict equality
   * for comparisons, i.e. `===`. If the `array` is already sorted, passing `true`
   * for `isSorted` will run a faster algorithm. If `callback` is passed, each
   * element of `array` is passed through a callback` before uniqueness is computed.
   * The `callback` is bound to `thisArg` and invoked with three arguments; (value, index, array).
   *
   * @static
   * @memberOf _
   * @alias unique
   * @category Arrays
   * @param {Array} array The array to process.
   * @param {Boolean} [isSorted=false] A flag to indicate that the `array` is already sorted.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a duplicate-value-free array.
   * @example
   *
   * _.uniq([1, 2, 1, 3, 1]);
   * // => [1, 2, 3]
   *
   * _.uniq([1, 1, 2, 2, 3], true);
   * // => [1, 2, 3]
   *
   * _.uniq([1, 2, 1.5, 3, 2.5], function(num) { return Math.floor(num); });
   * // => [1, 2, 3]
   *
   * _.uniq([1, 2, 1.5, 3, 2.5], function(num) { return this.floor(num); }, Math);
   * // => [1, 2, 3]
   */
  function uniq(array, isSorted, callback, thisArg) {
    var index = -1,
        length = array ? array.length : 0,
        result = [],
        seen = result;

    // juggle arguments
    if (typeof isSorted == 'function') {
      thisArg = callback;
      callback = isSorted;
      isSorted = false;
    }
    // init value cache for large arrays
    var isLarge = !isSorted && length > 74;
    if (isLarge) {
      var cache = {};
    }
    if (callback) {
      seen = [];
      callback = createCallback(callback, thisArg);
    }
    while (++index < length) {
      var value = array[index],
          computed = callback ? callback(value, index, array) : value;

      if (isLarge) {
        // manually coerce `computed` to a string because `hasOwnProperty`, in
        // some older versions of Firefox, coerces objects incorrectly
        seen = hasOwnProperty.call(cache, computed + '') ? cache[computed] : (cache[computed] = []);
      }
      if (isSorted
            ? !index || seen[seen.length - 1] !== computed
            : indexOf(seen, computed) < 0
          ) {
        if (callback || isLarge) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Creates an array with all occurrences of the passed values removed using
   * strict equality for comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to filter.
   * @param {Mixed} [value1, value2, ...] Values to remove.
   * @returns {Array} Returns a new filtered array.
   * @example
   *
   * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
   * // => [2, 3, 4]
   */
  function without(array) {
    var index = -1,
        length = array ? array.length : 0,
        contains = cachedContains(arguments, 1, 20),
        result = [];

    while (++index < length) {
      var value = array[index];
      if (!contains(value)) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Groups the elements of each array at their corresponding indexes. Useful for
   * separate data sources that are coordinated through matching array indexes.
   * For a matrix of nested arrays, `_.zip.apply(...)` can transpose the matrix
   * in a similar fashion.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} [array1, array2, ...] Arrays to process.
   * @returns {Array} Returns a new array of grouped elements.
   * @example
   *
   * _.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]);
   * // => [['moe', 30, true], ['larry', 40, false], ['curly', 50, false]]
   */
  function zip(array) {
    var index = -1,
        length = array ? max(pluck(arguments, 'length')) : 0,
        result = Array(length);

    while (++index < length) {
      result[index] = pluck(arguments, index);
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that is restricted to executing `func` only after it is
   * called `n` times. The `func` is executed with the `this` binding of the
   * created function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Number} n The number of times the function must be called before
   * it is executed.
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var renderNotes = _.after(notes.length, render);
   * _.forEach(notes, function(note) {
   *   note.asyncSave({ 'success': renderNotes });
   * });
   * // `renderNotes` is run once, after all notes have saved
   */
  function after(n, func) {
    if (n < 1) {
      return func();
    }
    return function() {
      if (--n < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * passed to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'moe' }, 'hi');
   * func();
   * // => 'hi moe'
   */
  function bind(func, thisArg) {
    // use `Function#bind` if it exists and is fast
    // (in V8 `Function#bind` is slower except when partially applied)
    return isBindFast || (nativeBind && arguments.length > 2)
      ? nativeBind.call.apply(nativeBind, arguments)
      : createBound(func, thisArg, slice.call(arguments, 2));
  }

  /**
   * Binds methods on `object` to `object`, overwriting the existing method.
   * If no method names are provided, all the function properties of `object`
   * will be bound.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Object} object The object to bind and assign the bound methods to.
   * @param {String} [methodName1, methodName2, ...] Method names on the object to bind.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var buttonView = {
   *  'label': 'lodash',
   *  'onClick': function() { alert('clicked: ' + this.label); }
   * };
   *
   * _.bindAll(buttonView);
   * jQuery('#lodash_button').on('click', buttonView.onClick);
   * // => When the button is clicked, `this.label` will have the correct value
   */
  function bindAll(object) {
    var funcs = arguments,
        index = funcs.length > 1 ? 0 : (funcs = functions(object), -1),
        length = funcs.length;

    while (++index < length) {
      var key = funcs[index];
      object[key] = bind(object[key], object);
    }
    return object;
  }

  /**
   * Creates a function that, when called, invokes the method at `object[key]`
   * and prepends any additional `bindKey` arguments to those passed to the bound
   * function. This method differs from `_.bind` by allowing bound functions to
   * reference methods that will be redefined or don't yet exist.
   * See http://michaux.ca/articles/lazy-function-definition-pattern.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Object} object The object the method belongs to.
   * @param {String} key The key of the method.
   * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var object = {
   *   'name': 'moe',
   *   'greet': function(greeting) {
   *     return greeting + ' ' + this.name;
   *   }
   * };
   *
   * var func = _.bindKey(object, 'greet', 'hi');
   * func();
   * // => 'hi moe'
   *
   * object.greet = function(greeting) {
   *   return greeting + ', ' + this.name + '!';
   * };
   *
   * func();
   * // => 'hi, moe!'
   */
  function bindKey(object, key) {
    return createBound(object, key, slice.call(arguments, 2));
  }

  /**
   * Creates a function that is the composition of the passed functions,
   * where each function consumes the return value of the function that follows.
   * In math terms, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
   * Each function is executed with the `this` binding of the composed function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} [func1, func2, ...] Functions to compose.
   * @returns {Function} Returns the new composed function.
   * @example
   *
   * var greet = function(name) { return 'hi: ' + name; };
   * var exclaim = function(statement) { return statement + '!'; };
   * var welcome = _.compose(exclaim, greet);
   * welcome('moe');
   * // => 'hi: moe!'
   */
  function compose() {
    var funcs = arguments;
    return function() {
      var args = arguments,
          length = funcs.length;

      while (length--) {
        args = [funcs[length].apply(this, args)];
      }
      return args[0];
    };
  }

  /**
   * Creates a function that will delay the execution of `func` until after
   * `wait` milliseconds have elapsed since the last time it was invoked. Pass
   * `true` for `immediate` to cause debounce to invoke `func` on the leading,
   * instead of the trailing, edge of the `wait` timeout. Subsequent calls to
   * the debounced function will return the result of the last `func` call.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to debounce.
   * @param {Number} wait The number of milliseconds to delay.
   * @param {Boolean} immediate A flag to indicate execution is on the leading
   *  edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * var lazyLayout = _.debounce(calculateLayout, 300);
   * jQuery(window).on('resize', lazyLayout);
   */
  function debounce(func, wait, immediate) {
    var args,
        result,
        thisArg,
        timeoutId;

    function delayed() {
      timeoutId = null;
      if (!immediate) {
        result = func.apply(thisArg, args);
      }
    }
    return function() {
      var isImmediate = immediate && !timeoutId;
      args = arguments;
      thisArg = this;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(delayed, wait);

      if (isImmediate) {
        result = func.apply(thisArg, args);
      }
      return result;
    };
  }

  /**
   * Executes the `func` function after `wait` milliseconds. Additional arguments
   * will be passed to `func` when it is invoked.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to delay.
   * @param {Number} wait The number of milliseconds to delay execution.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the function with.
   * @returns {Number} Returns the `setTimeout` timeout id.
   * @example
   *
   * var log = _.bind(console.log, console);
   * _.delay(log, 1000, 'logged later');
   * // => 'logged later' (Appears after one second.)
   */
  function delay(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function() { func.apply(undefined, args); }, wait);
  }

  /**
   * Defers executing the `func` function until the current call stack has cleared.
   * Additional arguments will be passed to `func` when it is invoked.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to defer.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the function with.
   * @returns {Number} Returns the `setTimeout` timeout id.
   * @example
   *
   * _.defer(function() { alert('deferred'); });
   * // returns from the function before `alert` is called
   */
  function defer(func) {
    var args = slice.call(arguments, 1);
    return setTimeout(function() { func.apply(undefined, args); }, 1);
  }

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * passed, it will be used to determine the cache key for storing the result
   * based on the arguments passed to the memoized function. By default, the first
   * argument passed to the memoized function is used as the cache key. The `func`
   * is executed with the `this` binding of the memoized function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] A function used to resolve the cache key.
   * @returns {Function} Returns the new memoizing function.
   * @example
   *
   * var fibonacci = _.memoize(function(n) {
   *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
   * });
   */
  function memoize(func, resolver) {
    var cache = {};
    return function() {
      var key = resolver ? resolver.apply(this, arguments) : arguments[0];
      return hasOwnProperty.call(cache, key)
        ? cache[key]
        : (cache[key] = func.apply(this, arguments));
    };
  }

  /**
   * Creates a function that is restricted to execute `func` once. Repeat calls to
   * the function will return the value of the first call. The `func` is executed
   * with the `this` binding of the created function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var initialize = _.once(createApplication);
   * initialize();
   * initialize();
   * // Application is only created once.
   */
  function once(func) {
    var result,
        ran = false;

    return function() {
      if (ran) {
        return result;
      }
      ran = true;
      result = func.apply(this, arguments);

      // clear the `func` variable so the function may be garbage collected
      func = null;
      return result;
    };
  }

  /**
   * Creates a function that, when called, invokes `func` with any additional
   * `partial` arguments prepended to those passed to the new function. This
   * method is similar to `bind`, except it does **not** alter the `this` binding.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to partially apply arguments to.
   * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
   * @returns {Function} Returns the new partially applied function.
   * @example
   *
   * var greet = function(greeting, name) { return greeting + ': ' + name; };
   * var hi = _.partial(greet, 'hi');
   * hi('moe');
   * // => 'hi: moe'
   */
  function partial(func) {
    return createBound(func, slice.call(arguments, 1));
  }

  /**
   * Creates a function that, when executed, will only call the `func`
   * function at most once per every `wait` milliseconds. If the throttled
   * function is invoked more than once during the `wait` timeout, `func` will
   * also be called on the trailing edge of the timeout. Subsequent calls to the
   * throttled function will return the result of the last `func` call.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to throttle.
   * @param {Number} wait The number of milliseconds to throttle executions to.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * var throttled = _.throttle(updatePosition, 100);
   * jQuery(window).on('scroll', throttled);
   */
  function throttle(func, wait) {
    var args,
        result,
        thisArg,
        timeoutId,
        lastCalled = 0;

    function trailingCall() {
      lastCalled = new Date;
      timeoutId = null;
      result = func.apply(thisArg, args);
    }
    return function() {
      var now = new Date,
          remaining = wait - (now - lastCalled);

      args = arguments;
      thisArg = this;

      if (remaining <= 0) {
        clearTimeout(timeoutId);
        lastCalled = now;
        result = func.apply(thisArg, args);
      }
      else if (!timeoutId) {
        timeoutId = setTimeout(trailingCall, remaining);
      }
      return result;
    };
  }

  /**
   * Creates a function that passes `value` to the `wrapper` function as its
   * first argument. Additional arguments passed to the function are appended
   * to those passed to the `wrapper` function. The `wrapper` is executed with
   * the `this` binding of the created function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Mixed} value The value to wrap.
   * @param {Function} wrapper The wrapper function.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var hello = function(name) { return 'hello ' + name; };
   * hello = _.wrap(hello, function(func) {
   *   return 'before, ' + func('moe') + ', after';
   * });
   * hello();
   * // => 'before, hello moe, after'
   */
  function wrap(value, wrapper) {
    return function() {
      var args = [value];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
   * corresponding HTML entities.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {String} string The string to escape.
   * @returns {String} Returns the escaped string.
   * @example
   *
   * _.escape('Moe, Larry & Curly');
   * // => "Moe, Larry &amp; Curly"
   */
  function escape(string) {
    return string == null ? '' : (string + '').replace(reUnescapedHtml, escapeHtmlChar);
  }

  /**
   * This function returns the first argument passed to it.
   *
   * Note: It is used throughout Lo-Dash as a default callback.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Mixed} value Any value.
   * @returns {Mixed} Returns `value`.
   * @example
   *
   * var moe = { 'name': 'moe' };
   * moe === _.identity(moe);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * Adds functions properties of `object` to the `lodash` function and chainable
   * wrapper.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} object The object of function properties to add to `lodash`.
   * @example
   *
   * _.mixin({
   *   'capitalize': function(string) {
   *     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
   *   }
   * });
   *
   * _.capitalize('larry');
   * // => 'Larry'
   *
   * _('curly').capitalize();
   * // => 'Curly'
   */
  function mixin(object) {
    forEach(functions(object), function(methodName) {
      var func = lodash[methodName] = object[methodName];

      lodash.prototype[methodName] = function() {
        var args = [this.__wrapped__];
        push.apply(args, arguments);

        var result = func.apply(lodash, args);
        if (this.__chain__) {
          result = new lodash(result);
          result.__chain__ = true;
        }
        return result;
      };
    });
  }

  /**
   * Reverts the '_' variable to its previous value and returns a reference to
   * the `lodash` function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @returns {Function} Returns the `lodash` function.
   * @example
   *
   * var lodash = _.noConflict();
   */
  function noConflict() {
    window._ = oldDash;
    return this;
  }

  /**
   * Produces a random number between `min` and `max` (inclusive). If only one
   * argument is passed, a number between `0` and the given number will be returned.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Number} [min=0] The minimum possible value.
   * @param {Number} [max=1] The maximum possible value.
   * @returns {Number} Returns a random number.
   * @example
   *
   * _.random(0, 5);
   * // => a number between 1 and 5
   *
   * _.random(5);
   * // => also a number between 1 and 5
   */
  function random(min, max) {
    if (min == null && max == null) {
      max = 1;
    }
    min = +min || 0;
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + floor(nativeRandom() * ((+max || 0) - min + 1));
  }

  /**
   * Resolves the value of `property` on `object`. If `property` is a function
   * it will be invoked and its result returned, else the property value is
   * returned. If `object` is falsey, then `null` is returned.
   *
   * @deprecated
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} object The object to inspect.
   * @param {String} property The property to get the value of.
   * @returns {Mixed} Returns the resolved value.
   * @example
   *
   * var object = {
   *   'cheese': 'crumpets',
   *   'stuff': function() {
   *     return 'nonsense';
   *   }
   * };
   *
   * _.result(object, 'cheese');
   * // => 'crumpets'
   *
   * _.result(object, 'stuff');
   * // => 'nonsense'
   */
  function result(object, property) {
    // based on Backbone's private `getValue` function
    // https://github.com/documentcloud/backbone/blob/0.9.2/backbone.js#L1419-1424
    var value = object ? object[property] : null;
    return isFunction(value) ? object[property]() : value;
  }

  /**
   * A micro-templating method that handles arbitrary delimiters, preserves
   * whitespace, and correctly escapes quotes within interpolated code.
   *
   * Note: In the development build `_.template` utilizes sourceURLs for easier
   * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
   *
   * Note: Lo-Dash may be used in Chrome extensions by either creating a `lodash csp`
   * build and avoiding `_.template` use, or loading Lo-Dash in a sandboxed page.
   * See http://developer.chrome.com/trunk/extensions/sandboxingEval.html
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {String} text The template text.
   * @param {Obect} data The data object used to populate the text.
   * @param {Object} options The options object.
   *  escape - The "escape" delimiter regexp.
   *  evaluate - The "evaluate" delimiter regexp.
   *  interpolate - The "interpolate" delimiter regexp.
   *  sourceURL - The sourceURL of the template's compiled source.
   *  variable - The data object variable name.
   *
   * @returns {Function|String} Returns a compiled function when no `data` object
   *  is given, else it returns the interpolated text.
   * @example
   *
   * // using a compiled template
   * var compiled = _.template('hello <%= name %>');
   * compiled({ 'name': 'moe' });
   * // => 'hello moe'
   *
   * var list = '<% _.forEach(people, function(name) { %><li><%= name %></li><% }); %>';
   * _.template(list, { 'people': ['moe', 'larry', 'curly'] });
   * // => '<li>moe</li><li>larry</li><li>curly</li>'
   *
   * // using the "escape" delimiter to escape HTML in data property values
   * _.template('<b><%- value %></b>', { 'value': '<script>' });
   * // => '<b>&lt;script&gt;</b>'
   *
   * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
   * _.template('hello ${ name }', { 'name': 'curly' });
   * // => 'hello curly'
   *
   * // using the internal `print` function in "evaluate" delimiters
   * _.template('<% print("hello " + epithet); %>!', { 'epithet': 'stooge' });
   * // => 'hello stooge!'
   *
   * // using custom template delimiters
   * _.templateSettings = {
   *   'interpolate': /{{([\s\S]+?)}}/g
   * };
   *
   * _.template('hello {{ name }}!', { 'name': 'mustache' });
   * // => 'hello mustache!'
   *
   * // using the `sourceURL` option to specify a custom sourceURL for the template
   * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
   * compiled(data);
   * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
   *
   * // using the `variable` option to ensure a with-statement isn't used in the compiled template
   * var compiled = _.template('hello <%= data.name %>!', null, { 'variable': 'data' });
   * compiled.source;
   * // => function(data) {
   *   var __t, __p = '', __e = _.escape;
   *   __p += 'hello ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
   *   return __p;
   * }
   *
   * // using the `source` property to inline compiled templates for meaningful
   * // line numbers in error messages and a stack trace
   * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
   *   var JST = {\
   *     "main": ' + _.template(mainText).source + '\
   *   };\
   * ');
   */
  function template(text, data, options) {
    // based on John Resig's `tmpl` implementation
    // http://ejohn.org/blog/javascript-micro-templating/
    // and Laura Doktorova's doT.js
    // https://github.com/olado/doT
    text || (text = '');
    options || (options = {});

    var isEvaluating,
        result,
        settings = lodash.templateSettings,
        index = 0,
        interpolate = options.interpolate || settings.interpolate || reNoMatch,
        source = "__p += '",
        variable = options.variable || settings.variable,
        hasVariable = variable;

    // compile regexp to match each delimiter
    var reDelimiters = RegExp(
      (options.escape || settings.escape || reNoMatch).source + '|' +
      interpolate.source + '|' +
      (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
      (options.evaluate || settings.evaluate || reNoMatch).source + '|$'
    , 'g');

    text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);

      // escape characters that cannot be included in string literals
      source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

      // replace delimiters with snippets
      source +=
        escapeValue ? "' +\n__e(" + escapeValue + ") +\n'" :
        evaluateValue ? "';\n" + evaluateValue + ";\n__p += '" :
        interpolateValue ? "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'" : '';

      isEvaluating || (isEvaluating = evaluateValue || reComplexDelimiter.test(escapeValue || interpolateValue));
      index = offset + match.length;
    });

    source += "';\n";

    // if `variable` is not specified and the template contains "evaluate"
    // delimiters, wrap a with-statement around the generated code to add the
    // data object to the top of the scope chain
    if (!hasVariable) {
      variable = 'obj';
      if (isEvaluating) {
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      else {
        // avoid a with-statement by prepending data object references to property names
        var reDoubleVariable = RegExp('(\\(\\s*)' + variable + '\\.' + variable + '\\b', 'g');
        source = source
          .replace(reInsertVariable, '$&' + variable + '.')
          .replace(reDoubleVariable, '$1__d');
      }
    }

    // cleanup code by stripping empty strings
    source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
      .replace(reEmptyStringMiddle, '$1')
      .replace(reEmptyStringTrailing, '$1;');

    // frame code as the function body
    source = 'function(' + variable + ') {\n' +
      (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
      'var __t, __p = \'\', __e = _.escape' +
      (isEvaluating
        ? ', __j = Array.prototype.join;\n' +
          'function print() { __p += __j.call(arguments, \'\') }\n'
        : (hasVariable ? '' : ', __d = ' + variable + '.' + variable + ' || ' + variable) + ';\n'
      ) +
      source +
      'return __p\n}';

    // use a sourceURL for easier debugging
    // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
    var sourceURL = useSourceURL
      ? '\n//@ sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']')
      : '';

    try {
      result = Function('_', 'return ' + source + sourceURL)(lodash);
    } catch(e) {
      e.source = source;
      throw e;
    }

    if (data) {
      return result(data);
    }
    // provide the compiled function's source via its `toString` method, in
    // supported environments, or the `source` property as a convenience for
    // inlining compiled templates during the build process
    result.source = source;
    return result;
  }

  /**
   * Executes the `callback` function `n` times, returning an array of the results
   * of each `callback` execution. The `callback` is bound to `thisArg` and invoked
   * with one argument; (index).
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Number} n The number of times to execute the callback.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of the results of each `callback` execution.
   * @example
   *
   * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
   * // => [3, 6, 4]
   *
   * _.times(3, function(n) { mage.castSpell(n); });
   * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
   *
   * _.times(3, function(n) { this.cast(n); }, mage);
   * // => also calls `mage.castSpell(n)` three times
   */
  function times(n, callback, thisArg) {
    n = +n || 0;
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = callback.call(thisArg, index);
    }
    return result;
  }

  /**
   * The opposite of `_.escape`, this method converts the HTML entities
   * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#x27;` in `string` to their
   * corresponding characters.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {String} string The string to unescape.
   * @returns {String} Returns the unescaped string.
   * @example
   *
   * _.unescape('Moe, Larry &amp; Curly');
   * // => "Moe, Larry & Curly"
   */
  function unescape(string) {
    return string == null ? '' : (string + '').replace(reEscapedHtml, unescapeHtmlChar);
  }

  /**
   * Generates a unique id. If `prefix` is passed, the id will be appended to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {String} [prefix] The value to prefix the id with.
   * @returns {Number|String} Returns a numeric id if no prefix is passed, else
   *  a string id may be returned.
   * @example
   *
   * _.uniqueId('contact_');
   * // => 'contact_104'
   */
  function uniqueId(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Wraps the value in a `lodash` wrapper object.
   *
   * @static
   * @memberOf _
   * @category Chaining
   * @param {Mixed} value The value to wrap.
   * @returns {Object} Returns the wrapper object.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 },
   *   { 'name': 'curly', 'age': 60 }
   * ];
   *
   * var youngest = _.chain(stooges)
   *     .sortBy(function(stooge) { return stooge.age; })
   *     .map(function(stooge) { return stooge.name + ' is ' + stooge.age; })
   *     .first()
   *     .value();
   * // => 'moe is 40'
   */
  function chain(value) {
    value = new lodash(value);
    value.__chain__ = true;
    return value;
  }

  /**
   * Invokes `interceptor` with the `value` as the first argument, and then
   * returns `value`. The purpose of this method is to "tap into" a method chain,
   * in order to perform operations on intermediate results within the chain.
   *
   * @static
   * @memberOf _
   * @category Chaining
   * @param {Mixed} value The value to pass to `interceptor`.
   * @param {Function} interceptor The function to invoke.
   * @returns {Mixed} Returns `value`.
   * @example
   *
   * _.chain([1, 2, 3, 200])
   *  .filter(function(num) { return num % 2 == 0; })
   *  .tap(alert)
   *  .map(function(num) { return num * num })
   *  .value();
   * // => // [2, 200] (alerted)
   * // => [4, 40000]
   */
  function tap(value, interceptor) {
    interceptor(value);
    return value;
  }

  /**
   * Enables method chaining on the wrapper object.
   *
   * @name chain
   * @deprecated
   * @memberOf _
   * @category Chaining
   * @returns {Mixed} Returns the wrapper object.
   * @example
   *
   * _([1, 2, 3]).value();
   * // => [1, 2, 3]
   */
  function wrapperChain() {
    this.__chain__ = true;
    return this;
  }

  /**
   * Extracts the wrapped value.
   *
   * @name value
   * @memberOf _
   * @category Chaining
   * @returns {Mixed} Returns the wrapped value.
   * @example
   *
   * _([1, 2, 3]).value();
   * // => [1, 2, 3]
   */
  function wrapperValue() {
    return this.__wrapped__;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type String
   */
  lodash.VERSION = '0.10.0';

  // assign static methods
  lodash.assign = assign;
  lodash.after = after;
  lodash.bind = bind;
  lodash.bindAll = bindAll;
  lodash.bindKey = bindKey;
  lodash.chain = chain;
  lodash.clone = clone;
  lodash.compact = compact;
  lodash.compose = compose;
  lodash.contains = contains;
  lodash.countBy = countBy;
  lodash.debounce = debounce;
  lodash.defaults = defaults;
  lodash.defer = defer;
  lodash.delay = delay;
  lodash.difference = difference;
  lodash.escape = escape;
  lodash.every = every;
  lodash.filter = filter;
  lodash.find = find;
  lodash.first = first;
  lodash.flatten = flatten;
  lodash.forEach = forEach;
  lodash.forIn = forIn;
  lodash.forOwn = forOwn;
  lodash.functions = functions;
  lodash.groupBy = groupBy;
  lodash.has = has;
  lodash.identity = identity;
  lodash.indexOf = indexOf;
  lodash.initial = initial;
  lodash.intersection = intersection;
  lodash.invert = invert;
  lodash.invoke = invoke;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isBoolean = isBoolean;
  lodash.isDate = isDate;
  lodash.isElement = isElement;
  lodash.isEmpty = isEmpty;
  lodash.isEqual = isEqual;
  lodash.isFinite = isFinite;
  lodash.isFunction = isFunction;
  lodash.isNaN = isNaN;
  lodash.isNull = isNull;
  lodash.isNumber = isNumber;
  lodash.isObject = isObject;
  lodash.isPlainObject = isPlainObject;
  lodash.isRegExp = isRegExp;
  lodash.isString = isString;
  lodash.isUndefined = isUndefined;
  lodash.keys = keys;
  lodash.last = last;
  lodash.lastIndexOf = lastIndexOf;
  lodash.map = map;
  lodash.max = max;
  lodash.memoize = memoize;
  lodash.merge = merge;
  lodash.min = min;
  lodash.mixin = mixin;
  lodash.noConflict = noConflict;
  lodash.object = object;
  lodash.omit = omit;
  lodash.once = once;
  lodash.pairs = pairs;
  lodash.partial = partial;
  lodash.pick = pick;
  lodash.pluck = pluck;
  lodash.random = random;
  lodash.range = range;
  lodash.reduce = reduce;
  lodash.reduceRight = reduceRight;
  lodash.reject = reject;
  lodash.rest = rest;
  lodash.result = result;
  lodash.shuffle = shuffle;
  lodash.size = size;
  lodash.some = some;
  lodash.sortBy = sortBy;
  lodash.sortedIndex = sortedIndex;
  lodash.tap = tap;
  lodash.template = template;
  lodash.throttle = throttle;
  lodash.times = times;
  lodash.toArray = toArray;
  lodash.unescape = unescape;
  lodash.union = union;
  lodash.uniq = uniq;
  lodash.uniqueId = uniqueId;
  lodash.values = values;
  lodash.where = where;
  lodash.without = without;
  lodash.wrap = wrap;
  lodash.zip = zip;

  // assign aliases
  lodash.all = every;
  lodash.any = some;
  lodash.collect = map;
  lodash.detect = find;
  lodash.drop = rest;
  lodash.each = forEach;
  lodash.extend = assign;
  lodash.foldl = reduce;
  lodash.foldr = reduceRight;
  lodash.head = first;
  lodash.include = contains;
  lodash.inject = reduce;
  lodash.methods = functions;
  lodash.select = filter;
  lodash.tail = rest;
  lodash.take = first;
  lodash.unique = uniq;

  // add pseudo private property to be used and removed during the build process
  lodash._iteratorTemplate = iteratorTemplate;

  /*--------------------------------------------------------------------------*/

  // add all static functions to `lodash.prototype`
  mixin(lodash);

  // add `lodash.prototype.chain` after calling `mixin()` to avoid overwriting
  // it with the wrapped `lodash.chain`
  lodash.prototype.chain = wrapperChain;
  lodash.prototype.value = wrapperValue;

  // add all mutator Array functions to the wrapper.
  forEach(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
    var func = arrayRef[methodName];

    lodash.prototype[methodName] = function() {
      var value = this.__wrapped__;
      func.apply(value, arguments);

      // avoid array-like object bugs with `Array#shift` and `Array#splice` in
      // Firefox < 10 and IE < 9
      if (hasObjectSpliceBug && value.length === 0) {
        delete value[0];
      }
      if (this.__chain__) {
        value = new lodash(value);
        value.__chain__ = true;
      }
      return value;
    };
  });

  // add all accessor Array functions to the wrapper.
  forEach(['concat', 'join', 'slice'], function(methodName) {
    var func = arrayRef[methodName];

    lodash.prototype[methodName] = function() {
      var value = this.__wrapped__,
          result = func.apply(value, arguments);

      if (this.__chain__) {
        result = new lodash(result);
        result.__chain__ = true;
      }
      return result;
    };
  });

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash was injected by a third-party script and not intended to be
    // loaded as a module. The global assignment can be reverted in the Lo-Dash
    // module via its `noConflict()` method.
    window._ = lodash;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return lodash;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports) {
    // in Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      (module.exports = lodash)._ = lodash;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports._ = lodash;
    }
  }
  else {
    // in a browser or Rhino
    window._ = lodash;
  }
}(this));
;

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);;

/**
 * |-------------------|
 * | Backbone-Mediator |
 * |-------------------|
 *  Backbone-Mediator is freely distributable under the MIT license.
 *
 *  <a href="https://github.com/chalbert/Backbone-Mediator">More details & documentation</a>
 *
 * @author Nicolas Gilbert
 *
 * @requires _
 * @requires Backbone
 */
(function(factory){
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], factory);
  } else {
    factory(_, Backbone);
  }

})(function (_, Backbone){
  'use strict';

  /**
   * @static
   */
  var channels = {},
      Subscriber,
      /** @borrows Backbone.View#delegateEvents */
      delegateEvents = Backbone.View.prototype.delegateEvents,
      /** @borrows Backbone.View#delegateEvents */
      undelegateEvents = Backbone.View.prototype.undelegateEvents;

  /**
   * @class
   */
  Backbone.Mediator = {

    /**
     * Subscribe to a channel
     *
     * @param channel
     */
    subscribe: function(channel, subscription, context, once) {
      if (!channels[channel]) channels[channel] = [];
      channels[channel].push({fn: subscription, context: context || this, once: once});
    },

    /**
     * Trigger all callbacks for a channel
     *
     * @param channel
     * @params N Extra parametter to pass to handler
     */
    publish: function(channel) {
      if (!channels[channel]) return;

      var args = [].slice.call(arguments, 1),
          subscription;

      for (var i = 0; i < channels[channel].length; i++) {
        subscription = channels[channel][i];
        subscription.fn.apply(subscription.context, args);
        if (subscription.once) {
          Backbone.Mediator.unsubscribe(channel, subscription.fn, subscription.context);
          i--;
        }
      }
    },

    /**
     * Cancel subscription
     *
     * @param channel
     * @param fn
     * @param context
     */

    unsubscribe: function(channel, fn, context){
      if (!channels[channel]) return;

      var subscription;
      for (var i = 0; i < channels[channel].length; i++) {
        subscription = channels[channel][i];
        if (subscription.fn === fn && subscription.context === context) {
          channels[channel].splice(i, 1);
          i--;
        }
      }
    },

    /**
     * Subscribing to one event only
     *
     * @param channel
     * @param subscription
     * @param context
     */
    subscribeOnce: function (channel, subscription, context) {
      Backbone.Mediator.subscribe(channel, subscription, context, true);
    }

  };

  /**
   * Allow to define convention-based subscriptions
   * as an 'subscriptions' hash on a view. Subscriptions
   * can then be easily setup and cleaned.
   *
   * @class
   */


  Subscriber = {

    /**
     * Extend delegateEvents() to set subscriptions
     */
    delegateEvents: function(){
      delegateEvents.apply(this, arguments);
      this.setSubscriptions();
    },

    /**
     * Extend undelegateEvents() to unset subscriptions
     */
    undelegateEvents: function(){
      undelegateEvents.apply(this, arguments);
      this.unsetSubscriptions();
    },

    /** @property {Object} List of subscriptions, to be defined */
    subscriptions: {},

    /**
     * Subscribe to each subscription
     * @param {Object} [subscriptions] An optional hash of subscription to add
     */

    setSubscriptions: function(subscriptions){
      if (subscriptions) _.extend(this.subscriptions || {}, subscriptions);
      subscriptions = subscriptions || this.subscriptions;
      if (!subscriptions || _.isEmpty(subscriptions)) return;
      // Just to be sure we don't set duplicate
      this.unsetSubscriptions(subscriptions);

      _.each(subscriptions, function(subscription, channel){
        var once;
        if (subscription.$once) {
          subscription = subscription.$once;
          once = true;
        }
        if (_.isString(subscription)) {
          subscription = this[subscription];
        }
        Backbone.Mediator.subscribe(channel, subscription, this, once);
      }, this);
    },

    /**
     * Unsubscribe to each subscription
     * @param {Object} [subscriptions] An optional hash of subscription to remove
     */
    unsetSubscriptions: function(subscriptions){
      subscriptions = subscriptions || this.subscriptions;
      if (!subscriptions || _.isEmpty(subscriptions)) return;
      _.each(subscriptions, function(subscription, channel){
        if (_.isString(subscription)) {
          subscription = this[subscription];
        }
        Backbone.Mediator.unsubscribe(channel, subscription.$once || subscription, this);
      }, this);
    }
  };

  /**
   * @lends Backbone.View.prototype
   */
  _.extend(Backbone.View.prototype, Subscriber);

  /**
   * @lends Backbone.Mediator
   */
  _.extend(Backbone.Mediator, {
    /**
     * Shortcut for publish
     * @function
     */
    pub: Backbone.Mediator.publish,
    /**
     * Shortcut for subscribe
     * @function
     */
    sub: Backbone.Mediator.subscribe
  });

  return Backbone;

});;

/* ------------------------------------------------------------------------- */
/* --- Backbone Core Modifications ----------------------------------------- */
/* ------------------------------------------------------------------------- */

/*** Provides super method ***/

(function(Backbone) {
	Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = function(protoProps, classProps) {
		var child = inherits(this, protoProps, classProps);
		child.extend = this.extend;
		return child;
	};

	var ctor = function(){}, inherits = function(parent, protoProps, staticProps) {
		var child, _super = parent.prototype, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ parent.apply(this, arguments); };
		}

		// Inherit class (static) properties from parent.
		_.extend(child, parent);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		
		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) {
			_.extend(child.prototype, protoProps);
			
			// Copy the properties over onto the new prototype
			for (var name in protoProps) {
				// Check if we're overwriting an existing function
				if (typeof protoProps[name] == "function" &&  typeof _super[name] == "function" && fnTest.test(protoProps[name])) {
					child.prototype[name] = (function(name, fn) {
						return function() {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, protoProps[name]);
				}
			}
		}

		// Add static properties to the constructor function, if supplied.
		if (staticProps) _.extend(child, staticProps);

		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;

		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;

		return child;
	};
})(Backbone);;

/**
 * VERSION: beta 1.648
 * DATE: 2012-11-23
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 * 
 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, easing.EasePack, plugins.CSSPlugin, plugins.RoundPropsPlugin
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("TweenMax",["core.Animation","core.SimpleTimeline","TweenLite"],function(p,t,g){var n=function(E,c,e){g.call(this,E,c,e);this._cycle=0;this._yoyo=!0===this.vars.yoyo;this._repeat=this.vars.repeat||0;this._repeatDelay=this.vars.repeatDelay||0;this._dirty=!0},j=n.prototype=g.to({},0.1,{}),d=[];n.version=1.648;j.constructor=n;j.kill()._gc=!1;n.killTweensOf=n.killDelayedCallsTo=g.killTweensOf;n.getTweensOf=g.getTweensOf;n.ticker=g.ticker;
j.invalidate=function(){this._yoyo=!0===this.vars.yoyo;this._repeat=this.vars.repeat||0;this._repeatDelay=this.vars.repeatDelay||0;this._uncache(!0);return g.prototype.invalidate.call(this)};j.updateTo=function(E,c){var e=this.ratio,a;c&&(null!=this.timeline&&this._startTime<this._timeline._time)&&(this._startTime=this._timeline._time,this._uncache(!1),this._gc?this._enabled(!0,!1):this._timeline.insert(this,this._startTime-this._delay));for(a in E)this.vars[a]=E[a];if(this._initted)if(c)this._initted=
!1;else if(this._notifyPluginsOfEnabled&&this._firstPT&&g._onPluginEvent("_onDisable",this),0.998<this._time/this._duration)e=this._time,this.render(0,!0,!1),this._initted=!1,this.render(e,!0,!1);else if(0<this._time){this._initted=!1;this._init();e=1/(1-e);a=this._firstPT;for(var H;a;)H=a.s+a.c,a.c*=e,a.s=H-a.c,a=a._next}return this};j.render=function(a,c,e){var i=!this._dirty?this._totalDuration:this.totalDuration(),H=this._time,b=this._totalTime,v=this._cycle,h,x;if(a>=i){if(this._totalTime=i,
this._cycle=this._repeat,this._yoyo&&0!==(this._cycle&1)?(this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0):(this._time=this._duration,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1),this._reversed||(h=!0,x="onComplete"),0===this._duration){if(0===a||0>this._rawPrevTime)this._rawPrevTime!==a&&(e=!0);this._rawPrevTime=a}}else if(0>=a){this._totalTime=this._time=this._cycle=0;this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0;if(0!==b||0===this._duration&&0<this._rawPrevTime)x=
"onReverseComplete",h=this._reversed;0>a?(this._active=!1,0===this._duration&&(0<=this._rawPrevTime&&(e=!0),this._rawPrevTime=a)):this._initted||(e=!0)}else if(this._totalTime=this._time=a,0!==this._repeat&&(a=this._duration+this._repeatDelay,this._cycle=this._totalTime/a>>0,0!==this._cycle&&this._cycle===this._totalTime/a&&this._cycle--,this._time=this._totalTime-this._cycle*a,this._yoyo&&0!==(this._cycle&1)&&(this._time=this._duration-this._time),this._time>this._duration?this._time=this._duration:
0>this._time&&(this._time=0)),this._easeType){var a=this._time/this._duration,i=this._easeType,q=this._easePower;if(1===i||3===i&&0.5<=a)a=1-a;3===i&&(a*=2);1===q?a*=a:2===q?a*=a*a:3===q?a*=a*a*a:4===q&&(a*=a*a*a*a);this.ratio=1===i?1-a:2===i?a:0.5>this._time/this._duration?a/2:1-a/2}else this.ratio=this._ease.getRatio(this._time/this._duration);if(H===this._time&&!e)b!==this._totalTime&&this._onUpdate&&(c||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||d));else{this._initted||
(this._init(),!h&&this._time&&(this.ratio=this._ease.getRatio(this._time/this._duration)));!this._active&&!this._paused&&(this._active=!0);if(0===b&&this.vars.onStart&&(0!==this._totalTime||0===this._duration))c||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||d);for(e=this._firstPT;e;){if(e.f)e.t[e.p](e.c*this.ratio+e.s);else e.t[e.p]=e.c*this.ratio+e.s;e=e._next}this._onUpdate&&(c||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||d));this._cycle!==
v&&(c||this._gc||this.vars.onRepeat&&this.vars.onRepeat.apply(this.vars.onRepeatScope||this,this.vars.onRepeatParams||d));x&&!this._gc&&(h&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),c||this.vars[x]&&this.vars[x].apply(this.vars[x+"Scope"]||this,this.vars[x+"Params"]||d))}};n.to=function(a,c,e){return new n(a,c,e)};n.from=function(a,c,e){e.runBackwards=!0;!1!==e.immediateRender&&(e.immediateRender=!0);return new n(a,c,e)};n.fromTo=function(a,c,e,i){i.startAt=e;e.immediateRender&&
(i.immediateRender=!0);return new n(a,c,i)};n.staggerTo=n.allTo=function(a,c,e,i,H,b,d){var i=i||0,h=[],v=a.length,q=e.delay||0,B,s,g;for(s=0;s<v;s++){B={};for(g in e)B[g]=e[g];B.delay=q;s===v-1&&H&&(B.onComplete=function(){e.onComplete&&e.onComplete.apply(e.onCompleteScope,e.onCompleteParams);H.apply(d,b)});h[s]=new n(a[s],c,B);q+=i}return h};n.staggerFrom=n.allFrom=function(a,c,e,i,b,d,v){e.runBackwards=!0;!1!==e.immediateRender&&(e.immediateRender=!0);return n.staggerTo(a,c,e,i,b,d,v)};n.staggerFromTo=
n.allFromTo=function(a,c,e,i,b,d,v,h){i.startAt=e;e.immediateRender&&(i.immediateRender=!0);return n.staggerTo(a,c,i,b,d,v,h)};n.delayedCall=function(a,c,e,i,b){return new n(c,0,{delay:a,onComplete:c,onCompleteParams:e,onCompleteScope:i,onReverseComplete:c,onReverseCompleteParams:e,onReverseCompleteScope:i,immediateRender:!1,useFrames:b,overwrite:0})};n.set=function(a,c){return new n(a,0,c)};n.isTweening=function(a){for(var a=g.getTweensOf(a),c=a.length,e;-1<--c;)if((e=a[c])._active||e._startTime===
e.timeline._time&&e.timeline._active)return!0;return!1};var v=function(a,c){for(var e=[],i=0,b=a._first;b;)b instanceof g?e[i++]=b:(c&&(e[i++]=b),e=e.concat(v(b,c)),i=e.length),b=b._next;return e},b=n.getAllTweens=function(a){return v(p._rootTimeline,a).concat(v(p._rootFramesTimeline,a))};n.killAll=function(a,c,e,i){null==c&&(c=!0);null==e&&(e=!0);var H=b(!1!=i),d=H.length,i=c&&e&&i,v,h,x;for(x=0;x<d;x++)if(h=H[x],i||h instanceof t||(v=h.target===h.vars.onComplete)&&e||c&&!v)a?h.totalTime(h.totalDuration()):
h._enabled(!1,!1)};n.killChildTweensOf=function(a,c){if(null!=a)if(a.jquery)a.each(function(a,e){n.killChildTweensOf(e,c)});else{var e=g._tweenLookup,i=[],b,d;for(d in e)for(b=e[d].target.parentNode;b;)b===a&&(i=i.concat(e[d].tweens)),b=b.parentNode;b=i.length;for(e=0;e<b;e++)c&&i[e].totalTime(i[e].totalDuration()),i[e]._enabled(!1,!1)}};n.pauseAll=function(E,c,e){a(!0,E,c,e)};n.resumeAll=function(E,c,e){a(!1,E,c,e)};var a=function(a,c,e,i){void 0==c&&(c=!0);void 0==e&&(e=!0);for(var d=b(i),i=c&&
e&&i,v=d.length,g,h;-1<--v;)h=d[v],(i||h instanceof t||(g=h.target===h.vars.onComplete)&&e||c&&!g)&&h.paused(a)};j.progress=function(a){return!arguments.length?this._time/this.duration():this.totalTime(this.duration()*(this._yoyo&&0!==(this._cycle&1)?1-a:a)+this._cycle*(this._duration+this._repeatDelay),!1)};j.totalProgress=function(a){return!arguments.length?this._totalTime/this.totalDuration():this.totalTime(this.totalDuration()*a,!1)};j.time=function(a,c){if(!arguments.length)return this._time;
this._dirty&&this.totalDuration();a>this._duration&&(a=this._duration);this._yoyo&&0!==(this._cycle&1)?a=this._duration-a+this._cycle*(this._duration+this._repeatDelay):0!=this._repeat&&(a+=this._cycle*(this._duration+this._repeatDelay));return this.totalTime(a,c)};j.totalDuration=function(a){return!arguments.length?(this._dirty&&(this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat,this._dirty=!1),this._totalDuration):-1===this._repeat?
this:this.duration((a-this._repeat*this._repeatDelay)/(this._repeat+1))};j.repeat=function(a){if(!arguments.length)return this._repeat;this._repeat=a;return this._uncache(!0)};j.repeatDelay=function(a){if(!arguments.length)return this._repeatDelay;this._repeatDelay=a;return this._uncache(!0)};j.yoyo=function(a){if(!arguments.length)return this._yoyo;this._yoyo=a;return this};return n},!0);_gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(p,t,g){var n=function(a){t.call(this,
a);this._labels={};this.autoRemoveChildren=!0===this.vars.autoRemoveChildren;this.smoothChildTiming=!0===this.vars.smoothChildTiming;this._sortChildren=!0;this._onUpdate=this.vars.onUpdate;for(var a=j.length,b,c;-1<--a;)if(c=this.vars[j[a]])for(b=c.length;-1<--b;)"{self}"===c[b]&&(c=this.vars[j[a]]=c.concat(),c[b]=this);this.vars.tweens instanceof Array&&this.insertMultiple(this.vars.tweens,0,this.vars.align||"normal",this.vars.stagger||0)},j=["onStartParams","onUpdateParams","onCompleteParams","onReverseCompleteParams",
"onRepeatParams"],d=[],v=function(a){var b={},c;for(c in a)b[c]=a[c];return b},b=n.prototype=new t;n.version=1.641;b.constructor=n;b.kill()._gc=!1;b.to=function(a,b,c,e,i){return this.insert(new g(a,b,c),this._parseTimeOrLabel(i,e,!0))};b.from=function(a,b,c,e,i){return this.insert(g.from(a,b,c),this._parseTimeOrLabel(i,e,!0))};b.fromTo=function(a,b,c,e,i,d){return this.insert(g.fromTo(a,b,c,e),this._parseTimeOrLabel(d,i,!0))};b.staggerTo=function(a,b,c,e,i,d,j,F,h){j=new n({onComplete:j,onCompleteParams:F,
onCompleteScope:h});e=e||0;for(F=0;F<a.length;F++)null!=c.startAt&&(c.startAt=v(c.startAt)),j.insert(new g(a[F],b,v(c)),F*e);return this.insert(j,this._parseTimeOrLabel(d,i,!0))};b.staggerFrom=function(a,b,c,e,i,d,v,g,h){null==c.immediateRender&&(c.immediateRender=!0);c.runBackwards=!0;return this.staggerTo(a,b,c,e,i,d,v,g,h)};b.staggerFromTo=function(a,b,c,e,i,d,v,g,h,x){e.startAt=c;c.immediateRender&&(e.immediateRender=!0);return this.staggerTo(a,b,e,i,d,v,g,h,x)};b.call=function(a,b,c,e,i){return this.insert(g.delayedCall(0,
a,b,c),this._parseTimeOrLabel(i,e,!0))};b.set=function(a,b,c,e){b.immediateRender=!1;return this.insert(new g(a,0,b),this._parseTimeOrLabel(e,c,!0))};n.exportRoot=function(a,b){a=a||{};null==a.smoothChildTiming&&(a.smoothChildTiming=!0);var c=new n(a),e=c._timeline;null==b&&(b=!0);e._remove(c,!0);c._startTime=0;c._rawPrevTime=c._time=c._totalTime=e._time;for(var i=e._first,d;i;)d=i._next,(!b||!(i instanceof g&&i.target===i.vars.onComplete))&&c.insert(i,i._startTime-i._delay),i=d;e.insert(c,0);return c};
b.insert=function(a,b){if(!(a instanceof p)){if(a instanceof Array)return this.insertMultiple(a,b);if("string"===typeof a)return this.addLabel(a,this._parseTimeOrLabel(b||0,0,!0));if("function"===typeof a)a=g.delayedCall(0,a);else throw"ERROR: Cannot insert() "+a+" into the TimelineLite/Max because it is neither a tween, timeline, function, nor a String.";}t.prototype.insert.call(this,a,this._parseTimeOrLabel(b||0,0,!0));if(this._gc&&!this._paused&&this._time===this._duration&&this._time<this.duration())for(var c=
this;c._gc&&c._timeline;)c._timeline.smoothChildTiming?c.totalTime(c._totalTime,!0):c._enabled(!0,!1),c=c._timeline;return this};b.remove=function(a){if(a instanceof p)return this._remove(a,!1);if(a instanceof Array){for(var b=a.length;-1<--b;)this.remove(a[b]);return this}return"string"===typeof a?this.removeLabel(a):this.kill(null,a)};b.append=function(a,b){return this.insert(a,this._parseTimeOrLabel(null,b,!0))};b.insertMultiple=function(a,b,c,e){for(var c=c||"normal",e=e||0,i,d=this._parseTimeOrLabel(b||
0,0,!0),v=a.length,b=0;b<v;b++){if((i=a[b])instanceof Array)i=new n({tweens:i});this.insert(i,d);"string"===typeof i||"function"===typeof i||("sequence"===c?d=i._startTime+i.totalDuration()/i._timeScale:"start"===c&&(i._startTime-=i.delay()));d+=e}return this._uncache(!0)};b.appendMultiple=function(a,b,c,e){return this.insertMultiple(a,this._parseTimeOrLabel(null,b,!0),c,e)};b.addLabel=function(a,b){this._labels[a]=b;return this};b.removeLabel=function(a){delete this._labels[a];return this};b.getLabelTime=
function(a){return null!=this._labels[a]?this._labels[a]:-1};b._parseTimeOrLabel=function(a,b,c){if("string"===typeof b)return this._parseTimeOrLabel(b,c&&"number"===typeof a&&null==this._labels[b]?a-this.duration():0,c);b=b||0;return null==a?this.duration()+b:"string"===typeof a&&isNaN(a)?null==this._labels[a]?c?this._labels[a]=this.duration()+b:b:this._labels[a]+b:Number(a)+b};b.seek=function(a,b){return this.totalTime(this._parseTimeOrLabel(a),!1!=b)};b.stop=function(){return this.paused(!0)};
b.gotoAndPlay=function(a,b){return t.prototype.play.call(this,a,b)};b.gotoAndStop=function(a,b){return this.pause(a,b)};b.render=function(a,b,c){this._gc&&this._enabled(!0,!1);this._active=!this._paused;var e=!this._dirty?this._totalDuration:this.totalDuration(),i=this._time,v=this._startTime,g=this._timeScale,n=this._paused,h,x,q;if(a>=e){this._totalTime=this._time=e;if(!this._reversed&&!this._hasPausedChild()&&(h=!0,q="onComplete",0===this._duration&&(0===a||0>this._rawPrevTime)))this._rawPrevTime!==
a&&(c=!0);this._rawPrevTime=a;a=e+1E-6}else if(0>=a){this._totalTime=this._time=0;if(0!==i||0===this._duration&&0<this._rawPrevTime)q="onReverseComplete",h=this._reversed;0>a?(this._active=!1,0===this._duration&&0<=this._rawPrevTime&&(c=!0)):this._initted||(c=!0);this._rawPrevTime=a;a=-1E-6}else this._totalTime=this._time=this._rawPrevTime=a;if(this._time!==i||c){this._initted||(this._initted=!0);0===i&&this.vars.onStart&&0!==this._time&&(b||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||
d));if(this._time>i)for(c=this._first;c;){x=c._next;if(this._paused&&!n)break;else if(c._active||c._startTime<=this._time&&!c._paused&&!c._gc)c._reversed?c.render((!c._dirty?c._totalDuration:c.totalDuration())-(a-c._startTime)*c._timeScale,b,!1):c.render((a-c._startTime)*c._timeScale,b,!1);c=x}else for(c=this._last;c;){x=c._prev;if(this._paused&&!n)break;else if(c._active||c._startTime<=i&&!c._paused&&!c._gc)c._reversed?c.render((!c._dirty?c._totalDuration:c.totalDuration())-(a-c._startTime)*c._timeScale,
b,!1):c.render((a-c._startTime)*c._timeScale,b,!1);c=x}this._onUpdate&&(b||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||d));if(q&&!this._gc&&(v===this._startTime||g!=this._timeScale))if(0===this._time||e>=this.totalDuration())h&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),b||this.vars[q]&&this.vars[q].apply(this.vars[q+"Scope"]||this,this.vars[q+"Params"]||d)}};b._hasPausedChild=function(){for(var a=this._first;a;){if(a._paused||a instanceof
n&&a._hasPausedChild())return!0;a=a._next}return!1};b.getChildren=function(a,b,c,e){for(var e=e||-9999999999,i=[],d=this._first,v=0;d;)d._startTime<e||(d instanceof g?!1!=b&&(i[v++]=d):(!1!=c&&(i[v++]=d),!1!=a&&(i=i.concat(d.getChildren(!0,b,c)),v=i.length))),d=d._next;return i};b.getTweensOf=function(a,b){for(var c=g.getTweensOf(a),e=c.length,i=[],d=0;-1<--e;)if(c[e].timeline===this||b&&this._contains(c[e]))i[d++]=c[e];return i};b._contains=function(a){for(a=a.timeline;a;){if(a===this)return!0;a=
a.timeline}return!1};b.shiftChildren=function(a,b,c){for(var c=c||0,e=this._first;e;)e._startTime>=c&&(e._startTime+=a),e=e._next;if(b)for(var i in this._labels)this._labels[i]>=c&&(this._labels[i]+=a);return this._uncache(!0)};b._kill=function(a,b){if(null==a&&null==b)return this._enabled(!1,!1);for(var c=null==b?this.getChildren(!0,!0,!1):this.getTweensOf(b),e=c.length,i=!1;-1<--e;)c[e]._kill(a,b)&&(i=!0);return i};b.clear=function(a){var b=this.getChildren(!1,!0,!0),c=b.length;for(this._time=this._totalTime=
0;-1<--c;)b[c]._enabled(!1,!1);!1!=a&&(this._labels={});return this._uncache(!0)};b.invalidate=function(){for(var a=this._first;a;)a.invalidate(),a=a._next;return this};b._enabled=function(a,b){if(a===this._gc)for(var c=this._first;c;)c._enabled(a,!0),c=c._next;return t.prototype._enabled.call(this,a,b)};b.progress=function(a){return!arguments.length?this._time/this.duration():this.totalTime(this.duration()*a,!1)};b.duration=function(a){if(!arguments.length)return this._dirty&&this.totalDuration(),
this._duration;0!==this.duration()&&0!==a&&this.timeScale(this._duration/a);return this};b.totalDuration=function(a){if(!arguments.length){if(this._dirty){for(var b=0,c=this._first,e=-999999999999,i;c;)i=c._next,c._startTime<e&&this._sortChildren?this.insert(c,c._startTime-c._delay):e=c._startTime,0>c._startTime&&(b-=c._startTime,this.shiftChildren(-c._startTime,!1,-9999999999)),c=c._startTime+(!c._dirty?c._totalDuration:c.totalDuration())/c._timeScale,c>b&&(b=c),c=i;this._duration=this._totalDuration=
b;this._dirty=!1}return this._totalDuration}0!==this.totalDuration()&&0!==a&&this.timeScale(this._totalDuration/a);return this};b.usesFrames=function(){for(var a=this._timeline;a._timeline;)a=a._timeline;return a===p._rootFramesTimeline};b.rawTime=function(){return this._paused||0!==this._totalTime&&this._totalTime!==this._totalDuration?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale};return n},!0);_gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(p,
t,g){var n=function(d){p.call(this,d);this._repeat=this.vars.repeat||0;this._repeatDelay=this.vars.repeatDelay||0;this._cycle=0;this._yoyo=!0==this.vars.yoyo;this._dirty=!0},j=[],d=new g(null,null,1,0),g=n.prototype=new p;g.constructor=n;g.kill()._gc=!1;n.version=1.641;g.invalidate=function(){this._yoyo=!0===this.vars.yoyo;this._repeat=this.vars.repeat||0;this._repeatDelay=this.vars.repeatDelay||0;this._uncache(!0);return p.prototype.invalidate.call(this)};g.addCallback=function(d,b,a,g){return this.insert(t.delayedCall(0,
d,a,g),b)};g.removeCallback=function(d,b){if(null==b)this._kill(null,d);else for(var a=this.getTweensOf(d,!1),g=a.length,c=this._parseTimeOrLabel(b);-1<--g;)a[g]._startTime===c&&a[g]._enabled(!1,!1);return this};g.tweenTo=function(v,b){var b=b||{},a={ease:d,overwrite:2,useFrames:this.usesFrames(),immediateRender:!1},g,c;for(g in b)a[g]=b[g];a.time=this._parseTimeOrLabel(v);c=new t(this,Math.abs(Number(a.time)-this._time)/this._timeScale||0.001,a);a.onStart=function(){c.target.paused(!0);c.vars.time!==
c.target.time()&&c.duration(Math.abs(c.vars.time-c.target.time())/c.target._timeScale);b.onStart&&b.onStart.apply(b.onStartScope||c,b.onStartParams||j)};return c};g.tweenFromTo=function(d,b,a){a=a||{};a.startAt={time:this._parseTimeOrLabel(d)};d=this.tweenTo(b,a);return d.duration(Math.abs(d.vars.time-d.vars.startAt.time)/this._timeScale||0.001)};g.render=function(d,b,a){this._gc&&this._enabled(!0,!1);this._active=!this._paused;var g=!this._dirty?this._totalDuration:this.totalDuration(),c=this._time,
e=this._totalTime,i=this._startTime,n=this._timeScale,t=this._rawPrevTime,F=this._paused,h=this._cycle,x,q;if(d>=g){this._locked||(this._totalTime=g,this._cycle=this._repeat);if(!this._reversed&&!this._hasPausedChild()&&(x=!0,q="onComplete",0===this._duration&&(0===d||0>this._rawPrevTime)))this._rawPrevTime!==d&&(a=!0);this._rawPrevTime=d;this._yoyo&&0!==(this._cycle&1)?(this._time=0,d=-1E-6):(this._time=this._duration,d=this._duration+1E-6)}else if(0>=d){this._locked||(this._totalTime=this._cycle=
0);this._time=0;if(0!==c||0===this._duration&&0<this._rawPrevTime&&!this._locked)q="onReverseComplete",x=this._reversed;0>d?(this._active=!1,0===this._duration&&0<=this._rawPrevTime&&(a=!0)):this._initted||(a=!0);this._rawPrevTime=d;d=0===this._duration?0:-1E-6}else if(this._time=this._rawPrevTime=d,!this._locked&&(this._totalTime=d,0!==this._repeat)){var B=this._duration+this._repeatDelay;this._cycle=this._totalTime/B>>0;0!==this._cycle&&this._cycle===this._totalTime/B&&this._cycle--;this._time=
this._totalTime-this._cycle*B;this._yoyo&&0!==(this._cycle&1)&&(this._time=this._duration-this._time);this._time>this._duration?(this._time=this._duration,d=this._duration+1E-6):0>this._time?this._time=d=0:d=this._time}if(this._cycle!==h&&!this._locked){var B=this._yoyo&&0!==(h&1),s=B===(this._yoyo&&0!==(this._cycle&1)),O=this._totalTime,I=this._cycle,D=this._rawPrevTime,y=this._time;this._totalTime=h*this._duration;this._cycle<h?B=!B:this._totalTime+=this._duration;this._time=c;this._rawPrevTime=
0===this._duration?t-1E-5:t;this._cycle=h;this._locked=!0;c=B?0:this._duration;this.render(c,b,0===this._duration);b||this._gc||this.vars.onRepeat&&this.vars.onRepeat.apply(this.vars.onRepeatScope||this,this.vars.onRepeatParams||j);s&&(c=B?this._duration+1E-6:-1E-6,this.render(c,!0,!1));this._time=y;this._totalTime=O;this._cycle=I;this._rawPrevTime=D;this._locked=!1}if(this._time===c&&!a)e!==this._totalTime&&this._onUpdate&&(b||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||
j));else{this._initted||(this._initted=!0);0===e&&this.vars.onStart&&0!==this._totalTime&&(b||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||j));if(this._time>c)for(a=this._first;a;){e=a._next;if(this._paused&&!F)break;else if(a._active||a._startTime<=this._time&&!a._paused&&!a._gc)a._reversed?a.render((!a._dirty?a._totalDuration:a.totalDuration())-(d-a._startTime)*a._timeScale,b,!1):a.render((d-a._startTime)*a._timeScale,b,!1);a=e}else for(a=this._last;a;){e=a._prev;
if(this._paused&&!F)break;else if(a._active||a._startTime<=c&&!a._paused&&!a._gc)a._reversed?a.render((!a._dirty?a._totalDuration:a.totalDuration())-(d-a._startTime)*a._timeScale,b,!1):a.render((d-a._startTime)*a._timeScale,b,!1);a=e}this._onUpdate&&(b||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||j));if(q&&!this._locked&&!this._gc&&(i===this._startTime||n!==this._timeScale))if(0===this._time||g>=this.totalDuration())x&&(this._timeline.autoRemoveChildren&&this._enabled(!1,
!1),this._active=!1),b||this.vars[q]&&this.vars[q].apply(this.vars[q+"Scope"]||this,this.vars[q+"Params"]||j)}};g.getActive=function(d,b,a){null==d&&(d=!0);null==b&&(b=!0);null==a&&(a=!1);var g=[],d=this.getChildren(d,b,a),b=0,a=d.length,c,e;for(c=0;c<a;c++)if(e=d[c],!e._paused&&e._timeline._time>=e._startTime&&e._timeline._time<e._startTime+e._totalDuration/e._timeScale){var i;a:{for(i=e._timeline;i;){if(i._paused){i=!0;break a}i=i._timeline}i=!1}i||(g[b++]=e)}return g};g.getLabelAfter=function(d){!d&&
0!==d&&(d=this._time);var b=this.getLabelsArray(),a=b.length,g;for(g=0;g<a;g++)if(b[g].time>d)return b[g].name;return null};g.getLabelBefore=function(d){null==d&&(d=this._time);for(var b=this.getLabelsArray(),a=b.length;-1<--a;)if(b[a].time<d)return b[a].name;return null};g.getLabelsArray=function(){var d=[],b=0,a;for(a in this._labels)d[b++]={time:this._labels[a],name:a};d.sort(function(a,b){return a.time-b.time});return d};g.progress=function(d){return!arguments.length?this._time/this.duration():
this.totalTime(this.duration()*(this._yoyo&&0!==(this._cycle&1)?1-d:d)+this._cycle*(this._duration+this._repeatDelay),!1)};g.totalProgress=function(d){return!arguments.length?this._totalTime/this.totalDuration():this.totalTime(this.totalDuration()*d,!1)};g.totalDuration=function(d){return!arguments.length?(this._dirty&&(p.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration):-1===this._repeat?
this:this.duration((d-this._repeat*this._repeatDelay)/(this._repeat+1))};g.time=function(d,b){if(!arguments.length)return this._time;this._dirty&&this.totalDuration();d>this._duration&&(d=this._duration);this._yoyo&&0!==(this._cycle&1)?d=this._duration-d+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(d+=this._cycle*(this._duration+this._repeatDelay));return this.totalTime(d,b)};g.repeat=function(d){if(!arguments.length)return this._repeat;this._repeat=d;return this._uncache(!0)};
g.repeatDelay=function(d){if(!arguments.length)return this._repeatDelay;this._repeatDelay=d;return this._uncache(!0)};g.yoyo=function(d){if(!arguments.length)return this._yoyo;this._yoyo=d;return this};g.currentLabel=function(d){return!arguments.length?this.getLabelBefore(this._time+1E-8):this.seek(d,!0)};return n},!0);_gsDefine("plugins.BezierPlugin",["plugins.TweenPlugin"],function(p){var t=function(){p.call(this,"bezier",-1);this._overwriteProps.pop();this._func={};this._round={}},g=t.prototype=
new p("bezier",1),n=180/Math.PI,j=[],d=[],v=[],b={},a=function(a,b,c,d){this.a=a;this.b=b;this.c=c;this.d=d;this.da=d-a;this.ca=c-a;this.ba=b-a},E=t.bezierThrough=function(e,i,g,n,F,h){var x={},q=[],B,s,t,F="string"===typeof F?","+F+",":",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,";null==i&&(i=1);for(s in e[0])q.push(s);j.length=d.length=v.length=0;for(B=q.length;-1<--B;){s=q[B];
b[s]=-1!==F.indexOf(","+s+",");t=x;var I=s,D;D=e;var y=s,k=b[s],A=h,r=[],C=void 0,u=void 0,p=void 0,E=void 0,f=void 0,C=void 0;if(A){D=[A].concat(D);for(u=D.length;-1<--u;)if("string"===typeof(C=D[u][y]))"="===C.charAt(1)&&(D[u][y]=A[y]+Number(C.charAt(0)+C.substr(2)))}C=D.length-2;if(0>C)r[0]=new a(D[0][y],0,0,D[-1>C?0:1][y]);else{for(u=0;u<C;u++)p=D[u][y],E=D[u+1][y],r[u]=new a(p,0,0,E),k&&(f=D[u+2][y],j[u]=(j[u]||0)+(E-p)*(E-p),d[u]=(d[u]||0)+(f-E)*(f-E));r[u]=new a(D[u][y],0,0,D[u+1][y])}D=r;
t[I]=D}for(B=j.length;-1<--B;)j[B]=Math.sqrt(j[B]),d[B]=Math.sqrt(d[B]);if(!n){for(B=q.length;-1<--B;)if(b[s]){e=x[q[B]];t=e.length-1;for(F=0;F<t;F++)h=e[F+1].da/d[F]+e[F].da/j[F],v[F]=(v[F]||0)+h*h}for(B=v.length;-1<--B;)v[B]=Math.sqrt(v[B])}for(B=q.length;-1<--B;){s=q[B];e=x[s];F=i;h=g;t=n;s=b[s];I=e.length-1;D=0;for(var y=e[0].a,l=f=E=A=C=E=p=C=u=p=r=A=k=void 0,k=0;k<I;k++)u=e[D],A=u.a,r=u.d,p=e[D+1].d,s?(E=j[k],f=d[k],l=0.25*(f+E)*F/(t?0.5:v[k]||0.5),C=r-(r-A)*(t?0.5*F:l/E),p=r+(p-r)*(t?0.5*F:
l/f),E=r-(C+(p-C)*(3*E/(E+f)+0.5)/4)):(C=r-0.5*(r-A)*F,p=r+0.5*(p-r)*F,E=r-(C+p)/2),C+=E,p+=E,u.c=C,u.b=0!==k?y:y=u.a+0.6*(u.c-u.a),u.da=r-A,u.ca=C-A,u.ba=y-A,h?(A=c(A,y,C,r),e.splice(D,1,A[0],A[1],A[2],A[3]),D+=4):D++,y=p;u=e[D];u.b=y;u.c=y+0.4*(u.d-y);u.da=u.d-u.a;u.ca=u.c-u.a;u.ba=y-u.a;h&&(A=c(u.a,y,u.c,u.d),e.splice(D,1,A[0],A[1],A[2],A[3]))}return x},c=t.cubicToQuadratic=function(a,b,c,d){var g={a:a},h={},x={},q={c:d},n=(a+b)/2,s=(b+c)/2,c=(c+d)/2,b=(n+s)/2,s=(s+c)/2,j=(s-b)/8;g.b=n+(a-n)/4;
h.b=b+j;g.c=h.a=(g.b+h.b)/2;h.c=x.a=(b+s)/2;x.b=s-j;q.b=c+(d-c)/4;x.c=q.a=(x.b+q.b)/2;return[g,h,x,q]};t.quadraticToCubic=function(b,c,d){return new a(b,(2*c+b)/3,(2*c+d)/3,d)};g.constructor=t;t.API=2;t._cssRegister=function(){var a=window.com.greensock.plugins.CSSPlugin;if(a){var a=a._internals,b=a._parseToProxy,c=a._setPluginRatio,d=a._specialProps,g=a.CSSPropTween;a._registerComplexSpecialProp("bezier",null,function(a,e,q,n,s,j){e instanceof Array&&(e={values:e});var j=new t,q=e.values,p=q.length-
1,v=[],y={},k,A,r;if(0>p)return s;for(k=0;k<=p;k++)r=b(a,q[k],n,s,j,p!==k),v[k]=r.end;for(A in e)y[A]=e[A];y.values=v;s=new g(a,"bezier",0,0,r.pt,2);s.data=r;s.plugin=j;s.setRatio=c;0===y.autoRotate&&(y.autoRotate=!0);y.autoRotate&&!(y.autoRotate instanceof Array)&&(k=!0===y.autoRotate?0:Number(y.autoRotate)*_DEG2RAD,y.autoRotate=null!=r.end.left?[["left","top","rotation",k,!0]]:null!=r.end.x?[["x","y","rotation",k,!0]]:!1);y.autoRotate&&(n._transform||(s=d.rotation.parse(a,0,A,n,s,j,{})),r.autoRotate=
n._transform);j._onInitTween(r.proxy,y,n._tween);return s})}};g._onInitTween=function(b,c,d){this._target=b;c instanceof Array&&(c={values:c});this._props=[];this._timeRes=null==c.timeResolution?6:parseInt(c.timeResolution);var g=c.values||[],n={},h=g[0],d=c.autoRotate||d.vars.orientToBezier,x,q,j;this._autoRotate=d?d instanceof Array?d:[["x","y","rotation",!0===d?0:Number(d)||0]]:null;for(x in h)this._props.push(x);for(h=this._props.length;-1<--h;)x=this._props[h],this._overwriteProps.push(x),d=
this._func[x]="function"===typeof b[x],n[x]=!d?parseFloat(b[x]):b[x.indexOf("set")||"function"!==typeof b["get"+x.substr(3)]?x:"get"+x.substr(3)](),j||n[x]!==g[0][x]&&(j=n);if("cubic"!==c.type&&"quadratic"!==c.type&&"soft"!==c.type)n=E(g,isNaN(c.curviness)?1:c.curviness,!1,"thruBasic"===c.type,c.correlate,j);else{d=(d=c.type)||"soft";c={};j="cubic"===d?3:2;var d="soft"===d,h=[],s,t,p,v,y,k,A,r,C;d&&n&&(g=[n].concat(g));if(null==g||g.length<j+1)throw"invalid Bezier data";for(t in g[0])h.push(t);for(k=
h.length;-1<--k;){t=h[k];c[t]=y=[];C=0;r=g.length;for(A=0;A<r;A++)s=null==n?g[A][t]:"string"===typeof(p=g[A][t])&&"="===p.charAt(1)?n[t]+Number(p.charAt(0)+p.substr(2)):Number(p),d&&1<A&&A<r-1&&(y[C++]=(s+y[C-2])/2),y[C++]=s;r=C-j+1;for(A=C=0;A<r;A+=j)s=y[A],t=y[A+1],p=y[A+2],v=2===j?0:y[A+3],y[C++]=p=3===j?new a(s,t,p,v):new a(s,(2*t+s)/3,(2*t+p)/3,p);y.length=C}n=c}this._beziers=n;this._segCount=this._beziers[x].length;if(this._timeRes){h=this._beziers;x=this._timeRes;x=x>>0||6;n=[];t=[];g=p=0;
c=x-1;j=[];d=[];for(q in h){s=h[q];y=n;k=x;A=1/k;r=s.length;for(var u=void 0,P=void 0,L=v=C=P=void 0,f=u=void 0,l=void 0,l=L=void 0;-1<--r;){L=s[r];P=L.a;C=L.d-P;v=L.c-P;L=L.b-P;P=0;for(f=1;f<=k;f++)u=A*f,l=1-u,u=P-(P=(u*u*C+3*l*(u*v+l*L))*u),l=r*k+f-1,y[l]=(y[l]||0)+u*u}}h=n.length;for(q=0;q<h;q++)p+=Math.sqrt(n[q]),s=q%x,d[s]=p,s===c&&(g+=p,s=q/x>>0,j[s]=d,t[s]=g,p=0,d=[]);this._length=g;this._lengths=t;this._segments=j;this._l1=this._li=this._s1=this._si=0;this._l2=this._lengths[0];this._curSeg=
this._segments[0];this._s2=this._curSeg[0];this._prec=1/this._curSeg.length}if(d=this._autoRotate){d[0]instanceof Array||(this._autoRotate=d=[d]);for(h=d.length;-1<--h;)for(q=0;3>q;q++)x=d[h][q],this._func[x]="function"===typeof b[x]?b[x.indexOf("set")||"function"!==typeof b["get"+x.substr(3)]?x:"get"+x.substr(3)]:!1}return!0};g.setRatio=function(a){var c=this._segCount,b=this._func,d=this._target,g,h,j,q,p;if(this._timeRes){g=this._lengths;q=this._curSeg;a*=this._length;h=this._li;if(a>this._l2&&
h<c-1){for(c-=1;h<c&&(this._l2=g[++h])<=a;);this._l1=g[h-1];this._li=h;this._curSeg=q=this._segments[h];this._s2=q[this._s1=this._si=0]}else if(a<this._l1&&0<h){for(;0<h&&(this._l1=g[--h])>=a;);0===h&&a<this._l1?this._l1=0:h++;this._l2=g[h];this._li=h;this._curSeg=q=this._segments[h];this._s1=q[(this._si=q.length-1)-1]||0;this._s2=q[this._si]}g=h;a-=this._l1;h=this._si;if(a>this._s2&&h<q.length-1){for(c=q.length-1;h<c&&(this._s2=q[++h])<=a;);this._s1=q[h-1];this._si=h}else if(a<this._s1&&0<h){for(;0<
h&&(this._s1=q[--h])>=a;);0===h&&a<this._s1?this._s1=0:h++;this._s2=q[h];this._si=h}q=(h+(a-this._s1)/(this._s2-this._s1))*this._prec}else g=0>a?0:1<=a?c-1:c*a>>0,q=(a-g*(1/c))*c;c=1-q;for(h=this._props.length;-1<--h;)if(a=this._props[h],j=this._beziers[a][g],p=(q*q*j.da+3*c*(q*j.ca+c*j.ba))*q+j.a,this._round[a]&&(p=p+(0<p?0.5:-0.5)>>0),b[a])d[a](p);else d[a]=p;if(this._autoRotate){var c=this._autoRotate,s,t,v,E,y;for(h=c.length;-1<--h;)a=c[h][2],E=c[h][3]||0,y=!0===c[h][4]?1:n,j=this._beziers[c[h][0]][g],
p=this._beziers[c[h][1]][g],s=j.a+(j.b-j.a)*q,t=j.b+(j.c-j.b)*q,s+=(t-s)*q,t+=(j.c+(j.d-j.c)*q-t)*q,j=p.a+(p.b-p.a)*q,v=p.b+(p.c-p.b)*q,j+=(v-j)*q,v+=(p.c+(p.d-p.c)*q-v)*q,p=Math.atan2(v-j,t-s)*y+E,b[a]?b[a].call(d,p):d[a]=p}};g._roundProps=function(a,c){for(var b=this._overwriteProps,d=b.length;-1<--d;)if(a[b[d]]||a.bezier||a.bezierThrough)this._round[b[d]]=c};g._kill=function(a){var c=this._props,b,d;for(b in this._beziers)if(b in a){delete this._beziers[b];delete this._func[b];for(d=c.length;-1<
--d;)c[d]===b&&c.splice(d,1)}return p.prototype._kill.call(this,a)};p.activate([t]);return t},!0);_gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(p){var t=function(){p.call(this,"css");this._overwriteProps.length=0},g,n,j,d,v={},b=t.prototype=new p("css");b.constructor=t;t.version=1.648;t.API=2;t.defaultTransformPerspective=0;b="px";t.suffixMap={top:b,right:b,bottom:b,left:b,width:b,height:b,fontSize:b,padding:b,margin:b,perspective:b};var a=/(?:\d|\-\d|\.\d|\-\.\d)+/g,
E=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,c=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,e=/[^\d\-\.]/g,i=/(?:\d|\-|\+|=|#|\.)*/g,H=/opacity *= *([^)]*)/,X=/opacity:([^;]*)/,F=/([A-Z])/g,h=/-([a-z])/gi,x=function(a,$){return $.toUpperCase()},q=/(?:Left|Right|Width)/i,B=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,s=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,O=Math.PI/180,I=180/Math.PI,D={},y=document,k=y.createElement("div"),A=t._internals={_specialProps:v},r=navigator.userAgent,
C,u,P,L,f,l,m=r.indexOf("Android"),G=y.createElement("div");L=(P=-1!==r.indexOf("Safari")&&-1===r.indexOf("Chrome")&&(-1===m||3<Number(r.substr(m+8,1))))&&6>Number(r.substr(r.indexOf("Version/")+8,1));/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(r);f=parseFloat(RegExp.$1);G.innerHTML="<a style='top:1px;opacity:.55;'>a</a>";l=(r=G.getElementsByTagName("a")[0])?/^0.55/.test(r.style.opacity):!1;var w=function(a){return H.test("string"===typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/
100:1},J="",ea="",S=function(a,$){var $=$||k,f=$.style,c,b;if(void 0!==f[a])return a;a=a.charAt(0).toUpperCase()+a.substr(1);c=["O","Moz","ms","Ms","Webkit"];for(b=5;-1<--b&&void 0===f[c[b]+a];);return 0<=b?(ea=3===b?"ms":c[b],J="-"+ea.toLowerCase()+"-",ea+a):null},ba=y.defaultView?y.defaultView.getComputedStyle:function(){},M=t.getStyle=function(a,f,c,b,d){var m;if(!l&&"opacity"===f)return w(a);!b&&a.style[f]?m=a.style[f]:(c=c||ba(a,null))?m=(a=c.getPropertyValue(f.replace(F,"-$1").toLowerCase()))||
c.length?a:c[f]:a.currentStyle&&(c=a.currentStyle,m=c[f],!m&&"backgroundPosition"===f&&(m=c[f+"X"]+" "+c[f+"Y"]));return null!=d&&(!m||"none"===m||"auto"===m||"auto auto"===m)?d:m},ca=function(a,f,c){var b={},d=a._gsOverwrittenClassNamePT,m;if(d&&!c){for(;d;)d.setRatio(0),d=d._next;a._gsOverwrittenClassNamePT=null}if(f=f||ba(a,null))if(m=f.length)for(;-1<--m;)b[f[m].replace(h,x)]=f.getPropertyValue(f[m]);else for(m in f)b[m]=f[m];else if(f=a.currentStyle||a.style)for(m in f)b[m.replace(h,x)]=f[m];
l||(b.opacity=w(a));a=fa(a,f,!1);b.rotation=a.rotation*I;b.rotationX=a.rotationX*I;b.rotationY=a.rotationY*I;b.skewX=a.skewX*I;b.scaleX=a.scaleX;b.scaleY=a.scaleY;b.scaleZ=a.scaleZ;b.x=a.x;b.y=a.y;b.z=a.z;b.filters&&delete b.filters;return b},ka=function(a,f,c,b){var d={},a=a.style,m,z,l;for(z in c)if("cssText"!==z&&"length"!==z&&isNaN(z)&&f[z]!==(m=c[z]))if(-1===z.indexOf("Origin")&&("number"===typeof m||"string"===typeof m))d[z]=(""===m||"auto"===m||"none"===m)&&"string"===typeof f[z]&&""!==f[z].replace(e,
"")?0:m,void 0!==a[z]&&(l=new ga(a,z,a[z],l));if(b)for(z in b)"className"!==z&&(d[z]=b[z]);return{difs:d,firstMPT:l}},qa={width:["Left","Right"],height:["Top","Bottom"]},ra=["marginLeft","marginRight","marginTop","marginBottom"],T=function(a,f,c,b,d){if("px"===b||!b)return c;if("auto"===b||!c)return 0;var m=q.test(f),z=a,l=k.style,e=0>c;e&&(c=-c);"%"===b&&-1!==f.indexOf("border")?m=c/100*(m?a.clientWidth:a.clientHeight):(l.cssText="border-style:solid; border-width:0; position:absolute; line-height:0;",
"%"===b||"em"===b||!z.appendChild?(z=a.parentNode||y.body,l[m?"width":"height"]=c+b):l[m?"borderLeftWidth":"borderTopWidth"]=c+b,z.appendChild(k),m=parseFloat(k[m?"offsetWidth":"offsetHeight"]),z.removeChild(k),0===m&&!d&&(m=T(a,f,c,b,!0)));return e?-m:m},ha=function(a,f){if(null==a||""===a||"auto"===a||"auto auto"===a)a="0 0";var c=a.split(" "),b=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":c[0],d=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":c[1];null==d?d="0":"center"===
d&&(d="50%");if("center"===b||isNaN(parseFloat(b)))b="50%";f&&(f.oxp=-1!==b.indexOf("%"),f.oyp=-1!==d.indexOf("%"),f.oxr="="===b.charAt(1),f.oyr="="===d.charAt(1),f.ox=parseFloat(b.replace(e,"")),f.oy=parseFloat(d.replace(e,"")));return b+" "+d+(2<c.length?" "+c[2]:"")},la=function(a,f){return"string"===typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1")*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(f)},U=function(a,f){return null==a?f:"string"===typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+
"1")*Number(a.substr(2))+f:Number(a)},Y=function(a,f){if(null==a)return f;var c=-1===a.indexOf("rad")?O:1,b="="===a.charAt(1),a=Number(a.replace(e,""))*c;return b?a+f:a},ia=function(a,f){var c=(("number"===typeof a?a*O:Y(a,f))-f)%(2*Math.PI);c!==c%Math.PI&&(c+=Math.PI*(0>c?2:-2));return f+c},Z={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,
0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ja=function(f){if(!f||""===f)return Z.black;if(Z[f])return Z[f];if("number"===typeof f)return[f>>16,f>>8&255,f&255];if("#"===f.charAt(0)){if(4===f.length)var c=f.charAt(1),b=f.charAt(2),f=f.charAt(3),f="#"+c+c+b+b+f+f;f=parseInt(f.substr(1),16);return[f>>16,f>>8&255,f&255]}f=f.match(a)||Z.transparent;f[0]=Number(f[0]);f[1]=Number(f[1]);f[2]=Number(f[2]);
3<f.length&&(f[3]=Number(f[3]));return f},V="(?:\\b(?:(?:rgb|rgba)\\(.+?\\))|\\B#.+?\\b";for(b in Z)V+="|"+b+"\\b";var V=RegExp(V+")","gi"),ma=function(f,b,d){if(null==f)return function(a){return a};var m=b?(f.match(V)||[""])[0]:"",l=f.split(m).join("").match(c)||[],k=f.substr(0,f.indexOf(l[0])),z=")"===f.charAt(f.length-1)?")":"",e=-1!==f.indexOf(" ")?" ":",",g=l.length,aa=0<g?l[0].replace(a,""):"";return b?function(a){"number"===typeof a&&(a+=aa);var f=(a.match(V)||[m])[0],a=a.split(f).join("").match(c)||
[],b=a.length;if(g>b--)for(;++b<g;)a[b]=d?a[(b-1)/2>>0]:l[b];return k+a.join(e)+e+f+z}:function(a){"number"===typeof a&&(a+=aa);var a=a.match(c)||[],f=a.length;if(g>f--)for(;++f<g;)a[f]=d?a[(f-1)/2>>0]:l[f];return k+a.join(e)+z}},r=function(a){a=a.split(",");return function(f,c,b,d,m,l,k){c=(c+"").split(" ");k={};for(b=0;4>b;b++)k[a[b]]=c[b]=c[b]||c[(b-1)/2>>0];return d.parse(f,k,m,l)}};A._setPluginRatio=function(a){this.plugin.setRatio(a);for(var f=this.data,c=f.proxy,b=f.firstMPT,d;b;)d=c[b.v],
b.r?d=0<d?d+0.5>>0:d-0.5>>0:1E-6>d&&-1E-6<d&&(d=0),b.t[b.p]=d,b=b._next;f.autoRotate&&(f.autoRotate.rotation=c.rotation);if(1===a)for(b=f.firstMPT;b;){a=b.t;if(a.type){if(1===a.type){c=a.xs0+a.s+a.xs1;for(f=1;f<a.l;f++)c+=a["xn"+f]+a["xs"+(f+1)];a.e=c}}else a.e=a.s+a.xs0;b=b._next}};var ga=function(a,f,b,c,d){this.t=a;this.p=f;this.v=b;this.r=d;c&&(c._prev=this,this._next=c)};A._parseToProxy=function(a,f,b,c,d,m){var l=c,k={},e={},g=b._transform,i=D,j;b._transform=null;D=f;c=a=b.parse(a,f,c,d);D=
i;m&&(b._transform=g,l&&(l._prev=null,l._prev&&(l._prev._next=null)));for(;c&&c!==l;){if(1>=c.type&&(g=c.p,e[g]=c.s+c.c,k[g]=c.s,m||(j=new ga(c,"s",g,j,c.r),c.c=0),1===c.type))for(b=c.l;0<--b;)i="xn"+b,g=c.p+"_"+i,e[g]=c.data[i],k[g]=c[i],m||(j=new ga(c,i,g,j,c.rxp[i]));c=c._next}return{proxy:k,end:e,firstMPT:j,pt:a}};var N=A.CSSPropTween=function(a,f,c,b,m,l,k,e,i,aa,j){this.t=a;this.p=f;this.s=c;this.c=b;this.n=k||"css_"+f;a instanceof N||d.push(this.n);this.r=e;this.type=l||0;i&&(this.pr=i,g=!0);
this.b=void 0===aa?c:aa;this.e=void 0===j?c+b:j;m&&(this._next=m,m._prev=this)},da=t.parseComplex=function(f,c,b,d,m,k,z,e,g,i){var z=new N(f,c,0,0,z,i?2:1,null,!1,e,b,d),f=b.split(", ").join(",").split(" "),c=(d+"").split(", ").join(",").split(" "),b=f.length,e=!1!==C,j,h,n,G,p;b!==c.length&&(f=(k||"").split(" "),b=f.length);z.plugin=g;z.setRatio=i;for(k=0;k<b;k++)if(g=f[k],j=c[k],(i=parseFloat(g))||0===i)z.appendXtra("",i,la(j,i),j.replace(E,""),e&&-1!==j.indexOf("px"),!0);else if(m&&("#"===g.charAt(0)||
0===g.indexOf("rgb")||Z[g]))g=ja(g),j=ja(j),(i=6<g.length+j.length)&&!l&&0===j[3]?(z["xs"+z.l]+=z.l?" transparent":"transparent",z.e=z.e.split(c[k]).join("transparent")):(z.appendXtra(i?"rgba(":"rgb(",g[0],j[0]-g[0],",",!0,!0).appendXtra("",g[1],j[1]-g[1],",",!0).appendXtra("",g[2],j[2]-g[2],i?",":")",!0),i&&(g=4>g.length?1:g[3],z.appendXtra("",g,(4>j.length?1:j[3])-g,")",!1)));else if(i=g.match(a)){n=j.match(E);if(!n||n.length!==i.length)return z;for(j=h=0;j<i.length;j++)p=i[j],G=g.indexOf(p,h),
z.appendXtra(g.substr(h,G-h),Number(p),la(n[j],p),"",e&&"px"===g.substr(G+p.length,2),0===j),h=G+p.length;z["xs"+z.l]+=g.substr(h)}else z["xs"+z.l]+=z.l?" "+g:g;if(-1!==d.indexOf("=")&&z.data){d=z.xs0+z.data.s;for(k=1;k<z.l;k++)d+=z["xs"+k]+z.data["xn"+k];z.e=d+z["xs"+k]}z.l||(z.type=-1,z.xs0=z.e);return z.xfirst||z},Q=9,b=N.prototype;for(b.l=b.pr=0;0<--Q;)b["xn"+Q]=0,b["xs"+Q]="";b.xs0="";b._next=b._prev=b.xfirst=b.data=b.plugin=b.setRatio=b.rxp=null;b.appendXtra=function(a,f,c,b,d,m){var l=this.l;
this["xs"+l]+=m&&l?" "+a:a||"";if(!c&&0!==l&&!this.plugin)return this["xs"+l]+=f+(b||""),this;this.l++;this.type=this.setRatio?2:1;this["xs"+this.l]=b||"";if(0<l)return this.data["xn"+l]=f+c,this.rxp["xn"+l]=d,this["xn"+l]=f,this.plugin||(this.xfirst=new N(this,"xn"+l,f,c,this.xfirst||this,0,this.n,d,this.pr),this.xfirst.xs0=0),this;this.data={s:f+c};this.rxp={};this.s=f;this.c=c;this.r=d;return this};var na=function(a,f,c,b,d,m,l){this.p=b?S(a)||a:a;v[a]=v[this.p]=this;this.format=m||ma(f,d);c&&
(this.parse=c);this.clrs=d;this.dflt=f;this.pr=l||0},K=A._registerComplexSpecialProp=function(a,f,c,b,d,m,l){for(var a=a.split(","),f=f instanceof Array?f:[f],k=a.length;-1<--k;)new na(a[k],f[k],c,b&&0===k,d,m,l)},A=function(a,f){v[a]||K(a,null,function(a,c,b,d,m,l,k){var e=window.com.greensock.plugins[f];if(!e)return window.console&&console.log("Error: "+f+" js file not loaded."),m;e._cssRegister();return v[b].parse(a,c,b,d,m,l,k)})},b=na.prototype;b.parseComplex=function(a,f,c,b,d,m){return da(a,
this.p,f,c,this.clrs,this.dflt,b,this.pr,d,m)};b.parse=function(a,f,c,b,d,m){return this.parseComplex(a.style,this.format(M(a,c,j,!1,this.dflt)),this.format(f),d,m)};t.registerSpecialProp=function(a,f,c){K(a,null,function(a,b,d,m,l,k){l=new N(a,d,0,0,l,2,d,!1,c);l.plugin=k;l.setRatio=f(a,b,m._tween,d);return l},!1,!1,null,c)};var oa="scaleX scaleY scaleZ x y z skewX rotation rotationX rotationY perspective".split(" "),R=S("transform"),sa=J+"transform",pa=S("transformOrigin"),W=null!==S("perspective"),
fa=function(a,f,c){var b=c?a._gsTransform||{skewY:0}:{skewY:0},d=0>b.scaleX,m=W?parseFloat(M(a,pa,f,!1,"0 0 0").split(" ")[2])||b.zOrigin||0:0,l,k,e,g,i,j,h,n;R?l=M(a,sa,f,!0):a.currentStyle&&(l=(l=a.currentStyle.filter.match(B))&&4===l.length?l[0].substr(4)+","+Number(l[2].substr(4))+","+Number(l[1].substr(4))+","+l[3].substr(4)+","+(b?b.x:0)+","+(b?b.y:0):null);k=(l||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[];for(f=k.length;-1<--f;)k[f]=Number(k[f]);if(16===k.length){if(d=k[8],l=k[9],e=k[10],g=k[12],
i=k[13],j=k[14],b.zOrigin&&(j=-b.zOrigin,g=d*j-k[12],i=l*j-k[13],j=e*j+b.zOrigin-k[14]),!c||g!==b.x||i!==b.y||j!==b.z){h=k[0];n=k[1];var G=k[2],p=k[3],q=k[4],s=k[5],w=k[6],A=k[7];k=k[11];var J=b.rotationX=Math.atan2(w,e),v,S,r,u;J&&(r=Math.cos(-J),u=Math.sin(-J),J=q*r+d*u,v=s*r+l*u,S=w*r+e*u,d=q*-u+d*r,l=s*-u+l*r,e=w*-u+e*r,k=A*-u+k*r,q=J,s=v,w=S);if(J=b.rotationY=Math.atan2(d,h))r=Math.cos(-J),u=Math.sin(-J),v=n*r-l*u,S=G*r-e*u,l=n*u+l*r,e=G*u+e*r,k=p*u+k*r,h=h*r-d*u,n=v,G=S;if(J=b.rotation=Math.atan2(n,
s))r=Math.cos(-J),u=Math.sin(-J),h=h*r+q*u,v=n*r+s*u,s=n*-u+s*r,w=G*-u+w*r,n=v;Math.abs(b.rotationY)>Math.PI/2&&(b.rotationY*=-1,b.rotationX+=Math.PI,b.rotation=Math.PI-b.rotation);b.scaleX=Math.sqrt(h*h+n*n);b.scaleY=Math.sqrt(s*s+l*l);b.scaleZ=Math.sqrt(w*w+e*e);b.skewX=0;b.perspective=k?1/k:0;b.x=g;b.y=i;b.z=j}}else if(!W||0===k.length||b.x!==k[4]||b.y!==k[5]||!b.rotationX&&!b.rotationY){g=(l=6<=k.length)?k[0]:1;j=k[1]||0;i=k[2]||0;h=l?k[3]:1;b.x=k[4]||0;b.y=k[5]||0;l=Math.sqrt(g*g+j*j);e=Math.sqrt(h*
h+i*i);g=g||j?Math.atan2(j,g):b.rotation||0;i=i||h?Math.atan2(i,h)+g:b.skewX||0;j=l-Math.abs(b.scaleX||0);h=e-Math.abs(b.scaleY||0);Math.abs(i)>Math.PI/2&&Math.abs(i)<1.5*Math.PI&&(d?(l*=-1,i+=0>=g?Math.PI:-Math.PI,g+=0>=g?Math.PI:-Math.PI):(e*=-1,i+=0>=i?Math.PI:-Math.PI));d=(g-b.rotation)%Math.PI;n=(i-b.skewX)%Math.PI;if(void 0===b.skewX||1E-6<j||-1E-6>j||1E-6<h||-1E-6>h||1E-6<d||-1E-6>d||1E-6<n||-1E-6>n)b.scaleX=l,b.scaleY=e,b.rotation=g,b.skewX=i;W&&(b.rotationX=b.rotationY=b.z=0,b.perspective=
parseFloat(t.defaultTransformPerspective)||0,b.scaleZ=1)}b.zOrigin=m;for(f in b)1E-6>b[f]&&-1E-6<b[f]&&(b[f]=0);c&&(a._gsTransform=b);return b},ta=function(a){var b=this.data,c=-b.rotation,d=c+b.skewX,l=Math.cos(c)*b.scaleX,c=Math.sin(c)*b.scaleX,m=Math.sin(d)*-b.scaleY,d=Math.cos(d)*b.scaleY,k=1E-6,e=this.t.style,g=this.t.currentStyle,j;if(g){l<k&&l>-k&&(l=0);c<k&&c>-k&&(c=0);m<k&&m>-k&&(m=0);d<k&&d>-k&&(d=0);k=c;c=-m;m=-k;k=g.filter;e.filter="";var h=this.t.offsetWidth;j=this.t.offsetHeight;var n=
"absolute"!==g.position,G="progid:DXImageTransform.Microsoft.Matrix(M11="+l+", M12="+c+", M21="+m+", M22="+d,p=b.x,q=b.y,w,r;null!=b.ox&&(w=(b.oxp?0.01*h*b.ox:b.ox)-h/2,r=(b.oyp?0.01*j*b.oy:b.oy)-j/2,p+=w-(w*l+r*c),q+=r-(w*m+r*d));if(n)w=h/2,r=j/2,G+=", Dx="+(w-(w*l+r*c)+p)+", Dy="+(r-(w*m+r*d)+q)+")";else{var u=8>f?1:-1;w=b.ieOffsetX||0;r=b.ieOffsetY||0;b.ieOffsetX=Math.round((h-((0>l?-l:l)*h+(0>c?-c:c)*j))/2+p);b.ieOffsetY=Math.round((j-((0>d?-d:d)*j+(0>m?-m:m)*h))/2+q);for(Q=0;4>Q;Q++)h=ra[Q],
j=g[h],j=-1!==j.indexOf("px")?parseFloat(j):T(this.t,h,parseFloat(j),j.replace(i,""))||0,p=j!==b[h]?2>Q?-b.ieOffsetX:-b.ieOffsetY:2>Q?w-b.ieOffsetX:r-b.ieOffsetY,e[h]=(b[h]=Math.round(j-p*(0===Q||2===Q?1:u)))+"px";G+=", sizingMethod='auto expand')"}e.filter=-1!==k.indexOf("DXImageTransform.Microsoft.Matrix(")?k.replace(s,G):G+" "+k;if(0===a||1===a)if(1===l&&0===c&&0===m&&1===d&&(!n||-1!==G.indexOf("Dx=0, Dy=0")))(!H.test(k)||100===parseFloat(RegExp.$1))&&-1===k.indexOf("gradient(")&&e.removeAttribute("filter")}},
ua=function(){var a=this.data,f=a.perspective,b=a.scaleX,c=0,d=0,k=0,l=0,m=a.scaleY,e=0,g=0,j=0,i=0,h=a.scaleZ,n=0,G=0,p=0,q=f?-1/f:0,w=a.rotation,s=a.zOrigin,r,u,t,J,v;w&&(r=Math.cos(w),w=Math.sin(w),t=m*w,c=b*-w,m*=r,b*=r,l=t);if(w=a.rotationY)r=Math.cos(w),w=Math.sin(w),J=h*-w,v=q*-w,d=b*w,e=l*w,h*=r,q*=r,b*=r,l*=r,j=J,G=v;if(w=a.rotationX)r=Math.cos(w),w=Math.sin(w),u=c*r+d*w,t=m*r+e*w,J=i*r+h*w,v=p*r+q*w,d=c*-w+d*r,e=m*-w+e*r,h=i*-w+h*r,q=p*-w+q*r,c=u,m=t,i=J,p=v;s&&(n-=s,k=d*n,g=e*n,n=h*n+s);
k+=a.x;g+=a.y;n+=a.z;1E-6>n&&-1E-6<n&&(n=0);this.t.style[R]="matrix3d("+(1E-6>b&&-1E-6<b?0:b)+","+(1E-6>l&&-1E-6<l?0:l)+","+(1E-6>j&&-1E-6<j?0:j)+","+(1E-6>G&&-1E-6<G?0:G)+","+(1E-6>c&&-1E-6<c?0:c)+","+(1E-6>m&&-1E-6<m?0:m)+","+(1E-6>i&&-1E-6<i?0:i)+","+(1E-6>p&&-1E-6<p?0:p)+","+(1E-6>d&&-1E-6<d?0:d)+","+(1E-6>e&&-1E-6<e?0:e)+","+(1E-6>h&&-1E-6<h?0:h)+","+(1E-6>q&&-1E-6<q?0:q)+","+(1E-6>k&&-1E-6<k?0:k)+","+(1E-6>g&&-1E-6<g?0:g)+","+n+","+(f?1+-n/f:1)+")"},va=function(){var a=this.data;if(!a.rotation&&
!a.skewX)this.t.style[R]="matrix("+a.scaleX+",0,0,"+a.scaleY+","+a.x+","+a.y+")";else{var f=a.rotation,b=f-a.skewX,c=Math.cos(f)*a.scaleX,f=Math.sin(f)*a.scaleX,d=Math.sin(b)*-a.scaleY,b=Math.cos(b)*a.scaleY;this.t.style[R]="matrix("+(1E-6>c&&-1E-6<c?0:c)+","+(1E-6>f&&-1E-6<f?0:f)+","+(1E-6>d&&-1E-6<d?0:d)+","+(1E-6>b&&-1E-6<b?0:b)+","+a.x+","+a.y+")"}};K("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,transformPerspective",
null,function(a,f,b,c,m,k,l){if(c._transform)return m;var f=c._transform=fa(a,j,!0),e=a.style,g=oa.length,i,h,n,w;if("string"===typeof l.transform&&R)h=e[R],e[R]=l.transform,i=fa(a,null,!1),e[R]=h;else if("object"===typeof l){h=null!=l.rotation?l.rotation:null!=l.rotationZ?l.rotationZ:f.rotation*I;i={scaleX:U(null!=l.scaleX?l.scaleX:l.scale,f.scaleX),scaleY:U(null!=l.scaleY?l.scaleY:l.scale,f.scaleY),scaleZ:U(null!=l.scaleZ?l.scaleZ:l.scale,f.scaleZ),x:U(l.x,f.x),y:U(l.y,f.y),z:U(l.z,f.z),perspective:U(l.transformPerspective,
f.perspective)};i.rotation=null!=l.shortRotation||null!=l.shortRotationZ?ia(l.shortRotation||l.shortRotationZ||0,f.rotation):"number"===typeof h?h*O:Y(h,f.rotation);W&&(i.rotationX=null!=l.shortRotationX?ia(l.shortRotationX,f.rotationX):"number"===typeof l.rotationX?l.rotationX*O:Y(l.rotationX,f.rotationX),i.rotationY=null!=l.shortRotationY?ia(l.shortRotationY,f.rotationY):"number"===typeof l.rotationY?l.rotationY*O:Y(l.rotationY,f.rotationY),1E-6>i.rotationX&&-1E-6<i.rotationX&&(i.rotationX=0),1E-6>
i.rotationY&&-1E-6<i.rotationY&&(i.rotationY=0));i.skewX=null==l.skewX?f.skewX:"number"===typeof l.skewX?l.skewX*O:Y(l.skewX,f.skewX);i.skewY=null==l.skewY?f.skewY:"number"===typeof l.skewY?l.skewY*O:Y(l.skewY,f.skewY);if(h=i.skewY-f.skewY)i.skewX+=h,i.rotation+=h;1E-6>i.skewY&&-1E-6<i.skewY&&(i.skewY=0);1E-6>i.skewX&&-1E-6<i.skewX&&(i.skewX=0);1E-6>i.rotation&&-1E-6<i.rotation&&(i.rotation=0)}w=f.z||f.rotationX||f.rotationY||i.z||i.rotationX||i.rotationY;!w&&null!=i.scale&&(i.scaleZ=1);if(R){if(P){u=
!0;if(""===e.zIndex&&(h=M(a,"zIndex",j),"auto"===h||""===h))e.zIndex=0;L&&(e.WebkitBackfaceVisibility=l.WebkitBackfaceVisibility||(w?"visible":"hidden"))}}else e.zoom=1;m=new N(a,"transform",0,0,m,2);m.setRatio=w&&W?ua:R?va:ta;m.plugin=k;m.data=f;for(d.pop();-1<--g;)if(b=oa[g],n=i[b]-f[b],1E-6<n||-1E-6>n||null!=D[b])m=new N(f,b,f[b],n,m),m.xs0=0,m.plugin=k,c._overwriteProps.push(m.n);if((n=l.transformOrigin)||W&&w&&f.zOrigin)R?(n=(n||M(a,b,j,!1,"50% 50%"))+"",b=pa,m=new N(e,b,0,0,m,-1,"css_transformOrigin"),
m.b=e[b],m.plugin=k,W?(h=f.zOrigin,n=n.split(" "),f.zOrigin=(2<n.length?parseFloat(n[2]):h)||0,m.xs0=m.e=e[b]=n[0]+" "+(n[1]||"50%")+" 0px",m=new N(f,"zOrigin",0,0,m,-1,m.n),m.b=h,m.xs0=m.e=f.zOrigin):m.xs0=m.e=e[b]=n):ha(n+"",f);return m.t===a?(m._next&&(m._next._prev=null),m._next):m},!0);K("boxShadow","0px 0px 0px 0px #999",null,!0,!0);K("borderRadius","0px",function(a,f,b,c,d){var f=this.format(f),c=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
l=a.style,m,k,e,g,i,h,w,G,p,r,q,s;G=parseFloat(a.offsetWidth);p=parseFloat(a.offsetHeight);f=f.split(" ");for(m=0;m<c.length;m++)this.p.indexOf("border")&&(c[m]=S(c[m])),g=e=M(a,c[m],j,!1,"0px"),i=k=f[m],h=parseFloat(g),q=g.substr((h+"").length),(s="="===i.charAt(1))?(w=parseInt(i.charAt(0)+"1"),i=i.substr(2),w*=parseFloat(i),r=i.substr((w+"").length-(0>w?1:0))||""):(w=parseFloat(i),r=i.substr((w+"").length)),""===r&&(r=n[b]||q),r!==q&&(g=T(a,"borderLeft",h,q),h=T(a,"borderTop",h,q),"%"===r?(g=100*
(g/G)+"%",e=100*(h/p)+"%"):"em"===r?(q=T(a,"borderLeft",1,"em"),g=g/q+"em",e=h/q+"em"):(g+="px",e=h+"px"),s&&(i=parseFloat(g)+w+r,k=parseFloat(e)+w+r)),d=da(l,c[m],g+" "+e,i+" "+k,!1,"0px",d);return d},!0,!1,ma("0px 0px 0px 0px",!1,!0));K("backgroundPosition","0 0",null,!1,!1,ha);K("backgroundSize","0 0",null,!1,!1,ha);K("perspective","0px",null,!0);K("perspectiveOrigin","50% 50%",null,!0);K("transformStyle","preserve-3d",null,!0);K("margin",null,r("marginTop,marginRight,marginBottom,marginLeft"));
K("padding",null,r("paddingTop,paddingRight,paddingBottom,paddingLeft"));K("clip","rect(0px,0px,0px,0px)");K("textShadow","0px 0px 0px #999",null,!1,!0);K("autoRound",null,function(a,f,b,c,d){return d});K("border","0px solid #000",function(a,f,b,c,d,l){return this.parseComplex(a.style,this.format(M(a,"borderTopWidth",j,!1,"0px")+" "+M(a,"borderTopStyle",j,!1,"solid")+" "+M(a,"borderTopColor",j,!1,"#000")),this.format(f),d,l)},!1,!0,function(a){var f=a.split(" ");return f[0]+" "+(f[1]||"solid")+" "+
(a.match(V)||["#000"])[0]});var wa=function(a){var f=this.t,a=this.s+this.c*a,b;100===a&&(f.removeAttribute("filter"),b=!M(this.data,"filter"));b||(this.xn1&&(f.filter=f.filter||"alpha(opacity=100)"),f.filter=-1===f.filter.indexOf("opacity")?f.filter+(" alpha(opacity="+(a>>0)+")"):f.filter.replace(H,"opacity="+(a>>0)))};K("opacity,alpha,autoAlpha","1",function(a,f,b,c,d,m){var k=parseFloat(M(a,"opacity",j,!1,"1")),f=parseFloat(f),e=a.style,g;"autoAlpha"===b&&(g=M(a,"visibility",j),1===k&&"hidden"===
g&&(k=0),d=new N(e,"visibility",0,0,d,-1,null,!1,0,0!==k?"visible":"hidden",0===f?"hidden":"visible"),d.xs0="visible",c._overwriteProps.push(d.n));l?d=new N(e,"opacity",k,f-k,d):(d=new N(e,"opacity",100*k,100*(f-k),d),d.xn1="autoAlpha"===b?1:0,e.zoom=1,d.type=2,d.b="alpha(opacity="+d.s+")",d.e="alpha(opacity="+(d.s+d.c)+")",d.data=a,d.plugin=m,d.setRatio=wa);return d});var xa=function(a){if(1===a||0===a){this.t.className=1===a?this.e:this.b;for(var a=this.data,f=this.t.style,b=f.removeProperty?"removeProperty":
"removeAttribute";a;){if(a.v)f[a.p]=a.v;else f[b](a.p.replace(F,"-$1").toLowerCase());a=a._next}}else this.t.className!==this.b&&(this.t.className=this.b)};K("className",null,function(a,f,b,c,d,l,m){var k=a.className,e=a.style.cssText,d=c._classNamePT=new N(a,b,0,0,d,2);d.setRatio=xa;d.b=k;d.e="="!==f.charAt(1)?f:"+"===f.charAt(0)?k+" "+f.substr(2):k.split(f.substr(2)).join("");c._tween._duration&&(f=ca(a,j,!0),a.className=d.e,m=ka(a,f,ca(a),m),a.className=k,d.data=m.firstMPT,a.style.cssText=e,d=
d.xfirst=c.parse(a,m.difs,d,l));return d});A("bezier","BezierPlugin");A("throwProps","ThrowPropsPlugin");b=t.prototype;b._firstPT=null;b._onInitTween=function(a,f,b){if(!a.nodeType)return!1;this._target=a;this._tween=b;C=f.autoRound;g=!1;n=f.suffixMap||t.suffixMap;j=ba(a,"");d=this._overwriteProps;var b=a.style,c,m,k;if(u&&""===b.zIndex&&(c=M(a,"zIndex",j),"auto"===c||""===c))b.zIndex=0;"string"===typeof f&&(m=b.cssText,c=ca(a,j),b.cssText=m+";"+f,c=ka(a,c,ca(a)).difs,!l&&X.test(f)&&(c.opacity=parseFloat(RegExp.$1)),
f=c,b.cssText=m);this._firstPT=a=this.parse(a,f,null);if(g){for(;a;){b=a._next;for(f=m;f&&f.pr>a.pr;)f=f._next;(a._prev=f?f._prev:k)?a._prev._next=a:m=a;(a._next=f)?f._prev=a:k=a;a=b}this._firstPT=m}return!0};b.parse=function(a,f,b,c){var d=a.style,m,l,k,e,g,i,h,w;for(m in f){g=f[m];if(l=v[m])b=l.parse(a,g,m,this,b,c,f);else if(l=M(a,m,j)+"",h="string"===typeof g,"color"===m||"fill"===m||"stroke"===m||-1!==m.indexOf("Color")||h&&!g.indexOf("rgb"))h||(g=ja(g),g=(3<g.length?"rgba(":"rgb(")+g.join(",")+
")"),b=da(d,m,l,g,!0,"transparent",b,0,c);else if(h&&(-1!==g.indexOf(" ")||-1!==g.indexOf(",")))b=da(d,m,l,g,!0,null,b,0,c);else{k=parseFloat(l);i=l.substr((k+"").length);if(""===l||"auto"===l)if("width"===m||"height"===m){k=a;w=m;e=j;i=parseFloat("width"===w?k.offsetWidth:k.offsetHeight);w=qa[w];var G=w.length;for(e=e||ba(k,null);-1<--G;)i-=parseFloat(M(k,"padding"+w[G],e,!0))||0,i-=parseFloat(M(k,"border"+w[G]+"Width",e,!0))||0;k=i;i="px"}else k="opacity"!==m?0:1,i="";(w=h&&"="===g.charAt(1))?(e=
parseInt(g.charAt(0)+"1"),g=g.substr(2),e*=parseFloat(g),h=g.substr((e+"").length-(0>e?1:0))||""):(e=parseFloat(g),h=h?g.substr((e+"").length)||"":"");""===h&&(h=n[m]||i);g=e||0===e?(w?e+k:e)+h:f[m];if(i!==h&&""!==h&&(e||0===e))if(k||0===k)if(k=T(a,m,k,i),"%"===h?(k/=T(a,m,100,"%")/100,100<k&&(k=100)):"em"===h?k/=T(a,m,1,"em"):(e=T(a,m,e,h),h="px"),w&&(e||0===e))g=e+k+h;w&&(e+=k);(k||0===k)&&(e||0===e)?(b=new N(d,m,k,e-k,b,0,"css_"+m,!1!==C&&("px"===h||"zIndex"===m),0,l,g),b.xs0=h):(b=new N(d,m,e||
k||0,0,b,-1,"css_"+m,!1,0,l,g),b.xs0="display"===m&&"none"===g?l:g)}c&&(b&&!b.plugin)&&(b.plugin=c)}return b};b.setRatio=function(a){var f=this._firstPT,b,c;if(1===a&&(this._tween._time===this._tween._duration||0===this._tween._time))for(;f;)2!==f.type?f.t[f.p]=f.e:f.setRatio(a),f=f._next;else if(a||!(this._tween._time===this._tween._duration||0===this._tween._time)||-1E-6===this._tween._rawPrevTime)for(;f;){b=f.c*a+f.s;f.r?b=0<b?b+0.5>>0:b-0.5>>0:1E-6>b&&-1E-6<b&&(b=0);if(f.type)if(1===f.type)if(c=
f.l,2===c)f.t[f.p]=f.xs0+b+f.xs1+f.xn1+f.xs2;else if(3===c)f.t[f.p]=f.xs0+b+f.xs1+f.xn1+f.xs2+f.xn2+f.xs3;else if(4===c)f.t[f.p]=f.xs0+b+f.xs1+f.xn1+f.xs2+f.xn2+f.xs3+f.xn3+f.xs4;else if(5===c)f.t[f.p]=f.xs0+b+f.xs1+f.xn1+f.xs2+f.xn2+f.xs3+f.xn3+f.xs4+f.xn4+f.xs5;else{b=f.xs0+b+f.xs1;for(c=1;c<f.l;c++)b+=f["xn"+c]+f["xs"+(c+1)];f.t[f.p]=b}else-1===f.type?f.t[f.p]=f.xs0:f.setRatio&&f.setRatio(a);else f.t[f.p]=b+f.xs0;f=f._next}else for(;f;)2!==f.type?f.t[f.p]=f.b:f.setRatio(a),f=f._next};b._linkCSSP=
function(a,f,b){a&&(f&&(f._prev=a),a._next&&(a._next._prev=a._prev),b&&(b._next=a),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next),a._next=f,a._prev=b);return a};b._kill=function(a){var f=a,b=!1,c,d;if(a.css_autoAlpha||a.css_alpha){f={};for(d in a)f[d]=a[d];f.css_opacity=1;f.css_autoAlpha&&(f.css_visibility=1)}if(a.css_className&&(c=this._classNamePT))(a=c.xfirst)&&a._prev?this._linkCSSP(a._prev,c._next,a._prev._prev):a===this._firstPT&&(this._firstPT=null),c._next&&this._linkCSSP(c._next,
c._next._next,a._prev),this._target._gsOverwrittenClassNamePT=this._linkCSSP(c,this._target._gsOverwrittenClassNamePT),this._classNamePT=null,b=!0;return p.prototype._kill.call(this,f)||b};p.activate([t]);return t},!0);_gsDefine("plugins.RoundPropsPlugin",["plugins.TweenPlugin"],function(p){var t=function(){p.call(this,"roundProps",-1);this._overwriteProps.length=0},g=t.prototype=new p("roundProps",-1);g.constructor=t;t.API=2;g._onInitTween=function(g,j,d){this._tween=d;return!0};g._onInitAllProps=
function(){for(var g=this._tween,j=g.vars.roundProps instanceof Array?g.vars.roundProps:g.vars.roundProps.split(","),d=j.length,p={},b=g._propLookup.roundProps,a,t,c;-1<--d;)p[j[d]]=1;for(d=j.length;-1<--d;){a=j[d];for(t=g._firstPT;t;)c=t._next,t.pg?t.t._roundProps(p,!0):t.n===a&&(this._add(t.t,a,t.s,t.c),c&&(c._prev=t._prev),t._prev?t._prev._next=c:g._firstPT===t&&(g._firstPT=c),t._next=t._prev=null,g._propLookup[a]=b),t=c}return!1};g._add=function(g,j,d,p){this._addTween(g,j,d,d+p,j,!0);this._overwriteProps.push(j)};
p.activate([t]);return t},!0);_gsDefine("easing.Back",["easing.Ease"],function(p){var t=window.com.greensock._class,g=function(a,b){var c=t("easing."+a,function(){},!0),d=c.prototype=new p;d.constructor=c;d.getRatio=b;return c},n=function(a,b){var c=t("easing."+a,function(a){this._p1=a||0===a?a:1.70158;this._p2=1.525*this._p1},!0),d=c.prototype=new p;d.constructor=c;d.getRatio=b;d.config=function(a){return new c(a)};return c},j=n("BackOut",function(a){return(a-=1)*a*((this._p1+1)*a+this._p1)+1}),
d=n("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),n=n("BackInOut",function(a){return 1>(a*=2)?0.5*a*a*((this._p2+1)*a-this._p2):0.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)}),v=g("BounceOut",function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375}),b=g("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:a<2/2.75?1-(7.5625*(a-=1.5/2.75)*a+0.75):a<2.5/2.75?1-(7.5625*(a-=2.25/2.75)*a+0.9375):
1-(7.5625*(a-=2.625/2.75)*a+0.984375)}),a=g("BounceInOut",function(a){var b=0.5>a,a=b?1-2*a:2*a-1,a=a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375;return b?0.5*(1-a):0.5*a+0.5}),E=g("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),c=g("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),e=g("CircInOut",function(a){return 1>(a*=2)?-0.5*(Math.sqrt(1-a*a)-1):0.5*(Math.sqrt(1-(a-=2)*a)+1)}),i=2*Math.PI,H=function(a,
b,c){var d=t("easing."+a,function(a,b){this._p1=a||1;this._p2=b||c;this._p3=this._p2/i*(Math.asin(1/this._p1)||0)},!0),a=d.prototype=new p;a.constructor=d;a.getRatio=b;a.config=function(a,b){return new d(a,b)};return d},X=H("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*i/this._p2)+1},0.3),F=H("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*i/this._p2))},0.3),H=H("ElasticInOut",function(a){return 1>(a*=2)?-0.5*this._p1*Math.pow(2,
10*(a-=1))*Math.sin((a-this._p3)*i/this._p2):0.5*this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*i/this._p2)+1},0.45),h=g("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),x=g("ExpoIn",function(a){return Math.pow(2,10*(a-1))-0.001}),q=g("ExpoInOut",function(a){return 1>(a*=2)?0.5*Math.pow(2,10*(a-1)):0.5*(2-Math.pow(2,-10*(a-1)))}),B=Math.PI/2,s=g("SineOut",function(a){return Math.sin(a*B)}),O=g("SineIn",function(a){return-Math.cos(a*B)+1}),g=g("SineInOut",function(a){return-0.5*(Math.cos(Math.PI*
a)-1)}),I=t("easing.SlowMo",function(a,b,c){null==a?a=0.7:1<a&&(a=1);this._p=1!=a?b||0===b?b:0.7:0;this._p1=(1-a)/2;this._p2=a;this._p3=this._p1+this._p2;this._calcEnd=!0===c},!0),D=I.prototype=new p;D.constructor=I;D.getRatio=function(a){var b=a+(0.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b};I.ease=new I(0.7,0.7);D.config=I.config=function(a,
b,c){return new I(a,b,c)};var y=t("easing.SteppedEase",function(a){a=a||1;this._p1=1/a;this._p2=a+1},!0),D=y.prototype=new p;D.constructor=y;D.getRatio=function(a){0>a?a=0:1<=a&&(a=0.999999999);return(this._p2*a>>0)*this._p1};D.config=y.config=function(a){return new y(a)};t("easing.Bounce",{easeOut:new v,easeIn:new b,easeInOut:new a},!0);t("easing.Circ",{easeOut:new E,easeIn:new c,easeInOut:new e},!0);t("easing.Elastic",{easeOut:new X,easeIn:new F,easeInOut:new H},!0);t("easing.Expo",{easeOut:new h,
easeIn:new x,easeInOut:new q},!0);t("easing.Sine",{easeOut:new s,easeIn:new O,easeInOut:new g},!0);return{easeOut:new j,easeIn:new d,easeInOut:new n}},!0)});
(function(p){var t=function(a){var a=a.split("."),b=p,c;for(c=0;c<a.length;c++)b[a[c]]=b=b[a[c]]||{};return b},g=t("com.greensock"),n,j,d,v,b,a={},E=function(f,b,c,d){this.sc=a[f]?a[f].sc:[];a[f]=this;this.gsClass=null;this.def=c;var e=b||[],g=[];this.check=function(b){for(var l=e.length,i=0,h;-1<--l;)(h=a[e[l]]||new E(e[l])).gsClass?g[l]=h.gsClass:(i++,b&&h.sc.push(this));if(0===i&&c){var b=("com.greensock."+f).split("."),l=b.pop(),j=t(b.join("."))[l]=this.gsClass=c.apply(c,g);d&&((p.GreenSockGlobals||
p)[l]=j,"function"===typeof define&&define.amd?define((p.GreenSockAMDPath?p.GreenSockAMDPath+"/":"")+f.split(".").join("/"),[],function(){return j}):"undefined"!==typeof module&&module.exports&&(module.exports=j));for(l=0;l<this.sc.length;l++)this.sc[l].check(!1)}};this.check(!0)},c=g._class=function(a,b,c){b=b||function(){};new E(a,[],function(){return b},c);return b};p._gsDefine=function(a,b,c,d){return new E(a,b,c,d)};var e=[0,0,1,1],i=[],H=c("easing.Ease",function(a,b,c,d){this._func=a;this._type=
c||0;this._power=d||0;this._params=b?e.concat(b):e},!0);d=H.prototype;d._calcEnd=!1;d.getRatio=function(a){if(this._func)return this._params[0]=a,this._func.apply(null,this._params);var b=this._type,c=this._power,d=1===b?1-a:2===b?a:0.5>a?2*a:2*(1-a);1===c?d*=d:2===c?d*=d*d:3===c?d*=d*d*d:4===c&&(d*=d*d*d*d);return 1===b?1-d:2===b?d:0.5>a?d/2:1-d/2};n=["Linear","Quad","Cubic","Quart","Quint"];for(j=n.length;-1<--j;)d=c("easing."+n[j],null,!0),v=c("easing.Power"+j,null,!0),d.easeOut=v.easeOut=new H(null,
null,1,j),d.easeIn=v.easeIn=new H(null,null,2,j),d.easeInOut=v.easeInOut=new H(null,null,3,j);c("easing.Strong",g.easing.Power4,!0);g.easing.Linear.easeNone=g.easing.Linear.easeIn;var X=c("events.EventDispatcher",function(a){this._listeners={};this._eventTarget=a||this});d=X.prototype;d.addEventListener=function(a,b,c,d,e){var e=e||0,g=this._listeners[a],i=0,h;null==g&&(this._listeners[a]=g=[]);for(h=g.length;-1<--h;)a=g[h],a.c===b?g.splice(h,1):0===i&&a.pr<e&&(i=h+1);g.splice(i,0,{c:b,s:c,up:d,pr:e})};
d.removeEventListener=function(a,b){var c=this._listeners[a],d;if(c)for(d=c.length;-1<--d;)if(c[d].c===b){c.splice(d,1);break}};d.dispatchEvent=function(a){var b=this._listeners[a];if(b)for(var c=b.length,d=this._eventTarget,e;-1<--c;)e=b[c],e.up?e.c.call(e.s||d,{type:a,target:d}):e.c.call(e.s||d)};var F=p.requestAnimationFrame,h=p.cancelAnimationFrame,x=Date.now||function(){return(new Date).getTime()};n=["ms","moz","webkit","o"];for(j=n.length;-1<--j&&!F;)F=p[n[j]+"RequestAnimationFrame"],h=p[n[j]+
"CancelAnimationFrame"]||p[n[j]+"CancelRequestAnimationFrame"];c("Ticker",function(a,b){var c=this,d=x(),e=!1!==b&&F,g,i,j,k,n,q=function(){null!=j&&(!e||!h?p.clearTimeout(j):h(j),j=null)},r=function(a){c.time=(x()-d)/1E3;if(!g||c.time>=n||a)c.frame++,n=c.time>n?c.time+k-(c.time-n):c.time+k-0.001,n<c.time+0.001&&(n=c.time+0.001),c.dispatchEvent("tick");!0!==a&&(j=i(r))};X.call(c);this.time=this.frame=0;this.tick=function(){r(!0)};this.fps=function(a){if(!arguments.length)return g;g=a;k=1/(g||60);
n=this.time+k;i=0===g?function(){}:!e||!F?function(a){return p.setTimeout(a,1E3*(n-c.time)+1>>0||1)}:F;q();j=i(r)};this.useRAF=function(a){if(!arguments.length)return e;q();e=a;c.fps(g)};c.fps(a);p.setTimeout(function(){e&&!j&&c.useRAF(!1)},1E3)});d=g.Ticker.prototype=new g.events.EventDispatcher;d.constructor=g.Ticker;var q=c("core.Animation",function(a,c){this.vars=c||{};this._duration=this._totalDuration=a||0;this._delay=Number(this.vars.delay)||0;this._timeScale=1;this._active=!0===this.vars.immediateRender;
this.data=this.vars.data;this._reversed=!0===this.vars.reversed;if(r){b||(B.tick(),b=!0);var d=this.vars.useFrames?A:r;d.insert(this,d._time);this.vars.paused&&this.paused(!0)}}),B=q.ticker=new g.Ticker;d=q.prototype;d._dirty=d._gc=d._initted=d._paused=!1;d._totalTime=d._time=0;d._rawPrevTime=-1;d._next=d._last=d._onUpdate=d._timeline=d.timeline=null;d._paused=!1;d.play=function(a,b){arguments.length&&this.seek(a,b);this.reversed(!1);return this.paused(!1)};d.pause=function(a,b){arguments.length&&
this.seek(a,b);return this.paused(!0)};d.resume=function(a,b){arguments.length&&this.seek(a,b);return this.paused(!1)};d.seek=function(a,b){return this.totalTime(Number(a),!1!=b)};d.restart=function(a,b){this.reversed(!1);this.paused(!1);return this.totalTime(a?-this._delay:0,!1!==b)};d.reverse=function(a,b){arguments.length&&this.seek(a||this.totalDuration(),b);this.reversed(!0);return this.paused(!1)};d.render=function(){};d.invalidate=function(){return this};d._enabled=function(a,b){this._gc=!a;
this._active=a&&!this._paused&&0<this._totalTime&&this._totalTime<this._totalDuration;!0!==b&&(a&&null==this.timeline?this._timeline.insert(this,this._startTime-this._delay):!a&&null!=this.timeline&&this._timeline._remove(this,!0));return!1};d._kill=function(){return this._enabled(!1,!1)};d.kill=function(a,b){this._kill(a,b);return this};d._uncache=function(a){for(a=a?this:this.timeline;a;)a._dirty=!0,a=a.timeline;return this};d.eventCallback=function(a,b,c,d){if(null==a)return null;if("on"===a.substr(0,
2)){if(1===arguments.length)return this.vars[a];if(null==b)delete this.vars[a];else if(this.vars[a]=b,this.vars[a+"Params"]=c,this.vars[a+"Scope"]=d,c)for(var e=c.length;-1<--e;)"{self}"===c[e]&&(c=this.vars[a+"Params"]=c.concat(),c[e]=this);"onUpdate"===a&&(this._onUpdate=b)}return this};d.delay=function(a){if(!arguments.length)return this._delay;this._timeline.smoothChildTiming&&this.startTime(this._startTime+a-this._delay);this._delay=a;return this};d.duration=function(a){if(!arguments.length)return this._dirty=
!1,this._duration;this._duration=this._totalDuration=a;this._uncache(!0);this._timeline.smoothChildTiming&&0<this._time&&this._time<this._duration&&0!==a&&this.totalTime(this._totalTime*(a/this._duration),!0);return this};d.totalDuration=function(a){this._dirty=!1;return!arguments.length?this._totalDuration:this.duration(a)};d.time=function(a,b){if(!arguments.length)return this._time;this._dirty&&this.totalDuration();a>this._duration&&(a=this._duration);return this.totalTime(a,b)};d.totalTime=function(a,
b){if(!arguments.length)return this._totalTime;if(this._timeline){0>a&&(a+=this.totalDuration());if(this._timeline.smoothChildTiming&&(this._dirty&&this.totalDuration(),a>this._totalDuration&&(a=this._totalDuration),this._startTime=(this._paused?this._pauseTime:this._timeline._time)-(!this._reversed?a:this._totalDuration-a)/this._timeScale,this._timeline._dirty||this._uncache(!1),!this._timeline._active))for(var c=this._timeline;c._timeline;)c.totalTime(c._totalTime,!0),c=c._timeline;this._gc&&this._enabled(!0,
!1);this._totalTime!==a&&this.render(a,b,!1)}return this};d.startTime=function(a){if(!arguments.length)return this._startTime;a!=this._startTime&&(this._startTime=a,this.timeline&&this.timeline._sortChildren&&this.timeline.insert(this,a-this._delay));return this};d.timeScale=function(a){if(!arguments.length)return this._timeScale;a=a||1E-6;if(this._timeline&&this._timeline.smoothChildTiming){var b=this._pauseTime||0===this._pauseTime?this._pauseTime:this._timeline._totalTime;this._startTime=b-(b-
this._startTime)*this._timeScale/a}this._timeScale=a;return this._uncache(!1)};d.reversed=function(a){if(!arguments.length)return this._reversed;a!==this._reversed&&(this._reversed=a,this.totalTime(this._totalTime,!0));return this};d.paused=function(a){if(!arguments.length)return this._paused;a!==this._paused&&this._timeline&&(!a&&this._timeline.smoothChildTiming&&(this._startTime+=this._timeline.rawTime()-this._pauseTime,this._uncache(!1)),this._pauseTime=a?this._timeline.rawTime():null,this._paused=
a,this._active=!this._paused&&0<this._totalTime&&this._totalTime<this._totalDuration);this._gc&&(a||this._enabled(!0,!1));return this};g=c("core.SimpleTimeline",function(a){q.call(this,0,a);this.autoRemoveChildren=this.smoothChildTiming=!0});d=g.prototype=new q;d.constructor=g;d.kill()._gc=!1;d._first=d._last=null;d._sortChildren=!1;d.insert=function(a,b){a._startTime=Number(b||0)+a._delay;a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime+(this.rawTime()-a._startTime)/a._timeScale);a.timeline&&
a.timeline._remove(a,!0);a.timeline=a._timeline=this;a._gc&&a._enabled(!0,!0);var c=this._last;if(this._sortChildren)for(var d=a._startTime;c&&c._startTime>d;)c=c._prev;c?(a._next=c._next,c._next=a):(a._next=this._first,this._first=a);a._next?a._next._prev=a:this._last=a;a._prev=c;this._timeline&&this._uncache(!0);return this};d._remove=function(a,b){a.timeline===this&&(b||a._enabled(!1,!0),a.timeline=null,a._prev?a._prev._next=a._next:this._first===a&&(this._first=a._next),a._next?a._next._prev=
a._prev:this._last===a&&(this._last=a._prev),this._timeline&&this._uncache(!0));return this};d.render=function(a,b){var c=this._first,d;for(this._totalTime=this._time=this._rawPrevTime=a;c;){d=c._next;if(c._active||a>=c._startTime&&!c._paused)c._reversed?c.render((!c._dirty?c._totalDuration:c.totalDuration())-(a-c._startTime)*c._timeScale,b,!1):c.render((a-c._startTime)*c._timeScale,b,!1);c=d}};d.rawTime=function(){return this._totalTime};var s=c("TweenLite",function(a,b,c){q.call(this,b,c);if(null==
a)throw"Cannot tween an undefined reference.";this.target=a;this._overwrite=null==this.vars.overwrite?k[s.defaultOverwrite]:"number"===typeof this.vars.overwrite?this.vars.overwrite>>0:k[this.vars.overwrite];if((a instanceof Array||a.jquery)&&"object"===typeof a[0]){this._targets=a.slice(0);this._propLookup=[];this._siblings=[];for(a=0;a<this._targets.length;a++)c=this._targets[a],c.jquery?(this._targets.splice(a--,1),this._targets=this._targets.concat(c.constructor.makeArray(c))):(this._siblings[a]=
C(c,this,!1),1===this._overwrite&&1<this._siblings[a].length&&u(c,this,null,1,this._siblings[a]))}else this._propLookup={},this._siblings=C(a,this,!1),1===this._overwrite&&1<this._siblings.length&&u(a,this,null,1,this._siblings);(this.vars.immediateRender||0===b&&0===this._delay&&!1!==this.vars.immediateRender)&&this.render(-this._delay,!1,!0)},!0);d=s.prototype=new q;d.constructor=s;d.kill()._gc=!1;d.ratio=0;d._firstPT=d._targets=d._overwrittenProps=null;d._notifyPluginsOfEnabled=!1;s.version=1.642;
s.defaultEase=d._ease=new H(null,null,1,1);s.defaultOverwrite="auto";s.ticker=B;var O=s._plugins={},I=s._tweenLookup={},D=0,y={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,orientToBezier:1,immediateRender:1,repeat:1,
repeatDelay:1,data:1,paused:1,reversed:1},k={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},A=q._rootFramesTimeline=new g,r=q._rootTimeline=new g;r._startTime=B.time;A._startTime=B.frame;r._active=A._active=!0;q._updateRoot=function(){r.render((B.time-r._startTime)*r._timeScale,!1,!1);A.render((B.frame-A._startTime)*A._timeScale,!1,!1);if(!(B.frame%120)){var a,b,c;for(c in I){b=I[c].tweens;for(a=b.length;-1<--a;)b[a]._gc&&b.splice(a,1);0===b.length&&delete I[c]}}};
B.addEventListener("tick",q._updateRoot);var C=function(a,b,c){var d=a._gsTweenID,e;if(!I[d||(a._gsTweenID=d="t"+D++)])I[d]={target:a,tweens:[]};if(b&&(a=I[d].tweens,a[e=a.length]=b,c))for(;-1<--e;)a[e]===b&&a.splice(e,1);return I[d].tweens},u=function(a,b,c,d,e){var g,i,h;if(1===d||4<=d){a=e.length;for(g=0;g<a;g++)if((h=e[g])!==b)h._gc||h._enabled(!1,!1)&&(i=!0);else if(5===d)break;return i}var j=b._startTime+1E-10,k=[],n=0,p=0===b._duration,q;for(g=e.length;-1<--g;)if(!((h=e[g])===b||h._gc||h._paused))h._timeline!==
b._timeline?(q=q||P(b,0,p),0===P(h,q,p)&&(k[n++]=h)):h._startTime<=j&&h._startTime+h.totalDuration()/h._timeScale+1E-10>j&&((p||!h._initted)&&2E-10>=j-h._startTime||(k[n++]=h));for(g=n;-1<--g;)if(h=k[g],2===d&&h._kill(c,a)&&(i=!0),2!==d||!h._firstPT&&h._initted)h._enabled(!1,!1)&&(i=!0);return i},P=function(a,b,c){for(var d=a._timeline,e=d._timeScale,g=a._startTime;d._timeline;){g+=d._startTime;e*=d._timeScale;if(d._paused)return-100;d=d._timeline}g/=e;return g>b?g-b:c&&g===b||!a._initted&&2E-10>
g-b?1E-10:(g+=a.totalDuration()/a._timeScale/e)>b?0:g-b-1E-10};d._init=function(){this.vars.startAt&&(this.vars.startAt.overwrite=0,this.vars.startAt.immediateRender=!0,s.to(this.target,0,this.vars.startAt));var a,b;this._ease=this.vars.ease instanceof H?this.vars.easeParams instanceof Array?this.vars.ease.config.apply(this.vars.ease,this.vars.easeParams):this.vars.ease:"function"===typeof this.vars.ease?new H(this.vars.ease,this.vars.easeParams):s.defaultEase;this._easeType=this._ease._type;this._easePower=
this._ease._power;this._firstPT=null;if(this._targets)for(a=this._targets.length;-1<--a;){if(this._initProps(this._targets[a],this._propLookup[a]={},this._siblings[a],this._overwrittenProps?this._overwrittenProps[a]:null))b=!0}else b=this._initProps(this.target,this._propLookup,this._siblings,this._overwrittenProps);b&&s._onPluginEvent("_onInitAllProps",this);this._overwrittenProps&&null==this._firstPT&&"function"!==typeof this.target&&this._enabled(!1,!1);if(this.vars.runBackwards)for(a=this._firstPT;a;)a.s+=
a.c,a.c=-a.c,a=a._next;this._onUpdate=this.vars.onUpdate;this._initted=!0};d._initProps=function(a,b,c,d){var e,g,i,h,j,k;if(null==a)return!1;for(e in this.vars){if(y[e]){if("onStartParams"===e||"onUpdateParams"===e||"onCompleteParams"===e||"onReverseCompleteParams"===e||"onRepeatParams"===e)if(j=this.vars[e])for(g=j.length;-1<--g;)"{self}"===j[g]&&(j=this.vars[e]=j.concat(),j[g]=this)}else if(O[e]&&(h=new O[e])._onInitTween(a,this.vars[e],this)){this._firstPT=k={_next:this._firstPT,t:h,p:"setRatio",
s:0,c:1,f:!0,n:e,pg:!0,pr:h._priority};for(g=h._overwriteProps.length;-1<--g;)b[h._overwriteProps[g]]=this._firstPT;if(h._priority||h._onInitAllProps)i=!0;if(h._onDisable||h._onEnable)this._notifyPluginsOfEnabled=!0}else this._firstPT=b[e]=k={_next:this._firstPT,t:a,p:e,f:"function"===typeof a[e],n:e,pg:!1,pr:0},k.s=!k.f?parseFloat(a[e]):a[e.indexOf("set")||"function"!==typeof a["get"+e.substr(3)]?e:"get"+e.substr(3)](),g=this.vars[e],k.c="number"===typeof g?g-k.s:"string"===typeof g&&"="===g.charAt(1)?
parseInt(g.charAt(0)+"1")*Number(g.substr(2)):Number(g)||0;k&&k._next&&(k._next._prev=k)}return d&&this._kill(d,a)?this._initProps(a,b,c,d):1<this._overwrite&&this._firstPT&&1<c.length&&u(a,this,b,this._overwrite,c)?(this._kill(b,a),this._initProps(a,b,c,d)):i};d.render=function(a,b,c){var d=this._time,e,g;if(a>=this._duration){if(this._totalTime=this._time=this._duration,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(e=!0,g="onComplete"),0===this._duration){if(0===a||0>
this._rawPrevTime)this._rawPrevTime!==a&&(c=!0);this._rawPrevTime=a}}else if(0>=a){this._totalTime=this._time=0;this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0;if(0!==d||0===this._duration&&0<this._rawPrevTime)g="onReverseComplete",e=this._reversed;0>a?(this._active=!1,0===this._duration&&(0<=this._rawPrevTime&&(c=!0),this._rawPrevTime=a)):this._initted||(c=!0)}else if(this._totalTime=this._time=a,this._easeType){var h=a/this._duration,j=this._easeType,k=this._easePower;if(1===j||3===j&&0.5<=
h)h=1-h;3===j&&(h*=2);1===k?h*=h:2===k?h*=h*h:3===k?h*=h*h*h:4===k&&(h*=h*h*h*h);this.ratio=1===j?1-h:2===j?h:0.5>a/this._duration?h/2:1-h/2}else this.ratio=this._ease.getRatio(a/this._duration);if(this._time!==d||c){this._initted||(this._init(),!e&&this._time&&(this.ratio=this._ease.getRatio(this._time/this._duration)));!this._active&&!this._paused&&(this._active=!0);if(0===d&&this.vars.onStart&&(0!==this._time||0===this._duration))b||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||
i);for(a=this._firstPT;a;){if(a.f)a.t[a.p](a.c*this.ratio+a.s);else a.t[a.p]=a.c*this.ratio+a.s;a=a._next}this._onUpdate&&(b||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||i));g&&!this._gc&&(e&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),b||this.vars[g]&&this.vars[g].apply(this.vars[g+"Scope"]||this,this.vars[g+"Params"]||i))}};d._kill=function(a,b){"all"===a&&(a=null);if(null==a&&(null==b||b==this.target))return this._enabled(!1,!1);var b=
b||this._targets||this.target,c,d,e,g,h,i,j;if((b instanceof Array||b.jquery)&&"object"===typeof b[0])for(c=b.length;-1<--c;)this._kill(a,b[c])&&(h=!0);else{if(this._targets)for(c=this._targets.length;-1<--c;){if(b===this._targets[c]){g=this._propLookup[c]||{};this._overwrittenProps=this._overwrittenProps||[];d=this._overwrittenProps[c]=a?this._overwrittenProps[c]||{}:"all";break}}else{if(b!==this.target)return!1;g=this._propLookup;d=this._overwrittenProps=a?this._overwrittenProps||{}:"all"}if(g)for(e in i=
a||g,j=a!=d&&"all"!=d&&a!=g&&(null==a||!0!=a._tempKill),i){if(c=g[e]){c.pg&&c.t._kill(i)&&(h=!0);if(!c.pg||0===c.t._overwriteProps.length)c._prev?c._prev._next=c._next:c===this._firstPT&&(this._firstPT=c._next),c._next&&(c._next._prev=c._prev),c._next=c._prev=null;delete g[e]}j&&(d[e]=1)}}return h};d.invalidate=function(){this._notifyPluginsOfEnabled&&s._onPluginEvent("_onDisable",this);this._onUpdate=this._overwrittenProps=this._firstPT=null;this._initted=this._active=this._notifyPluginsOfEnabled=
!1;this._propLookup=this._targets?{}:[];return this};d._enabled=function(a,b){if(a&&this._gc)if(this._targets)for(var c=this._targets.length;-1<--c;)this._siblings[c]=C(this._targets[c],this,!0);else this._siblings=C(this.target,this,!0);q.prototype._enabled.call(this,a,b);return this._notifyPluginsOfEnabled&&this._firstPT?s._onPluginEvent(a?"_onEnable":"_onDisable",this):!1};s.to=function(a,b,c){return new s(a,b,c)};s.from=function(a,b,c){c.runBackwards=!0;!1!=c.immediateRender&&(c.immediateRender=
!0);return new s(a,b,c)};s.fromTo=function(a,b,c,d){d.startAt=c;c.immediateRender&&(d.immediateRender=!0);return new s(a,b,d)};s.delayedCall=function(a,b,c,d,e){return new s(b,0,{delay:a,onComplete:b,onCompleteParams:c,onCompleteScope:d,onReverseComplete:b,onReverseCompleteParams:c,onReverseCompleteScope:d,immediateRender:!1,useFrames:e,overwrite:0})};s.set=function(a,b){return new s(a,0,b)};s.killTweensOf=s.killDelayedCallsTo=function(a,b){for(var c=s.getTweensOf(a),d=c.length;-1<--d;)c[d]._kill(b,
a)};s.getTweensOf=function(a){if(null!=a){var b,c,d;if((a instanceof Array||a.jquery)&&"object"===typeof a[0]){b=a.length;for(c=[];-1<--b;)c=c.concat(s.getTweensOf(a[b]));for(b=c.length;-1<--b;){d=c[b];for(a=b;-1<--a;)d===c[a]&&c.splice(b,1)}}else{c=C(a).concat();for(b=c.length;-1<--b;)c[b]._gc&&c.splice(b,1)}return c}};var L=c("plugins.TweenPlugin",function(a,b){this._overwriteProps=(a||"").split(",");this._propName=this._overwriteProps[0];this._priority=b||0},!0);d=L.prototype;L.version=12;L.API=
2;d._firstPT=null;d._addTween=function(a,b,c,d,e,g){var h;if(null!=d&&(h="number"===typeof d||"="!==d.charAt(1)?Number(d)-c:parseInt(d.charAt(0)+"1")*Number(d.substr(2))))this._firstPT=a={_next:this._firstPT,t:a,p:b,s:c,c:h,f:"function"===typeof a[b],n:e||b,r:g},a._next&&(a._next._prev=a)};d.setRatio=function(a){for(var b=this._firstPT,c;b;){c=b.c*a+b.s;b.r&&(c=c+(0<c?0.5:-0.5)>>0);if(b.f)b.t[b.p](c);else b.t[b.p]=c;b=b._next}};d._kill=function(a){if(null!=a[this._propName])this._overwriteProps=[];
else for(var b=this._overwriteProps.length;-1<--b;)null!=a[this._overwriteProps[b]]&&this._overwriteProps.splice(b,1);for(b=this._firstPT;b;)null!=a[b.n]&&(b._next&&(b._next._prev=b._prev),b._prev?(b._prev._next=b._next,b._prev=null):this._firstPT===b&&(this._firstPT=b._next)),b=b._next;return!1};d._roundProps=function(a,b){for(var c=this._firstPT;c;){if(a[this._propName]||null!=c.n&&a[c.n.split(this._propName+"_").join("")])c.r=b;c=c._next}};s._onPluginEvent=function(a,b){var c=b._firstPT,d;if("_onInitAllProps"===
a){for(var e,g,h,i;c;){i=c._next;for(e=g;e&&e.pr>c.pr;)e=e._next;(c._prev=e?e._prev:h)?c._prev._next=c:g=c;(c._next=e)?e._prev=c:h=c;c=i}c=b._firstPT=g}for(;c;)c.pg&&"function"===typeof c.t[a]&&c.t[a]()&&(d=!0),c=c._next;return d};L.activate=function(a){for(var b=a.length;-1<--b;)a[b].API===L.API&&(s._plugins[(new a[b])._propName]=a[b]);return!0};if(n=p._gsQueue){for(j=0;j<n.length;j++)n[j]();for(d in a)a[d].def||console.log("Warning: TweenLite encountered missing dependency: com.greensock."+d)}})(window);;

/*!
 * VERSION: beta 1.27
 * DATE: 2012-07-27
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("easing.Back",["easing.Ease"],function(g){var c=window.com.greensock._class,b=function(a,l){var b=c("easing."+a,function(){},!0),d=b.prototype=new g;d.constructor=b;d.getRatio=l;return b},h=function(a,l){var b=c("easing."+a,function(a){this._p1=a||0===a?a:1.70158;this._p2=1.525*this._p1},!0),d=b.prototype=new g;d.constructor=b;d.getRatio=l;d.config=function(a){return new b(a)};return b},n=h("BackOut",function(a){return(a-=1)*a*((this._p1+ 1)*a+this._p1)+1}),o=h("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),h=h("BackInOut",function(a){return 1>(a*=2)?0.5*a*a*((this._p2+1)*a-this._p2):0.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)}),p=b("BounceOut",function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375}),q=b("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:a<2/2.75?1-(7.5625*(a-=1.5/2.75)*a+0.75):a<2.5/2.75?1-(7.5625*(a-= 2.25/2.75)*a+0.9375):1-(7.5625*(a-=2.625/2.75)*a+0.984375)}),r=b("BounceInOut",function(a){var b=0.5>a,a=b?1-2*a:2*a-1,a=a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375;return b?0.5*(1-a):0.5*a+0.5}),s=b("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),t=b("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),u=b("CircInOut",function(a){return 1>(a*=2)?-0.5*(Math.sqrt(1-a*a)-1):0.5*(Math.sqrt(1-(a-=2)*a)+1)}),i= 2*Math.PI,j=function(a,b,e){var d=c("easing."+a,function(a,b){this._p1=a||1;this._p2=b||e;this._p3=this._p2/i*(Math.asin(1/this._p1)||0)},!0),a=d.prototype=new g;a.constructor=d;a.getRatio=b;a.config=function(a,b){return new d(a,b)};return d},v=j("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*i/this._p2)+1},0.3),w=j("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*i/this._p2))},0.3),j=j("ElasticInOut",function(a){return 1>(a*=2)? -0.5*this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*i/this._p2):0.5*this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*i/this._p2)+1},0.45),x=b("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),y=b("ExpoIn",function(a){return Math.pow(2,10*(a-1))-0.001}),z=b("ExpoInOut",function(a){return 1>(a*=2)?0.5*Math.pow(2,10*(a-1)):0.5*(2-Math.pow(2,-10*(a-1)))}),m=Math.PI/2,A=b("SineOut",function(a){return Math.sin(a*m)}),B=b("SineIn",function(a){return-Math.cos(a*m)+1}),b=b("SineInOut",function(a){return-0.5* (Math.cos(Math.PI*a)-1)}),f=c("easing.SlowMo",function(a,b,c){null==a?a=0.7:1<a&&(a=1);this._p=1!=a?b||0===b?b:0.7:0;this._p1=(1-a)/2;this._p2=a;this._p3=this._p1+this._p2;this._calcEnd=!0===c},!0),e=f.prototype=new g;e.constructor=f;e.getRatio=function(a){var b=a+(0.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b};f.ease=new f(0.7,0.7);e.config= f.config=function(a,b,c){return new f(a,b,c)};var k=c("easing.SteppedEase",function(a){a=a||1;this._p1=1/a;this._p2=a+1},!0),e=k.prototype=new g;e.constructor=k;e.getRatio=function(a){0>a?a=0:1<=a&&(a=0.999999999);return(this._p2*a>>0)*this._p1};e.config=k.config=function(a){return new k(a)};c("easing.Bounce",{easeOut:new p,easeIn:new q,easeInOut:new r},!0);c("easing.Circ",{easeOut:new s,easeIn:new t,easeInOut:new u},!0);c("easing.Elastic",{easeOut:new v,easeIn:new w,easeInOut:new j},!0);c("easing.Expo", {easeOut:new x,easeIn:new y,easeInOut:new z},!0);c("easing.Sine",{easeOut:new A,easeIn:new B,easeInOut:new b},!0);return{easeOut:new n,easeIn:new o,easeInOut:new h}},!0)});window._gsDefine&&_gsQueue.pop()();;

// three.js - http://github.com/mrdoob/three.js
'use strict';var THREE=THREE||{REVISION:"53"};self.console=self.console||{info:function(){},log:function(){},debug:function(){},warn:function(){},error:function(){}};self.Int32Array=self.Int32Array||Array;self.Float32Array=self.Float32Array||Array;String.prototype.startsWith=String.prototype.startsWith||function(a){return this.slice(0,a.length)===a};String.prototype.endsWith=String.prototype.endsWith||function(a){var a=String(a),b=this.lastIndexOf(a);return(-1<b&&b)===this.length-a.length};
String.prototype.trim=String.prototype.trim||function(){return this.replace(/^\s+|\s+$/g,"")};
(function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];void 0===window.requestAnimationFrame&&(window.requestAnimationFrame=function(b){var c=Date.now(),f=Math.max(0,16-(c-a)),g=window.setTimeout(function(){b(c+f)},f);a=c+f;return g});window.cancelAnimationFrame=window.cancelAnimationFrame||
function(a){window.clearTimeout(a)}})();THREE.FrontSide=0;THREE.BackSide=1;THREE.DoubleSide=2;THREE.NoShading=0;THREE.FlatShading=1;THREE.SmoothShading=2;THREE.NoColors=0;THREE.FaceColors=1;THREE.VertexColors=2;THREE.NoBlending=0;THREE.NormalBlending=1;THREE.AdditiveBlending=2;THREE.SubtractiveBlending=3;THREE.MultiplyBlending=4;THREE.CustomBlending=5;THREE.AddEquation=100;THREE.SubtractEquation=101;THREE.ReverseSubtractEquation=102;THREE.ZeroFactor=200;THREE.OneFactor=201;THREE.SrcColorFactor=202;
THREE.OneMinusSrcColorFactor=203;THREE.SrcAlphaFactor=204;THREE.OneMinusSrcAlphaFactor=205;THREE.DstAlphaFactor=206;THREE.OneMinusDstAlphaFactor=207;THREE.DstColorFactor=208;THREE.OneMinusDstColorFactor=209;THREE.SrcAlphaSaturateFactor=210;THREE.MultiplyOperation=0;THREE.MixOperation=1;THREE.AddOperation=2;THREE.UVMapping=function(){};THREE.CubeReflectionMapping=function(){};THREE.CubeRefractionMapping=function(){};THREE.SphericalReflectionMapping=function(){};THREE.SphericalRefractionMapping=function(){};
THREE.RepeatWrapping=1E3;THREE.ClampToEdgeWrapping=1001;THREE.MirroredRepeatWrapping=1002;THREE.NearestFilter=1003;THREE.NearestMipMapNearestFilter=1004;THREE.NearestMipMapLinearFilter=1005;THREE.LinearFilter=1006;THREE.LinearMipMapNearestFilter=1007;THREE.LinearMipMapLinearFilter=1008;THREE.UnsignedByteType=1009;THREE.ByteType=1010;THREE.ShortType=1011;THREE.UnsignedShortType=1012;THREE.IntType=1013;THREE.UnsignedIntType=1014;THREE.FloatType=1015;THREE.UnsignedShort4444Type=1016;
THREE.UnsignedShort5551Type=1017;THREE.UnsignedShort565Type=1018;THREE.AlphaFormat=1019;THREE.RGBFormat=1020;THREE.RGBAFormat=1021;THREE.LuminanceFormat=1022;THREE.LuminanceAlphaFormat=1023;THREE.RGB_S3TC_DXT1_Format=2001;THREE.RGBA_S3TC_DXT1_Format=2002;THREE.RGBA_S3TC_DXT3_Format=2003;THREE.RGBA_S3TC_DXT5_Format=2004;THREE.Clock=function(a){this.autoStart=void 0!==a?a:!0;this.elapsedTime=this.oldTime=this.startTime=0;this.running=!1};
THREE.Clock.prototype.start=function(){this.oldTime=this.startTime=Date.now();this.running=!0};THREE.Clock.prototype.stop=function(){this.getElapsedTime();this.running=!1};THREE.Clock.prototype.getElapsedTime=function(){return this.elapsedTime+=this.getDelta()};THREE.Clock.prototype.getDelta=function(){var a=0;this.autoStart&&!this.running&&this.start();if(this.running){var b=Date.now(),a=0.001*(b-this.oldTime);this.oldTime=b;this.elapsedTime+=a}return a};
THREE.Color=function(a){void 0!==a&&this.setHex(a);return this};
THREE.Color.prototype={constructor:THREE.Color,r:1,g:1,b:1,copy:function(a){this.r=a.r;this.g=a.g;this.b=a.b;return this},copyGammaToLinear:function(a){this.r=a.r*a.r;this.g=a.g*a.g;this.b=a.b*a.b;return this},copyLinearToGamma:function(a){this.r=Math.sqrt(a.r);this.g=Math.sqrt(a.g);this.b=Math.sqrt(a.b);return this},convertGammaToLinear:function(){var a=this.r,b=this.g,c=this.b;this.r=a*a;this.g=b*b;this.b=c*c;return this},convertLinearToGamma:function(){this.r=Math.sqrt(this.r);this.g=Math.sqrt(this.g);
this.b=Math.sqrt(this.b);return this},setRGB:function(a,b,c){this.r=a;this.g=b;this.b=c;return this},setHSV:function(a,b,c){var d,e,f;0===c?this.r=this.g=this.b=0:(d=Math.floor(6*a),e=6*a-d,a=c*(1-b),f=c*(1-b*e),b=c*(1-b*(1-e)),0===d?(this.r=c,this.g=b,this.b=a):1===d?(this.r=f,this.g=c,this.b=a):2===d?(this.r=a,this.g=c,this.b=b):3===d?(this.r=a,this.g=f,this.b=c):4===d?(this.r=b,this.g=a,this.b=c):5===d&&(this.r=c,this.g=a,this.b=f));return this},getHex:function(){return 255*this.r<<16^255*this.g<<
8^255*this.b<<0},setHex:function(a){a=Math.floor(a);this.r=(a>>16&255)/255;this.g=(a>>8&255)/255;this.b=(a&255)/255;return this},getHexString:function(){return("000000"+this.getHex().toString(16)).slice(-6)},getContextStyle:function(){return"rgb("+(255*this.r|0)+","+(255*this.g|0)+","+(255*this.b|0)+")"},setContextStyle:function(a){a=/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i.exec(a);this.r=parseInt(a[1],10)/255;this.g=parseInt(a[2],10)/255;this.b=parseInt(a[3],10)/255;return this},getHSV:function(a){var b=
this.r,c=this.g,d=this.b,e=Math.max(Math.max(b,c),d),f=Math.min(Math.min(b,c),d);if(f===e)f=b=0;else{var g=e-f,f=g/e,b=(b===e?(c-d)/g:c===e?2+(d-b)/g:4+(b-c)/g)/6;0>b&&(b+=1);1<b&&(b-=1)}void 0===a&&(a={h:0,s:0,v:0});a.h=b;a.s=f;a.v=e;return a},lerpSelf:function(a,b){this.r+=(a.r-this.r)*b;this.g+=(a.g-this.g)*b;this.b+=(a.b-this.b)*b;return this},clone:function(){return(new THREE.Color).setRGB(this.r,this.g,this.b)}};THREE.Vector2=function(a,b){this.x=a||0;this.y=b||0};
THREE.Vector2.prototype={constructor:THREE.Vector2,set:function(a,b){this.x=a;this.y=b;return this},copy:function(a){this.x=a.x;this.y=a.y;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;return this},addSelf:function(a){this.x+=a.x;this.y+=a.y;return this},sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;return this},subSelf:function(a){this.x-=a.x;this.y-=a.y;return this},multiplyScalar:function(a){this.x*=a;this.y*=a;return this},divideScalar:function(a){a?(this.x/=a,this.y/=a):this.set(0,
0);return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y},lengthSq:function(){return this.x*this.x+this.y*this.y},length:function(){return Math.sqrt(this.lengthSq())},normalize:function(){return this.divideScalar(this.length())},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x,a=this.y-a.y;return b*b+a*a},setLength:function(a){return this.normalize().multiplyScalar(a)},lerpSelf:function(a,
b){this.x+=(a.x-this.x)*b;this.y+=(a.y-this.y)*b;return this},equals:function(a){return a.x===this.x&&a.y===this.y},clone:function(){return new THREE.Vector2(this.x,this.y)}};THREE.Vector3=function(a,b,c){this.x=a||0;this.y=b||0;this.z=c||0};
THREE.Vector3.prototype={constructor:THREE.Vector3,set:function(a,b,c){this.x=a;this.y=b;this.z=c;return this},setX:function(a){this.x=a;return this},setY:function(a){this.y=a;return this},setZ:function(a){this.z=a;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this},addSelf:function(a){this.x+=a.x;this.y+=a.y;this.z+=a.z;return this},addScalar:function(a){this.x+=a;this.y+=a;this.z+=a;return this},
sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this},subSelf:function(a){this.x-=a.x;this.y-=a.y;this.z-=a.z;return this},multiply:function(a,b){this.x=a.x*b.x;this.y=a.y*b.y;this.z=a.z*b.z;return this},multiplySelf:function(a){this.x*=a.x;this.y*=a.y;this.z*=a.z;return this},multiplyScalar:function(a){this.x*=a;this.y*=a;this.z*=a;return this},divideSelf:function(a){this.x/=a.x;this.y/=a.y;this.z/=a.z;return this},divideScalar:function(a){a?(this.x/=a,this.y/=a,this.z/=a):
this.z=this.y=this.x=0;return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z},length:function(){return Math.sqrt(this.lengthSq())},lengthManhattan:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)},normalize:function(){return this.divideScalar(this.length())},setLength:function(a){return this.normalize().multiplyScalar(a)},lerpSelf:function(a,b){this.x+=
(a.x-this.x)*b;this.y+=(a.y-this.y)*b;this.z+=(a.z-this.z)*b;return this},cross:function(a,b){this.x=a.y*b.z-a.z*b.y;this.y=a.z*b.x-a.x*b.z;this.z=a.x*b.y-a.y*b.x;return this},crossSelf:function(a){var b=this.x,c=this.y,d=this.z;this.x=c*a.z-d*a.y;this.y=d*a.x-b*a.z;this.z=b*a.y-c*a.x;return this},angleTo:function(a){return Math.acos(this.dot(a)/this.length()/a.length())},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){return(new THREE.Vector3).sub(this,
a).lengthSq()},getPositionFromMatrix:function(a){this.x=a.elements[12];this.y=a.elements[13];this.z=a.elements[14];return this},setEulerFromRotationMatrix:function(a,b){function c(a){return Math.min(Math.max(a,-1),1)}var d=a.elements,e=d[0],f=d[4],g=d[8],h=d[1],i=d[5],j=d[9],l=d[2],m=d[6],d=d[10];void 0===b||"XYZ"===b?(this.y=Math.asin(c(g)),0.99999>Math.abs(g)?(this.x=Math.atan2(-j,d),this.z=Math.atan2(-f,e)):(this.x=Math.atan2(m,i),this.z=0)):"YXZ"===b?(this.x=Math.asin(-c(j)),0.99999>Math.abs(j)?
(this.y=Math.atan2(g,d),this.z=Math.atan2(h,i)):(this.y=Math.atan2(-l,e),this.z=0)):"ZXY"===b?(this.x=Math.asin(c(m)),0.99999>Math.abs(m)?(this.y=Math.atan2(-l,d),this.z=Math.atan2(-f,i)):(this.y=0,this.z=Math.atan2(h,e))):"ZYX"===b?(this.y=Math.asin(-c(l)),0.99999>Math.abs(l)?(this.x=Math.atan2(m,d),this.z=Math.atan2(h,e)):(this.x=0,this.z=Math.atan2(-f,i))):"YZX"===b?(this.z=Math.asin(c(h)),0.99999>Math.abs(h)?(this.x=Math.atan2(-j,i),this.y=Math.atan2(-l,e)):(this.x=0,this.y=Math.atan2(g,d))):
"XZY"===b&&(this.z=Math.asin(-c(f)),0.99999>Math.abs(f)?(this.x=Math.atan2(m,i),this.y=Math.atan2(g,e)):(this.x=Math.atan2(-j,d),this.y=0));return this},setEulerFromQuaternion:function(a,b){function c(a){return Math.min(Math.max(a,-1),1)}var d=a.x*a.x,e=a.y*a.y,f=a.z*a.z,g=a.w*a.w;void 0===b||"XYZ"===b?(this.x=Math.atan2(2*(a.x*a.w-a.y*a.z),g-d-e+f),this.y=Math.asin(c(2*(a.x*a.z+a.y*a.w))),this.z=Math.atan2(2*(a.z*a.w-a.x*a.y),g+d-e-f)):"YXZ"===b?(this.x=Math.asin(c(2*(a.x*a.w-a.y*a.z))),this.y=Math.atan2(2*
(a.x*a.z+a.y*a.w),g-d-e+f),this.z=Math.atan2(2*(a.x*a.y+a.z*a.w),g-d+e-f)):"ZXY"===b?(this.x=Math.asin(c(2*(a.x*a.w+a.y*a.z))),this.y=Math.atan2(2*(a.y*a.w-a.z*a.x),g-d-e+f),this.z=Math.atan2(2*(a.z*a.w-a.x*a.y),g-d+e-f)):"ZYX"===b?(this.x=Math.atan2(2*(a.x*a.w+a.z*a.y),g-d-e+f),this.y=Math.asin(c(2*(a.y*a.w-a.x*a.z))),this.z=Math.atan2(2*(a.x*a.y+a.z*a.w),g+d-e-f)):"YZX"===b?(this.x=Math.atan2(2*(a.x*a.w-a.z*a.y),g-d+e-f),this.y=Math.atan2(2*(a.y*a.w-a.x*a.z),g+d-e-f),this.z=Math.asin(c(2*(a.x*a.y+
a.z*a.w)))):"XZY"===b&&(this.x=Math.atan2(2*(a.x*a.w+a.y*a.z),g-d+e-f),this.y=Math.atan2(2*(a.x*a.z+a.y*a.w),g+d-e-f),this.z=Math.asin(c(2*(a.z*a.w-a.x*a.y))));return this},getScaleFromMatrix:function(a){var b=this.set(a.elements[0],a.elements[1],a.elements[2]).length(),c=this.set(a.elements[4],a.elements[5],a.elements[6]).length(),a=this.set(a.elements[8],a.elements[9],a.elements[10]).length();this.x=b;this.y=c;this.z=a;return this},equals:function(a){return a.x===this.x&&a.y===this.y&&a.z===this.z},
clone:function(){return new THREE.Vector3(this.x,this.y,this.z)}};THREE.Vector4=function(a,b,c,d){this.x=a||0;this.y=b||0;this.z=c||0;this.w=void 0!==d?d:1};
THREE.Vector4.prototype={constructor:THREE.Vector4,set:function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;this.w=void 0!==a.w?a.w:1;return this},add:function(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;this.w=a.w+b.w;return this},addSelf:function(a){this.x+=a.x;this.y+=a.y;this.z+=a.z;this.w+=a.w;return this},sub:function(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;this.w=a.w-b.w;return this},subSelf:function(a){this.x-=
a.x;this.y-=a.y;this.z-=a.z;this.w-=a.w;return this},multiplyScalar:function(a){this.x*=a;this.y*=a;this.z*=a;this.w*=a;return this},divideScalar:function(a){a?(this.x/=a,this.y/=a,this.z/=a,this.w/=a):(this.z=this.y=this.x=0,this.w=1);return this},negate:function(){return this.multiplyScalar(-1)},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z+this.w*a.w},lengthSq:function(){return this.dot(this)},length:function(){return Math.sqrt(this.lengthSq())},lengthManhattan:function(){return Math.abs(this.x)+
Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)},normalize:function(){return this.divideScalar(this.length())},setLength:function(a){return this.normalize().multiplyScalar(a)},lerpSelf:function(a,b){this.x+=(a.x-this.x)*b;this.y+=(a.y-this.y)*b;this.z+=(a.z-this.z)*b;this.w+=(a.w-this.w)*b;return this},clone:function(){return new THREE.Vector4(this.x,this.y,this.z,this.w)},setAxisAngleFromQuaternion:function(a){this.w=2*Math.acos(a.w);var b=Math.sqrt(1-a.w*a.w);1E-4>b?(this.x=1,this.z=this.y=0):
(this.x=a.x/b,this.y=a.y/b,this.z=a.z/b);return this},setAxisAngleFromRotationMatrix:function(a){var b,c,d,a=a.elements,e=a[0];d=a[4];var f=a[8],g=a[1],h=a[5],i=a[9];c=a[2];b=a[6];var j=a[10];if(0.01>Math.abs(d-g)&&0.01>Math.abs(f-c)&&0.01>Math.abs(i-b)){if(0.1>Math.abs(d+g)&&0.1>Math.abs(f+c)&&0.1>Math.abs(i+b)&&0.1>Math.abs(e+h+j-3))return this.set(1,0,0,0),this;a=Math.PI;e=(e+1)/2;h=(h+1)/2;j=(j+1)/2;d=(d+g)/4;f=(f+c)/4;i=(i+b)/4;e>h&&e>j?0.01>e?(b=0,d=c=0.707106781):(b=Math.sqrt(e),c=d/b,d=f/
b):h>j?0.01>h?(b=0.707106781,c=0,d=0.707106781):(c=Math.sqrt(h),b=d/c,d=i/c):0.01>j?(c=b=0.707106781,d=0):(d=Math.sqrt(j),b=f/d,c=i/d);this.set(b,c,d,a);return this}a=Math.sqrt((b-i)*(b-i)+(f-c)*(f-c)+(g-d)*(g-d));0.001>Math.abs(a)&&(a=1);this.x=(b-i)/a;this.y=(f-c)/a;this.z=(g-d)/a;this.w=Math.acos((e+h+j-1)/2);return this}};THREE.Matrix3=function(){this.elements=new Float32Array(9)};
THREE.Matrix3.prototype={constructor:THREE.Matrix3,multiplyVector3:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z;a.x=b[0]*c+b[3]*d+b[6]*e;a.y=b[1]*c+b[4]*d+b[7]*e;a.z=b[2]*c+b[5]*d+b[8]*e;return a},multiplyVector3Array:function(a){for(var b=THREE.Matrix3.__v1,c=0,d=a.length;c<d;c+=3)b.x=a[c],b.y=a[c+1],b.z=a[c+2],this.multiplyVector3(b),a[c]=b.x,a[c+1]=b.y,a[c+2]=b.z;return a},getInverse:function(a){var b=a.elements,a=b[10]*b[5]-b[6]*b[9],c=-b[10]*b[1]+b[2]*b[9],d=b[6]*b[1]-b[2]*b[5],e=-b[10]*
b[4]+b[6]*b[8],f=b[10]*b[0]-b[2]*b[8],g=-b[6]*b[0]+b[2]*b[4],h=b[9]*b[4]-b[5]*b[8],i=-b[9]*b[0]+b[1]*b[8],j=b[5]*b[0]-b[1]*b[4],b=b[0]*a+b[1]*e+b[2]*h;0===b&&console.warn("Matrix3.getInverse(): determinant == 0");var b=1/b,l=this.elements;l[0]=b*a;l[1]=b*c;l[2]=b*d;l[3]=b*e;l[4]=b*f;l[5]=b*g;l[6]=b*h;l[7]=b*i;l[8]=b*j;return this},transpose:function(){var a,b=this.elements;a=b[1];b[1]=b[3];b[3]=a;a=b[2];b[2]=b[6];b[6]=a;a=b[5];b[5]=b[7];b[7]=a;return this},transposeIntoArray:function(a){var b=this.m;
a[0]=b[0];a[1]=b[3];a[2]=b[6];a[3]=b[1];a[4]=b[4];a[5]=b[7];a[6]=b[2];a[7]=b[5];a[8]=b[8];return this}};THREE.Matrix3.__v1=new THREE.Vector3;THREE.Matrix4=function(a,b,c,d,e,f,g,h,i,j,l,m,n,p,o,s){this.elements=new Float32Array(16);this.set(void 0!==a?a:1,b||0,c||0,d||0,e||0,void 0!==f?f:1,g||0,h||0,i||0,j||0,void 0!==l?l:1,m||0,n||0,p||0,o||0,void 0!==s?s:1)};
THREE.Matrix4.prototype={constructor:THREE.Matrix4,set:function(a,b,c,d,e,f,g,h,i,j,l,m,n,p,o,s){var t=this.elements;t[0]=a;t[4]=b;t[8]=c;t[12]=d;t[1]=e;t[5]=f;t[9]=g;t[13]=h;t[2]=i;t[6]=j;t[10]=l;t[14]=m;t[3]=n;t[7]=p;t[11]=o;t[15]=s;return this},identity:function(){this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);return this},copy:function(a){a=a.elements;this.set(a[0],a[4],a[8],a[12],a[1],a[5],a[9],a[13],a[2],a[6],a[10],a[14],a[3],a[7],a[11],a[15]);return this},lookAt:function(a,b,c){var d=this.elements,
e=THREE.Matrix4.__v1,f=THREE.Matrix4.__v2,g=THREE.Matrix4.__v3;g.sub(a,b).normalize();0===g.length()&&(g.z=1);e.cross(c,g).normalize();0===e.length()&&(g.x+=1E-4,e.cross(c,g).normalize());f.cross(g,e);d[0]=e.x;d[4]=f.x;d[8]=g.x;d[1]=e.y;d[5]=f.y;d[9]=g.y;d[2]=e.z;d[6]=f.z;d[10]=g.z;return this},multiply:function(a,b){var c=a.elements,d=b.elements,e=this.elements,f=c[0],g=c[4],h=c[8],i=c[12],j=c[1],l=c[5],m=c[9],n=c[13],p=c[2],o=c[6],s=c[10],t=c[14],r=c[3],z=c[7],w=c[11],c=c[15],q=d[0],E=d[4],A=d[8],
v=d[12],u=d[1],D=d[5],C=d[9],G=d[13],P=d[2],B=d[6],K=d[10],H=d[14],I=d[3],N=d[7],O=d[11],d=d[15];e[0]=f*q+g*u+h*P+i*I;e[4]=f*E+g*D+h*B+i*N;e[8]=f*A+g*C+h*K+i*O;e[12]=f*v+g*G+h*H+i*d;e[1]=j*q+l*u+m*P+n*I;e[5]=j*E+l*D+m*B+n*N;e[9]=j*A+l*C+m*K+n*O;e[13]=j*v+l*G+m*H+n*d;e[2]=p*q+o*u+s*P+t*I;e[6]=p*E+o*D+s*B+t*N;e[10]=p*A+o*C+s*K+t*O;e[14]=p*v+o*G+s*H+t*d;e[3]=r*q+z*u+w*P+c*I;e[7]=r*E+z*D+w*B+c*N;e[11]=r*A+z*C+w*K+c*O;e[15]=r*v+z*G+w*H+c*d;return this},multiplySelf:function(a){return this.multiply(this,
a)},multiplyToArray:function(a,b,c){var d=this.elements;this.multiply(a,b);c[0]=d[0];c[1]=d[1];c[2]=d[2];c[3]=d[3];c[4]=d[4];c[5]=d[5];c[6]=d[6];c[7]=d[7];c[8]=d[8];c[9]=d[9];c[10]=d[10];c[11]=d[11];c[12]=d[12];c[13]=d[13];c[14]=d[14];c[15]=d[15];return this},multiplyScalar:function(a){var b=this.elements;b[0]*=a;b[4]*=a;b[8]*=a;b[12]*=a;b[1]*=a;b[5]*=a;b[9]*=a;b[13]*=a;b[2]*=a;b[6]*=a;b[10]*=a;b[14]*=a;b[3]*=a;b[7]*=a;b[11]*=a;b[15]*=a;return this},multiplyVector3:function(a){var b=this.elements,
c=a.x,d=a.y,e=a.z,f=1/(b[3]*c+b[7]*d+b[11]*e+b[15]);a.x=(b[0]*c+b[4]*d+b[8]*e+b[12])*f;a.y=(b[1]*c+b[5]*d+b[9]*e+b[13])*f;a.z=(b[2]*c+b[6]*d+b[10]*e+b[14])*f;return a},multiplyVector4:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,f=a.w;a.x=b[0]*c+b[4]*d+b[8]*e+b[12]*f;a.y=b[1]*c+b[5]*d+b[9]*e+b[13]*f;a.z=b[2]*c+b[6]*d+b[10]*e+b[14]*f;a.w=b[3]*c+b[7]*d+b[11]*e+b[15]*f;return a},multiplyVector3Array:function(a){for(var b=THREE.Matrix4.__v1,c=0,d=a.length;c<d;c+=3)b.x=a[c],b.y=a[c+1],b.z=a[c+2],
this.multiplyVector3(b),a[c]=b.x,a[c+1]=b.y,a[c+2]=b.z;return a},rotateAxis:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z;a.x=c*b[0]+d*b[4]+e*b[8];a.y=c*b[1]+d*b[5]+e*b[9];a.z=c*b[2]+d*b[6]+e*b[10];a.normalize();return a},crossVector:function(a){var b=this.elements,c=new THREE.Vector4;c.x=b[0]*a.x+b[4]*a.y+b[8]*a.z+b[12]*a.w;c.y=b[1]*a.x+b[5]*a.y+b[9]*a.z+b[13]*a.w;c.z=b[2]*a.x+b[6]*a.y+b[10]*a.z+b[14]*a.w;c.w=a.w?b[3]*a.x+b[7]*a.y+b[11]*a.z+b[15]*a.w:1;return c},determinant:function(){var a=
this.elements,b=a[0],c=a[4],d=a[8],e=a[12],f=a[1],g=a[5],h=a[9],i=a[13],j=a[2],l=a[6],m=a[10],n=a[14],p=a[3],o=a[7],s=a[11],a=a[15];return e*h*l*p-d*i*l*p-e*g*m*p+c*i*m*p+d*g*n*p-c*h*n*p-e*h*j*o+d*i*j*o+e*f*m*o-b*i*m*o-d*f*n*o+b*h*n*o+e*g*j*s-c*i*j*s-e*f*l*s+b*i*l*s+c*f*n*s-b*g*n*s-d*g*j*a+c*h*j*a+d*f*l*a-b*h*l*a-c*f*m*a+b*g*m*a},transpose:function(){var a=this.elements,b;b=a[1];a[1]=a[4];a[4]=b;b=a[2];a[2]=a[8];a[8]=b;b=a[6];a[6]=a[9];a[9]=b;b=a[3];a[3]=a[12];a[12]=b;b=a[7];a[7]=a[13];a[13]=b;b=
a[11];a[11]=a[14];a[14]=b;return this},flattenToArray:function(a){var b=this.elements;a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];a[4]=b[4];a[5]=b[5];a[6]=b[6];a[7]=b[7];a[8]=b[8];a[9]=b[9];a[10]=b[10];a[11]=b[11];a[12]=b[12];a[13]=b[13];a[14]=b[14];a[15]=b[15];return a},flattenToArrayOffset:function(a,b){var c=this.elements;a[b]=c[0];a[b+1]=c[1];a[b+2]=c[2];a[b+3]=c[3];a[b+4]=c[4];a[b+5]=c[5];a[b+6]=c[6];a[b+7]=c[7];a[b+8]=c[8];a[b+9]=c[9];a[b+10]=c[10];a[b+11]=c[11];a[b+12]=c[12];a[b+13]=c[13];a[b+
14]=c[14];a[b+15]=c[15];return a},getPosition:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[12],a[13],a[14])},setPosition:function(a){var b=this.elements;b[12]=a.x;b[13]=a.y;b[14]=a.z;return this},getColumnX:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[0],a[1],a[2])},getColumnY:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[4],a[5],a[6])},getColumnZ:function(){var a=this.elements;return THREE.Matrix4.__v1.set(a[8],a[9],a[10])},getInverse:function(a){var b=
this.elements,c=a.elements,d=c[0],e=c[4],f=c[8],g=c[12],h=c[1],i=c[5],j=c[9],l=c[13],m=c[2],n=c[6],p=c[10],o=c[14],s=c[3],t=c[7],r=c[11],c=c[15];b[0]=j*o*t-l*p*t+l*n*r-i*o*r-j*n*c+i*p*c;b[4]=g*p*t-f*o*t-g*n*r+e*o*r+f*n*c-e*p*c;b[8]=f*l*t-g*j*t+g*i*r-e*l*r-f*i*c+e*j*c;b[12]=g*j*n-f*l*n-g*i*p+e*l*p+f*i*o-e*j*o;b[1]=l*p*s-j*o*s-l*m*r+h*o*r+j*m*c-h*p*c;b[5]=f*o*s-g*p*s+g*m*r-d*o*r-f*m*c+d*p*c;b[9]=g*j*s-f*l*s-g*h*r+d*l*r+f*h*c-d*j*c;b[13]=f*l*m-g*j*m+g*h*p-d*l*p-f*h*o+d*j*o;b[2]=i*o*s-l*n*s+l*m*t-h*o*
t-i*m*c+h*n*c;b[6]=g*n*s-e*o*s-g*m*t+d*o*t+e*m*c-d*n*c;b[10]=e*l*s-g*i*s+g*h*t-d*l*t-e*h*c+d*i*c;b[14]=g*i*m-e*l*m-g*h*n+d*l*n+e*h*o-d*i*o;b[3]=j*n*s-i*p*s-j*m*t+h*p*t+i*m*r-h*n*r;b[7]=e*p*s-f*n*s+f*m*t-d*p*t-e*m*r+d*n*r;b[11]=f*i*s-e*j*s-f*h*t+d*j*t+e*h*r-d*i*r;b[15]=e*j*m-f*i*m+f*h*n-d*j*n-e*h*p+d*i*p;this.multiplyScalar(1/a.determinant());return this},setRotationFromEuler:function(a,b){var c=this.elements,d=a.x,e=a.y,f=a.z,g=Math.cos(d),d=Math.sin(d),h=Math.cos(e),e=Math.sin(e),i=Math.cos(f),f=
Math.sin(f);if(void 0===b||"XYZ"===b){var j=g*i,l=g*f,m=d*i,n=d*f;c[0]=h*i;c[4]=-h*f;c[8]=e;c[1]=l+m*e;c[5]=j-n*e;c[9]=-d*h;c[2]=n-j*e;c[6]=m+l*e;c[10]=g*h}else"YXZ"===b?(j=h*i,l=h*f,m=e*i,n=e*f,c[0]=j+n*d,c[4]=m*d-l,c[8]=g*e,c[1]=g*f,c[5]=g*i,c[9]=-d,c[2]=l*d-m,c[6]=n+j*d,c[10]=g*h):"ZXY"===b?(j=h*i,l=h*f,m=e*i,n=e*f,c[0]=j-n*d,c[4]=-g*f,c[8]=m+l*d,c[1]=l+m*d,c[5]=g*i,c[9]=n-j*d,c[2]=-g*e,c[6]=d,c[10]=g*h):"ZYX"===b?(j=g*i,l=g*f,m=d*i,n=d*f,c[0]=h*i,c[4]=m*e-l,c[8]=j*e+n,c[1]=h*f,c[5]=n*e+j,c[9]=
l*e-m,c[2]=-e,c[6]=d*h,c[10]=g*h):"YZX"===b?(j=g*h,l=g*e,m=d*h,n=d*e,c[0]=h*i,c[4]=n-j*f,c[8]=m*f+l,c[1]=f,c[5]=g*i,c[9]=-d*i,c[2]=-e*i,c[6]=l*f+m,c[10]=j-n*f):"XZY"===b&&(j=g*h,l=g*e,m=d*h,n=d*e,c[0]=h*i,c[4]=-f,c[8]=e*i,c[1]=j*f+n,c[5]=g*i,c[9]=l*f-m,c[2]=m*f-l,c[6]=d*i,c[10]=n*f+j);return this},setRotationFromQuaternion:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z,f=a.w,g=c+c,h=d+d,i=e+e,a=c*g,j=c*h,c=c*i,l=d*h,d=d*i,e=e*i,g=f*g,h=f*h,f=f*i;b[0]=1-(l+e);b[4]=j-f;b[8]=c+h;b[1]=j+f;b[5]=1-(a+
e);b[9]=d-g;b[2]=c-h;b[6]=d+g;b[10]=1-(a+l);return this},compose:function(a,b,c){var d=this.elements,e=THREE.Matrix4.__m1,f=THREE.Matrix4.__m2;e.identity();e.setRotationFromQuaternion(b);f.makeScale(c.x,c.y,c.z);this.multiply(e,f);d[12]=a.x;d[13]=a.y;d[14]=a.z;return this},decompose:function(a,b,c){var d=this.elements,e=THREE.Matrix4.__v1,f=THREE.Matrix4.__v2,g=THREE.Matrix4.__v3;e.set(d[0],d[1],d[2]);f.set(d[4],d[5],d[6]);g.set(d[8],d[9],d[10]);a=a instanceof THREE.Vector3?a:new THREE.Vector3;b=
b instanceof THREE.Quaternion?b:new THREE.Quaternion;c=c instanceof THREE.Vector3?c:new THREE.Vector3;c.x=e.length();c.y=f.length();c.z=g.length();a.x=d[12];a.y=d[13];a.z=d[14];d=THREE.Matrix4.__m1;d.copy(this);d.elements[0]/=c.x;d.elements[1]/=c.x;d.elements[2]/=c.x;d.elements[4]/=c.y;d.elements[5]/=c.y;d.elements[6]/=c.y;d.elements[8]/=c.z;d.elements[9]/=c.z;d.elements[10]/=c.z;b.setFromRotationMatrix(d);return[a,b,c]},extractPosition:function(a){var b=this.elements,a=a.elements;b[12]=a[12];b[13]=
a[13];b[14]=a[14];return this},extractRotation:function(a){var b=this.elements,a=a.elements,c=THREE.Matrix4.__v1,d=1/c.set(a[0],a[1],a[2]).length(),e=1/c.set(a[4],a[5],a[6]).length(),c=1/c.set(a[8],a[9],a[10]).length();b[0]=a[0]*d;b[1]=a[1]*d;b[2]=a[2]*d;b[4]=a[4]*e;b[5]=a[5]*e;b[6]=a[6]*e;b[8]=a[8]*c;b[9]=a[9]*c;b[10]=a[10]*c;return this},translate:function(a){var b=this.elements,c=a.x,d=a.y,a=a.z;b[12]=b[0]*c+b[4]*d+b[8]*a+b[12];b[13]=b[1]*c+b[5]*d+b[9]*a+b[13];b[14]=b[2]*c+b[6]*d+b[10]*a+b[14];
b[15]=b[3]*c+b[7]*d+b[11]*a+b[15];return this},rotateX:function(a){var b=this.elements,c=b[4],d=b[5],e=b[6],f=b[7],g=b[8],h=b[9],i=b[10],j=b[11],l=Math.cos(a),a=Math.sin(a);b[4]=l*c+a*g;b[5]=l*d+a*h;b[6]=l*e+a*i;b[7]=l*f+a*j;b[8]=l*g-a*c;b[9]=l*h-a*d;b[10]=l*i-a*e;b[11]=l*j-a*f;return this},rotateY:function(a){var b=this.elements,c=b[0],d=b[1],e=b[2],f=b[3],g=b[8],h=b[9],i=b[10],j=b[11],l=Math.cos(a),a=Math.sin(a);b[0]=l*c-a*g;b[1]=l*d-a*h;b[2]=l*e-a*i;b[3]=l*f-a*j;b[8]=l*g+a*c;b[9]=l*h+a*d;b[10]=
l*i+a*e;b[11]=l*j+a*f;return this},rotateZ:function(a){var b=this.elements,c=b[0],d=b[1],e=b[2],f=b[3],g=b[4],h=b[5],i=b[6],j=b[7],l=Math.cos(a),a=Math.sin(a);b[0]=l*c+a*g;b[1]=l*d+a*h;b[2]=l*e+a*i;b[3]=l*f+a*j;b[4]=l*g-a*c;b[5]=l*h-a*d;b[6]=l*i-a*e;b[7]=l*j-a*f;return this},rotateByAxis:function(a,b){var c=this.elements;if(1===a.x&&0===a.y&&0===a.z)return this.rotateX(b);if(0===a.x&&1===a.y&&0===a.z)return this.rotateY(b);if(0===a.x&&0===a.y&&1===a.z)return this.rotateZ(b);var d=a.x,e=a.y,f=a.z,
g=Math.sqrt(d*d+e*e+f*f),d=d/g,e=e/g,f=f/g,g=d*d,h=e*e,i=f*f,j=Math.cos(b),l=Math.sin(b),m=1-j,n=d*e*m,p=d*f*m,m=e*f*m,d=d*l,o=e*l,l=f*l,f=g+(1-g)*j,g=n+l,e=p-o,n=n-l,h=h+(1-h)*j,l=m+d,p=p+o,m=m-d,i=i+(1-i)*j,j=c[0],d=c[1],o=c[2],s=c[3],t=c[4],r=c[5],z=c[6],w=c[7],q=c[8],E=c[9],A=c[10],v=c[11];c[0]=f*j+g*t+e*q;c[1]=f*d+g*r+e*E;c[2]=f*o+g*z+e*A;c[3]=f*s+g*w+e*v;c[4]=n*j+h*t+l*q;c[5]=n*d+h*r+l*E;c[6]=n*o+h*z+l*A;c[7]=n*s+h*w+l*v;c[8]=p*j+m*t+i*q;c[9]=p*d+m*r+i*E;c[10]=p*o+m*z+i*A;c[11]=p*s+m*w+i*v;
return this},scale:function(a){var b=this.elements,c=a.x,d=a.y,a=a.z;b[0]*=c;b[4]*=d;b[8]*=a;b[1]*=c;b[5]*=d;b[9]*=a;b[2]*=c;b[6]*=d;b[10]*=a;b[3]*=c;b[7]*=d;b[11]*=a;return this},getMaxScaleOnAxis:function(){var a=this.elements;return Math.sqrt(Math.max(a[0]*a[0]+a[1]*a[1]+a[2]*a[2],Math.max(a[4]*a[4]+a[5]*a[5]+a[6]*a[6],a[8]*a[8]+a[9]*a[9]+a[10]*a[10])))},makeTranslation:function(a,b,c){this.set(1,0,0,a,0,1,0,b,0,0,1,c,0,0,0,1);return this},makeRotationX:function(a){var b=Math.cos(a),a=Math.sin(a);
this.set(1,0,0,0,0,b,-a,0,0,a,b,0,0,0,0,1);return this},makeRotationY:function(a){var b=Math.cos(a),a=Math.sin(a);this.set(b,0,a,0,0,1,0,0,-a,0,b,0,0,0,0,1);return this},makeRotationZ:function(a){var b=Math.cos(a),a=Math.sin(a);this.set(b,-a,0,0,a,b,0,0,0,0,1,0,0,0,0,1);return this},makeRotationAxis:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=1-c,f=a.x,g=a.y,h=a.z,i=e*f,j=e*g;this.set(i*f+c,i*g-d*h,i*h+d*g,0,i*g+d*h,j*g+c,j*h-d*f,0,i*h-d*g,j*h+d*f,e*h*h+c,0,0,0,0,1);return this},makeScale:function(a,
b,c){this.set(a,0,0,0,0,b,0,0,0,0,c,0,0,0,0,1);return this},makeFrustum:function(a,b,c,d,e,f){var g=this.elements;g[0]=2*e/(b-a);g[4]=0;g[8]=(b+a)/(b-a);g[12]=0;g[1]=0;g[5]=2*e/(d-c);g[9]=(d+c)/(d-c);g[13]=0;g[2]=0;g[6]=0;g[10]=-(f+e)/(f-e);g[14]=-2*f*e/(f-e);g[3]=0;g[7]=0;g[11]=-1;g[15]=0;return this},makePerspective:function(a,b,c,d){var a=c*Math.tan(a*Math.PI/360),e=-a;return this.makeFrustum(e*b,a*b,e,a,c,d)},makeOrthographic:function(a,b,c,d,e,f){var g=this.elements,h=b-a,i=c-d,j=f-e;g[0]=2/
h;g[4]=0;g[8]=0;g[12]=-((b+a)/h);g[1]=0;g[5]=2/i;g[9]=0;g[13]=-((c+d)/i);g[2]=0;g[6]=0;g[10]=-2/j;g[14]=-((f+e)/j);g[3]=0;g[7]=0;g[11]=0;g[15]=1;return this},clone:function(){var a=this.elements;return new THREE.Matrix4(a[0],a[4],a[8],a[12],a[1],a[5],a[9],a[13],a[2],a[6],a[10],a[14],a[3],a[7],a[11],a[15])}};THREE.Matrix4.__v1=new THREE.Vector3;THREE.Matrix4.__v2=new THREE.Vector3;THREE.Matrix4.__v3=new THREE.Vector3;THREE.Matrix4.__m1=new THREE.Matrix4;THREE.Matrix4.__m2=new THREE.Matrix4;
THREE.EventTarget=function(){var a={};this.addEventListener=function(b,c){void 0===a[b]&&(a[b]=[]);-1===a[b].indexOf(c)&&a[b].push(c)};this.dispatchEvent=function(b){for(var c in a[b.type])a[b.type][c](b)};this.removeEventListener=function(b,c){var d=a[b].indexOf(c);-1!==d&&a[b].splice(d,1)}};THREE.Frustum=function(){this.planes=[new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4,new THREE.Vector4]};
THREE.Frustum.prototype.setFromMatrix=function(a){var b=this.planes,c=a.elements,a=c[0],d=c[1],e=c[2],f=c[3],g=c[4],h=c[5],i=c[6],j=c[7],l=c[8],m=c[9],n=c[10],p=c[11],o=c[12],s=c[13],t=c[14],c=c[15];b[0].set(f-a,j-g,p-l,c-o);b[1].set(f+a,j+g,p+l,c+o);b[2].set(f+d,j+h,p+m,c+s);b[3].set(f-d,j-h,p-m,c-s);b[4].set(f-e,j-i,p-n,c-t);b[5].set(f+e,j+i,p+n,c+t);for(d=0;6>d;d++)a=b[d],a.divideScalar(Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z))};
THREE.Frustum.prototype.contains=function(a){for(var b=0,c=this.planes,b=a.matrixWorld,d=b.elements,a=-a.geometry.boundingSphere.radius*b.getMaxScaleOnAxis(),e=0;6>e;e++)if(b=c[e].x*d[12]+c[e].y*d[13]+c[e].z*d[14]+c[e].w,b<=a)return!1;return!0};THREE.Frustum.__v1=new THREE.Vector3;
(function(a){a.Ray=function(b,c,d,e){this.origin=b||new a.Vector3;this.direction=c||new a.Vector3;this.near=d||0;this.far=e||Infinity};var b=new a.Vector3,c=new a.Vector3,d=new a.Vector3,e=new a.Vector3;new a.Vector3;var f=new a.Vector3,g=new a.Matrix4,h=function(a,b){return a.distance-b.distance},i=new a.Vector3,j=new a.Vector3,l=new a.Vector3,m=function(a,b,c){i.sub(c,a);var d=i.dot(b),a=j.add(a,l.copy(b).multiplyScalar(d));return c.distanceTo(a)},n=function(a,b,c,d){i.sub(d,b);j.sub(c,b);l.sub(a,
b);var a=i.dot(i),b=i.dot(j),c=i.dot(l),e=j.dot(j),d=j.dot(l),f=1/(a*e-b*b),e=(e*c-b*d)*f,a=(a*d-b*c)*f;return 0<=e&&0<=a&&1>e+a},p=function(h,i,j){if(h instanceof a.Particle){var l=m(i.origin,i.direction,h.matrixWorld.getPosition());if(l>h.scale.x)return j;j.push({distance:l,point:h.position,face:null,object:h})}else if(h instanceof a.Mesh){var o=h.geometry.boundingSphere.radius*h.matrixWorld.getMaxScaleOnAxis(),l=m(i.origin,i.direction,h.matrixWorld.getPosition());if(l>o)return j;var o=h.geometry,
p=o.vertices,E=h.material instanceof a.MeshFaceMaterial,A=!0===E?h.material.materials:null,l=h.material.side,v,u,D,C=i.precision;h.matrixRotationWorld.extractRotation(h.matrixWorld);b.copy(i.origin);g.getInverse(h.matrixWorld);c.copy(b);g.multiplyVector3(c);d.copy(i.direction);g.rotateAxis(d).normalize();for(var G=0,P=o.faces.length;G<P;G++){var B=o.faces[G],l=!0===E?A[B.materialIndex]:h.material;if(void 0!==l&&(l=l.side,e.sub(B.centroid,c),u=B.normal,v=d.dot(u),!(Math.abs(v)<C)&&(u=u.dot(e)/v,!(0>
u)&&(l===a.DoubleSide||(l===a.FrontSide?0>v:0<v)))))if(f.add(c,d.multiplyScalar(u)),B instanceof a.Face3)l=p[B.a],v=p[B.b],u=p[B.c],n(f,l,v,u)&&(v=h.matrixWorld.multiplyVector3(f.clone()),l=b.distanceTo(v),l<i.near||l>i.far||j.push({distance:l,point:v,face:B,faceIndex:G,object:h}));else if(B instanceof a.Face4&&(l=p[B.a],v=p[B.b],u=p[B.c],D=p[B.d],n(f,l,v,D)||n(f,v,u,D)))v=h.matrixWorld.multiplyVector3(f.clone()),l=b.distanceTo(v),l<i.near||l>i.far||j.push({distance:l,point:v,face:B,faceIndex:G,object:h})}}},
o=function(a,b,c){for(var a=a.getDescendants(),d=0,e=a.length;d<e;d++)p(a[d],b,c)};a.Ray.prototype.precision=1E-4;a.Ray.prototype.set=function(a,b){this.origin=a;this.direction=b};a.Ray.prototype.intersectObject=function(a,b){var c=[];!0===b&&o(a,this,c);p(a,this,c);c.sort(h);return c};a.Ray.prototype.intersectObjects=function(a,b){for(var c=[],d=0,e=a.length;d<e;d++)p(a[d],this,c),!0===b&&o(a[d],this,c);c.sort(h);return c}})(THREE);
THREE.Rectangle=function(){function a(){f=d-b;g=e-c}var b=0,c=0,d=0,e=0,f=0,g=0,h=!0;this.getX=function(){return b};this.getY=function(){return c};this.getWidth=function(){return f};this.getHeight=function(){return g};this.getLeft=function(){return b};this.getTop=function(){return c};this.getRight=function(){return d};this.getBottom=function(){return e};this.set=function(f,g,l,m){h=!1;b=f;c=g;d=l;e=m;a()};this.addPoint=function(f,g){!0===h?(h=!1,b=f,c=g,d=f,e=g):(b=b<f?b:f,c=c<g?c:g,d=d>f?d:f,e=e>
g?e:g);a()};this.add3Points=function(f,g,l,m,n,p){!0===h?(h=!1,b=f<l?f<n?f:n:l<n?l:n,c=g<m?g<p?g:p:m<p?m:p,d=f>l?f>n?f:n:l>n?l:n,e=g>m?g>p?g:p:m>p?m:p):(b=f<l?f<n?f<b?f:b:n<b?n:b:l<n?l<b?l:b:n<b?n:b,c=g<m?g<p?g<c?g:c:p<c?p:c:m<p?m<c?m:c:p<c?p:c,d=f>l?f>n?f>d?f:d:n>d?n:d:l>n?l>d?l:d:n>d?n:d,e=g>m?g>p?g>e?g:e:p>e?p:e:m>p?m>e?m:e:p>e?p:e);a()};this.addRectangle=function(f){!0===h?(h=!1,b=f.getLeft(),c=f.getTop(),d=f.getRight(),e=f.getBottom()):(b=b<f.getLeft()?b:f.getLeft(),c=c<f.getTop()?c:f.getTop(),
d=d>f.getRight()?d:f.getRight(),e=e>f.getBottom()?e:f.getBottom());a()};this.inflate=function(f){b-=f;c-=f;d+=f;e+=f;a()};this.minSelf=function(f){b=b>f.getLeft()?b:f.getLeft();c=c>f.getTop()?c:f.getTop();d=d<f.getRight()?d:f.getRight();e=e<f.getBottom()?e:f.getBottom();a()};this.intersects=function(a){return d<a.getLeft()||b>a.getRight()||e<a.getTop()||c>a.getBottom()?!1:!0};this.empty=function(){h=!0;e=d=c=b=0;a()};this.isEmpty=function(){return h}};
THREE.Math={clamp:function(a,b,c){return a<b?b:a>c?c:a},clampBottom:function(a,b){return a<b?b:a},mapLinear:function(a,b,c,d,e){return d+(a-b)*(e-d)/(c-b)},random16:function(){return(65280*Math.random()+255*Math.random())/65535},randInt:function(a,b){return a+Math.floor(Math.random()*(b-a+1))},randFloat:function(a,b){return a+Math.random()*(b-a)},randFloatSpread:function(a){return a*(0.5-Math.random())},sign:function(a){return 0>a?-1:0<a?1:0}};
THREE.Object3D=function(){THREE.Object3DLibrary.push(this);this.id=THREE.Object3DIdCount++;this.name="";this.properties={};this.parent=void 0;this.children=[];this.up=new THREE.Vector3(0,1,0);this.position=new THREE.Vector3;this.rotation=new THREE.Vector3;this.eulerOrder=THREE.Object3D.defaultEulerOrder;this.scale=new THREE.Vector3(1,1,1);this.renderDepth=null;this.rotationAutoUpdate=!0;this.matrix=new THREE.Matrix4;this.matrixWorld=new THREE.Matrix4;this.matrixRotationWorld=new THREE.Matrix4;this.matrixWorldNeedsUpdate=
this.matrixAutoUpdate=!0;this.quaternion=new THREE.Quaternion;this.useQuaternion=!1;this.boundRadius=0;this.boundRadiusScale=1;this.visible=!0;this.receiveShadow=this.castShadow=!1;this.frustumCulled=!0;this._vector=new THREE.Vector3};
THREE.Object3D.prototype={constructor:THREE.Object3D,applyMatrix:function(a){this.matrix.multiply(a,this.matrix);this.scale.getScaleFromMatrix(this.matrix);a=(new THREE.Matrix4).extractRotation(this.matrix);this.rotation.setEulerFromRotationMatrix(a,this.eulerOrder);this.position.getPositionFromMatrix(this.matrix)},translate:function(a,b){this.matrix.rotateAxis(b);this.position.addSelf(b.multiplyScalar(a))},translateX:function(a){this.translate(a,this._vector.set(1,0,0))},translateY:function(a){this.translate(a,
this._vector.set(0,1,0))},translateZ:function(a){this.translate(a,this._vector.set(0,0,1))},localToWorld:function(a){return this.matrixWorld.multiplyVector3(a)},worldToLocal:function(a){return THREE.Object3D.__m1.getInverse(this.matrixWorld).multiplyVector3(a)},lookAt:function(a){this.matrix.lookAt(a,this.position,this.up);this.rotationAutoUpdate&&(!1===this.useQuaternion?this.rotation.setEulerFromRotationMatrix(this.matrix,this.eulerOrder):this.quaternion.copy(this.matrix.decompose()[1]))},add:function(a){if(a===
this)console.warn("THREE.Object3D.add: An object can't be added as a child of itself.");else if(a instanceof THREE.Object3D){void 0!==a.parent&&a.parent.remove(a);a.parent=this;this.children.push(a);for(var b=this;void 0!==b.parent;)b=b.parent;void 0!==b&&b instanceof THREE.Scene&&b.__addObject(a)}},remove:function(a){var b=this.children.indexOf(a);if(-1!==b){a.parent=void 0;this.children.splice(b,1);for(b=this;void 0!==b.parent;)b=b.parent;void 0!==b&&b instanceof THREE.Scene&&b.__removeObject(a)}},
traverse:function(a){a(this);for(var b=0,c=this.children.length;b<c;b++)this.children[b].traverse(a)},getChildByName:function(a,b){for(var c=0,d=this.children.length;c<d;c++){var e=this.children[c];if(e.name===a||!0===b&&(e=e.getChildByName(a,b),void 0!==e))return e}},getDescendants:function(a){void 0===a&&(a=[]);Array.prototype.push.apply(a,this.children);for(var b=0,c=this.children.length;b<c;b++)this.children[b].getDescendants(a);return a},updateMatrix:function(){this.matrix.setPosition(this.position);
!1===this.useQuaternion?this.matrix.setRotationFromEuler(this.rotation,this.eulerOrder):this.matrix.setRotationFromQuaternion(this.quaternion);if(1!==this.scale.x||1!==this.scale.y||1!==this.scale.z)this.matrix.scale(this.scale),this.boundRadiusScale=Math.max(this.scale.x,Math.max(this.scale.y,this.scale.z));this.matrixWorldNeedsUpdate=!0},updateMatrixWorld:function(a){!0===this.matrixAutoUpdate&&this.updateMatrix();if(!0===this.matrixWorldNeedsUpdate||!0===a)void 0===this.parent?this.matrixWorld.copy(this.matrix):
this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,a=!0;for(var b=0,c=this.children.length;b<c;b++)this.children[b].updateMatrixWorld(a)},clone:function(a){void 0===a&&(a=new THREE.Object3D);a.name=this.name;a.up.copy(this.up);a.position.copy(this.position);a.rotation instanceof THREE.Vector3&&a.rotation.copy(this.rotation);a.eulerOrder=this.eulerOrder;a.scale.copy(this.scale);a.renderDepth=this.renderDepth;a.rotationAutoUpdate=this.rotationAutoUpdate;a.matrix.copy(this.matrix);
a.matrixWorld.copy(this.matrixWorld);a.matrixRotationWorld.copy(this.matrixRotationWorld);a.matrixAutoUpdate=this.matrixAutoUpdate;a.matrixWorldNeedsUpdate=this.matrixWorldNeedsUpdate;a.quaternion.copy(this.quaternion);a.useQuaternion=this.useQuaternion;a.boundRadius=this.boundRadius;a.boundRadiusScale=this.boundRadiusScale;a.visible=this.visible;a.castShadow=this.castShadow;a.receiveShadow=this.receiveShadow;a.frustumCulled=this.frustumCulled;for(var b=0;b<this.children.length;b++)a.add(this.children[b].clone());
return a},deallocate:function(){var a=THREE.Object3DLibrary.indexOf(this);-1!==a&&THREE.Object3DLibrary.splice(a,1)}};THREE.Object3D.__m1=new THREE.Matrix4;THREE.Object3D.defaultEulerOrder="XYZ";THREE.Object3DIdCount=0;THREE.Object3DLibrary=[];
THREE.Projector=function(){function a(){if(f===h){var a=new THREE.RenderableObject;g.push(a);h++;f++;return a}return g[f++]}function b(){if(j===m){var a=new THREE.RenderableVertex;l.push(a);m++;j++;return a}return l[j++]}function c(a,b){return b.z-a.z}function d(a,b){var c=0,d=1,e=a.z+a.w,f=b.z+b.w,g=-a.z+a.w,h=-b.z+b.w;if(0<=e&&0<=f&&0<=g&&0<=h)return!0;if(0>e&&0>f||0>g&&0>h)return!1;0>e?c=Math.max(c,e/(e-f)):0>f&&(d=Math.min(d,e/(e-f)));0>g?c=Math.max(c,g/(g-h)):0>h&&(d=Math.min(d,g/(g-h)));if(d<
c)return!1;a.lerpSelf(b,c);b.lerpSelf(a,1-d);return!0}var e,f,g=[],h=0,i,j,l=[],m=0,n,p,o=[],s=0,t,r=[],z=0,w,q,E=[],A=0,v,u,D=[],C=0,G={objects:[],sprites:[],lights:[],elements:[]},P=new THREE.Vector3,B=new THREE.Vector4,K=new THREE.Matrix4,H=new THREE.Matrix4,I=new THREE.Matrix3,N=new THREE.Frustum,O=new THREE.Vector4,R=new THREE.Vector4;this.projectVector=function(a,b){b.matrixWorldInverse.getInverse(b.matrixWorld);K.multiply(b.projectionMatrix,b.matrixWorldInverse);K.multiplyVector3(a);return a};
this.unprojectVector=function(a,b){b.projectionMatrixInverse.getInverse(b.projectionMatrix);K.multiply(b.matrixWorld,b.projectionMatrixInverse);K.multiplyVector3(a);return a};this.pickingRay=function(a,b){var c;a.z=-1;c=new THREE.Vector3(a.x,a.y,1);this.unprojectVector(a,b);this.unprojectVector(c,b);c.subSelf(a).normalize();return new THREE.Ray(a,c)};this.projectScene=function(g,h,m,Q){var Z=h.near,L=h.far,oa=!1,X,fa,ca,Y,ba,aa,ia,Aa,Na,Ja,ma,sa,Ea,rb,ib;u=q=t=p=0;G.elements.length=0;g.updateMatrixWorld();
void 0===h.parent&&h.updateMatrixWorld();h.matrixWorldInverse.getInverse(h.matrixWorld);K.multiply(h.projectionMatrix,h.matrixWorldInverse);N.setFromMatrix(K);f=0;G.objects.length=0;G.sprites.length=0;G.lights.length=0;var ob=function(b){for(var c=0,d=b.children.length;c<d;c++){var f=b.children[c];if(!1!==f.visible){if(f instanceof THREE.Light)G.lights.push(f);else if(f instanceof THREE.Mesh||f instanceof THREE.Line){if(!1===f.frustumCulled||!0===N.contains(f))e=a(),e.object=f,null!==f.renderDepth?
e.z=f.renderDepth:(P.copy(f.matrixWorld.getPosition()),K.multiplyVector3(P),e.z=P.z),G.objects.push(e)}else f instanceof THREE.Sprite||f instanceof THREE.Particle?(e=a(),e.object=f,null!==f.renderDepth?e.z=f.renderDepth:(P.copy(f.matrixWorld.getPosition()),K.multiplyVector3(P),e.z=P.z),G.sprites.push(e)):(e=a(),e.object=f,null!==f.renderDepth?e.z=f.renderDepth:(P.copy(f.matrixWorld.getPosition()),K.multiplyVector3(P),e.z=P.z),G.objects.push(e));ob(f)}}};ob(g);!0===m&&G.objects.sort(c);g=0;for(m=G.objects.length;g<
m;g++)if(Aa=G.objects[g].object,Na=Aa.matrixWorld,j=0,Aa instanceof THREE.Mesh){Ja=Aa.geometry;ca=Ja.vertices;ma=Ja.faces;Ja=Ja.faceVertexUvs;I.getInverse(Na);I.transpose();Ea=Aa.material instanceof THREE.MeshFaceMaterial;rb=!0===Ea?Aa.material:null;X=0;for(fa=ca.length;X<fa;X++)i=b(),i.positionWorld.copy(ca[X]),Na.multiplyVector3(i.positionWorld),i.positionScreen.copy(i.positionWorld),K.multiplyVector4(i.positionScreen),i.positionScreen.x/=i.positionScreen.w,i.positionScreen.y/=i.positionScreen.w,
i.visible=i.positionScreen.z>Z&&i.positionScreen.z<L;ca=0;for(X=ma.length;ca<X;ca++)if(fa=ma[ca],ib=!0===Ea?rb.materials[fa.materialIndex]:Aa.material,void 0!==ib){aa=ib.side;if(fa instanceof THREE.Face3)if(Y=l[fa.a],ba=l[fa.b],ia=l[fa.c],!0===Y.visible&&!0===ba.visible&&!0===ia.visible)if(oa=0>(ia.positionScreen.x-Y.positionScreen.x)*(ba.positionScreen.y-Y.positionScreen.y)-(ia.positionScreen.y-Y.positionScreen.y)*(ba.positionScreen.x-Y.positionScreen.x),aa===THREE.DoubleSide||oa===(aa===THREE.FrontSide))p===
s?(sa=new THREE.RenderableFace3,o.push(sa),s++,p++,n=sa):n=o[p++],n.v1.copy(Y),n.v2.copy(ba),n.v3.copy(ia);else continue;else continue;else if(fa instanceof THREE.Face4)if(Y=l[fa.a],ba=l[fa.b],ia=l[fa.c],sa=l[fa.d],!0===Y.visible&&!0===ba.visible&&!0===ia.visible&&!0===sa.visible)if(oa=0>(sa.positionScreen.x-Y.positionScreen.x)*(ba.positionScreen.y-Y.positionScreen.y)-(sa.positionScreen.y-Y.positionScreen.y)*(ba.positionScreen.x-Y.positionScreen.x)||0>(ba.positionScreen.x-ia.positionScreen.x)*(sa.positionScreen.y-
ia.positionScreen.y)-(ba.positionScreen.y-ia.positionScreen.y)*(sa.positionScreen.x-ia.positionScreen.x),aa===THREE.DoubleSide||oa===(aa===THREE.FrontSide)){if(t===z){var jb=new THREE.RenderableFace4;r.push(jb);z++;t++;n=jb}else n=r[t++];n.v1.copy(Y);n.v2.copy(ba);n.v3.copy(ia);n.v4.copy(sa)}else continue;else continue;n.normalWorld.copy(fa.normal);!1===oa&&(aa===THREE.BackSide||aa===THREE.DoubleSide)&&n.normalWorld.negate();I.multiplyVector3(n.normalWorld).normalize();n.centroidWorld.copy(fa.centroid);
Na.multiplyVector3(n.centroidWorld);n.centroidScreen.copy(n.centroidWorld);K.multiplyVector3(n.centroidScreen);ia=fa.vertexNormals;Y=0;for(ba=ia.length;Y<ba;Y++)sa=n.vertexNormalsWorld[Y],sa.copy(ia[Y]),!1===oa&&(aa===THREE.BackSide||aa===THREE.DoubleSide)&&sa.negate(),I.multiplyVector3(sa).normalize();n.vertexNormalsLength=ia.length;Y=0;for(ba=Ja.length;Y<ba;Y++)if(sa=Ja[Y][ca],void 0!==sa){aa=0;for(ia=sa.length;aa<ia;aa++)n.uvs[Y][aa]=sa[aa]}n.color=fa.color;n.material=ib;n.z=n.centroidScreen.z;
G.elements.push(n)}}else if(Aa instanceof THREE.Line){H.multiply(K,Na);ca=Aa.geometry.vertices;Y=b();Y.positionScreen.copy(ca[0]);H.multiplyVector4(Y.positionScreen);Na=Aa.type===THREE.LinePieces?2:1;X=1;for(fa=ca.length;X<fa;X++)Y=b(),Y.positionScreen.copy(ca[X]),H.multiplyVector4(Y.positionScreen),0<(X+1)%Na||(ba=l[j-2],O.copy(Y.positionScreen),R.copy(ba.positionScreen),!0===d(O,R)&&(O.multiplyScalar(1/O.w),R.multiplyScalar(1/R.w),q===A?(ma=new THREE.RenderableLine,E.push(ma),A++,q++,w=ma):w=E[q++],
w.v1.positionScreen.copy(O),w.v2.positionScreen.copy(R),w.z=Math.max(O.z,R.z),w.material=Aa.material,G.elements.push(w)))}g=0;for(m=G.sprites.length;g<m;g++)Aa=G.sprites[g].object,Na=Aa.matrixWorld,Aa instanceof THREE.Particle&&(B.set(Na.elements[12],Na.elements[13],Na.elements[14],1),K.multiplyVector4(B),B.z/=B.w,0<B.z&&1>B.z&&(u===C?(Z=new THREE.RenderableParticle,D.push(Z),C++,u++,v=Z):v=D[u++],v.object=Aa,v.x=B.x/B.w,v.y=B.y/B.w,v.z=B.z,v.rotation=Aa.rotation.z,v.scale.x=Aa.scale.x*Math.abs(v.x-
(B.x+h.projectionMatrix.elements[0])/(B.w+h.projectionMatrix.elements[12])),v.scale.y=Aa.scale.y*Math.abs(v.y-(B.y+h.projectionMatrix.elements[5])/(B.w+h.projectionMatrix.elements[13])),v.material=Aa.material,G.elements.push(v)));!0===Q&&G.elements.sort(c);return G}};THREE.Quaternion=function(a,b,c,d){this.x=a||0;this.y=b||0;this.z=c||0;this.w=void 0!==d?d:1};
THREE.Quaternion.prototype={constructor:THREE.Quaternion,set:function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d;return this},copy:function(a){this.x=a.x;this.y=a.y;this.z=a.z;this.w=a.w;return this},setFromEuler:function(a,b){var c=Math.cos(a.x/2),d=Math.cos(a.y/2),e=Math.cos(a.z/2),f=Math.sin(a.x/2),g=Math.sin(a.y/2),h=Math.sin(a.z/2);void 0===b||"XYZ"===b?(this.x=f*d*e+c*g*h,this.y=c*g*e-f*d*h,this.z=c*d*h+f*g*e,this.w=c*d*e-f*g*h):"YXZ"===b?(this.x=f*d*e+c*g*h,this.y=c*g*e-f*d*h,this.z=c*d*
h-f*g*e,this.w=c*d*e+f*g*h):"ZXY"===b?(this.x=f*d*e-c*g*h,this.y=c*g*e+f*d*h,this.z=c*d*h+f*g*e,this.w=c*d*e-f*g*h):"ZYX"===b?(this.x=f*d*e-c*g*h,this.y=c*g*e+f*d*h,this.z=c*d*h-f*g*e,this.w=c*d*e+f*g*h):"YZX"===b?(this.x=f*d*e+c*g*h,this.y=c*g*e+f*d*h,this.z=c*d*h-f*g*e,this.w=c*d*e-f*g*h):"XZY"===b&&(this.x=f*d*e-c*g*h,this.y=c*g*e-f*d*h,this.z=c*d*h+f*g*e,this.w=c*d*e+f*g*h);return this},setFromAxisAngle:function(a,b){var c=b/2,d=Math.sin(c);this.x=a.x*d;this.y=a.y*d;this.z=a.z*d;this.w=Math.cos(c);
return this},setFromRotationMatrix:function(a){var b=a.elements,c=b[0],a=b[4],d=b[8],e=b[1],f=b[5],g=b[9],h=b[2],i=b[6],b=b[10],j=c+f+b;0<j?(c=0.5/Math.sqrt(j+1),this.w=0.25/c,this.x=(i-g)*c,this.y=(d-h)*c,this.z=(e-a)*c):c>f&&c>b?(c=2*Math.sqrt(1+c-f-b),this.w=(i-g)/c,this.x=0.25*c,this.y=(a+e)/c,this.z=(d+h)/c):f>b?(c=2*Math.sqrt(1+f-c-b),this.w=(d-h)/c,this.x=(a+e)/c,this.y=0.25*c,this.z=(g+i)/c):(c=2*Math.sqrt(1+b-c-f),this.w=(e-a)/c,this.x=(d+h)/c,this.y=(g+i)/c,this.z=0.25*c);return this},inverse:function(){this.conjugate().normalize();
return this},conjugate:function(){this.x*=-1;this.y*=-1;this.z*=-1;return this},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)},normalize:function(){var a=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);0===a?(this.z=this.y=this.x=0,this.w=1):(a=1/a,this.x*=a,this.y*=a,this.z*=a,this.w*=a);return this},multiply:function(a,b){var c=a.x,d=a.y,e=a.z,f=a.w,g=b.x,h=b.y,i=b.z,j=b.w;this.x=c*j+d*i-e*h+f*g;this.y=-c*i+d*j+e*g+f*h;this.z=c*h-
d*g+e*j+f*i;this.w=-c*g-d*h-e*i+f*j;return this},multiplySelf:function(a){var b=this.x,c=this.y,d=this.z,e=this.w,f=a.x,g=a.y,h=a.z,a=a.w;this.x=b*a+e*f+c*h-d*g;this.y=c*a+e*g+d*f-b*h;this.z=d*a+e*h+b*g-c*f;this.w=e*a-b*f-c*g-d*h;return this},multiplyVector3:function(a,b){b||(b=a);var c=a.x,d=a.y,e=a.z,f=this.x,g=this.y,h=this.z,i=this.w,j=i*c+g*e-h*d,l=i*d+h*c-f*e,m=i*e+f*d-g*c,c=-f*c-g*d-h*e;b.x=j*i+c*-f+l*-h-m*-g;b.y=l*i+c*-g+m*-f-j*-h;b.z=m*i+c*-h+j*-g-l*-f;return b},slerpSelf:function(a,b){var c=
this.x,d=this.y,e=this.z,f=this.w,g=f*a.w+c*a.x+d*a.y+e*a.z;0>g?(this.w=-a.w,this.x=-a.x,this.y=-a.y,this.z=-a.z,g=-g):this.copy(a);if(1<=g)return this.w=f,this.x=c,this.y=d,this.z=e,this;var h=Math.acos(g),i=Math.sqrt(1-g*g);if(0.001>Math.abs(i))return this.w=0.5*(f+this.w),this.x=0.5*(c+this.x),this.y=0.5*(d+this.y),this.z=0.5*(e+this.z),this;g=Math.sin((1-b)*h)/i;h=Math.sin(b*h)/i;this.w=f*g+this.w*h;this.x=c*g+this.x*h;this.y=d*g+this.y*h;this.z=e*g+this.z*h;return this},clone:function(){return new THREE.Quaternion(this.x,
this.y,this.z,this.w)}};THREE.Quaternion.slerp=function(a,b,c,d){var e=a.w*b.w+a.x*b.x+a.y*b.y+a.z*b.z;0>e?(c.w=-b.w,c.x=-b.x,c.y=-b.y,c.z=-b.z,e=-e):c.copy(b);if(1<=Math.abs(e))return c.w=a.w,c.x=a.x,c.y=a.y,c.z=a.z,c;var b=Math.acos(e),f=Math.sqrt(1-e*e);if(0.001>Math.abs(f))return c.w=0.5*(a.w+c.w),c.x=0.5*(a.x+c.x),c.y=0.5*(a.y+c.y),c.z=0.5*(a.z+c.z),c;e=Math.sin((1-d)*b)/f;d=Math.sin(d*b)/f;c.w=a.w*e+c.w*d;c.x=a.x*e+c.x*d;c.y=a.y*e+c.y*d;c.z=a.z*e+c.z*d;return c};
THREE.Vertex=function(a){console.warn("THREE.Vertex has been DEPRECATED. Use THREE.Vector3 instead.");return a};THREE.Face3=function(a,b,c,d,e,f){this.a=a;this.b=b;this.c=c;this.normal=d instanceof THREE.Vector3?d:new THREE.Vector3;this.vertexNormals=d instanceof Array?d:[];this.color=e instanceof THREE.Color?e:new THREE.Color;this.vertexColors=e instanceof Array?e:[];this.vertexTangents=[];this.materialIndex=f;this.centroid=new THREE.Vector3};
THREE.Face3.prototype={constructor:THREE.Face3,clone:function(){var a=new THREE.Face3(this.a,this.b,this.c);a.normal.copy(this.normal);a.color.copy(this.color);a.centroid.copy(this.centroid);a.materialIndex=this.materialIndex;var b,c;b=0;for(c=this.vertexNormals.length;b<c;b++)a.vertexNormals[b]=this.vertexNormals[b].clone();b=0;for(c=this.vertexColors.length;b<c;b++)a.vertexColors[b]=this.vertexColors[b].clone();b=0;for(c=this.vertexTangents.length;b<c;b++)a.vertexTangents[b]=this.vertexTangents[b].clone();
return a}};THREE.Face4=function(a,b,c,d,e,f,g){this.a=a;this.b=b;this.c=c;this.d=d;this.normal=e instanceof THREE.Vector3?e:new THREE.Vector3;this.vertexNormals=e instanceof Array?e:[];this.color=f instanceof THREE.Color?f:new THREE.Color;this.vertexColors=f instanceof Array?f:[];this.vertexTangents=[];this.materialIndex=g;this.centroid=new THREE.Vector3};
THREE.Face4.prototype={constructor:THREE.Face4,clone:function(){var a=new THREE.Face4(this.a,this.b,this.c,this.d);a.normal.copy(this.normal);a.color.copy(this.color);a.centroid.copy(this.centroid);a.materialIndex=this.materialIndex;var b,c;b=0;for(c=this.vertexNormals.length;b<c;b++)a.vertexNormals[b]=this.vertexNormals[b].clone();b=0;for(c=this.vertexColors.length;b<c;b++)a.vertexColors[b]=this.vertexColors[b].clone();b=0;for(c=this.vertexTangents.length;b<c;b++)a.vertexTangents[b]=this.vertexTangents[b].clone();
return a}};THREE.UV=function(a,b){this.u=a||0;this.v=b||0};THREE.UV.prototype={constructor:THREE.UV,set:function(a,b){this.u=a;this.v=b;return this},copy:function(a){this.u=a.u;this.v=a.v;return this},lerpSelf:function(a,b){this.u+=(a.u-this.u)*b;this.v+=(a.v-this.v)*b;return this},clone:function(){return new THREE.UV(this.u,this.v)}};
THREE.Geometry=function(){THREE.GeometryLibrary.push(this);this.id=THREE.GeometryIdCount++;this.name="";this.vertices=[];this.colors=[];this.normals=[];this.faces=[];this.faceUvs=[[]];this.faceVertexUvs=[[]];this.morphTargets=[];this.morphColors=[];this.morphNormals=[];this.skinWeights=[];this.skinIndices=[];this.lineDistances=[];this.boundingSphere=this.boundingBox=null;this.hasTangents=!1;this.dynamic=!0;this.buffersNeedUpdate=this.lineDistancesNeedUpdate=this.colorsNeedUpdate=this.tangentsNeedUpdate=
this.normalsNeedUpdate=this.uvsNeedUpdate=this.elementsNeedUpdate=this.verticesNeedUpdate=!1};
THREE.Geometry.prototype={constructor:THREE.Geometry,applyMatrix:function(a){var b=new THREE.Matrix3;b.getInverse(a).transpose();for(var c=0,d=this.vertices.length;c<d;c++)a.multiplyVector3(this.vertices[c]);c=0;for(d=this.faces.length;c<d;c++){var e=this.faces[c];b.multiplyVector3(e.normal).normalize();for(var f=0,g=e.vertexNormals.length;f<g;f++)b.multiplyVector3(e.vertexNormals[f]).normalize();a.multiplyVector3(e.centroid)}},computeCentroids:function(){var a,b,c;a=0;for(b=this.faces.length;a<b;a++)c=
this.faces[a],c.centroid.set(0,0,0),c instanceof THREE.Face3?(c.centroid.addSelf(this.vertices[c.a]),c.centroid.addSelf(this.vertices[c.b]),c.centroid.addSelf(this.vertices[c.c]),c.centroid.divideScalar(3)):c instanceof THREE.Face4&&(c.centroid.addSelf(this.vertices[c.a]),c.centroid.addSelf(this.vertices[c.b]),c.centroid.addSelf(this.vertices[c.c]),c.centroid.addSelf(this.vertices[c.d]),c.centroid.divideScalar(4))},computeFaceNormals:function(){var a,b,c,d,e,f,g=new THREE.Vector3,h=new THREE.Vector3;
a=0;for(b=this.faces.length;a<b;a++)c=this.faces[a],d=this.vertices[c.a],e=this.vertices[c.b],f=this.vertices[c.c],g.sub(f,e),h.sub(d,e),g.crossSelf(h),g.normalize(),c.normal.copy(g)},computeVertexNormals:function(a){var b,c,d,e;if(void 0===this.__tmpVertices){e=this.__tmpVertices=Array(this.vertices.length);b=0;for(c=this.vertices.length;b<c;b++)e[b]=new THREE.Vector3;b=0;for(c=this.faces.length;b<c;b++)d=this.faces[b],d instanceof THREE.Face3?d.vertexNormals=[new THREE.Vector3,new THREE.Vector3,
new THREE.Vector3]:d instanceof THREE.Face4&&(d.vertexNormals=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3])}else{e=this.__tmpVertices;b=0;for(c=this.vertices.length;b<c;b++)e[b].set(0,0,0)}if(a){var f,g,h,i=new THREE.Vector3,j=new THREE.Vector3,l=new THREE.Vector3,m=new THREE.Vector3,n=new THREE.Vector3;b=0;for(c=this.faces.length;b<c;b++)d=this.faces[b],d instanceof THREE.Face3?(a=this.vertices[d.a],f=this.vertices[d.b],g=this.vertices[d.c],i.sub(g,f),j.sub(a,f),i.crossSelf(j),
e[d.a].addSelf(i),e[d.b].addSelf(i),e[d.c].addSelf(i)):d instanceof THREE.Face4&&(a=this.vertices[d.a],f=this.vertices[d.b],g=this.vertices[d.c],h=this.vertices[d.d],l.sub(h,f),j.sub(a,f),l.crossSelf(j),e[d.a].addSelf(l),e[d.b].addSelf(l),e[d.d].addSelf(l),m.sub(h,g),n.sub(f,g),m.crossSelf(n),e[d.b].addSelf(m),e[d.c].addSelf(m),e[d.d].addSelf(m))}else{b=0;for(c=this.faces.length;b<c;b++)d=this.faces[b],d instanceof THREE.Face3?(e[d.a].addSelf(d.normal),e[d.b].addSelf(d.normal),e[d.c].addSelf(d.normal)):
d instanceof THREE.Face4&&(e[d.a].addSelf(d.normal),e[d.b].addSelf(d.normal),e[d.c].addSelf(d.normal),e[d.d].addSelf(d.normal))}b=0;for(c=this.vertices.length;b<c;b++)e[b].normalize();b=0;for(c=this.faces.length;b<c;b++)d=this.faces[b],d instanceof THREE.Face3?(d.vertexNormals[0].copy(e[d.a]),d.vertexNormals[1].copy(e[d.b]),d.vertexNormals[2].copy(e[d.c])):d instanceof THREE.Face4&&(d.vertexNormals[0].copy(e[d.a]),d.vertexNormals[1].copy(e[d.b]),d.vertexNormals[2].copy(e[d.c]),d.vertexNormals[3].copy(e[d.d]))},
computeMorphNormals:function(){var a,b,c,d,e;c=0;for(d=this.faces.length;c<d;c++){e=this.faces[c];e.__originalFaceNormal?e.__originalFaceNormal.copy(e.normal):e.__originalFaceNormal=e.normal.clone();e.__originalVertexNormals||(e.__originalVertexNormals=[]);a=0;for(b=e.vertexNormals.length;a<b;a++)e.__originalVertexNormals[a]?e.__originalVertexNormals[a].copy(e.vertexNormals[a]):e.__originalVertexNormals[a]=e.vertexNormals[a].clone()}var f=new THREE.Geometry;f.faces=this.faces;a=0;for(b=this.morphTargets.length;a<
b;a++){if(!this.morphNormals[a]){this.morphNormals[a]={};this.morphNormals[a].faceNormals=[];this.morphNormals[a].vertexNormals=[];var g=this.morphNormals[a].faceNormals,h=this.morphNormals[a].vertexNormals,i,j;c=0;for(d=this.faces.length;c<d;c++)e=this.faces[c],i=new THREE.Vector3,j=e instanceof THREE.Face3?{a:new THREE.Vector3,b:new THREE.Vector3,c:new THREE.Vector3}:{a:new THREE.Vector3,b:new THREE.Vector3,c:new THREE.Vector3,d:new THREE.Vector3},g.push(i),h.push(j)}g=this.morphNormals[a];f.vertices=
this.morphTargets[a].vertices;f.computeFaceNormals();f.computeVertexNormals();c=0;for(d=this.faces.length;c<d;c++)e=this.faces[c],i=g.faceNormals[c],j=g.vertexNormals[c],i.copy(e.normal),e instanceof THREE.Face3?(j.a.copy(e.vertexNormals[0]),j.b.copy(e.vertexNormals[1]),j.c.copy(e.vertexNormals[2])):(j.a.copy(e.vertexNormals[0]),j.b.copy(e.vertexNormals[1]),j.c.copy(e.vertexNormals[2]),j.d.copy(e.vertexNormals[3]))}c=0;for(d=this.faces.length;c<d;c++)e=this.faces[c],e.normal=e.__originalFaceNormal,
e.vertexNormals=e.__originalVertexNormals},computeTangents:function(){function a(a,b,c,d,e,f,u){h=a.vertices[b];i=a.vertices[c];j=a.vertices[d];l=g[e];m=g[f];n=g[u];p=i.x-h.x;o=j.x-h.x;s=i.y-h.y;t=j.y-h.y;r=i.z-h.z;z=j.z-h.z;w=m.u-l.u;q=n.u-l.u;E=m.v-l.v;A=n.v-l.v;v=1/(w*A-q*E);G.set((A*p-E*o)*v,(A*s-E*t)*v,(A*r-E*z)*v);P.set((w*o-q*p)*v,(w*t-q*s)*v,(w*z-q*r)*v);D[b].addSelf(G);D[c].addSelf(G);D[d].addSelf(G);C[b].addSelf(P);C[c].addSelf(P);C[d].addSelf(P)}var b,c,d,e,f,g,h,i,j,l,m,n,p,o,s,t,r,z,
w,q,E,A,v,u,D=[],C=[],G=new THREE.Vector3,P=new THREE.Vector3,B=new THREE.Vector3,K=new THREE.Vector3,H=new THREE.Vector3;b=0;for(c=this.vertices.length;b<c;b++)D[b]=new THREE.Vector3,C[b]=new THREE.Vector3;b=0;for(c=this.faces.length;b<c;b++)f=this.faces[b],g=this.faceVertexUvs[0][b],f instanceof THREE.Face3?a(this,f.a,f.b,f.c,0,1,2):f instanceof THREE.Face4&&(a(this,f.a,f.b,f.d,0,1,3),a(this,f.b,f.c,f.d,1,2,3));var I=["a","b","c","d"];b=0;for(c=this.faces.length;b<c;b++){f=this.faces[b];for(d=0;d<
f.vertexNormals.length;d++)H.copy(f.vertexNormals[d]),e=f[I[d]],u=D[e],B.copy(u),B.subSelf(H.multiplyScalar(H.dot(u))).normalize(),K.cross(f.vertexNormals[d],u),e=K.dot(C[e]),e=0>e?-1:1,f.vertexTangents[d]=new THREE.Vector4(B.x,B.y,B.z,e)}this.hasTangents=!0},computeLineDistances:function(){for(var a=0,b=this.vertices,c=0,d=b.length;c<d;c++)0<c&&(a+=b[c].distanceTo(b[c-1])),this.lineDistances[c]=a},computeBoundingBox:function(){this.boundingBox||(this.boundingBox={min:new THREE.Vector3,max:new THREE.Vector3});
if(0<this.vertices.length){var a;a=this.vertices[0];this.boundingBox.min.copy(a);this.boundingBox.max.copy(a);for(var b=this.boundingBox.min,c=this.boundingBox.max,d=1,e=this.vertices.length;d<e;d++)(a=this.vertices[d],a.x<b.x?b.x=a.x:a.x>c.x&&(c.x=a.x),a.y<b.y?b.y=a.y:a.y>c.y&&(c.y=a.y),a.z<b.z)?b.z=a.z:a.z>c.z&&(c.z=a.z)}else this.boundingBox.min.set(0,0,0),this.boundingBox.max.set(0,0,0)},computeBoundingSphere:function(){var a=0;null===this.boundingSphere&&(this.boundingSphere={radius:0});for(var b=
0,c=this.vertices.length;b<c;b++){var d=this.vertices[b].lengthSq();d>a&&(a=d)}this.boundingSphere.radius=Math.sqrt(a)},mergeVertices:function(){var a={},b=[],c=[],d,e=Math.pow(10,4),f,g,h,i;f=0;for(g=this.vertices.length;f<g;f++)d=this.vertices[f],d=[Math.round(d.x*e),Math.round(d.y*e),Math.round(d.z*e)].join("_"),void 0===a[d]?(a[d]=f,b.push(this.vertices[f]),c[f]=b.length-1):c[f]=c[a[d]];f=0;for(g=this.faces.length;f<g;f++)if(a=this.faces[f],a instanceof THREE.Face3)a.a=c[a.a],a.b=c[a.b],a.c=c[a.c];
else if(a instanceof THREE.Face4){a.a=c[a.a];a.b=c[a.b];a.c=c[a.c];a.d=c[a.d];d=[a.a,a.b,a.c,a.d];for(e=3;0<e;e--)if(d.indexOf(a["abcd"[e]])!==e){d.splice(e,1);this.faces[f]=new THREE.Face3(d[0],d[1],d[2],a.normal,a.color,a.materialIndex);d=0;for(h=this.faceVertexUvs.length;d<h;d++)(i=this.faceVertexUvs[d][f])&&i.splice(e,1);this.faces[f].vertexColors=a.vertexColors;break}}c=this.vertices.length-b.length;this.vertices=b;return c},clone:function(){for(var a=new THREE.Geometry,b=this.vertices,c=0,d=
b.length;c<d;c++)a.vertices.push(b[c].clone());b=this.faces;c=0;for(d=b.length;c<d;c++)a.faces.push(b[c].clone());b=this.faceVertexUvs[0];c=0;for(d=b.length;c<d;c++){for(var e=b[c],f=[],g=0,h=e.length;g<h;g++)f.push(new THREE.UV(e[g].u,e[g].v));a.faceVertexUvs[0].push(f)}return a},deallocate:function(){var a=THREE.GeometryLibrary.indexOf(this);-1!==a&&THREE.GeometryLibrary.splice(a,1)}};THREE.GeometryIdCount=0;THREE.GeometryLibrary=[];
THREE.BufferGeometry=function(){THREE.GeometryLibrary.push(this);this.id=THREE.GeometryIdCount++;this.attributes={};this.dynamic=!1;this.boundingSphere=this.boundingBox=null;this.hasTangents=!1;this.morphTargets=[]};
THREE.BufferGeometry.prototype={constructor:THREE.BufferGeometry,applyMatrix:function(a){var b,c;this.attributes.position&&(b=this.attributes.position.array);this.attributes.normal&&(c=this.attributes.normal.array);void 0!==b&&(a.multiplyVector3Array(b),this.verticesNeedUpdate=!0);void 0!==c&&(b=new THREE.Matrix3,b.getInverse(a).transpose(),b.multiplyVector3Array(c),this.normalizeNormals(),this.normalsNeedUpdate=!0)},computeBoundingBox:function(){this.boundingBox||(this.boundingBox={min:new THREE.Vector3(Infinity,
Infinity,Infinity),max:new THREE.Vector3(-Infinity,-Infinity,-Infinity)});var a=this.attributes.position.array;if(a)for(var b=this.boundingBox,c,d,e,f=0,g=a.length;f<g;f+=3)(c=a[f],d=a[f+1],e=a[f+2],c<b.min.x?b.min.x=c:c>b.max.x&&(b.max.x=c),d<b.min.y?b.min.y=d:d>b.max.y&&(b.max.y=d),e<b.min.z)?b.min.z=e:e>b.max.z&&(b.max.z=e);if(void 0===a||0===a.length)this.boundingBox.min.set(0,0,0),this.boundingBox.max.set(0,0,0)},computeBoundingSphere:function(){this.boundingSphere||(this.boundingSphere={radius:0});
var a=this.attributes.position.array;if(a){for(var b,c=0,d,e,f=0,g=a.length;f<g;f+=3)b=a[f],d=a[f+1],e=a[f+2],b=b*b+d*d+e*e,b>c&&(c=b);this.boundingSphere.radius=Math.sqrt(c)}},computeVertexNormals:function(){if(this.attributes.position&&this.attributes.index){var a,b,c,d;a=this.attributes.position.array.length;if(void 0===this.attributes.normal)this.attributes.normal={itemSize:3,array:new Float32Array(a),numItems:a};else{a=0;for(b=this.attributes.normal.array.length;a<b;a++)this.attributes.normal.array[a]=
0}var e=this.offsets,f=this.attributes.index.array,g=this.attributes.position.array,h=this.attributes.normal.array,i,j,l,m,n,p,o=new THREE.Vector3,s=new THREE.Vector3,t=new THREE.Vector3,r=new THREE.Vector3,z=new THREE.Vector3;c=0;for(d=e.length;c<d;++c){b=e[c].start;i=e[c].count;var w=e[c].index;a=b;for(b+=i;a<b;a+=3)i=w+f[a],j=w+f[a+1],l=w+f[a+2],m=g[3*i],n=g[3*i+1],p=g[3*i+2],o.set(m,n,p),m=g[3*j],n=g[3*j+1],p=g[3*j+2],s.set(m,n,p),m=g[3*l],n=g[3*l+1],p=g[3*l+2],t.set(m,n,p),r.sub(t,s),z.sub(o,
s),r.crossSelf(z),h[3*i]+=r.x,h[3*i+1]+=r.y,h[3*i+2]+=r.z,h[3*j]+=r.x,h[3*j+1]+=r.y,h[3*j+2]+=r.z,h[3*l]+=r.x,h[3*l+1]+=r.y,h[3*l+2]+=r.z}this.normalizeNormals();this.normalsNeedUpdate=!0}},normalizeNormals:function(){for(var a=this.attributes.normal.array,b,c,d,e=0,f=a.length;e<f;e+=3)b=a[e],c=a[e+1],d=a[e+2],b=1/Math.sqrt(b*b+c*c+d*d),a[e]*=b,a[e+1]*=b,a[e+2]*=b},computeTangents:function(){function a(a){ga.x=d[3*a];ga.y=d[3*a+1];ga.z=d[3*a+2];M.copy(ga);Q=i[a];O.copy(Q);O.subSelf(ga.multiplyScalar(ga.dot(Q))).normalize();
R.cross(M,Q);Z=R.dot(j[a]);J=0>Z?-1:1;h[4*a]=O.x;h[4*a+1]=O.y;h[4*a+2]=O.z;h[4*a+3]=J}if(void 0===this.attributes.index||void 0===this.attributes.position||void 0===this.attributes.normal||void 0===this.attributes.uv)console.warn("Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()");else{var b=this.attributes.index.array,c=this.attributes.position.array,d=this.attributes.normal.array,e=this.attributes.uv.array,f=c.length/3;if(void 0===this.attributes.tangent){var g=
4*f;this.attributes.tangent={itemSize:4,array:new Float32Array(g),numItems:g}}for(var h=this.attributes.tangent.array,i=[],j=[],g=0;g<f;g++)i[g]=new THREE.Vector3,j[g]=new THREE.Vector3;var l,m,n,p,o,s,t,r,z,w,q,E,A,v,u,f=new THREE.Vector3,g=new THREE.Vector3,D,C,G,P,B,K,H,I=this.offsets;G=0;for(P=I.length;G<P;++G){C=I[G].start;B=I[G].count;var N=I[G].index;D=C;for(C+=B;D<C;D+=3)B=N+b[D],K=N+b[D+1],H=N+b[D+2],l=c[3*B],m=c[3*B+1],n=c[3*B+2],p=c[3*K],o=c[3*K+1],s=c[3*K+2],t=c[3*H],r=c[3*H+1],z=c[3*
H+2],w=e[2*B],q=e[2*B+1],E=e[2*K],A=e[2*K+1],v=e[2*H],u=e[2*H+1],p-=l,l=t-l,o-=m,m=r-m,s-=n,n=z-n,E-=w,w=v-w,A-=q,q=u-q,u=1/(E*q-w*A),f.set((q*p-A*l)*u,(q*o-A*m)*u,(q*s-A*n)*u),g.set((E*l-w*p)*u,(E*m-w*o)*u,(E*n-w*s)*u),i[B].addSelf(f),i[K].addSelf(f),i[H].addSelf(f),j[B].addSelf(g),j[K].addSelf(g),j[H].addSelf(g)}var O=new THREE.Vector3,R=new THREE.Vector3,ga=new THREE.Vector3,M=new THREE.Vector3,J,Q,Z;G=0;for(P=I.length;G<P;++G){C=I[G].start;B=I[G].count;N=I[G].index;D=C;for(C+=B;D<C;D+=3)B=N+b[D],
K=N+b[D+1],H=N+b[D+2],a(B),a(K),a(H)}this.tangentsNeedUpdate=this.hasTangents=!0}},deallocate:function(){var a=THREE.GeometryLibrary.indexOf(this);-1!==a&&THREE.GeometryLibrary.splice(a,1)}};
THREE.Spline=function(a){function b(a,b,c,d,e,f,g){a=0.5*(c-a);d=0.5*(d-b);return(2*(b-c)+a+d)*g+(-3*(b-c)-2*a-d)*f+a*e+b}this.points=a;var c=[],d={x:0,y:0,z:0},e,f,g,h,i,j,l,m,n;this.initFromArray=function(a){this.points=[];for(var b=0;b<a.length;b++)this.points[b]={x:a[b][0],y:a[b][1],z:a[b][2]}};this.getPoint=function(a){e=(this.points.length-1)*a;f=Math.floor(e);g=e-f;c[0]=0===f?f:f-1;c[1]=f;c[2]=f>this.points.length-2?this.points.length-1:f+1;c[3]=f>this.points.length-3?this.points.length-1:
f+2;j=this.points[c[0]];l=this.points[c[1]];m=this.points[c[2]];n=this.points[c[3]];h=g*g;i=g*h;d.x=b(j.x,l.x,m.x,n.x,g,h,i);d.y=b(j.y,l.y,m.y,n.y,g,h,i);d.z=b(j.z,l.z,m.z,n.z,g,h,i);return d};this.getControlPointsArray=function(){var a,b,c=this.points.length,d=[];for(a=0;a<c;a++)b=this.points[a],d[a]=[b.x,b.y,b.z];return d};this.getLength=function(a){var b,c,d,e=b=b=0,f=new THREE.Vector3,g=new THREE.Vector3,h=[],i=0;h[0]=0;a||(a=100);c=this.points.length*a;f.copy(this.points[0]);for(a=1;a<c;a++)b=
a/c,d=this.getPoint(b),g.copy(d),i+=g.distanceTo(f),f.copy(d),b*=this.points.length-1,b=Math.floor(b),b!=e&&(h[b]=i,e=b);h[h.length]=i;return{chunks:h,total:i}};this.reparametrizeByArcLength=function(a){var b,c,d,e,f,g,h=[],i=new THREE.Vector3,j=this.getLength();h.push(i.copy(this.points[0]).clone());for(b=1;b<this.points.length;b++){c=j.chunks[b]-j.chunks[b-1];g=Math.ceil(a*c/j.total);e=(b-1)/(this.points.length-1);f=b/(this.points.length-1);for(c=1;c<g-1;c++)d=e+c*(1/g)*(f-e),d=this.getPoint(d),
h.push(i.copy(d).clone());h.push(i.copy(this.points[b]).clone())}this.points=h}};THREE.Camera=function(){THREE.Object3D.call(this);this.matrixWorldInverse=new THREE.Matrix4;this.projectionMatrix=new THREE.Matrix4;this.projectionMatrixInverse=new THREE.Matrix4};THREE.Camera.prototype=Object.create(THREE.Object3D.prototype);
THREE.Camera.prototype.lookAt=function(a){this.matrix.lookAt(this.position,a,this.up);!0===this.rotationAutoUpdate&&(!1===this.useQuaternion?this.rotation.setEulerFromRotationMatrix(this.matrix,this.eulerOrder):this.quaternion.copy(this.matrix.decompose()[1]))};THREE.OrthographicCamera=function(a,b,c,d,e,f){THREE.Camera.call(this);this.left=a;this.right=b;this.top=c;this.bottom=d;this.near=void 0!==e?e:0.1;this.far=void 0!==f?f:2E3;this.updateProjectionMatrix()};
THREE.OrthographicCamera.prototype=Object.create(THREE.Camera.prototype);THREE.OrthographicCamera.prototype.updateProjectionMatrix=function(){this.projectionMatrix.makeOrthographic(this.left,this.right,this.top,this.bottom,this.near,this.far)};THREE.PerspectiveCamera=function(a,b,c,d){THREE.Camera.call(this);this.fov=void 0!==a?a:50;this.aspect=void 0!==b?b:1;this.near=void 0!==c?c:0.1;this.far=void 0!==d?d:2E3;this.updateProjectionMatrix()};THREE.PerspectiveCamera.prototype=Object.create(THREE.Camera.prototype);
THREE.PerspectiveCamera.prototype.setLens=function(a,b){void 0===b&&(b=24);this.fov=2*Math.atan(b/(2*a))*(180/Math.PI);this.updateProjectionMatrix()};THREE.PerspectiveCamera.prototype.setViewOffset=function(a,b,c,d,e,f){this.fullWidth=a;this.fullHeight=b;this.x=c;this.y=d;this.width=e;this.height=f;this.updateProjectionMatrix()};
THREE.PerspectiveCamera.prototype.updateProjectionMatrix=function(){if(this.fullWidth){var a=this.fullWidth/this.fullHeight,b=Math.tan(this.fov*Math.PI/360)*this.near,c=-b,d=a*c,a=Math.abs(a*b-d),c=Math.abs(b-c);this.projectionMatrix.makeFrustum(d+this.x*a/this.fullWidth,d+(this.x+this.width)*a/this.fullWidth,b-(this.y+this.height)*c/this.fullHeight,b-this.y*c/this.fullHeight,this.near,this.far)}else this.projectionMatrix.makePerspective(this.fov,this.aspect,this.near,this.far)};
THREE.Light=function(a){THREE.Object3D.call(this);this.color=new THREE.Color(a)};THREE.Light.prototype=Object.create(THREE.Object3D.prototype);THREE.AmbientLight=function(a){THREE.Light.call(this,a)};THREE.AmbientLight.prototype=Object.create(THREE.Light.prototype);
THREE.DirectionalLight=function(a,b){THREE.Light.call(this,a);this.position=new THREE.Vector3(0,1,0);this.target=new THREE.Object3D;this.intensity=void 0!==b?b:1;this.onlyShadow=this.castShadow=!1;this.shadowCameraNear=50;this.shadowCameraFar=5E3;this.shadowCameraLeft=-500;this.shadowCameraTop=this.shadowCameraRight=500;this.shadowCameraBottom=-500;this.shadowCameraVisible=!1;this.shadowBias=0;this.shadowDarkness=0.5;this.shadowMapHeight=this.shadowMapWidth=512;this.shadowCascade=!1;this.shadowCascadeOffset=
new THREE.Vector3(0,0,-1E3);this.shadowCascadeCount=2;this.shadowCascadeBias=[0,0,0];this.shadowCascadeWidth=[512,512,512];this.shadowCascadeHeight=[512,512,512];this.shadowCascadeNearZ=[-1,0.99,0.998];this.shadowCascadeFarZ=[0.99,0.998,1];this.shadowCascadeArray=[];this.shadowMatrix=this.shadowCamera=this.shadowMapSize=this.shadowMap=null};THREE.DirectionalLight.prototype=Object.create(THREE.Light.prototype);
THREE.HemisphereLight=function(a,b,c){THREE.Light.call(this,a);this.groundColor=new THREE.Color(b);this.position=new THREE.Vector3(0,100,0);this.intensity=void 0!==c?c:1};THREE.HemisphereLight.prototype=Object.create(THREE.Light.prototype);THREE.PointLight=function(a,b,c){THREE.Light.call(this,a);this.position=new THREE.Vector3(0,0,0);this.intensity=void 0!==b?b:1;this.distance=void 0!==c?c:0};THREE.PointLight.prototype=Object.create(THREE.Light.prototype);
THREE.SpotLight=function(a,b,c,d,e){THREE.Light.call(this,a);this.position=new THREE.Vector3(0,1,0);this.target=new THREE.Object3D;this.intensity=void 0!==b?b:1;this.distance=void 0!==c?c:0;this.angle=void 0!==d?d:Math.PI/2;this.exponent=void 0!==e?e:10;this.onlyShadow=this.castShadow=!1;this.shadowCameraNear=50;this.shadowCameraFar=5E3;this.shadowCameraFov=50;this.shadowCameraVisible=!1;this.shadowBias=0;this.shadowDarkness=0.5;this.shadowMapHeight=this.shadowMapWidth=512;this.shadowMatrix=this.shadowCamera=
this.shadowMapSize=this.shadowMap=null};THREE.SpotLight.prototype=Object.create(THREE.Light.prototype);THREE.Loader=function(a){this.statusDomElement=(this.showStatus=a)?THREE.Loader.prototype.addStatusElement():null;this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){}};
THREE.Loader.prototype={constructor:THREE.Loader,crossOrigin:"anonymous",addStatusElement:function(){var a=document.createElement("div");a.style.position="absolute";a.style.right="0px";a.style.top="0px";a.style.fontSize="0.8em";a.style.textAlign="left";a.style.background="rgba(0,0,0,0.25)";a.style.color="#fff";a.style.width="120px";a.style.padding="0.5em 0.5em 0.5em 0.5em";a.style.zIndex=1E3;a.innerHTML="Loading ...";return a},updateProgress:function(a){var b="Loaded ",b=a.total?b+((100*a.loaded/
a.total).toFixed(0)+"%"):b+((a.loaded/1E3).toFixed(2)+" KB");this.statusDomElement.innerHTML=b},extractUrlBase:function(a){a=a.split("/");a.pop();return(1>a.length?".":a.join("/"))+"/"},initMaterials:function(a,b){for(var c=[],d=0;d<a.length;++d)c[d]=THREE.Loader.prototype.createMaterial(a[d],b);return c},needsTangents:function(a){for(var b=0,c=a.length;b<c;b++)if(a[b]instanceof THREE.ShaderMaterial)return!0;return!1},createMaterial:function(a,b){function c(a){a=Math.log(a)/Math.LN2;return Math.floor(a)==
a}function d(a){a=Math.log(a)/Math.LN2;return Math.pow(2,Math.round(a))}function e(a,e,f,h,i,j,t){var r=f.toLowerCase().endsWith(".dds"),z=b+"/"+f;if(r){var w=THREE.ImageUtils.loadCompressedTexture(z);a[e]=w}else w=document.createElement("canvas"),a[e]=new THREE.Texture(w);a[e].sourceFile=f;if(h&&(a[e].repeat.set(h[0],h[1]),1!==h[0]&&(a[e].wrapS=THREE.RepeatWrapping),1!==h[1]))a[e].wrapT=THREE.RepeatWrapping;i&&a[e].offset.set(i[0],i[1]);if(j&&(f={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping},
void 0!==f[j[0]]&&(a[e].wrapS=f[j[0]]),void 0!==f[j[1]]))a[e].wrapT=f[j[1]];t&&(a[e].anisotropy=t);if(!r){var q=a[e],a=new Image;a.onload=function(){if(!c(this.width)||!c(this.height)){var a=d(this.width),b=d(this.height);q.image.width=a;q.image.height=b;q.image.getContext("2d").drawImage(this,0,0,a,b)}else q.image=this;q.needsUpdate=true};a.crossOrigin=g.crossOrigin;a.src=z}}function f(a){return(255*a[0]<<16)+(255*a[1]<<8)+255*a[2]}var g=this,h="MeshLambertMaterial",i={color:15658734,opacity:1,map:null,
lightMap:null,normalMap:null,bumpMap:null,wireframe:!1};if(a.shading){var j=a.shading.toLowerCase();"phong"===j?h="MeshPhongMaterial":"basic"===j&&(h="MeshBasicMaterial")}void 0!==a.blending&&void 0!==THREE[a.blending]&&(i.blending=THREE[a.blending]);if(void 0!==a.transparent||1>a.opacity)i.transparent=a.transparent;void 0!==a.depthTest&&(i.depthTest=a.depthTest);void 0!==a.depthWrite&&(i.depthWrite=a.depthWrite);void 0!==a.visible&&(i.visible=a.visible);void 0!==a.flipSided&&(i.side=THREE.BackSide);
void 0!==a.doubleSided&&(i.side=THREE.DoubleSide);void 0!==a.wireframe&&(i.wireframe=a.wireframe);void 0!==a.vertexColors&&("face"===a.vertexColors?i.vertexColors=THREE.FaceColors:a.vertexColors&&(i.vertexColors=THREE.VertexColors));a.colorDiffuse?i.color=f(a.colorDiffuse):a.DbgColor&&(i.color=a.DbgColor);a.colorSpecular&&(i.specular=f(a.colorSpecular));a.colorAmbient&&(i.ambient=f(a.colorAmbient));a.transparency&&(i.opacity=a.transparency);a.specularCoef&&(i.shininess=a.specularCoef);a.mapDiffuse&&
b&&e(i,"map",a.mapDiffuse,a.mapDiffuseRepeat,a.mapDiffuseOffset,a.mapDiffuseWrap,a.mapDiffuseAnisotropy);a.mapLight&&b&&e(i,"lightMap",a.mapLight,a.mapLightRepeat,a.mapLightOffset,a.mapLightWrap,a.mapLightAnisotropy);a.mapBump&&b&&e(i,"bumpMap",a.mapBump,a.mapBumpRepeat,a.mapBumpOffset,a.mapBumpWrap,a.mapBumpAnisotropy);a.mapNormal&&b&&e(i,"normalMap",a.mapNormal,a.mapNormalRepeat,a.mapNormalOffset,a.mapNormalWrap,a.mapNormalAnisotropy);a.mapSpecular&&b&&e(i,"specularMap",a.mapSpecular,a.mapSpecularRepeat,
a.mapSpecularOffset,a.mapSpecularWrap,a.mapSpecularAnisotropy);a.mapBumpScale&&(i.bumpScale=a.mapBumpScale);a.mapNormal?(h=THREE.ShaderUtils.lib.normal,j=THREE.UniformsUtils.clone(h.uniforms),j.tNormal.value=i.normalMap,a.mapNormalFactor&&j.uNormalScale.value.set(a.mapNormalFactor,a.mapNormalFactor),i.map&&(j.tDiffuse.value=i.map,j.enableDiffuse.value=!0),i.specularMap&&(j.tSpecular.value=i.specularMap,j.enableSpecular.value=!0),i.lightMap&&(j.tAO.value=i.lightMap,j.enableAO.value=!0),j.uDiffuseColor.value.setHex(i.color),
j.uSpecularColor.value.setHex(i.specular),j.uAmbientColor.value.setHex(i.ambient),j.uShininess.value=i.shininess,void 0!==i.opacity&&(j.uOpacity.value=i.opacity),i=new THREE.ShaderMaterial({fragmentShader:h.fragmentShader,vertexShader:h.vertexShader,uniforms:j,lights:!0,fog:!0})):i=new THREE[h](i);void 0!==a.DbgName&&(i.name=a.DbgName);return i}};THREE.BinaryLoader=function(a){THREE.Loader.call(this,a)};THREE.BinaryLoader.prototype=Object.create(THREE.Loader.prototype);
THREE.BinaryLoader.prototype.load=function(a,b,c,d){var c=c&&"string"===typeof c?c:this.extractUrlBase(a),d=d&&"string"===typeof d?d:this.extractUrlBase(a),e=this.showProgress?THREE.Loader.prototype.updateProgress:null;this.onLoadStart();this.loadAjaxJSON(this,a,b,c,d,e)};
THREE.BinaryLoader.prototype.loadAjaxJSON=function(a,b,c,d,e,f){var g=new XMLHttpRequest;g.onreadystatechange=function(){if(4==g.readyState)if(200==g.status||0==g.status){var h=JSON.parse(g.responseText);a.loadAjaxBuffers(h,c,e,d,f)}else console.error("THREE.BinaryLoader: Couldn't load ["+b+"] ["+g.status+"]")};g.open("GET",b,!0);g.send(null)};
THREE.BinaryLoader.prototype.loadAjaxBuffers=function(a,b,c,d,e){var f=new XMLHttpRequest,g=c+"/"+a.buffers,h=0;f.onreadystatechange=function(){if(4==f.readyState)if(200==f.status||0==f.status){var c=f.response;void 0===c&&(c=(new Uint8Array(f.responseBody)).buffer);THREE.BinaryLoader.prototype.createBinModel(c,b,d,a.materials)}else console.error("THREE.BinaryLoader: Couldn't load ["+g+"] ["+f.status+"]");else 3==f.readyState?e&&(0==h&&(h=f.getResponseHeader("Content-Length")),e({total:h,loaded:f.responseText.length})):
2==f.readyState&&(h=f.getResponseHeader("Content-Length"))};f.open("GET",g,!0);f.responseType="arraybuffer";f.send(null)};
THREE.BinaryLoader.prototype.createBinModel=function(a,b,c,d){var e=function(){var b,c,d,e,j,l,m,n,p,o,s,t,r,z,w,q;function E(a){return a%4?4-a%4:0}function A(a,b){return(new Uint8Array(a,b,1))[0]}function v(a,b){return(new Uint32Array(a,b,1))[0]}function u(b,c){var d,e,f,g,h,i,j,l=new Uint32Array(a,c,3*b);for(d=0;d<b;d++)e=l[3*d],f=l[3*d+1],g=l[3*d+2],h=N[2*e],e=N[2*e+1],i=N[2*f],j=N[2*f+1],f=N[2*g],g=N[2*g+1],K.faceVertexUvs[0].push([new THREE.UV(h,e),new THREE.UV(i,j),new THREE.UV(f,g)])}function D(b,
c){var d,e,f,g,h,i,j,l,n,m=new Uint32Array(a,c,4*b);for(d=0;d<b;d++)e=m[4*d],f=m[4*d+1],g=m[4*d+2],h=m[4*d+3],i=N[2*e],e=N[2*e+1],j=N[2*f],l=N[2*f+1],f=N[2*g],n=N[2*g+1],g=N[2*h],h=N[2*h+1],K.faceVertexUvs[0].push([new THREE.UV(i,e),new THREE.UV(j,l),new THREE.UV(f,n),new THREE.UV(g,h)])}function C(b,c,d){for(var e,f,g,h,c=new Uint32Array(a,c,3*b),i=new Uint16Array(a,d,b),d=0;d<b;d++)e=c[3*d],f=c[3*d+1],g=c[3*d+2],h=i[d],K.faces.push(new THREE.Face3(e,f,g,null,null,h))}function G(b,c,d){for(var e,
f,g,h,i,c=new Uint32Array(a,c,4*b),j=new Uint16Array(a,d,b),d=0;d<b;d++)e=c[4*d],f=c[4*d+1],g=c[4*d+2],h=c[4*d+3],i=j[d],K.faces.push(new THREE.Face4(e,f,g,h,null,null,i))}function P(b,c,d,e){for(var f,g,h,i,j,l,n,c=new Uint32Array(a,c,3*b),d=new Uint32Array(a,d,3*b),m=new Uint16Array(a,e,b),e=0;e<b;e++){f=c[3*e];g=c[3*e+1];h=c[3*e+2];j=d[3*e];l=d[3*e+1];n=d[3*e+2];i=m[e];var o=I[3*l],p=I[3*l+1];l=I[3*l+2];var s=I[3*n],r=I[3*n+1];n=I[3*n+2];K.faces.push(new THREE.Face3(f,g,h,[new THREE.Vector3(I[3*
j],I[3*j+1],I[3*j+2]),new THREE.Vector3(o,p,l),new THREE.Vector3(s,r,n)],null,i))}}function B(b,c,d,e){for(var f,g,h,i,j,l,n,m,o,c=new Uint32Array(a,c,4*b),d=new Uint32Array(a,d,4*b),p=new Uint16Array(a,e,b),e=0;e<b;e++){f=c[4*e];g=c[4*e+1];h=c[4*e+2];i=c[4*e+3];l=d[4*e];n=d[4*e+1];m=d[4*e+2];o=d[4*e+3];j=p[e];var s=I[3*n],r=I[3*n+1];n=I[3*n+2];var q=I[3*m],t=I[3*m+1];m=I[3*m+2];var u=I[3*o],v=I[3*o+1];o=I[3*o+2];K.faces.push(new THREE.Face4(f,g,h,i,[new THREE.Vector3(I[3*l],I[3*l+1],I[3*l+2]),new THREE.Vector3(s,
r,n),new THREE.Vector3(q,t,m),new THREE.Vector3(u,v,o)],null,j))}}var K=this,H=0,I=[],N=[],O,R,ga;THREE.Geometry.call(this);q=a;R=H;z=new Uint8Array(q,R,12);o="";for(r=0;12>r;r++)o+=String.fromCharCode(z[R+r]);b=A(q,R+12);A(q,R+13);A(q,R+14);A(q,R+15);c=A(q,R+16);d=A(q,R+17);e=A(q,R+18);j=A(q,R+19);l=v(q,R+20);m=v(q,R+20+4);n=v(q,R+20+8);p=v(q,R+20+12);o=v(q,R+20+16);s=v(q,R+20+20);t=v(q,R+20+24);r=v(q,R+20+28);z=v(q,R+20+32);w=v(q,R+20+36);q=v(q,R+20+40);H+=b;R=3*c+j;ga=4*c+j;O=p*R;b=o*(R+3*d);c=
s*(R+3*e);j=t*(R+3*d+3*e);R=r*ga;d=z*(ga+4*d);e=w*(ga+4*e);ga=H;var H=new Float32Array(a,H,3*l),M,J,Q,Z;for(M=0;M<l;M++)J=H[3*M],Q=H[3*M+1],Z=H[3*M+2],K.vertices.push(new THREE.Vector3(J,Q,Z));l=H=ga+3*l*Float32Array.BYTES_PER_ELEMENT;if(m){H=new Int8Array(a,H,3*m);for(ga=0;ga<m;ga++)M=H[3*ga],J=H[3*ga+1],Q=H[3*ga+2],I.push(M/127,J/127,Q/127)}H=l+3*m*Int8Array.BYTES_PER_ELEMENT;m=H+=E(3*m);if(n){l=new Float32Array(a,H,2*n);for(H=0;H<n;H++)ga=l[2*H],M=l[2*H+1],N.push(ga,M)}n=H=m+2*n*Float32Array.BYTES_PER_ELEMENT;
O=n+O+E(2*p);m=O+b+E(2*o);b=m+c+E(2*s);c=b+j+E(2*t);R=c+R+E(2*r);j=R+d+E(2*z);d=j+e+E(2*w);s&&(e=m+3*s*Uint32Array.BYTES_PER_ELEMENT,C(s,m,e+3*s*Uint32Array.BYTES_PER_ELEMENT),u(s,e));t&&(s=b+3*t*Uint32Array.BYTES_PER_ELEMENT,e=s+3*t*Uint32Array.BYTES_PER_ELEMENT,P(t,b,s,e+3*t*Uint32Array.BYTES_PER_ELEMENT),u(t,e));w&&(t=j+4*w*Uint32Array.BYTES_PER_ELEMENT,G(w,j,t+4*w*Uint32Array.BYTES_PER_ELEMENT),D(w,t));q&&(w=d+4*q*Uint32Array.BYTES_PER_ELEMENT,t=w+4*q*Uint32Array.BYTES_PER_ELEMENT,B(q,d,w,t+4*
q*Uint32Array.BYTES_PER_ELEMENT),D(q,t));p&&C(p,n,n+3*p*Uint32Array.BYTES_PER_ELEMENT);o&&(p=O+3*o*Uint32Array.BYTES_PER_ELEMENT,P(o,O,p,p+3*o*Uint32Array.BYTES_PER_ELEMENT));r&&G(r,c,c+4*r*Uint32Array.BYTES_PER_ELEMENT);z&&(o=R+4*z*Uint32Array.BYTES_PER_ELEMENT,B(z,R,o,o+4*z*Uint32Array.BYTES_PER_ELEMENT));this.computeCentroids();this.computeFaceNormals()};e.prototype=Object.create(THREE.Geometry.prototype);e=new e(c);c=this.initMaterials(d,c);this.needsTangents(c)&&e.computeTangents();b(e,c)};
THREE.ImageLoader=function(){THREE.EventTarget.call(this);this.crossOrigin=null};THREE.ImageLoader.prototype={constructor:THREE.ImageLoader,load:function(a,b){var c=this;void 0===b&&(b=new Image);b.addEventListener("load",function(){c.dispatchEvent({type:"load",content:b})},!1);b.addEventListener("error",function(){c.dispatchEvent({type:"error",message:"Couldn't load URL ["+a+"]"})},!1);c.crossOrigin&&(b.crossOrigin=c.crossOrigin);b.src=a}};
THREE.JSONLoader=function(a){THREE.Loader.call(this,a);this.withCredentials=!1};THREE.JSONLoader.prototype=Object.create(THREE.Loader.prototype);THREE.JSONLoader.prototype.load=function(a,b,c){c=c&&"string"===typeof c?c:this.extractUrlBase(a);this.onLoadStart();this.loadAjaxJSON(this,a,b,c)};
THREE.JSONLoader.prototype.loadAjaxJSON=function(a,b,c,d,e){var f=new XMLHttpRequest,g=0;f.withCredentials=this.withCredentials;f.onreadystatechange=function(){if(f.readyState===f.DONE)if(200===f.status||0===f.status){if(f.responseText){var h=JSON.parse(f.responseText);a.createModel(h,c,d)}else console.warn("THREE.JSONLoader: ["+b+"] seems to be unreachable or file there is empty");a.onLoadComplete()}else console.error("THREE.JSONLoader: Couldn't load ["+b+"] ["+f.status+"]");else f.readyState===
f.LOADING?e&&(0===g&&(g=f.getResponseHeader("Content-Length")),e({total:g,loaded:f.responseText.length})):f.readyState===f.HEADERS_RECEIVED&&(g=f.getResponseHeader("Content-Length"))};f.open("GET",b,!0);f.send(null)};
THREE.JSONLoader.prototype.createModel=function(a,b,c){var d=new THREE.Geometry,e=void 0!==a.scale?1/a.scale:1,f,g,h,i,j,l,m,n,p,o,s,t,r,z,w,q=a.faces;o=a.vertices;var E=a.normals,A=a.colors,v=0;for(f=0;f<a.uvs.length;f++)a.uvs[f].length&&v++;for(f=0;f<v;f++)d.faceUvs[f]=[],d.faceVertexUvs[f]=[];i=0;for(j=o.length;i<j;)l=new THREE.Vector3,l.x=o[i++]*e,l.y=o[i++]*e,l.z=o[i++]*e,d.vertices.push(l);i=0;for(j=q.length;i<j;){o=q[i++];l=o&1;h=o&2;f=o&4;g=o&8;n=o&16;m=o&32;s=o&64;o&=128;l?(t=new THREE.Face4,
t.a=q[i++],t.b=q[i++],t.c=q[i++],t.d=q[i++],l=4):(t=new THREE.Face3,t.a=q[i++],t.b=q[i++],t.c=q[i++],l=3);h&&(h=q[i++],t.materialIndex=h);h=d.faces.length;if(f)for(f=0;f<v;f++)r=a.uvs[f],p=q[i++],w=r[2*p],p=r[2*p+1],d.faceUvs[f][h]=new THREE.UV(w,p);if(g)for(f=0;f<v;f++){r=a.uvs[f];z=[];for(g=0;g<l;g++)p=q[i++],w=r[2*p],p=r[2*p+1],z[g]=new THREE.UV(w,p);d.faceVertexUvs[f][h]=z}n&&(n=3*q[i++],g=new THREE.Vector3,g.x=E[n++],g.y=E[n++],g.z=E[n],t.normal=g);if(m)for(f=0;f<l;f++)n=3*q[i++],g=new THREE.Vector3,
g.x=E[n++],g.y=E[n++],g.z=E[n],t.vertexNormals.push(g);s&&(m=q[i++],m=new THREE.Color(A[m]),t.color=m);if(o)for(f=0;f<l;f++)m=q[i++],m=new THREE.Color(A[m]),t.vertexColors.push(m);d.faces.push(t)}if(a.skinWeights){i=0;for(j=a.skinWeights.length;i<j;i+=2)q=a.skinWeights[i],E=a.skinWeights[i+1],d.skinWeights.push(new THREE.Vector4(q,E,0,0))}if(a.skinIndices){i=0;for(j=a.skinIndices.length;i<j;i+=2)q=a.skinIndices[i],E=a.skinIndices[i+1],d.skinIndices.push(new THREE.Vector4(q,E,0,0))}d.bones=a.bones;
d.animation=a.animation;if(void 0!==a.morphTargets){i=0;for(j=a.morphTargets.length;i<j;i++){d.morphTargets[i]={};d.morphTargets[i].name=a.morphTargets[i].name;d.morphTargets[i].vertices=[];A=d.morphTargets[i].vertices;v=a.morphTargets[i].vertices;q=0;for(E=v.length;q<E;q+=3)o=new THREE.Vector3,o.x=v[q]*e,o.y=v[q+1]*e,o.z=v[q+2]*e,A.push(o)}}if(void 0!==a.morphColors){i=0;for(j=a.morphColors.length;i<j;i++){d.morphColors[i]={};d.morphColors[i].name=a.morphColors[i].name;d.morphColors[i].colors=[];
E=d.morphColors[i].colors;A=a.morphColors[i].colors;e=0;for(q=A.length;e<q;e+=3)v=new THREE.Color(16755200),v.setRGB(A[e],A[e+1],A[e+2]),E.push(v)}}d.computeCentroids();d.computeFaceNormals();a=this.initMaterials(a.materials,c);this.needsTangents(a)&&d.computeTangents();b(d,a)};
THREE.LoadingMonitor=function(){THREE.EventTarget.call(this);var a=this,b=0,c=0,d=function(){b++;a.dispatchEvent({type:"progress",loaded:b,total:c});b===c&&a.dispatchEvent({type:"load"})};this.add=function(a){c++;a.addEventListener("load",d,!1)}};
THREE.SceneLoader=function(){this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){};this.callbackSync=function(){};this.callbackProgress=function(){};this.geometryHandlerMap={};this.hierarchyHandlerMap={};this.addGeometryHandler("ascii",THREE.JSONLoader);this.addGeometryHandler("binary",THREE.BinaryLoader)};THREE.SceneLoader.prototype.constructor=THREE.SceneLoader;
THREE.SceneLoader.prototype.load=function(a,b){var c=this,d=new XMLHttpRequest;d.onreadystatechange=function(){if(4===d.readyState)if(200===d.status||0===d.status){var e=JSON.parse(d.responseText);c.parse(e,b,a)}else console.error("THREE.SceneLoader: Couldn't load ["+a+"] ["+d.status+"]")};d.open("GET",a,!0);d.send(null)};THREE.SceneLoader.prototype.addGeometryHandler=function(a,b){this.geometryHandlerMap[a]={loaderClass:b}};
THREE.SceneLoader.prototype.addHierarchyHandler=function(a,b){this.hierarchyHandlerMap[a]={loaderClass:b}};
THREE.SceneLoader.prototype.parse=function(a,b,c){function d(a,b){return"relativeToHTML"==b?a:m+"/"+a}function e(){f(M.scene,Q.objects)}function f(a,b){for(var c in b)if(void 0===M.objects[c]){var e=b[c],g=null;if(e.type&&e.type in l.hierarchyHandlerMap&&void 0===e.loading){var i={},j;for(j in t)"type"!==j&&"url"!==j&&(i[j]=t[j]);C=M.materials[e.material];e.loading=!0;var n=l.hierarchyHandlerMap[e.type].loaderObject;n.addEventListener?(n.addEventListener("load",h(c,a,C,e)),n.load(d(e.url,Q.urlBaseType))):
n.options?n.load(d(e.url,Q.urlBaseType),h(c,a,C,e)):n.load(d(e.url,Q.urlBaseType),h(c,a,C,e),i)}else if(void 0!==e.geometry){if(D=M.geometries[e.geometry]){g=!1;C=M.materials[e.material];g=C instanceof THREE.ShaderMaterial;w=e.position;q=e.rotation;E=e.quaternion;A=e.scale;r=e.matrix;E=0;e.material||(C=new THREE.MeshFaceMaterial(M.face_materials[e.geometry]));C instanceof THREE.MeshFaceMaterial&&0===C.materials.length&&(C=new THREE.MeshFaceMaterial(M.face_materials[e.geometry]));if(C instanceof THREE.MeshFaceMaterial)for(i=
0;i<C.materials.length;i++)g=g||C.materials[i]instanceof THREE.ShaderMaterial;g&&D.computeTangents();e.skin?g=new THREE.SkinnedMesh(D,C):e.morph?(g=new THREE.MorphAnimMesh(D,C),void 0!==e.duration&&(g.duration=e.duration),void 0!==e.time&&(g.time=e.time),void 0!==e.mirroredLoop&&(g.mirroredLoop=e.mirroredLoop),C.morphNormals&&D.computeMorphNormals()):g=new THREE.Mesh(D,C);g.name=c;r?(g.matrixAutoUpdate=!1,g.matrix.set(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],
r[15])):(g.position.set(w[0],w[1],w[2]),E?(g.quaternion.set(E[0],E[1],E[2],E[3]),g.useQuaternion=!0):g.rotation.set(q[0],q[1],q[2]),g.scale.set(A[0],A[1],A[2]));g.visible=e.visible;g.castShadow=e.castShadow;g.receiveShadow=e.receiveShadow;a.add(g);M.objects[c]=g}}else"DirectionalLight"===e.type||"PointLight"===e.type||"AmbientLight"===e.type?(H=void 0!==e.color?e.color:16777215,I=void 0!==e.intensity?e.intensity:1,"DirectionalLight"===e.type?(w=e.direction,K=new THREE.DirectionalLight(H,I),K.position.set(w[0],
w[1],w[2]),e.target&&(J.push({object:K,targetName:e.target}),K.target=null)):"PointLight"===e.type?(w=e.position,z=e.distance,K=new THREE.PointLight(H,I,z),K.position.set(w[0],w[1],w[2])):"AmbientLight"===e.type&&(K=new THREE.AmbientLight(H)),a.add(K),K.name=c,M.lights[c]=K,M.objects[c]=K):"PerspectiveCamera"===e.type||"OrthographicCamera"===e.type?("PerspectiveCamera"===e.type?G=new THREE.PerspectiveCamera(e.fov,e.aspect,e.near,e.far):"OrthographicCamera"===e.type&&(G=new THREE.OrthographicCamera(v.left,
v.right,v.top,v.bottom,v.near,v.far)),w=e.position,G.position.set(w[0],w[1],w[2]),a.add(G),G.name=c,M.cameras[c]=G,M.objects[c]=G):(w=e.position,q=e.rotation,E=e.quaternion,A=e.scale,E=0,g=new THREE.Object3D,g.name=c,g.position.set(w[0],w[1],w[2]),E?(g.quaternion.set(E[0],E[1],E[2],E[3]),g.useQuaternion=!0):g.rotation.set(q[0],q[1],q[2]),g.scale.set(A[0],A[1],A[2]),g.visible=void 0!==e.visible?e.visible:!1,a.add(g),M.objects[c]=g,M.empties[c]=g);if(g){if(void 0!==e.properties)for(var m in e.properties)g.properties[m]=
e.properties[m];void 0!==e.children&&f(g,e.children)}}}function g(a){return function(b,c){M.geometries[a]=b;M.face_materials[a]=c;e();N-=1;l.onLoadComplete();j()}}function h(a,b,c,d){return function(f){var f=f.content?f.content:f.dae?f.scene:f,g=d.position,h=d.rotation,i=d.quaternion,n=d.scale;f.position.set(g[0],g[1],g[2]);i?(f.quaternion.set(i[0],i[1],i[2],i[3]),f.useQuaternion=!0):f.rotation.set(h[0],h[1],h[2]);f.scale.set(n[0],n[1],n[2]);c&&f.traverse(function(a){a.material=c});b.add(f);M.objects[a]=
f;e();N-=1;l.onLoadComplete();j()}}function i(a){return function(b,c){M.geometries[a]=b;M.face_materials[a]=c}}function j(){l.callbackProgress({totalModels:R,totalTextures:ga,loadedModels:R-N,loadedTextures:ga-O},M);l.onLoadProgress();if(0===N&&0===O){for(var a=0;a<J.length;a++){var c=J[a],d=M.objects[c.targetName];d?c.object.target=d:(c.object.target=new THREE.Object3D,M.scene.add(c.object.target));c.object.target.properties.targetInverse=c.object}b(M)}}var l=this,m=THREE.Loader.prototype.extractUrlBase(c),
n,p,o,s,t,r,z,w,q,E,A,v,u,D,C,G,P,B,K,H,I,N,O,R,ga,M,J=[],Q=a,Z;for(Z in this.geometryHandlerMap)a=this.geometryHandlerMap[Z].loaderClass,this.geometryHandlerMap[Z].loaderObject=new a;for(Z in this.hierarchyHandlerMap)a=this.hierarchyHandlerMap[Z].loaderClass,this.hierarchyHandlerMap[Z].loaderObject=new a;O=N=0;M={scene:new THREE.Scene,geometries:{},face_materials:{},materials:{},textures:{},objects:{},cameras:{},lights:{},fogs:{},empties:{}};if(Q.transform&&(Z=Q.transform.position,a=Q.transform.rotation,
c=Q.transform.scale,Z&&M.scene.position.set(Z[0],Z[1],Z[2]),a&&M.scene.rotation.set(a[0],a[1],a[2]),c&&M.scene.scale.set(c[0],c[1],c[2]),Z||a||c))M.scene.updateMatrix(),M.scene.updateMatrixWorld();Z=function(a){return function(){O-=a;j();l.onLoadComplete()}};for(o in Q.fogs)a=Q.fogs[o],"linear"===a.type?P=new THREE.Fog(0,a.near,a.far):"exp2"===a.type&&(P=new THREE.FogExp2(0,a.density)),v=a.color,P.color.setRGB(v[0],v[1],v[2]),M.fogs[o]=P;for(n in Q.geometries)t=Q.geometries[n],t.type in this.geometryHandlerMap&&
(N+=1,l.onLoadStart());for(var L in Q.objects)o=Q.objects[L],o.type&&o.type in this.hierarchyHandlerMap&&(N+=1,l.onLoadStart());R=N;for(n in Q.geometries)if(t=Q.geometries[n],"cube"===t.type)D=new THREE.CubeGeometry(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments),M.geometries[n]=D;else if("plane"===t.type)D=new THREE.PlaneGeometry(t.width,t.height,t.widthSegments,t.heightSegments),M.geometries[n]=D;else if("sphere"===t.type)D=new THREE.SphereGeometry(t.radius,t.widthSegments,
t.heightSegments),M.geometries[n]=D;else if("cylinder"===t.type)D=new THREE.CylinderGeometry(t.topRad,t.botRad,t.height,t.radSegs,t.heightSegs),M.geometries[n]=D;else if("torus"===t.type)D=new THREE.TorusGeometry(t.radius,t.tube,t.segmentsR,t.segmentsT),M.geometries[n]=D;else if("icosahedron"===t.type)D=new THREE.IcosahedronGeometry(t.radius,t.subdivisions),M.geometries[n]=D;else if(t.type in this.geometryHandlerMap){L={};for(B in t)"type"!==B&&"url"!==B&&(L[B]=t[B]);this.geometryHandlerMap[t.type].loaderObject.load(d(t.url,
Q.urlBaseType),g(n),L)}else"embedded"===t.type&&(L=Q.embeds[t.id],L.metadata=Q.metadata,L&&this.geometryHandlerMap.ascii.loaderObject.createModel(L,i(n),""));for(s in Q.textures)if(n=Q.textures[s],n.url instanceof Array){O+=n.url.length;for(B=0;B<n.url.length;B++)l.onLoadStart()}else O+=1,l.onLoadStart();ga=O;for(s in Q.textures){n=Q.textures[s];void 0!==n.mapping&&void 0!==THREE[n.mapping]&&(n.mapping=new THREE[n.mapping]);if(n.url instanceof Array){L=n.url.length;o=[];for(B=0;B<L;B++)o[B]=d(n.url[B],
Q.urlBaseType);B=(B=o[0].endsWith(".dds"))?THREE.ImageUtils.loadCompressedTextureCube(o,n.mapping,Z(L)):THREE.ImageUtils.loadTextureCube(o,n.mapping,Z(L))}else{B=n.url.toLowerCase().endsWith(".dds");L=d(n.url,Q.urlBaseType);o=Z(1);B=B?THREE.ImageUtils.loadCompressedTexture(L,n.mapping,o):THREE.ImageUtils.loadTexture(L,n.mapping,o);void 0!==THREE[n.minFilter]&&(B.minFilter=THREE[n.minFilter]);void 0!==THREE[n.magFilter]&&(B.magFilter=THREE[n.magFilter]);n.anisotropy&&(B.anisotropy=n.anisotropy);if(n.repeat&&
(B.repeat.set(n.repeat[0],n.repeat[1]),1!==n.repeat[0]&&(B.wrapS=THREE.RepeatWrapping),1!==n.repeat[1]))B.wrapT=THREE.RepeatWrapping;n.offset&&B.offset.set(n.offset[0],n.offset[1]);if(n.wrap&&(L={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping},void 0!==L[n.wrap[0]]&&(B.wrapS=L[n.wrap[0]]),void 0!==L[n.wrap[1]]))B.wrapT=L[n.wrap[1]]}M.textures[s]=B}for(p in Q.materials){r=Q.materials[p];for(u in r.parameters)"envMap"===u||"map"===u||"lightMap"===u||"bumpMap"===u?r.parameters[u]=M.textures[r.parameters[u]]:
"shading"===u?r.parameters[u]="flat"===r.parameters[u]?THREE.FlatShading:THREE.SmoothShading:"side"===u?r.parameters[u]="double"==r.parameters[u]?THREE.DoubleSide:"back"==r.parameters[u]?THREE.BackSide:THREE.FrontSide:"blending"===u?r.parameters[u]=r.parameters[u]in THREE?THREE[r.parameters[u]]:THREE.NormalBlending:"combine"===u?r.parameters[u]="MixOperation"==r.parameters[u]?THREE.MixOperation:THREE.MultiplyOperation:"vertexColors"===u?"face"==r.parameters[u]?r.parameters[u]=THREE.FaceColors:r.parameters[u]&&
(r.parameters[u]=THREE.VertexColors):"wrapRGB"===u&&(s=r.parameters[u],r.parameters[u]=new THREE.Vector3(s[0],s[1],s[2]));void 0!==r.parameters.opacity&&1>r.parameters.opacity&&(r.parameters.transparent=!0);r.parameters.normalMap?(s=THREE.ShaderUtils.lib.normal,Z=THREE.UniformsUtils.clone(s.uniforms),n=r.parameters.color,B=r.parameters.specular,L=r.parameters.ambient,o=r.parameters.shininess,Z.tNormal.value=M.textures[r.parameters.normalMap],r.parameters.normalScale&&Z.uNormalScale.value.set(r.parameters.normalScale[0],
r.parameters.normalScale[1]),r.parameters.map&&(Z.tDiffuse.value=r.parameters.map,Z.enableDiffuse.value=!0),r.parameters.envMap&&(Z.tCube.value=r.parameters.envMap,Z.enableReflection.value=!0,Z.uReflectivity.value=r.parameters.reflectivity),r.parameters.lightMap&&(Z.tAO.value=r.parameters.lightMap,Z.enableAO.value=!0),r.parameters.specularMap&&(Z.tSpecular.value=M.textures[r.parameters.specularMap],Z.enableSpecular.value=!0),r.parameters.displacementMap&&(Z.tDisplacement.value=M.textures[r.parameters.displacementMap],
Z.enableDisplacement.value=!0,Z.uDisplacementBias.value=r.parameters.displacementBias,Z.uDisplacementScale.value=r.parameters.displacementScale),Z.uDiffuseColor.value.setHex(n),Z.uSpecularColor.value.setHex(B),Z.uAmbientColor.value.setHex(L),Z.uShininess.value=o,r.parameters.opacity&&(Z.uOpacity.value=r.parameters.opacity),C=new THREE.ShaderMaterial({fragmentShader:s.fragmentShader,vertexShader:s.vertexShader,uniforms:Z,lights:!0,fog:!0})):C=new THREE[r.type](r.parameters);M.materials[p]=C}for(p in Q.materials)if(r=
Q.materials[p],r.parameters.materials){u=[];for(B=0;B<r.parameters.materials.length;B++)u.push(M.materials[r.parameters.materials[B]]);M.materials[p].materials=u}e();M.cameras&&Q.defaults.camera&&(M.currentCamera=M.cameras[Q.defaults.camera]);M.fogs&&Q.defaults.fog&&(M.scene.fog=M.fogs[Q.defaults.fog]);v=Q.defaults.bgcolor;M.bgColor=new THREE.Color;M.bgColor.setRGB(v[0],v[1],v[2]);M.bgColorAlpha=Q.defaults.bgalpha;l.callbackSync(M);j()};
THREE.TextureLoader=function(){THREE.EventTarget.call(this);this.crossOrigin=null};THREE.TextureLoader.prototype={constructor:THREE.TextureLoader,load:function(a){var b=this,c=new Image;c.addEventListener("load",function(){var a=new THREE.Texture(c);a.needsUpdate=!0;b.dispatchEvent({type:"load",content:a})},!1);c.addEventListener("error",function(){b.dispatchEvent({type:"error",message:"Couldn't load URL ["+a+"]"})},!1);b.crossOrigin&&(c.crossOrigin=b.crossOrigin);c.src=a}};
THREE.Material=function(){THREE.MaterialLibrary.push(this);this.id=THREE.MaterialIdCount++;this.name="";this.side=THREE.FrontSide;this.opacity=1;this.transparent=!1;this.blending=THREE.NormalBlending;this.blendSrc=THREE.SrcAlphaFactor;this.blendDst=THREE.OneMinusSrcAlphaFactor;this.blendEquation=THREE.AddEquation;this.depthWrite=this.depthTest=!0;this.polygonOffset=!1;this.alphaTest=this.polygonOffsetUnits=this.polygonOffsetFactor=0;this.overdraw=!1;this.needsUpdate=this.visible=!0};
THREE.Material.prototype.setValues=function(a){if(void 0!==a)for(var b in a){var c=a[b];if(void 0===c)console.warn("THREE.Material: '"+b+"' parameter is undefined.");else if(b in this){var d=this[b];d instanceof THREE.Color&&c instanceof THREE.Color?d.copy(c):d instanceof THREE.Color&&"number"===typeof c?d.setHex(c):d instanceof THREE.Vector3&&c instanceof THREE.Vector3?d.copy(c):this[b]=c}}};
THREE.Material.prototype.clone=function(a){void 0===a&&(a=new THREE.Material);a.name=this.name;a.side=this.side;a.opacity=this.opacity;a.transparent=this.transparent;a.blending=this.blending;a.blendSrc=this.blendSrc;a.blendDst=this.blendDst;a.blendEquation=this.blendEquation;a.depthTest=this.depthTest;a.depthWrite=this.depthWrite;a.polygonOffset=this.polygonOffset;a.polygonOffsetFactor=this.polygonOffsetFactor;a.polygonOffsetUnits=this.polygonOffsetUnits;a.alphaTest=this.alphaTest;a.overdraw=this.overdraw;
a.visible=this.visible;return a};THREE.Material.prototype.deallocate=function(){var a=THREE.MaterialLibrary.indexOf(this);-1!==a&&THREE.MaterialLibrary.splice(a,1)};THREE.MaterialIdCount=0;THREE.MaterialLibrary=[];THREE.LineBasicMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.linewidth=1;this.linejoin=this.linecap="round";this.vertexColors=!1;this.fog=!0;this.setValues(a)};THREE.LineBasicMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.LineBasicMaterial.prototype.clone=function(){var a=new THREE.LineBasicMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.linewidth=this.linewidth;a.linecap=this.linecap;a.linejoin=this.linejoin;a.vertexColors=this.vertexColors;a.fog=this.fog;return a};THREE.LineDashedMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.scale=this.linewidth=1;this.dashSize=3;this.gapSize=1;this.vertexColors=!1;this.fog=!0;this.setValues(a)};
THREE.LineDashedMaterial.prototype=Object.create(THREE.Material.prototype);THREE.LineDashedMaterial.prototype.clone=function(){var a=new THREE.LineDashedMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.linewidth=this.linewidth;a.scale=this.scale;a.dashSize=this.dashSize;a.gapSize=this.gapSize;a.vertexColors=this.vertexColors;a.fog=this.fog;return a};
THREE.MeshBasicMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.envMap=this.specularMap=this.lightMap=this.map=null;this.combine=THREE.MultiplyOperation;this.reflectivity=1;this.refractionRatio=0.98;this.fog=!0;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap="round";this.vertexColors=THREE.NoColors;this.morphTargets=this.skinning=!1;this.setValues(a)};
THREE.MeshBasicMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.MeshBasicMaterial.prototype.clone=function(){var a=new THREE.MeshBasicMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.map=this.map;a.lightMap=this.lightMap;a.specularMap=this.specularMap;a.envMap=this.envMap;a.combine=this.combine;a.reflectivity=this.reflectivity;a.refractionRatio=this.refractionRatio;a.fog=this.fog;a.shading=this.shading;a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;a.wireframeLinecap=this.wireframeLinecap;a.wireframeLinejoin=
this.wireframeLinejoin;a.vertexColors=this.vertexColors;a.skinning=this.skinning;a.morphTargets=this.morphTargets;return a};
THREE.MeshLambertMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.ambient=new THREE.Color(16777215);this.emissive=new THREE.Color(0);this.wrapAround=!1;this.wrapRGB=new THREE.Vector3(1,1,1);this.envMap=this.specularMap=this.lightMap=this.map=null;this.combine=THREE.MultiplyOperation;this.reflectivity=1;this.refractionRatio=0.98;this.fog=!0;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap=
"round";this.vertexColors=THREE.NoColors;this.morphNormals=this.morphTargets=this.skinning=!1;this.setValues(a)};THREE.MeshLambertMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.MeshLambertMaterial.prototype.clone=function(){var a=new THREE.MeshLambertMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.ambient.copy(this.ambient);a.emissive.copy(this.emissive);a.wrapAround=this.wrapAround;a.wrapRGB.copy(this.wrapRGB);a.map=this.map;a.lightMap=this.lightMap;a.specularMap=this.specularMap;a.envMap=this.envMap;a.combine=this.combine;a.reflectivity=this.reflectivity;a.refractionRatio=this.refractionRatio;a.fog=this.fog;a.shading=this.shading;
a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;a.wireframeLinecap=this.wireframeLinecap;a.wireframeLinejoin=this.wireframeLinejoin;a.vertexColors=this.vertexColors;a.skinning=this.skinning;a.morphTargets=this.morphTargets;a.morphNormals=this.morphNormals;return a};
THREE.MeshPhongMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.ambient=new THREE.Color(16777215);this.emissive=new THREE.Color(0);this.specular=new THREE.Color(1118481);this.shininess=30;this.metal=!1;this.perPixel=!0;this.wrapAround=!1;this.wrapRGB=new THREE.Vector3(1,1,1);this.bumpMap=this.lightMap=this.map=null;this.bumpScale=1;this.normalMap=null;this.normalScale=new THREE.Vector2(1,1);this.envMap=this.specularMap=null;this.combine=THREE.MultiplyOperation;
this.reflectivity=1;this.refractionRatio=0.98;this.fog=!0;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.wireframeLinejoin=this.wireframeLinecap="round";this.vertexColors=THREE.NoColors;this.morphNormals=this.morphTargets=this.skinning=!1;this.setValues(a)};THREE.MeshPhongMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.MeshPhongMaterial.prototype.clone=function(){var a=new THREE.MeshPhongMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.ambient.copy(this.ambient);a.emissive.copy(this.emissive);a.specular.copy(this.specular);a.shininess=this.shininess;a.metal=this.metal;a.perPixel=this.perPixel;a.wrapAround=this.wrapAround;a.wrapRGB.copy(this.wrapRGB);a.map=this.map;a.lightMap=this.lightMap;a.bumpMap=this.bumpMap;a.bumpScale=this.bumpScale;a.normalMap=this.normalMap;a.normalScale.copy(this.normalScale);
a.specularMap=this.specularMap;a.envMap=this.envMap;a.combine=this.combine;a.reflectivity=this.reflectivity;a.refractionRatio=this.refractionRatio;a.fog=this.fog;a.shading=this.shading;a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;a.wireframeLinecap=this.wireframeLinecap;a.wireframeLinejoin=this.wireframeLinejoin;a.vertexColors=this.vertexColors;a.skinning=this.skinning;a.morphTargets=this.morphTargets;a.morphNormals=this.morphNormals;return a};
THREE.MeshDepthMaterial=function(a){THREE.Material.call(this);this.wireframe=!1;this.wireframeLinewidth=1;this.setValues(a)};THREE.MeshDepthMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshDepthMaterial.prototype.clone=function(){var a=new THREE.LineBasicMaterial;THREE.Material.prototype.clone.call(this,a);a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;return a};
THREE.MeshNormalMaterial=function(a){THREE.Material.call(this,a);this.shading=THREE.FlatShading;this.wireframe=!1;this.wireframeLinewidth=1;this.setValues(a)};THREE.MeshNormalMaterial.prototype=Object.create(THREE.Material.prototype);THREE.MeshNormalMaterial.prototype.clone=function(){var a=new THREE.MeshNormalMaterial;THREE.Material.prototype.clone.call(this,a);a.shading=this.shading;a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;return a};
THREE.MeshFaceMaterial=function(a){this.materials=a instanceof Array?a:[]};THREE.MeshFaceMaterial.prototype.clone=function(){return new THREE.MeshFaceMaterial(this.materials.slice(0))};THREE.ParticleBasicMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.map=null;this.size=1;this.sizeAttenuation=!0;this.vertexColors=!1;this.fog=!0;this.setValues(a)};THREE.ParticleBasicMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.ParticleBasicMaterial.prototype.clone=function(){var a=new THREE.ParticleBasicMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.map=this.map;a.size=this.size;a.sizeAttenuation=this.sizeAttenuation;a.vertexColors=this.vertexColors;a.fog=this.fog;return a};THREE.ParticleCanvasMaterial=function(a){THREE.Material.call(this);this.color=new THREE.Color(16777215);this.program=function(){};this.setValues(a)};THREE.ParticleCanvasMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.ParticleCanvasMaterial.prototype.clone=function(){var a=new THREE.ParticleCanvasMaterial;THREE.Material.prototype.clone.call(this,a);a.color.copy(this.color);a.program=this.program;return a};THREE.ParticleDOMMaterial=function(a){this.element=a};THREE.ParticleDOMMaterial.prototype.clone=function(){return new THREE.ParticleDOMMaterial(this.element)};
THREE.ShaderMaterial=function(a){THREE.Material.call(this);this.vertexShader=this.fragmentShader="void main() {}";this.uniforms={};this.defines={};this.attributes=null;this.shading=THREE.SmoothShading;this.wireframe=!1;this.wireframeLinewidth=1;this.lights=this.fog=!1;this.vertexColors=THREE.NoColors;this.morphNormals=this.morphTargets=this.skinning=!1;this.setValues(a)};THREE.ShaderMaterial.prototype=Object.create(THREE.Material.prototype);
THREE.ShaderMaterial.prototype.clone=function(){var a=new THREE.ShaderMaterial;THREE.Material.prototype.clone.call(this,a);a.fragmentShader=this.fragmentShader;a.vertexShader=this.vertexShader;a.uniforms=THREE.UniformsUtils.clone(this.uniforms);a.attributes=this.attributes;a.defines=this.defines;a.shading=this.shading;a.wireframe=this.wireframe;a.wireframeLinewidth=this.wireframeLinewidth;a.fog=this.fog;a.lights=this.lights;a.vertexColors=this.vertexColors;a.skinning=this.skinning;a.morphTargets=
this.morphTargets;a.morphNormals=this.morphNormals;return a};
THREE.Texture=function(a,b,c,d,e,f,g,h,i){THREE.TextureLibrary.push(this);this.id=THREE.TextureIdCount++;this.name="";this.image=a;this.mapping=void 0!==b?b:new THREE.UVMapping;this.wrapS=void 0!==c?c:THREE.ClampToEdgeWrapping;this.wrapT=void 0!==d?d:THREE.ClampToEdgeWrapping;this.magFilter=void 0!==e?e:THREE.LinearFilter;this.minFilter=void 0!==f?f:THREE.LinearMipMapLinearFilter;this.anisotropy=void 0!==i?i:1;this.format=void 0!==g?g:THREE.RGBAFormat;this.type=void 0!==h?h:THREE.UnsignedByteType;
this.offset=new THREE.Vector2(0,0);this.repeat=new THREE.Vector2(1,1);this.generateMipmaps=!0;this.premultiplyAlpha=!1;this.flipY=!0;this.needsUpdate=!1;this.onUpdate=null};
THREE.Texture.prototype={constructor:THREE.Texture,clone:function(){var a=new THREE.Texture;a.image=this.image;a.mapping=this.mapping;a.wrapS=this.wrapS;a.wrapT=this.wrapT;a.magFilter=this.magFilter;a.minFilter=this.minFilter;a.anisotropy=this.anisotropy;a.format=this.format;a.type=this.type;a.offset.copy(this.offset);a.repeat.copy(this.repeat);a.generateMipmaps=this.generateMipmaps;a.premultiplyAlpha=this.premultiplyAlpha;a.flipY=this.flipY;return a},deallocate:function(){var a=THREE.TextureLibrary.indexOf(this);
-1!==a&&THREE.TextureLibrary.splice(a,1)}};THREE.TextureIdCount=0;THREE.TextureLibrary=[];THREE.CompressedTexture=function(a,b,c,d,e,f,g,h,i,j){THREE.Texture.call(this,null,f,g,h,i,j,d,e);this.image={width:b,height:c};this.mipmaps=a};THREE.CompressedTexture.prototype=Object.create(THREE.Texture.prototype);
THREE.CompressedTexture.prototype.clone=function(){var a=new THREE.CompressedTexture;a.image=this.image;a.mipmaps=this.mipmaps;a.format=this.format;a.type=this.type;a.mapping=this.mapping;a.wrapS=this.wrapS;a.wrapT=this.wrapT;a.magFilter=this.magFilter;a.minFilter=this.minFilter;a.anisotropy=this.anisotropy;a.offset.copy(this.offset);a.repeat.copy(this.repeat);return a};THREE.DataTexture=function(a,b,c,d,e,f,g,h,i,j){THREE.Texture.call(this,null,f,g,h,i,j,d,e);this.image={data:a,width:b,height:c}};
THREE.DataTexture.prototype=Object.create(THREE.Texture.prototype);THREE.DataTexture.prototype.clone=function(){var a=new THREE.DataTexture(this.image.data,this.image.width,this.image.height,this.format,this.type,this.mapping,this.wrapS,this.wrapT,this.magFilter,this.minFilter);a.offset.copy(this.offset);a.repeat.copy(this.repeat);return a};THREE.Particle=function(a){THREE.Object3D.call(this);this.material=a};THREE.Particle.prototype=Object.create(THREE.Object3D.prototype);
THREE.Particle.prototype.clone=function(a){void 0===a&&(a=new THREE.Particle(this.material));THREE.Object3D.prototype.clone.call(this,a);return a};THREE.ParticleSystem=function(a,b){THREE.Object3D.call(this);this.geometry=a;this.material=void 0!==b?b:new THREE.ParticleBasicMaterial({color:16777215*Math.random()});this.sortParticles=!1;this.geometry&&(null===this.geometry.boundingSphere&&this.geometry.computeBoundingSphere(),this.boundRadius=a.boundingSphere.radius);this.frustumCulled=!1};
THREE.ParticleSystem.prototype=Object.create(THREE.Object3D.prototype);THREE.ParticleSystem.prototype.clone=function(a){void 0===a&&(a=new THREE.ParticleSystem(this.geometry,this.material));a.sortParticles=this.sortParticles;THREE.Object3D.prototype.clone.call(this,a);return a};
THREE.Line=function(a,b,c){THREE.Object3D.call(this);this.geometry=a;this.material=void 0!==b?b:new THREE.LineBasicMaterial({color:16777215*Math.random()});this.type=void 0!==c?c:THREE.LineStrip;this.geometry&&(this.geometry.boundingSphere||this.geometry.computeBoundingSphere())};THREE.LineStrip=0;THREE.LinePieces=1;THREE.Line.prototype=Object.create(THREE.Object3D.prototype);
THREE.Line.prototype.clone=function(a){void 0===a&&(a=new THREE.Line(this.geometry,this.material,this.type));THREE.Object3D.prototype.clone.call(this,a);return a};
THREE.Mesh=function(a,b){THREE.Object3D.call(this);this.geometry=a;this.material=void 0!==b?b:new THREE.MeshBasicMaterial({color:16777215*Math.random(),wireframe:!0});if(this.geometry&&(null===this.geometry.boundingSphere&&this.geometry.computeBoundingSphere(),this.boundRadius=a.boundingSphere.radius,this.geometry.morphTargets.length)){this.morphTargetBase=-1;this.morphTargetForcedOrder=[];this.morphTargetInfluences=[];this.morphTargetDictionary={};for(var c=0;c<this.geometry.morphTargets.length;c++)this.morphTargetInfluences.push(0),
this.morphTargetDictionary[this.geometry.morphTargets[c].name]=c}};THREE.Mesh.prototype=Object.create(THREE.Object3D.prototype);THREE.Mesh.prototype.getMorphTargetIndexByName=function(a){if(void 0!==this.morphTargetDictionary[a])return this.morphTargetDictionary[a];console.log("THREE.Mesh.getMorphTargetIndexByName: morph target "+a+" does not exist. Returning 0.");return 0};
THREE.Mesh.prototype.clone=function(a){void 0===a&&(a=new THREE.Mesh(this.geometry,this.material));THREE.Object3D.prototype.clone.call(this,a);return a};THREE.Bone=function(a){THREE.Object3D.call(this);this.skin=a;this.skinMatrix=new THREE.Matrix4};THREE.Bone.prototype=Object.create(THREE.Object3D.prototype);
THREE.Bone.prototype.update=function(a,b){this.matrixAutoUpdate&&(b|=this.updateMatrix());if(b||this.matrixWorldNeedsUpdate)a?this.skinMatrix.multiply(a,this.matrix):this.skinMatrix.copy(this.matrix),this.matrixWorldNeedsUpdate=!1,b=!0;var c,d=this.children.length;for(c=0;c<d;c++)this.children[c].update(this.skinMatrix,b)};
THREE.SkinnedMesh=function(a,b,c){THREE.Mesh.call(this,a,b);this.useVertexTexture=void 0!==c?c:!0;this.identityMatrix=new THREE.Matrix4;this.bones=[];this.boneMatrices=[];var d,e,f;if(this.geometry&&void 0!==this.geometry.bones){for(a=0;a<this.geometry.bones.length;a++)c=this.geometry.bones[a],d=c.pos,e=c.rotq,f=c.scl,b=this.addBone(),b.name=c.name,b.position.set(d[0],d[1],d[2]),b.quaternion.set(e[0],e[1],e[2],e[3]),b.useQuaternion=!0,void 0!==f?b.scale.set(f[0],f[1],f[2]):b.scale.set(1,1,1);for(a=
0;a<this.bones.length;a++)c=this.geometry.bones[a],b=this.bones[a],-1===c.parent?this.add(b):this.bones[c.parent].add(b);a=this.bones.length;this.useVertexTexture?(this.boneTextureHeight=this.boneTextureWidth=a=256<a?64:64<a?32:16<a?16:8,this.boneMatrices=new Float32Array(4*this.boneTextureWidth*this.boneTextureHeight),this.boneTexture=new THREE.DataTexture(this.boneMatrices,this.boneTextureWidth,this.boneTextureHeight,THREE.RGBAFormat,THREE.FloatType),this.boneTexture.minFilter=THREE.NearestFilter,
this.boneTexture.magFilter=THREE.NearestFilter,this.boneTexture.generateMipmaps=!1,this.boneTexture.flipY=!1):this.boneMatrices=new Float32Array(16*a);this.pose()}};THREE.SkinnedMesh.prototype=Object.create(THREE.Mesh.prototype);THREE.SkinnedMesh.prototype.addBone=function(a){void 0===a&&(a=new THREE.Bone(this));this.bones.push(a);return a};
THREE.SkinnedMesh.prototype.updateMatrixWorld=function(a){this.matrixAutoUpdate&&this.updateMatrix();if(this.matrixWorldNeedsUpdate||a)this.parent?this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix):this.matrixWorld.copy(this.matrix),this.matrixWorldNeedsUpdate=!1;for(var a=0,b=this.children.length;a<b;a++){var c=this.children[a];c instanceof THREE.Bone?c.update(this.identityMatrix,!1):c.updateMatrixWorld(!0)}if(void 0==this.boneInverses){this.boneInverses=[];a=0;for(b=this.bones.length;a<
b;a++)c=new THREE.Matrix4,c.getInverse(this.bones[a].skinMatrix),this.boneInverses.push(c)}a=0;for(b=this.bones.length;a<b;a++)THREE.SkinnedMesh.offsetMatrix.multiply(this.bones[a].skinMatrix,this.boneInverses[a]),THREE.SkinnedMesh.offsetMatrix.flattenToArrayOffset(this.boneMatrices,16*a);this.useVertexTexture&&(this.boneTexture.needsUpdate=!0)};
THREE.SkinnedMesh.prototype.pose=function(){this.updateMatrixWorld(!0);for(var a=0;a<this.geometry.skinIndices.length;a++){var b=this.geometry.skinWeights[a],c=1/b.lengthManhattan();Infinity!==c?b.multiplyScalar(c):b.set(1)}};THREE.SkinnedMesh.prototype.clone=function(a){void 0===a&&(a=new THREE.SkinnedMesh(this.geometry,this.material,this.useVertexTexture));THREE.Mesh.prototype.clone.call(this,a);return a};THREE.SkinnedMesh.offsetMatrix=new THREE.Matrix4;
THREE.MorphAnimMesh=function(a,b){THREE.Mesh.call(this,a,b);this.duration=1E3;this.mirroredLoop=!1;this.currentKeyframe=this.lastKeyframe=this.time=0;this.direction=1;this.directionBackwards=!1;this.setFrameRange(0,this.geometry.morphTargets.length-1)};THREE.MorphAnimMesh.prototype=Object.create(THREE.Mesh.prototype);THREE.MorphAnimMesh.prototype.setFrameRange=function(a,b){this.startKeyframe=a;this.endKeyframe=b;this.length=this.endKeyframe-this.startKeyframe+1};
THREE.MorphAnimMesh.prototype.setDirectionForward=function(){this.direction=1;this.directionBackwards=!1};THREE.MorphAnimMesh.prototype.setDirectionBackward=function(){this.direction=-1;this.directionBackwards=!0};
THREE.MorphAnimMesh.prototype.parseAnimations=function(){var a=this.geometry;a.animations||(a.animations={});for(var b,c=a.animations,d=/([a-z]+)(\d+)/,e=0,f=a.morphTargets.length;e<f;e++){var g=a.morphTargets[e].name.match(d);if(g&&1<g.length){g=g[1];c[g]||(c[g]={start:Infinity,end:-Infinity});var h=c[g];e<h.start&&(h.start=e);e>h.end&&(h.end=e);b||(b=g)}}a.firstAnimation=b};
THREE.MorphAnimMesh.prototype.setAnimationLabel=function(a,b,c){this.geometry.animations||(this.geometry.animations={});this.geometry.animations[a]={start:b,end:c}};THREE.MorphAnimMesh.prototype.playAnimation=function(a,b){var c=this.geometry.animations[a];c?(this.setFrameRange(c.start,c.end),this.duration=1E3*((c.end-c.start)/b),this.time=0):console.warn("animation["+a+"] undefined")};
THREE.MorphAnimMesh.prototype.updateAnimation=function(a){var b=this.duration/this.length;this.time+=this.direction*a;if(this.mirroredLoop){if(this.time>this.duration||0>this.time)if(this.direction*=-1,this.time>this.duration&&(this.time=this.duration,this.directionBackwards=!0),0>this.time)this.time=0,this.directionBackwards=!1}else this.time%=this.duration,0>this.time&&(this.time+=this.duration);a=this.startKeyframe+THREE.Math.clamp(Math.floor(this.time/b),0,this.length-1);a!==this.currentKeyframe&&
(this.morphTargetInfluences[this.lastKeyframe]=0,this.morphTargetInfluences[this.currentKeyframe]=1,this.morphTargetInfluences[a]=0,this.lastKeyframe=this.currentKeyframe,this.currentKeyframe=a);b=this.time%b/b;this.directionBackwards&&(b=1-b);this.morphTargetInfluences[this.currentKeyframe]=b;this.morphTargetInfluences[this.lastKeyframe]=1-b};
THREE.MorphAnimMesh.prototype.clone=function(a){void 0===a&&(a=new THREE.MorphAnimMesh(this.geometry,this.material));a.duration=this.duration;a.mirroredLoop=this.mirroredLoop;a.time=this.time;a.lastKeyframe=this.lastKeyframe;a.currentKeyframe=this.currentKeyframe;a.direction=this.direction;a.directionBackwards=this.directionBackwards;THREE.Mesh.prototype.clone.call(this,a);return a};THREE.Ribbon=function(a,b){THREE.Object3D.call(this);this.geometry=a;this.material=b};THREE.Ribbon.prototype=Object.create(THREE.Object3D.prototype);
THREE.Ribbon.prototype.clone=function(a){void 0===a&&(a=new THREE.Ribbon(this.geometry,this.material));THREE.Object3D.prototype.clone.call(this,a);return a};THREE.LOD=function(){THREE.Object3D.call(this);this.LODs=[]};THREE.LOD.prototype=Object.create(THREE.Object3D.prototype);THREE.LOD.prototype.addLevel=function(a,b){void 0===b&&(b=0);for(var b=Math.abs(b),c=0;c<this.LODs.length&&!(b<this.LODs[c].visibleAtDistance);c++);this.LODs.splice(c,0,{visibleAtDistance:b,object3D:a});this.add(a)};
THREE.LOD.prototype.update=function(a){if(1<this.LODs.length){a.matrixWorldInverse.getInverse(a.matrixWorld);a=a.matrixWorldInverse;a=-(a.elements[2]*this.matrixWorld.elements[12]+a.elements[6]*this.matrixWorld.elements[13]+a.elements[10]*this.matrixWorld.elements[14]+a.elements[14]);this.LODs[0].object3D.visible=!0;for(var b=1;b<this.LODs.length;b++)if(a>=this.LODs[b].visibleAtDistance)this.LODs[b-1].object3D.visible=!1,this.LODs[b].object3D.visible=!0;else break;for(;b<this.LODs.length;b++)this.LODs[b].object3D.visible=
!1}};THREE.LOD.prototype.clone=function(){};
THREE.Sprite=function(a){THREE.Object3D.call(this);a=a||{};this.color=void 0!==a.color?new THREE.Color(a.color):new THREE.Color(16777215);this.map=void 0!==a.map?a.map:new THREE.Texture;this.blending=void 0!==a.blending?a.blending:THREE.NormalBlending;this.blendSrc=void 0!==a.blendSrc?a.blendSrc:THREE.SrcAlphaFactor;this.blendDst=void 0!==a.blendDst?a.blendDst:THREE.OneMinusSrcAlphaFactor;this.blendEquation=void 0!==a.blendEquation?a.blendEquation:THREE.AddEquation;this.useScreenCoordinates=void 0!==
a.useScreenCoordinates?a.useScreenCoordinates:!0;this.mergeWith3D=void 0!==a.mergeWith3D?a.mergeWith3D:!this.useScreenCoordinates;this.affectedByDistance=void 0!==a.affectedByDistance?a.affectedByDistance:!this.useScreenCoordinates;this.scaleByViewport=void 0!==a.scaleByViewport?a.scaleByViewport:!this.affectedByDistance;this.alignment=a.alignment instanceof THREE.Vector2?a.alignment:THREE.SpriteAlignment.center.clone();this.fog=void 0!==a.fog?a.fog:!1;this.rotation3d=this.rotation;this.rotation=
0;this.opacity=1;this.uvOffset=new THREE.Vector2(0,0);this.uvScale=new THREE.Vector2(1,1)};THREE.Sprite.prototype=Object.create(THREE.Object3D.prototype);THREE.Sprite.prototype.updateMatrix=function(){this.matrix.setPosition(this.position);this.rotation3d.set(0,0,this.rotation);this.matrix.setRotationFromEuler(this.rotation3d);if(1!==this.scale.x||1!==this.scale.y)this.matrix.scale(this.scale),this.boundRadiusScale=Math.max(this.scale.x,this.scale.y);this.matrixWorldNeedsUpdate=!0};
THREE.Sprite.prototype.clone=function(a){void 0===a&&(a=new THREE.Sprite({}));a.color.copy(this.color);a.map=this.map;a.blending=this.blending;a.useScreenCoordinates=this.useScreenCoordinates;a.mergeWith3D=this.mergeWith3D;a.affectedByDistance=this.affectedByDistance;a.scaleByViewport=this.scaleByViewport;a.alignment=this.alignment;a.fog=this.fog;a.rotation3d.copy(this.rotation3d);a.rotation=this.rotation;a.opacity=this.opacity;a.uvOffset.copy(this.uvOffset);a.uvScale.copy(this.uvScale);THREE.Object3D.prototype.clone.call(this,
a);return a};THREE.SpriteAlignment={};THREE.SpriteAlignment.topLeft=new THREE.Vector2(1,-1);THREE.SpriteAlignment.topCenter=new THREE.Vector2(0,-1);THREE.SpriteAlignment.topRight=new THREE.Vector2(-1,-1);THREE.SpriteAlignment.centerLeft=new THREE.Vector2(1,0);THREE.SpriteAlignment.center=new THREE.Vector2(0,0);THREE.SpriteAlignment.centerRight=new THREE.Vector2(-1,0);THREE.SpriteAlignment.bottomLeft=new THREE.Vector2(1,1);THREE.SpriteAlignment.bottomCenter=new THREE.Vector2(0,1);
THREE.SpriteAlignment.bottomRight=new THREE.Vector2(-1,1);THREE.Scene=function(){THREE.Object3D.call(this);this.overrideMaterial=this.fog=null;this.matrixAutoUpdate=!1;this.__objects=[];this.__lights=[];this.__objectsAdded=[];this.__objectsRemoved=[]};THREE.Scene.prototype=Object.create(THREE.Object3D.prototype);
THREE.Scene.prototype.__addObject=function(a){if(a instanceof THREE.Light)-1===this.__lights.indexOf(a)&&this.__lights.push(a),a.target&&void 0===a.target.parent&&this.add(a.target);else if(!(a instanceof THREE.Camera||a instanceof THREE.Bone)&&-1===this.__objects.indexOf(a)){this.__objects.push(a);this.__objectsAdded.push(a);var b=this.__objectsRemoved.indexOf(a);-1!==b&&this.__objectsRemoved.splice(b,1)}for(b=0;b<a.children.length;b++)this.__addObject(a.children[b])};
THREE.Scene.prototype.__removeObject=function(a){if(a instanceof THREE.Light){var b=this.__lights.indexOf(a);-1!==b&&this.__lights.splice(b,1)}else a instanceof THREE.Camera||(b=this.__objects.indexOf(a),-1!==b&&(this.__objects.splice(b,1),this.__objectsRemoved.push(a),b=this.__objectsAdded.indexOf(a),-1!==b&&this.__objectsAdded.splice(b,1)));for(b=0;b<a.children.length;b++)this.__removeObject(a.children[b])};
THREE.Fog=function(a,b,c){this.name="";this.color=new THREE.Color(a);this.near=void 0!==b?b:1;this.far=void 0!==c?c:1E3};THREE.Fog.prototype.clone=function(){return new THREE.Fog(this.color.getHex(),this.near,this.far)};THREE.FogExp2=function(a,b){this.name="";this.color=new THREE.Color(a);this.density=void 0!==b?b:2.5E-4};THREE.FogExp2.prototype.clone=function(){return new THREE.FogExp2(this.color.getHex(),this.density)};
THREE.CanvasRenderer=function(a){function b(a){z!==a&&(z=s.globalAlpha=a)}function c(a){w!==a&&(a===THREE.NormalBlending?s.globalCompositeOperation="source-over":a===THREE.AdditiveBlending?s.globalCompositeOperation="lighter":a===THREE.SubtractiveBlending&&(s.globalCompositeOperation="darker"),w=a)}function d(a){q!==a&&(q=s.strokeStyle=a)}function e(a){E!==a&&(E=s.fillStyle=a)}console.log("THREE.CanvasRenderer",THREE.REVISION);var a=a||{},f=this,g,h,i,j=new THREE.Projector,l=void 0!==a.canvas?a.canvas:
document.createElement("canvas"),m,n,p,o,s=l.getContext("2d"),t=new THREE.Color(0),r=0,z=1,w=0,q=null,E=null,A=null,v=null,u=null,D,C,G,P,B=new THREE.RenderableVertex,K=new THREE.RenderableVertex,H,I,N,O,R,ga,M,J,Q,Z,L,oa,X=new THREE.Color,fa=new THREE.Color,ca=new THREE.Color,Y=new THREE.Color,ba=new THREE.Color,aa=new THREE.Color,ia=new THREE.Color,Aa={},Na={},Ja,ma,sa,Ea,rb,ib,ob,jb,Bb,Cb,Wa=new THREE.Rectangle,Sa=new THREE.Rectangle,Ka=new THREE.Rectangle,kb=!1,Oa=new THREE.Color,lb=new THREE.Color,
ab=new THREE.Color,va=new THREE.Vector3,eb,pb,bb,xa,mb,sb,a=16;eb=document.createElement("canvas");eb.width=eb.height=2;pb=eb.getContext("2d");pb.fillStyle="rgba(0,0,0,1)";pb.fillRect(0,0,2,2);bb=pb.getImageData(0,0,2,2);xa=bb.data;mb=document.createElement("canvas");mb.width=mb.height=a;sb=mb.getContext("2d");sb.translate(-a/2,-a/2);sb.scale(a,a);a--;this.domElement=l;this.sortElements=this.sortObjects=this.autoClear=!0;this.info={render:{vertices:0,faces:0}};this.setSize=function(a,b){m=a;n=b;p=
Math.floor(m/2);o=Math.floor(n/2);l.width=m;l.height=n;Wa.set(-p,-o,p,o);Sa.set(-p,-o,p,o);z=1;w=0;u=v=A=E=q=null};this.setClearColor=function(a,b){t.copy(a);r=void 0!==b?b:1;Sa.set(-p,-o,p,o)};this.setClearColorHex=function(a,b){t.setHex(a);r=void 0!==b?b:1;Sa.set(-p,-o,p,o)};this.getMaxAnisotropy=function(){return 0};this.clear=function(){s.setTransform(1,0,0,-1,p,o);!1===Sa.isEmpty()&&(Sa.minSelf(Wa),Sa.inflate(2),1>r&&s.clearRect(Math.floor(Sa.getX()),Math.floor(Sa.getY()),Math.floor(Sa.getWidth()),
Math.floor(Sa.getHeight())),0<r&&(c(THREE.NormalBlending),b(1),e("rgba("+Math.floor(255*t.r)+","+Math.floor(255*t.g)+","+Math.floor(255*t.b)+","+r+")"),s.fillRect(Math.floor(Sa.getX()),Math.floor(Sa.getY()),Math.floor(Sa.getWidth()),Math.floor(Sa.getHeight()))),Sa.empty())};this.render=function(a,l){function n(a,b,c){for(var d=0,e=i.length;d<e;d++){var f=i[d],g=f.color;if(f instanceof THREE.DirectionalLight){var h=f.matrixWorld.getPosition().normalize(),k=b.dot(h);0>=k||(k*=f.intensity,c.r+=g.r*k,
c.g+=g.g*k,c.b+=g.b*k)}else f instanceof THREE.PointLight&&(h=f.matrixWorld.getPosition(),k=b.dot(va.sub(h,a).normalize()),0>=k||(k*=0==f.distance?1:1-Math.min(a.distanceTo(h)/f.distance,1),0!=k&&(k*=f.intensity,c.r+=g.r*k,c.g+=g.g*k,c.b+=g.b*k)))}}function m(a,d,e,g,h,k,i,j){f.info.render.vertices+=3;f.info.render.faces++;b(j.opacity);c(j.blending);H=a.positionScreen.x;I=a.positionScreen.y;N=d.positionScreen.x;O=d.positionScreen.y;R=e.positionScreen.x;ga=e.positionScreen.y;r(H,I,N,O,R,ga);(j instanceof
THREE.MeshLambertMaterial||j instanceof THREE.MeshPhongMaterial)&&null===j.map&&null===j.map?(aa.copy(j.color),ia.copy(j.emissive),j.vertexColors===THREE.FaceColors&&(aa.r*=i.color.r,aa.g*=i.color.g,aa.b*=i.color.b),!0===kb)?!1===j.wireframe&&j.shading==THREE.SmoothShading&&3==i.vertexNormalsLength?(fa.r=ca.r=Y.r=Oa.r,fa.g=ca.g=Y.g=Oa.g,fa.b=ca.b=Y.b=Oa.b,n(i.v1.positionWorld,i.vertexNormalsWorld[0],fa),n(i.v2.positionWorld,i.vertexNormalsWorld[1],ca),n(i.v3.positionWorld,i.vertexNormalsWorld[2],
Y),fa.r=fa.r*aa.r+ia.r,fa.g=fa.g*aa.g+ia.g,fa.b=fa.b*aa.b+ia.b,ca.r=ca.r*aa.r+ia.r,ca.g=ca.g*aa.g+ia.g,ca.b=ca.b*aa.b+ia.b,Y.r=Y.r*aa.r+ia.r,Y.g=Y.g*aa.g+ia.g,Y.b=Y.b*aa.b+ia.b,ba.r=0.5*(ca.r+Y.r),ba.g=0.5*(ca.g+Y.g),ba.b=0.5*(ca.b+Y.b),sa=yc(fa,ca,Y,ba),na(H,I,N,O,R,ga,0,0,1,0,0,1,sa)):(X.r=Oa.r,X.g=Oa.g,X.b=Oa.b,n(i.centroidWorld,i.normalWorld,X),X.r=X.r*aa.r+ia.r,X.g=X.g*aa.g+ia.g,X.b=X.b*aa.b+ia.b,!0===j.wireframe?t(X,j.wireframeLinewidth,j.wireframeLinecap,j.wireframeLinejoin):w(X)):!0===j.wireframe?
t(j.color,j.wireframeLinewidth,j.wireframeLinecap,j.wireframeLinejoin):w(j.color):j instanceof THREE.MeshBasicMaterial||j instanceof THREE.MeshLambertMaterial||j instanceof THREE.MeshPhongMaterial?null!==j.map?j.map.mapping instanceof THREE.UVMapping&&(Ea=i.uvs[0],z(H,I,N,O,R,ga,Ea[g].u,Ea[g].v,Ea[h].u,Ea[h].v,Ea[k].u,Ea[k].v,j.map)):null!==j.envMap?j.envMap.mapping instanceof THREE.SphericalReflectionMapping&&(a=l.matrixWorldInverse,va.copy(i.vertexNormalsWorld[g]),rb=0.5*(va.x*a.elements[0]+va.y*
a.elements[4]+va.z*a.elements[8])+0.5,ib=0.5*(va.x*a.elements[1]+va.y*a.elements[5]+va.z*a.elements[9])+0.5,va.copy(i.vertexNormalsWorld[h]),ob=0.5*(va.x*a.elements[0]+va.y*a.elements[4]+va.z*a.elements[8])+0.5,jb=0.5*(va.x*a.elements[1]+va.y*a.elements[5]+va.z*a.elements[9])+0.5,va.copy(i.vertexNormalsWorld[k]),Bb=0.5*(va.x*a.elements[0]+va.y*a.elements[4]+va.z*a.elements[8])+0.5,Cb=0.5*(va.x*a.elements[1]+va.y*a.elements[5]+va.z*a.elements[9])+0.5,z(H,I,N,O,R,ga,rb,ib,ob,jb,Bb,Cb,j.envMap)):(X.copy(j.color),
j.vertexColors===THREE.FaceColors&&(X.r*=i.color.r,X.g*=i.color.g,X.b*=i.color.b),!0===j.wireframe?t(X,j.wireframeLinewidth,j.wireframeLinecap,j.wireframeLinejoin):w(X)):j instanceof THREE.MeshDepthMaterial?(Ja=l.near,ma=l.far,fa.r=fa.g=fa.b=1-Db(a.positionScreen.z,Ja,ma),ca.r=ca.g=ca.b=1-Db(d.positionScreen.z,Ja,ma),Y.r=Y.g=Y.b=1-Db(e.positionScreen.z,Ja,ma),ba.r=0.5*(ca.r+Y.r),ba.g=0.5*(ca.g+Y.g),ba.b=0.5*(ca.b+Y.b),sa=yc(fa,ca,Y,ba),na(H,I,N,O,R,ga,0,0,1,0,0,1,sa)):j instanceof THREE.MeshNormalMaterial&&
(X.r=ic(i.normalWorld.x),X.g=ic(i.normalWorld.y),X.b=ic(i.normalWorld.z),!0===j.wireframe?t(X,j.wireframeLinewidth,j.wireframeLinecap,j.wireframeLinejoin):w(X))}function r(a,b,c,d,e,f){s.beginPath();s.moveTo(a,b);s.lineTo(c,d);s.lineTo(e,f);s.closePath()}function q(a,b,c,d,e,f,g,h){s.beginPath();s.moveTo(a,b);s.lineTo(c,d);s.lineTo(e,f);s.lineTo(g,h);s.closePath()}function t(a,b,c,e){A!==b&&(A=s.lineWidth=b);v!==c&&(v=s.lineCap=c);u!==e&&(u=s.lineJoin=e);d(a.getContextStyle());s.stroke();Ka.inflate(2*
b)}function w(a){e(a.getContextStyle());s.fill()}function z(a,b,c,d,f,g,h,k,i,j,l,n,na){if(!(na instanceof THREE.DataTexture||void 0===na.image||0==na.image.width)){if(!0===na.needsUpdate){var m=na.wrapS==THREE.RepeatWrapping,o=na.wrapT==THREE.RepeatWrapping;Aa[na.id]=s.createPattern(na.image,!0===m&&!0===o?"repeat":!0===m&&!1===o?"repeat-x":!1===m&&!0===o?"repeat-y":"no-repeat");na.needsUpdate=!1}void 0===Aa[na.id]?e("rgba(0,0,0,1)"):e(Aa[na.id]);var m=na.offset.x/na.repeat.x,o=na.offset.y/na.repeat.y,
Db=na.image.width*na.repeat.x,p=na.image.height*na.repeat.y,h=(h+m)*Db,k=(1-k+o)*p,c=c-a,d=d-b,f=f-a,g=g-b,i=(i+m)*Db-h,j=(1-j+o)*p-k,l=(l+m)*Db-h,n=(1-n+o)*p-k,m=i*n-l*j;0===m?(void 0===Na[na.id]&&(b=document.createElement("canvas"),b.width=na.image.width,b.height=na.image.height,b=b.getContext("2d"),b.drawImage(na.image,0,0),Na[na.id]=b.getImageData(0,0,na.image.width,na.image.height).data),b=Na[na.id],h=4*(Math.floor(h)+Math.floor(k)*na.image.width),X.setRGB(b[h]/255,b[h+1]/255,b[h+2]/255),w(X)):
(m=1/m,na=(n*c-j*f)*m,j=(n*d-j*g)*m,c=(i*f-l*c)*m,d=(i*g-l*d)*m,a=a-na*h-c*k,h=b-j*h-d*k,s.save(),s.transform(na,j,c,d,a,h),s.fill(),s.restore())}}function na(a,b,c,d,e,f,g,h,k,i,j,l,na){var n,m;n=na.width-1;m=na.height-1;g*=n;h*=m;c-=a;d-=b;e-=a;f-=b;k=k*n-g;i=i*m-h;j=j*n-g;l=l*m-h;m=1/(k*l-j*i);n=(l*c-i*e)*m;i=(l*d-i*f)*m;c=(k*e-j*c)*m;d=(k*f-j*d)*m;a=a-n*g-c*h;b=b-i*g-d*h;s.save();s.transform(n,i,c,d,a,b);s.clip();s.drawImage(na,0,0);s.restore()}function yc(a,b,c,d){xa[0]=255*a.r|0;xa[1]=255*a.g|
0;xa[2]=255*a.b|0;xa[4]=255*b.r|0;xa[5]=255*b.g|0;xa[6]=255*b.b|0;xa[8]=255*c.r|0;xa[9]=255*c.g|0;xa[10]=255*c.b|0;xa[12]=255*d.r|0;xa[13]=255*d.g|0;xa[14]=255*d.b|0;pb.putImageData(bb,0,0);sb.drawImage(eb,0,0);return mb}function Db(a,b,c){a=(a-b)/(c-b);return a*a*(3-2*a)}function ic(a){a=0.5*(a+1);return 0>a?0:1<a?1:a}function Zb(a,b){var c=b.x-a.x,d=b.y-a.y,e=c*c+d*d;0!==e&&(e=1/Math.sqrt(e),c*=e,d*=e,b.x+=c,b.y+=d,a.x-=c,a.y-=d)}if(!1===l instanceof THREE.Camera)console.error("THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.");
else{var $b,zc,ka,da;!0===this.autoClear?this.clear():s.setTransform(1,0,0,-1,p,o);f.info.render.vertices=0;f.info.render.faces=0;g=j.projectScene(a,l,this.sortObjects,this.sortElements);h=g.elements;i=g.lights;kb=0<i.length;if(!0===kb){Oa.setRGB(0,0,0);lb.setRGB(0,0,0);ab.setRGB(0,0,0);$b=0;for(zc=i.length;$b<zc;$b++){da=i[$b];var la=da.color;da instanceof THREE.AmbientLight?(Oa.r+=la.r,Oa.g+=la.g,Oa.b+=la.b):da instanceof THREE.DirectionalLight?(lb.r+=la.r,lb.g+=la.g,lb.b+=la.b):da instanceof THREE.PointLight&&
(ab.r+=la.r,ab.g+=la.g,ab.b+=la.b)}}$b=0;for(zc=h.length;$b<zc;$b++)if(ka=h[$b],da=ka.material,!(void 0===da||!1===da.visible)){Ka.empty();if(ka instanceof THREE.RenderableParticle){D=ka;D.x*=p;D.y*=o;var la=D,cb=ka;b(da.opacity);c(da.blending);var E=void 0,Ab=void 0,tb=void 0,ub=void 0,jc=ka=void 0,Rc=void 0;da instanceof THREE.ParticleBasicMaterial?null===da.map?(tb=cb.object.scale.x,ub=cb.object.scale.y,tb*=cb.scale.x*p,ub*=cb.scale.y*o,Ka.set(la.x-tb,la.y-ub,la.x+tb,la.y+ub),!1!==Wa.intersects(Ka)&&
(e(da.color.getContextStyle()),s.save(),s.translate(la.x,la.y),s.rotate(-cb.rotation),s.scale(tb,ub),s.fillRect(-1,-1,2,2),s.restore())):(ka=da.map.image,jc=ka.width>>1,Rc=ka.height>>1,tb=cb.scale.x*p,ub=cb.scale.y*o,E=tb*jc,Ab=ub*Rc,Ka.set(la.x-E,la.y-Ab,la.x+E,la.y+Ab),!1!==Wa.intersects(Ka)&&(s.save(),s.translate(la.x,la.y),s.rotate(-cb.rotation),s.scale(tb,-ub),s.translate(-jc,-Rc),s.drawImage(ka,0,0),s.restore())):da instanceof THREE.ParticleCanvasMaterial&&(E=cb.scale.x*p,Ab=cb.scale.y*o,Ka.set(la.x-
E,la.y-Ab,la.x+E,la.y+Ab),!1!==Wa.intersects(Ka)&&(d(da.color.getContextStyle()),e(da.color.getContextStyle()),s.save(),s.translate(la.x,la.y),s.rotate(-cb.rotation),s.scale(E,Ab),da.program(s),s.restore()))}else if(ka instanceof THREE.RenderableLine){if(D=ka.v1,C=ka.v2,D.positionScreen.x*=p,D.positionScreen.y*=o,C.positionScreen.x*=p,C.positionScreen.y*=o,Ka.addPoint(D.positionScreen.x,D.positionScreen.y),Ka.addPoint(C.positionScreen.x,C.positionScreen.y),!0===Wa.intersects(Ka)&&(la=D,cb=C,b(da.opacity),
c(da.blending),s.beginPath(),s.moveTo(la.positionScreen.x,la.positionScreen.y),s.lineTo(cb.positionScreen.x,cb.positionScreen.y),da instanceof THREE.LineBasicMaterial))la=da.linewidth,A!==la&&(A=s.lineWidth=la),la=da.linecap,v!==la&&(v=s.lineCap=la),la=da.linejoin,u!==la&&(u=s.lineJoin=la),d(da.color.getContextStyle()),s.stroke(),Ka.inflate(2*da.linewidth)}else if(ka instanceof THREE.RenderableFace3)D=ka.v1,C=ka.v2,G=ka.v3,D.positionScreen.x*=p,D.positionScreen.y*=o,C.positionScreen.x*=p,C.positionScreen.y*=
o,G.positionScreen.x*=p,G.positionScreen.y*=o,!0===da.overdraw&&(Zb(D.positionScreen,C.positionScreen),Zb(C.positionScreen,G.positionScreen),Zb(G.positionScreen,D.positionScreen)),Ka.add3Points(D.positionScreen.x,D.positionScreen.y,C.positionScreen.x,C.positionScreen.y,G.positionScreen.x,G.positionScreen.y),!0===Wa.intersects(Ka)&&m(D,C,G,0,1,2,ka,da,a);else if(ka instanceof THREE.RenderableFace4&&(D=ka.v1,C=ka.v2,G=ka.v3,P=ka.v4,D.positionScreen.x*=p,D.positionScreen.y*=o,C.positionScreen.x*=p,C.positionScreen.y*=
o,G.positionScreen.x*=p,G.positionScreen.y*=o,P.positionScreen.x*=p,P.positionScreen.y*=o,B.positionScreen.copy(C.positionScreen),K.positionScreen.copy(P.positionScreen),!0===da.overdraw&&(Zb(D.positionScreen,C.positionScreen),Zb(C.positionScreen,P.positionScreen),Zb(P.positionScreen,D.positionScreen),Zb(G.positionScreen,B.positionScreen),Zb(G.positionScreen,K.positionScreen)),Ka.addPoint(D.positionScreen.x,D.positionScreen.y),Ka.addPoint(C.positionScreen.x,C.positionScreen.y),Ka.addPoint(G.positionScreen.x,
G.positionScreen.y),Ka.addPoint(P.positionScreen.x,P.positionScreen.y),!0===Wa.intersects(Ka)))(la=D,cb=C,E=G,Ab=P,tb=B,ub=K,jc=a,f.info.render.vertices+=4,f.info.render.faces++,b(da.opacity),c(da.blending),void 0!==da.map&&null!==da.map||void 0!==da.envMap&&null!==da.envMap)?(m(la,cb,Ab,0,1,3,ka,da,jc),m(tb,E,ub,1,2,3,ka,da,jc)):(H=la.positionScreen.x,I=la.positionScreen.y,N=cb.positionScreen.x,O=cb.positionScreen.y,R=E.positionScreen.x,ga=E.positionScreen.y,M=Ab.positionScreen.x,J=Ab.positionScreen.y,
Q=tb.positionScreen.x,Z=tb.positionScreen.y,L=ub.positionScreen.x,oa=ub.positionScreen.y,da instanceof THREE.MeshLambertMaterial||da instanceof THREE.MeshPhongMaterial)?(aa.copy(da.color),ia.copy(da.emissive),da.vertexColors===THREE.FaceColors&&(aa.r*=ka.color.r,aa.g*=ka.color.g,aa.b*=ka.color.b),!0===kb)?!1===da.wireframe&&da.shading==THREE.SmoothShading&&4==ka.vertexNormalsLength?(fa.r=ca.r=Y.r=ba.r=Oa.r,fa.g=ca.g=Y.g=ba.g=Oa.g,fa.b=ca.b=Y.b=ba.b=Oa.b,n(ka.v1.positionWorld,ka.vertexNormalsWorld[0],
fa),n(ka.v2.positionWorld,ka.vertexNormalsWorld[1],ca),n(ka.v4.positionWorld,ka.vertexNormalsWorld[3],Y),n(ka.v3.positionWorld,ka.vertexNormalsWorld[2],ba),fa.r=fa.r*aa.r+ia.r,fa.g=fa.g*aa.g+ia.g,fa.b=fa.b*aa.b+ia.b,ca.r=ca.r*aa.r+ia.r,ca.g=ca.g*aa.g+ia.g,ca.b=ca.b*aa.b+ia.b,Y.r=Y.r*aa.r+ia.r,Y.g=Y.g*aa.g+ia.g,Y.b=Y.b*aa.b+ia.b,ba.r=ba.r*aa.r+ia.r,ba.g=ba.g*aa.g+ia.g,ba.b=ba.b*aa.b+ia.b,sa=yc(fa,ca,Y,ba),r(H,I,N,O,M,J),na(H,I,N,O,M,J,0,0,1,0,0,1,sa),r(Q,Z,R,ga,L,oa),na(Q,Z,R,ga,L,oa,1,0,1,1,0,1,sa)):
(X.r=Oa.r,X.g=Oa.g,X.b=Oa.b,n(ka.centroidWorld,ka.normalWorld,X),X.r=X.r*aa.r+ia.r,X.g=X.g*aa.g+ia.g,X.b=X.b*aa.b+ia.b,q(H,I,N,O,R,ga,M,J),!0===da.wireframe?t(X,da.wireframeLinewidth,da.wireframeLinecap,da.wireframeLinejoin):w(X)):(X.r=aa.r+ia.r,X.g=aa.g+ia.g,X.b=aa.b+ia.b,q(H,I,N,O,R,ga,M,J),!0===da.wireframe?t(X,da.wireframeLinewidth,da.wireframeLinecap,da.wireframeLinejoin):w(X)):da instanceof THREE.MeshBasicMaterial?(X.copy(da.color),da.vertexColors===THREE.FaceColors&&(X.r*=ka.color.r,X.g*=ka.color.g,
X.b*=ka.color.b),q(H,I,N,O,R,ga,M,J),!0===da.wireframe?t(X,da.wireframeLinewidth,da.wireframeLinecap,da.wireframeLinejoin):w(X)):da instanceof THREE.MeshNormalMaterial?(X.r=ic(ka.normalWorld.x),X.g=ic(ka.normalWorld.y),X.b=ic(ka.normalWorld.z),q(H,I,N,O,R,ga,M,J),!0===da.wireframe?t(X,da.wireframeLinewidth,da.wireframeLinecap,da.wireframeLinejoin):w(X)):da instanceof THREE.MeshDepthMaterial&&(Ja=l.near,ma=l.far,fa.r=fa.g=fa.b=1-Db(la.positionScreen.z,Ja,ma),ca.r=ca.g=ca.b=1-Db(cb.positionScreen.z,
Ja,ma),Y.r=Y.g=Y.b=1-Db(Ab.positionScreen.z,Ja,ma),ba.r=ba.g=ba.b=1-Db(E.positionScreen.z,Ja,ma),sa=yc(fa,ca,Y,ba),r(H,I,N,O,M,J),na(H,I,N,O,M,J,0,0,1,0,0,1,sa),r(Q,Z,R,ga,L,oa),na(Q,Z,R,ga,L,oa,1,0,1,1,0,1,sa));Sa.addRectangle(Ka)}s.setTransform(1,0,0,1,0,0)}}};
THREE.ShaderChunk={fog_pars_fragment:"#ifdef USE_FOG\nuniform vec3 fogColor;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#endif",fog_fragment:"#ifdef USE_FOG\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n#ifdef FOG_EXP2\nconst float LOG2 = 1.442695;\nfloat fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n#else\nfloat fogFactor = smoothstep( fogNear, fogFar, depth );\n#endif\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n#endif",envmap_pars_fragment:"#ifdef USE_ENVMAP\nuniform float reflectivity;\nuniform samplerCube envMap;\nuniform float flipEnvMap;\nuniform int combine;\n#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\nuniform bool useRefract;\nuniform float refractionRatio;\n#else\nvarying vec3 vReflect;\n#endif\n#endif",
envmap_fragment:"#ifdef USE_ENVMAP\nvec3 reflectVec;\n#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\nvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\nif ( useRefract ) {\nreflectVec = refract( cameraToVertex, normal, refractionRatio );\n} else { \nreflectVec = reflect( cameraToVertex, normal );\n}\n#else\nreflectVec = vReflect;\n#endif\n#ifdef DOUBLE_SIDED\nfloat flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );\nvec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n#else\nvec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n#endif\n#ifdef GAMMA_INPUT\ncubeColor.xyz *= cubeColor.xyz;\n#endif\nif ( combine == 1 ) {\ngl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularStrength * reflectivity );\n} else if ( combine == 2 ) {\ngl_FragColor.xyz += cubeColor.xyz * specularStrength * reflectivity;\n} else {\ngl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * cubeColor.xyz, specularStrength * reflectivity );\n}\n#endif",
envmap_pars_vertex:"#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )\nvarying vec3 vReflect;\nuniform float refractionRatio;\nuniform bool useRefract;\n#endif",worldpos_vertex:"#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n#ifdef USE_SKINNING\nvec4 worldPosition = modelMatrix * skinned;\n#endif\n#if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )\nvec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );\n#endif\n#if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )\nvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n#endif\n#endif",
envmap_vertex:"#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )\nvec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;\nworldNormal = normalize( worldNormal );\nvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\nif ( useRefract ) {\nvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n} else {\nvReflect = reflect( cameraToVertex, worldNormal );\n}\n#endif",map_particle_pars_fragment:"#ifdef USE_MAP\nuniform sampler2D map;\n#endif",
map_particle_fragment:"#ifdef USE_MAP\ngl_FragColor = gl_FragColor * texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );\n#endif",map_pars_vertex:"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )\nvarying vec2 vUv;\nuniform vec4 offsetRepeat;\n#endif",map_pars_fragment:"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )\nvarying vec2 vUv;\n#endif\n#ifdef USE_MAP\nuniform sampler2D map;\n#endif",
map_vertex:"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )\nvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n#endif",map_fragment:"#ifdef USE_MAP\n#ifdef GAMMA_INPUT\nvec4 texelColor = texture2D( map, vUv );\ntexelColor.xyz *= texelColor.xyz;\ngl_FragColor = gl_FragColor * texelColor;\n#else\ngl_FragColor = gl_FragColor * texture2D( map, vUv );\n#endif\n#endif",lightmap_pars_fragment:"#ifdef USE_LIGHTMAP\nvarying vec2 vUv2;\nuniform sampler2D lightMap;\n#endif",
lightmap_pars_vertex:"#ifdef USE_LIGHTMAP\nvarying vec2 vUv2;\n#endif",lightmap_fragment:"#ifdef USE_LIGHTMAP\ngl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );\n#endif",lightmap_vertex:"#ifdef USE_LIGHTMAP\nvUv2 = uv2;\n#endif",bumpmap_pars_fragment:"#ifdef USE_BUMPMAP\nuniform sampler2D bumpMap;\nuniform float bumpScale;\nvec2 dHdxy_fwd() {\nvec2 dSTdx = dFdx( vUv );\nvec2 dSTdy = dFdy( vUv );\nfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\nfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\nfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\nreturn vec2( dBx, dBy );\n}\nvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\nvec3 vSigmaX = dFdx( surf_pos );\nvec3 vSigmaY = dFdy( surf_pos );\nvec3 vN = surf_norm;\nvec3 R1 = cross( vSigmaY, vN );\nvec3 R2 = cross( vN, vSigmaX );\nfloat fDet = dot( vSigmaX, R1 );\nvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\nreturn normalize( abs( fDet ) * surf_norm - vGrad );\n}\n#endif",
normalmap_pars_fragment:"#ifdef USE_NORMALMAP\nuniform sampler2D normalMap;\nuniform vec2 normalScale;\nvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\nvec3 q0 = dFdx( eye_pos.xyz );\nvec3 q1 = dFdy( eye_pos.xyz );\nvec2 st0 = dFdx( vUv.st );\nvec2 st1 = dFdy( vUv.st );\nvec3 S = normalize(  q0 * st1.t - q1 * st0.t );\nvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\nvec3 N = normalize( surf_norm );\nvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\nmapN.xy = normalScale * mapN.xy;\nmat3 tsn = mat3( S, T, N );\nreturn normalize( tsn * mapN );\n}\n#endif",
specularmap_pars_fragment:"#ifdef USE_SPECULARMAP\nuniform sampler2D specularMap;\n#endif",specularmap_fragment:"float specularStrength;\n#ifdef USE_SPECULARMAP\nvec4 texelSpecular = texture2D( specularMap, vUv );\nspecularStrength = texelSpecular.r;\n#else\nspecularStrength = 1.0;\n#endif",lights_lambert_pars_vertex:"uniform vec3 ambient;\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_HEMI_LIGHTS > 0\nuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n#endif\n#if MAX_SPOT_LIGHTS > 0\nuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\nuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\nuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\nuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif",
lights_lambert_vertex:"vLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\nvLightBack = vec3( 0.0 );\n#endif\ntransformedNormal = normalize( transformedNormal );\n#if MAX_DIR_LIGHTS > 0\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( transformedNormal, dirVector );\nvec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );\n#ifdef DOUBLE_SIDED\nvec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n#ifdef WRAP_AROUND\nvec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n#endif\n#endif\n#ifdef WRAP_AROUND\nvec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\ndirectionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );\n#ifdef DOUBLE_SIDED\ndirectionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );\n#endif\n#endif\nvLightFront += directionalLightColor[ i ] * directionalLightWeighting;\n#ifdef DOUBLE_SIDED\nvLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;\n#endif\n}\n#endif\n#if MAX_POINT_LIGHTS > 0\nfor( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\nfloat dotProduct = dot( transformedNormal, lVector );\nvec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );\n#ifdef DOUBLE_SIDED\nvec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n#ifdef WRAP_AROUND\nvec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n#endif\n#endif\n#ifdef WRAP_AROUND\nvec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\npointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );\n#ifdef DOUBLE_SIDED\npointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );\n#endif\n#endif\nvLightFront += pointLightColor[ i ] * pointLightWeighting * lDistance;\n#ifdef DOUBLE_SIDED\nvLightBack += pointLightColor[ i ] * pointLightWeightingBack * lDistance;\n#endif\n}\n#endif\n#if MAX_SPOT_LIGHTS > 0\nfor( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );\nif ( spotEffect > spotLightAngleCos[ i ] ) {\nspotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );\nfloat lDistance = 1.0;\nif ( spotLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\nfloat dotProduct = dot( transformedNormal, lVector );\nvec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );\n#ifdef DOUBLE_SIDED\nvec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n#ifdef WRAP_AROUND\nvec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n#endif\n#endif\n#ifdef WRAP_AROUND\nvec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\nspotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );\n#ifdef DOUBLE_SIDED\nspotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );\n#endif\n#endif\nvLightFront += spotLightColor[ i ] * spotLightWeighting * lDistance * spotEffect;\n#ifdef DOUBLE_SIDED\nvLightBack += spotLightColor[ i ] * spotLightWeightingBack * lDistance * spotEffect;\n#endif\n}\n}\n#endif\n#if MAX_HEMI_LIGHTS > 0\nfor( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );\nvec3 lVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( transformedNormal, lVector );\nfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\nfloat hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;\nvLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n#ifdef DOUBLE_SIDED\nvLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );\n#endif\n}\n#endif\nvLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;\n#ifdef DOUBLE_SIDED\nvLightBack = vLightBack * diffuse + ambient * ambientLightColor + emissive;\n#endif",
lights_phong_pars_vertex:"#ifndef PHONG_PER_PIXEL\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#if MAX_SPOT_LIGHTS > 0\nuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\nuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\nvarying vec4 vSpotLight[ MAX_SPOT_LIGHTS ];\n#endif\n#endif\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP )\nvarying vec3 vWorldPosition;\n#endif",
lights_phong_vertex:"#ifndef PHONG_PER_PIXEL\n#if MAX_POINT_LIGHTS > 0\nfor( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nvPointLight[ i ] = vec4( lVector, lDistance );\n}\n#endif\n#if MAX_SPOT_LIGHTS > 0\nfor( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( spotLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );\nvSpotLight[ i ] = vec4( lVector, lDistance );\n}\n#endif\n#endif\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP )\nvWorldPosition = worldPosition.xyz;\n#endif",
lights_phong_pars_fragment:"uniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_HEMI_LIGHTS > 0\nuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n#ifdef PHONG_PER_PIXEL\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n#else\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#endif\n#if MAX_SPOT_LIGHTS > 0\nuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\nuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\nuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n#ifdef PHONG_PER_PIXEL\nuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n#else\nvarying vec4 vSpotLight[ MAX_SPOT_LIGHTS ];\n#endif\n#endif\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP )\nvarying vec3 vWorldPosition;\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif\nvarying vec3 vViewPosition;\nvarying vec3 vNormal;",
lights_phong_fragment:"vec3 normal = normalize( vNormal );\nvec3 viewPosition = normalize( vViewPosition );\n#ifdef DOUBLE_SIDED\nnormal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n#endif\n#ifdef USE_NORMALMAP\nnormal = perturbNormal2Arb( -viewPosition, normal );\n#elif defined( USE_BUMPMAP )\nnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif\n#if MAX_POINT_LIGHTS > 0\nvec3 pointDiffuse  = vec3( 0.0 );\nvec3 pointSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n#ifdef PHONG_PER_PIXEL\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz + vViewPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\n#else\nvec3 lVector = normalize( vPointLight[ i ].xyz );\nfloat lDistance = vPointLight[ i ].w;\n#endif\nfloat dotProduct = dot( normal, lVector );\n#ifdef WRAP_AROUND\nfloat pointDiffuseWeightFull = max( dotProduct, 0.0 );\nfloat pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\nvec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n#else\nfloat pointDiffuseWeight = max( dotProduct, 0.0 );\n#endif\npointDiffuse  += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;\nvec3 pointHalfVector = normalize( lVector + viewPosition );\nfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\nfloat pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( shininess + 2.0001 ) / 8.0;\nvec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVector, pointHalfVector ), 5.0 );\npointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;\n#else\npointSpecular += specular * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance;\n#endif\n}\n#endif\n#if MAX_SPOT_LIGHTS > 0\nvec3 spotDiffuse  = vec3( 0.0 );\nvec3 spotSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n#ifdef PHONG_PER_PIXEL\nvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz + vViewPosition.xyz;\nfloat lDistance = 1.0;\nif ( spotLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\n#else\nvec3 lVector = normalize( vSpotLight[ i ].xyz );\nfloat lDistance = vSpotLight[ i ].w;\n#endif\nfloat spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );\nif ( spotEffect > spotLightAngleCos[ i ] ) {\nspotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );\nfloat dotProduct = dot( normal, lVector );\n#ifdef WRAP_AROUND\nfloat spotDiffuseWeightFull = max( dotProduct, 0.0 );\nfloat spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\nvec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );\n#else\nfloat spotDiffuseWeight = max( dotProduct, 0.0 );\n#endif\nspotDiffuse += diffuse * spotLightColor[ i ] * spotDiffuseWeight * lDistance * spotEffect;\nvec3 spotHalfVector = normalize( lVector + viewPosition );\nfloat spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );\nfloat spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( shininess + 2.0001 ) / 8.0;\nvec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVector, spotHalfVector ), 5.0 );\nspotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;\n#else\nspotSpecular += specular * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect;\n#endif\n}\n}\n#endif\n#if MAX_DIR_LIGHTS > 0\nvec3 dirDiffuse  = vec3( 0.0 );\nvec3 dirSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( normal, dirVector );\n#ifdef WRAP_AROUND\nfloat dirDiffuseWeightFull = max( dotProduct, 0.0 );\nfloat dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\nvec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );\n#else\nfloat dirDiffuseWeight = max( dotProduct, 0.0 );\n#endif\ndirDiffuse  += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;\nvec3 dirHalfVector = normalize( dirVector + viewPosition );\nfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\nfloat dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( shininess + 2.0001 ) / 8.0;\nvec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );\ndirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n#else\ndirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight;\n#endif\n}\n#endif\n#if MAX_HEMI_LIGHTS > 0\nvec3 hemiDiffuse  = vec3( 0.0 );\nvec3 hemiSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );\nvec3 lVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( normal, lVector );\nfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\nvec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\nhemiDiffuse += diffuse * hemiColor;\nvec3 hemiHalfVectorSky = normalize( lVector + viewPosition );\nfloat hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;\nfloat hemiSpecularWeightSky = specularStrength * max( pow( hemiDotNormalHalfSky, shininess ), 0.0 );\nvec3 lVectorGround = -lVector;\nvec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );\nfloat hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;\nfloat hemiSpecularWeightGround = specularStrength * max( pow( hemiDotNormalHalfGround, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat dotProductGround = dot( normal, lVectorGround );\nfloat specularNormalization = ( shininess + 2.0001 ) / 8.0;\nvec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );\nvec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );\nhemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );\n#else\nhemiSpecular += specular * hemiColor * ( hemiSpecularWeightSky + hemiSpecularWeightGround ) * hemiDiffuseWeight;\n#endif\n}\n#endif\nvec3 totalDiffuse = vec3( 0.0 );\nvec3 totalSpecular = vec3( 0.0 );\n#if MAX_DIR_LIGHTS > 0\ntotalDiffuse += dirDiffuse;\ntotalSpecular += dirSpecular;\n#endif\n#if MAX_HEMI_LIGHTS > 0\ntotalDiffuse += hemiDiffuse;\ntotalSpecular += hemiSpecular;\n#endif\n#if MAX_POINT_LIGHTS > 0\ntotalDiffuse += pointDiffuse;\ntotalSpecular += pointSpecular;\n#endif\n#if MAX_SPOT_LIGHTS > 0\ntotalDiffuse += spotDiffuse;\ntotalSpecular += spotSpecular;\n#endif\n#ifdef METAL\ngl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;\n#endif",
color_pars_fragment:"#ifdef USE_COLOR\nvarying vec3 vColor;\n#endif",color_fragment:"#ifdef USE_COLOR\ngl_FragColor = gl_FragColor * vec4( vColor, opacity );\n#endif",color_pars_vertex:"#ifdef USE_COLOR\nvarying vec3 vColor;\n#endif",color_vertex:"#ifdef USE_COLOR\n#ifdef GAMMA_INPUT\nvColor = color * color;\n#else\nvColor = color;\n#endif\n#endif",skinning_pars_vertex:"#ifdef USE_SKINNING\n#ifdef BONE_TEXTURE\nuniform sampler2D boneTexture;\nmat4 getBoneMatrix( const in float i ) {\nfloat j = i * 4.0;\nfloat x = mod( j, N_BONE_PIXEL_X );\nfloat y = floor( j / N_BONE_PIXEL_X );\nconst float dx = 1.0 / N_BONE_PIXEL_X;\nconst float dy = 1.0 / N_BONE_PIXEL_Y;\ny = dy * ( y + 0.5 );\nvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\nvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\nvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\nvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\nmat4 bone = mat4( v1, v2, v3, v4 );\nreturn bone;\n}\n#else\nuniform mat4 boneGlobalMatrices[ MAX_BONES ];\nmat4 getBoneMatrix( const in float i ) {\nmat4 bone = boneGlobalMatrices[ int(i) ];\nreturn bone;\n}\n#endif\n#endif",
skinbase_vertex:"#ifdef USE_SKINNING\nmat4 boneMatX = getBoneMatrix( skinIndex.x );\nmat4 boneMatY = getBoneMatrix( skinIndex.y );\n#endif",skinning_vertex:"#ifdef USE_SKINNING\n#ifdef USE_MORPHTARGETS\nvec4 skinVertex = vec4( morphed, 1.0 );\n#else\nvec4 skinVertex = vec4( position, 1.0 );\n#endif\nvec4 skinned  = boneMatX * skinVertex * skinWeight.x;\nskinned \t  += boneMatY * skinVertex * skinWeight.y;\n#endif",morphtarget_pars_vertex:"#ifdef USE_MORPHTARGETS\n#ifndef USE_MORPHNORMALS\nuniform float morphTargetInfluences[ 8 ];\n#else\nuniform float morphTargetInfluences[ 4 ];\n#endif\n#endif",
morphtarget_vertex:"#ifdef USE_MORPHTARGETS\nvec3 morphed = vec3( 0.0 );\nmorphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\nmorphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\nmorphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\nmorphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n#ifndef USE_MORPHNORMALS\nmorphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\nmorphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\nmorphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\nmorphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n#endif\nmorphed += position;\n#endif",
default_vertex:"vec4 mvPosition;\n#ifdef USE_SKINNING\nmvPosition = modelViewMatrix * skinned;\n#endif\n#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )\nmvPosition = modelViewMatrix * vec4( morphed, 1.0 );\n#endif\n#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )\nmvPosition = modelViewMatrix * vec4( position, 1.0 );\n#endif\ngl_Position = projectionMatrix * mvPosition;",morphnormal_vertex:"#ifdef USE_MORPHNORMALS\nvec3 morphedNormal = vec3( 0.0 );\nmorphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\nmorphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\nmorphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\nmorphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\nmorphedNormal += normal;\n#endif",
skinnormal_vertex:"#ifdef USE_SKINNING\nmat4 skinMatrix = skinWeight.x * boneMatX;\nskinMatrix \t+= skinWeight.y * boneMatY;\n#ifdef USE_MORPHNORMALS\nvec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );\n#else\nvec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );\n#endif\n#endif",defaultnormal_vertex:"vec3 objectNormal;\n#ifdef USE_SKINNING\nobjectNormal = skinnedNormal.xyz;\n#endif\n#if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )\nobjectNormal = morphedNormal;\n#endif\n#if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )\nobjectNormal = normal;\n#endif\n#ifdef FLIP_SIDED\nobjectNormal = -objectNormal;\n#endif\nvec3 transformedNormal = normalMatrix * objectNormal;",
shadowmap_pars_fragment:"#ifdef USE_SHADOWMAP\nuniform sampler2D shadowMap[ MAX_SHADOWS ];\nuniform vec2 shadowMapSize[ MAX_SHADOWS ];\nuniform float shadowDarkness[ MAX_SHADOWS ];\nuniform float shadowBias[ MAX_SHADOWS ];\nvarying vec4 vShadowCoord[ MAX_SHADOWS ];\nfloat unpackDepth( const in vec4 rgba_depth ) {\nconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\nfloat depth = dot( rgba_depth, bit_shift );\nreturn depth;\n}\n#endif",shadowmap_fragment:"#ifdef USE_SHADOWMAP\n#ifdef SHADOWMAP_DEBUG\nvec3 frustumColors[3];\nfrustumColors[0] = vec3( 1.0, 0.5, 0.0 );\nfrustumColors[1] = vec3( 0.0, 1.0, 0.8 );\nfrustumColors[2] = vec3( 0.0, 0.5, 1.0 );\n#endif\n#ifdef SHADOWMAP_CASCADE\nint inFrustumCount = 0;\n#endif\nfloat fDepth;\nvec3 shadowColor = vec3( 1.0 );\nfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\nvec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\nbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\nbool inFrustum = all( inFrustumVec );\n#ifdef SHADOWMAP_CASCADE\ninFrustumCount += int( inFrustum );\nbvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );\n#else\nbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n#endif\nbool frustumTest = all( frustumTestVec );\nif ( frustumTest ) {\nshadowCoord.z += shadowBias[ i ];\n#ifdef SHADOWMAP_SOFT\nfloat shadow = 0.0;\nconst float shadowDelta = 1.0 / 9.0;\nfloat xPixelOffset = 1.0 / shadowMapSize[ i ].x;\nfloat yPixelOffset = 1.0 / shadowMapSize[ i ].y;\nfloat dx0 = -1.25 * xPixelOffset;\nfloat dy0 = -1.25 * yPixelOffset;\nfloat dx1 = 1.25 * xPixelOffset;\nfloat dy1 = 1.25 * yPixelOffset;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nshadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n#else\nvec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\nfloat fDepth = unpackDepth( rgbaDepth );\nif ( fDepth < shadowCoord.z )\nshadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );\n#endif\n}\n#ifdef SHADOWMAP_DEBUG\n#ifdef SHADOWMAP_CASCADE\nif ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];\n#else\nif ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];\n#endif\n#endif\n}\n#ifdef GAMMA_OUTPUT\nshadowColor *= shadowColor;\n#endif\ngl_FragColor.xyz = gl_FragColor.xyz * shadowColor;\n#endif",
shadowmap_pars_vertex:"#ifdef USE_SHADOWMAP\nvarying vec4 vShadowCoord[ MAX_SHADOWS ];\nuniform mat4 shadowMatrix[ MAX_SHADOWS ];\n#endif",shadowmap_vertex:"#ifdef USE_SHADOWMAP\nfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\nvShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n}\n#endif",alphatest_fragment:"#ifdef ALPHATEST\nif ( gl_FragColor.a < ALPHATEST ) discard;\n#endif",linear_to_gamma_fragment:"#ifdef GAMMA_OUTPUT\ngl_FragColor.xyz = sqrt( gl_FragColor.xyz );\n#endif"};
THREE.UniformsUtils={merge:function(a){var b,c,d,e={};for(b=0;b<a.length;b++)for(c in d=this.clone(a[b]),d)e[c]=d[c];return e},clone:function(a){var b,c,d,e={};for(b in a)for(c in e[b]={},a[b])d=a[b][c],e[b][c]=d instanceof THREE.Color||d instanceof THREE.Vector2||d instanceof THREE.Vector3||d instanceof THREE.Vector4||d instanceof THREE.Matrix4||d instanceof THREE.Texture?d.clone():d instanceof Array?d.slice():d;return e}};
THREE.UniformsLib={common:{diffuse:{type:"c",value:new THREE.Color(15658734)},opacity:{type:"f",value:1},map:{type:"t",value:null},offsetRepeat:{type:"v4",value:new THREE.Vector4(0,0,1,1)},lightMap:{type:"t",value:null},specularMap:{type:"t",value:null},envMap:{type:"t",value:null},flipEnvMap:{type:"f",value:-1},useRefract:{type:"i",value:0},reflectivity:{type:"f",value:1},refractionRatio:{type:"f",value:0.98},combine:{type:"i",value:0},morphTargetInfluences:{type:"f",value:0}},bump:{bumpMap:{type:"t",
value:null},bumpScale:{type:"f",value:1}},normalmap:{normalMap:{type:"t",value:null},normalScale:{type:"v2",value:new THREE.Vector2(1,1)}},fog:{fogDensity:{type:"f",value:2.5E-4},fogNear:{type:"f",value:1},fogFar:{type:"f",value:2E3},fogColor:{type:"c",value:new THREE.Color(16777215)}},lights:{ambientLightColor:{type:"fv",value:[]},directionalLightDirection:{type:"fv",value:[]},directionalLightColor:{type:"fv",value:[]},hemisphereLightDirection:{type:"fv",value:[]},hemisphereLightSkyColor:{type:"fv",
value:[]},hemisphereLightGroundColor:{type:"fv",value:[]},pointLightColor:{type:"fv",value:[]},pointLightPosition:{type:"fv",value:[]},pointLightDistance:{type:"fv1",value:[]},spotLightColor:{type:"fv",value:[]},spotLightPosition:{type:"fv",value:[]},spotLightDirection:{type:"fv",value:[]},spotLightDistance:{type:"fv1",value:[]},spotLightAngleCos:{type:"fv1",value:[]},spotLightExponent:{type:"fv1",value:[]}},particle:{psColor:{type:"c",value:new THREE.Color(15658734)},opacity:{type:"f",value:1},size:{type:"f",
value:1},scale:{type:"f",value:1},map:{type:"t",value:null},fogDensity:{type:"f",value:2.5E-4},fogNear:{type:"f",value:1},fogFar:{type:"f",value:2E3},fogColor:{type:"c",value:new THREE.Color(16777215)}},shadowmap:{shadowMap:{type:"tv",value:[]},shadowMapSize:{type:"v2v",value:[]},shadowBias:{type:"fv1",value:[]},shadowDarkness:{type:"fv1",value:[]},shadowMatrix:{type:"m4v",value:[]}}};
THREE.ShaderLib={depth:{uniforms:{mNear:{type:"f",value:1},mFar:{type:"f",value:2E3},opacity:{type:"f",value:1}},vertexShader:"void main() {\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",fragmentShader:"uniform float mNear;\nuniform float mFar;\nuniform float opacity;\nvoid main() {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat color = 1.0 - smoothstep( mNear, mFar, depth );\ngl_FragColor = vec4( vec3( color ), opacity );\n}"},normal:{uniforms:{opacity:{type:"f",
value:1}},vertexShader:"varying vec3 vNormal;\nvoid main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvNormal = normalize( normalMatrix * normal );\ngl_Position = projectionMatrix * mvPosition;\n}",fragmentShader:"uniform float opacity;\nvarying vec3 vNormal;\nvoid main() {\ngl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );\n}"},basic:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.fog,THREE.UniformsLib.shadowmap]),vertexShader:[THREE.ShaderChunk.map_pars_vertex,
THREE.ShaderChunk.lightmap_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {",THREE.ShaderChunk.map_vertex,THREE.ShaderChunk.lightmap_vertex,THREE.ShaderChunk.color_vertex,"#ifdef USE_ENVMAP",THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,THREE.ShaderChunk.defaultnormal_vertex,
"#endif",THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.default_vertex,THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform float opacity;",THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.lightmap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,
THREE.ShaderChunk.specularmap_pars_fragment,"void main() {\ngl_FragColor = vec4( diffuse, opacity );",THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.specularmap_fragment,THREE.ShaderChunk.lightmap_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n")},lambert:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,
THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{ambient:{type:"c",value:new THREE.Color(16777215)},emissive:{type:"c",value:new THREE.Color(0)},wrapRGB:{type:"v3",value:new THREE.Vector3(1,1,1)}}]),vertexShader:["#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\nvarying vec3 vLightBack;\n#endif",THREE.ShaderChunk.map_pars_vertex,THREE.ShaderChunk.lightmap_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.lights_lambert_pars_vertex,THREE.ShaderChunk.color_pars_vertex,
THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {",THREE.ShaderChunk.map_vertex,THREE.ShaderChunk.lightmap_vertex,THREE.ShaderChunk.color_vertex,THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,THREE.ShaderChunk.defaultnormal_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.default_vertex,THREE.ShaderChunk.worldpos_vertex,
THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.lights_lambert_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\nvarying vec3 vLightBack;\n#endif",THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.lightmap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.specularmap_pars_fragment,
"void main() {\ngl_FragColor = vec4( vec3 ( 1.0 ), opacity );",THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.specularmap_fragment,"#ifdef DOUBLE_SIDED\nif ( gl_FrontFacing )\ngl_FragColor.xyz *= vLightFront;\nelse\ngl_FragColor.xyz *= vLightBack;\n#else\ngl_FragColor.xyz *= vLightFront;\n#endif",THREE.ShaderChunk.lightmap_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,
THREE.ShaderChunk.fog_fragment,"}"].join("\n")},phong:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.bump,THREE.UniformsLib.normalmap,THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{ambient:{type:"c",value:new THREE.Color(16777215)},emissive:{type:"c",value:new THREE.Color(0)},specular:{type:"c",value:new THREE.Color(1118481)},shininess:{type:"f",value:30},wrapRGB:{type:"v3",value:new THREE.Vector3(1,1,1)}}]),vertexShader:["#define PHONG\nvarying vec3 vViewPosition;\nvarying vec3 vNormal;",
THREE.ShaderChunk.map_pars_vertex,THREE.ShaderChunk.lightmap_pars_vertex,THREE.ShaderChunk.envmap_pars_vertex,THREE.ShaderChunk.lights_phong_pars_vertex,THREE.ShaderChunk.color_pars_vertex,THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {",THREE.ShaderChunk.map_vertex,THREE.ShaderChunk.lightmap_vertex,THREE.ShaderChunk.color_vertex,THREE.ShaderChunk.morphnormal_vertex,THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,
THREE.ShaderChunk.defaultnormal_vertex,"vNormal = normalize( transformedNormal );",THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,THREE.ShaderChunk.default_vertex,"vViewPosition = -mvPosition.xyz;",THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.envmap_vertex,THREE.ShaderChunk.lights_phong_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform float opacity;\nuniform vec3 ambient;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;",
THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.map_pars_fragment,THREE.ShaderChunk.lightmap_pars_fragment,THREE.ShaderChunk.envmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.lights_phong_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.bumpmap_pars_fragment,THREE.ShaderChunk.normalmap_pars_fragment,THREE.ShaderChunk.specularmap_pars_fragment,"void main() {\ngl_FragColor = vec4( vec3 ( 1.0 ), opacity );",THREE.ShaderChunk.map_fragment,THREE.ShaderChunk.alphatest_fragment,
THREE.ShaderChunk.specularmap_fragment,THREE.ShaderChunk.lights_phong_fragment,THREE.ShaderChunk.lightmap_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.envmap_fragment,THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n")},particle_basic:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.particle,THREE.UniformsLib.shadowmap]),vertexShader:["uniform float size;\nuniform float scale;",THREE.ShaderChunk.color_pars_vertex,
THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {",THREE.ShaderChunk.color_vertex,"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n#ifdef USE_SIZEATTENUATION\ngl_PointSize = size * ( scale / length( mvPosition.xyz ) );\n#else\ngl_PointSize = size;\n#endif\ngl_Position = projectionMatrix * mvPosition;",THREE.ShaderChunk.worldpos_vertex,THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n"),fragmentShader:["uniform vec3 psColor;\nuniform float opacity;",THREE.ShaderChunk.color_pars_fragment,
THREE.ShaderChunk.map_particle_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.shadowmap_pars_fragment,"void main() {\ngl_FragColor = vec4( psColor, opacity );",THREE.ShaderChunk.map_particle_fragment,THREE.ShaderChunk.alphatest_fragment,THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n")},dashed:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.common,THREE.UniformsLib.fog,{scale:{type:"f",value:1},dashSize:{type:"f",
value:1},totalSize:{type:"f",value:2}}]),vertexShader:["uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;",THREE.ShaderChunk.color_pars_vertex,"void main() {",THREE.ShaderChunk.color_vertex,"vLineDistance = scale * lineDistance;\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\ngl_Position = projectionMatrix * mvPosition;\n}"].join("\n"),fragmentShader:["uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;",
THREE.ShaderChunk.color_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,"void main() {\nif ( mod( vLineDistance, totalSize ) > dashSize ) {\ndiscard;\n}\ngl_FragColor = vec4( diffuse, opacity );",THREE.ShaderChunk.color_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n")},depthRGBA:{uniforms:{},vertexShader:[THREE.ShaderChunk.morphtarget_pars_vertex,THREE.ShaderChunk.skinning_pars_vertex,"void main() {",THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.morphtarget_vertex,THREE.ShaderChunk.skinning_vertex,
THREE.ShaderChunk.default_vertex,"}"].join("\n"),fragmentShader:"vec4 pack_depth( const in float depth ) {\nconst vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\nconst vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\nvec4 res = fract( depth * bit_shift );\nres -= res.xxyz * bit_mask;\nreturn res;\n}\nvoid main() {\ngl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );\n}"}};
THREE.WebGLRenderer=function(a){function b(a){if(a.__webglCustomAttributesList)for(var b in a.__webglCustomAttributesList)k.deleteBuffer(a.__webglCustomAttributesList[b].buffer)}function c(a,b){var c=a.vertices.length,d=b.material;if(d.attributes){void 0===a.__webglCustomAttributesList&&(a.__webglCustomAttributesList=[]);for(var e in d.attributes){var f=d.attributes[e];if(!f.__webglInitialized||f.createUniqueBuffers){f.__webglInitialized=!0;var g=1;"v2"===f.type?g=2:"v3"===f.type?g=3:"v4"===f.type?
g=4:"c"===f.type&&(g=3);f.size=g;f.array=new Float32Array(c*g);f.buffer=k.createBuffer();f.buffer.belongsToAttribute=e;f.needsUpdate=!0}a.__webglCustomAttributesList.push(f)}}}function d(a,b){var c=b.geometry,d=a.faces3,h=a.faces4,i=3*d.length+4*h.length,j=1*d.length+2*h.length,h=3*d.length+4*h.length,d=e(b,a),l=g(d),n=f(d),m=d.vertexColors?d.vertexColors:!1;a.__vertexArray=new Float32Array(3*i);n&&(a.__normalArray=new Float32Array(3*i));c.hasTangents&&(a.__tangentArray=new Float32Array(4*i));m&&
(a.__colorArray=new Float32Array(3*i));if(l){if(0<c.faceUvs.length||0<c.faceVertexUvs.length)a.__uvArray=new Float32Array(2*i);if(1<c.faceUvs.length||1<c.faceVertexUvs.length)a.__uv2Array=new Float32Array(2*i)}b.geometry.skinWeights.length&&b.geometry.skinIndices.length&&(a.__skinIndexArray=new Float32Array(4*i),a.__skinWeightArray=new Float32Array(4*i));a.__faceArray=new Uint16Array(3*j);a.__lineArray=new Uint16Array(2*h);if(a.numMorphTargets){a.__morphTargetsArrays=[];c=0;for(l=a.numMorphTargets;c<
l;c++)a.__morphTargetsArrays.push(new Float32Array(3*i))}if(a.numMorphNormals){a.__morphNormalsArrays=[];c=0;for(l=a.numMorphNormals;c<l;c++)a.__morphNormalsArrays.push(new Float32Array(3*i))}a.__webglFaceCount=3*j;a.__webglLineCount=2*h;if(d.attributes){void 0===a.__webglCustomAttributesList&&(a.__webglCustomAttributesList=[]);for(var o in d.attributes){var j=d.attributes[o],c={},p;for(p in j)c[p]=j[p];if(!c.__webglInitialized||c.createUniqueBuffers)c.__webglInitialized=!0,h=1,"v2"===c.type?h=2:
"v3"===c.type?h=3:"v4"===c.type?h=4:"c"===c.type&&(h=3),c.size=h,c.array=new Float32Array(i*h),c.buffer=k.createBuffer(),c.buffer.belongsToAttribute=o,j.needsUpdate=!0,c.__original=j;a.__webglCustomAttributesList.push(c)}}a.__inittedArrays=!0}function e(a,b){return a.material instanceof THREE.MeshFaceMaterial?a.material.materials[b.materialIndex]:a.material}function f(a){return a instanceof THREE.MeshBasicMaterial&&!a.envMap||a instanceof THREE.MeshDepthMaterial?!1:a&&void 0!==a.shading&&a.shading===
THREE.SmoothShading?THREE.SmoothShading:THREE.FlatShading}function g(a){return a.map||a.lightMap||a.bumpMap||a.normalMap||a.specularMap||a instanceof THREE.ShaderMaterial?!0:!1}function h(a){var b,c,d;for(b in a.attributes)d="index"===b?k.ELEMENT_ARRAY_BUFFER:k.ARRAY_BUFFER,c=a.attributes[b],c.buffer=k.createBuffer(),k.bindBuffer(d,c.buffer),k.bufferData(d,c.array,k.STATIC_DRAW)}function i(a,b,c){var d,e,f,g,h=a.vertices;g=h.length;var i=a.colors,j=i.length,l=a.__vertexArray,n=a.__colorArray,m=a.__sortArray,
o=a.verticesNeedUpdate,p=a.colorsNeedUpdate,s=a.__webglCustomAttributesList;if(c.sortParticles){pb.copy(eb);pb.multiplySelf(c.matrixWorld);for(d=0;d<g;d++)e=h[d],bb.copy(e),pb.multiplyVector3(bb),m[d]=[bb.z,d];m.sort(function(a,b){return b[0]-a[0]});for(d=0;d<g;d++)e=h[m[d][1]],f=3*d,l[f]=e.x,l[f+1]=e.y,l[f+2]=e.z;for(d=0;d<j;d++)f=3*d,e=i[m[d][1]],n[f]=e.r,n[f+1]=e.g,n[f+2]=e.b;if(s){i=0;for(j=s.length;i<j;i++)if(h=s[i],void 0===h.boundTo||"vertices"===h.boundTo)if(f=0,e=h.value.length,1===h.size)for(d=
0;d<e;d++)g=m[d][1],h.array[d]=h.value[g];else if(2===h.size)for(d=0;d<e;d++)g=m[d][1],g=h.value[g],h.array[f]=g.x,h.array[f+1]=g.y,f+=2;else if(3===h.size)if("c"===h.type)for(d=0;d<e;d++)g=m[d][1],g=h.value[g],h.array[f]=g.r,h.array[f+1]=g.g,h.array[f+2]=g.b,f+=3;else for(d=0;d<e;d++)g=m[d][1],g=h.value[g],h.array[f]=g.x,h.array[f+1]=g.y,h.array[f+2]=g.z,f+=3;else if(4===h.size)for(d=0;d<e;d++)g=m[d][1],g=h.value[g],h.array[f]=g.x,h.array[f+1]=g.y,h.array[f+2]=g.z,h.array[f+3]=g.w,f+=4}}else{if(o)for(d=
0;d<g;d++)e=h[d],f=3*d,l[f]=e.x,l[f+1]=e.y,l[f+2]=e.z;if(p)for(d=0;d<j;d++)e=i[d],f=3*d,n[f]=e.r,n[f+1]=e.g,n[f+2]=e.b;if(s){i=0;for(j=s.length;i<j;i++)if(h=s[i],h.needsUpdate&&(void 0===h.boundTo||"vertices"===h.boundTo))if(e=h.value.length,f=0,1===h.size)for(d=0;d<e;d++)h.array[d]=h.value[d];else if(2===h.size)for(d=0;d<e;d++)g=h.value[d],h.array[f]=g.x,h.array[f+1]=g.y,f+=2;else if(3===h.size)if("c"===h.type)for(d=0;d<e;d++)g=h.value[d],h.array[f]=g.r,h.array[f+1]=g.g,h.array[f+2]=g.b,f+=3;else for(d=
0;d<e;d++)g=h.value[d],h.array[f]=g.x,h.array[f+1]=g.y,h.array[f+2]=g.z,f+=3;else if(4===h.size)for(d=0;d<e;d++)g=h.value[d],h.array[f]=g.x,h.array[f+1]=g.y,h.array[f+2]=g.z,h.array[f+3]=g.w,f+=4}}if(o||c.sortParticles)k.bindBuffer(k.ARRAY_BUFFER,a.__webglVertexBuffer),k.bufferData(k.ARRAY_BUFFER,l,b);if(p||c.sortParticles)k.bindBuffer(k.ARRAY_BUFFER,a.__webglColorBuffer),k.bufferData(k.ARRAY_BUFFER,n,b);if(s){i=0;for(j=s.length;i<j;i++)if(h=s[i],h.needsUpdate||c.sortParticles)k.bindBuffer(k.ARRAY_BUFFER,
h.buffer),k.bufferData(k.ARRAY_BUFFER,h.array,b)}}function j(a,b,c){var d=a.attributes,e=d.index,f=d.position,g=d.normal,h=d.uv,i=d.color,d=d.tangent;a.elementsNeedUpdate&&void 0!==e&&(k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,e.buffer),k.bufferData(k.ELEMENT_ARRAY_BUFFER,e.array,b));a.verticesNeedUpdate&&void 0!==f&&(k.bindBuffer(k.ARRAY_BUFFER,f.buffer),k.bufferData(k.ARRAY_BUFFER,f.array,b));a.normalsNeedUpdate&&void 0!==g&&(k.bindBuffer(k.ARRAY_BUFFER,g.buffer),k.bufferData(k.ARRAY_BUFFER,g.array,b));
a.uvsNeedUpdate&&void 0!==h&&(k.bindBuffer(k.ARRAY_BUFFER,h.buffer),k.bufferData(k.ARRAY_BUFFER,h.array,b));a.colorsNeedUpdate&&void 0!==i&&(k.bindBuffer(k.ARRAY_BUFFER,i.buffer),k.bufferData(k.ARRAY_BUFFER,i.array,b));a.tangentsNeedUpdate&&void 0!==d&&(k.bindBuffer(k.ARRAY_BUFFER,d.buffer),k.bufferData(k.ARRAY_BUFFER,d.array,b));if(c)for(var j in a.attributes)delete a.attributes[j].array}function l(a,b){return a.z!==b.z?b.z-a.z:b.id-a.id}function m(a,b){return b[1]-a[1]}function n(a,b,c){if(a.length)for(var d=
0,e=a.length;d<e;d++)aa=fa=null,Y=ba=Ja=Na=ob=ib=ma=-1,mb=!0,a[d].render(b,c,lb,ab),aa=fa=null,Y=ba=Ja=Na=ob=ib=ma=-1,mb=!0}function p(a,b,c,d,e,f,g,h){var i,k,j,l;b?(k=a.length-1,l=b=-1):(k=0,b=a.length,l=1);for(var n=k;n!==b;n+=l)if(i=a[n],i.render){k=i.object;j=i.buffer;if(h)i=h;else{i=i[c];if(!i)continue;g&&L.setBlending(i.blending,i.blendEquation,i.blendSrc,i.blendDst);L.setDepthTest(i.depthTest);L.setDepthWrite(i.depthWrite);D(i.polygonOffset,i.polygonOffsetFactor,i.polygonOffsetUnits)}L.setMaterialFaces(i);
j instanceof THREE.BufferGeometry?L.renderBufferDirect(d,e,f,i,j,k):L.renderBuffer(d,e,f,i,j,k)}}function o(a,b,c,d,e,f,g){for(var h,i,k=0,j=a.length;k<j;k++)if(h=a[k],i=h.object,i.visible){if(g)h=g;else{h=h[b];if(!h)continue;f&&L.setBlending(h.blending,h.blendEquation,h.blendSrc,h.blendDst);L.setDepthTest(h.depthTest);L.setDepthWrite(h.depthWrite);D(h.polygonOffset,h.polygonOffsetFactor,h.polygonOffsetUnits)}L.renderImmediateObject(c,d,e,h,i)}}function s(a,b,c){a.push({buffer:b,object:c,opaque:null,
transparent:null})}function t(a){for(var b in a.attributes)if(a.attributes[b].needsUpdate)return!0;return!1}function r(a){for(var b in a.attributes)a.attributes[b].needsUpdate=!1}function z(a,b){for(var c=a.length-1;0<=c;c--)a[c].object===b&&a.splice(c,1)}function w(a,b){for(var c=a.length-1;0<=c;c--)a[c]===b&&a.splice(c,1)}function q(a,b,c,d,e){Aa=0;d.needsUpdate&&(d.program&&L.deallocateMaterial(d),L.initMaterial(d,b,c,e),d.needsUpdate=!1);d.morphTargets&&!e.__webglMorphTargetInfluences&&(e.__webglMorphTargetInfluences=
new Float32Array(L.maxMorphTargets));var f=!1,g=d.program,h=g.uniforms,i=d.uniforms;g!==fa&&(k.useProgram(g),fa=g,f=!0);d.id!==Y&&(Y=d.id,f=!0);if(f||a!==aa)k.uniformMatrix4fv(h.projectionMatrix,!1,a._projectionMatrixArray),a!==aa&&(aa=a);if(d.skinning)if(hc&&e.useVertexTexture){if(null!==h.boneTexture){var j=E();k.uniform1i(h.boneTexture,j);L.setTexture(e.boneTexture,j)}}else null!==h.boneGlobalMatrices&&k.uniformMatrix4fv(h.boneGlobalMatrices,!1,e.boneMatrices);if(f){c&&d.fog&&(i.fogColor.value=
c.color,c instanceof THREE.Fog?(i.fogNear.value=c.near,i.fogFar.value=c.far):c instanceof THREE.FogExp2&&(i.fogDensity.value=c.density));if(d instanceof THREE.MeshPhongMaterial||d instanceof THREE.MeshLambertMaterial||d.lights){if(mb){for(var l=0,n=0,m=0,o,p,s,r=sb,q=r.directional.colors,t=r.directional.positions,w=r.point.colors,z=r.point.positions,A=r.point.distances,B=r.spot.colors,C=r.spot.positions,D=r.spot.distances,G=r.spot.directions,X=r.spot.anglesCos,J=r.spot.exponents,K=r.hemi.skyColors,
Q=r.hemi.groundColors,M=r.hemi.positions,O=0,ca=0,N=0,R=0,ia=0,Z=0,ba=0,ga=0,qa=p=0,c=qa=qa=0,f=b.length;c<f;c++)j=b[c],j.onlyShadow||(o=j.color,s=j.intensity,p=j.distance,j instanceof THREE.AmbientLight?j.visible&&(L.gammaInput?(l+=o.r*o.r,n+=o.g*o.g,m+=o.b*o.b):(l+=o.r,n+=o.g,m+=o.b)):j instanceof THREE.DirectionalLight?(ia+=1,j.visible&&(p=3*O,L.gammaInput?v(q,p,o,s*s):u(q,p,o,s),xa.copy(j.matrixWorld.getPosition()),xa.subSelf(j.target.matrixWorld.getPosition()),xa.normalize(),t[p]=xa.x,t[p+1]=
xa.y,t[p+2]=xa.z,O+=1)):j instanceof THREE.PointLight?(Z+=1,j.visible&&(qa=3*ca,L.gammaInput?v(w,qa,o,s*s):u(w,qa,o,s),s=j.matrixWorld.getPosition(),z[qa]=s.x,z[qa+1]=s.y,z[qa+2]=s.z,A[ca]=p,ca+=1)):j instanceof THREE.SpotLight?(ba+=1,j.visible&&(qa=3*N,L.gammaInput?v(B,qa,o,s*s):u(B,qa,o,s),s=j.matrixWorld.getPosition(),C[qa]=s.x,C[qa+1]=s.y,C[qa+2]=s.z,D[N]=p,xa.copy(s),xa.subSelf(j.target.matrixWorld.getPosition()),xa.normalize(),G[qa]=xa.x,G[qa+1]=xa.y,G[qa+2]=xa.z,X[N]=Math.cos(j.angle),J[N]=
j.exponent,N+=1)):j instanceof THREE.HemisphereLight&&(ga+=1,j.visible&&(o=j.color,p=j.groundColor,qa=3*R,L.gammaInput?(s*=s,v(K,qa,o,s),v(Q,qa,p,s)):(u(K,qa,o,s),u(Q,qa,p,s)),xa.copy(j.matrixWorld.getPosition()),xa.normalize(),M[qa]=xa.x,M[qa+1]=xa.y,M[qa+2]=xa.z,R+=1)));c=3*O;for(f=Math.max(q.length,3*ia);c<f;c++)q[c]=0;c=3*O;for(f=Math.max(t.length,3*ia);c<f;c++)t[c]=0;c=3*ca;for(f=Math.max(w.length,3*Z);c<f;c++)w[c]=0;c=3*ca;for(f=Math.max(z.length,3*Z);c<f;c++)z[c]=0;c=ca;for(f=Math.max(A.length,
Z);c<f;c++)A[c]=0;c=3*N;for(f=Math.max(B.length,3*ba);c<f;c++)B[c]=0;c=3*N;for(f=Math.max(C.length,3*ba);c<f;c++)C[c]=0;c=3*N;for(f=Math.max(G.length,3*ba);c<f;c++)G[c]=0;c=N;for(f=Math.max(X.length,ba);c<f;c++)X[c]=0;c=N;for(f=Math.max(J.length,ba);c<f;c++)J[c]=0;c=N;for(f=Math.max(D.length,ba);c<f;c++)D[c]=0;c=3*R;for(f=Math.max(K.length,3*ga);c<f;c++)K[c]=0;c=3*R;for(f=Math.max(Q.length,3*ga);c<f;c++)Q[c]=0;c=3*R;for(f=Math.max(M.length,3*ga);c<f;c++)M[c]=0;r.directional.length=O;r.point.length=
ca;r.spot.length=N;r.hemi.length=R;r.ambient[0]=l;r.ambient[1]=n;r.ambient[2]=m;mb=!1}c=sb;i.ambientLightColor.value=c.ambient;i.directionalLightColor.value=c.directional.colors;i.directionalLightDirection.value=c.directional.positions;i.pointLightColor.value=c.point.colors;i.pointLightPosition.value=c.point.positions;i.pointLightDistance.value=c.point.distances;i.spotLightColor.value=c.spot.colors;i.spotLightPosition.value=c.spot.positions;i.spotLightDistance.value=c.spot.distances;i.spotLightDirection.value=
c.spot.directions;i.spotLightAngleCos.value=c.spot.anglesCos;i.spotLightExponent.value=c.spot.exponents;i.hemisphereLightSkyColor.value=c.hemi.skyColors;i.hemisphereLightGroundColor.value=c.hemi.groundColors;i.hemisphereLightDirection.value=c.hemi.positions}if(d instanceof THREE.MeshBasicMaterial||d instanceof THREE.MeshLambertMaterial||d instanceof THREE.MeshPhongMaterial){i.opacity.value=d.opacity;L.gammaInput?i.diffuse.value.copyGammaToLinear(d.color):i.diffuse.value=d.color;i.map.value=d.map;
i.lightMap.value=d.lightMap;i.specularMap.value=d.specularMap;d.bumpMap&&(i.bumpMap.value=d.bumpMap,i.bumpScale.value=d.bumpScale);d.normalMap&&(i.normalMap.value=d.normalMap,i.normalScale.value.copy(d.normalScale));var T;d.map?T=d.map:d.specularMap?T=d.specularMap:d.normalMap?T=d.normalMap:d.bumpMap&&(T=d.bumpMap);void 0!==T&&(c=T.offset,T=T.repeat,i.offsetRepeat.value.set(c.x,c.y,T.x,T.y));i.envMap.value=d.envMap;i.flipEnvMap.value=d.envMap instanceof THREE.WebGLRenderTargetCube?1:-1;i.reflectivity.value=
d.reflectivity;i.refractionRatio.value=d.refractionRatio;i.combine.value=d.combine;i.useRefract.value=d.envMap&&d.envMap.mapping instanceof THREE.CubeRefractionMapping}d instanceof THREE.LineBasicMaterial?(i.diffuse.value=d.color,i.opacity.value=d.opacity):d instanceof THREE.LineDashedMaterial?(i.diffuse.value=d.color,i.opacity.value=d.opacity,i.dashSize.value=d.dashSize,i.totalSize.value=d.dashSize+d.gapSize,i.scale.value=d.scale):d instanceof THREE.ParticleBasicMaterial?(i.psColor.value=d.color,
i.opacity.value=d.opacity,i.size.value=d.size,i.scale.value=I.height/2,i.map.value=d.map):d instanceof THREE.MeshPhongMaterial?(i.shininess.value=d.shininess,L.gammaInput?(i.ambient.value.copyGammaToLinear(d.ambient),i.emissive.value.copyGammaToLinear(d.emissive),i.specular.value.copyGammaToLinear(d.specular)):(i.ambient.value=d.ambient,i.emissive.value=d.emissive,i.specular.value=d.specular),d.wrapAround&&i.wrapRGB.value.copy(d.wrapRGB)):d instanceof THREE.MeshLambertMaterial?(L.gammaInput?(i.ambient.value.copyGammaToLinear(d.ambient),
i.emissive.value.copyGammaToLinear(d.emissive)):(i.ambient.value=d.ambient,i.emissive.value=d.emissive),d.wrapAround&&i.wrapRGB.value.copy(d.wrapRGB)):d instanceof THREE.MeshDepthMaterial?(i.mNear.value=a.near,i.mFar.value=a.far,i.opacity.value=d.opacity):d instanceof THREE.MeshNormalMaterial&&(i.opacity.value=d.opacity);if(e.receiveShadow&&!d._shadowPass&&i.shadowMatrix){c=T=0;for(f=b.length;c<f;c++)if(j=b[c],j.castShadow&&(j instanceof THREE.SpotLight||j instanceof THREE.DirectionalLight&&!j.shadowCascade))i.shadowMap.value[T]=
j.shadowMap,i.shadowMapSize.value[T]=j.shadowMapSize,i.shadowMatrix.value[T]=j.shadowMatrix,i.shadowDarkness.value[T]=j.shadowDarkness,i.shadowBias.value[T]=j.shadowBias,T++}b=d.uniformsList;i=0;for(T=b.length;i<T;i++)if(f=g.uniforms[b[i][1]])if(c=b[i][0],l=c.type,j=c.value,"i"===l)k.uniform1i(f,j);else if("f"===l)k.uniform1f(f,j);else if("v2"===l)k.uniform2f(f,j.x,j.y);else if("v3"===l)k.uniform3f(f,j.x,j.y,j.z);else if("v4"===l)k.uniform4f(f,j.x,j.y,j.z,j.w);else if("c"===l)k.uniform3f(f,j.r,j.g,
j.b);else if("iv1"===l)k.uniform1iv(f,j);else if("iv"===l)k.uniform3iv(f,j);else if("fv1"===l)k.uniform1fv(f,j);else if("fv"===l)k.uniform3fv(f,j);else if("v2v"===l){void 0===c._array&&(c._array=new Float32Array(2*j.length));l=0;for(n=j.length;l<n;l++)m=2*l,c._array[m]=j[l].x,c._array[m+1]=j[l].y;k.uniform2fv(f,c._array)}else if("v3v"===l){void 0===c._array&&(c._array=new Float32Array(3*j.length));l=0;for(n=j.length;l<n;l++)m=3*l,c._array[m]=j[l].x,c._array[m+1]=j[l].y,c._array[m+2]=j[l].z;k.uniform3fv(f,
c._array)}else if("v4v"===l){void 0===c._array&&(c._array=new Float32Array(4*j.length));l=0;for(n=j.length;l<n;l++)m=4*l,c._array[m]=j[l].x,c._array[m+1]=j[l].y,c._array[m+2]=j[l].z,c._array[m+3]=j[l].w;k.uniform4fv(f,c._array)}else if("m4"===l)void 0===c._array&&(c._array=new Float32Array(16)),j.flattenToArray(c._array),k.uniformMatrix4fv(f,!1,c._array);else if("m4v"===l){void 0===c._array&&(c._array=new Float32Array(16*j.length));l=0;for(n=j.length;l<n;l++)j[l].flattenToArrayOffset(c._array,16*
l);k.uniformMatrix4fv(f,!1,c._array)}else if("t"===l){if(m=j,j=E(),k.uniform1i(f,j),m)if(m.image instanceof Array&&6===m.image.length){if(c=m,f=j,6===c.image.length)if(c.needsUpdate){c.image.__webglTextureCube||(c.image.__webglTextureCube=k.createTexture());k.activeTexture(k.TEXTURE0+f);k.bindTexture(k.TEXTURE_CUBE_MAP,c.image.__webglTextureCube);k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,c.flipY);f=c instanceof THREE.CompressedTexture;j=[];for(l=0;6>l;l++)L.autoScaleCubemaps&&!f?(n=j,m=l,r=c.image[l],t=
Qc,r.width<=t&&r.height<=t||(w=Math.max(r.width,r.height),q=Math.floor(r.width*t/w),t=Math.floor(r.height*t/w),w=document.createElement("canvas"),w.width=q,w.height=t,w.getContext("2d").drawImage(r,0,0,r.width,r.height,0,0,q,t),r=w),n[m]=r):j[l]=c.image[l];l=j[0];n=0===(l.width&l.width-1)&&0===(l.height&l.height-1);m=H(c.format);r=H(c.type);P(k.TEXTURE_CUBE_MAP,c,n);for(l=0;6>l;l++)if(f){t=j[l].mipmaps;w=0;for(z=t.length;w<z;w++)q=t[w],k.compressedTexImage2D(k.TEXTURE_CUBE_MAP_POSITIVE_X+l,w,m,q.width,
q.height,0,q.data)}else k.texImage2D(k.TEXTURE_CUBE_MAP_POSITIVE_X+l,0,m,m,r,j[l]);c.generateMipmaps&&n&&k.generateMipmap(k.TEXTURE_CUBE_MAP);c.needsUpdate=!1;if(c.onUpdate)c.onUpdate()}else k.activeTexture(k.TEXTURE0+f),k.bindTexture(k.TEXTURE_CUBE_MAP,c.image.__webglTextureCube)}else m instanceof THREE.WebGLRenderTargetCube?(c=m,k.activeTexture(k.TEXTURE0+j),k.bindTexture(k.TEXTURE_CUBE_MAP,c.__webglTexture)):L.setTexture(m,j)}else if("tv"===l){void 0===c._array&&(c._array=[]);l=0;for(n=c.value.length;l<
n;l++)c._array[l]=E();k.uniform1iv(f,c._array);l=0;for(n=c.value.length;l<n;l++)m=c.value[l],j=c._array[l],m&&L.setTexture(m,j)}if((d instanceof THREE.ShaderMaterial||d instanceof THREE.MeshPhongMaterial||d.envMap)&&null!==h.cameraPosition)b=a.matrixWorld.getPosition(),k.uniform3f(h.cameraPosition,b.x,b.y,b.z);(d instanceof THREE.MeshPhongMaterial||d instanceof THREE.MeshLambertMaterial||d instanceof THREE.ShaderMaterial||d.skinning)&&null!==h.viewMatrix&&k.uniformMatrix4fv(h.viewMatrix,!1,a._viewMatrixArray)}k.uniformMatrix4fv(h.modelViewMatrix,
!1,e._modelViewMatrix.elements);h.normalMatrix&&k.uniformMatrix3fv(h.normalMatrix,!1,e._normalMatrix.elements);null!==h.modelMatrix&&k.uniformMatrix4fv(h.modelMatrix,!1,e.matrixWorld.elements);return g}function E(){var a=Aa;a>=xc&&console.warn("Trying to use "+a+" texture units while this GPU supports only "+xc);Aa+=1;return a}function A(a,b){a._modelViewMatrix.multiply(b.matrixWorldInverse,a.matrixWorld);a._normalMatrix.getInverse(a._modelViewMatrix);a._normalMatrix.transpose()}function v(a,b,c,
d){a[b]=c.r*c.r*d;a[b+1]=c.g*c.g*d;a[b+2]=c.b*c.b*d}function u(a,b,c,d){a[b]=c.r*d;a[b+1]=c.g*d;a[b+2]=c.b*d}function D(a,b,c){jb!==a&&(a?k.enable(k.POLYGON_OFFSET_FILL):k.disable(k.POLYGON_OFFSET_FILL),jb=a);if(a&&(Bb!==b||Cb!==c))k.polygonOffset(b,c),Bb=b,Cb=c}function C(a){for(var a=a.split("\n"),b=0,c=a.length;b<c;b++)a[b]=b+1+": "+a[b];return a.join("\n")}function G(a,b){var c;"fragment"===a?c=k.createShader(k.FRAGMENT_SHADER):"vertex"===a&&(c=k.createShader(k.VERTEX_SHADER));k.shaderSource(c,
b);k.compileShader(c);return!k.getShaderParameter(c,k.COMPILE_STATUS)?(console.error(k.getShaderInfoLog(c)),console.error(C(b)),null):c}function P(a,b,c){c?(k.texParameteri(a,k.TEXTURE_WRAP_S,H(b.wrapS)),k.texParameteri(a,k.TEXTURE_WRAP_T,H(b.wrapT)),k.texParameteri(a,k.TEXTURE_MAG_FILTER,H(b.magFilter)),k.texParameteri(a,k.TEXTURE_MIN_FILTER,H(b.minFilter))):(k.texParameteri(a,k.TEXTURE_WRAP_S,k.CLAMP_TO_EDGE),k.texParameteri(a,k.TEXTURE_WRAP_T,k.CLAMP_TO_EDGE),k.texParameteri(a,k.TEXTURE_MAG_FILTER,
K(b.magFilter)),k.texParameteri(a,k.TEXTURE_MIN_FILTER,K(b.minFilter)));if(zb&&b.type!==THREE.FloatType&&(1<b.anisotropy||b.__oldAnisotropy))k.texParameterf(a,zb.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,oc)),b.__oldAnisotropy=b.anisotropy}function B(a,b){k.bindRenderbuffer(k.RENDERBUFFER,a);b.depthBuffer&&!b.stencilBuffer?(k.renderbufferStorage(k.RENDERBUFFER,k.DEPTH_COMPONENT16,b.width,b.height),k.framebufferRenderbuffer(k.FRAMEBUFFER,k.DEPTH_ATTACHMENT,k.RENDERBUFFER,a)):b.depthBuffer&&
b.stencilBuffer?(k.renderbufferStorage(k.RENDERBUFFER,k.DEPTH_STENCIL,b.width,b.height),k.framebufferRenderbuffer(k.FRAMEBUFFER,k.DEPTH_STENCIL_ATTACHMENT,k.RENDERBUFFER,a)):k.renderbufferStorage(k.RENDERBUFFER,k.RGBA4,b.width,b.height)}function K(a){return a===THREE.NearestFilter||a===THREE.NearestMipMapNearestFilter||a===THREE.NearestMipMapLinearFilter?k.NEAREST:k.LINEAR}function H(a){if(a===THREE.RepeatWrapping)return k.REPEAT;if(a===THREE.ClampToEdgeWrapping)return k.CLAMP_TO_EDGE;if(a===THREE.MirroredRepeatWrapping)return k.MIRRORED_REPEAT;
if(a===THREE.NearestFilter)return k.NEAREST;if(a===THREE.NearestMipMapNearestFilter)return k.NEAREST_MIPMAP_NEAREST;if(a===THREE.NearestMipMapLinearFilter)return k.NEAREST_MIPMAP_LINEAR;if(a===THREE.LinearFilter)return k.LINEAR;if(a===THREE.LinearMipMapNearestFilter)return k.LINEAR_MIPMAP_NEAREST;if(a===THREE.LinearMipMapLinearFilter)return k.LINEAR_MIPMAP_LINEAR;if(a===THREE.UnsignedByteType)return k.UNSIGNED_BYTE;if(a===THREE.UnsignedShort4444Type)return k.UNSIGNED_SHORT_4_4_4_4;if(a===THREE.UnsignedShort5551Type)return k.UNSIGNED_SHORT_5_5_5_1;
if(a===THREE.UnsignedShort565Type)return k.UNSIGNED_SHORT_5_6_5;if(a===THREE.ByteType)return k.BYTE;if(a===THREE.ShortType)return k.SHORT;if(a===THREE.UnsignedShortType)return k.UNSIGNED_SHORT;if(a===THREE.IntType)return k.INT;if(a===THREE.UnsignedIntType)return k.UNSIGNED_INT;if(a===THREE.FloatType)return k.FLOAT;if(a===THREE.AlphaFormat)return k.ALPHA;if(a===THREE.RGBFormat)return k.RGB;if(a===THREE.RGBAFormat)return k.RGBA;if(a===THREE.LuminanceFormat)return k.LUMINANCE;if(a===THREE.LuminanceAlphaFormat)return k.LUMINANCE_ALPHA;
if(a===THREE.AddEquation)return k.FUNC_ADD;if(a===THREE.SubtractEquation)return k.FUNC_SUBTRACT;if(a===THREE.ReverseSubtractEquation)return k.FUNC_REVERSE_SUBTRACT;if(a===THREE.ZeroFactor)return k.ZERO;if(a===THREE.OneFactor)return k.ONE;if(a===THREE.SrcColorFactor)return k.SRC_COLOR;if(a===THREE.OneMinusSrcColorFactor)return k.ONE_MINUS_SRC_COLOR;if(a===THREE.SrcAlphaFactor)return k.SRC_ALPHA;if(a===THREE.OneMinusSrcAlphaFactor)return k.ONE_MINUS_SRC_ALPHA;if(a===THREE.DstAlphaFactor)return k.DST_ALPHA;
if(a===THREE.OneMinusDstAlphaFactor)return k.ONE_MINUS_DST_ALPHA;if(a===THREE.DstColorFactor)return k.DST_COLOR;if(a===THREE.OneMinusDstColorFactor)return k.ONE_MINUS_DST_COLOR;if(a===THREE.SrcAlphaSaturateFactor)return k.SRC_ALPHA_SATURATE;if(void 0!==qb){if(a===THREE.RGB_S3TC_DXT1_Format)return qb.COMPRESSED_RGB_S3TC_DXT1_EXT;if(a===THREE.RGBA_S3TC_DXT1_Format)return qb.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(a===THREE.RGBA_S3TC_DXT3_Format)return qb.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(a===THREE.RGBA_S3TC_DXT5_Format)return qb.COMPRESSED_RGBA_S3TC_DXT5_EXT}return 0}
console.log("THREE.WebGLRenderer",THREE.REVISION);var a=a||{},I=void 0!==a.canvas?a.canvas:document.createElement("canvas"),N=void 0!==a.precision?a.precision:"highp",O=void 0!==a.alpha?a.alpha:!0,R=void 0!==a.premultipliedAlpha?a.premultipliedAlpha:!0,ga=void 0!==a.antialias?a.antialias:!1,M=void 0!==a.stencil?a.stencil:!0,J=void 0!==a.preserveDrawingBuffer?a.preserveDrawingBuffer:!1,Q=void 0!==a.clearColor?new THREE.Color(a.clearColor):new THREE.Color(0),Z=void 0!==a.clearAlpha?a.clearAlpha:0;this.domElement=
I;this.context=null;this.autoUpdateScene=this.autoUpdateObjects=this.sortObjects=this.autoClearStencil=this.autoClearDepth=this.autoClearColor=this.autoClear=!0;this.shadowMapEnabled=this.physicallyBasedShading=this.gammaOutput=this.gammaInput=!1;this.shadowMapCullFrontFaces=this.shadowMapSoft=this.shadowMapAutoUpdate=!0;this.shadowMapCascade=this.shadowMapDebug=!1;this.maxMorphTargets=8;this.maxMorphNormals=4;this.autoScaleCubemaps=!0;this.renderPluginsPre=[];this.renderPluginsPost=[];this.info=
{memory:{programs:0,geometries:0,textures:0},render:{calls:0,vertices:0,faces:0,points:0}};var L=this,oa=[],X=0,fa=null,ca=null,Y=-1,ba=null,aa=null,ia=0,Aa=0,Na=-1,Ja=-1,ma=-1,sa=-1,Ea=-1,rb=-1,ib=-1,ob=-1,jb=null,Bb=null,Cb=null,Wa=null,Sa=0,Ka=0,kb=0,Oa=0,lb=0,ab=0,va=new THREE.Frustum,eb=new THREE.Matrix4,pb=new THREE.Matrix4,bb=new THREE.Vector4,xa=new THREE.Vector3,mb=!0,sb={ambient:[0,0,0],directional:{length:0,colors:[],positions:[]},point:{length:0,colors:[],positions:[],distances:[]},spot:{length:0,
colors:[],positions:[],distances:[],directions:[],anglesCos:[],exponents:[]},hemi:{length:0,skyColors:[],groundColors:[],positions:[]}},k,zb,qb;try{if(!(k=I.getContext("experimental-webgl",{alpha:O,premultipliedAlpha:R,antialias:ga,stencil:M,preserveDrawingBuffer:J})))throw"Error creating WebGL context.";}catch(Pc){console.error(Pc)}a=k.getExtension("OES_texture_float");O=k.getExtension("OES_standard_derivatives");zb=k.getExtension("EXT_texture_filter_anisotropic")||k.getExtension("MOZ_EXT_texture_filter_anisotropic")||
k.getExtension("WEBKIT_EXT_texture_filter_anisotropic");qb=k.getExtension("WEBGL_compressed_texture_s3tc")||k.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||k.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");a||console.log("THREE.WebGLRenderer: Float textures not supported.");O||console.log("THREE.WebGLRenderer: Standard derivatives not supported.");zb||console.log("THREE.WebGLRenderer: Anisotropic texture filtering not supported.");qb||console.log("THREE.WebGLRenderer: S3TC compressed textures not supported.");
k.clearColor(0,0,0,1);k.clearDepth(1);k.clearStencil(0);k.enable(k.DEPTH_TEST);k.depthFunc(k.LEQUAL);k.frontFace(k.CCW);k.cullFace(k.BACK);k.enable(k.CULL_FACE);k.enable(k.BLEND);k.blendEquation(k.FUNC_ADD);k.blendFunc(k.SRC_ALPHA,k.ONE_MINUS_SRC_ALPHA);k.clearColor(Q.r,Q.g,Q.b,Z);this.context=k;var xc=k.getParameter(k.MAX_TEXTURE_IMAGE_UNITS),O=k.getParameter(k.MAX_VERTEX_TEXTURE_IMAGE_UNITS);k.getParameter(k.MAX_TEXTURE_SIZE);var Qc=k.getParameter(k.MAX_CUBE_MAP_TEXTURE_SIZE),oc=zb?k.getParameter(zb.MAX_TEXTURE_MAX_ANISOTROPY_EXT):
0,gc=0<O,hc=gc&&a;qb&&k.getParameter(k.COMPRESSED_TEXTURE_FORMATS);this.getContext=function(){return k};this.supportsVertexTextures=function(){return gc};this.getMaxAnisotropy=function(){return oc};this.setSize=function(a,b){I.width=a;I.height=b;this.setViewport(0,0,I.width,I.height)};this.setViewport=function(a,b,c,d){Sa=void 0!==a?a:0;Ka=void 0!==b?b:0;kb=void 0!==c?c:I.width;Oa=void 0!==d?d:I.height;k.viewport(Sa,Ka,kb,Oa)};this.setScissor=function(a,b,c,d){k.scissor(a,b,c,d)};this.enableScissorTest=
function(a){a?k.enable(k.SCISSOR_TEST):k.disable(k.SCISSOR_TEST)};this.setClearColorHex=function(a,b){Q.setHex(a);Z=b;k.clearColor(Q.r,Q.g,Q.b,Z)};this.setClearColor=function(a,b){Q.copy(a);Z=b;k.clearColor(Q.r,Q.g,Q.b,Z)};this.getClearColor=function(){return Q};this.getClearAlpha=function(){return Z};this.clear=function(a,b,c){var d=0;if(void 0===a||a)d|=k.COLOR_BUFFER_BIT;if(void 0===b||b)d|=k.DEPTH_BUFFER_BIT;if(void 0===c||c)d|=k.STENCIL_BUFFER_BIT;k.clear(d)};this.clearTarget=function(a,b,c,
d){this.setRenderTarget(a);this.clear(b,c,d)};this.addPostPlugin=function(a){a.init(this);this.renderPluginsPost.push(a)};this.addPrePlugin=function(a){a.init(this);this.renderPluginsPre.push(a)};this.deallocateObject=function(a){if(a.__webglInit)if(a.__webglInit=!1,delete a._modelViewMatrix,delete a._normalMatrix,delete a._normalMatrixArray,delete a._modelViewMatrixArray,delete a._modelMatrixArray,a instanceof THREE.Mesh)for(var c in a.geometry.geometryGroups){var d=a.geometry.geometryGroups[c];
k.deleteBuffer(d.__webglVertexBuffer);k.deleteBuffer(d.__webglNormalBuffer);k.deleteBuffer(d.__webglTangentBuffer);k.deleteBuffer(d.__webglColorBuffer);k.deleteBuffer(d.__webglUVBuffer);k.deleteBuffer(d.__webglUV2Buffer);k.deleteBuffer(d.__webglSkinIndicesBuffer);k.deleteBuffer(d.__webglSkinWeightsBuffer);k.deleteBuffer(d.__webglFaceBuffer);k.deleteBuffer(d.__webglLineBuffer);var e=void 0,f=void 0;if(d.numMorphTargets){e=0;for(f=d.numMorphTargets;e<f;e++)k.deleteBuffer(d.__webglMorphTargetsBuffers[e])}if(d.numMorphNormals){e=
0;for(f=d.numMorphNormals;e<f;e++)k.deleteBuffer(d.__webglMorphNormalsBuffers[e])}b(d);L.info.memory.geometries--}else a instanceof THREE.Ribbon?(a=a.geometry,k.deleteBuffer(a.__webglVertexBuffer),k.deleteBuffer(a.__webglColorBuffer),k.deleteBuffer(a.__webglNormalBuffer),b(a),L.info.memory.geometries--):a instanceof THREE.Line?(a=a.geometry,k.deleteBuffer(a.__webglVertexBuffer),k.deleteBuffer(a.__webglColorBuffer),k.deleteBuffer(a.__webglLineDistanceBuffer),b(a),L.info.memory.geometries--):a instanceof
THREE.ParticleSystem&&(a=a.geometry,k.deleteBuffer(a.__webglVertexBuffer),k.deleteBuffer(a.__webglColorBuffer),b(a),L.info.memory.geometries--)};this.deallocateTexture=function(a){a.__webglInit&&(a.__webglInit=!1,k.deleteTexture(a.__webglTexture),L.info.memory.textures--)};this.deallocateRenderTarget=function(a){if(a&&a.__webglTexture)if(k.deleteTexture(a.__webglTexture),a instanceof THREE.WebGLRenderTargetCube)for(var b=0;6>b;b++)k.deleteFramebuffer(a.__webglFramebuffer[b]),k.deleteRenderbuffer(a.__webglRenderbuffer[b]);
else k.deleteFramebuffer(a.__webglFramebuffer),k.deleteRenderbuffer(a.__webglRenderbuffer)};this.deallocateMaterial=function(a){var b=a.program;if(b){a.program=void 0;var c,d,e=!1,a=0;for(c=oa.length;a<c;a++)if(d=oa[a],d.program===b){d.usedTimes--;0===d.usedTimes&&(e=!0);break}if(e){e=[];a=0;for(c=oa.length;a<c;a++)d=oa[a],d.program!==b&&e.push(d);oa=e;k.deleteProgram(b);L.info.memory.programs--}}};this.updateShadowMap=function(a,b){fa=null;Y=ba=ob=ib=ma=-1;mb=!0;Ja=Na=-1;this.shadowMapPlugin.update(a,
b)};this.renderBufferImmediate=function(a,b,c){a.hasPositions&&!a.__webglVertexBuffer&&(a.__webglVertexBuffer=k.createBuffer());a.hasNormals&&!a.__webglNormalBuffer&&(a.__webglNormalBuffer=k.createBuffer());a.hasUvs&&!a.__webglUvBuffer&&(a.__webglUvBuffer=k.createBuffer());a.hasColors&&!a.__webglColorBuffer&&(a.__webglColorBuffer=k.createBuffer());a.hasPositions&&(k.bindBuffer(k.ARRAY_BUFFER,a.__webglVertexBuffer),k.bufferData(k.ARRAY_BUFFER,a.positionArray,k.DYNAMIC_DRAW),k.enableVertexAttribArray(b.attributes.position),
k.vertexAttribPointer(b.attributes.position,3,k.FLOAT,!1,0,0));if(a.hasNormals){k.bindBuffer(k.ARRAY_BUFFER,a.__webglNormalBuffer);if(c.shading===THREE.FlatShading){var d,e,f,g,h,i,j,l,n,m,o,p=3*a.count;for(o=0;o<p;o+=9)m=a.normalArray,d=m[o],e=m[o+1],f=m[o+2],g=m[o+3],i=m[o+4],l=m[o+5],h=m[o+6],j=m[o+7],n=m[o+8],d=(d+g+h)/3,e=(e+i+j)/3,f=(f+l+n)/3,m[o]=d,m[o+1]=e,m[o+2]=f,m[o+3]=d,m[o+4]=e,m[o+5]=f,m[o+6]=d,m[o+7]=e,m[o+8]=f}k.bufferData(k.ARRAY_BUFFER,a.normalArray,k.DYNAMIC_DRAW);k.enableVertexAttribArray(b.attributes.normal);
k.vertexAttribPointer(b.attributes.normal,3,k.FLOAT,!1,0,0)}a.hasUvs&&c.map&&(k.bindBuffer(k.ARRAY_BUFFER,a.__webglUvBuffer),k.bufferData(k.ARRAY_BUFFER,a.uvArray,k.DYNAMIC_DRAW),k.enableVertexAttribArray(b.attributes.uv),k.vertexAttribPointer(b.attributes.uv,2,k.FLOAT,!1,0,0));a.hasColors&&c.vertexColors!==THREE.NoColors&&(k.bindBuffer(k.ARRAY_BUFFER,a.__webglColorBuffer),k.bufferData(k.ARRAY_BUFFER,a.colorArray,k.DYNAMIC_DRAW),k.enableVertexAttribArray(b.attributes.color),k.vertexAttribPointer(b.attributes.color,
3,k.FLOAT,!1,0,0));k.drawArrays(k.TRIANGLES,0,a.count);a.count=0};this.renderBufferDirect=function(a,b,c,d,e,f){if(!1!==d.visible)if(c=q(a,b,c,d,f),a=c.attributes,b=!1,d=16777215*e.id+2*c.id+(d.wireframe?1:0),d!==ba&&(ba=d,b=!0),f instanceof THREE.Mesh){f=e.offsets;1<f.length&&(b=!0);d=0;for(c=f.length;d<c;++d){var g=f[d].index;if(b){var h=e.attributes.position,i=h.itemSize;k.bindBuffer(k.ARRAY_BUFFER,h.buffer);k.vertexAttribPointer(a.position,i,k.FLOAT,!1,0,4*g*i);h=e.attributes.normal;0<=a.normal&&
h&&(i=h.itemSize,k.bindBuffer(k.ARRAY_BUFFER,h.buffer),k.vertexAttribPointer(a.normal,i,k.FLOAT,!1,0,4*g*i));h=e.attributes.uv;0<=a.uv&&h&&(h.buffer?(i=h.itemSize,k.bindBuffer(k.ARRAY_BUFFER,h.buffer),k.vertexAttribPointer(a.uv,i,k.FLOAT,!1,0,4*g*i),k.enableVertexAttribArray(a.uv)):k.disableVertexAttribArray(a.uv));i=e.attributes.color;if(0<=a.color&&i){var j=i.itemSize;k.bindBuffer(k.ARRAY_BUFFER,i.buffer);k.vertexAttribPointer(a.color,j,k.FLOAT,!1,0,4*g*j)}h=e.attributes.tangent;0<=a.tangent&&h&&
(i=h.itemSize,k.bindBuffer(k.ARRAY_BUFFER,h.buffer),k.vertexAttribPointer(a.tangent,i,k.FLOAT,!1,0,4*g*i));k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,e.attributes.index.buffer)}k.drawElements(k.TRIANGLES,f[d].count,k.UNSIGNED_SHORT,2*f[d].start);L.info.render.calls++;L.info.render.vertices+=f[d].count;L.info.render.faces+=f[d].count/3}}else f instanceof THREE.ParticleSystem&&b&&(h=e.attributes.position,i=h.itemSize,k.bindBuffer(k.ARRAY_BUFFER,h.buffer),k.vertexAttribPointer(a.position,i,k.FLOAT,!1,0,0),
i=e.attributes.color,0<=a.color&&i&&(j=i.itemSize,k.bindBuffer(k.ARRAY_BUFFER,i.buffer),k.vertexAttribPointer(a.color,j,k.FLOAT,!1,0,0)),k.drawArrays(k.POINTS,0,h.numItems/3),L.info.render.calls++,L.info.render.points+=h.numItems/3)};this.renderBuffer=function(a,b,c,d,e,f){if(!1!==d.visible){var g,h,c=q(a,b,c,d,f),b=c.attributes,a=!1,c=16777215*e.id+2*c.id+(d.wireframe?1:0);c!==ba&&(ba=c,a=!0);if(!d.morphTargets&&0<=b.position)a&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglVertexBuffer),k.vertexAttribPointer(b.position,
3,k.FLOAT,!1,0,0));else if(f.morphTargetBase){c=d.program.attributes;-1!==f.morphTargetBase?(k.bindBuffer(k.ARRAY_BUFFER,e.__webglMorphTargetsBuffers[f.morphTargetBase]),k.vertexAttribPointer(c.position,3,k.FLOAT,!1,0,0)):0<=c.position&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglVertexBuffer),k.vertexAttribPointer(c.position,3,k.FLOAT,!1,0,0));if(f.morphTargetForcedOrder.length){var i=0;h=f.morphTargetForcedOrder;for(g=f.morphTargetInfluences;i<d.numSupportedMorphTargets&&i<h.length;)k.bindBuffer(k.ARRAY_BUFFER,
e.__webglMorphTargetsBuffers[h[i]]),k.vertexAttribPointer(c["morphTarget"+i],3,k.FLOAT,!1,0,0),d.morphNormals&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglMorphNormalsBuffers[h[i]]),k.vertexAttribPointer(c["morphNormal"+i],3,k.FLOAT,!1,0,0)),f.__webglMorphTargetInfluences[i]=g[h[i]],i++}else{h=[];g=f.morphTargetInfluences;var j,l=g.length;for(j=0;j<l;j++)i=g[j],0<i&&h.push([j,i]);h.length>d.numSupportedMorphTargets?(h.sort(m),h.length=d.numSupportedMorphTargets):h.length>d.numSupportedMorphNormals?h.sort(m):
0===h.length&&h.push([0,0]);for(i=0;i<d.numSupportedMorphTargets;)h[i]?(j=h[i][0],k.bindBuffer(k.ARRAY_BUFFER,e.__webglMorphTargetsBuffers[j]),k.vertexAttribPointer(c["morphTarget"+i],3,k.FLOAT,!1,0,0),d.morphNormals&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglMorphNormalsBuffers[j]),k.vertexAttribPointer(c["morphNormal"+i],3,k.FLOAT,!1,0,0)),f.__webglMorphTargetInfluences[i]=g[j]):(k.vertexAttribPointer(c["morphTarget"+i],3,k.FLOAT,!1,0,0),d.morphNormals&&k.vertexAttribPointer(c["morphNormal"+i],3,k.FLOAT,
!1,0,0),f.__webglMorphTargetInfluences[i]=0),i++}null!==d.program.uniforms.morphTargetInfluences&&k.uniform1fv(d.program.uniforms.morphTargetInfluences,f.__webglMorphTargetInfluences)}if(a){if(e.__webglCustomAttributesList){g=0;for(h=e.__webglCustomAttributesList.length;g<h;g++)c=e.__webglCustomAttributesList[g],0<=b[c.buffer.belongsToAttribute]&&(k.bindBuffer(k.ARRAY_BUFFER,c.buffer),k.vertexAttribPointer(b[c.buffer.belongsToAttribute],c.size,k.FLOAT,!1,0,0))}0<=b.color&&(k.bindBuffer(k.ARRAY_BUFFER,
e.__webglColorBuffer),k.vertexAttribPointer(b.color,3,k.FLOAT,!1,0,0));0<=b.normal&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglNormalBuffer),k.vertexAttribPointer(b.normal,3,k.FLOAT,!1,0,0));0<=b.tangent&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglTangentBuffer),k.vertexAttribPointer(b.tangent,4,k.FLOAT,!1,0,0));0<=b.uv&&(e.__webglUVBuffer?(k.bindBuffer(k.ARRAY_BUFFER,e.__webglUVBuffer),k.vertexAttribPointer(b.uv,2,k.FLOAT,!1,0,0),k.enableVertexAttribArray(b.uv)):k.disableVertexAttribArray(b.uv));0<=b.uv2&&
(e.__webglUV2Buffer?(k.bindBuffer(k.ARRAY_BUFFER,e.__webglUV2Buffer),k.vertexAttribPointer(b.uv2,2,k.FLOAT,!1,0,0),k.enableVertexAttribArray(b.uv2)):k.disableVertexAttribArray(b.uv2));d.skinning&&(0<=b.skinIndex&&0<=b.skinWeight)&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglSkinIndicesBuffer),k.vertexAttribPointer(b.skinIndex,4,k.FLOAT,!1,0,0),k.bindBuffer(k.ARRAY_BUFFER,e.__webglSkinWeightsBuffer),k.vertexAttribPointer(b.skinWeight,4,k.FLOAT,!1,0,0));0<=b.lineDistance&&(k.bindBuffer(k.ARRAY_BUFFER,e.__webglLineDistanceBuffer),
k.vertexAttribPointer(b.lineDistance,1,k.FLOAT,!1,0,0))}f instanceof THREE.Mesh?(d.wireframe?(d=d.wireframeLinewidth,d!==Wa&&(k.lineWidth(d),Wa=d),a&&k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,e.__webglLineBuffer),k.drawElements(k.LINES,e.__webglLineCount,k.UNSIGNED_SHORT,0)):(a&&k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,e.__webglFaceBuffer),k.drawElements(k.TRIANGLES,e.__webglFaceCount,k.UNSIGNED_SHORT,0)),L.info.render.calls++,L.info.render.vertices+=e.__webglFaceCount,L.info.render.faces+=e.__webglFaceCount/
3):f instanceof THREE.Line?(f=f.type===THREE.LineStrip?k.LINE_STRIP:k.LINES,d=d.linewidth,d!==Wa&&(k.lineWidth(d),Wa=d),k.drawArrays(f,0,e.__webglLineCount),L.info.render.calls++):f instanceof THREE.ParticleSystem?(k.drawArrays(k.POINTS,0,e.__webglParticleCount),L.info.render.calls++,L.info.render.points+=e.__webglParticleCount):f instanceof THREE.Ribbon&&(k.drawArrays(k.TRIANGLE_STRIP,0,e.__webglVertexCount),L.info.render.calls++)}};this.render=function(a,b,c,d){if(!1===b instanceof THREE.Camera)console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
else{var e,f,g,h,i=a.__lights,j=a.fog;Y=-1;mb=!0;this.autoUpdateScene&&a.updateMatrixWorld();void 0===b.parent&&b.updateMatrixWorld();b._viewMatrixArray||(b._viewMatrixArray=new Float32Array(16));b._projectionMatrixArray||(b._projectionMatrixArray=new Float32Array(16));b.matrixWorldInverse.getInverse(b.matrixWorld);b.matrixWorldInverse.flattenToArray(b._viewMatrixArray);b.projectionMatrix.flattenToArray(b._projectionMatrixArray);eb.multiply(b.projectionMatrix,b.matrixWorldInverse);va.setFromMatrix(eb);
this.autoUpdateObjects&&this.initWebGLObjects(a);n(this.renderPluginsPre,a,b);L.info.render.calls=0;L.info.render.vertices=0;L.info.render.faces=0;L.info.render.points=0;this.setRenderTarget(c);(this.autoClear||d)&&this.clear(this.autoClearColor,this.autoClearDepth,this.autoClearStencil);h=a.__webglObjects;d=0;for(e=h.length;d<e;d++)if(f=h[d],g=f.object,f.render=!1,g.visible&&(!(g instanceof THREE.Mesh||g instanceof THREE.ParticleSystem)||!g.frustumCulled||va.contains(g))){A(g,b);var m=f,s=m.buffer,
r=void 0,q=r=void 0,q=m.object.material;if(q instanceof THREE.MeshFaceMaterial)r=s.materialIndex,0<=r&&(r=q.materials[r],r.transparent?(m.transparent=r,m.opaque=null):(m.opaque=r,m.transparent=null));else if(r=q)r.transparent?(m.transparent=r,m.opaque=null):(m.opaque=r,m.transparent=null);f.render=!0;!0===this.sortObjects&&(null!==g.renderDepth?f.z=g.renderDepth:(bb.copy(g.matrixWorld.getPosition()),eb.multiplyVector3(bb),f.z=bb.z),f.id=g.id)}this.sortObjects&&h.sort(l);h=a.__webglObjectsImmediate;
d=0;for(e=h.length;d<e;d++)f=h[d],g=f.object,g.visible&&(A(g,b),g=f.object.material,g.transparent?(f.transparent=g,f.opaque=null):(f.opaque=g,f.transparent=null));a.overrideMaterial?(d=a.overrideMaterial,this.setBlending(d.blending,d.blendEquation,d.blendSrc,d.blendDst),this.setDepthTest(d.depthTest),this.setDepthWrite(d.depthWrite),D(d.polygonOffset,d.polygonOffsetFactor,d.polygonOffsetUnits),p(a.__webglObjects,!1,"",b,i,j,!0,d),o(a.__webglObjectsImmediate,"",b,i,j,!1,d)):(this.setBlending(THREE.NormalBlending),
p(a.__webglObjects,!0,"opaque",b,i,j,!1),o(a.__webglObjectsImmediate,"opaque",b,i,j,!1),p(a.__webglObjects,!1,"transparent",b,i,j,!0),o(a.__webglObjectsImmediate,"transparent",b,i,j,!0));n(this.renderPluginsPost,a,b);c&&(c.generateMipmaps&&c.minFilter!==THREE.NearestFilter&&c.minFilter!==THREE.LinearFilter)&&(c instanceof THREE.WebGLRenderTargetCube?(k.bindTexture(k.TEXTURE_CUBE_MAP,c.__webglTexture),k.generateMipmap(k.TEXTURE_CUBE_MAP),k.bindTexture(k.TEXTURE_CUBE_MAP,null)):(k.bindTexture(k.TEXTURE_2D,
c.__webglTexture),k.generateMipmap(k.TEXTURE_2D),k.bindTexture(k.TEXTURE_2D,null)));this.setDepthTest(!0);this.setDepthWrite(!0)}};this.renderImmediateObject=function(a,b,c,d,e){var f=q(a,b,c,d,e);ba=-1;L.setMaterialFaces(d);e.immediateRenderCallback?e.immediateRenderCallback(f,k,va):e.render(function(a){L.renderBufferImmediate(a,f,d)})};this.initWebGLObjects=function(a){a.__webglObjects||(a.__webglObjects=[],a.__webglObjectsImmediate=[],a.__webglSprites=[],a.__webglFlares=[]);for(;a.__objectsAdded.length;){var b=
a.__objectsAdded[0],l=a,n=void 0,m=void 0,o=void 0,p=void 0;if(!b.__webglInit)if(b.__webglInit=!0,b._modelViewMatrix=new THREE.Matrix4,b._normalMatrix=new THREE.Matrix3,b instanceof THREE.Mesh)if(m=b.geometry,o=b.material,m instanceof THREE.Geometry){if(void 0===m.geometryGroups){var q=m,u=void 0,v=void 0,A=void 0,B=void 0,C=void 0,D=void 0,E=void 0,G={},H=q.morphTargets.length,I=q.morphNormals.length,X=o instanceof THREE.MeshFaceMaterial;q.geometryGroups={};u=0;for(v=q.faces.length;u<v;u++)A=q.faces[u],
B=X?A.materialIndex:void 0,D=void 0!==B?B:-1,void 0===G[D]&&(G[D]={hash:D,counter:0}),E=G[D].hash+"_"+G[D].counter,void 0===q.geometryGroups[E]&&(q.geometryGroups[E]={faces3:[],faces4:[],materialIndex:B,vertices:0,numMorphTargets:H,numMorphNormals:I}),C=A instanceof THREE.Face3?3:4,65535<q.geometryGroups[E].vertices+C&&(G[D].counter+=1,E=G[D].hash+"_"+G[D].counter,void 0===q.geometryGroups[E]&&(q.geometryGroups[E]={faces3:[],faces4:[],materialIndex:B,vertices:0,numMorphTargets:H,numMorphNormals:I})),
A instanceof THREE.Face3?q.geometryGroups[E].faces3.push(u):q.geometryGroups[E].faces4.push(u),q.geometryGroups[E].vertices+=C;q.geometryGroupsList=[];var Y=void 0;for(Y in q.geometryGroups)q.geometryGroups[Y].id=ia++,q.geometryGroupsList.push(q.geometryGroups[Y])}for(n in m.geometryGroups)if(p=m.geometryGroups[n],!p.__webglVertexBuffer){var J=p;J.__webglVertexBuffer=k.createBuffer();J.__webglNormalBuffer=k.createBuffer();J.__webglTangentBuffer=k.createBuffer();J.__webglColorBuffer=k.createBuffer();
J.__webglUVBuffer=k.createBuffer();J.__webglUV2Buffer=k.createBuffer();J.__webglSkinIndicesBuffer=k.createBuffer();J.__webglSkinWeightsBuffer=k.createBuffer();J.__webglFaceBuffer=k.createBuffer();J.__webglLineBuffer=k.createBuffer();var K=void 0,Q=void 0;if(J.numMorphTargets){J.__webglMorphTargetsBuffers=[];K=0;for(Q=J.numMorphTargets;K<Q;K++)J.__webglMorphTargetsBuffers.push(k.createBuffer())}if(J.numMorphNormals){J.__webglMorphNormalsBuffers=[];K=0;for(Q=J.numMorphNormals;K<Q;K++)J.__webglMorphNormalsBuffers.push(k.createBuffer())}L.info.memory.geometries++;
d(p,b);m.verticesNeedUpdate=!0;m.morphTargetsNeedUpdate=!0;m.elementsNeedUpdate=!0;m.uvsNeedUpdate=!0;m.normalsNeedUpdate=!0;m.tangentsNeedUpdate=!0;m.colorsNeedUpdate=!0}}else m instanceof THREE.BufferGeometry&&h(m);else if(b instanceof THREE.Ribbon){if(m=b.geometry,!m.__webglVertexBuffer){var O=m;O.__webglVertexBuffer=k.createBuffer();O.__webglColorBuffer=k.createBuffer();O.__webglNormalBuffer=k.createBuffer();L.info.memory.geometries++;var M=m,P=b,N=M.vertices.length;M.__vertexArray=new Float32Array(3*
N);M.__colorArray=new Float32Array(3*N);M.__normalArray=new Float32Array(3*N);M.__webglVertexCount=N;c(M,P);m.verticesNeedUpdate=!0;m.colorsNeedUpdate=!0;m.normalsNeedUpdate=!0}}else if(b instanceof THREE.Line){if(m=b.geometry,!m.__webglVertexBuffer){var ca=m;ca.__webglVertexBuffer=k.createBuffer();ca.__webglColorBuffer=k.createBuffer();ca.__webglLineDistanceBuffer=k.createBuffer();L.info.memory.geometries++;var fa=m,R=b,Z=fa.vertices.length;fa.__vertexArray=new Float32Array(3*Z);fa.__colorArray=
new Float32Array(3*Z);fa.__lineDistanceArray=new Float32Array(1*Z);fa.__webglLineCount=Z;c(fa,R);m.verticesNeedUpdate=!0;m.colorsNeedUpdate=!0;m.lineDistancesNeedUpdate=!0}}else if(b instanceof THREE.ParticleSystem&&(m=b.geometry,!m.__webglVertexBuffer))if(m instanceof THREE.Geometry){var aa=m;aa.__webglVertexBuffer=k.createBuffer();aa.__webglColorBuffer=k.createBuffer();L.info.memory.geometries++;var ba=m,ga=b,Aa=ba.vertices.length;ba.__vertexArray=new Float32Array(3*Aa);ba.__colorArray=new Float32Array(3*
Aa);ba.__sortArray=[];ba.__webglParticleCount=Aa;c(ba,ga);m.verticesNeedUpdate=!0;m.colorsNeedUpdate=!0}else m instanceof THREE.BufferGeometry&&h(m);if(!b.__webglActive){if(b instanceof THREE.Mesh)if(m=b.geometry,m instanceof THREE.BufferGeometry)s(l.__webglObjects,m,b);else for(n in m.geometryGroups)p=m.geometryGroups[n],s(l.__webglObjects,p,b);else b instanceof THREE.Ribbon||b instanceof THREE.Line||b instanceof THREE.ParticleSystem?(m=b.geometry,s(l.__webglObjects,m,b)):b instanceof THREE.ImmediateRenderObject||
b.immediateRenderCallback?l.__webglObjectsImmediate.push({object:b,opaque:null,transparent:null}):b instanceof THREE.Sprite?l.__webglSprites.push(b):b instanceof THREE.LensFlare&&l.__webglFlares.push(b);b.__webglActive=!0}a.__objectsAdded.splice(0,1)}for(;a.__objectsRemoved.length;){var oa=a.__objectsRemoved[0],sa=a;oa instanceof THREE.Mesh||oa instanceof THREE.ParticleSystem||oa instanceof THREE.Ribbon||oa instanceof THREE.Line?z(sa.__webglObjects,oa):oa instanceof THREE.Sprite?w(sa.__webglSprites,
oa):oa instanceof THREE.LensFlare?w(sa.__webglFlares,oa):(oa instanceof THREE.ImmediateRenderObject||oa.immediateRenderCallback)&&z(sa.__webglObjectsImmediate,oa);oa.__webglActive=!1;a.__objectsRemoved.splice(0,1)}for(var Na=0,xa=a.__webglObjects.length;Na<xa;Na++){var qa=a.__webglObjects[Na].object,T=qa.geometry,Ja=void 0,va=void 0,ma=void 0;if(qa instanceof THREE.Mesh)if(T instanceof THREE.BufferGeometry)(T.verticesNeedUpdate||T.elementsNeedUpdate||T.uvsNeedUpdate||T.normalsNeedUpdate||T.colorsNeedUpdate||
T.tangentsNeedUpdate)&&j(T,k.DYNAMIC_DRAW,!T.dynamic),T.verticesNeedUpdate=!1,T.elementsNeedUpdate=!1,T.uvsNeedUpdate=!1,T.normalsNeedUpdate=!1,T.colorsNeedUpdate=!1,T.tangentsNeedUpdate=!1;else{for(var Ka=0,Oa=T.geometryGroupsList.length;Ka<Oa;Ka++)if(Ja=T.geometryGroupsList[Ka],ma=e(qa,Ja),T.buffersNeedUpdate&&d(Ja,qa),va=ma.attributes&&t(ma),T.verticesNeedUpdate||T.morphTargetsNeedUpdate||T.elementsNeedUpdate||T.uvsNeedUpdate||T.normalsNeedUpdate||T.colorsNeedUpdate||T.tangentsNeedUpdate||va){var ra=
Ja,Sa=qa,Ea=k.DYNAMIC_DRAW,ib=!T.dynamic,Wa=ma;if(ra.__inittedArrays){var mb=f(Wa),rb=Wa.vertexColors?Wa.vertexColors:!1,ob=g(Wa),lb=mb===THREE.SmoothShading,F=void 0,$=void 0,ab=void 0,S=void 0,eb=void 0,bb=void 0,Eb=void 0,pb=void 0,Vb=void 0,jb=void 0,kb=void 0,U=void 0,V=void 0,W=void 0,pa=void 0,Fb=void 0,Gb=void 0,Hb=void 0,qb=void 0,Ib=void 0,Jb=void 0,Kb=void 0,sb=void 0,Lb=void 0,Mb=void 0,Nb=void 0,zb=void 0,Ob=void 0,Pb=void 0,Qb=void 0,Bb=void 0,Rb=void 0,Sb=void 0,Tb=void 0,Cb=void 0,
wa=void 0,gc=void 0,ac=void 0,kc=void 0,lc=void 0,Ta=void 0,hc=void 0,Qa=void 0,Ra=void 0,bc=void 0,Wb=void 0,La=0,Pa=0,Xb=0,Yb=0,vb=0,Za=0,Ba=0,db=0,Ma=0,ha=0,ja=0,y=0,ya=void 0,Ua=ra.__vertexArray,pc=ra.__uvArray,qc=ra.__uv2Array,wb=ra.__normalArray,Fa=ra.__tangentArray,Va=ra.__colorArray,Ga=ra.__skinIndexArray,Ha=ra.__skinWeightArray,Sc=ra.__morphTargetsArrays,Tc=ra.__morphNormalsArrays,Uc=ra.__webglCustomAttributesList,x=void 0,Ub=ra.__faceArray,nb=ra.__lineArray,fb=Sa.geometry,xc=fb.elementsNeedUpdate,
oc=fb.uvsNeedUpdate,Pc=fb.normalsNeedUpdate,Qc=fb.tangentsNeedUpdate,hd=fb.colorsNeedUpdate,id=fb.morphTargetsNeedUpdate,ec=fb.vertices,ta=ra.faces3,ua=ra.faces4,$a=fb.faces,Vc=fb.faceVertexUvs[0],Wc=fb.faceVertexUvs[1],fc=fb.skinIndices,cc=fb.skinWeights,dc=fb.morphTargets,Ac=fb.morphNormals;if(fb.verticesNeedUpdate){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],U=ec[S.a],V=ec[S.b],W=ec[S.c],Ua[Pa]=U.x,Ua[Pa+1]=U.y,Ua[Pa+2]=U.z,Ua[Pa+3]=V.x,Ua[Pa+4]=V.y,Ua[Pa+5]=V.z,Ua[Pa+6]=W.x,Ua[Pa+7]=W.y,Ua[Pa+8]=
W.z,Pa+=9;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],U=ec[S.a],V=ec[S.b],W=ec[S.c],pa=ec[S.d],Ua[Pa]=U.x,Ua[Pa+1]=U.y,Ua[Pa+2]=U.z,Ua[Pa+3]=V.x,Ua[Pa+4]=V.y,Ua[Pa+5]=V.z,Ua[Pa+6]=W.x,Ua[Pa+7]=W.y,Ua[Pa+8]=W.z,Ua[Pa+9]=pa.x,Ua[Pa+10]=pa.y,Ua[Pa+11]=pa.z,Pa+=12;k.bindBuffer(k.ARRAY_BUFFER,ra.__webglVertexBuffer);k.bufferData(k.ARRAY_BUFFER,Ua,Ea)}if(id){Ta=0;for(hc=dc.length;Ta<hc;Ta++){F=ja=0;for($=ta.length;F<$;F++)bc=ta[F],S=$a[bc],U=dc[Ta].vertices[S.a],V=dc[Ta].vertices[S.b],W=dc[Ta].vertices[S.c],
Qa=Sc[Ta],Qa[ja]=U.x,Qa[ja+1]=U.y,Qa[ja+2]=U.z,Qa[ja+3]=V.x,Qa[ja+4]=V.y,Qa[ja+5]=V.z,Qa[ja+6]=W.x,Qa[ja+7]=W.y,Qa[ja+8]=W.z,Wa.morphNormals&&(lb?(Wb=Ac[Ta].vertexNormals[bc],Ib=Wb.a,Jb=Wb.b,Kb=Wb.c):Kb=Jb=Ib=Ac[Ta].faceNormals[bc],Ra=Tc[Ta],Ra[ja]=Ib.x,Ra[ja+1]=Ib.y,Ra[ja+2]=Ib.z,Ra[ja+3]=Jb.x,Ra[ja+4]=Jb.y,Ra[ja+5]=Jb.z,Ra[ja+6]=Kb.x,Ra[ja+7]=Kb.y,Ra[ja+8]=Kb.z),ja+=9;F=0;for($=ua.length;F<$;F++)bc=ua[F],S=$a[bc],U=dc[Ta].vertices[S.a],V=dc[Ta].vertices[S.b],W=dc[Ta].vertices[S.c],pa=dc[Ta].vertices[S.d],
Qa=Sc[Ta],Qa[ja]=U.x,Qa[ja+1]=U.y,Qa[ja+2]=U.z,Qa[ja+3]=V.x,Qa[ja+4]=V.y,Qa[ja+5]=V.z,Qa[ja+6]=W.x,Qa[ja+7]=W.y,Qa[ja+8]=W.z,Qa[ja+9]=pa.x,Qa[ja+10]=pa.y,Qa[ja+11]=pa.z,Wa.morphNormals&&(lb?(Wb=Ac[Ta].vertexNormals[bc],Ib=Wb.a,Jb=Wb.b,Kb=Wb.c,sb=Wb.d):sb=Kb=Jb=Ib=Ac[Ta].faceNormals[bc],Ra=Tc[Ta],Ra[ja]=Ib.x,Ra[ja+1]=Ib.y,Ra[ja+2]=Ib.z,Ra[ja+3]=Jb.x,Ra[ja+4]=Jb.y,Ra[ja+5]=Jb.z,Ra[ja+6]=Kb.x,Ra[ja+7]=Kb.y,Ra[ja+8]=Kb.z,Ra[ja+9]=sb.x,Ra[ja+10]=sb.y,Ra[ja+11]=sb.z),ja+=12;k.bindBuffer(k.ARRAY_BUFFER,
ra.__webglMorphTargetsBuffers[Ta]);k.bufferData(k.ARRAY_BUFFER,Sc[Ta],Ea);Wa.morphNormals&&(k.bindBuffer(k.ARRAY_BUFFER,ra.__webglMorphNormalsBuffers[Ta]),k.bufferData(k.ARRAY_BUFFER,Tc[Ta],Ea))}}if(cc.length){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],Ob=cc[S.a],Pb=cc[S.b],Qb=cc[S.c],Ha[ha]=Ob.x,Ha[ha+1]=Ob.y,Ha[ha+2]=Ob.z,Ha[ha+3]=Ob.w,Ha[ha+4]=Pb.x,Ha[ha+5]=Pb.y,Ha[ha+6]=Pb.z,Ha[ha+7]=Pb.w,Ha[ha+8]=Qb.x,Ha[ha+9]=Qb.y,Ha[ha+10]=Qb.z,Ha[ha+11]=Qb.w,Rb=fc[S.a],Sb=fc[S.b],Tb=fc[S.c],Ga[ha]=Rb.x,Ga[ha+
1]=Rb.y,Ga[ha+2]=Rb.z,Ga[ha+3]=Rb.w,Ga[ha+4]=Sb.x,Ga[ha+5]=Sb.y,Ga[ha+6]=Sb.z,Ga[ha+7]=Sb.w,Ga[ha+8]=Tb.x,Ga[ha+9]=Tb.y,Ga[ha+10]=Tb.z,Ga[ha+11]=Tb.w,ha+=12;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],Ob=cc[S.a],Pb=cc[S.b],Qb=cc[S.c],Bb=cc[S.d],Ha[ha]=Ob.x,Ha[ha+1]=Ob.y,Ha[ha+2]=Ob.z,Ha[ha+3]=Ob.w,Ha[ha+4]=Pb.x,Ha[ha+5]=Pb.y,Ha[ha+6]=Pb.z,Ha[ha+7]=Pb.w,Ha[ha+8]=Qb.x,Ha[ha+9]=Qb.y,Ha[ha+10]=Qb.z,Ha[ha+11]=Qb.w,Ha[ha+12]=Bb.x,Ha[ha+13]=Bb.y,Ha[ha+14]=Bb.z,Ha[ha+15]=Bb.w,Rb=fc[S.a],Sb=fc[S.b],Tb=fc[S.c],
Cb=fc[S.d],Ga[ha]=Rb.x,Ga[ha+1]=Rb.y,Ga[ha+2]=Rb.z,Ga[ha+3]=Rb.w,Ga[ha+4]=Sb.x,Ga[ha+5]=Sb.y,Ga[ha+6]=Sb.z,Ga[ha+7]=Sb.w,Ga[ha+8]=Tb.x,Ga[ha+9]=Tb.y,Ga[ha+10]=Tb.z,Ga[ha+11]=Tb.w,Ga[ha+12]=Cb.x,Ga[ha+13]=Cb.y,Ga[ha+14]=Cb.z,Ga[ha+15]=Cb.w,ha+=16;0<ha&&(k.bindBuffer(k.ARRAY_BUFFER,ra.__webglSkinIndicesBuffer),k.bufferData(k.ARRAY_BUFFER,Ga,Ea),k.bindBuffer(k.ARRAY_BUFFER,ra.__webglSkinWeightsBuffer),k.bufferData(k.ARRAY_BUFFER,Ha,Ea))}if(hd&&rb){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],Eb=S.vertexColors,
pb=S.color,3===Eb.length&&rb===THREE.VertexColors?(Lb=Eb[0],Mb=Eb[1],Nb=Eb[2]):Nb=Mb=Lb=pb,Va[Ma]=Lb.r,Va[Ma+1]=Lb.g,Va[Ma+2]=Lb.b,Va[Ma+3]=Mb.r,Va[Ma+4]=Mb.g,Va[Ma+5]=Mb.b,Va[Ma+6]=Nb.r,Va[Ma+7]=Nb.g,Va[Ma+8]=Nb.b,Ma+=9;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],Eb=S.vertexColors,pb=S.color,4===Eb.length&&rb===THREE.VertexColors?(Lb=Eb[0],Mb=Eb[1],Nb=Eb[2],zb=Eb[3]):zb=Nb=Mb=Lb=pb,Va[Ma]=Lb.r,Va[Ma+1]=Lb.g,Va[Ma+2]=Lb.b,Va[Ma+3]=Mb.r,Va[Ma+4]=Mb.g,Va[Ma+5]=Mb.b,Va[Ma+6]=Nb.r,Va[Ma+7]=Nb.g,Va[Ma+8]=
Nb.b,Va[Ma+9]=zb.r,Va[Ma+10]=zb.g,Va[Ma+11]=zb.b,Ma+=12;0<Ma&&(k.bindBuffer(k.ARRAY_BUFFER,ra.__webglColorBuffer),k.bufferData(k.ARRAY_BUFFER,Va,Ea))}if(Qc&&fb.hasTangents){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],Vb=S.vertexTangents,Fb=Vb[0],Gb=Vb[1],Hb=Vb[2],Fa[Ba]=Fb.x,Fa[Ba+1]=Fb.y,Fa[Ba+2]=Fb.z,Fa[Ba+3]=Fb.w,Fa[Ba+4]=Gb.x,Fa[Ba+5]=Gb.y,Fa[Ba+6]=Gb.z,Fa[Ba+7]=Gb.w,Fa[Ba+8]=Hb.x,Fa[Ba+9]=Hb.y,Fa[Ba+10]=Hb.z,Fa[Ba+11]=Hb.w,Ba+=12;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],Vb=S.vertexTangents,Fb=Vb[0],
Gb=Vb[1],Hb=Vb[2],qb=Vb[3],Fa[Ba]=Fb.x,Fa[Ba+1]=Fb.y,Fa[Ba+2]=Fb.z,Fa[Ba+3]=Fb.w,Fa[Ba+4]=Gb.x,Fa[Ba+5]=Gb.y,Fa[Ba+6]=Gb.z,Fa[Ba+7]=Gb.w,Fa[Ba+8]=Hb.x,Fa[Ba+9]=Hb.y,Fa[Ba+10]=Hb.z,Fa[Ba+11]=Hb.w,Fa[Ba+12]=qb.x,Fa[Ba+13]=qb.y,Fa[Ba+14]=qb.z,Fa[Ba+15]=qb.w,Ba+=16;k.bindBuffer(k.ARRAY_BUFFER,ra.__webglTangentBuffer);k.bufferData(k.ARRAY_BUFFER,Fa,Ea)}if(Pc&&mb){F=0;for($=ta.length;F<$;F++)if(S=$a[ta[F]],eb=S.vertexNormals,bb=S.normal,3===eb.length&&lb)for(wa=0;3>wa;wa++)ac=eb[wa],wb[Za]=ac.x,wb[Za+1]=
ac.y,wb[Za+2]=ac.z,Za+=3;else for(wa=0;3>wa;wa++)wb[Za]=bb.x,wb[Za+1]=bb.y,wb[Za+2]=bb.z,Za+=3;F=0;for($=ua.length;F<$;F++)if(S=$a[ua[F]],eb=S.vertexNormals,bb=S.normal,4===eb.length&&lb)for(wa=0;4>wa;wa++)ac=eb[wa],wb[Za]=ac.x,wb[Za+1]=ac.y,wb[Za+2]=ac.z,Za+=3;else for(wa=0;4>wa;wa++)wb[Za]=bb.x,wb[Za+1]=bb.y,wb[Za+2]=bb.z,Za+=3;k.bindBuffer(k.ARRAY_BUFFER,ra.__webglNormalBuffer);k.bufferData(k.ARRAY_BUFFER,wb,Ea)}if(oc&&Vc&&ob){F=0;for($=ta.length;F<$;F++)if(ab=ta[F],jb=Vc[ab],void 0!==jb)for(wa=
0;3>wa;wa++)kc=jb[wa],pc[Xb]=kc.u,pc[Xb+1]=kc.v,Xb+=2;F=0;for($=ua.length;F<$;F++)if(ab=ua[F],jb=Vc[ab],void 0!==jb)for(wa=0;4>wa;wa++)kc=jb[wa],pc[Xb]=kc.u,pc[Xb+1]=kc.v,Xb+=2;0<Xb&&(k.bindBuffer(k.ARRAY_BUFFER,ra.__webglUVBuffer),k.bufferData(k.ARRAY_BUFFER,pc,Ea))}if(oc&&Wc&&ob){F=0;for($=ta.length;F<$;F++)if(ab=ta[F],kb=Wc[ab],void 0!==kb)for(wa=0;3>wa;wa++)lc=kb[wa],qc[Yb]=lc.u,qc[Yb+1]=lc.v,Yb+=2;F=0;for($=ua.length;F<$;F++)if(ab=ua[F],kb=Wc[ab],void 0!==kb)for(wa=0;4>wa;wa++)lc=kb[wa],qc[Yb]=
lc.u,qc[Yb+1]=lc.v,Yb+=2;0<Yb&&(k.bindBuffer(k.ARRAY_BUFFER,ra.__webglUV2Buffer),k.bufferData(k.ARRAY_BUFFER,qc,Ea))}if(xc){F=0;for($=ta.length;F<$;F++)Ub[vb]=La,Ub[vb+1]=La+1,Ub[vb+2]=La+2,vb+=3,nb[db]=La,nb[db+1]=La+1,nb[db+2]=La,nb[db+3]=La+2,nb[db+4]=La+1,nb[db+5]=La+2,db+=6,La+=3;F=0;for($=ua.length;F<$;F++)Ub[vb]=La,Ub[vb+1]=La+1,Ub[vb+2]=La+3,Ub[vb+3]=La+1,Ub[vb+4]=La+2,Ub[vb+5]=La+3,vb+=6,nb[db]=La,nb[db+1]=La+1,nb[db+2]=La,nb[db+3]=La+3,nb[db+4]=La+1,nb[db+5]=La+2,nb[db+6]=La+2,nb[db+7]=
La+3,db+=8,La+=4;k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,ra.__webglFaceBuffer);k.bufferData(k.ELEMENT_ARRAY_BUFFER,Ub,Ea);k.bindBuffer(k.ELEMENT_ARRAY_BUFFER,ra.__webglLineBuffer);k.bufferData(k.ELEMENT_ARRAY_BUFFER,nb,Ea)}if(Uc){wa=0;for(gc=Uc.length;wa<gc;wa++)if(x=Uc[wa],x.__original.needsUpdate){y=0;if(1===x.size)if(void 0===x.boundTo||"vertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],x.array[y]=x.value[S.a],x.array[y+1]=x.value[S.b],x.array[y+2]=x.value[S.c],y+=3;F=0;for($=ua.length;F<
$;F++)S=$a[ua[F]],x.array[y]=x.value[S.a],x.array[y+1]=x.value[S.b],x.array[y+2]=x.value[S.c],x.array[y+3]=x.value[S.d],y+=4}else{if("faces"===x.boundTo){F=0;for($=ta.length;F<$;F++)ya=x.value[ta[F]],x.array[y]=ya,x.array[y+1]=ya,x.array[y+2]=ya,y+=3;F=0;for($=ua.length;F<$;F++)ya=x.value[ua[F]],x.array[y]=ya,x.array[y+1]=ya,x.array[y+2]=ya,x.array[y+3]=ya,y+=4}}else if(2===x.size)if(void 0===x.boundTo||"vertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],U=x.value[S.a],V=x.value[S.b],
W=x.value[S.c],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=V.x,x.array[y+3]=V.y,x.array[y+4]=W.x,x.array[y+5]=W.y,y+=6;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],U=x.value[S.a],V=x.value[S.b],W=x.value[S.c],pa=x.value[S.d],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=V.x,x.array[y+3]=V.y,x.array[y+4]=W.x,x.array[y+5]=W.y,x.array[y+6]=pa.x,x.array[y+7]=pa.y,y+=8}else{if("faces"===x.boundTo){F=0;for($=ta.length;F<$;F++)W=V=U=ya=x.value[ta[F]],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=V.x,x.array[y+
3]=V.y,x.array[y+4]=W.x,x.array[y+5]=W.y,y+=6;F=0;for($=ua.length;F<$;F++)pa=W=V=U=ya=x.value[ua[F]],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=V.x,x.array[y+3]=V.y,x.array[y+4]=W.x,x.array[y+5]=W.y,x.array[y+6]=pa.x,x.array[y+7]=pa.y,y+=8}}else if(3===x.size){var ea;ea="c"===x.type?["r","g","b"]:["x","y","z"];if(void 0===x.boundTo||"vertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],U=x.value[S.a],V=x.value[S.b],W=x.value[S.c],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=
U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],y+=9;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],U=x.value[S.a],V=x.value[S.b],W=x.value[S.c],pa=x.value[S.d],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],x.array[y+9]=pa[ea[0]],x.array[y+10]=pa[ea[1]],x.array[y+11]=
pa[ea[2]],y+=12}else if("faces"===x.boundTo){F=0;for($=ta.length;F<$;F++)W=V=U=ya=x.value[ta[F]],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],y+=9;F=0;for($=ua.length;F<$;F++)pa=W=V=U=ya=x.value[ua[F]],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],
x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],x.array[y+9]=pa[ea[0]],x.array[y+10]=pa[ea[1]],x.array[y+11]=pa[ea[2]],y+=12}else if("faceVertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)ya=x.value[ta[F]],U=ya[0],V=ya[1],W=ya[2],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],y+=9;F=0;for($=ua.length;F<$;F++)ya=x.value[ua[F]],U=ya[0],V=ya[1],W=ya[2],pa=
ya[3],x.array[y]=U[ea[0]],x.array[y+1]=U[ea[1]],x.array[y+2]=U[ea[2]],x.array[y+3]=V[ea[0]],x.array[y+4]=V[ea[1]],x.array[y+5]=V[ea[2]],x.array[y+6]=W[ea[0]],x.array[y+7]=W[ea[1]],x.array[y+8]=W[ea[2]],x.array[y+9]=pa[ea[0]],x.array[y+10]=pa[ea[1]],x.array[y+11]=pa[ea[2]],y+=12}}else if(4===x.size)if(void 0===x.boundTo||"vertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)S=$a[ta[F]],U=x.value[S.a],V=x.value[S.b],W=x.value[S.c],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+
4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,y+=12;F=0;for($=ua.length;F<$;F++)S=$a[ua[F]],U=x.value[S.a],V=x.value[S.b],W=x.value[S.c],pa=x.value[S.d],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,x.array[y+12]=pa.x,x.array[y+13]=pa.y,x.array[y+14]=pa.z,x.array[y+
15]=pa.w,y+=16}else if("faces"===x.boundTo){F=0;for($=ta.length;F<$;F++)W=V=U=ya=x.value[ta[F]],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,y+=12;F=0;for($=ua.length;F<$;F++)pa=W=V=U=ya=x.value[ua[F]],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+
8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,x.array[y+12]=pa.x,x.array[y+13]=pa.y,x.array[y+14]=pa.z,x.array[y+15]=pa.w,y+=16}else if("faceVertices"===x.boundTo){F=0;for($=ta.length;F<$;F++)ya=x.value[ta[F]],U=ya[0],V=ya[1],W=ya[2],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,y+=12;F=0;for($=ua.length;F<$;F++)ya=x.value[ua[F]],
U=ya[0],V=ya[1],W=ya[2],pa=ya[3],x.array[y]=U.x,x.array[y+1]=U.y,x.array[y+2]=U.z,x.array[y+3]=U.w,x.array[y+4]=V.x,x.array[y+5]=V.y,x.array[y+6]=V.z,x.array[y+7]=V.w,x.array[y+8]=W.x,x.array[y+9]=W.y,x.array[y+10]=W.z,x.array[y+11]=W.w,x.array[y+12]=pa.x,x.array[y+13]=pa.y,x.array[y+14]=pa.z,x.array[y+15]=pa.w,y+=16}k.bindBuffer(k.ARRAY_BUFFER,x.buffer);k.bufferData(k.ARRAY_BUFFER,x.array,Ea)}}ib&&(delete ra.__inittedArrays,delete ra.__colorArray,delete ra.__normalArray,delete ra.__tangentArray,
delete ra.__uvArray,delete ra.__uv2Array,delete ra.__faceArray,delete ra.__vertexArray,delete ra.__lineArray,delete ra.__skinIndexArray,delete ra.__skinWeightArray)}}T.verticesNeedUpdate=!1;T.morphTargetsNeedUpdate=!1;T.elementsNeedUpdate=!1;T.uvsNeedUpdate=!1;T.normalsNeedUpdate=!1;T.colorsNeedUpdate=!1;T.tangentsNeedUpdate=!1;T.buffersNeedUpdate=!1;ma.attributes&&r(ma)}else if(qa instanceof THREE.Ribbon){ma=e(qa,T);va=ma.attributes&&t(ma);if(T.verticesNeedUpdate||T.colorsNeedUpdate||T.normalsNeedUpdate||
va){var xb=T,Bc=k.DYNAMIC_DRAW,rc=void 0,sc=void 0,tc=void 0,Cc=void 0,za=void 0,Dc=void 0,Ec=void 0,Fc=void 0,Zc=void 0,Xa=void 0,mc=void 0,Ca=void 0,gb=void 0,$c=xb.vertices,ad=xb.colors,bd=xb.normals,jd=$c.length,kd=ad.length,ld=bd.length,Gc=xb.__vertexArray,Hc=xb.__colorArray,Ic=xb.__normalArray,md=xb.colorsNeedUpdate,nd=xb.normalsNeedUpdate,Xc=xb.__webglCustomAttributesList;if(xb.verticesNeedUpdate){for(rc=0;rc<jd;rc++)Cc=$c[rc],za=3*rc,Gc[za]=Cc.x,Gc[za+1]=Cc.y,Gc[za+2]=Cc.z;k.bindBuffer(k.ARRAY_BUFFER,
xb.__webglVertexBuffer);k.bufferData(k.ARRAY_BUFFER,Gc,Bc)}if(md){for(sc=0;sc<kd;sc++)Dc=ad[sc],za=3*sc,Hc[za]=Dc.r,Hc[za+1]=Dc.g,Hc[za+2]=Dc.b;k.bindBuffer(k.ARRAY_BUFFER,xb.__webglColorBuffer);k.bufferData(k.ARRAY_BUFFER,Hc,Bc)}if(nd){for(tc=0;tc<ld;tc++)Ec=bd[tc],za=3*tc,Ic[za]=Ec.x,Ic[za+1]=Ec.y,Ic[za+2]=Ec.z;k.bindBuffer(k.ARRAY_BUFFER,xb.__webglNormalBuffer);k.bufferData(k.ARRAY_BUFFER,Ic,Bc)}if(Xc){Fc=0;for(Zc=Xc.length;Fc<Zc;Fc++)if(Ca=Xc[Fc],Ca.needsUpdate&&(void 0===Ca.boundTo||"vertices"===
Ca.boundTo)){za=0;mc=Ca.value.length;if(1===Ca.size)for(Xa=0;Xa<mc;Xa++)Ca.array[Xa]=Ca.value[Xa];else if(2===Ca.size)for(Xa=0;Xa<mc;Xa++)gb=Ca.value[Xa],Ca.array[za]=gb.x,Ca.array[za+1]=gb.y,za+=2;else if(3===Ca.size)if("c"===Ca.type)for(Xa=0;Xa<mc;Xa++)gb=Ca.value[Xa],Ca.array[za]=gb.r,Ca.array[za+1]=gb.g,Ca.array[za+2]=gb.b,za+=3;else for(Xa=0;Xa<mc;Xa++)gb=Ca.value[Xa],Ca.array[za]=gb.x,Ca.array[za+1]=gb.y,Ca.array[za+2]=gb.z,za+=3;else if(4===Ca.size)for(Xa=0;Xa<mc;Xa++)gb=Ca.value[Xa],Ca.array[za]=
gb.x,Ca.array[za+1]=gb.y,Ca.array[za+2]=gb.z,Ca.array[za+3]=gb.w,za+=4;k.bindBuffer(k.ARRAY_BUFFER,Ca.buffer);k.bufferData(k.ARRAY_BUFFER,Ca.array,Bc)}}}T.verticesNeedUpdate=!1;T.colorsNeedUpdate=!1;T.normalsNeedUpdate=!1;ma.attributes&&r(ma)}else if(qa instanceof THREE.Line){ma=e(qa,T);va=ma.attributes&&t(ma);if(T.verticesNeedUpdate||T.colorsNeedUpdate||T.lineDistancesNeedUpdate||va){var yb=T,Jc=k.DYNAMIC_DRAW,uc=void 0,vc=void 0,wc=void 0,Kc=void 0,Ia=void 0,Lc=void 0,cd=yb.vertices,dd=yb.colors,
ed=yb.lineDistances,od=cd.length,pd=dd.length,qd=ed.length,Mc=yb.__vertexArray,Nc=yb.__colorArray,fd=yb.__lineDistanceArray,rd=yb.colorsNeedUpdate,sd=yb.lineDistancesNeedUpdate,Yc=yb.__webglCustomAttributesList,Oc=void 0,gd=void 0,Ya=void 0,nc=void 0,hb=void 0,Da=void 0;if(yb.verticesNeedUpdate){for(uc=0;uc<od;uc++)Kc=cd[uc],Ia=3*uc,Mc[Ia]=Kc.x,Mc[Ia+1]=Kc.y,Mc[Ia+2]=Kc.z;k.bindBuffer(k.ARRAY_BUFFER,yb.__webglVertexBuffer);k.bufferData(k.ARRAY_BUFFER,Mc,Jc)}if(rd){for(vc=0;vc<pd;vc++)Lc=dd[vc],Ia=
3*vc,Nc[Ia]=Lc.r,Nc[Ia+1]=Lc.g,Nc[Ia+2]=Lc.b;k.bindBuffer(k.ARRAY_BUFFER,yb.__webglColorBuffer);k.bufferData(k.ARRAY_BUFFER,Nc,Jc)}if(sd){for(wc=0;wc<qd;wc++)fd[wc]=ed[wc];k.bindBuffer(k.ARRAY_BUFFER,yb.__webglLineDistanceBuffer);k.bufferData(k.ARRAY_BUFFER,fd,Jc)}if(Yc){Oc=0;for(gd=Yc.length;Oc<gd;Oc++)if(Da=Yc[Oc],Da.needsUpdate&&(void 0===Da.boundTo||"vertices"===Da.boundTo)){Ia=0;nc=Da.value.length;if(1===Da.size)for(Ya=0;Ya<nc;Ya++)Da.array[Ya]=Da.value[Ya];else if(2===Da.size)for(Ya=0;Ya<nc;Ya++)hb=
Da.value[Ya],Da.array[Ia]=hb.x,Da.array[Ia+1]=hb.y,Ia+=2;else if(3===Da.size)if("c"===Da.type)for(Ya=0;Ya<nc;Ya++)hb=Da.value[Ya],Da.array[Ia]=hb.r,Da.array[Ia+1]=hb.g,Da.array[Ia+2]=hb.b,Ia+=3;else for(Ya=0;Ya<nc;Ya++)hb=Da.value[Ya],Da.array[Ia]=hb.x,Da.array[Ia+1]=hb.y,Da.array[Ia+2]=hb.z,Ia+=3;else if(4===Da.size)for(Ya=0;Ya<nc;Ya++)hb=Da.value[Ya],Da.array[Ia]=hb.x,Da.array[Ia+1]=hb.y,Da.array[Ia+2]=hb.z,Da.array[Ia+3]=hb.w,Ia+=4;k.bindBuffer(k.ARRAY_BUFFER,Da.buffer);k.bufferData(k.ARRAY_BUFFER,
Da.array,Jc)}}}T.verticesNeedUpdate=!1;T.colorsNeedUpdate=!1;T.lineDistancesNeedUpdate=!1;ma.attributes&&r(ma)}else qa instanceof THREE.ParticleSystem&&(T instanceof THREE.BufferGeometry?((T.verticesNeedUpdate||T.colorsNeedUpdate)&&j(T,k.DYNAMIC_DRAW,!T.dynamic),T.verticesNeedUpdate=!1,T.colorsNeedUpdate=!1):(ma=e(qa,T),va=ma.attributes&&t(ma),(T.verticesNeedUpdate||T.colorsNeedUpdate||qa.sortParticles||va)&&i(T,k.DYNAMIC_DRAW,qa),T.verticesNeedUpdate=!1,T.colorsNeedUpdate=!1,ma.attributes&&r(ma)))}};
this.initMaterial=function(a,b,c,d){var e,f,g,h,i,j,l,m,n;a instanceof THREE.MeshDepthMaterial?n="depth":a instanceof THREE.MeshNormalMaterial?n="normal":a instanceof THREE.MeshBasicMaterial?n="basic":a instanceof THREE.MeshLambertMaterial?n="lambert":a instanceof THREE.MeshPhongMaterial?n="phong":a instanceof THREE.LineBasicMaterial?n="basic":a instanceof THREE.LineDashedMaterial?n="dashed":a instanceof THREE.ParticleBasicMaterial&&(n="particle_basic");if(n){var o=THREE.ShaderLib[n];a.uniforms=THREE.UniformsUtils.clone(o.uniforms);
a.vertexShader=o.vertexShader;a.fragmentShader=o.fragmentShader}var p,s,r;e=p=s=r=o=0;for(f=b.length;e<f;e++)g=b[e],g.onlyShadow||(g instanceof THREE.DirectionalLight&&p++,g instanceof THREE.PointLight&&s++,g instanceof THREE.SpotLight&&r++,g instanceof THREE.HemisphereLight&&o++);e=p;f=s;g=r;h=o;o=p=0;for(r=b.length;o<r;o++)s=b[o],s.castShadow&&(s instanceof THREE.SpotLight&&p++,s instanceof THREE.DirectionalLight&&!s.shadowCascade&&p++);m=p;hc&&d&&d.useVertexTexture?l=1024:(b=k.getParameter(k.MAX_VERTEX_UNIFORM_VECTORS),
b=Math.floor((b-20)/4),void 0!==d&&d instanceof THREE.SkinnedMesh&&(b=Math.min(d.bones.length,b),b<d.bones.length&&console.warn("WebGLRenderer: too many bones - "+d.bones.length+", this GPU supports just "+b+" (try OpenGL instead of ANGLE)")),l=b);var q;a:{s=a.fragmentShader;r=a.vertexShader;o=a.uniforms;b=a.attributes;p=a.defines;var c={map:!!a.map,envMap:!!a.envMap,lightMap:!!a.lightMap,bumpMap:!!a.bumpMap,normalMap:!!a.normalMap,specularMap:!!a.specularMap,vertexColors:a.vertexColors,fog:c,useFog:a.fog,
fogExp:c instanceof THREE.FogExp2,sizeAttenuation:a.sizeAttenuation,skinning:a.skinning,maxBones:l,useVertexTexture:hc&&d&&d.useVertexTexture,boneTextureWidth:d&&d.boneTextureWidth,boneTextureHeight:d&&d.boneTextureHeight,morphTargets:a.morphTargets,morphNormals:a.morphNormals,maxMorphTargets:this.maxMorphTargets,maxMorphNormals:this.maxMorphNormals,maxDirLights:e,maxPointLights:f,maxSpotLights:g,maxHemiLights:h,maxShadows:m,shadowMapEnabled:this.shadowMapEnabled&&d.receiveShadow,shadowMapSoft:this.shadowMapSoft,
shadowMapDebug:this.shadowMapDebug,shadowMapCascade:this.shadowMapCascade,alphaTest:a.alphaTest,metal:a.metal,perPixel:a.perPixel,wrapAround:a.wrapAround,doubleSided:a.side===THREE.DoubleSide,flipSided:a.side===THREE.BackSide},t,u,v,d=[];n?d.push(n):(d.push(s),d.push(r));for(u in p)d.push(u),d.push(p[u]);for(t in c)d.push(t),d.push(c[t]);n=d.join();t=0;for(u=oa.length;t<u;t++)if(d=oa[t],d.code===n){d.usedTimes++;q=d.program;break a}t=[];for(v in p)u=p[v],!1!==u&&(u="#define "+v+" "+u,t.push(u));u=
t.join("\n");v=k.createProgram();t=["precision "+N+" float;",u,gc?"#define VERTEX_TEXTURES":"",L.gammaInput?"#define GAMMA_INPUT":"",L.gammaOutput?"#define GAMMA_OUTPUT":"",L.physicallyBasedShading?"#define PHYSICALLY_BASED_SHADING":"","#define MAX_DIR_LIGHTS "+c.maxDirLights,"#define MAX_POINT_LIGHTS "+c.maxPointLights,"#define MAX_SPOT_LIGHTS "+c.maxSpotLights,"#define MAX_HEMI_LIGHTS "+c.maxHemiLights,"#define MAX_SHADOWS "+c.maxShadows,"#define MAX_BONES "+c.maxBones,c.map?"#define USE_MAP":"",
c.envMap?"#define USE_ENVMAP":"",c.lightMap?"#define USE_LIGHTMAP":"",c.bumpMap?"#define USE_BUMPMAP":"",c.normalMap?"#define USE_NORMALMAP":"",c.specularMap?"#define USE_SPECULARMAP":"",c.vertexColors?"#define USE_COLOR":"",c.skinning?"#define USE_SKINNING":"",c.useVertexTexture?"#define BONE_TEXTURE":"",c.boneTextureWidth?"#define N_BONE_PIXEL_X "+c.boneTextureWidth.toFixed(1):"",c.boneTextureHeight?"#define N_BONE_PIXEL_Y "+c.boneTextureHeight.toFixed(1):"",c.morphTargets?"#define USE_MORPHTARGETS":
"",c.morphNormals?"#define USE_MORPHNORMALS":"",c.perPixel?"#define PHONG_PER_PIXEL":"",c.wrapAround?"#define WRAP_AROUND":"",c.doubleSided?"#define DOUBLE_SIDED":"",c.flipSided?"#define FLIP_SIDED":"",c.shadowMapEnabled?"#define USE_SHADOWMAP":"",c.shadowMapSoft?"#define SHADOWMAP_SOFT":"",c.shadowMapDebug?"#define SHADOWMAP_DEBUG":"",c.shadowMapCascade?"#define SHADOWMAP_CASCADE":"",c.sizeAttenuation?"#define USE_SIZEATTENUATION":"","uniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\n#ifdef USE_COLOR\nattribute vec3 color;\n#endif\n#ifdef USE_MORPHTARGETS\nattribute vec3 morphTarget0;\nattribute vec3 morphTarget1;\nattribute vec3 morphTarget2;\nattribute vec3 morphTarget3;\n#ifdef USE_MORPHNORMALS\nattribute vec3 morphNormal0;\nattribute vec3 morphNormal1;\nattribute vec3 morphNormal2;\nattribute vec3 morphNormal3;\n#else\nattribute vec3 morphTarget4;\nattribute vec3 morphTarget5;\nattribute vec3 morphTarget6;\nattribute vec3 morphTarget7;\n#endif\n#endif\n#ifdef USE_SKINNING\nattribute vec4 skinIndex;\nattribute vec4 skinWeight;\n#endif\n"].join("\n");
u=["precision "+N+" float;",c.bumpMap||c.normalMap?"#extension GL_OES_standard_derivatives : enable":"",u,"#define MAX_DIR_LIGHTS "+c.maxDirLights,"#define MAX_POINT_LIGHTS "+c.maxPointLights,"#define MAX_SPOT_LIGHTS "+c.maxSpotLights,"#define MAX_HEMI_LIGHTS "+c.maxHemiLights,"#define MAX_SHADOWS "+c.maxShadows,c.alphaTest?"#define ALPHATEST "+c.alphaTest:"",L.gammaInput?"#define GAMMA_INPUT":"",L.gammaOutput?"#define GAMMA_OUTPUT":"",L.physicallyBasedShading?"#define PHYSICALLY_BASED_SHADING":"",
c.useFog&&c.fog?"#define USE_FOG":"",c.useFog&&c.fogExp?"#define FOG_EXP2":"",c.map?"#define USE_MAP":"",c.envMap?"#define USE_ENVMAP":"",c.lightMap?"#define USE_LIGHTMAP":"",c.bumpMap?"#define USE_BUMPMAP":"",c.normalMap?"#define USE_NORMALMAP":"",c.specularMap?"#define USE_SPECULARMAP":"",c.vertexColors?"#define USE_COLOR":"",c.metal?"#define METAL":"",c.perPixel?"#define PHONG_PER_PIXEL":"",c.wrapAround?"#define WRAP_AROUND":"",c.doubleSided?"#define DOUBLE_SIDED":"",c.flipSided?"#define FLIP_SIDED":
"",c.shadowMapEnabled?"#define USE_SHADOWMAP":"",c.shadowMapSoft?"#define SHADOWMAP_SOFT":"",c.shadowMapDebug?"#define SHADOWMAP_DEBUG":"",c.shadowMapCascade?"#define SHADOWMAP_CASCADE":"","uniform mat4 viewMatrix;\nuniform vec3 cameraPosition;\n"].join("\n");u=G("fragment",u+s);t=G("vertex",t+r);k.attachShader(v,t);k.attachShader(v,u);k.linkProgram(v);k.getProgramParameter(v,k.LINK_STATUS)||console.error("Could not initialise shader\nVALIDATE_STATUS: "+k.getProgramParameter(v,k.VALIDATE_STATUS)+
", gl error ["+k.getError()+"]");k.deleteShader(u);k.deleteShader(t);v.uniforms={};v.attributes={};var w;t="viewMatrix modelViewMatrix projectionMatrix normalMatrix modelMatrix cameraPosition morphTargetInfluences".split(" ");c.useVertexTexture?t.push("boneTexture"):t.push("boneGlobalMatrices");for(w in o)t.push(w);w=t;t=0;for(u=w.length;t<u;t++)d=w[t],v.uniforms[d]=k.getUniformLocation(v,d);t="position normal uv uv2 tangent color skinIndex skinWeight lineDistance".split(" ");for(w=0;w<c.maxMorphTargets;w++)t.push("morphTarget"+
w);for(w=0;w<c.maxMorphNormals;w++)t.push("morphNormal"+w);for(q in b)t.push(q);q=t;w=0;for(b=q.length;w<b;w++)t=q[w],v.attributes[t]=k.getAttribLocation(v,t);v.id=X++;oa.push({program:v,code:n,usedTimes:1});L.info.memory.programs=oa.length;q=v}a.program=q;q=a.program.attributes;0<=q.position&&k.enableVertexAttribArray(q.position);0<=q.color&&k.enableVertexAttribArray(q.color);0<=q.normal&&k.enableVertexAttribArray(q.normal);0<=q.tangent&&k.enableVertexAttribArray(q.tangent);0<=q.lineDistance&&k.enableVertexAttribArray(q.lineDistance);
a.skinning&&(0<=q.skinIndex&&0<=q.skinWeight)&&(k.enableVertexAttribArray(q.skinIndex),k.enableVertexAttribArray(q.skinWeight));if(a.attributes)for(j in a.attributes)void 0!==q[j]&&0<=q[j]&&k.enableVertexAttribArray(q[j]);if(a.morphTargets){a.numSupportedMorphTargets=0;v="morphTarget";for(j=0;j<this.maxMorphTargets;j++)w=v+j,0<=q[w]&&(k.enableVertexAttribArray(q[w]),a.numSupportedMorphTargets++)}if(a.morphNormals){a.numSupportedMorphNormals=0;v="morphNormal";for(j=0;j<this.maxMorphNormals;j++)w=v+
j,0<=q[w]&&(k.enableVertexAttribArray(q[w]),a.numSupportedMorphNormals++)}a.uniformsList=[];for(i in a.uniforms)a.uniformsList.push([a.uniforms[i],i])};this.setFaceCulling=function(a,b){a?(!b||"ccw"===b?k.frontFace(k.CCW):k.frontFace(k.CW),"back"===a?k.cullFace(k.BACK):"front"===a?k.cullFace(k.FRONT):k.cullFace(k.FRONT_AND_BACK),k.enable(k.CULL_FACE)):k.disable(k.CULL_FACE)};this.setMaterialFaces=function(a){var b=a.side===THREE.DoubleSide,a=a.side===THREE.BackSide;Na!==b&&(b?k.disable(k.CULL_FACE):
k.enable(k.CULL_FACE),Na=b);Ja!==a&&(a?k.frontFace(k.CW):k.frontFace(k.CCW),Ja=a)};this.setDepthTest=function(a){ib!==a&&(a?k.enable(k.DEPTH_TEST):k.disable(k.DEPTH_TEST),ib=a)};this.setDepthWrite=function(a){ob!==a&&(k.depthMask(a),ob=a)};this.setBlending=function(a,b,c,d){a!==ma&&(a===THREE.NoBlending?k.disable(k.BLEND):a===THREE.AdditiveBlending?(k.enable(k.BLEND),k.blendEquation(k.FUNC_ADD),k.blendFunc(k.SRC_ALPHA,k.ONE)):a===THREE.SubtractiveBlending?(k.enable(k.BLEND),k.blendEquation(k.FUNC_ADD),
k.blendFunc(k.ZERO,k.ONE_MINUS_SRC_COLOR)):a===THREE.MultiplyBlending?(k.enable(k.BLEND),k.blendEquation(k.FUNC_ADD),k.blendFunc(k.ZERO,k.SRC_COLOR)):a===THREE.CustomBlending?k.enable(k.BLEND):(k.enable(k.BLEND),k.blendEquationSeparate(k.FUNC_ADD,k.FUNC_ADD),k.blendFuncSeparate(k.SRC_ALPHA,k.ONE_MINUS_SRC_ALPHA,k.ONE,k.ONE_MINUS_SRC_ALPHA)),ma=a);if(a===THREE.CustomBlending){if(b!==sa&&(k.blendEquation(H(b)),sa=b),c!==Ea||d!==rb)k.blendFunc(H(c),H(d)),Ea=c,rb=d}else rb=Ea=sa=null};this.setTexture=
function(a,b){if(a.needsUpdate){a.__webglInit||(a.__webglInit=!0,a.__webglTexture=k.createTexture(),L.info.memory.textures++);k.activeTexture(k.TEXTURE0+b);k.bindTexture(k.TEXTURE_2D,a.__webglTexture);k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,a.flipY);k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha);var c=a.image,d=0===(c.width&c.width-1)&&0===(c.height&c.height-1),e=H(a.format),f=H(a.type);P(k.TEXTURE_2D,a,d);if(a instanceof THREE.CompressedTexture)for(var f=a.mipmaps,g=0,h=f.length;g<
h;g++)c=f[g],k.compressedTexImage2D(k.TEXTURE_2D,g,e,c.width,c.height,0,c.data);else a instanceof THREE.DataTexture?k.texImage2D(k.TEXTURE_2D,0,e,c.width,c.height,0,e,f,c.data):k.texImage2D(k.TEXTURE_2D,0,e,e,f,a.image);a.generateMipmaps&&d&&k.generateMipmap(k.TEXTURE_2D);a.needsUpdate=!1;if(a.onUpdate)a.onUpdate()}else k.activeTexture(k.TEXTURE0+b),k.bindTexture(k.TEXTURE_2D,a.__webglTexture)};this.setRenderTarget=function(a){var b=a instanceof THREE.WebGLRenderTargetCube;if(a&&!a.__webglFramebuffer){void 0===
a.depthBuffer&&(a.depthBuffer=!0);void 0===a.stencilBuffer&&(a.stencilBuffer=!0);a.__webglTexture=k.createTexture();var c=0===(a.width&a.width-1)&&0===(a.height&a.height-1),d=H(a.format),e=H(a.type);if(b){a.__webglFramebuffer=[];a.__webglRenderbuffer=[];k.bindTexture(k.TEXTURE_CUBE_MAP,a.__webglTexture);P(k.TEXTURE_CUBE_MAP,a,c);for(var f=0;6>f;f++){a.__webglFramebuffer[f]=k.createFramebuffer();a.__webglRenderbuffer[f]=k.createRenderbuffer();k.texImage2D(k.TEXTURE_CUBE_MAP_POSITIVE_X+f,0,d,a.width,
a.height,0,d,e,null);var g=a,h=k.TEXTURE_CUBE_MAP_POSITIVE_X+f;k.bindFramebuffer(k.FRAMEBUFFER,a.__webglFramebuffer[f]);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,h,g.__webglTexture,0);B(a.__webglRenderbuffer[f],a)}c&&k.generateMipmap(k.TEXTURE_CUBE_MAP)}else a.__webglFramebuffer=k.createFramebuffer(),a.__webglRenderbuffer=k.createRenderbuffer(),k.bindTexture(k.TEXTURE_2D,a.__webglTexture),P(k.TEXTURE_2D,a,c),k.texImage2D(k.TEXTURE_2D,0,d,a.width,a.height,0,d,e,null),d=k.TEXTURE_2D,
k.bindFramebuffer(k.FRAMEBUFFER,a.__webglFramebuffer),k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,d,a.__webglTexture,0),B(a.__webglRenderbuffer,a),c&&k.generateMipmap(k.TEXTURE_2D);b?k.bindTexture(k.TEXTURE_CUBE_MAP,null):k.bindTexture(k.TEXTURE_2D,null);k.bindRenderbuffer(k.RENDERBUFFER,null);k.bindFramebuffer(k.FRAMEBUFFER,null)}a?(b=b?a.__webglFramebuffer[a.activeCubeFace]:a.__webglFramebuffer,c=a.width,a=a.height,e=d=0):(b=null,c=kb,a=Oa,d=Sa,e=Ka);b!==ca&&(k.bindFramebuffer(k.FRAMEBUFFER,
b),k.viewport(d,e,c,a),ca=b);lb=c;ab=a};this.shadowMapPlugin=new THREE.ShadowMapPlugin;this.addPrePlugin(this.shadowMapPlugin);this.addPostPlugin(new THREE.SpritePlugin);this.addPostPlugin(new THREE.LensFlarePlugin)};
THREE.WebGLRenderTarget=function(a,b,c){this.width=a;this.height=b;c=c||{};this.wrapS=void 0!==c.wrapS?c.wrapS:THREE.ClampToEdgeWrapping;this.wrapT=void 0!==c.wrapT?c.wrapT:THREE.ClampToEdgeWrapping;this.magFilter=void 0!==c.magFilter?c.magFilter:THREE.LinearFilter;this.minFilter=void 0!==c.minFilter?c.minFilter:THREE.LinearMipMapLinearFilter;this.anisotropy=void 0!==c.anisotropy?c.anisotropy:1;this.offset=new THREE.Vector2(0,0);this.repeat=new THREE.Vector2(1,1);this.format=void 0!==c.format?c.format:
THREE.RGBAFormat;this.type=void 0!==c.type?c.type:THREE.UnsignedByteType;this.depthBuffer=void 0!==c.depthBuffer?c.depthBuffer:!0;this.stencilBuffer=void 0!==c.stencilBuffer?c.stencilBuffer:!0;this.generateMipmaps=!0};
THREE.WebGLRenderTarget.prototype.clone=function(){var a=new THREE.WebGLRenderTarget(this.width,this.height);a.wrapS=this.wrapS;a.wrapT=this.wrapT;a.magFilter=this.magFilter;a.anisotropy=this.anisotropy;a.minFilter=this.minFilter;a.offset.copy(this.offset);a.repeat.copy(this.repeat);a.format=this.format;a.type=this.type;a.depthBuffer=this.depthBuffer;a.stencilBuffer=this.stencilBuffer;a.generateMipmaps=this.generateMipmaps;return a};
THREE.WebGLRenderTargetCube=function(a,b,c){THREE.WebGLRenderTarget.call(this,a,b,c);this.activeCubeFace=0};THREE.WebGLRenderTargetCube.prototype=Object.create(THREE.WebGLRenderTarget.prototype);THREE.RenderableVertex=function(){this.positionWorld=new THREE.Vector3;this.positionScreen=new THREE.Vector4;this.visible=!0};THREE.RenderableVertex.prototype.copy=function(a){this.positionWorld.copy(a.positionWorld);this.positionScreen.copy(a.positionScreen)};
THREE.RenderableFace3=function(){this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.v3=new THREE.RenderableVertex;this.centroidWorld=new THREE.Vector3;this.centroidScreen=new THREE.Vector3;this.normalWorld=new THREE.Vector3;this.vertexNormalsWorld=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];this.vertexNormalsLength=0;this.material=this.color=null;this.uvs=[[]];this.z=null};
THREE.RenderableFace4=function(){this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.v3=new THREE.RenderableVertex;this.v4=new THREE.RenderableVertex;this.centroidWorld=new THREE.Vector3;this.centroidScreen=new THREE.Vector3;this.normalWorld=new THREE.Vector3;this.vertexNormalsWorld=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3,new THREE.Vector3];this.vertexNormalsLength=0;this.material=this.color=null;this.uvs=[[]];this.z=null};
THREE.RenderableObject=function(){this.z=this.object=null};THREE.RenderableParticle=function(){this.rotation=this.z=this.y=this.x=this.object=null;this.scale=new THREE.Vector2;this.material=null};THREE.RenderableLine=function(){this.z=null;this.v1=new THREE.RenderableVertex;this.v2=new THREE.RenderableVertex;this.material=null};
THREE.ColorUtils={adjustHSV:function(a,b,c,d){var e=THREE.ColorUtils.__hsv;a.getHSV(e);e.h=THREE.Math.clamp(e.h+b,0,1);e.s=THREE.Math.clamp(e.s+c,0,1);e.v=THREE.Math.clamp(e.v+d,0,1);a.setHSV(e.h,e.s,e.v)}};THREE.ColorUtils.__hsv={h:0,s:0,v:0};
THREE.GeometryUtils={merge:function(a,b){var c,d,e=a.vertices.length,f=b instanceof THREE.Mesh?b.geometry:b,g=a.vertices,h=f.vertices,i=a.faces,j=f.faces,l=a.faceVertexUvs[0],f=f.faceVertexUvs[0];b instanceof THREE.Mesh&&(b.matrixAutoUpdate&&b.updateMatrix(),c=b.matrix,d=new THREE.Matrix4,d.extractRotation(c,b.scale));for(var m=0,n=h.length;m<n;m++){var p=h[m].clone();c&&c.multiplyVector3(p);g.push(p)}m=0;for(n=j.length;m<n;m++){var p=j[m],o,s,t=p.vertexNormals,r=p.vertexColors;p instanceof THREE.Face3?
o=new THREE.Face3(p.a+e,p.b+e,p.c+e):p instanceof THREE.Face4&&(o=new THREE.Face4(p.a+e,p.b+e,p.c+e,p.d+e));o.normal.copy(p.normal);d&&d.multiplyVector3(o.normal);g=0;for(h=t.length;g<h;g++)s=t[g].clone(),d&&d.multiplyVector3(s),o.vertexNormals.push(s);o.color.copy(p.color);g=0;for(h=r.length;g<h;g++)s=r[g],o.vertexColors.push(s.clone());o.materialIndex=p.materialIndex;o.centroid.copy(p.centroid);c&&c.multiplyVector3(o.centroid);i.push(o)}m=0;for(n=f.length;m<n;m++){c=f[m];d=[];g=0;for(h=c.length;g<
h;g++)d.push(new THREE.UV(c[g].u,c[g].v));l.push(d)}},removeMaterials:function(a,b){for(var c={},d=0,e=b.length;d<e;d++)c[b[d]]=!0;for(var f,g=[],d=0,e=a.faces.length;d<e;d++)f=a.faces[d],f.materialIndex in c||g.push(f);a.faces=g},randomPointInTriangle:function(a,b,c){var d,e,f,g=new THREE.Vector3,h=THREE.GeometryUtils.__v1;d=THREE.GeometryUtils.random();e=THREE.GeometryUtils.random();1<d+e&&(d=1-d,e=1-e);f=1-d-e;g.copy(a);g.multiplyScalar(d);h.copy(b);h.multiplyScalar(e);g.addSelf(h);h.copy(c);h.multiplyScalar(f);
g.addSelf(h);return g},randomPointInFace:function(a,b,c){var d,e,f;if(a instanceof THREE.Face3)return d=b.vertices[a.a],e=b.vertices[a.b],f=b.vertices[a.c],THREE.GeometryUtils.randomPointInTriangle(d,e,f);if(a instanceof THREE.Face4){d=b.vertices[a.a];e=b.vertices[a.b];f=b.vertices[a.c];var b=b.vertices[a.d],g;c?a._area1&&a._area2?(c=a._area1,g=a._area2):(c=THREE.GeometryUtils.triangleArea(d,e,b),g=THREE.GeometryUtils.triangleArea(e,f,b),a._area1=c,a._area2=g):(c=THREE.GeometryUtils.triangleArea(d,
e,b),g=THREE.GeometryUtils.triangleArea(e,f,b));return THREE.GeometryUtils.random()*(c+g)<c?THREE.GeometryUtils.randomPointInTriangle(d,e,b):THREE.GeometryUtils.randomPointInTriangle(e,f,b)}},randomPointsInGeometry:function(a,b){function c(a){function b(c,d){if(d<c)return c;var e=c+Math.floor((d-c)/2);return j[e]>a?b(c,e-1):j[e]<a?b(e+1,d):e}return b(0,j.length-1)}var d,e,f=a.faces,g=a.vertices,h=f.length,i=0,j=[],l,m,n,p;for(e=0;e<h;e++)d=f[e],d instanceof THREE.Face3?(l=g[d.a],m=g[d.b],n=g[d.c],
d._area=THREE.GeometryUtils.triangleArea(l,m,n)):d instanceof THREE.Face4&&(l=g[d.a],m=g[d.b],n=g[d.c],p=g[d.d],d._area1=THREE.GeometryUtils.triangleArea(l,m,p),d._area2=THREE.GeometryUtils.triangleArea(m,n,p),d._area=d._area1+d._area2),i+=d._area,j[e]=i;d=[];for(e=0;e<b;e++)g=THREE.GeometryUtils.random()*i,g=c(g),d[e]=THREE.GeometryUtils.randomPointInFace(f[g],a,!0);return d},triangleArea:function(a,b,c){var d,e=THREE.GeometryUtils.__v1;e.sub(a,b);d=e.length();e.sub(a,c);a=e.length();e.sub(b,c);
c=e.length();b=0.5*(d+a+c);return Math.sqrt(b*(b-d)*(b-a)*(b-c))},center:function(a){a.computeBoundingBox();var b=a.boundingBox,c=new THREE.Vector3;c.add(b.min,b.max);c.multiplyScalar(-0.5);a.applyMatrix((new THREE.Matrix4).makeTranslation(c.x,c.y,c.z));a.computeBoundingBox();return c},normalizeUVs:function(a){for(var a=a.faceVertexUvs[0],b=0,c=a.length;b<c;b++)for(var d=a[b],e=0,f=d.length;e<f;e++)if(1!==d[e].u&&(d[e].u-=Math.floor(d[e].u)),1!==d[e].v)d[e].v-=Math.floor(d[e].v)},triangulateQuads:function(a){var b,
c,d,e,f=[],g=[],h=[];b=0;for(c=a.faceUvs.length;b<c;b++)g[b]=[];b=0;for(c=a.faceVertexUvs.length;b<c;b++)h[b]=[];b=0;for(c=a.faces.length;b<c;b++)if(d=a.faces[b],d instanceof THREE.Face4){e=d.a;var i=d.b,j=d.c,l=d.d,m=new THREE.Face3,n=new THREE.Face3;m.color.copy(d.color);n.color.copy(d.color);m.materialIndex=d.materialIndex;n.materialIndex=d.materialIndex;m.a=e;m.b=i;m.c=l;n.a=i;n.b=j;n.c=l;4===d.vertexColors.length&&(m.vertexColors[0]=d.vertexColors[0].clone(),m.vertexColors[1]=d.vertexColors[1].clone(),
m.vertexColors[2]=d.vertexColors[3].clone(),n.vertexColors[0]=d.vertexColors[1].clone(),n.vertexColors[1]=d.vertexColors[2].clone(),n.vertexColors[2]=d.vertexColors[3].clone());f.push(m,n);d=0;for(e=a.faceVertexUvs.length;d<e;d++)a.faceVertexUvs[d].length&&(m=a.faceVertexUvs[d][b],i=m[1],j=m[2],l=m[3],m=[m[0].clone(),i.clone(),l.clone()],i=[i.clone(),j.clone(),l.clone()],h[d].push(m,i));d=0;for(e=a.faceUvs.length;d<e;d++)a.faceUvs[d].length&&(i=a.faceUvs[d][b],g[d].push(i,i))}else{f.push(d);d=0;for(e=
a.faceUvs.length;d<e;d++)g[d].push(a.faceUvs[d][b]);d=0;for(e=a.faceVertexUvs.length;d<e;d++)h[d].push(a.faceVertexUvs[d][b])}a.faces=f;a.faceUvs=g;a.faceVertexUvs=h;a.computeCentroids();a.computeFaceNormals();a.computeVertexNormals();a.hasTangents&&a.computeTangents()},explode:function(a){for(var b=[],c=0,d=a.faces.length;c<d;c++){var e=b.length,f=a.faces[c];if(f instanceof THREE.Face4){var g=f.a,h=f.b,i=f.c,g=a.vertices[g],h=a.vertices[h],i=a.vertices[i],j=a.vertices[f.d];b.push(g.clone());b.push(h.clone());
b.push(i.clone());b.push(j.clone());f.a=e;f.b=e+1;f.c=e+2;f.d=e+3}else g=f.a,h=f.b,i=f.c,g=a.vertices[g],h=a.vertices[h],i=a.vertices[i],b.push(g.clone()),b.push(h.clone()),b.push(i.clone()),f.a=e,f.b=e+1,f.c=e+2}a.vertices=b;delete a.__tmpVertices},tessellate:function(a,b){var c,d,e,f,g,h,i,j,l,m,n,p,o,s,t,r,z,w,q,E=[],A=[];c=0;for(d=a.faceVertexUvs.length;c<d;c++)A[c]=[];c=0;for(d=a.faces.length;c<d;c++)if(e=a.faces[c],e instanceof THREE.Face3)if(f=e.a,g=e.b,h=e.c,j=a.vertices[f],l=a.vertices[g],
m=a.vertices[h],p=j.distanceTo(l),o=l.distanceTo(m),n=j.distanceTo(m),p>b||o>b||n>b){i=a.vertices.length;w=e.clone();q=e.clone();p>=o&&p>=n?(j=j.clone(),j.lerpSelf(l,0.5),w.a=f,w.b=i,w.c=h,q.a=i,q.b=g,q.c=h,3===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),f.lerpSelf(e.vertexNormals[1],0.5),w.vertexNormals[1].copy(f),q.vertexNormals[0].copy(f)),3===e.vertexColors.length&&(f=e.vertexColors[0].clone(),f.lerpSelf(e.vertexColors[1],0.5),w.vertexColors[1].copy(f),q.vertexColors[0].copy(f)),e=0):
o>=p&&o>=n?(j=l.clone(),j.lerpSelf(m,0.5),w.a=f,w.b=g,w.c=i,q.a=i,q.b=h,q.c=f,3===e.vertexNormals.length&&(f=e.vertexNormals[1].clone(),f.lerpSelf(e.vertexNormals[2],0.5),w.vertexNormals[2].copy(f),q.vertexNormals[0].copy(f),q.vertexNormals[1].copy(e.vertexNormals[2]),q.vertexNormals[2].copy(e.vertexNormals[0])),3===e.vertexColors.length&&(f=e.vertexColors[1].clone(),f.lerpSelf(e.vertexColors[2],0.5),w.vertexColors[2].copy(f),q.vertexColors[0].copy(f),q.vertexColors[1].copy(e.vertexColors[2]),q.vertexColors[2].copy(e.vertexColors[0])),
e=1):(j=j.clone(),j.lerpSelf(m,0.5),w.a=f,w.b=g,w.c=i,q.a=i,q.b=g,q.c=h,3===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),f.lerpSelf(e.vertexNormals[2],0.5),w.vertexNormals[2].copy(f),q.vertexNormals[0].copy(f)),3===e.vertexColors.length&&(f=e.vertexColors[0].clone(),f.lerpSelf(e.vertexColors[2],0.5),w.vertexColors[2].copy(f),q.vertexColors[0].copy(f)),e=2);E.push(w,q);a.vertices.push(j);f=0;for(g=a.faceVertexUvs.length;f<g;f++)a.faceVertexUvs[f].length&&(j=a.faceVertexUvs[f][c],q=j[0],h=
j[1],w=j[2],0===e?(l=q.clone(),l.lerpSelf(h,0.5),j=[q.clone(),l.clone(),w.clone()],h=[l.clone(),h.clone(),w.clone()]):1===e?(l=h.clone(),l.lerpSelf(w,0.5),j=[q.clone(),h.clone(),l.clone()],h=[l.clone(),w.clone(),q.clone()]):(l=q.clone(),l.lerpSelf(w,0.5),j=[q.clone(),h.clone(),l.clone()],h=[l.clone(),h.clone(),w.clone()]),A[f].push(j,h))}else{E.push(e);f=0;for(g=a.faceVertexUvs.length;f<g;f++)A[f].push(a.faceVertexUvs[f][c])}else if(f=e.a,g=e.b,h=e.c,i=e.d,j=a.vertices[f],l=a.vertices[g],m=a.vertices[h],
n=a.vertices[i],p=j.distanceTo(l),o=l.distanceTo(m),s=m.distanceTo(n),t=j.distanceTo(n),p>b||o>b||s>b||t>b){r=a.vertices.length;z=a.vertices.length+1;w=e.clone();q=e.clone();p>=o&&p>=s&&p>=t||s>=o&&s>=p&&s>=t?(p=j.clone(),p.lerpSelf(l,0.5),l=m.clone(),l.lerpSelf(n,0.5),w.a=f,w.b=r,w.c=z,w.d=i,q.a=r,q.b=g,q.c=h,q.d=z,4===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),f.lerpSelf(e.vertexNormals[1],0.5),g=e.vertexNormals[2].clone(),g.lerpSelf(e.vertexNormals[3],0.5),w.vertexNormals[1].copy(f),
w.vertexNormals[2].copy(g),q.vertexNormals[0].copy(f),q.vertexNormals[3].copy(g)),4===e.vertexColors.length&&(f=e.vertexColors[0].clone(),f.lerpSelf(e.vertexColors[1],0.5),g=e.vertexColors[2].clone(),g.lerpSelf(e.vertexColors[3],0.5),w.vertexColors[1].copy(f),w.vertexColors[2].copy(g),q.vertexColors[0].copy(f),q.vertexColors[3].copy(g)),e=0):(p=l.clone(),p.lerpSelf(m,0.5),l=n.clone(),l.lerpSelf(j,0.5),w.a=f,w.b=g,w.c=r,w.d=z,q.a=z,q.b=r,q.c=h,q.d=i,4===e.vertexNormals.length&&(f=e.vertexNormals[1].clone(),
f.lerpSelf(e.vertexNormals[2],0.5),g=e.vertexNormals[3].clone(),g.lerpSelf(e.vertexNormals[0],0.5),w.vertexNormals[2].copy(f),w.vertexNormals[3].copy(g),q.vertexNormals[0].copy(g),q.vertexNormals[1].copy(f)),4===e.vertexColors.length&&(f=e.vertexColors[1].clone(),f.lerpSelf(e.vertexColors[2],0.5),g=e.vertexColors[3].clone(),g.lerpSelf(e.vertexColors[0],0.5),w.vertexColors[2].copy(f),w.vertexColors[3].copy(g),q.vertexColors[0].copy(g),q.vertexColors[1].copy(f)),e=1);E.push(w,q);a.vertices.push(p,l);
f=0;for(g=a.faceVertexUvs.length;f<g;f++)a.faceVertexUvs[f].length&&(j=a.faceVertexUvs[f][c],q=j[0],h=j[1],w=j[2],j=j[3],0===e?(l=q.clone(),l.lerpSelf(h,0.5),m=w.clone(),m.lerpSelf(j,0.5),q=[q.clone(),l.clone(),m.clone(),j.clone()],h=[l.clone(),h.clone(),w.clone(),m.clone()]):(l=h.clone(),l.lerpSelf(w,0.5),m=j.clone(),m.lerpSelf(q,0.5),q=[q.clone(),h.clone(),l.clone(),m.clone()],h=[m.clone(),l.clone(),w.clone(),j.clone()]),A[f].push(q,h))}else{E.push(e);f=0;for(g=a.faceVertexUvs.length;f<g;f++)A[f].push(a.faceVertexUvs[f][c])}a.faces=
E;a.faceVertexUvs=A}};THREE.GeometryUtils.random=THREE.Math.random16;THREE.GeometryUtils.__v1=new THREE.Vector3;
THREE.ImageUtils={crossOrigin:"anonymous",loadTexture:function(a,b,c,d){var e=new Image,f=new THREE.Texture(e,b),b=new THREE.ImageLoader;b.addEventListener("load",function(a){f.image=a.content;f.needsUpdate=!0;c&&c(f)});b.addEventListener("error",function(a){d&&d(a.message)});b.crossOrigin=this.crossOrigin;b.load(a,e);f.sourceFile=a;return f},loadCompressedTexture:function(a,b,c,d){var e=new THREE.CompressedTexture;e.mapping=b;var f=new XMLHttpRequest;f.onload=function(){var a=THREE.ImageUtils.parseDDS(f.response,
!0);e.format=a.format;e.mipmaps=a.mipmaps;e.image.width=a.width;e.image.height=a.height;e.generateMipmaps=!1;e.needsUpdate=!0;c&&c(e)};f.onerror=d;f.open("GET",a,!0);f.responseType="arraybuffer";f.send(null);return e},loadTextureCube:function(a,b,c,d){var e=[];e.loadCount=0;var f=new THREE.Texture;f.image=e;void 0!==b&&(f.mapping=b);f.flipY=!1;for(var b=0,g=a.length;b<g;++b){var h=new Image;e[b]=h;h.onload=function(){e.loadCount=e.loadCount+1;if(e.loadCount===6){f.needsUpdate=true;c&&c()}};h.onerror=
d;h.crossOrigin=this.crossOrigin;h.src=a[b]}return f},loadCompressedTextureCube:function(a,b,c,d){var e=[];e.loadCount=0;var f=new THREE.CompressedTexture;f.image=e;void 0!==b&&(f.mapping=b);f.flipY=!1;f.generateMipmaps=!1;for(var b=function(a,b){return function(){var d=THREE.ImageUtils.parseDDS(a.response,true);b.format=d.format;b.mipmaps=d.mipmaps;b.width=d.width;b.height=d.height;e.loadCount=e.loadCount+1;if(e.loadCount===6){f.format=d.format;f.needsUpdate=true;c&&c()}}},g=0,h=a.length;g<h;++g){var i=
{};e[g]=i;var j=new XMLHttpRequest;j.onload=b(j,i);j.onerror=d;j.open("GET",a[g],!0);j.responseType="arraybuffer";j.send(null)}return f},parseDDS:function(a,b){function c(a){return a.charCodeAt(0)+(a.charCodeAt(1)<<8)+(a.charCodeAt(2)<<16)+(a.charCodeAt(3)<<24)}var d={mipmaps:[],width:0,height:0,format:null,mipmapCount:1},e=c("DXT1"),f=c("DXT3"),g=c("DXT5"),h=new Int32Array(a,0,31);if(542327876!==h[0])return console.error("ImageUtils.parseDDS(): Invalid magic number in DDS header"),d;if(!h[20]&4)return console.error("ImageUtils.parseDDS(): Unsupported format, must contain a FourCC code"),
d;var i=h[21];switch(i){case e:e=8;d.format=THREE.RGB_S3TC_DXT1_Format;break;case f:e=16;d.format=THREE.RGBA_S3TC_DXT3_Format;break;case g:e=16;d.format=THREE.RGBA_S3TC_DXT5_Format;break;default:return console.error("ImageUtils.parseDDS(): Unsupported FourCC code: ",String.fromCharCode(i&255,i>>8&255,i>>16&255,i>>24&255)),d}d.mipmapCount=1;h[2]&131072&&!1!==b&&(d.mipmapCount=Math.max(1,h[7]));d.width=h[4];d.height=h[3];h=h[1]+4;f=d.width;g=d.height;for(i=0;i<d.mipmapCount;i++){var j=Math.max(4,f)/
4*Math.max(4,g)/4*e,l={data:new Uint8Array(a,h,j),width:f,height:g};d.mipmaps.push(l);h+=j;f=Math.max(0.5*f,1);g=Math.max(0.5*g,1)}return d},getNormalMap:function(a,b){var c=function(a){var b=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);return[a[0]/b,a[1]/b,a[2]/b]},b=b|1,d=a.width,e=a.height,f=document.createElement("canvas");f.width=d;f.height=e;var g=f.getContext("2d");g.drawImage(a,0,0);for(var h=g.getImageData(0,0,d,e).data,i=g.createImageData(d,e),j=i.data,l=0;l<d;l++)for(var m=0;m<e;m++){var n=
0>m-1?0:m-1,p=m+1>e-1?e-1:m+1,o=0>l-1?0:l-1,s=l+1>d-1?d-1:l+1,t=[],r=[0,0,h[4*(m*d+l)]/255*b];t.push([-1,0,h[4*(m*d+o)]/255*b]);t.push([-1,-1,h[4*(n*d+o)]/255*b]);t.push([0,-1,h[4*(n*d+l)]/255*b]);t.push([1,-1,h[4*(n*d+s)]/255*b]);t.push([1,0,h[4*(m*d+s)]/255*b]);t.push([1,1,h[4*(p*d+s)]/255*b]);t.push([0,1,h[4*(p*d+l)]/255*b]);t.push([-1,1,h[4*(p*d+o)]/255*b]);n=[];o=t.length;for(p=0;p<o;p++){var s=t[p],z=t[(p+1)%o],s=[s[0]-r[0],s[1]-r[1],s[2]-r[2]],z=[z[0]-r[0],z[1]-r[1],z[2]-r[2]];n.push(c([s[1]*
z[2]-s[2]*z[1],s[2]*z[0]-s[0]*z[2],s[0]*z[1]-s[1]*z[0]]))}t=[0,0,0];for(p=0;p<n.length;p++)t[0]+=n[p][0],t[1]+=n[p][1],t[2]+=n[p][2];t[0]/=n.length;t[1]/=n.length;t[2]/=n.length;r=4*(m*d+l);j[r]=255*((t[0]+1)/2)|0;j[r+1]=255*((t[1]+1)/2)|0;j[r+2]=255*t[2]|0;j[r+3]=255}g.putImageData(i,0,0);return f},generateDataTexture:function(a,b,c){for(var d=a*b,e=new Uint8Array(3*d),f=Math.floor(255*c.r),g=Math.floor(255*c.g),c=Math.floor(255*c.b),h=0;h<d;h++)e[3*h]=f,e[3*h+1]=g,e[3*h+2]=c;a=new THREE.DataTexture(e,
a,b,THREE.RGBFormat);a.needsUpdate=!0;return a}};THREE.SceneUtils={createMultiMaterialObject:function(a,b){for(var c=new THREE.Object3D,d=0,e=b.length;d<e;d++)c.add(new THREE.Mesh(a,b[d]));return c},detach:function(a,b,c){a.applyMatrix(b.matrixWorld);b.remove(a);c.add(a)},attach:function(a,b,c){var d=new THREE.Matrix4;d.getInverse(c.matrixWorld);a.applyMatrix(d);b.remove(a);c.add(a)}};
THREE.ShaderUtils={lib:{fresnel:{uniforms:{mRefractionRatio:{type:"f",value:1.02},mFresnelBias:{type:"f",value:0.1},mFresnelPower:{type:"f",value:2},mFresnelScale:{type:"f",value:1},tCube:{type:"t",value:null}},fragmentShader:"uniform samplerCube tCube;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\nvec4 refractedColor = vec4( 1.0 );\nrefractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;\nrefractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;\nrefractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;\ngl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );\n}",
vertexShader:"uniform float mRefractionRatio;\nuniform float mFresnelBias;\nuniform float mFresnelScale;\nuniform float mFresnelPower;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\nvec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );\nvec3 I = worldPosition.xyz - cameraPosition;\nvReflect = reflect( I, worldNormal );\nvRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );\nvRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );\nvRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );\nvReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );\ngl_Position = projectionMatrix * mvPosition;\n}"},
normal:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{enableAO:{type:"i",value:0},enableDiffuse:{type:"i",value:0},enableSpecular:{type:"i",value:0},enableReflection:{type:"i",value:0},enableDisplacement:{type:"i",value:0},tDisplacement:{type:"t",value:null},tDiffuse:{type:"t",value:null},tCube:{type:"t",value:null},tNormal:{type:"t",value:null},tSpecular:{type:"t",value:null},tAO:{type:"t",value:null},uNormalScale:{type:"v2",value:new THREE.Vector2(1,
1)},uDisplacementBias:{type:"f",value:0},uDisplacementScale:{type:"f",value:1},uDiffuseColor:{type:"c",value:new THREE.Color(16777215)},uSpecularColor:{type:"c",value:new THREE.Color(1118481)},uAmbientColor:{type:"c",value:new THREE.Color(16777215)},uShininess:{type:"f",value:30},uOpacity:{type:"f",value:1},useRefract:{type:"i",value:0},uRefractionRatio:{type:"f",value:0.98},uReflectivity:{type:"f",value:0.5},uOffset:{type:"v2",value:new THREE.Vector2(0,0)},uRepeat:{type:"v2",value:new THREE.Vector2(1,
1)},wrapRGB:{type:"v3",value:new THREE.Vector3(1,1,1)}}]),fragmentShader:["uniform vec3 uAmbientColor;\nuniform vec3 uDiffuseColor;\nuniform vec3 uSpecularColor;\nuniform float uShininess;\nuniform float uOpacity;\nuniform bool enableDiffuse;\nuniform bool enableSpecular;\nuniform bool enableAO;\nuniform bool enableReflection;\nuniform sampler2D tDiffuse;\nuniform sampler2D tNormal;\nuniform sampler2D tSpecular;\nuniform sampler2D tAO;\nuniform samplerCube tCube;\nuniform vec2 uNormalScale;\nuniform bool useRefract;\nuniform float uRefractionRatio;\nuniform float uReflectivity;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nuniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_HEMI_LIGHTS > 0\nuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\nuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n#endif\n#if MAX_SPOT_LIGHTS > 0\nuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\nuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\nuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\nuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\nuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif\nvarying vec3 vWorldPosition;\nvarying vec3 vViewPosition;",
THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,"void main() {\ngl_FragColor = vec4( vec3( 1.0 ), uOpacity );\nvec3 specularTex = vec3( 1.0 );\nvec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;\nnormalTex.xy *= uNormalScale;\nnormalTex = normalize( normalTex );\nif( enableDiffuse ) {\n#ifdef GAMMA_INPUT\nvec4 texelColor = texture2D( tDiffuse, vUv );\ntexelColor.xyz *= texelColor.xyz;\ngl_FragColor = gl_FragColor * texelColor;\n#else\ngl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );\n#endif\n}\nif( enableAO ) {\n#ifdef GAMMA_INPUT\nvec4 aoColor = texture2D( tAO, vUv );\naoColor.xyz *= aoColor.xyz;\ngl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;\n#endif\n}\nif( enableSpecular )\nspecularTex = texture2D( tSpecular, vUv ).xyz;\nmat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );\nvec3 finalNormal = tsb * normalTex;\n#ifdef FLIP_SIDED\nfinalNormal = -finalNormal;\n#endif\nvec3 normal = normalize( finalNormal );\nvec3 viewPosition = normalize( vViewPosition );\n#if MAX_POINT_LIGHTS > 0\nvec3 pointDiffuse = vec3( 0.0 );\nvec3 pointSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 pointVector = lPosition.xyz + vViewPosition.xyz;\nfloat pointDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\npointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );\npointVector = normalize( pointVector );\n#ifdef WRAP_AROUND\nfloat pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );\nfloat pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );\nvec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n#else\nfloat pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );\n#endif\npointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;\nvec3 pointHalfVector = normalize( pointVector + viewPosition );\nfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\nfloat pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );\npointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;\n#else\npointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;\n#endif\n}\n#endif\n#if MAX_SPOT_LIGHTS > 0\nvec3 spotDiffuse = vec3( 0.0 );\nvec3 spotSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\nvec3 spotVector = lPosition.xyz + vViewPosition.xyz;\nfloat spotDistance = 1.0;\nif ( spotLightDistance[ i ] > 0.0 )\nspotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );\nspotVector = normalize( spotVector );\nfloat spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );\nif ( spotEffect > spotLightAngleCos[ i ] ) {\nspotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );\n#ifdef WRAP_AROUND\nfloat spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );\nfloat spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );\nvec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );\n#else\nfloat spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );\n#endif\nspotDiffuse += spotDistance * spotLightColor[ i ] * uDiffuseColor * spotDiffuseWeight * spotEffect;\nvec3 spotHalfVector = normalize( spotVector + viewPosition );\nfloat spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );\nfloat spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( spotVector, spotHalfVector ), 5.0 );\nspotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;\n#else\nspotSpecular += spotDistance * spotLightColor[ i ] * uSpecularColor * spotSpecularWeight * spotDiffuseWeight * spotEffect;\n#endif\n}\n}\n#endif\n#if MAX_DIR_LIGHTS > 0\nvec3 dirDiffuse = vec3( 0.0 );\nvec3 dirSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\n#ifdef WRAP_AROUND\nfloat directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );\nfloat directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );\nvec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );\n#else\nfloat dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );\n#endif\ndirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;\nvec3 dirHalfVector = normalize( dirVector + viewPosition );\nfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\nfloat dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );\ndirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n#else\ndirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;\n#endif\n}\n#endif\n#if MAX_HEMI_LIGHTS > 0\nvec3 hemiDiffuse  = vec3( 0.0 );\nvec3 hemiSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );\nvec3 lVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( normal, lVector );\nfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\nvec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\nhemiDiffuse += uDiffuseColor * hemiColor;\nvec3 hemiHalfVectorSky = normalize( lVector + viewPosition );\nfloat hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;\nfloat hemiSpecularWeightSky = specularTex.r * max( pow( hemiDotNormalHalfSky, uShininess ), 0.0 );\nvec3 lVectorGround = -lVector;\nvec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );\nfloat hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;\nfloat hemiSpecularWeightGround = specularTex.r * max( pow( hemiDotNormalHalfGround, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat dotProductGround = dot( normal, lVectorGround );\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlickSky = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );\nvec3 schlickGround = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );\nhemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );\n#else\nhemiSpecular += uSpecularColor * hemiColor * ( hemiSpecularWeightSky + hemiSpecularWeightGround ) * hemiDiffuseWeight;\n#endif\n}\n#endif\nvec3 totalDiffuse = vec3( 0.0 );\nvec3 totalSpecular = vec3( 0.0 );\n#if MAX_DIR_LIGHTS > 0\ntotalDiffuse += dirDiffuse;\ntotalSpecular += dirSpecular;\n#endif\n#if MAX_HEMI_LIGHTS > 0\ntotalDiffuse += hemiDiffuse;\ntotalSpecular += hemiSpecular;\n#endif\n#if MAX_POINT_LIGHTS > 0\ntotalDiffuse += pointDiffuse;\ntotalSpecular += pointSpecular;\n#endif\n#if MAX_SPOT_LIGHTS > 0\ntotalDiffuse += spotDiffuse;\ntotalSpecular += spotSpecular;\n#endif\n#ifdef METAL\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor + totalSpecular );\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor ) + totalSpecular;\n#endif\nif ( enableReflection ) {\nvec3 vReflect;\nvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\nif ( useRefract ) {\nvReflect = refract( cameraToVertex, normal, uRefractionRatio );\n} else {\nvReflect = reflect( cameraToVertex, normal );\n}\nvec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\n#ifdef GAMMA_INPUT\ncubeColor.xyz *= cubeColor.xyz;\n#endif\ngl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );\n}",
THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n"),vertexShader:["attribute vec4 tangent;\nuniform vec2 uOffset;\nuniform vec2 uRepeat;\nuniform bool enableDisplacement;\n#ifdef VERTEX_TEXTURES\nuniform sampler2D tDisplacement;\nuniform float uDisplacementScale;\nuniform float uDisplacementBias;\n#endif\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec3 vWorldPosition;\nvarying vec3 vViewPosition;",
THREE.ShaderChunk.skinning_pars_vertex,THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {",THREE.ShaderChunk.skinbase_vertex,THREE.ShaderChunk.skinnormal_vertex,"#ifdef USE_SKINNING\nvNormal = normalize( normalMatrix * skinnedNormal.xyz );\nvec4 skinnedTangent = skinMatrix * vec4( tangent.xyz, 0.0 );\nvTangent = normalize( normalMatrix * skinnedTangent.xyz );\n#else\nvNormal = normalize( normalMatrix * normal );\nvTangent = normalize( normalMatrix * tangent.xyz );\n#endif\nvBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );\nvUv = uv * uRepeat + uOffset;\nvec3 displacedPosition;\n#ifdef VERTEX_TEXTURES\nif ( enableDisplacement ) {\nvec3 dv = texture2D( tDisplacement, uv ).xyz;\nfloat df = uDisplacementScale * dv.x + uDisplacementBias;\ndisplacedPosition = position + normalize( normal ) * df;\n} else {\n#ifdef USE_SKINNING\nvec4 skinVertex = vec4( position, 1.0 );\nvec4 skinned  = boneMatX * skinVertex * skinWeight.x;\nskinned \t  += boneMatY * skinVertex * skinWeight.y;\ndisplacedPosition  = skinned.xyz;\n#else\ndisplacedPosition = position;\n#endif\n}\n#else\n#ifdef USE_SKINNING\nvec4 skinVertex = vec4( position, 1.0 );\nvec4 skinned  = boneMatX * skinVertex * skinWeight.x;\nskinned \t  += boneMatY * skinVertex * skinWeight.y;\ndisplacedPosition  = skinned.xyz;\n#else\ndisplacedPosition = position;\n#endif\n#endif\nvec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );\nvec4 worldPosition = modelMatrix * vec4( displacedPosition, 1.0 );\ngl_Position = projectionMatrix * mvPosition;\nvWorldPosition = worldPosition.xyz;\nvViewPosition = -mvPosition.xyz;\n#ifdef USE_SHADOWMAP\nfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\nvShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n}\n#endif\n}"].join("\n")},
cube:{uniforms:{tCube:{type:"t",value:null},tFlip:{type:"f",value:-1}},vertexShader:"varying vec3 vWorldPosition;\nvoid main() {\nvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\nvWorldPosition = worldPosition.xyz;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",fragmentShader:"uniform samplerCube tCube;\nuniform float tFlip;\nvarying vec3 vWorldPosition;\nvoid main() {\ngl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );\n}"}}};
THREE.FontUtils={faces:{},face:"helvetiker",weight:"normal",style:"normal",size:150,divisions:10,getFace:function(){return this.faces[this.face][this.weight][this.style]},loadFace:function(a){var b=a.familyName.toLowerCase();this.faces[b]=this.faces[b]||{};this.faces[b][a.cssFontWeight]=this.faces[b][a.cssFontWeight]||{};this.faces[b][a.cssFontWeight][a.cssFontStyle]=a;return this.faces[b][a.cssFontWeight][a.cssFontStyle]=a},drawText:function(a){for(var b=this.getFace(),c=this.size/b.resolution,d=
0,e=String(a).split(""),f=e.length,g=[],a=0;a<f;a++){var h=new THREE.Path,h=this.extractGlyphPoints(e[a],b,c,d,h),d=d+h.offset;g.push(h.path)}return{paths:g,offset:d/2}},extractGlyphPoints:function(a,b,c,d,e){var f=[],g,h,i,j,l,m,n,p,o,s,t,r=b.glyphs[a]||b.glyphs["?"];if(r){if(r.o){b=r._cachedOutline||(r._cachedOutline=r.o.split(" "));j=b.length;for(a=0;a<j;)switch(i=b[a++],i){case "m":i=b[a++]*c+d;l=b[a++]*c;e.moveTo(i,l);break;case "l":i=b[a++]*c+d;l=b[a++]*c;e.lineTo(i,l);break;case "q":i=b[a++]*
c+d;l=b[a++]*c;p=b[a++]*c+d;o=b[a++]*c;e.quadraticCurveTo(p,o,i,l);if(g=f[f.length-1]){m=g.x;n=g.y;g=1;for(h=this.divisions;g<=h;g++){var z=g/h;THREE.Shape.Utils.b2(z,m,p,i);THREE.Shape.Utils.b2(z,n,o,l)}}break;case "b":if(i=b[a++]*c+d,l=b[a++]*c,p=b[a++]*c+d,o=b[a++]*-c,s=b[a++]*c+d,t=b[a++]*-c,e.bezierCurveTo(i,l,p,o,s,t),g=f[f.length-1]){m=g.x;n=g.y;g=1;for(h=this.divisions;g<=h;g++)z=g/h,THREE.Shape.Utils.b3(z,m,p,s,i),THREE.Shape.Utils.b3(z,n,o,t,l)}}}return{offset:r.ha*c,path:e}}}};
THREE.FontUtils.generateShapes=function(a,b){var b=b||{},c=void 0!==b.curveSegments?b.curveSegments:4,d=void 0!==b.font?b.font:"helvetiker",e=void 0!==b.weight?b.weight:"normal",f=void 0!==b.style?b.style:"normal";THREE.FontUtils.size=void 0!==b.size?b.size:100;THREE.FontUtils.divisions=c;THREE.FontUtils.face=d;THREE.FontUtils.weight=e;THREE.FontUtils.style=f;c=THREE.FontUtils.drawText(a).paths;d=[];e=0;for(f=c.length;e<f;e++)Array.prototype.push.apply(d,c[e].toShapes());return d};
(function(a){var b=function(a){for(var b=a.length,e=0,f=b-1,g=0;g<b;f=g++)e+=a[f].x*a[g].y-a[g].x*a[f].y;return 0.5*e};a.Triangulate=function(a,d){var e=a.length;if(3>e)return null;var f=[],g=[],h=[],i,j,l;if(0<b(a))for(j=0;j<e;j++)g[j]=j;else for(j=0;j<e;j++)g[j]=e-1-j;var m=2*e;for(j=e-1;2<e;){if(0>=m--){console.log("Warning, unable to triangulate polygon!");break}i=j;e<=i&&(i=0);j=i+1;e<=j&&(j=0);l=j+1;e<=l&&(l=0);var n;a:{n=a;var p=i,o=j,s=l,t=e,r=g,z=void 0,w=void 0,q=void 0,E=void 0,A=void 0,
v=void 0,u=void 0,D=void 0,C=void 0,w=n[r[p]].x,q=n[r[p]].y,E=n[r[o]].x,A=n[r[o]].y,v=n[r[s]].x,u=n[r[s]].y;if(1E-10>(E-w)*(u-q)-(A-q)*(v-w))n=!1;else{for(z=0;z<t;z++)if(!(z==p||z==o||z==s)){var D=n[r[z]].x,C=n[r[z]].y,G=void 0,P=void 0,B=void 0,K=void 0,H=void 0,I=void 0,N=void 0,O=void 0,R=void 0,ga=void 0,M=void 0,J=void 0,G=B=H=void 0,G=v-E,P=u-A,B=w-v,K=q-u,H=E-w,I=A-q,N=D-w,O=C-q,R=D-E,ga=C-A,M=D-v,J=C-u,G=G*ga-P*R,H=H*O-I*N,B=B*J-K*M;if(0<=G&&0<=B&&0<=H){n=!1;break a}}n=!0}}if(n){f.push([a[g[i]],
a[g[j]],a[g[l]]]);h.push([g[i],g[j],g[l]]);i=j;for(l=j+1;l<e;i++,l++)g[i]=g[l];e--;m=2*e}}return d?h:f};a.Triangulate.area=b;return a})(THREE.FontUtils);self._typeface_js={faces:THREE.FontUtils.faces,loadFace:THREE.FontUtils.loadFace};THREE.Curve=function(){};THREE.Curve.prototype.getPoint=function(){console.log("Warning, getPoint() not implemented!");return null};THREE.Curve.prototype.getPointAt=function(a){a=this.getUtoTmapping(a);return this.getPoint(a)};
THREE.Curve.prototype.getPoints=function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPoint(b/a));return c};THREE.Curve.prototype.getSpacedPoints=function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPointAt(b/a));return c};THREE.Curve.prototype.getLength=function(){var a=this.getLengths();return a[a.length-1]};
THREE.Curve.prototype.getLengths=function(a){a||(a=this.__arcLengthDivisions?this.__arcLengthDivisions:200);if(this.cacheArcLengths&&this.cacheArcLengths.length==a+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;var b=[],c,d=this.getPoint(0),e,f=0;b.push(0);for(e=1;e<=a;e++)c=this.getPoint(e/a),f+=c.distanceTo(d),b.push(f),d=c;return this.cacheArcLengths=b};THREE.Curve.prototype.updateArcLengths=function(){this.needsUpdate=!0;this.getLengths()};
THREE.Curve.prototype.getUtoTmapping=function(a,b){var c=this.getLengths(),d=0,e=c.length,f;f=b?b:a*c[e-1];for(var g=0,h=e-1,i;g<=h;)if(d=Math.floor(g+(h-g)/2),i=c[d]-f,0>i)g=d+1;else if(0<i)h=d-1;else{h=d;break}d=h;if(c[d]==f)return d/(e-1);g=c[d];return c=(d+(f-g)/(c[d+1]-g))/(e-1)};THREE.Curve.prototype.getNormalVector=function(a){a=this.getTangent(a);return new THREE.Vector2(-a.y,a.x)};
THREE.Curve.prototype.getTangent=function(a){var b=a-1E-4,a=a+1E-4;0>b&&(b=0);1<a&&(a=1);b=this.getPoint(b);return this.getPoint(a).clone().subSelf(b).normalize()};THREE.Curve.prototype.getTangentAt=function(a){a=this.getUtoTmapping(a);return this.getTangent(a)};THREE.LineCurve=function(a,b){this.v1=a;this.v2=b};THREE.LineCurve.prototype=Object.create(THREE.Curve.prototype);THREE.LineCurve.prototype.getPoint=function(a){var b=this.v2.clone().subSelf(this.v1);b.multiplyScalar(a).addSelf(this.v1);return b};
THREE.LineCurve.prototype.getPointAt=function(a){return this.getPoint(a)};THREE.LineCurve.prototype.getTangent=function(){return this.v2.clone().subSelf(this.v1).normalize()};THREE.QuadraticBezierCurve=function(a,b,c){this.v0=a;this.v1=b;this.v2=c};THREE.QuadraticBezierCurve.prototype=Object.create(THREE.Curve.prototype);
THREE.QuadraticBezierCurve.prototype.getPoint=function(a){var b;b=THREE.Shape.Utils.b2(a,this.v0.x,this.v1.x,this.v2.x);a=THREE.Shape.Utils.b2(a,this.v0.y,this.v1.y,this.v2.y);return new THREE.Vector2(b,a)};THREE.QuadraticBezierCurve.prototype.getTangent=function(a){var b;b=THREE.Curve.Utils.tangentQuadraticBezier(a,this.v0.x,this.v1.x,this.v2.x);a=THREE.Curve.Utils.tangentQuadraticBezier(a,this.v0.y,this.v1.y,this.v2.y);b=new THREE.Vector2(b,a);b.normalize();return b};
THREE.CubicBezierCurve=function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d};THREE.CubicBezierCurve.prototype=Object.create(THREE.Curve.prototype);THREE.CubicBezierCurve.prototype.getPoint=function(a){var b;b=THREE.Shape.Utils.b3(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);a=THREE.Shape.Utils.b3(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);return new THREE.Vector2(b,a)};
THREE.CubicBezierCurve.prototype.getTangent=function(a){var b;b=THREE.Curve.Utils.tangentCubicBezier(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);a=THREE.Curve.Utils.tangentCubicBezier(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);b=new THREE.Vector2(b,a);b.normalize();return b};THREE.SplineCurve=function(a){this.points=void 0==a?[]:a};THREE.SplineCurve.prototype=Object.create(THREE.Curve.prototype);
THREE.SplineCurve.prototype.getPoint=function(a){var b=new THREE.Vector2,c=[],d=this.points,e;e=(d.length-1)*a;a=Math.floor(e);e-=a;c[0]=0==a?a:a-1;c[1]=a;c[2]=a>d.length-2?d.length-1:a+1;c[3]=a>d.length-3?d.length-1:a+2;b.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,e);b.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,e);return b};
THREE.EllipseCurve=function(a,b,c,d,e,f,g){this.aX=a;this.aY=b;this.xRadius=c;this.yRadius=d;this.aStartAngle=e;this.aEndAngle=f;this.aClockwise=g};THREE.EllipseCurve.prototype=Object.create(THREE.Curve.prototype);THREE.EllipseCurve.prototype.getPoint=function(a){var b=this.aEndAngle-this.aStartAngle;this.aClockwise||(a=1-a);b=this.aStartAngle+a*b;a=this.aX+this.xRadius*Math.cos(b);b=this.aY+this.yRadius*Math.sin(b);return new THREE.Vector2(a,b)};
THREE.ArcCurve=function(a,b,c,d,e,f){THREE.EllipseCurve.call(this,a,b,c,c,d,e,f)};THREE.ArcCurve.prototype=Object.create(THREE.EllipseCurve.prototype);
THREE.Curve.Utils={tangentQuadraticBezier:function(a,b,c,d){return 2*(1-a)*(c-b)+2*a*(d-c)},tangentCubicBezier:function(a,b,c,d,e){return-3*b*(1-a)*(1-a)+3*c*(1-a)*(1-a)-6*a*c*(1-a)+6*a*d*(1-a)-3*a*a*d+3*a*a*e},tangentSpline:function(a){return 6*a*a-6*a+(3*a*a-4*a+1)+(-6*a*a+6*a)+(3*a*a-2*a)},interpolate:function(a,b,c,d,e){var a=0.5*(c-a),d=0.5*(d-b),f=e*e;return(2*b-2*c+a+d)*e*f+(-3*b+3*c-2*a-d)*f+a*e+b}};
THREE.Curve.create=function(a,b){a.prototype=Object.create(THREE.Curve.prototype);a.prototype.getPoint=b;return a};THREE.LineCurve3=THREE.Curve.create(function(a,b){this.v1=a;this.v2=b},function(a){var b=new THREE.Vector3;b.sub(this.v2,this.v1);b.multiplyScalar(a);b.addSelf(this.v1);return b});
THREE.QuadraticBezierCurve3=THREE.Curve.create(function(a,b,c){this.v0=a;this.v1=b;this.v2=c},function(a){var b,c;b=THREE.Shape.Utils.b2(a,this.v0.x,this.v1.x,this.v2.x);c=THREE.Shape.Utils.b2(a,this.v0.y,this.v1.y,this.v2.y);a=THREE.Shape.Utils.b2(a,this.v0.z,this.v1.z,this.v2.z);return new THREE.Vector3(b,c,a)});
THREE.CubicBezierCurve3=THREE.Curve.create(function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d},function(a){var b,c;b=THREE.Shape.Utils.b3(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);c=THREE.Shape.Utils.b3(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);a=THREE.Shape.Utils.b3(a,this.v0.z,this.v1.z,this.v2.z,this.v3.z);return new THREE.Vector3(b,c,a)});
THREE.SplineCurve3=THREE.Curve.create(function(a){this.points=void 0==a?[]:a},function(a){var b=new THREE.Vector3,c=[],d=this.points,e,a=(d.length-1)*a;e=Math.floor(a);a-=e;c[0]=0==e?e:e-1;c[1]=e;c[2]=e>d.length-2?d.length-1:e+1;c[3]=e>d.length-3?d.length-1:e+2;e=d[c[0]];var f=d[c[1]],g=d[c[2]],c=d[c[3]];b.x=THREE.Curve.Utils.interpolate(e.x,f.x,g.x,c.x,a);b.y=THREE.Curve.Utils.interpolate(e.y,f.y,g.y,c.y,a);b.z=THREE.Curve.Utils.interpolate(e.z,f.z,g.z,c.z,a);return b});
THREE.ClosedSplineCurve3=THREE.Curve.create(function(a){this.points=void 0==a?[]:a},function(a){var b=new THREE.Vector3,c=[],d=this.points,e;e=(d.length-0)*a;a=Math.floor(e);e-=a;a+=0<a?0:(Math.floor(Math.abs(a)/d.length)+1)*d.length;c[0]=(a-1)%d.length;c[1]=a%d.length;c[2]=(a+1)%d.length;c[3]=(a+2)%d.length;b.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,e);b.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,e);b.z=THREE.Curve.Utils.interpolate(d[c[0]].z,
d[c[1]].z,d[c[2]].z,d[c[3]].z,e);return b});THREE.CurvePath=function(){this.curves=[];this.bends=[];this.autoClose=!1};THREE.CurvePath.prototype=Object.create(THREE.Curve.prototype);THREE.CurvePath.prototype.add=function(a){this.curves.push(a)};THREE.CurvePath.prototype.checkConnection=function(){};THREE.CurvePath.prototype.closePath=function(){var a=this.curves[0].getPoint(0),b=this.curves[this.curves.length-1].getPoint(1);a.equals(b)||this.curves.push(new THREE.LineCurve(b,a))};
THREE.CurvePath.prototype.getPoint=function(a){for(var b=a*this.getLength(),c=this.getCurveLengths(),a=0;a<c.length;){if(c[a]>=b)return b=c[a]-b,a=this.curves[a],b=1-b/a.getLength(),a.getPointAt(b);a++}return null};THREE.CurvePath.prototype.getLength=function(){var a=this.getCurveLengths();return a[a.length-1]};
THREE.CurvePath.prototype.getCurveLengths=function(){if(this.cacheLengths&&this.cacheLengths.length==this.curves.length)return this.cacheLengths;var a=[],b=0,c,d=this.curves.length;for(c=0;c<d;c++)b+=this.curves[c].getLength(),a.push(b);return this.cacheLengths=a};
THREE.CurvePath.prototype.getBoundingBox=function(){var a=this.getPoints(),b,c,d,e,f,g;b=c=Number.NEGATIVE_INFINITY;e=f=Number.POSITIVE_INFINITY;var h,i,j,l,m=a[0]instanceof THREE.Vector3;l=m?new THREE.Vector3:new THREE.Vector2;i=0;for(j=a.length;i<j;i++)h=a[i],h.x>b?b=h.x:h.x<e&&(e=h.x),h.y>c?c=h.y:h.y<f&&(f=h.y),m&&(h.z>d?d=h.z:h.z<g&&(g=h.z)),l.addSelf(h);a={minX:e,minY:f,maxX:b,maxY:c,centroid:l.divideScalar(j)};m&&(a.maxZ=d,a.minZ=g);return a};
THREE.CurvePath.prototype.createPointsGeometry=function(a){a=this.getPoints(a,!0);return this.createGeometry(a)};THREE.CurvePath.prototype.createSpacedPointsGeometry=function(a){a=this.getSpacedPoints(a,!0);return this.createGeometry(a)};THREE.CurvePath.prototype.createGeometry=function(a){for(var b=new THREE.Geometry,c=0;c<a.length;c++)b.vertices.push(new THREE.Vector3(a[c].x,a[c].y,a[c].z||0));return b};THREE.CurvePath.prototype.addWrapPath=function(a){this.bends.push(a)};
THREE.CurvePath.prototype.getTransformedPoints=function(a,b){var c=this.getPoints(a),d,e;b||(b=this.bends);d=0;for(e=b.length;d<e;d++)c=this.getWrapPoints(c,b[d]);return c};THREE.CurvePath.prototype.getTransformedSpacedPoints=function(a,b){var c=this.getSpacedPoints(a),d,e;b||(b=this.bends);d=0;for(e=b.length;d<e;d++)c=this.getWrapPoints(c,b[d]);return c};
THREE.CurvePath.prototype.getWrapPoints=function(a,b){var c=this.getBoundingBox(),d,e,f,g,h,i;d=0;for(e=a.length;d<e;d++)f=a[d],g=f.x,h=f.y,i=g/c.maxX,i=b.getUtoTmapping(i,g),g=b.getPoint(i),h=b.getNormalVector(i).multiplyScalar(h),f.x=g.x+h.x,f.y=g.y+h.y;return a};THREE.Gyroscope=function(){THREE.Object3D.call(this)};THREE.Gyroscope.prototype=Object.create(THREE.Object3D.prototype);
THREE.Gyroscope.prototype.updateMatrixWorld=function(a){this.matrixAutoUpdate&&this.updateMatrix();if(this.matrixWorldNeedsUpdate||a)this.parent?(this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix),this.matrixWorld.decompose(this.translationWorld,this.rotationWorld,this.scaleWorld),this.matrix.decompose(this.translationObject,this.rotationObject,this.scaleObject),this.matrixWorld.compose(this.translationWorld,this.rotationObject,this.scaleWorld)):this.matrixWorld.copy(this.matrix),this.matrixWorldNeedsUpdate=
!1,a=!0;for(var b=0,c=this.children.length;b<c;b++)this.children[b].updateMatrixWorld(a)};THREE.Gyroscope.prototype.translationWorld=new THREE.Vector3;THREE.Gyroscope.prototype.translationObject=new THREE.Vector3;THREE.Gyroscope.prototype.rotationWorld=new THREE.Quaternion;THREE.Gyroscope.prototype.rotationObject=new THREE.Quaternion;THREE.Gyroscope.prototype.scaleWorld=new THREE.Vector3;THREE.Gyroscope.prototype.scaleObject=new THREE.Vector3;
THREE.Path=function(a){THREE.CurvePath.call(this);this.actions=[];a&&this.fromPoints(a)};THREE.Path.prototype=Object.create(THREE.CurvePath.prototype);THREE.PathActions={MOVE_TO:"moveTo",LINE_TO:"lineTo",QUADRATIC_CURVE_TO:"quadraticCurveTo",BEZIER_CURVE_TO:"bezierCurveTo",CSPLINE_THRU:"splineThru",ARC:"arc",ELLIPSE:"ellipse"};THREE.Path.prototype.fromPoints=function(a){this.moveTo(a[0].x,a[0].y);for(var b=1,c=a.length;b<c;b++)this.lineTo(a[b].x,a[b].y)};
THREE.Path.prototype.moveTo=function(a,b){var c=Array.prototype.slice.call(arguments);this.actions.push({action:THREE.PathActions.MOVE_TO,args:c})};THREE.Path.prototype.lineTo=function(a,b){var c=Array.prototype.slice.call(arguments),d=this.actions[this.actions.length-1].args,d=new THREE.LineCurve(new THREE.Vector2(d[d.length-2],d[d.length-1]),new THREE.Vector2(a,b));this.curves.push(d);this.actions.push({action:THREE.PathActions.LINE_TO,args:c})};
THREE.Path.prototype.quadraticCurveTo=function(a,b,c,d){var e=Array.prototype.slice.call(arguments),f=this.actions[this.actions.length-1].args,f=new THREE.QuadraticBezierCurve(new THREE.Vector2(f[f.length-2],f[f.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d));this.curves.push(f);this.actions.push({action:THREE.PathActions.QUADRATIC_CURVE_TO,args:e})};
THREE.Path.prototype.bezierCurveTo=function(a,b,c,d,e,f){var g=Array.prototype.slice.call(arguments),h=this.actions[this.actions.length-1].args,h=new THREE.CubicBezierCurve(new THREE.Vector2(h[h.length-2],h[h.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d),new THREE.Vector2(e,f));this.curves.push(h);this.actions.push({action:THREE.PathActions.BEZIER_CURVE_TO,args:g})};
THREE.Path.prototype.splineThru=function(a){var b=Array.prototype.slice.call(arguments),c=this.actions[this.actions.length-1].args,c=[new THREE.Vector2(c[c.length-2],c[c.length-1])];Array.prototype.push.apply(c,a);c=new THREE.SplineCurve(c);this.curves.push(c);this.actions.push({action:THREE.PathActions.CSPLINE_THRU,args:b})};THREE.Path.prototype.arc=function(a,b,c,d,e,f){var g=this.actions[this.actions.length-1].args;this.absarc(a+g[g.length-2],b+g[g.length-1],c,d,e,f)};
THREE.Path.prototype.absarc=function(a,b,c,d,e,f){this.absellipse(a,b,c,c,d,e,f)};THREE.Path.prototype.ellipse=function(a,b,c,d,e,f,g){var h=this.actions[this.actions.length-1].args;this.absellipse(a+h[h.length-2],b+h[h.length-1],c,d,e,f,g)};THREE.Path.prototype.absellipse=function(a,b,c,d,e,f,g){var h=Array.prototype.slice.call(arguments),i=new THREE.EllipseCurve(a,b,c,d,e,f,g);this.curves.push(i);i=i.getPoint(g?1:0);h.push(i.x);h.push(i.y);this.actions.push({action:THREE.PathActions.ELLIPSE,args:h})};
THREE.Path.prototype.getSpacedPoints=function(a){a||(a=40);for(var b=[],c=0;c<a;c++)b.push(this.getPoint(c/a));return b};
THREE.Path.prototype.getPoints=function(a,b){if(this.useSpacedPoints)return console.log("tata"),this.getSpacedPoints(a,b);var a=a||12,c=[],d,e,f,g,h,i,j,l,m,n,p,o,s;d=0;for(e=this.actions.length;d<e;d++)switch(f=this.actions[d],g=f.action,f=f.args,g){case THREE.PathActions.MOVE_TO:c.push(new THREE.Vector2(f[0],f[1]));break;case THREE.PathActions.LINE_TO:c.push(new THREE.Vector2(f[0],f[1]));break;case THREE.PathActions.QUADRATIC_CURVE_TO:h=f[2];i=f[3];m=f[0];n=f[1];0<c.length?(g=c[c.length-1],p=g.x,
o=g.y):(g=this.actions[d-1].args,p=g[g.length-2],o=g[g.length-1]);for(f=1;f<=a;f++)s=f/a,g=THREE.Shape.Utils.b2(s,p,m,h),s=THREE.Shape.Utils.b2(s,o,n,i),c.push(new THREE.Vector2(g,s));break;case THREE.PathActions.BEZIER_CURVE_TO:h=f[4];i=f[5];m=f[0];n=f[1];j=f[2];l=f[3];0<c.length?(g=c[c.length-1],p=g.x,o=g.y):(g=this.actions[d-1].args,p=g[g.length-2],o=g[g.length-1]);for(f=1;f<=a;f++)s=f/a,g=THREE.Shape.Utils.b3(s,p,m,j,h),s=THREE.Shape.Utils.b3(s,o,n,l,i),c.push(new THREE.Vector2(g,s));break;case THREE.PathActions.CSPLINE_THRU:g=
this.actions[d-1].args;s=[new THREE.Vector2(g[g.length-2],g[g.length-1])];g=a*f[0].length;s=s.concat(f[0]);s=new THREE.SplineCurve(s);for(f=1;f<=g;f++)c.push(s.getPointAt(f/g));break;case THREE.PathActions.ARC:h=f[0];i=f[1];n=f[2];j=f[3];g=f[4];m=!!f[5];p=g-j;o=2*a;for(f=1;f<=o;f++)s=f/o,m||(s=1-s),s=j+s*p,g=h+n*Math.cos(s),s=i+n*Math.sin(s),c.push(new THREE.Vector2(g,s));break;case THREE.PathActions.ELLIPSE:h=f[0];i=f[1];n=f[2];l=f[3];j=f[4];g=f[5];m=!!f[6];p=g-j;o=2*a;for(f=1;f<=o;f++)s=f/o,m||
(s=1-s),s=j+s*p,g=h+n*Math.cos(s),s=i+l*Math.sin(s),c.push(new THREE.Vector2(g,s))}d=c[c.length-1];1E-10>Math.abs(d.x-c[0].x)&&1E-10>Math.abs(d.y-c[0].y)&&c.splice(c.length-1,1);b&&c.push(c[0]);return c};
THREE.Path.prototype.toShapes=function(){var a,b,c,d,e=[],f=new THREE.Path;a=0;for(b=this.actions.length;a<b;a++)c=this.actions[a],d=c.args,c=c.action,c==THREE.PathActions.MOVE_TO&&0!=f.actions.length&&(e.push(f),f=new THREE.Path),f[c].apply(f,d);0!=f.actions.length&&e.push(f);if(0==e.length)return[];var g;d=[];a=!THREE.Shape.Utils.isClockWise(e[0].getPoints());if(1==e.length)return f=e[0],g=new THREE.Shape,g.actions=f.actions,g.curves=f.curves,d.push(g),d;if(a){g=new THREE.Shape;a=0;for(b=e.length;a<
b;a++)f=e[a],THREE.Shape.Utils.isClockWise(f.getPoints())?(g.actions=f.actions,g.curves=f.curves,d.push(g),g=new THREE.Shape):g.holes.push(f)}else{a=0;for(b=e.length;a<b;a++)f=e[a],THREE.Shape.Utils.isClockWise(f.getPoints())?(g&&d.push(g),g=new THREE.Shape,g.actions=f.actions,g.curves=f.curves):g.holes.push(f);d.push(g)}return d};THREE.Shape=function(){THREE.Path.apply(this,arguments);this.holes=[]};THREE.Shape.prototype=Object.create(THREE.Path.prototype);
THREE.Shape.prototype.extrude=function(a){return new THREE.ExtrudeGeometry(this,a)};THREE.Shape.prototype.makeGeometry=function(a){return new THREE.ShapeGeometry(this,a)};THREE.Shape.prototype.getPointsHoles=function(a){var b,c=this.holes.length,d=[];for(b=0;b<c;b++)d[b]=this.holes[b].getTransformedPoints(a,this.bends);return d};THREE.Shape.prototype.getSpacedPointsHoles=function(a){var b,c=this.holes.length,d=[];for(b=0;b<c;b++)d[b]=this.holes[b].getTransformedSpacedPoints(a,this.bends);return d};
THREE.Shape.prototype.extractAllPoints=function(a){return{shape:this.getTransformedPoints(a),holes:this.getPointsHoles(a)}};THREE.Shape.prototype.extractPoints=function(a){return this.useSpacedPoints?this.extractAllSpacedPoints(a):this.extractAllPoints(a)};THREE.Shape.prototype.extractAllSpacedPoints=function(a){return{shape:this.getTransformedSpacedPoints(a),holes:this.getSpacedPointsHoles(a)}};
THREE.Shape.Utils={removeHoles:function(a,b){var c=a.concat(),d=c.concat(),e,f,g,h,i,j,l,m,n,p,o=[];for(i=0;i<b.length;i++){j=b[i];Array.prototype.push.apply(d,j);f=Number.POSITIVE_INFINITY;for(e=0;e<j.length;e++){n=j[e];p=[];for(m=0;m<c.length;m++)l=c[m],l=n.distanceToSquared(l),p.push(l),l<f&&(f=l,g=e,h=m)}e=0<=h-1?h-1:c.length-1;f=0<=g-1?g-1:j.length-1;var s=[j[g],c[h],c[e]];m=THREE.FontUtils.Triangulate.area(s);var t=[j[g],j[f],c[h]];n=THREE.FontUtils.Triangulate.area(t);p=h;l=g;h+=1;g+=-1;0>
h&&(h+=c.length);h%=c.length;0>g&&(g+=j.length);g%=j.length;e=0<=h-1?h-1:c.length-1;f=0<=g-1?g-1:j.length-1;s=[j[g],c[h],c[e]];s=THREE.FontUtils.Triangulate.area(s);t=[j[g],j[f],c[h]];t=THREE.FontUtils.Triangulate.area(t);m+n>s+t&&(h=p,g=l,0>h&&(h+=c.length),h%=c.length,0>g&&(g+=j.length),g%=j.length,e=0<=h-1?h-1:c.length-1,f=0<=g-1?g-1:j.length-1);m=c.slice(0,h);n=c.slice(h);p=j.slice(g);l=j.slice(0,g);f=[j[g],j[f],c[h]];o.push([j[g],c[h],c[e]]);o.push(f);c=m.concat(p).concat(l).concat(n)}return{shape:c,
isolatedPts:o,allpoints:d}},triangulateShape:function(a,b){var c=THREE.Shape.Utils.removeHoles(a,b),d=c.allpoints,e=c.isolatedPts,c=THREE.FontUtils.Triangulate(c.shape,!1),f,g,h,i,j={};f=0;for(g=d.length;f<g;f++)i=d[f].x+":"+d[f].y,void 0!==j[i]&&console.log("Duplicate point",i),j[i]=f;f=0;for(g=c.length;f<g;f++){h=c[f];for(d=0;3>d;d++)i=h[d].x+":"+h[d].y,i=j[i],void 0!==i&&(h[d]=i)}f=0;for(g=e.length;f<g;f++){h=e[f];for(d=0;3>d;d++)i=h[d].x+":"+h[d].y,i=j[i],void 0!==i&&(h[d]=i)}return c.concat(e)},
isClockWise:function(a){return 0>THREE.FontUtils.Triangulate.area(a)},b2p0:function(a,b){var c=1-a;return c*c*b},b2p1:function(a,b){return 2*(1-a)*a*b},b2p2:function(a,b){return a*a*b},b2:function(a,b,c,d){return this.b2p0(a,b)+this.b2p1(a,c)+this.b2p2(a,d)},b3p0:function(a,b){var c=1-a;return c*c*c*b},b3p1:function(a,b){var c=1-a;return 3*c*c*a*b},b3p2:function(a,b){return 3*(1-a)*a*a*b},b3p3:function(a,b){return a*a*a*b},b3:function(a,b,c,d,e){return this.b3p0(a,b)+this.b3p1(a,c)+this.b3p2(a,d)+
this.b3p3(a,e)}};
THREE.AnimationHandler=function(){var a=[],b={},c={update:function(b){for(var c=0;c<a.length;c++)a[c].update(b)},addToUpdate:function(b){-1===a.indexOf(b)&&a.push(b)},removeFromUpdate:function(b){b=a.indexOf(b);-1!==b&&a.splice(b,1)},add:function(a){void 0!==b[a.name]&&console.log("THREE.AnimationHandler.add: Warning! "+a.name+" already exists in library. Overwriting.");b[a.name]=a;if(!0!==a.initialized){for(var c=0;c<a.hierarchy.length;c++){for(var d=0;d<a.hierarchy[c].keys.length;d++)if(0>a.hierarchy[c].keys[d].time&&
(a.hierarchy[c].keys[d].time=0),void 0!==a.hierarchy[c].keys[d].rot&&!(a.hierarchy[c].keys[d].rot instanceof THREE.Quaternion)){var h=a.hierarchy[c].keys[d].rot;a.hierarchy[c].keys[d].rot=new THREE.Quaternion(h[0],h[1],h[2],h[3])}if(a.hierarchy[c].keys.length&&void 0!==a.hierarchy[c].keys[0].morphTargets){h={};for(d=0;d<a.hierarchy[c].keys.length;d++)for(var i=0;i<a.hierarchy[c].keys[d].morphTargets.length;i++){var j=a.hierarchy[c].keys[d].morphTargets[i];h[j]=-1}a.hierarchy[c].usedMorphTargets=h;
for(d=0;d<a.hierarchy[c].keys.length;d++){var l={};for(j in h){for(i=0;i<a.hierarchy[c].keys[d].morphTargets.length;i++)if(a.hierarchy[c].keys[d].morphTargets[i]===j){l[j]=a.hierarchy[c].keys[d].morphTargetsInfluences[i];break}i===a.hierarchy[c].keys[d].morphTargets.length&&(l[j]=0)}a.hierarchy[c].keys[d].morphTargetsInfluences=l}}for(d=1;d<a.hierarchy[c].keys.length;d++)a.hierarchy[c].keys[d].time===a.hierarchy[c].keys[d-1].time&&(a.hierarchy[c].keys.splice(d,1),d--);for(d=0;d<a.hierarchy[c].keys.length;d++)a.hierarchy[c].keys[d].index=
d}d=parseInt(a.length*a.fps,10);a.JIT={};a.JIT.hierarchy=[];for(c=0;c<a.hierarchy.length;c++)a.JIT.hierarchy.push(Array(d));a.initialized=!0}},get:function(a){if("string"===typeof a){if(b[a])return b[a];console.log("THREE.AnimationHandler.get: Couldn't find animation "+a);return null}},parse:function(a){var b=[];if(a instanceof THREE.SkinnedMesh)for(var c=0;c<a.bones.length;c++)b.push(a.bones[c]);else d(a,b);return b}},d=function(a,b){b.push(a);for(var c=0;c<a.children.length;c++)d(a.children[c],
b)};c.LINEAR=0;c.CATMULLROM=1;c.CATMULLROM_FORWARD=2;return c}();THREE.Animation=function(a,b,c){this.root=a;this.data=THREE.AnimationHandler.get(b);this.hierarchy=THREE.AnimationHandler.parse(a);this.currentTime=0;this.timeScale=1;this.isPlaying=!1;this.loop=this.isPaused=!0;this.interpolationType=void 0!==c?c:THREE.AnimationHandler.LINEAR;this.points=[];this.target=new THREE.Vector3};
THREE.Animation.prototype.play=function(a,b){if(!1===this.isPlaying){this.isPlaying=!0;this.loop=void 0!==a?a:!0;this.currentTime=void 0!==b?b:0;var c,d=this.hierarchy.length,e;for(c=0;c<d;c++){e=this.hierarchy[c];this.interpolationType!==THREE.AnimationHandler.CATMULLROM_FORWARD&&(e.useQuaternion=!0);e.matrixAutoUpdate=!0;void 0===e.animationCache&&(e.animationCache={},e.animationCache.prevKey={pos:0,rot:0,scl:0},e.animationCache.nextKey={pos:0,rot:0,scl:0},e.animationCache.originalMatrix=e instanceof
THREE.Bone?e.skinMatrix:e.matrix);var f=e.animationCache.prevKey;e=e.animationCache.nextKey;f.pos=this.data.hierarchy[c].keys[0];f.rot=this.data.hierarchy[c].keys[0];f.scl=this.data.hierarchy[c].keys[0];e.pos=this.getNextKeyWith("pos",c,1);e.rot=this.getNextKeyWith("rot",c,1);e.scl=this.getNextKeyWith("scl",c,1)}this.update(0)}this.isPaused=!1;THREE.AnimationHandler.addToUpdate(this)};
THREE.Animation.prototype.pause=function(){!0===this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};THREE.Animation.prototype.stop=function(){this.isPaused=this.isPlaying=!1;THREE.AnimationHandler.removeFromUpdate(this)};
THREE.Animation.prototype.update=function(a){if(!1!==this.isPlaying){var b=["pos","rot","scl"],c,d,e,f,g,h,i,j,l;l=this.currentTime+=a*this.timeScale;j=this.currentTime%=this.data.length;parseInt(Math.min(j*this.data.fps,this.data.length*this.data.fps),10);for(var m=0,n=this.hierarchy.length;m<n;m++){a=this.hierarchy[m];i=a.animationCache;for(var p=0;3>p;p++){c=b[p];g=i.prevKey[c];h=i.nextKey[c];if(h.time<=l){if(j<l)if(this.loop){g=this.data.hierarchy[m].keys[0];for(h=this.getNextKeyWith(c,m,1);h.time<
j;)g=h,h=this.getNextKeyWith(c,m,h.index+1)}else{this.stop();return}else{do g=h,h=this.getNextKeyWith(c,m,h.index+1);while(h.time<j)}i.prevKey[c]=g;i.nextKey[c]=h}a.matrixAutoUpdate=!0;a.matrixWorldNeedsUpdate=!0;d=(j-g.time)/(h.time-g.time);e=g[c];f=h[c];if(0>d||1<d)console.log("THREE.Animation.update: Warning! Scale out of bounds:"+d+" on bone "+m),d=0>d?0:1;if("pos"===c)if(c=a.position,this.interpolationType===THREE.AnimationHandler.LINEAR)c.x=e[0]+(f[0]-e[0])*d,c.y=e[1]+(f[1]-e[1])*d,c.z=e[2]+
(f[2]-e[2])*d;else{if(this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD)this.points[0]=this.getPrevKeyWith("pos",m,g.index-1).pos,this.points[1]=e,this.points[2]=f,this.points[3]=this.getNextKeyWith("pos",m,h.index+1).pos,d=0.33*d+0.33,e=this.interpolateCatmullRom(this.points,d),c.x=e[0],c.y=e[1],c.z=e[2],this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD&&(d=this.interpolateCatmullRom(this.points,1.01*d),
this.target.set(d[0],d[1],d[2]),this.target.subSelf(c),this.target.y=0,this.target.normalize(),d=Math.atan2(this.target.x,this.target.z),a.rotation.set(0,d,0))}else"rot"===c?THREE.Quaternion.slerp(e,f,a.quaternion,d):"scl"===c&&(c=a.scale,c.x=e[0]+(f[0]-e[0])*d,c.y=e[1]+(f[1]-e[1])*d,c.z=e[2]+(f[2]-e[2])*d)}}}};
THREE.Animation.prototype.interpolateCatmullRom=function(a,b){var c=[],d=[],e,f,g,h,i,j;e=(a.length-1)*b;f=Math.floor(e);e-=f;c[0]=0===f?f:f-1;c[1]=f;c[2]=f>a.length-2?f:f+1;c[3]=f>a.length-3?f:f+2;f=a[c[0]];h=a[c[1]];i=a[c[2]];j=a[c[3]];c=e*e;g=e*c;d[0]=this.interpolate(f[0],h[0],i[0],j[0],e,c,g);d[1]=this.interpolate(f[1],h[1],i[1],j[1],e,c,g);d[2]=this.interpolate(f[2],h[2],i[2],j[2],e,c,g);return d};
THREE.Animation.prototype.interpolate=function(a,b,c,d,e,f,g){a=0.5*(c-a);d=0.5*(d-b);return(2*(b-c)+a+d)*g+(-3*(b-c)-2*a-d)*f+a*e+b};THREE.Animation.prototype.getNextKeyWith=function(a,b,c){for(var d=this.data.hierarchy[b].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?c<d.length-1?c:d.length-1:c%d.length;c<d.length;c++)if(void 0!==d[c][a])return d[c];return this.data.hierarchy[b].keys[0]};
THREE.Animation.prototype.getPrevKeyWith=function(a,b,c){for(var d=this.data.hierarchy[b].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?0<c?c:0:0<=c?c:c+d.length;0<=c;c--)if(void 0!==d[c][a])return d[c];return this.data.hierarchy[b].keys[d.length-1]};
THREE.KeyFrameAnimation=function(a,b,c){this.root=a;this.data=THREE.AnimationHandler.get(b);this.hierarchy=THREE.AnimationHandler.parse(a);this.currentTime=0;this.timeScale=0.001;this.isPlaying=!1;this.loop=this.isPaused=!0;this.JITCompile=void 0!==c?c:!0;a=0;for(b=this.hierarchy.length;a<b;a++){var c=this.data.hierarchy[a].sids,d=this.hierarchy[a];if(this.data.hierarchy[a].keys.length&&c){for(var e=0;e<c.length;e++){var f=c[e],g=this.getNextKeyWith(f,a,0);g&&g.apply(f)}d.matrixAutoUpdate=!1;this.data.hierarchy[a].node.updateMatrix();
d.matrixWorldNeedsUpdate=!0}}};
THREE.KeyFrameAnimation.prototype.play=function(a,b){if(!this.isPlaying){this.isPlaying=!0;this.loop=void 0!==a?a:!0;this.currentTime=void 0!==b?b:0;this.startTimeMs=b;this.startTime=1E7;this.endTime=-this.startTime;var c,d=this.hierarchy.length,e,f;for(c=0;c<d;c++)if(e=this.hierarchy[c],f=this.data.hierarchy[c],e.useQuaternion=!0,void 0===f.animationCache&&(f.animationCache={},f.animationCache.prevKey=null,f.animationCache.nextKey=null,f.animationCache.originalMatrix=e instanceof THREE.Bone?e.skinMatrix:
e.matrix),e=this.data.hierarchy[c].keys,e.length)f.animationCache.prevKey=e[0],f.animationCache.nextKey=e[1],this.startTime=Math.min(e[0].time,this.startTime),this.endTime=Math.max(e[e.length-1].time,this.endTime);this.update(0)}this.isPaused=!1;THREE.AnimationHandler.addToUpdate(this)};THREE.KeyFrameAnimation.prototype.pause=function(){this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};
THREE.KeyFrameAnimation.prototype.stop=function(){this.isPaused=this.isPlaying=!1;THREE.AnimationHandler.removeFromUpdate(this);for(var a=0;a<this.data.hierarchy.length;a++){var b=this.hierarchy[a],c=this.data.hierarchy[a];if(void 0!==c.animationCache){var d=c.animationCache.originalMatrix;b instanceof THREE.Bone?(d.copy(b.skinMatrix),b.skinMatrix=d):(d.copy(b.matrix),b.matrix=d);delete c.animationCache}}};
THREE.KeyFrameAnimation.prototype.update=function(a){if(this.isPlaying){var b,c,d,e,f=this.data.JIT.hierarchy,g,h,i;h=this.currentTime+=a*this.timeScale;g=this.currentTime%=this.data.length;g<this.startTimeMs&&(g=this.currentTime=this.startTimeMs+g);e=parseInt(Math.min(g*this.data.fps,this.data.length*this.data.fps),10);if((i=g<h)&&!this.loop){for(var a=0,j=this.hierarchy.length;a<j;a++){var l=this.data.hierarchy[a].keys,f=this.data.hierarchy[a].sids;d=l.length-1;e=this.hierarchy[a];if(l.length){for(l=
0;l<f.length;l++)g=f[l],(h=this.getPrevKeyWith(g,a,d))&&h.apply(g);this.data.hierarchy[a].node.updateMatrix();e.matrixWorldNeedsUpdate=!0}}this.stop()}else if(!(g<this.startTime)){a=0;for(j=this.hierarchy.length;a<j;a++){d=this.hierarchy[a];b=this.data.hierarchy[a];var l=b.keys,m=b.animationCache;if(this.JITCompile&&void 0!==f[a][e])d instanceof THREE.Bone?(d.skinMatrix=f[a][e],d.matrixWorldNeedsUpdate=!1):(d.matrix=f[a][e],d.matrixWorldNeedsUpdate=!0);else if(l.length){this.JITCompile&&m&&(d instanceof
THREE.Bone?d.skinMatrix=m.originalMatrix:d.matrix=m.originalMatrix);b=m.prevKey;c=m.nextKey;if(b&&c){if(c.time<=h){if(i&&this.loop){b=l[0];for(c=l[1];c.time<g;)b=c,c=l[b.index+1]}else if(!i)for(var n=l.length-1;c.time<g&&c.index!==n;)b=c,c=l[b.index+1];m.prevKey=b;m.nextKey=c}c.time>=g?b.interpolate(c,g):b.interpolate(c,c.time)}this.data.hierarchy[a].node.updateMatrix();d.matrixWorldNeedsUpdate=!0}}if(this.JITCompile&&void 0===f[0][e]){this.hierarchy[0].updateMatrixWorld(!0);for(a=0;a<this.hierarchy.length;a++)f[a][e]=
this.hierarchy[a]instanceof THREE.Bone?this.hierarchy[a].skinMatrix.clone():this.hierarchy[a].matrix.clone()}}}};THREE.KeyFrameAnimation.prototype.getNextKeyWith=function(a,b,c){b=this.data.hierarchy[b].keys;for(c%=b.length;c<b.length;c++)if(b[c].hasTarget(a))return b[c];return b[0]};THREE.KeyFrameAnimation.prototype.getPrevKeyWith=function(a,b,c){b=this.data.hierarchy[b].keys;for(c=0<=c?c:c+b.length;0<=c;c--)if(b[c].hasTarget(a))return b[c];return b[b.length-1]};
THREE.CubeCamera=function(a,b,c){THREE.Object3D.call(this);var d=new THREE.PerspectiveCamera(90,1,a,b);d.up.set(0,-1,0);d.lookAt(new THREE.Vector3(1,0,0));this.add(d);var e=new THREE.PerspectiveCamera(90,1,a,b);e.up.set(0,-1,0);e.lookAt(new THREE.Vector3(-1,0,0));this.add(e);var f=new THREE.PerspectiveCamera(90,1,a,b);f.up.set(0,0,1);f.lookAt(new THREE.Vector3(0,1,0));this.add(f);var g=new THREE.PerspectiveCamera(90,1,a,b);g.up.set(0,0,-1);g.lookAt(new THREE.Vector3(0,-1,0));this.add(g);var h=new THREE.PerspectiveCamera(90,
1,a,b);h.up.set(0,-1,0);h.lookAt(new THREE.Vector3(0,0,1));this.add(h);var i=new THREE.PerspectiveCamera(90,1,a,b);i.up.set(0,-1,0);i.lookAt(new THREE.Vector3(0,0,-1));this.add(i);this.renderTarget=new THREE.WebGLRenderTargetCube(c,c,{format:THREE.RGBFormat,magFilter:THREE.LinearFilter,minFilter:THREE.LinearFilter});this.updateCubeMap=function(a,b){var c=this.renderTarget,n=c.generateMipmaps;c.generateMipmaps=!1;c.activeCubeFace=0;a.render(b,d,c);c.activeCubeFace=1;a.render(b,e,c);c.activeCubeFace=
2;a.render(b,f,c);c.activeCubeFace=3;a.render(b,g,c);c.activeCubeFace=4;a.render(b,h,c);c.generateMipmaps=n;c.activeCubeFace=5;a.render(b,i,c)}};THREE.CubeCamera.prototype=Object.create(THREE.Object3D.prototype);THREE.CombinedCamera=function(a,b,c,d,e,f,g){THREE.Camera.call(this);this.fov=c;this.left=-a/2;this.right=a/2;this.top=b/2;this.bottom=-b/2;this.cameraO=new THREE.OrthographicCamera(a/-2,a/2,b/2,b/-2,f,g);this.cameraP=new THREE.PerspectiveCamera(c,a/b,d,e);this.zoom=1;this.toPerspective()};
THREE.CombinedCamera.prototype=Object.create(THREE.Camera.prototype);THREE.CombinedCamera.prototype.toPerspective=function(){this.near=this.cameraP.near;this.far=this.cameraP.far;this.cameraP.fov=this.fov/this.zoom;this.cameraP.updateProjectionMatrix();this.projectionMatrix=this.cameraP.projectionMatrix;this.inPerspectiveMode=!0;this.inOrthographicMode=!1};
THREE.CombinedCamera.prototype.toOrthographic=function(){var a=this.cameraP.aspect,b=(this.cameraP.near+this.cameraP.far)/2,b=Math.tan(this.fov/2)*b,a=2*b*a/2,b=b/this.zoom,a=a/this.zoom;this.cameraO.left=-a;this.cameraO.right=a;this.cameraO.top=b;this.cameraO.bottom=-b;this.cameraO.updateProjectionMatrix();this.near=this.cameraO.near;this.far=this.cameraO.far;this.projectionMatrix=this.cameraO.projectionMatrix;this.inPerspectiveMode=!1;this.inOrthographicMode=!0};
THREE.CombinedCamera.prototype.setSize=function(a,b){this.cameraP.aspect=a/b;this.left=-a/2;this.right=a/2;this.top=b/2;this.bottom=-b/2};THREE.CombinedCamera.prototype.setFov=function(a){this.fov=a;this.inPerspectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.updateProjectionMatrix=function(){this.inPerspectiveMode?this.toPerspective():(this.toPerspective(),this.toOrthographic())};
THREE.CombinedCamera.prototype.setLens=function(a,b){void 0===b&&(b=24);var c=2*Math.atan(b/(2*a))*(180/Math.PI);this.setFov(c);return c};THREE.CombinedCamera.prototype.setZoom=function(a){this.zoom=a;this.inPerspectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.toFrontView=function(){this.rotation.x=0;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=!1};
THREE.CombinedCamera.prototype.toBackView=function(){this.rotation.x=0;this.rotation.y=Math.PI;this.rotation.z=0;this.rotationAutoUpdate=!1};THREE.CombinedCamera.prototype.toLeftView=function(){this.rotation.x=0;this.rotation.y=-Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=!1};THREE.CombinedCamera.prototype.toRightView=function(){this.rotation.x=0;this.rotation.y=Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=!1};
THREE.CombinedCamera.prototype.toTopView=function(){this.rotation.x=-Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=!1};THREE.CombinedCamera.prototype.toBottomView=function(){this.rotation.x=Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=!1};
THREE.AsteriskGeometry=function(a,b){THREE.Geometry.call(this);for(var c=0.707*a,d=0.707*b,c=[[a,0,0],[b,0,0],[-a,0,0],[-b,0,0],[0,a,0],[0,b,0],[0,-a,0],[0,-b,0],[0,0,a],[0,0,b],[0,0,-a],[0,0,-b],[c,c,0],[d,d,0],[-c,-c,0],[-d,-d,0],[c,-c,0],[d,-d,0],[-c,c,0],[-d,d,0],[c,0,c],[d,0,d],[-c,0,-c],[-d,0,-d],[c,0,-c],[d,0,-d],[-c,0,c],[-d,0,d],[0,c,c],[0,d,d],[0,-c,-c],[0,-d,-d],[0,c,-c],[0,d,-d],[0,-c,c],[0,-d,d]],d=0,e=c.length;d<e;d++)this.vertices.push(new THREE.Vector3(c[d][0],c[d][1],c[d][2]))};
THREE.AsteriskGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.CircleGeometry=function(a,b,c,d){THREE.Geometry.call(this);var a=a||50,c=void 0!==c?c:0,d=void 0!==d?d:2*Math.PI,b=void 0!==b?Math.max(3,b):8,e,f=[];e=new THREE.Vector3;var g=new THREE.UV(0.5,0.5);this.vertices.push(e);f.push(g);for(e=0;e<=b;e++){var h=new THREE.Vector3;h.x=a*Math.cos(c+e/b*d);h.y=a*Math.sin(c+e/b*d);this.vertices.push(h);f.push(new THREE.UV((h.x/a+1)/2,-(h.y/a+1)/2+1))}c=new THREE.Vector3(0,0,-1);for(e=1;e<=b;e++)this.faces.push(new THREE.Face3(e,e+1,0,[c,c,c])),this.faceVertexUvs[0].push([f[e],
f[e+1],g]);this.computeCentroids();this.computeFaceNormals();this.boundingSphere={radius:a}};THREE.CircleGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.CubeGeometry=function(a,b,c,d,e,f){function g(a,b,c,d,e,f,g,s){var t,r=h.widthSegments,z=h.heightSegments,w=e/2,q=f/2,E=h.vertices.length;if("x"===a&&"y"===b||"y"===a&&"x"===b)t="z";else if("x"===a&&"z"===b||"z"===a&&"x"===b)t="y",z=h.depthSegments;else if("z"===a&&"y"===b||"y"===a&&"z"===b)t="x",r=h.depthSegments;var A=r+1,v=z+1,u=e/r,D=f/z,C=new THREE.Vector3;C[t]=0<g?1:-1;for(e=0;e<v;e++)for(f=0;f<A;f++){var G=new THREE.Vector3;G[a]=(f*u-w)*c;G[b]=(e*D-q)*d;G[t]=g;h.vertices.push(G)}for(e=
0;e<z;e++)for(f=0;f<r;f++)a=new THREE.Face4(f+A*e+E,f+A*(e+1)+E,f+1+A*(e+1)+E,f+1+A*e+E),a.normal.copy(C),a.vertexNormals.push(C.clone(),C.clone(),C.clone(),C.clone()),a.materialIndex=s,h.faces.push(a),h.faceVertexUvs[0].push([new THREE.UV(f/r,1-e/z),new THREE.UV(f/r,1-(e+1)/z),new THREE.UV((f+1)/r,1-(e+1)/z),new THREE.UV((f+1)/r,1-e/z)])}THREE.Geometry.call(this);var h=this;this.width=a;this.height=b;this.depth=c;this.widthSegments=d||1;this.heightSegments=e||1;this.depthSegments=f||1;a=this.width/
2;b=this.height/2;c=this.depth/2;g("z","y",-1,-1,this.depth,this.height,a,0);g("z","y",1,-1,this.depth,this.height,-a,1);g("x","z",1,1,this.width,this.depth,b,2);g("x","z",1,-1,this.width,this.depth,-b,3);g("x","y",1,-1,this.width,this.height,c,4);g("x","y",-1,-1,this.width,this.height,-c,5);this.computeCentroids();this.mergeVertices()};THREE.CubeGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.CylinderGeometry=function(a,b,c,d,e,f){THREE.Geometry.call(this);var a=void 0!==a?a:20,b=void 0!==b?b:20,c=void 0!==c?c:100,g=c/2,d=d||8,e=e||1,h,i,j=[],l=[];for(i=0;i<=e;i++){var m=[],n=[],p=i/e,o=p*(b-a)+a;for(h=0;h<=d;h++){var s=h/d,t=new THREE.Vector3;t.x=o*Math.sin(2*s*Math.PI);t.y=-p*c+g;t.z=o*Math.cos(2*s*Math.PI);this.vertices.push(t);m.push(this.vertices.length-1);n.push(new THREE.UV(s,1-p))}j.push(m);l.push(n)}c=(b-a)/c;for(h=0;h<d;h++){0!==a?(m=this.vertices[j[0][h]].clone(),n=this.vertices[j[0][h+
1]].clone()):(m=this.vertices[j[1][h]].clone(),n=this.vertices[j[1][h+1]].clone());m.setY(Math.sqrt(m.x*m.x+m.z*m.z)*c).normalize();n.setY(Math.sqrt(n.x*n.x+n.z*n.z)*c).normalize();for(i=0;i<e;i++){var p=j[i][h],o=j[i+1][h],s=j[i+1][h+1],t=j[i][h+1],r=m.clone(),z=m.clone(),w=n.clone(),q=n.clone(),E=l[i][h].clone(),A=l[i+1][h].clone(),v=l[i+1][h+1].clone(),u=l[i][h+1].clone();this.faces.push(new THREE.Face4(p,o,s,t,[r,z,w,q]));this.faceVertexUvs[0].push([E,A,v,u])}}if(!f&&0<a){this.vertices.push(new THREE.Vector3(0,
g,0));for(h=0;h<d;h++)p=j[0][h],o=j[0][h+1],s=this.vertices.length-1,r=new THREE.Vector3(0,1,0),z=new THREE.Vector3(0,1,0),w=new THREE.Vector3(0,1,0),E=l[0][h].clone(),A=l[0][h+1].clone(),v=new THREE.UV(A.u,0),this.faces.push(new THREE.Face3(p,o,s,[r,z,w])),this.faceVertexUvs[0].push([E,A,v])}if(!f&&0<b){this.vertices.push(new THREE.Vector3(0,-g,0));for(h=0;h<d;h++)p=j[i][h+1],o=j[i][h],s=this.vertices.length-1,r=new THREE.Vector3(0,-1,0),z=new THREE.Vector3(0,-1,0),w=new THREE.Vector3(0,-1,0),E=
l[i][h+1].clone(),A=l[i][h].clone(),v=new THREE.UV(A.u,1),this.faces.push(new THREE.Face3(p,o,s,[r,z,w])),this.faceVertexUvs[0].push([E,A,v])}this.computeCentroids();this.computeFaceNormals()};THREE.CylinderGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ExtrudeGeometry=function(a,b){"undefined"!==typeof a&&(THREE.Geometry.call(this),a=a instanceof Array?a:[a],this.shapebb=a[a.length-1].getBoundingBox(),this.addShapeList(a,b),this.computeCentroids(),this.computeFaceNormals())};
THREE.ExtrudeGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ExtrudeGeometry.prototype.addShapeList=function(a,b){for(var c=a.length,d=0;d<c;d++)this.addShape(a[d],b)};
THREE.ExtrudeGeometry.prototype.addShape=function(a,b){function c(a,b,c){b||console.log("die");return b.clone().multiplyScalar(c).addSelf(a)}function d(a,b,c){var d=THREE.ExtrudeGeometry.__v1,e=THREE.ExtrudeGeometry.__v2,f=THREE.ExtrudeGeometry.__v3,g=THREE.ExtrudeGeometry.__v4,h=THREE.ExtrudeGeometry.__v5,i=THREE.ExtrudeGeometry.__v6;d.set(a.x-b.x,a.y-b.y);e.set(a.x-c.x,a.y-c.y);d=d.normalize();e=e.normalize();f.set(-d.y,d.x);g.set(e.y,-e.x);h.copy(a).addSelf(f);i.copy(a).addSelf(g);if(h.equals(i))return g.clone();
h.copy(b).addSelf(f);i.copy(c).addSelf(g);f=d.dot(g);g=i.subSelf(h).dot(g);0===f&&(console.log("Either infinite or no solutions!"),0===g?console.log("Its finite solutions."):console.log("Too bad, no solutions."));g/=f;return 0>g?(b=Math.atan2(b.y-a.y,b.x-a.x),a=Math.atan2(c.y-a.y,c.x-a.x),b>a&&(a+=2*Math.PI),c=(b+a)/2,a=-Math.cos(c),c=-Math.sin(c),new THREE.Vector2(a,c)):d.multiplyScalar(g).addSelf(h).subSelf(a).clone()}function e(c,d){var e,f;for(J=c.length;0<=--J;){e=J;f=J-1;0>f&&(f=c.length-1);
for(var g=0,h=n+2*l,g=0;g<h;g++){var i=R*g,j=R*(g+1),m=d+e+i,i=d+f+i,o=d+f+j,j=d+e+j,p=c,s=g,q=h,t=e,u=f,m=m+G,i=i+G,o=o+G,j=j+G;C.faces.push(new THREE.Face4(m,i,o,j,null,null,r));m=z.generateSideWallUV(C,a,p,b,m,i,o,j,s,q,t,u);C.faceVertexUvs[0].push(m)}}}function f(a,b,c){C.vertices.push(new THREE.Vector3(a,b,c))}function g(c,d,e,f){c+=G;d+=G;e+=G;C.faces.push(new THREE.Face3(c,d,e,null,null,t));c=f?z.generateBottomUV(C,a,b,c,d,e):z.generateTopUV(C,a,b,c,d,e);C.faceVertexUvs[0].push(c)}var h=void 0!==
b.amount?b.amount:100,i=void 0!==b.bevelThickness?b.bevelThickness:6,j=void 0!==b.bevelSize?b.bevelSize:i-2,l=void 0!==b.bevelSegments?b.bevelSegments:3,m=void 0!==b.bevelEnabled?b.bevelEnabled:!0,n=void 0!==b.steps?b.steps:1,p=b.extrudePath,o,s=!1,t=b.material,r=b.extrudeMaterial,z=void 0!==b.UVGenerator?b.UVGenerator:THREE.ExtrudeGeometry.WorldUVGenerator,w,q,E,A;p&&(o=p.getSpacedPoints(n),s=!0,m=!1,w=void 0!==b.frames?b.frames:new THREE.TubeGeometry.FrenetFrames(p,n,!1),q=new THREE.Vector3,E=new THREE.Vector3,
A=new THREE.Vector3);m||(j=i=l=0);var v,u,D,C=this,G=this.vertices.length,p=a.extractPoints(),P=p.shape,p=p.holes,B=!THREE.Shape.Utils.isClockWise(P);if(B){P=P.reverse();u=0;for(D=p.length;u<D;u++)v=p[u],THREE.Shape.Utils.isClockWise(v)&&(p[u]=v.reverse());B=!1}var K=THREE.Shape.Utils.triangulateShape(P,p),B=P;u=0;for(D=p.length;u<D;u++)v=p[u],P=P.concat(v);var H,I,N,O,R=P.length,ga=K.length,M=[],J=0,Q=B.length;H=Q-1;for(I=J+1;J<Q;J++,H++,I++)H===Q&&(H=0),I===Q&&(I=0),M[J]=d(B[J],B[H],B[I]);var Z=
[],L,oa=M.concat();u=0;for(D=p.length;u<D;u++){v=p[u];L=[];J=0;Q=v.length;H=Q-1;for(I=J+1;J<Q;J++,H++,I++)H===Q&&(H=0),I===Q&&(I=0),L[J]=d(v[J],v[H],v[I]);Z.push(L);oa=oa.concat(L)}for(H=0;H<l;H++){v=H/l;N=i*(1-v);I=j*Math.sin(v*Math.PI/2);J=0;for(Q=B.length;J<Q;J++)O=c(B[J],M[J],I),f(O.x,O.y,-N);u=0;for(D=p.length;u<D;u++){v=p[u];L=Z[u];J=0;for(Q=v.length;J<Q;J++)O=c(v[J],L[J],I),f(O.x,O.y,-N)}}I=j;for(J=0;J<R;J++)O=m?c(P[J],oa[J],I):P[J],s?(E.copy(w.normals[0]).multiplyScalar(O.x),q.copy(w.binormals[0]).multiplyScalar(O.y),
A.copy(o[0]).addSelf(E).addSelf(q),f(A.x,A.y,A.z)):f(O.x,O.y,0);for(v=1;v<=n;v++)for(J=0;J<R;J++)O=m?c(P[J],oa[J],I):P[J],s?(E.copy(w.normals[v]).multiplyScalar(O.x),q.copy(w.binormals[v]).multiplyScalar(O.y),A.copy(o[v]).addSelf(E).addSelf(q),f(A.x,A.y,A.z)):f(O.x,O.y,h/n*v);for(H=l-1;0<=H;H--){v=H/l;N=i*(1-v);I=j*Math.sin(v*Math.PI/2);J=0;for(Q=B.length;J<Q;J++)O=c(B[J],M[J],I),f(O.x,O.y,h+N);u=0;for(D=p.length;u<D;u++){v=p[u];L=Z[u];J=0;for(Q=v.length;J<Q;J++)O=c(v[J],L[J],I),s?f(O.x,O.y+o[n-1].y,
o[n-1].x+N):f(O.x,O.y,h+N)}}if(m){i=0*R;for(J=0;J<ga;J++)h=K[J],g(h[2]+i,h[1]+i,h[0]+i,!0);i=R*(n+2*l);for(J=0;J<ga;J++)h=K[J],g(h[0]+i,h[1]+i,h[2]+i,!1)}else{for(J=0;J<ga;J++)h=K[J],g(h[2],h[1],h[0],!0);for(J=0;J<ga;J++)h=K[J],g(h[0]+R*n,h[1]+R*n,h[2]+R*n,!1)}h=0;e(B,h);h+=B.length;u=0;for(D=p.length;u<D;u++)v=p[u],e(v,h),h+=v.length};
THREE.ExtrudeGeometry.WorldUVGenerator={generateTopUV:function(a,b,c,d,e,f){b=a.vertices[e].x;e=a.vertices[e].y;c=a.vertices[f].x;f=a.vertices[f].y;return[new THREE.UV(a.vertices[d].x,a.vertices[d].y),new THREE.UV(b,e),new THREE.UV(c,f)]},generateBottomUV:function(a,b,c,d,e,f){return this.generateTopUV(a,b,c,d,e,f)},generateSideWallUV:function(a,b,c,d,e,f,g,h){var b=a.vertices[e].x,c=a.vertices[e].y,e=a.vertices[e].z,d=a.vertices[f].x,i=a.vertices[f].y,f=a.vertices[f].z,j=a.vertices[g].x,l=a.vertices[g].y,
g=a.vertices[g].z,m=a.vertices[h].x,n=a.vertices[h].y,a=a.vertices[h].z;return 0.01>Math.abs(c-i)?[new THREE.UV(b,1-e),new THREE.UV(d,1-f),new THREE.UV(j,1-g),new THREE.UV(m,1-a)]:[new THREE.UV(c,1-e),new THREE.UV(i,1-f),new THREE.UV(l,1-g),new THREE.UV(n,1-a)]}};THREE.ExtrudeGeometry.__v1=new THREE.Vector2;THREE.ExtrudeGeometry.__v2=new THREE.Vector2;THREE.ExtrudeGeometry.__v3=new THREE.Vector2;THREE.ExtrudeGeometry.__v4=new THREE.Vector2;THREE.ExtrudeGeometry.__v5=new THREE.Vector2;
THREE.ExtrudeGeometry.__v6=new THREE.Vector2;THREE.ShapeGeometry=function(a,b){THREE.Geometry.call(this);!1===a instanceof Array&&(a=[a]);this.shapebb=a[a.length-1].getBoundingBox();this.addShapeList(a,b);this.computeCentroids();this.computeFaceNormals()};THREE.ShapeGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.ShapeGeometry.prototype.addShapeList=function(a,b){for(var c=0,d=a.length;c<d;c++)this.addShape(a[c],b);return this};
THREE.ShapeGeometry.prototype.addShape=function(a,b){void 0===b&&(b={});var c=b.material,d=void 0===b.UVGenerator?THREE.ExtrudeGeometry.WorldUVGenerator:b.UVGenerator,e,f,g,h=this.vertices.length;e=a.extractPoints();var i=e.shape,j=e.holes;if(!THREE.Shape.Utils.isClockWise(i)){i=i.reverse();e=0;for(f=j.length;e<f;e++)g=j[e],THREE.Shape.Utils.isClockWise(g)&&(j[e]=g.reverse())}var l=THREE.Shape.Utils.triangulateShape(i,j);e=0;for(f=j.length;e<f;e++)g=j[e],i=i.concat(g);j=i.length;f=l.length;for(e=
0;e<j;e++)g=i[e],this.vertices.push(new THREE.Vector3(g.x,g.y,0));for(e=0;e<f;e++)j=l[e],i=j[0]+h,g=j[1]+h,j=j[2]+h,this.faces.push(new THREE.Face3(i,g,j,null,null,c)),this.faceVertexUvs[0].push(d.generateBottomUV(this,a,b,i,g,j))};
THREE.LatheGeometry=function(a,b,c){THREE.Geometry.call(this);for(var b=b||12,c=c||2*Math.PI,d=[],e=(new THREE.Matrix4).makeRotationZ(c/b),f=0;f<a.length;f++)d[f]=a[f].clone(),this.vertices.push(d[f]);for(var g=b+1,c=0;c<g;c++)for(f=0;f<d.length;f++)d[f]=e.multiplyVector3(d[f].clone()),this.vertices.push(d[f]);for(c=0;c<b;c++){d=0;for(e=a.length;d<e-1;d++)this.faces.push(new THREE.Face4(c*e+d,(c+1)%g*e+d,(c+1)%g*e+(d+1)%e,c*e+(d+1)%e)),this.faceVertexUvs[0].push([new THREE.UV(1-c/b,d/e),new THREE.UV(1-
(c+1)/b,d/e),new THREE.UV(1-(c+1)/b,(d+1)/e),new THREE.UV(1-c/b,(d+1)/e)])}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.LatheGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.PlaneGeometry=function(a,b,c,d){THREE.Geometry.call(this);this.width=a;this.height=b;this.widthSegments=c||1;this.heightSegments=d||1;for(var c=a/2,e=b/2,d=this.widthSegments,f=this.heightSegments,g=d+1,h=f+1,i=this.width/d,j=this.height/f,l=new THREE.Vector3(0,0,1),a=0;a<h;a++)for(b=0;b<g;b++)this.vertices.push(new THREE.Vector3(b*i-c,-(a*j-e),0));for(a=0;a<f;a++)for(b=0;b<d;b++)c=new THREE.Face4(b+g*a,b+g*(a+1),b+1+g*(a+1),b+1+g*a),c.normal.copy(l),c.vertexNormals.push(l.clone(),l.clone(),
l.clone(),l.clone()),this.faces.push(c),this.faceVertexUvs[0].push([new THREE.UV(b/d,1-a/f),new THREE.UV(b/d,1-(a+1)/f),new THREE.UV((b+1)/d,1-(a+1)/f),new THREE.UV((b+1)/d,1-a/f)]);this.computeCentroids()};THREE.PlaneGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.SphereGeometry=function(a,b,c,d,e,f,g){THREE.Geometry.call(this);this.radius=a||50;this.widthSegments=Math.max(3,Math.floor(b)||8);this.heightSegments=Math.max(2,Math.floor(c)||6);for(var d=void 0!==d?d:0,e=void 0!==e?e:2*Math.PI,f=void 0!==f?f:0,g=void 0!==g?g:Math.PI,c=[],h=[],b=0;b<=this.heightSegments;b++){for(var i=[],j=[],a=0;a<=this.widthSegments;a++){var l=a/this.widthSegments,m=b/this.heightSegments,n=new THREE.Vector3;n.x=-this.radius*Math.cos(d+l*e)*Math.sin(f+m*g);n.y=this.radius*
Math.cos(f+m*g);n.z=this.radius*Math.sin(d+l*e)*Math.sin(f+m*g);this.vertices.push(n);i.push(this.vertices.length-1);j.push(new THREE.UV(l,1-m))}c.push(i);h.push(j)}for(b=0;b<this.heightSegments;b++)for(a=0;a<this.widthSegments;a++){var d=c[b][a+1],e=c[b][a],f=c[b+1][a],g=c[b+1][a+1],i=this.vertices[d].clone().normalize(),j=this.vertices[e].clone().normalize(),l=this.vertices[f].clone().normalize(),m=this.vertices[g].clone().normalize(),n=h[b][a+1].clone(),p=h[b][a].clone(),o=h[b+1][a].clone(),s=
h[b+1][a+1].clone();Math.abs(this.vertices[d].y)===this.radius?(this.faces.push(new THREE.Face3(d,f,g,[i,l,m])),this.faceVertexUvs[0].push([n,o,s])):Math.abs(this.vertices[f].y)===this.radius?(this.faces.push(new THREE.Face3(d,e,f,[i,j,l])),this.faceVertexUvs[0].push([n,p,o])):(this.faces.push(new THREE.Face4(d,e,f,g,[i,j,l,m])),this.faceVertexUvs[0].push([n,p,o,s]))}this.computeCentroids();this.computeFaceNormals();this.boundingSphere={radius:this.radius}};THREE.SphereGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.TextGeometry=function(a,b){var c=THREE.FontUtils.generateShapes(a,b);b.amount=void 0!==b.height?b.height:50;void 0===b.bevelThickness&&(b.bevelThickness=10);void 0===b.bevelSize&&(b.bevelSize=8);void 0===b.bevelEnabled&&(b.bevelEnabled=!1);THREE.ExtrudeGeometry.call(this,c,b)};THREE.TextGeometry.prototype=Object.create(THREE.ExtrudeGeometry.prototype);
THREE.TorusGeometry=function(a,b,c,d,e){THREE.Geometry.call(this);this.radius=a||100;this.tube=b||40;this.radialSegments=c||8;this.tubularSegments=d||6;this.arc=e||2*Math.PI;e=new THREE.Vector3;a=[];b=[];for(c=0;c<=this.radialSegments;c++)for(d=0;d<=this.tubularSegments;d++){var f=d/this.tubularSegments*this.arc,g=2*c/this.radialSegments*Math.PI;e.x=this.radius*Math.cos(f);e.y=this.radius*Math.sin(f);var h=new THREE.Vector3;h.x=(this.radius+this.tube*Math.cos(g))*Math.cos(f);h.y=(this.radius+this.tube*
Math.cos(g))*Math.sin(f);h.z=this.tube*Math.sin(g);this.vertices.push(h);a.push(new THREE.UV(d/this.tubularSegments,c/this.radialSegments));b.push(h.clone().subSelf(e).normalize())}for(c=1;c<=this.radialSegments;c++)for(d=1;d<=this.tubularSegments;d++){var e=(this.tubularSegments+1)*c+d-1,f=(this.tubularSegments+1)*(c-1)+d-1,g=(this.tubularSegments+1)*(c-1)+d,h=(this.tubularSegments+1)*c+d,i=new THREE.Face4(e,f,g,h,[b[e],b[f],b[g],b[h]]);i.normal.addSelf(b[e]);i.normal.addSelf(b[f]);i.normal.addSelf(b[g]);
i.normal.addSelf(b[h]);i.normal.normalize();this.faces.push(i);this.faceVertexUvs[0].push([a[e].clone(),a[f].clone(),a[g].clone(),a[h].clone()])}this.computeCentroids()};THREE.TorusGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.TorusKnotGeometry=function(a,b,c,d,e,f,g){function h(a,b,c,d,e,f){var g=Math.cos(a);Math.cos(b);b=Math.sin(a);a*=c/d;c=Math.cos(a);g*=0.5*e*(2+c);b=0.5*e*(2+c)*b;e=0.5*f*e*Math.sin(a);return new THREE.Vector3(g,b,e)}THREE.Geometry.call(this);this.radius=a||200;this.tube=b||40;this.radialSegments=c||64;this.tubularSegments=d||8;this.p=e||2;this.q=f||3;this.heightScale=g||1;this.grid=Array(this.radialSegments);c=new THREE.Vector3;d=new THREE.Vector3;e=new THREE.Vector3;for(a=0;a<this.radialSegments;++a){this.grid[a]=
Array(this.tubularSegments);for(b=0;b<this.tubularSegments;++b){var i=2*(a/this.radialSegments)*this.p*Math.PI,g=2*(b/this.tubularSegments)*Math.PI,f=h(i,g,this.q,this.p,this.radius,this.heightScale),i=h(i+0.01,g,this.q,this.p,this.radius,this.heightScale);c.sub(i,f);d.add(i,f);e.cross(c,d);d.cross(e,c);e.normalize();d.normalize();i=-this.tube*Math.cos(g);g=this.tube*Math.sin(g);f.x+=i*d.x+g*e.x;f.y+=i*d.y+g*e.y;f.z+=i*d.z+g*e.z;this.grid[a][b]=this.vertices.push(new THREE.Vector3(f.x,f.y,f.z))-1}}for(a=
0;a<this.radialSegments;++a)for(b=0;b<this.tubularSegments;++b){var e=(a+1)%this.radialSegments,f=(b+1)%this.tubularSegments,c=this.grid[a][b],d=this.grid[e][b],e=this.grid[e][f],f=this.grid[a][f],g=new THREE.UV(a/this.radialSegments,b/this.tubularSegments),i=new THREE.UV((a+1)/this.radialSegments,b/this.tubularSegments),j=new THREE.UV((a+1)/this.radialSegments,(b+1)/this.tubularSegments),l=new THREE.UV(a/this.radialSegments,(b+1)/this.tubularSegments);this.faces.push(new THREE.Face4(c,d,e,f));this.faceVertexUvs[0].push([g,
i,j,l])}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.TorusKnotGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.TubeGeometry=function(a,b,c,d,e,f){THREE.Geometry.call(this);this.path=a;this.segments=b||64;this.radius=c||1;this.radiusSegments=d||8;this.closed=e||!1;f&&(this.debug=new THREE.Object3D);this.grid=[];var g,h,f=this.segments+1,i,j,l,m=new THREE.Vector3,n,p,o,b=new THREE.TubeGeometry.FrenetFrames(a,b,e);n=b.tangents;p=b.normals;o=b.binormals;this.tangents=n;this.normals=p;this.binormals=o;for(b=0;b<f;b++){this.grid[b]=[];d=b/(f-1);l=a.getPointAt(d);d=n[b];g=p[b];h=o[b];this.debug&&(this.debug.add(new THREE.ArrowHelper(d,
l,c,255)),this.debug.add(new THREE.ArrowHelper(g,l,c,16711680)),this.debug.add(new THREE.ArrowHelper(h,l,c,65280)));for(d=0;d<this.radiusSegments;d++)i=2*(d/this.radiusSegments)*Math.PI,j=-this.radius*Math.cos(i),i=this.radius*Math.sin(i),m.copy(l),m.x+=j*g.x+i*h.x,m.y+=j*g.y+i*h.y,m.z+=j*g.z+i*h.z,this.grid[b][d]=this.vertices.push(new THREE.Vector3(m.x,m.y,m.z))-1}for(b=0;b<this.segments;b++)for(d=0;d<this.radiusSegments;d++)f=e?(b+1)%this.segments:b+1,m=(d+1)%this.radiusSegments,a=this.grid[b][d],
c=this.grid[f][d],f=this.grid[f][m],m=this.grid[b][m],n=new THREE.UV(b/this.segments,d/this.radiusSegments),p=new THREE.UV((b+1)/this.segments,d/this.radiusSegments),o=new THREE.UV((b+1)/this.segments,(d+1)/this.radiusSegments),g=new THREE.UV(b/this.segments,(d+1)/this.radiusSegments),this.faces.push(new THREE.Face4(a,c,f,m)),this.faceVertexUvs[0].push([n,p,o,g]);this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.TubeGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.TubeGeometry.FrenetFrames=function(a,b,c){new THREE.Vector3;var d=new THREE.Vector3;new THREE.Vector3;var e=[],f=[],g=[],h=new THREE.Vector3,i=new THREE.Matrix4,b=b+1,j,l,m;this.tangents=e;this.normals=f;this.binormals=g;for(j=0;j<b;j++)l=j/(b-1),e[j]=a.getTangentAt(l),e[j].normalize();f[0]=new THREE.Vector3;g[0]=new THREE.Vector3;a=Number.MAX_VALUE;j=Math.abs(e[0].x);l=Math.abs(e[0].y);m=Math.abs(e[0].z);j<=a&&(a=j,d.set(1,0,0));l<=a&&(a=l,d.set(0,1,0));m<=a&&d.set(0,0,1);h.cross(e[0],d).normalize();
f[0].cross(e[0],h);g[0].cross(e[0],f[0]);for(j=1;j<b;j++)f[j]=f[j-1].clone(),g[j]=g[j-1].clone(),h.cross(e[j-1],e[j]),1E-4<h.length()&&(h.normalize(),d=Math.acos(e[j-1].dot(e[j])),i.makeRotationAxis(h,d).multiplyVector3(f[j])),g[j].cross(e[j],f[j]);if(c){d=Math.acos(f[0].dot(f[b-1]));d/=b-1;0<e[0].dot(h.cross(f[0],f[b-1]))&&(d=-d);for(j=1;j<b;j++)i.makeRotationAxis(e[j],d*j).multiplyVector3(f[j]),g[j].cross(e[j],f[j])}};
THREE.PolyhedronGeometry=function(a,b,c,d){function e(a){var b=a.normalize().clone();b.index=i.vertices.push(b)-1;var c=Math.atan2(a.z,-a.x)/2/Math.PI+0.5,a=Math.atan2(-a.y,Math.sqrt(a.x*a.x+a.z*a.z))/Math.PI+0.5;b.uv=new THREE.UV(c,1-a);return b}function f(a,b,c,d){1>d?(d=new THREE.Face3(a.index,b.index,c.index,[a.clone(),b.clone(),c.clone()]),d.centroid.addSelf(a).addSelf(b).addSelf(c).divideScalar(3),d.normal=d.centroid.clone().normalize(),i.faces.push(d),d=Math.atan2(d.centroid.z,-d.centroid.x),
i.faceVertexUvs[0].push([h(a.uv,a,d),h(b.uv,b,d),h(c.uv,c,d)])):(d-=1,f(a,g(a,b),g(a,c),d),f(g(a,b),b,g(b,c),d),f(g(a,c),g(b,c),c,d),f(g(a,b),g(b,c),g(a,c),d))}function g(a,b){m[a.index]||(m[a.index]=[]);m[b.index]||(m[b.index]=[]);var c=m[a.index][b.index];void 0===c&&(m[a.index][b.index]=m[b.index][a.index]=c=e((new THREE.Vector3).add(a,b).divideScalar(2)));return c}function h(a,b,c){0>c&&1===a.u&&(a=new THREE.UV(a.u-1,a.v));0===b.x&&0===b.z&&(a=new THREE.UV(c/2/Math.PI+0.5,a.v));return a}THREE.Geometry.call(this);
for(var c=c||1,d=d||0,i=this,j=0,l=a.length;j<l;j++)e(new THREE.Vector3(a[j][0],a[j][1],a[j][2]));for(var m=[],a=this.vertices,j=0,l=b.length;j<l;j++)f(a[b[j][0]],a[b[j][1]],a[b[j][2]],d);this.mergeVertices();j=0;for(l=this.vertices.length;j<l;j++)this.vertices[j].multiplyScalar(c);this.computeCentroids();this.boundingSphere={radius:c}};THREE.PolyhedronGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.IcosahedronGeometry=function(a,b){var c=(1+Math.sqrt(5))/2;THREE.PolyhedronGeometry.call(this,[[-1,c,0],[1,c,0],[-1,-c,0],[1,-c,0],[0,-1,c],[0,1,c],[0,-1,-c],[0,1,-c],[c,0,-1],[c,0,1],[-c,0,-1],[-c,0,1]],[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],a,b)};THREE.IcosahedronGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.OctahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],[[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,2,5],[1,5,3],[1,3,4],[1,4,2]],a,b)};THREE.OctahedronGeometry.prototype=Object.create(THREE.Geometry.prototype);THREE.TetrahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],[[2,1,0],[0,3,2],[1,3,0],[2,3,1]],a,b)};THREE.TetrahedronGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.ParametricGeometry=function(a,b,c,d){THREE.Geometry.call(this);var e=this.vertices,f=this.faces,g=this.faceVertexUvs[0],d=void 0===d?!1:d,h,i,j,l,m=b+1;for(h=0;h<=c;h++){l=h/c;for(i=0;i<=b;i++)j=i/b,j=a(j,l),e.push(j)}var n,p,o,s;for(h=0;h<c;h++)for(i=0;i<b;i++)a=h*m+i,e=h*m+i+1,l=(h+1)*m+i,j=(h+1)*m+i+1,n=new THREE.UV(i/b,h/c),p=new THREE.UV((i+1)/b,h/c),o=new THREE.UV(i/b,(h+1)/c),s=new THREE.UV((i+1)/b,(h+1)/c),d?(f.push(new THREE.Face3(a,e,l)),f.push(new THREE.Face3(e,j,l)),g.push([n,p,
o]),g.push([p,s,o])):(f.push(new THREE.Face4(a,e,j,l)),g.push([n,p,s,o]));this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.ParametricGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.ConvexGeometry=function(a){function b(a){var b=a.length();return new THREE.UV(a.x/b,a.y/b)}THREE.Geometry.call(this);for(var c=[[0,1,2],[0,2,1]],d=3;d<a.length;d++){var e=d,f=a[e].clone(),g=f.length();f.x+=g*2E-6*(Math.random()-0.5);f.y+=g*2E-6*(Math.random()-0.5);f.z+=g*2E-6*(Math.random()-0.5);for(var g=[],h=0;h<c.length;){var i=c[h],j=f,l=a[i[0]],m;m=l;var n=a[i[1]],p=a[i[2]],o=new THREE.Vector3,s=new THREE.Vector3;o.sub(p,n);s.sub(m,n);o.crossSelf(s);o.normalize();m=o;l=m.dot(l);if(m.dot(j)>=
l){for(j=0;3>j;j++){l=[i[j],i[(j+1)%3]];m=!0;for(n=0;n<g.length;n++)if(g[n][0]===l[1]&&g[n][1]===l[0]){g[n]=g[g.length-1];g.pop();m=!1;break}m&&g.push(l)}c[h]=c[c.length-1];c.pop()}else h++}for(n=0;n<g.length;n++)c.push([g[n][0],g[n][1],e])}e=0;f=Array(a.length);for(d=0;d<c.length;d++){g=c[d];for(h=0;3>h;h++)void 0===f[g[h]]&&(f[g[h]]=e++,this.vertices.push(a[g[h]])),g[h]=f[g[h]]}for(d=0;d<c.length;d++)this.faces.push(new THREE.Face3(c[d][0],c[d][1],c[d][2]));for(d=0;d<this.faces.length;d++)g=this.faces[d],
this.faceVertexUvs[0].push([b(this.vertices[g.a]),b(this.vertices[g.b]),b(this.vertices[g.c])]);this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.ConvexGeometry.prototype=Object.create(THREE.Geometry.prototype);
THREE.AxisHelper=function(a){var b=new THREE.Geometry;b.vertices.push(new THREE.Vector3,new THREE.Vector3(a||1,0,0),new THREE.Vector3,new THREE.Vector3(0,a||1,0),new THREE.Vector3,new THREE.Vector3(0,0,a||1));b.colors.push(new THREE.Color(16711680),new THREE.Color(16755200),new THREE.Color(65280),new THREE.Color(11206400),new THREE.Color(255),new THREE.Color(43775));a=new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors});THREE.Line.call(this,b,a,THREE.LinePieces)};
THREE.AxisHelper.prototype=Object.create(THREE.Line.prototype);
THREE.ArrowHelper=function(a,b,c,d){THREE.Object3D.call(this);void 0===d&&(d=16776960);void 0===c&&(c=20);var e=new THREE.Geometry;e.vertices.push(new THREE.Vector3(0,0,0));e.vertices.push(new THREE.Vector3(0,1,0));this.line=new THREE.Line(e,new THREE.LineBasicMaterial({color:d}));this.add(this.line);e=new THREE.CylinderGeometry(0,0.05,0.25,5,1);this.cone=new THREE.Mesh(e,new THREE.MeshBasicMaterial({color:d}));this.cone.position.set(0,1,0);this.add(this.cone);b instanceof THREE.Vector3&&(this.position=
b);this.setDirection(a);this.setLength(c)};THREE.ArrowHelper.prototype=Object.create(THREE.Object3D.prototype);THREE.ArrowHelper.prototype.setDirection=function(a){var b=(new THREE.Vector3(0,1,0)).crossSelf(a),a=Math.acos((new THREE.Vector3(0,1,0)).dot(a.clone().normalize()));this.matrix=(new THREE.Matrix4).makeRotationAxis(b.normalize(),a);this.rotation.setEulerFromRotationMatrix(this.matrix,this.eulerOrder)};THREE.ArrowHelper.prototype.setLength=function(a){this.scale.set(a,a,a)};
THREE.ArrowHelper.prototype.setColor=function(a){this.line.material.color.setHex(a);this.cone.material.color.setHex(a)};
THREE.CameraHelper=function(a){function b(a,b,d){c(a,d);c(b,d)}function c(a,b){d.geometry.vertices.push(new THREE.Vector3);d.geometry.colors.push(new THREE.Color(b));void 0===d.pointMap[a]&&(d.pointMap[a]=[]);d.pointMap[a].push(d.geometry.vertices.length-1)}THREE.Line.call(this);var d=this;this.geometry=new THREE.Geometry;this.material=new THREE.LineBasicMaterial({color:16777215,vertexColors:THREE.FaceColors});this.type=THREE.LinePieces;this.matrixWorld=a.matrixWorld;this.matrixAutoUpdate=!1;this.pointMap=
{};b("n1","n2",16755200);b("n2","n4",16755200);b("n4","n3",16755200);b("n3","n1",16755200);b("f1","f2",16755200);b("f2","f4",16755200);b("f4","f3",16755200);b("f3","f1",16755200);b("n1","f1",16755200);b("n2","f2",16755200);b("n3","f3",16755200);b("n4","f4",16755200);b("p","n1",16711680);b("p","n2",16711680);b("p","n3",16711680);b("p","n4",16711680);b("u1","u2",43775);b("u2","u3",43775);b("u3","u1",43775);b("c","t",16777215);b("p","c",3355443);b("cn1","cn2",3355443);b("cn3","cn4",3355443);b("cf1",
"cf2",3355443);b("cf3","cf4",3355443);this.camera=a;this.update(a)};THREE.CameraHelper.prototype=Object.create(THREE.Line.prototype);
THREE.CameraHelper.prototype.update=function(){function a(a,d,e,f){THREE.CameraHelper.__v.set(d,e,f);THREE.CameraHelper.__projector.unprojectVector(THREE.CameraHelper.__v,THREE.CameraHelper.__c);a=b.pointMap[a];if(void 0!==a){d=0;for(e=a.length;d<e;d++)b.geometry.vertices[a[d]].copy(THREE.CameraHelper.__v)}}var b=this;THREE.CameraHelper.__c.projectionMatrix.copy(this.camera.projectionMatrix);a("c",0,0,-1);a("t",0,0,1);a("n1",-1,-1,-1);a("n2",1,-1,-1);a("n3",-1,1,-1);a("n4",1,1,-1);a("f1",-1,-1,1);
a("f2",1,-1,1);a("f3",-1,1,1);a("f4",1,1,1);a("u1",0.7,1.1,-1);a("u2",-0.7,1.1,-1);a("u3",0,2,-1);a("cf1",-1,0,1);a("cf2",1,0,1);a("cf3",0,-1,1);a("cf4",0,1,1);a("cn1",-1,0,-1);a("cn2",1,0,-1);a("cn3",0,-1,-1);a("cn4",0,1,-1);this.geometry.verticesNeedUpdate=!0};THREE.CameraHelper.__projector=new THREE.Projector;THREE.CameraHelper.__v=new THREE.Vector3;THREE.CameraHelper.__c=new THREE.Camera;
THREE.DirectionalLightHelper=function(a,b,c){THREE.Object3D.call(this);this.light=a;this.position=a.position;this.direction=new THREE.Vector3;this.direction.sub(a.target.position,a.position);this.color=a.color.clone();var d=THREE.Math.clamp(a.intensity,0,1);this.color.r*=d;this.color.g*=d;this.color.b*=d;var d=this.color.getHex(),e=new THREE.SphereGeometry(b,16,8),f=new THREE.AsteriskGeometry(1.25*b,2.25*b),g=new THREE.MeshBasicMaterial({color:d,fog:!1}),h=new THREE.LineBasicMaterial({color:d,fog:!1});
this.lightArrow=new THREE.ArrowHelper(this.direction,null,c,d);this.lightSphere=new THREE.Mesh(e,g);this.lightArrow.cone.material.fog=!1;this.lightArrow.line.material.fog=!1;this.lightRays=new THREE.Line(f,h,THREE.LinePieces);this.add(this.lightArrow);this.add(this.lightSphere);this.add(this.lightRays);this.lightSphere.properties.isGizmo=!0;this.lightSphere.properties.gizmoSubject=a;this.lightSphere.properties.gizmoRoot=this;this.targetSphere=null;a.target.properties.targetInverse&&(b=new THREE.SphereGeometry(b,
8,4),c=new THREE.MeshBasicMaterial({color:d,wireframe:!0,fog:!1}),this.targetSphere=new THREE.Mesh(b,c),this.targetSphere.position=a.target.position,this.targetSphere.properties.isGizmo=!0,this.targetSphere.properties.gizmoSubject=a.target,this.targetSphere.properties.gizmoRoot=this.targetSphere,a=new THREE.LineDashedMaterial({color:d,dashSize:4,gapSize:4,opacity:0.75,transparent:!0,fog:!1}),d=new THREE.Geometry,d.vertices.push(this.position.clone()),d.vertices.push(this.targetSphere.position.clone()),
d.computeLineDistances(),this.targetLine=new THREE.Line(d,a),this.targetLine.properties.isGizmo=!0);this.properties.isGizmo=!0};THREE.DirectionalLightHelper.prototype=Object.create(THREE.Object3D.prototype);
THREE.DirectionalLightHelper.prototype.update=function(){this.direction.sub(this.light.target.position,this.light.position);this.lightArrow.setDirection(this.direction);this.color.copy(this.light.color);var a=THREE.Math.clamp(this.light.intensity,0,1);this.color.r*=a;this.color.g*=a;this.color.b*=a;this.lightArrow.setColor(this.color.getHex());this.lightSphere.material.color.copy(this.color);this.lightRays.material.color.copy(this.color);this.targetSphere.material.color.copy(this.color);this.targetLine.material.color.copy(this.color);
this.targetLine.geometry.vertices[0].copy(this.light.position);this.targetLine.geometry.vertices[1].copy(this.light.target.position);this.targetLine.geometry.computeLineDistances();this.targetLine.geometry.verticesNeedUpdate=!0};
THREE.HemisphereLightHelper=function(a,b,c){THREE.Object3D.call(this);this.light=a;this.position=a.position;var d=THREE.Math.clamp(a.intensity,0,1);this.color=a.color.clone();this.color.r*=d;this.color.g*=d;this.color.b*=d;var e=this.color.getHex();this.groundColor=a.groundColor.clone();this.groundColor.r*=d;this.groundColor.g*=d;this.groundColor.b*=d;for(var d=this.groundColor.getHex(),f=new THREE.SphereGeometry(b,16,8,0,2*Math.PI,0,0.5*Math.PI),g=new THREE.SphereGeometry(b,16,8,0,2*Math.PI,0.5*
Math.PI,Math.PI),h=new THREE.MeshBasicMaterial({color:e,fog:!1}),i=new THREE.MeshBasicMaterial({color:d,fog:!1}),j=0,l=f.faces.length;j<l;j++)f.faces[j].materialIndex=0;j=0;for(l=g.faces.length;j<l;j++)g.faces[j].materialIndex=1;THREE.GeometryUtils.merge(f,g);this.lightSphere=new THREE.Mesh(f,new THREE.MeshFaceMaterial([h,i]));this.lightArrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(0,1.1*(b+c),0),c,e);this.lightArrow.rotation.x=Math.PI;this.lightArrowGround=new THREE.ArrowHelper(new THREE.Vector3(0,
1,0),new THREE.Vector3(0,-1.1*(b+c),0),c,d);b=new THREE.Object3D;b.rotation.x=0.5*-Math.PI;b.add(this.lightSphere);b.add(this.lightArrow);b.add(this.lightArrowGround);this.add(b);this.lightSphere.properties.isGizmo=!0;this.lightSphere.properties.gizmoSubject=a;this.lightSphere.properties.gizmoRoot=this;this.properties.isGizmo=!0;this.target=new THREE.Vector3;this.lookAt(this.target)};THREE.HemisphereLightHelper.prototype=Object.create(THREE.Object3D.prototype);
THREE.HemisphereLightHelper.prototype.update=function(){var a=THREE.Math.clamp(this.light.intensity,0,1);this.color.copy(this.light.color);this.groundColor.copy(this.light.groundColor);this.color.r*=a;this.color.g*=a;this.color.b*=a;this.groundColor.r*=a;this.groundColor.g*=a;this.groundColor.b*=a;this.lightSphere.material.materials[0].color.copy(this.color);this.lightSphere.material.materials[1].color.copy(this.groundColor);this.lightArrow.setColor(this.color.getHex());this.lightArrowGround.setColor(this.groundColor.getHex());
this.lookAt(this.target)};
THREE.PointLightHelper=function(a,b){THREE.Object3D.call(this);this.light=a;this.position=a.position;this.color=a.color.clone();var c=THREE.Math.clamp(a.intensity,0,1);this.color.r*=c;this.color.g*=c;this.color.b*=c;var d=this.color.getHex(),c=new THREE.SphereGeometry(b,16,8),e=new THREE.AsteriskGeometry(1.25*b,2.25*b),f=new THREE.IcosahedronGeometry(1,2),g=new THREE.MeshBasicMaterial({color:d,fog:!1}),h=new THREE.LineBasicMaterial({color:d,fog:!1}),d=new THREE.MeshBasicMaterial({color:d,fog:!1,wireframe:!0,
opacity:0.1,transparent:!0});this.lightSphere=new THREE.Mesh(c,g);this.lightRays=new THREE.Line(e,h,THREE.LinePieces);this.lightDistance=new THREE.Mesh(f,d);c=a.distance;0===c?this.lightDistance.visible=!1:this.lightDistance.scale.set(c,c,c);this.add(this.lightSphere);this.add(this.lightRays);this.add(this.lightDistance);this.lightSphere.properties.isGizmo=!0;this.lightSphere.properties.gizmoSubject=a;this.lightSphere.properties.gizmoRoot=this;this.properties.isGizmo=!0};
THREE.PointLightHelper.prototype=Object.create(THREE.Object3D.prototype);
THREE.PointLightHelper.prototype.update=function(){this.color.copy(this.light.color);var a=THREE.Math.clamp(this.light.intensity,0,1);this.color.r*=a;this.color.g*=a;this.color.b*=a;this.lightSphere.material.color.copy(this.color);this.lightRays.material.color.copy(this.color);this.lightDistance.material.color.copy(this.color);a=this.light.distance;0===a?this.lightDistance.visible=!1:(this.lightDistance.visible=!0,this.lightDistance.scale.set(a,a,a))};
THREE.SpotLightHelper=function(a,b,c){THREE.Object3D.call(this);this.light=a;this.position=a.position;this.direction=new THREE.Vector3;this.direction.sub(a.target.position,a.position);this.color=a.color.clone();var d=THREE.Math.clamp(a.intensity,0,1);this.color.r*=d;this.color.g*=d;this.color.b*=d;var d=this.color.getHex(),e=new THREE.SphereGeometry(b,16,8),f=new THREE.AsteriskGeometry(1.25*b,2.25*b),g=new THREE.CylinderGeometry(1E-4,1,1,8,1,!0),h=new THREE.Matrix4;h.rotateX(-Math.PI/2);h.translate(new THREE.Vector3(0,
-0.5,0));g.applyMatrix(h);var i=new THREE.MeshBasicMaterial({color:d,fog:!1}),h=new THREE.LineBasicMaterial({color:d,fog:!1}),j=new THREE.MeshBasicMaterial({color:d,fog:!1,wireframe:!0,opacity:0.3,transparent:!0});this.lightArrow=new THREE.ArrowHelper(this.direction,null,c,d);this.lightSphere=new THREE.Mesh(e,i);this.lightCone=new THREE.Mesh(g,j);c=a.distance?a.distance:1E4;e=2*c*Math.tan(0.5*a.angle);this.lightCone.scale.set(e,e,c);this.lightArrow.cone.material.fog=!1;this.lightArrow.line.material.fog=
!1;this.lightRays=new THREE.Line(f,h,THREE.LinePieces);this.gyroscope=new THREE.Gyroscope;this.gyroscope.add(this.lightArrow);this.gyroscope.add(this.lightSphere);this.gyroscope.add(this.lightRays);this.add(this.gyroscope);this.add(this.lightCone);this.lookAt(a.target.position);this.lightSphere.properties.isGizmo=!0;this.lightSphere.properties.gizmoSubject=a;this.lightSphere.properties.gizmoRoot=this;this.targetSphere=null;a.target.properties.targetInverse&&(b=new THREE.SphereGeometry(b,8,4),f=new THREE.MeshBasicMaterial({color:d,
wireframe:!0,fog:!1}),this.targetSphere=new THREE.Mesh(b,f),this.targetSphere.position=a.target.position,this.targetSphere.properties.isGizmo=!0,this.targetSphere.properties.gizmoSubject=a.target,this.targetSphere.properties.gizmoRoot=this.targetSphere,a=new THREE.LineDashedMaterial({color:d,dashSize:4,gapSize:4,opacity:0.75,transparent:!0,fog:!1}),d=new THREE.Geometry,d.vertices.push(this.position.clone()),d.vertices.push(this.targetSphere.position.clone()),d.computeLineDistances(),this.targetLine=
new THREE.Line(d,a),this.targetLine.properties.isGizmo=!0);this.properties.isGizmo=!0};THREE.SpotLightHelper.prototype=Object.create(THREE.Object3D.prototype);
THREE.SpotLightHelper.prototype.update=function(){this.direction.sub(this.light.target.position,this.light.position);this.lightArrow.setDirection(this.direction);this.lookAt(this.light.target.position);var a=this.light.distance?this.light.distance:1E4,b=2*a*Math.tan(0.5*this.light.angle);this.lightCone.scale.set(b,b,a);this.color.copy(this.light.color);a=THREE.Math.clamp(this.light.intensity,0,1);this.color.r*=a;this.color.g*=a;this.color.b*=a;this.lightArrow.setColor(this.color.getHex());this.lightSphere.material.color.copy(this.color);
this.lightRays.material.color.copy(this.color);this.lightCone.material.color.copy(this.color);this.targetSphere.material.color.copy(this.color);this.targetLine.material.color.copy(this.color);this.targetLine.geometry.vertices[0].copy(this.light.position);this.targetLine.geometry.vertices[1].copy(this.light.target.position);this.targetLine.geometry.computeLineDistances();this.targetLine.geometry.verticesNeedUpdate=!0};
THREE.SubdivisionModifier=function(a){this.subdivisions=void 0===a?1:a;this.useOldVertexColors=!1;this.supportUVs=!0;this.debug=!1};THREE.SubdivisionModifier.prototype.modify=function(a){for(var b=this.subdivisions;0<b--;)this.smooth(a)};THREE.GeometryUtils.orderedKey=function(a,b){return Math.min(a,b)+"_"+Math.max(a,b)};
THREE.GeometryUtils.computeEdgeFaces=function(a){function b(a,b){void 0===g[a]&&(g[a]=[]);g[a].push(b)}var c,d,e,f,g={},h=THREE.GeometryUtils.orderedKey;c=0;for(d=a.faces.length;c<d;c++)e=a.faces[c],e instanceof THREE.Face3?(f=h(e.a,e.b),b(f,c),f=h(e.b,e.c),b(f,c),f=h(e.c,e.a),b(f,c)):e instanceof THREE.Face4&&(f=h(e.a,e.b),b(f,c),f=h(e.b,e.c),b(f,c),f=h(e.c,e.d),b(f,c),f=h(e.d,e.a),b(f,c));return g};
THREE.SubdivisionModifier.prototype.smooth=function(a){function b(){l.debug&&(console&&console.assert)&&console.assert.apply(console,arguments)}function c(){l.debug&&console.log.apply(console,arguments)}function d(){console&&console.log.apply(console,arguments)}function e(a,b,d,e,g,h,m){var n=new THREE.Face4(a,b,d,e,null,g.color,g.materialIndex);if(l.useOldVertexColors){n.vertexColors=[];for(var o,p,q,r=0;4>r;r++){q=h[r];o=new THREE.Color;o.setRGB(0,0,0);for(var s=0;s<q.length;s++)p=g.vertexColors[q[s]-
1],o.r+=p.r,o.g+=p.g,o.b+=p.b;o.r/=q.length;o.g/=q.length;o.b/=q.length;n.vertexColors[r]=o}}i.push(n);l.supportUVs&&(g=[f(a,""),f(b,m),f(d,m),f(e,m)],g[0]?g[1]?g[2]?g[3]?j.push(g):c("d :( ",e+":"+m):c("c :( ",d+":"+m):c("b :( ",b+":"+m):c("a :( ",a+":"+m))}function f(a,b){var e=a+":"+b,f=w[e];return!f?(a>=s&&a<s+o.length?c("face pt"):c("edge pt"),d("warning, UV not found for",e),null):f}function g(a,b,c){var e=a+":"+b;e in w?d("dup vertexNo",a,"oldFaceNo",b,"value",c,"key",e,w[e]):w[e]=c}var h=[],
i=[],j=[],l=this,m=THREE.GeometryUtils.orderedKey,n=THREE.GeometryUtils.computeEdgeFaces,p=a.vertices,o=a.faces,s=p.length,h=p.concat(),t=[],r={},z={},w={},q,E,A,v,u,D=a.faceVertexUvs[0],C;c("originalFaces, uvs, originalVerticesLength",o.length,D.length,s);if(l.supportUVs){q=0;for(E=D.length;q<E;q++){A=0;for(v=D[q].length;A<v;A++)C=o[q]["abcd".charAt(A)],g(C,q,D[q][A])}}0==D.length&&(l.supportUVs=!1);q=0;for(var G in w)q++;q||(l.supportUVs=!1,c("no uvs"));q=0;for(E=o.length;q<E;q++)u=o[q],t.push(u.centroid),
h.push(u.centroid),l.supportUVs&&(v=new THREE.UV,u instanceof THREE.Face3?(v.u=f(u.a,q).u+f(u.b,q).u+f(u.c,q).u,v.v=f(u.a,q).v+f(u.b,q).v+f(u.c,q).v,v.u/=3,v.v/=3):u instanceof THREE.Face4&&(v.u=f(u.a,q).u+f(u.b,q).u+f(u.c,q).u+f(u.d,q).u,v.v=f(u.a,q).v+f(u.b,q).v+f(u.c,q).v+f(u.d,q).v,v.u/=4,v.v/=4),g(s+q,"",v));var n=n(a),P;E=0;var B,K;G={};D={};for(q in n){C=n[q];B=q.split("_");K=B[0];B=B[1];A=K;u=[K,B];void 0===G[A]&&(G[A]=[]);G[A].push(u);A=B;u=[K,B];void 0===G[A]&&(G[A]=[]);G[A].push(u);A=0;
for(v=C.length;A<v;A++){u=C[A];P=K;var H=u,I=q;void 0===D[P]&&(D[P]={});D[P][H]=I;P=B;H=q;void 0===D[P]&&(D[P]={});D[P][u]=H}2>C.length&&(z[q]=!0)}for(q in n)if(C=n[q],u=C[0],P=C[1],B=q.split("_"),K=B[0],B=B[1],v=new THREE.Vector3,b(0<C.length,"an edge without faces?!"),1==C.length?(v.addSelf(p[K]),v.addSelf(p[B]),v.multiplyScalar(0.5)):(v.addSelf(t[u]),v.addSelf(t[P]),v.addSelf(p[K]),v.addSelf(p[B]),v.multiplyScalar(0.25)),r[q]=s+o.length+E,h.push(v),E++,l.supportUVs)v=new THREE.UV,v.u=f(K,u).u+
f(B,u).u,v.v=f(K,u).v+f(B,u).v,v.u/=2,v.v/=2,g(r[q],u,v),2<=C.length&&(b(2==C.length,"did we plan for more than 2 edges?"),v=new THREE.UV,v.u=f(K,P).u+f(B,P).u,v.v=f(K,P).v+f(B,P).v,v.u/=2,v.v/=2,g(r[q],P,v));c("-- Step 2 done");var N,O;v=["123","12","2","23"];P=["123","23","3","31"];var H=["123","31","1","12"],I=["1234","12","2","23"],R=["1234","23","3","34"],ga=["1234","34","4","41"],M=["1234","41","1","12"];q=0;for(E=t.length;q<E;q++)u=o[q],C=s+q,u instanceof THREE.Face3?(K=m(u.a,u.b),B=m(u.b,
u.c),N=m(u.c,u.a),e(C,r[K],u.b,r[B],u,v,q),e(C,r[B],u.c,r[N],u,P,q),e(C,r[N],u.a,r[K],u,H,q)):u instanceof THREE.Face4?(K=m(u.a,u.b),B=m(u.b,u.c),N=m(u.c,u.d),O=m(u.d,u.a),e(C,r[K],u.b,r[B],u,I,q),e(C,r[B],u.c,r[N],u,R,q),e(C,r[N],u.d,r[O],u,ga,q),e(C,r[O],u.a,r[K],u,M,q)):c("face should be a face!",u);r=new THREE.Vector3;u=new THREE.Vector3;q=0;for(E=p.length;q<E;q++)if(void 0!==G[q]){r.set(0,0,0);u.set(0,0,0);B=new THREE.Vector3(0,0,0);C=0;for(A in D[q])r.addSelf(t[A]),C++;P=0;K=G[q].length;v=C!=
K;for(A=0;A<K;A++)z[m(G[q][A][0],G[q][A][1])]&&P++;r.divideScalar(C);P=0;if(v){for(A=0;A<K;A++)if(C=G[q][A],H=1==n[m(C[0],C[1])].length)C=p[C[0]].clone().addSelf(p[C[1]]).divideScalar(2),u.addSelf(C),P++;u.divideScalar(4);b(2==P,"should have only 2 boundary edges")}else{for(A=0;A<K;A++)C=G[q][A],C=p[C[0]].clone().addSelf(p[C[1]]).divideScalar(2),u.addSelf(C);u.divideScalar(K)}B.addSelf(p[q]);v?(B.divideScalar(2),B.addSelf(u)):(B.multiplyScalar(K-3),B.addSelf(r),B.addSelf(u.multiplyScalar(2)),B.divideScalar(K));
h[q]=B}a.vertices=h;a.faces=i;a.faceVertexUvs[0]=j;delete a.__tmpVertices;a.computeCentroids();a.computeFaceNormals();a.computeVertexNormals()};THREE.ImmediateRenderObject=function(){THREE.Object3D.call(this);this.render=function(){}};THREE.ImmediateRenderObject.prototype=Object.create(THREE.Object3D.prototype);THREE.LensFlare=function(a,b,c,d,e){THREE.Object3D.call(this);this.lensFlares=[];this.positionScreen=new THREE.Vector3;this.customUpdateCallback=void 0;void 0!==a&&this.add(a,b,c,d,e)};
THREE.LensFlare.prototype=Object.create(THREE.Object3D.prototype);THREE.LensFlare.prototype.add=function(a,b,c,d,e,f){void 0===b&&(b=-1);void 0===c&&(c=0);void 0===f&&(f=1);void 0===e&&(e=new THREE.Color(16777215));void 0===d&&(d=THREE.NormalBlending);c=Math.min(c,Math.max(0,c));this.lensFlares.push({texture:a,size:b,distance:c,x:0,y:0,z:0,scale:1,rotation:1,opacity:f,color:e,blending:d})};
THREE.LensFlare.prototype.updateLensFlares=function(){var a,b=this.lensFlares.length,c,d=2*-this.positionScreen.x,e=2*-this.positionScreen.y;for(a=0;a<b;a++)c=this.lensFlares[a],c.x=this.positionScreen.x+d*c.distance,c.y=this.positionScreen.y+e*c.distance,c.wantedRotation=0.25*c.x*Math.PI,c.rotation+=0.25*(c.wantedRotation-c.rotation)};
THREE.MorphBlendMesh=function(a,b){THREE.Mesh.call(this,a,b);this.animationsMap={};this.animationsList=[];var c=this.geometry.morphTargets.length;this.createAnimation("__default",0,c-1,c/1);this.setAnimationWeight("__default",1)};THREE.MorphBlendMesh.prototype=Object.create(THREE.Mesh.prototype);
THREE.MorphBlendMesh.prototype.createAnimation=function(a,b,c,d){b={startFrame:b,endFrame:c,length:c-b+1,fps:d,duration:(c-b)/d,lastFrame:0,currentFrame:0,active:!1,time:0,direction:1,weight:1,directionBackwards:!1,mirroredLoop:!1};this.animationsMap[a]=b;this.animationsList.push(b)};
THREE.MorphBlendMesh.prototype.autoCreateAnimations=function(a){for(var b=/([a-z]+)(\d+)/,c,d={},e=this.geometry,f=0,g=e.morphTargets.length;f<g;f++){var h=e.morphTargets[f].name.match(b);if(h&&1<h.length){var i=h[1];d[i]||(d[i]={start:Infinity,end:-Infinity});h=d[i];f<h.start&&(h.start=f);f>h.end&&(h.end=f);c||(c=i)}}for(i in d)h=d[i],this.createAnimation(i,h.start,h.end,a);this.firstAnimation=c};
THREE.MorphBlendMesh.prototype.setAnimationDirectionForward=function(a){if(a=this.animationsMap[a])a.direction=1,a.directionBackwards=!1};THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward=function(a){if(a=this.animationsMap[a])a.direction=-1,a.directionBackwards=!0};THREE.MorphBlendMesh.prototype.setAnimationFPS=function(a,b){var c=this.animationsMap[a];c&&(c.fps=b,c.duration=(c.end-c.start)/c.fps)};
THREE.MorphBlendMesh.prototype.setAnimationDuration=function(a,b){var c=this.animationsMap[a];c&&(c.duration=b,c.fps=(c.end-c.start)/c.duration)};THREE.MorphBlendMesh.prototype.setAnimationWeight=function(a,b){var c=this.animationsMap[a];c&&(c.weight=b)};THREE.MorphBlendMesh.prototype.setAnimationTime=function(a,b){var c=this.animationsMap[a];c&&(c.time=b)};THREE.MorphBlendMesh.prototype.getAnimationTime=function(a){var b=0;if(a=this.animationsMap[a])b=a.time;return b};
THREE.MorphBlendMesh.prototype.getAnimationDuration=function(a){var b=-1;if(a=this.animationsMap[a])b=a.duration;return b};THREE.MorphBlendMesh.prototype.playAnimation=function(a){var b=this.animationsMap[a];b?(b.time=0,b.active=!0):console.warn("animation["+a+"] undefined")};THREE.MorphBlendMesh.prototype.stopAnimation=function(a){if(a=this.animationsMap[a])a.active=!1};
THREE.MorphBlendMesh.prototype.update=function(a){for(var b=0,c=this.animationsList.length;b<c;b++){var d=this.animationsList[b];if(d.active){var e=d.duration/d.length;d.time+=d.direction*a;if(d.mirroredLoop){if(d.time>d.duration||0>d.time)if(d.direction*=-1,d.time>d.duration&&(d.time=d.duration,d.directionBackwards=!0),0>d.time)d.time=0,d.directionBackwards=!1}else d.time%=d.duration,0>d.time&&(d.time+=d.duration);var f=d.startFrame+THREE.Math.clamp(Math.floor(d.time/e),0,d.length-1),g=d.weight;
f!==d.currentFrame&&(this.morphTargetInfluences[d.lastFrame]=0,this.morphTargetInfluences[d.currentFrame]=1*g,this.morphTargetInfluences[f]=0,d.lastFrame=d.currentFrame,d.currentFrame=f);e=d.time%e/e;d.directionBackwards&&(e=1-e);this.morphTargetInfluences[d.currentFrame]=e*g;this.morphTargetInfluences[d.lastFrame]=(1-e)*g}}};
THREE.LensFlarePlugin=function(){function a(a){var c=b.createProgram(),d=b.createShader(b.FRAGMENT_SHADER),e=b.createShader(b.VERTEX_SHADER);b.shaderSource(d,a.fragmentShader);b.shaderSource(e,a.vertexShader);b.compileShader(d);b.compileShader(e);b.attachShader(c,d);b.attachShader(c,e);b.linkProgram(c);return c}var b,c,d,e,f,g,h,i,j,l,m,n,p;this.init=function(o){b=o.context;c=o;d=new Float32Array(16);e=new Uint16Array(6);o=0;d[o++]=-1;d[o++]=-1;d[o++]=0;d[o++]=0;d[o++]=1;d[o++]=-1;d[o++]=1;d[o++]=
0;d[o++]=1;d[o++]=1;d[o++]=1;d[o++]=1;d[o++]=-1;d[o++]=1;d[o++]=0;d[o++]=1;o=0;e[o++]=0;e[o++]=1;e[o++]=2;e[o++]=0;e[o++]=2;e[o++]=3;f=b.createBuffer();g=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,f);b.bufferData(b.ARRAY_BUFFER,d,b.STATIC_DRAW);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.bufferData(b.ELEMENT_ARRAY_BUFFER,e,b.STATIC_DRAW);h=b.createTexture();i=b.createTexture();b.bindTexture(b.TEXTURE_2D,h);b.texImage2D(b.TEXTURE_2D,0,b.RGB,16,16,0,b.RGB,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,
b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.bindTexture(b.TEXTURE_2D,i);b.texImage2D(b.TEXTURE_2D,0,b.RGBA,16,16,0,b.RGBA,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);
b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);0>=b.getParameter(b.MAX_VERTEX_TEXTURE_IMAGE_UNITS)?(j=!1,l=a(THREE.ShaderFlares.lensFlare)):(j=!0,l=a(THREE.ShaderFlares.lensFlareVertexTexture));m={};n={};m.vertex=b.getAttribLocation(l,"position");m.uv=b.getAttribLocation(l,"uv");n.renderType=b.getUniformLocation(l,"renderType");n.map=b.getUniformLocation(l,"map");n.occlusionMap=b.getUniformLocation(l,"occlusionMap");n.opacity=b.getUniformLocation(l,"opacity");n.color=b.getUniformLocation(l,
"color");n.scale=b.getUniformLocation(l,"scale");n.rotation=b.getUniformLocation(l,"rotation");n.screenPosition=b.getUniformLocation(l,"screenPosition");p=!1};this.render=function(a,d,e,r){var a=a.__webglFlares,z=a.length;if(z){var w=new THREE.Vector3,q=r/e,E=0.5*e,A=0.5*r,v=16/r,u=new THREE.Vector2(v*q,v),D=new THREE.Vector3(1,1,0),C=new THREE.Vector2(1,1),G=n,v=m;b.useProgram(l);p||(b.enableVertexAttribArray(m.vertex),b.enableVertexAttribArray(m.uv),p=!0);b.uniform1i(G.occlusionMap,0);b.uniform1i(G.map,
1);b.bindBuffer(b.ARRAY_BUFFER,f);b.vertexAttribPointer(v.vertex,2,b.FLOAT,!1,16,0);b.vertexAttribPointer(v.uv,2,b.FLOAT,!1,16,8);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.disable(b.CULL_FACE);b.depthMask(!1);var P,B,K,H,I;for(P=0;P<z;P++)if(v=16/r,u.set(v*q,v),H=a[P],w.set(H.matrixWorld.elements[12],H.matrixWorld.elements[13],H.matrixWorld.elements[14]),d.matrixWorldInverse.multiplyVector3(w),d.projectionMatrix.multiplyVector3(w),D.copy(w),C.x=D.x*E+E,C.y=D.y*A+A,j||0<C.x&&C.x<e&&0<C.y&&C.y<r){b.activeTexture(b.TEXTURE1);
b.bindTexture(b.TEXTURE_2D,h);b.copyTexImage2D(b.TEXTURE_2D,0,b.RGB,C.x-8,C.y-8,16,16,0);b.uniform1i(G.renderType,0);b.uniform2f(G.scale,u.x,u.y);b.uniform3f(G.screenPosition,D.x,D.y,D.z);b.disable(b.BLEND);b.enable(b.DEPTH_TEST);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0);b.activeTexture(b.TEXTURE0);b.bindTexture(b.TEXTURE_2D,i);b.copyTexImage2D(b.TEXTURE_2D,0,b.RGBA,C.x-8,C.y-8,16,16,0);b.uniform1i(G.renderType,1);b.disable(b.DEPTH_TEST);b.activeTexture(b.TEXTURE1);b.bindTexture(b.TEXTURE_2D,
h);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0);H.positionScreen.copy(D);H.customUpdateCallback?H.customUpdateCallback(H):H.updateLensFlares();b.uniform1i(G.renderType,2);b.enable(b.BLEND);B=0;for(K=H.lensFlares.length;B<K;B++)I=H.lensFlares[B],0.001<I.opacity&&0.001<I.scale&&(D.x=I.x,D.y=I.y,D.z=I.z,v=I.size*I.scale/r,u.x=v*q,u.y=v,b.uniform3f(G.screenPosition,D.x,D.y,D.z),b.uniform2f(G.scale,u.x,u.y),b.uniform1f(G.rotation,I.rotation),b.uniform1f(G.opacity,I.opacity),b.uniform3f(G.color,I.color.r,
I.color.g,I.color.b),c.setBlending(I.blending,I.blendEquation,I.blendSrc,I.blendDst),c.setTexture(I.texture,1),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0))}b.enable(b.CULL_FACE);b.enable(b.DEPTH_TEST);b.depthMask(!0)}}};
THREE.ShadowMapPlugin=function(){var a,b,c,d,e,f,g=new THREE.Frustum,h=new THREE.Matrix4,i=new THREE.Vector3,j=new THREE.Vector3;this.init=function(g){a=g.context;b=g;var g=THREE.ShaderLib.depthRGBA,h=THREE.UniformsUtils.clone(g.uniforms);c=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h});d=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h,morphTargets:!0});e=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,
vertexShader:g.vertexShader,uniforms:h,skinning:!0});f=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h,morphTargets:!0,skinning:!0});c._shadowPass=!0;d._shadowPass=!0;e._shadowPass=!0;f._shadowPass=!0};this.render=function(a,c){b.shadowMapEnabled&&b.shadowMapAutoUpdate&&this.update(a,c)};this.update=function(l,m){var n,p,o,s,t,r,z,w,q,E=[];s=0;a.clearColor(1,1,1,1);a.disable(a.BLEND);a.enable(a.CULL_FACE);a.frontFace(a.CCW);b.shadowMapCullFrontFaces?
a.cullFace(a.FRONT):a.cullFace(a.BACK);b.setDepthTest(!0);n=0;for(p=l.__lights.length;n<p;n++)if(o=l.__lights[n],o.castShadow)if(o instanceof THREE.DirectionalLight&&o.shadowCascade)for(t=0;t<o.shadowCascadeCount;t++){var A;if(o.shadowCascadeArray[t])A=o.shadowCascadeArray[t];else{q=o;z=t;A=new THREE.DirectionalLight;A.isVirtual=!0;A.onlyShadow=!0;A.castShadow=!0;A.shadowCameraNear=q.shadowCameraNear;A.shadowCameraFar=q.shadowCameraFar;A.shadowCameraLeft=q.shadowCameraLeft;A.shadowCameraRight=q.shadowCameraRight;
A.shadowCameraBottom=q.shadowCameraBottom;A.shadowCameraTop=q.shadowCameraTop;A.shadowCameraVisible=q.shadowCameraVisible;A.shadowDarkness=q.shadowDarkness;A.shadowBias=q.shadowCascadeBias[z];A.shadowMapWidth=q.shadowCascadeWidth[z];A.shadowMapHeight=q.shadowCascadeHeight[z];A.pointsWorld=[];A.pointsFrustum=[];w=A.pointsWorld;r=A.pointsFrustum;for(var v=0;8>v;v++)w[v]=new THREE.Vector3,r[v]=new THREE.Vector3;w=q.shadowCascadeNearZ[z];q=q.shadowCascadeFarZ[z];r[0].set(-1,-1,w);r[1].set(1,-1,w);r[2].set(-1,
1,w);r[3].set(1,1,w);r[4].set(-1,-1,q);r[5].set(1,-1,q);r[6].set(-1,1,q);r[7].set(1,1,q);A.originalCamera=m;r=new THREE.Gyroscope;r.position=o.shadowCascadeOffset;r.add(A);r.add(A.target);m.add(r);o.shadowCascadeArray[t]=A;console.log("Created virtualLight",A)}z=o;w=t;q=z.shadowCascadeArray[w];q.position.copy(z.position);q.target.position.copy(z.target.position);q.lookAt(q.target);q.shadowCameraVisible=z.shadowCameraVisible;q.shadowDarkness=z.shadowDarkness;q.shadowBias=z.shadowCascadeBias[w];r=z.shadowCascadeNearZ[w];
z=z.shadowCascadeFarZ[w];q=q.pointsFrustum;q[0].z=r;q[1].z=r;q[2].z=r;q[3].z=r;q[4].z=z;q[5].z=z;q[6].z=z;q[7].z=z;E[s]=A;s++}else E[s]=o,s++;n=0;for(p=E.length;n<p;n++){o=E[n];o.shadowMap||(o.shadowMap=new THREE.WebGLRenderTarget(o.shadowMapWidth,o.shadowMapHeight,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat}),o.shadowMapSize=new THREE.Vector2(o.shadowMapWidth,o.shadowMapHeight),o.shadowMatrix=new THREE.Matrix4);if(!o.shadowCamera){if(o instanceof THREE.SpotLight)o.shadowCamera=
new THREE.PerspectiveCamera(o.shadowCameraFov,o.shadowMapWidth/o.shadowMapHeight,o.shadowCameraNear,o.shadowCameraFar);else if(o instanceof THREE.DirectionalLight)o.shadowCamera=new THREE.OrthographicCamera(o.shadowCameraLeft,o.shadowCameraRight,o.shadowCameraTop,o.shadowCameraBottom,o.shadowCameraNear,o.shadowCameraFar);else{console.error("Unsupported light type for shadow");continue}l.add(o.shadowCamera);b.autoUpdateScene&&l.updateMatrixWorld()}o.shadowCameraVisible&&!o.cameraHelper&&(o.cameraHelper=
new THREE.CameraHelper(o.shadowCamera),o.shadowCamera.add(o.cameraHelper));if(o.isVirtual&&A.originalCamera==m){t=m;s=o.shadowCamera;r=o.pointsFrustum;q=o.pointsWorld;i.set(Infinity,Infinity,Infinity);j.set(-Infinity,-Infinity,-Infinity);for(z=0;8>z;z++)if(w=q[z],w.copy(r[z]),THREE.ShadowMapPlugin.__projector.unprojectVector(w,t),s.matrixWorldInverse.multiplyVector3(w),w.x<i.x&&(i.x=w.x),w.x>j.x&&(j.x=w.x),w.y<i.y&&(i.y=w.y),w.y>j.y&&(j.y=w.y),w.z<i.z&&(i.z=w.z),w.z>j.z)j.z=w.z;s.left=i.x;s.right=
j.x;s.top=j.y;s.bottom=i.y;s.updateProjectionMatrix()}s=o.shadowMap;r=o.shadowMatrix;t=o.shadowCamera;t.position.copy(o.matrixWorld.getPosition());t.lookAt(o.target.matrixWorld.getPosition());t.updateMatrixWorld();t.matrixWorldInverse.getInverse(t.matrixWorld);o.cameraHelper&&(o.cameraHelper.visible=o.shadowCameraVisible);o.shadowCameraVisible&&o.cameraHelper.update();r.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);r.multiplySelf(t.projectionMatrix);r.multiplySelf(t.matrixWorldInverse);t._viewMatrixArray||
(t._viewMatrixArray=new Float32Array(16));t._projectionMatrixArray||(t._projectionMatrixArray=new Float32Array(16));t.matrixWorldInverse.flattenToArray(t._viewMatrixArray);t.projectionMatrix.flattenToArray(t._projectionMatrixArray);h.multiply(t.projectionMatrix,t.matrixWorldInverse);g.setFromMatrix(h);b.setRenderTarget(s);b.clear();q=l.__webglObjects;o=0;for(s=q.length;o<s;o++)if(z=q[o],r=z.object,z.render=!1,r.visible&&r.castShadow&&(!(r instanceof THREE.Mesh||r instanceof THREE.ParticleSystem)||
!r.frustumCulled||g.contains(r)))r._modelViewMatrix.multiply(t.matrixWorldInverse,r.matrixWorld),z.render=!0;o=0;for(s=q.length;o<s;o++)z=q[o],z.render&&(r=z.object,z=z.buffer,v=r.material instanceof THREE.MeshFaceMaterial?r.material.materials[0]:r.material,w=0<r.geometry.morphTargets.length&&v.morphTargets,v=r instanceof THREE.SkinnedMesh&&v.skinning,w=r.customDepthMaterial?r.customDepthMaterial:v?w?f:e:w?d:c,z instanceof THREE.BufferGeometry?b.renderBufferDirect(t,l.__lights,null,w,z,r):b.renderBuffer(t,
l.__lights,null,w,z,r));q=l.__webglObjectsImmediate;o=0;for(s=q.length;o<s;o++)z=q[o],r=z.object,r.visible&&r.castShadow&&(r._modelViewMatrix.multiply(t.matrixWorldInverse,r.matrixWorld),b.renderImmediateObject(t,l.__lights,null,c,r))}n=b.getClearColor();p=b.getClearAlpha();a.clearColor(n.r,n.g,n.b,p);a.enable(a.BLEND);b.shadowMapCullFrontFaces&&a.cullFace(a.BACK)}};THREE.ShadowMapPlugin.__projector=new THREE.Projector;
THREE.SpritePlugin=function(){function a(a,b){return a.z!==b.z?b.z-a.z:b.id-a.id}var b,c,d,e,f,g,h,i,j,l;this.init=function(a){b=a.context;c=a;d=new Float32Array(16);e=new Uint16Array(6);a=0;d[a++]=-1;d[a++]=-1;d[a++]=0;d[a++]=0;d[a++]=1;d[a++]=-1;d[a++]=1;d[a++]=0;d[a++]=1;d[a++]=1;d[a++]=1;d[a++]=1;d[a++]=-1;d[a++]=1;d[a++]=0;d[a++]=1;a=0;e[a++]=0;e[a++]=1;e[a++]=2;e[a++]=0;e[a++]=2;e[a++]=3;f=b.createBuffer();g=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,f);b.bufferData(b.ARRAY_BUFFER,d,b.STATIC_DRAW);
b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.bufferData(b.ELEMENT_ARRAY_BUFFER,e,b.STATIC_DRAW);var a=THREE.ShaderSprite.sprite,n=b.createProgram(),p=b.createShader(b.FRAGMENT_SHADER),o=b.createShader(b.VERTEX_SHADER);b.shaderSource(p,a.fragmentShader);b.shaderSource(o,a.vertexShader);b.compileShader(p);b.compileShader(o);b.attachShader(n,p);b.attachShader(n,o);b.linkProgram(n);h=n;i={};j={};i.position=b.getAttribLocation(h,"position");i.uv=b.getAttribLocation(h,"uv");j.uvOffset=b.getUniformLocation(h,
"uvOffset");j.uvScale=b.getUniformLocation(h,"uvScale");j.rotation=b.getUniformLocation(h,"rotation");j.scale=b.getUniformLocation(h,"scale");j.alignment=b.getUniformLocation(h,"alignment");j.color=b.getUniformLocation(h,"color");j.map=b.getUniformLocation(h,"map");j.opacity=b.getUniformLocation(h,"opacity");j.useScreenCoordinates=b.getUniformLocation(h,"useScreenCoordinates");j.affectedByDistance=b.getUniformLocation(h,"affectedByDistance");j.screenPosition=b.getUniformLocation(h,"screenPosition");
j.modelViewMatrix=b.getUniformLocation(h,"modelViewMatrix");j.projectionMatrix=b.getUniformLocation(h,"projectionMatrix");j.fogType=b.getUniformLocation(h,"fogType");j.fogDensity=b.getUniformLocation(h,"fogDensity");j.fogNear=b.getUniformLocation(h,"fogNear");j.fogFar=b.getUniformLocation(h,"fogFar");j.fogColor=b.getUniformLocation(h,"fogColor");l=!1};this.render=function(d,e,p,o){var s=d.__webglSprites,t=s.length;if(t){var r=i,z=j,w=o/p,p=0.5*p,q=0.5*o,E=!0;b.useProgram(h);l||(b.enableVertexAttribArray(r.position),
b.enableVertexAttribArray(r.uv),l=!0);b.disable(b.CULL_FACE);b.enable(b.BLEND);b.depthMask(!0);b.bindBuffer(b.ARRAY_BUFFER,f);b.vertexAttribPointer(r.position,2,b.FLOAT,!1,16,0);b.vertexAttribPointer(r.uv,2,b.FLOAT,!1,16,8);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.uniformMatrix4fv(z.projectionMatrix,!1,e._projectionMatrixArray);b.activeTexture(b.TEXTURE0);b.uniform1i(z.map,0);var A=r=0,v=d.fog;v?(b.uniform3f(z.fogColor,v.color.r,v.color.g,v.color.b),v instanceof THREE.Fog?(b.uniform1f(z.fogNear,v.near),
b.uniform1f(z.fogFar,v.far),b.uniform1i(z.fogType,1),A=r=1):v instanceof THREE.FogExp2&&(b.uniform1f(z.fogDensity,v.density),b.uniform1i(z.fogType,2),A=r=2)):(b.uniform1i(z.fogType,0),A=r=0);for(var u,D=[],v=0;v<t;v++)u=s[v],u.visible&&0!==u.opacity&&(u.useScreenCoordinates?u.z=-u.position.z:(u._modelViewMatrix.multiply(e.matrixWorldInverse,u.matrixWorld),u.z=-u._modelViewMatrix.elements[14]));s.sort(a);for(v=0;v<t;v++)if(u=s[v],u.visible&&0!==u.opacity&&u.map&&u.map.image&&u.map.image.width)u.useScreenCoordinates?
(b.uniform1i(z.useScreenCoordinates,1),b.uniform3f(z.screenPosition,(u.position.x-p)/p,(q-u.position.y)/q,Math.max(0,Math.min(1,u.position.z)))):(b.uniform1i(z.useScreenCoordinates,0),b.uniform1i(z.affectedByDistance,u.affectedByDistance?1:0),b.uniformMatrix4fv(z.modelViewMatrix,!1,u._modelViewMatrix.elements)),e=d.fog&&u.fog?A:0,r!==e&&(b.uniform1i(z.fogType,e),r=e),e=1/(u.scaleByViewport?o:1),D[0]=e*w*u.scale.x,D[1]=e*u.scale.y,b.uniform2f(z.uvScale,u.uvScale.x,u.uvScale.y),b.uniform2f(z.uvOffset,
u.uvOffset.x,u.uvOffset.y),b.uniform2f(z.alignment,u.alignment.x,u.alignment.y),b.uniform1f(z.opacity,u.opacity),b.uniform3f(z.color,u.color.r,u.color.g,u.color.b),b.uniform1f(z.rotation,u.rotation),b.uniform2fv(z.scale,D),u.mergeWith3D&&!E?(b.enable(b.DEPTH_TEST),E=!0):!u.mergeWith3D&&E&&(b.disable(b.DEPTH_TEST),E=!1),c.setBlending(u.blending,u.blendEquation,u.blendSrc,u.blendDst),c.setTexture(u.map,0),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0);b.enable(b.CULL_FACE);b.enable(b.DEPTH_TEST);
b.depthMask(!0)}}};
THREE.DepthPassPlugin=function(){this.enabled=!1;this.renderTarget=null;var a,b,c,d,e,f,g=new THREE.Frustum,h=new THREE.Matrix4;this.init=function(g){a=g.context;b=g;var g=THREE.ShaderLib.depthRGBA,h=THREE.UniformsUtils.clone(g.uniforms);c=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h});d=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h,morphTargets:!0});e=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,
uniforms:h,skinning:!0});f=new THREE.ShaderMaterial({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:h,morphTargets:!0,skinning:!0});c._shadowPass=!0;d._shadowPass=!0;e._shadowPass=!0;f._shadowPass=!0};this.render=function(a,b){this.enabled&&this.update(a,b)};this.update=function(i,j){var l,m,n,p,o,s;a.clearColor(1,1,1,1);a.disable(a.BLEND);b.setDepthTest(!0);b.autoUpdateScene&&i.updateMatrixWorld();j._viewMatrixArray||(j._viewMatrixArray=new Float32Array(16));j._projectionMatrixArray||
(j._projectionMatrixArray=new Float32Array(16));j.matrixWorldInverse.getInverse(j.matrixWorld);j.matrixWorldInverse.flattenToArray(j._viewMatrixArray);j.projectionMatrix.flattenToArray(j._projectionMatrixArray);h.multiply(j.projectionMatrix,j.matrixWorldInverse);g.setFromMatrix(h);b.setRenderTarget(this.renderTarget);b.clear();s=i.__webglObjects;l=0;for(m=s.length;l<m;l++)if(n=s[l],o=n.object,n.render=!1,o.visible&&(!(o instanceof THREE.Mesh||o instanceof THREE.ParticleSystem)||!o.frustumCulled||
g.contains(o)))o._modelViewMatrix.multiply(j.matrixWorldInverse,o.matrixWorld),n.render=!0;var t;l=0;for(m=s.length;l<m;l++)if(n=s[l],n.render&&(o=n.object,n=n.buffer,!(o instanceof THREE.ParticleSystem)||o.customDepthMaterial))(t=o.material instanceof THREE.MeshFaceMaterial?o.material.materials[0]:o.material)&&b.setMaterialFaces(o.material),p=0<o.geometry.morphTargets.length&&t.morphTargets,t=o instanceof THREE.SkinnedMesh&&t.skinning,p=o.customDepthMaterial?o.customDepthMaterial:t?p?f:e:p?d:c,n instanceof
THREE.BufferGeometry?b.renderBufferDirect(j,i.__lights,null,p,n,o):b.renderBuffer(j,i.__lights,null,p,n,o);s=i.__webglObjectsImmediate;l=0;for(m=s.length;l<m;l++)n=s[l],o=n.object,o.visible&&(o._modelViewMatrix.multiply(j.matrixWorldInverse,o.matrixWorld),b.renderImmediateObject(j,i.__lights,null,c,o));l=b.getClearColor();m=b.getClearAlpha();a.clearColor(l.r,l.g,l.b,m);a.enable(a.BLEND)}};
THREE.ShaderFlares={lensFlareVertexTexture:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility = (       visibility.r / 9.0 ) *\n( 1.0 - visibility.g / 9.0 ) *\n(       visibility.b / 9.0 ) *\n( 1.0 - visibility.a / 9.0 );\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"},
lensFlare:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"}};
THREE.ShaderSprite={sprite:{vertexShader:"uniform int useScreenCoordinates;\nuniform int affectedByDistance;\nuniform vec3 screenPosition;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 alignment;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position + alignment;\nvec2 rotatedPosition;\nrotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;\nrotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;\nvec4 finalPosition;\nif( useScreenCoordinates != 0 ) {\nfinalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );\n} else {\nfinalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );\n}\ngl_Position = finalPosition;\n}",
fragmentShader:"precision mediump float;\nuniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nuniform int fogType;\nuniform vec3 fogColor;\nuniform float fogDensity;\nuniform float fogNear;\nuniform float fogFar;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\nif ( fogType > 0 ) {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat fogFactor = 0.0;\nif ( fogType == 1 ) {\nfogFactor = smoothstep( fogNear, fogFar, depth );\n} else {\nconst float LOG2 = 1.442695;\nfloat fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n}\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n}\n}"}};
;

/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.TrackballControls = function ( object, domElement ) {

	THREE.EventTarget.call( this );

	var _this = this;
	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 };
	this.radius = ( this.screen.width + this.screen.height ) / 4;

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var _state = STATE.NONE,
	_prevState = STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	// events

	var changeEvent = { type: 'change' };


	// methods

	this.handleResize = function () {

		this.screen.width = window.innerWidth;
		this.screen.height = window.innerHeight;

		this.screen.offsetLeft = 0;
		this.screen.offsetTop = 0;

		this.radius = ( this.screen.width + this.screen.height ) / 4;
	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.getMouseOnScreen = function ( clientX, clientY ) {

		return new THREE.Vector2(
			( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
			( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
		);

	};

	this.getMouseProjectionOnBall = function ( clientX, clientY ) {

		var mouseOnBall = new THREE.Vector3(
			( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
			( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
			0.0
		);

		var length = mouseOnBall.length();

		if ( length > 1.0 ) {

			mouseOnBall.normalize();

		} else {

			mouseOnBall.z = Math.sqrt( 1.0 - length * length );

		}

		_eye.copy( _this.object.position ).subSelf( _this.target );

		var projection = _this.object.up.clone().setLength( mouseOnBall.y );
		projection.addSelf( _this.object.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) );
		projection.addSelf( _eye.setLength( mouseOnBall.z ) );

		return projection;

	};

	this.rotateCamera = function () {

		var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

		if ( angle ) {

			var axis = ( new THREE.Vector3() ).cross( _rotateStart, _rotateEnd ).normalize(),
				quaternion = new THREE.Quaternion();

			angle *= _this.rotateSpeed;

			quaternion.setFromAxisAngle( axis, -angle );

			quaternion.multiplyVector3( _eye );
			quaternion.multiplyVector3( _this.object.up );

			quaternion.multiplyVector3( _rotateEnd );

			if ( _this.staticMoving ) {

				_rotateStart.copy( _rotateEnd );

			} else {

				quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
				quaternion.multiplyVector3( _rotateStart );

			}

		}

	};

	this.zoomCamera = function () {

		var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

		if ( factor !== 1.0 && factor > 0.0 ) {

			_eye.multiplyScalar( factor );

			if ( _this.staticMoving ) {

				_zoomStart.copy( _zoomEnd );

			} else {

				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	};

	this.panCamera = function () {

		var mouseChange = _panEnd.clone().subSelf( _panStart );

		if ( mouseChange.lengthSq() ) {

			mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

			var pan = _eye.clone().crossSelf( _this.object.up ).setLength( mouseChange.x );
			pan.addSelf( _this.object.up.clone().setLength( mouseChange.y ) );

			_this.object.position.addSelf( pan );
			_this.target.addSelf( pan );

			if ( _this.staticMoving ) {

				_panStart = _panEnd;

			} else {

				_panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

			}

		}

	};

	this.checkDistances = function () {

		if ( !_this.noZoom || !_this.noPan ) {

			if ( _this.object.position.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.setLength( _this.maxDistance );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.add( _this.target, _eye.setLength( _this.minDistance ) );

			}

		}

	};

	this.update = function () {

		_eye.copy( _this.object.position ).subSelf( _this.target );

		if ( !_this.noRotate ) {

			_this.rotateCamera();

		}

		if ( !_this.noZoom ) {

			_this.zoomCamera();

		}

		if ( !_this.noPan ) {

			_this.panCamera();

		}

		_this.object.position.add( _this.target, _eye );

		_this.checkDistances();

		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {

			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	// listeners

	function keydown( event ) {

		if ( ! _this.enabled ) return;

		window.removeEventListener( 'keydown', keydown );

		_prevState = _state;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

			_state = STATE.PAN;

		}

	}

	function keyup( event ) {

		if ( ! _this.enabled ) return;

		_state = _prevState;

		window.addEventListener( 'keydown', keydown, false );

	}

	function mousedown( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

		}

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );

	}

	function mousemove( event ) {

		if ( ! _this.enabled ) return;

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		}

	}

	function mouseup( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );

	}

	function mousewheel( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta / 40;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail / 3;

		}

		_zoomStart.y += ( 1 / delta ) * 0.05;

	}

	function touchstart( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();

		switch ( event.touches.length ) {

			case 1:
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;
			case 2:
				_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;
			case 3:
				_panStart = _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

		}

	}

	function touchmove( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();

		switch ( event.touches.length ) {

			case 1:
				_rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;
			case 2:
				_zoomEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;
			case 3:
				_panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousedown', mousedown, false );

	this.domElement.addEventListener( 'mousewheel', mousewheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchstart, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

};;

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = "absolute";
	this.element.style.WebkitTransformStyle = 'preserve-3d';
	this.element.style.MozTransformStyle = 'preserve-3d';
	this.element.style.oTransformStyle = 'preserve-3d';
	this.element.style.transformStyle = 'preserve-3d';

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );

//

THREE.CSS3DRenderer = function () {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;
	var _projector = new THREE.Projector();

	var _tmpMatrix = new THREE.Matrix4();

	this.domElement = document.createElement( 'div' );

	this.domElement.style.overflow = 'hidden';

	this.domElement.style.WebkitTransformStyle = 'preserve-3d';
	this.domElement.style.WebkitPerspectiveOrigin = '50% 50%';

	this.domElement.style.MozTransformStyle = 'preserve-3d';
	this.domElement.style.MozPerspectiveOrigin = '50% 50%';

	this.domElement.style.oTransformStyle = 'preserve-3d';
	this.domElement.style.oPerspectiveOrigin = '50% 50%';

	this.domElement.style.transformStyle = 'preserve-3d';
	this.domElement.style.perspectiveOrigin = '50% 50%';

	// TODO: Shouldn't it be possible to remove cameraElement?

	this.cameraElement = document.createElement( 'div' );

	this.cameraElement.style.WebkitTransformStyle = 'preserve-3d';
	this.cameraElement.style.MozTransformStyle = 'preserve-3d';
	this.cameraElement.style.oTransformStyle = 'preserve-3d';
	this.cameraElement.style.transformStyle = 'preserve-3d';

	this.domElement.appendChild( this.cameraElement );

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';

		this.cameraElement.style.width = width + 'px';
		this.cameraElement.style.height = height + 'px';

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

        };

	var getCameraCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

		return 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( - elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( - elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( - elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	}

	var getObjectCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

		return 'translate3d(-50%,-50%,0) matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		') scale3d(1,-1,1)';

	}

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( camera.fov * Math.PI / 360 ) * _height;

		this.domElement.style.WebkitPerspective = fov + "px";
		this.domElement.style.MozPerspective = fov + "px";
		this.domElement.style.oPerspective = fov + "px";
		this.domElement.style.perspective = fov + "px";

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

		this.cameraElement.style.WebkitTransform = style;
		this.cameraElement.style.MozTransform = style;
		this.cameraElement.style.oTransform = style;
		this.cameraElement.style.transform = style;

		var objects = _projector.projectScene( scene, camera, false ).objects;

		for ( var i = 0, il = objects.length; i < il; i ++ ) {

			var object = objects[ i ].object;

			if ( object instanceof THREE.CSS3DObject ) {

				var element = object.element;

				if ( object instanceof THREE.CSS3DSprite ) {

					// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

					_tmpMatrix.copy( camera.matrixWorldInverse );
					_tmpMatrix.transpose();
					_tmpMatrix.extractPosition( object.matrixWorld );

					_tmpMatrix.elements[ 3 ] = 0;
					_tmpMatrix.elements[ 7 ] = 0;
					_tmpMatrix.elements[ 11 ] = 0;
					_tmpMatrix.elements[ 15 ] = 1;

					style = getObjectCSSMatrix( _tmpMatrix );

				} else {

					style = getObjectCSSMatrix( object.matrixWorld );

				}

				/*
				element.style.WebkitBackfaceVisibility = 'hidden';
				element.style.MozBackfaceVisibility = 'hidden';
				element.style.oBackfaceVisibility = 'hidden';
				element.style.backfaceVisibility = 'hidden';
				*/

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				if ( element.parentNode !== this.cameraElement ) {

					this.cameraElement.appendChild( element );

				}

			}

		}

	};

};;

(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch || {};
  var ar = br['auto-reload'] || {};
  if (!WebSocket || !ar.enabled) return;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel="stylesheet"]'))
        .filter(function(link){
          return (link != null && link.href != null);
        })
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });
    }
  };
  var port = ar.port || 9485;
  var host = (!br['server']) ? window.location.hostname : br['server'];
  var connection = new WebSocket('ws://' + host + ':' + port);
  connection.onmessage = function(event) {
    var message = event.data;
    var b = window.brunch;
    if (!b || !b['auto-reload'] || !b['auto-reload'].enabled) return;
    if (reloaders[message] != null) {
      reloaders[message]();
    } else {
      reloaders.page();
    }
  };
})();
;

// lib/handlebars/base.js

/*jshint eqnull:true*/
this.Handlebars = {};

(function(Handlebars) {

Handlebars.VERSION = "1.0.rc.1";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "", data;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      if (data) { data.index = i; }
      ret = ret + fn(context[i], { data: data });
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});

}(this.Handlebars));
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
;

/*!
 * VERSION: beta 1.13
 * DATE: 2012-11-14
 * JavaScript (also available in AS3 and AS2)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.BezierPlugin",["plugins.TweenPlugin"],function(E){var y=function(){E.call(this,"bezier",-1);this._overwriteProps.pop();this._func={};this._round={}},D=y.prototype=new E("bezier",1),H=180/Math.PI,z=[],A=[],B=[],F={},C=function(a,d,g,m){this.a=a;this.b=d;this.c=g;this.d=m;this.da=m-a;this.ca=g-a;this.ba=d-a},I=y.bezierThrough=function(a,d,g,m,j,b){var c={},f=[],e,i,n,j="string"===typeof j?","+j+",":",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,";
null==d&&(d=1);for(i in a[0])f.push(i);z.length=A.length=B.length=0;for(e=f.length;-1<--e;){i=f[e];F[i]=-1!==j.indexOf(","+i+",");n=c;var s=i,p;p=a;var k=i,t=F[i],l=b,q=[],r=void 0,h=void 0,v=void 0,u=void 0,w=void 0,r=void 0;if(l){p=[l].concat(p);for(h=p.length;-1<--h;)if("string"===typeof(r=p[h][k]))"="===r.charAt(1)&&(p[h][k]=l[k]+Number(r.charAt(0)+r.substr(2)))}r=p.length-2;if(0>r)q[0]=new C(p[0][k],0,0,p[-1>r?0:1][k]);else{for(h=0;h<r;h++)v=p[h][k],u=p[h+1][k],q[h]=new C(v,0,0,u),t&&(w=p[h+
2][k],z[h]=(z[h]||0)+(u-v)*(u-v),A[h]=(A[h]||0)+(w-u)*(w-u));q[h]=new C(p[h][k],0,0,p[h+1][k])}p=q;n[s]=p}for(e=z.length;-1<--e;)z[e]=Math.sqrt(z[e]),A[e]=Math.sqrt(A[e]);if(!m){for(e=f.length;-1<--e;)if(F[i]){a=c[f[e]];n=a.length-1;for(j=0;j<n;j++)b=a[j+1].da/A[j]+a[j].da/z[j],B[j]=(B[j]||0)+b*b}for(e=B.length;-1<--e;)B[e]=Math.sqrt(B[e])}for(e=f.length;-1<--e;){i=f[e];a=c[i];j=d;b=g;n=m;i=F[i];s=a.length-1;p=0;for(var k=a[0].a,x=w=u=l=r=u=v=r=h=v=q=l=t=void 0,t=0;t<s;t++)h=a[p],l=h.a,q=h.d,v=a[p+
1].d,i?(u=z[t],w=A[t],x=0.25*(w+u)*j/(n?0.5:B[t]||0.5),r=q-(q-l)*(n?0.5*j:x/u),v=q+(v-q)*(n?0.5*j:x/w),u=q-(r+(v-r)*(3*u/(u+w)+0.5)/4)):(r=q-0.5*(q-l)*j,v=q+0.5*(v-q)*j,u=q-(r+v)/2),r+=u,v+=u,h.c=r,h.b=0!==t?k:k=h.a+0.6*(h.c-h.a),h.da=q-l,h.ca=r-l,h.ba=k-l,b?(l=G(l,k,r,q),a.splice(p,1,l[0],l[1],l[2],l[3]),p+=4):p++,k=v;h=a[p];h.b=k;h.c=k+0.4*(h.d-k);h.da=h.d-h.a;h.ca=h.c-h.a;h.ba=k-h.a;b&&(l=G(h.a,k,h.c,h.d),a.splice(p,1,l[0],l[1],l[2],l[3]))}return c},G=y.cubicToQuadratic=function(a,d,g,m){var j=
{a:a},b={},c={},f={c:m},e=(a+d)/2,i=(d+g)/2,g=(g+m)/2,d=(e+i)/2,i=(i+g)/2,n=(i-d)/8;j.b=e+(a-e)/4;b.b=d+n;j.c=b.a=(j.b+b.b)/2;b.c=c.a=(d+i)/2;c.b=i-n;f.b=g+(m-g)/4;c.c=f.a=(c.b+f.b)/2;return[j,b,c,f]};y.quadraticToCubic=function(a,d,g){return new C(a,(2*d+a)/3,(2*d+g)/3,g)};D.constructor=y;y.API=2;y._cssRegister=function(){var a=window.com.greensock.plugins.CSSPlugin;if(a){var a=a._internals,d=a._parseToProxy,g=a._setPluginRatio,m=a._specialProps,j=a.CSSPropTween;a._registerComplexSpecialProp("bezier",
null,function(a,c,f,e,i,n){c instanceof Array&&(c={values:c});var n=new y,f=c.values,s=f.length-1,p=[],k={},t,l,q;if(0>s)return i;for(t=0;t<=s;t++)q=d(a,f[t],e,i,n,s!==t),p[t]=q.end;for(l in c)k[l]=c[l];k.values=p;i=new j(a,"bezier",0,0,q.pt,2);i.data=q;i.plugin=n;i.setRatio=g;0===k.autoRotate&&(k.autoRotate=!0);k.autoRotate&&!(k.autoRotate instanceof Array)&&(t=!0===k.autoRotate?0:Number(k.autoRotate)*_DEG2RAD,k.autoRotate=null!=q.end.left?[["left","top","rotation",t,!0]]:null!=q.end.x?[["x","y",
"rotation",t,!0]]:!1);k.autoRotate&&(e._transform||(i=m.rotation.parse(a,0,l,e,i,n,{})),q.autoRotate=e._transform);n._onInitTween(q.proxy,k,e._tween);return i})}};D._onInitTween=function(a,d,g){this._target=a;d instanceof Array&&(d={values:d});this._props=[];this._timeRes=null==d.timeResolution?6:parseInt(d.timeResolution);var m=d.values||[],j={},b=m[0],g=d.autoRotate||g.vars.orientToBezier,c,f,e;this._autoRotate=g?g instanceof Array?g:[["x","y","rotation",!0===g?0:Number(g)||0]]:null;for(c in b)this._props.push(c);
for(b=this._props.length;-1<--b;)c=this._props[b],this._overwriteProps.push(c),g=this._func[c]="function"===typeof a[c],j[c]=!g?parseFloat(a[c]):a[c.indexOf("set")||"function"!==typeof a["get"+c.substr(3)]?c:"get"+c.substr(3)](),e||j[c]!==m[0][c]&&(e=j);if("cubic"!==d.type&&"quadratic"!==d.type&&"soft"!==d.type)j=I(m,isNaN(d.curviness)?1:d.curviness,!1,"thruBasic"===d.type,d.correlate,e);else{g=(g=d.type)||"soft";d={};e="cubic"===g?3:2;var g="soft"===g,b=[],i,n,s,p,k,t,l,q,r;g&&j&&(m=[j].concat(m));
if(null==m||m.length<e+1)throw"invalid Bezier data";for(n in m[0])b.push(n);for(t=b.length;-1<--t;){n=b[t];d[n]=k=[];r=0;q=m.length;for(l=0;l<q;l++)i=null==j?m[l][n]:"string"===typeof(s=m[l][n])&&"="===s.charAt(1)?j[n]+Number(s.charAt(0)+s.substr(2)):Number(s),g&&1<l&&l<q-1&&(k[r++]=(i+k[r-2])/2),k[r++]=i;q=r-e+1;for(l=r=0;l<q;l+=e)i=k[l],n=k[l+1],s=k[l+2],p=2===e?0:k[l+3],k[r++]=s=3===e?new C(i,n,s,p):new C(i,(2*n+i)/3,(2*n+s)/3,s);k.length=r}j=d}this._beziers=j;this._segCount=this._beziers[c].length;
if(this._timeRes){b=this._beziers;c=this._timeRes;c=c>>0||6;j=[];n=[];m=s=0;d=c-1;e=[];g=[];for(f in b){i=b[f];k=j;t=c;l=1/t;q=i.length;for(var h=void 0,v=void 0,u=p=r=v=void 0,w=h=void 0,x=void 0,x=u=void 0;-1<--q;){u=i[q];v=u.a;r=u.d-v;p=u.c-v;u=u.b-v;v=0;for(w=1;w<=t;w++)h=l*w,x=1-h,h=v-(v=(h*h*r+3*x*(h*p+x*u))*h),x=q*t+w-1,k[x]=(k[x]||0)+h*h}}b=j.length;for(f=0;f<b;f++)s+=Math.sqrt(j[f]),i=f%c,g[i]=s,i===d&&(m+=s,i=f/c>>0,e[i]=g,n[i]=m,s=0,g=[]);this._length=m;this._lengths=n;this._segments=e;
this._l1=this._li=this._s1=this._si=0;this._l2=this._lengths[0];this._curSeg=this._segments[0];this._s2=this._curSeg[0];this._prec=1/this._curSeg.length}if(g=this._autoRotate){g[0]instanceof Array||(this._autoRotate=g=[g]);for(b=g.length;-1<--b;)for(f=0;3>f;f++)c=g[b][f],this._func[c]="function"===typeof a[c]?a[c.indexOf("set")||"function"!==typeof a["get"+c.substr(3)]?c:"get"+c.substr(3)]:!1}return!0};D.setRatio=function(a){var d=this._segCount,g=this._func,m=this._target,j,b,c,f,e;if(this._timeRes){j=
this._lengths;f=this._curSeg;a*=this._length;b=this._li;if(a>this._l2&&b<d-1){for(d-=1;b<d&&(this._l2=j[++b])<=a;);this._l1=j[b-1];this._li=b;this._curSeg=f=this._segments[b];this._s2=f[this._s1=this._si=0]}else if(a<this._l1&&0<b){for(;0<b&&(this._l1=j[--b])>=a;);0===b&&a<this._l1?this._l1=0:b++;this._l2=j[b];this._li=b;this._curSeg=f=this._segments[b];this._s1=f[(this._si=f.length-1)-1]||0;this._s2=f[this._si]}j=b;a-=this._l1;b=this._si;if(a>this._s2&&b<f.length-1){for(d=f.length-1;b<d&&(this._s2=
f[++b])<=a;);this._s1=f[b-1];this._si=b}else if(a<this._s1&&0<b){for(;0<b&&(this._s1=f[--b])>=a;);0===b&&a<this._s1?this._s1=0:b++;this._s2=f[b];this._si=b}f=(b+(a-this._s1)/(this._s2-this._s1))*this._prec}else j=0>a?0:1<=a?d-1:d*a>>0,f=(a-j*(1/d))*d;d=1-f;for(b=this._props.length;-1<--b;)if(a=this._props[b],c=this._beziers[a][j],e=(f*f*c.da+3*d*(f*c.ca+d*c.ba))*f+c.a,this._round[a]&&(e=e+(0<e?0.5:-0.5)>>0),g[a])m[a](e);else m[a]=e;if(this._autoRotate){var d=this._autoRotate,i,n,s,p,k;for(b=d.length;-1<
--b;)a=d[b][2],p=d[b][3]||0,k=!0===d[b][4]?1:H,c=this._beziers[d[b][0]][j],e=this._beziers[d[b][1]][j],i=c.a+(c.b-c.a)*f,n=c.b+(c.c-c.b)*f,i+=(n-i)*f,n+=(c.c+(c.d-c.c)*f-n)*f,c=e.a+(e.b-e.a)*f,s=e.b+(e.c-e.b)*f,c+=(s-c)*f,s+=(e.c+(e.d-e.c)*f-s)*f,e=Math.atan2(s-c,n-i)*k+p,g[a]?g[a].call(m,e):m[a]=e}};D._roundProps=function(a,d){for(var g=this._overwriteProps,m=g.length;-1<--m;)if(a[g[m]]||a.bezier||a.bezierThrough)this._round[g[m]]=d};D._kill=function(a){var d=this._props,g,m;for(g in this._beziers)if(g in
a){delete this._beziers[g];delete this._func[g];for(m=d.length;-1<--m;)d[m]===g&&d.splice(m,1)}return E.prototype._kill.call(this,a)};E.activate([y]);return y},!0)});window._gsDefine&&_gsQueue.pop()();;

/*!
 * VERSION: beta 1.648
 * DATE: 2012-11-23
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(R){var w=function(){R.call(this,"css");this._overwriteProps.length=0},X,Y,s,Z,J={},l=w.prototype=new R("css");l.constructor=w;w.version=1.648;w.API=2;w.defaultTransformPerspective=0;l="px";w.suffixMap={top:l,right:l,bottom:l,left:l,width:l,height:l,fontSize:l,padding:l,margin:l,perspective:l};var $=/(?:\d|\-\d|\.\d|\-\.\d)+/g,ja=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
aa=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,S=/[^\d\-\.]/g,Ba=/(?:\d|\-|\+|=|#|\.)*/g,ba=/opacity *= *([^)]*)/,Ca=/opacity:([^;]*)/,ka=/([A-Z])/g,la=/-([a-z])/gi,ma=function(a,b){return b.toUpperCase()},Da=/(?:Left|Right|Width)/i,Ea=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,Fa=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,E=Math.PI/180,N=180/Math.PI,T={},O=document,P=O.createElement("div"),F=w._internals={_specialProps:J},x=navigator.userAgent,ca,na,oa,pa,qa,K,ra=x.indexOf("Android"),sa=
O.createElement("div");pa=(oa=-1!==x.indexOf("Safari")&&-1===x.indexOf("Chrome")&&(-1===ra||3<Number(x.substr(ra+8,1))))&&6>Number(x.substr(x.indexOf("Version/")+8,1));/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(x);qa=parseFloat(RegExp.$1);sa.innerHTML="<a style='top:1px;opacity:.55;'>a</a>";K=(x=sa.getElementsByTagName("a")[0])?/^0.55/.test(x.style.opacity):!1;var ta=function(a){return ba.test("string"===typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100:1},ua=
"",da="",Q=function(a,b){var b=b||P,e=b.style,c,f;if(void 0!==e[a])return a;a=a.charAt(0).toUpperCase()+a.substr(1);c=["O","Moz","ms","Ms","Webkit"];for(f=5;-1<--f&&void 0===e[c[f]+a];);return 0<=f?(da=3===f?"ms":c[f],ua="-"+da.toLowerCase()+"-",da+a):null},U=O.defaultView?O.defaultView.getComputedStyle:function(){},v=w.getStyle=function(a,b,e,c,f){var i;if(!K&&"opacity"===b)return ta(a);!c&&a.style[b]?i=a.style[b]:(e=e||U(a,null))?i=(a=e.getPropertyValue(b.replace(ka,"-$1").toLowerCase()))||e.length?
a:e[b]:a.currentStyle&&(e=a.currentStyle,i=e[b],!i&&"backgroundPosition"===b&&(i=e[b+"X"]+" "+e[b+"Y"]));return null!=f&&(!i||"none"===i||"auto"===i||"auto auto"===i)?f:i},V=function(a,b,e){var c={},f=a._gsOverwrittenClassNamePT,i;if(f&&!e){for(;f;)f.setRatio(0),f=f._next;a._gsOverwrittenClassNamePT=null}if(b=b||U(a,null))if(i=b.length)for(;-1<--i;)c[b[i].replace(la,ma)]=b.getPropertyValue(b[i]);else for(i in b)c[i]=b[i];else if(b=a.currentStyle||a.style)for(i in b)c[i.replace(la,ma)]=b[i];K||(c.opacity=
ta(a));a=ea(a,b,!1);c.rotation=a.rotation*N;c.rotationX=a.rotationX*N;c.rotationY=a.rotationY*N;c.skewX=a.skewX*N;c.scaleX=a.scaleX;c.scaleY=a.scaleY;c.scaleZ=a.scaleZ;c.x=a.x;c.y=a.y;c.z=a.z;c.filters&&delete c.filters;return c},va=function(a,b,e,c){var f={},a=a.style,i,d,g;for(d in e)if("cssText"!==d&&"length"!==d&&isNaN(d)&&b[d]!==(i=e[d]))if(-1===d.indexOf("Origin")&&("number"===typeof i||"string"===typeof i))f[d]=(""===i||"auto"===i||"none"===i)&&"string"===typeof b[d]&&""!==b[d].replace(S,"")?
0:i,void 0!==a[d]&&(g=new fa(a,d,a[d],g));if(c)for(d in c)"className"!==d&&(f[d]=c[d]);return{difs:f,firstMPT:g}},Ga={width:["Left","Right"],height:["Top","Bottom"]},Ha=["marginLeft","marginRight","marginTop","marginBottom"],D=function(a,b,e,c,f){if("px"===c||!c)return e;if("auto"===c||!e)return 0;var i=Da.test(b),d=a,g=P.style,j=0>e;j&&(e=-e);"%"===c&&-1!==b.indexOf("border")?i=e/100*(i?a.clientWidth:a.clientHeight):(g.cssText="border-style:solid; border-width:0; position:absolute; line-height:0;",
"%"===c||"em"===c||!d.appendChild?(d=a.parentNode||O.body,g[i?"width":"height"]=e+c):g[i?"borderLeftWidth":"borderTopWidth"]=e+c,d.appendChild(P),i=parseFloat(P[i?"offsetWidth":"offsetHeight"]),d.removeChild(P),0===i&&!f&&(i=D(a,b,e,c,!0)));return j?-i:i},ga=function(a,b){if(null==a||""===a||"auto"===a||"auto auto"===a)a="0 0";var e=a.split(" "),c=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":e[0],f=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":e[1];null==f?f="0":"center"===
f&&(f="50%");if("center"===c||isNaN(parseFloat(c)))c="50%";b&&(b.oxp=-1!==c.indexOf("%"),b.oyp=-1!==f.indexOf("%"),b.oxr="="===c.charAt(1),b.oyr="="===f.charAt(1),b.ox=parseFloat(c.replace(S,"")),b.oy=parseFloat(f.replace(S,"")));return c+" "+f+(2<e.length?" "+e[2]:"")},wa=function(a,b){return"string"===typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1")*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(b)},G=function(a,b){return null==a?b:"string"===typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+
"1")*Number(a.substr(2))+b:Number(a)},L=function(a,b){if(null==a)return b;var e=-1===a.indexOf("rad")?E:1,c="="===a.charAt(1),a=Number(a.replace(S,""))*e;return c?a+b:a},ha=function(a,b){var e=(("number"===typeof a?a*E:L(a,b))-b)%(2*Math.PI);e!==e%Math.PI&&(e+=Math.PI*(0>e?2:-2));return b+e},M={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,
0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ia=function(a){if(!a||""===a)return M.black;if(M[a])return M[a];if("number"===typeof a)return[a>>16,a>>8&255,a&255];if("#"===a.charAt(0)){if(4===a.length)var b=a.charAt(1),e=a.charAt(2),a=a.charAt(3),a="#"+b+b+e+e+a+a;a=parseInt(a.substr(1),16);return[a>>16,a>>8&255,a&255]}a=a.match($)||M.transparent;a[0]=Number(a[0]);a[1]=Number(a[1]);a[2]=Number(a[2]);
3<a.length&&(a[3]=Number(a[3]));return a},H="(?:\\b(?:(?:rgb|rgba)\\(.+?\\))|\\B#.+?\\b";for(l in M)H+="|"+l+"\\b";var H=RegExp(H+")","gi"),xa=function(a,b,e){if(null==a)return function(a){return a};var c=b?(a.match(H)||[""])[0]:"",f=a.split(c).join("").match(aa)||[],i=a.substr(0,a.indexOf(f[0])),d=")"===a.charAt(a.length-1)?")":"",g=-1!==a.indexOf(" ")?" ":",",j=f.length,h=0<j?f[0].replace($,""):"";return b?function(a){"number"===typeof a&&(a+=h);var b=(a.match(H)||[c])[0],a=a.split(b).join("").match(aa)||
[],n=a.length;if(j>n--)for(;++n<j;)a[n]=e?a[(n-1)/2>>0]:f[n];return i+a.join(g)+g+b+d}:function(a){"number"===typeof a&&(a+=h);var a=a.match(aa)||[],b=a.length;if(j>b--)for(;++b<j;)a[b]=e?a[(b-1)/2>>0]:f[b];return i+a.join(g)+d}},x=function(a){a=a.split(",");return function(b,e,c,f,i,d,g){e=(e+"").split(" ");g={};for(c=0;4>c;c++)g[a[c]]=e[c]=e[c]||e[(c-1)/2>>0];return f.parse(b,g,i,d)}};F._setPluginRatio=function(a){this.plugin.setRatio(a);for(var b=this.data,e=b.proxy,c=b.firstMPT,f;c;)f=e[c.v],
c.r?f=0<f?f+0.5>>0:f-0.5>>0:1E-6>f&&-1E-6<f&&(f=0),c.t[c.p]=f,c=c._next;b.autoRotate&&(b.autoRotate.rotation=e.rotation);if(1===a)for(c=b.firstMPT;c;){a=c.t;if(a.type){if(1===a.type){e=a.xs0+a.s+a.xs1;for(b=1;b<a.l;b++)e+=a["xn"+b]+a["xs"+(b+1)];a.e=e}}else a.e=a.s+a.xs0;c=c._next}};var fa=function(a,b,e,c,f){this.t=a;this.p=b;this.v=e;this.r=f;c&&(c._prev=this,this._next=c)};F._parseToProxy=function(a,b,e,c,f,i){var d=c,g={},j={},h=e._transform,k=T,m;e._transform=null;T=b;c=a=e.parse(a,b,c,f);T=
k;i&&(e._transform=h,d&&(d._prev=null,d._prev&&(d._prev._next=null)));for(;c&&c!==d;){if(1>=c.type&&(h=c.p,j[h]=c.s+c.c,g[h]=c.s,i||(m=new fa(c,"s",h,m,c.r),c.c=0),1===c.type))for(e=c.l;0<--e;)k="xn"+e,h=c.p+"_"+k,j[h]=c.data[k],g[h]=c[k],i||(m=new fa(c,k,h,m,c.rxp[k]));c=c._next}return{proxy:g,end:j,firstMPT:m,pt:a}};var q=F.CSSPropTween=function(a,b,e,c,f,i,d,g,j,h,k){this.t=a;this.p=b;this.s=e;this.c=c;this.n=d||"css_"+b;a instanceof q||Z.push(this.n);this.r=g;this.type=i||0;j&&(this.pr=j,X=!0);
this.b=void 0===h?e:h;this.e=void 0===k?e+c:k;f&&(this._next=f,f._prev=this)},W=w.parseComplex=function(a,b,e,c,f,i,d,g,j,h){var d=new q(a,b,0,0,d,h?2:1,null,!1,g,e,c),a=e.split(", ").join(",").split(" "),b=(c+"").split(", ").join(",").split(" "),e=a.length,g=!1!==ca,k,m,n,A,l;e!==b.length&&(a=(i||"").split(" "),e=a.length);d.plugin=j;d.setRatio=h;for(i=0;i<e;i++)if(j=a[i],k=b[i],(h=parseFloat(j))||0===h)d.appendXtra("",h,wa(k,h),k.replace(ja,""),g&&-1!==k.indexOf("px"),!0);else if(f&&("#"===j.charAt(0)||
0===j.indexOf("rgb")||M[j]))j=ia(j),k=ia(k),(h=6<j.length+k.length)&&!K&&0===k[3]?(d["xs"+d.l]+=d.l?" transparent":"transparent",d.e=d.e.split(b[i]).join("transparent")):(d.appendXtra(h?"rgba(":"rgb(",j[0],k[0]-j[0],",",!0,!0).appendXtra("",j[1],k[1]-j[1],",",!0).appendXtra("",j[2],k[2]-j[2],h?",":")",!0),h&&(j=4>j.length?1:j[3],d.appendXtra("",j,(4>k.length?1:k[3])-j,")",!1)));else if(h=j.match($)){n=k.match(ja);if(!n||n.length!==h.length)return d;for(k=m=0;k<h.length;k++)l=h[k],A=j.indexOf(l,m),
d.appendXtra(j.substr(m,A-m),Number(l),wa(n[k],l),"",g&&"px"===j.substr(A+l.length,2),0===k),m=A+l.length;d["xs"+d.l]+=j.substr(m)}else d["xs"+d.l]+=d.l?" "+j:j;if(-1!==c.indexOf("=")&&d.data){c=d.xs0+d.data.s;for(i=1;i<d.l;i++)c+=d["xs"+i]+d.data["xn"+i];d.e=c+d["xs"+i]}d.l||(d.type=-1,d.xs0=d.e);return d.xfirst||d},B=9,l=q.prototype;for(l.l=l.pr=0;0<--B;)l["xn"+B]=0,l["xs"+B]="";l.xs0="";l._next=l._prev=l.xfirst=l.data=l.plugin=l.setRatio=l.rxp=null;l.appendXtra=function(a,b,e,c,f,i){var d=this.l;
this["xs"+d]+=i&&d?" "+a:a||"";if(!e&&0!==d&&!this.plugin)return this["xs"+d]+=b+(c||""),this;this.l++;this.type=this.setRatio?2:1;this["xs"+this.l]=c||"";if(0<d)return this.data["xn"+d]=b+e,this.rxp["xn"+d]=f,this["xn"+d]=b,this.plugin||(this.xfirst=new q(this,"xn"+d,b,e,this.xfirst||this,0,this.n,f,this.pr),this.xfirst.xs0=0),this;this.data={s:b+e};this.rxp={};this.s=b;this.c=e;this.r=f;return this};var ya=function(a,b,e,c,f,i,d){this.p=c?Q(a)||a:a;J[a]=J[this.p]=this;this.format=i||xa(b,f);e&&
(this.parse=e);this.clrs=f;this.dflt=b;this.pr=d||0},p=F._registerComplexSpecialProp=function(a,b,e,c,f,i,d){for(var a=a.split(","),b=b instanceof Array?b:[b],g=a.length;-1<--g;)new ya(a[g],b[g],e,c&&0===g,f,i,d)},F=function(a,b){J[a]||p(a,null,function(a,c,f,i,d,g,j){var h=window.com.greensock.plugins[b];if(!h)return window.console&&console.log("Error: "+b+" js file not loaded."),d;h._cssRegister();return J[f].parse(a,c,f,i,d,g,j)})},l=ya.prototype;l.parseComplex=function(a,b,e,c,f,i){return W(a,
this.p,b,e,this.clrs,this.dflt,c,this.pr,f,i)};l.parse=function(a,b,e,c,f,i){return this.parseComplex(a.style,this.format(v(a,e,s,!1,this.dflt)),this.format(b),f,i)};w.registerSpecialProp=function(a,b,e){p(a,null,function(a,f,i,d,g,j){g=new q(a,i,0,0,g,2,i,!1,e);g.plugin=j;g.setRatio=b(a,f,d._tween,i);return g},!1,!1,null,e)};var za="scaleX scaleY scaleZ x y z skewX rotation rotationX rotationY perspective".split(" "),C=Q("transform"),Ia=ua+"transform",Aa=Q("transformOrigin"),I=null!==Q("perspective"),
ea=function(a,b,e){var c=e?a._gsTransform||{skewY:0}:{skewY:0},f=0>c.scaleX,i=I?parseFloat(v(a,Aa,b,!1,"0 0 0").split(" ")[2])||c.zOrigin||0:0,d,g,j,h,k,m,n,A;C?d=v(a,Ia,b,!0):a.currentStyle&&(d=(d=a.currentStyle.filter.match(Ea))&&4===d.length?d[0].substr(4)+","+Number(d[2].substr(4))+","+Number(d[1].substr(4))+","+d[3].substr(4)+","+(c?c.x:0)+","+(c?c.y:0):null);g=(d||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[];for(b=g.length;-1<--b;)g[b]=Number(g[b]);if(16===g.length){if(f=g[8],d=g[9],j=g[10],h=g[12],
k=g[13],m=g[14],c.zOrigin&&(m=-c.zOrigin,h=f*m-g[12],k=d*m-g[13],m=j*m+c.zOrigin-g[14]),!e||h!==c.x||k!==c.y||m!==c.z){n=g[0];A=g[1];var l=g[2],z=g[3],t=g[4],r=g[5],p=g[6],Ja=g[7];g=g[11];var s=c.rotationX=Math.atan2(p,j),q,x,u,y;s&&(u=Math.cos(-s),y=Math.sin(-s),s=t*u+f*y,q=r*u+d*y,x=p*u+j*y,f=t*-y+f*u,d=r*-y+d*u,j=p*-y+j*u,g=Ja*-y+g*u,t=s,r=q,p=x);if(s=c.rotationY=Math.atan2(f,n))u=Math.cos(-s),y=Math.sin(-s),q=A*u-d*y,x=l*u-j*y,d=A*y+d*u,j=l*y+j*u,g=z*y+g*u,n=n*u-f*y,A=q,l=x;if(s=c.rotation=Math.atan2(A,
r))u=Math.cos(-s),y=Math.sin(-s),n=n*u+t*y,q=A*u+r*y,r=A*-y+r*u,p=l*-y+p*u,A=q;Math.abs(c.rotationY)>Math.PI/2&&(c.rotationY*=-1,c.rotationX+=Math.PI,c.rotation=Math.PI-c.rotation);c.scaleX=Math.sqrt(n*n+A*A);c.scaleY=Math.sqrt(r*r+d*d);c.scaleZ=Math.sqrt(p*p+j*j);c.skewX=0;c.perspective=g?1/g:0;c.x=h;c.y=k;c.z=m}}else if(!I||0===g.length||c.x!==g[4]||c.y!==g[5]||!c.rotationX&&!c.rotationY){h=(d=6<=g.length)?g[0]:1;m=g[1]||0;k=g[2]||0;n=d?g[3]:1;c.x=g[4]||0;c.y=g[5]||0;d=Math.sqrt(h*h+m*m);j=Math.sqrt(n*
n+k*k);h=h||m?Math.atan2(m,h):c.rotation||0;k=k||n?Math.atan2(k,n)+h:c.skewX||0;m=d-Math.abs(c.scaleX||0);n=j-Math.abs(c.scaleY||0);Math.abs(k)>Math.PI/2&&Math.abs(k)<1.5*Math.PI&&(f?(d*=-1,k+=0>=h?Math.PI:-Math.PI,h+=0>=h?Math.PI:-Math.PI):(j*=-1,k+=0>=k?Math.PI:-Math.PI));f=(h-c.rotation)%Math.PI;A=(k-c.skewX)%Math.PI;if(void 0===c.skewX||1E-6<m||-1E-6>m||1E-6<n||-1E-6>n||1E-6<f||-1E-6>f||1E-6<A||-1E-6>A)c.scaleX=d,c.scaleY=j,c.rotation=h,c.skewX=k;I&&(c.rotationX=c.rotationY=c.z=0,c.perspective=
parseFloat(w.defaultTransformPerspective)||0,c.scaleZ=1)}c.zOrigin=i;for(b in c)1E-6>c[b]&&-1E-6<c[b]&&(c[b]=0);e&&(a._gsTransform=c);return c},Ka=function(a){var b=this.data,e=-b.rotation,c=e+b.skewX,f=Math.cos(e)*b.scaleX,e=Math.sin(e)*b.scaleX,i=Math.sin(c)*-b.scaleY,c=Math.cos(c)*b.scaleY,d=1E-6,g=this.t.style,j=this.t.currentStyle,h;if(j){f<d&&f>-d&&(f=0);e<d&&e>-d&&(e=0);i<d&&i>-d&&(i=0);c<d&&c>-d&&(c=0);d=e;e=-i;i=-d;d=j.filter;g.filter="";var k=this.t.offsetWidth;h=this.t.offsetHeight;var m=
"absolute"!==j.position,n="progid:DXImageTransform.Microsoft.Matrix(M11="+f+", M12="+e+", M21="+i+", M22="+c,l=b.x,s=b.y,z,t;null!=b.ox&&(z=(b.oxp?0.01*k*b.ox:b.ox)-k/2,t=(b.oyp?0.01*h*b.oy:b.oy)-h/2,l+=z-(z*f+t*e),s+=t-(z*i+t*c));if(m)z=k/2,t=h/2,n+=", Dx="+(z-(z*f+t*e)+l)+", Dy="+(t-(z*i+t*c)+s)+")";else{var r=8>qa?1:-1;z=b.ieOffsetX||0;t=b.ieOffsetY||0;b.ieOffsetX=Math.round((k-((0>f?-f:f)*k+(0>e?-e:e)*h))/2+l);b.ieOffsetY=Math.round((h-((0>c?-c:c)*h+(0>i?-i:i)*k))/2+s);for(B=0;4>B;B++)k=Ha[B],
h=j[k],h=-1!==h.indexOf("px")?parseFloat(h):D(this.t,k,parseFloat(h),h.replace(Ba,""))||0,l=h!==b[k]?2>B?-b.ieOffsetX:-b.ieOffsetY:2>B?z-b.ieOffsetX:t-b.ieOffsetY,g[k]=(b[k]=Math.round(h-l*(0===B||2===B?1:r)))+"px";n+=", sizingMethod='auto expand')"}g.filter=-1!==d.indexOf("DXImageTransform.Microsoft.Matrix(")?d.replace(Fa,n):n+" "+d;if(0===a||1===a)if(1===f&&0===e&&0===i&&1===c&&(!m||-1!==n.indexOf("Dx=0, Dy=0")))(!ba.test(d)||100===parseFloat(RegExp.$1))&&-1===d.indexOf("gradient(")&&g.removeAttribute("filter")}},
La=function(){var a=this.data,b=a.perspective,e=a.scaleX,c=0,f=0,i=0,d=0,g=a.scaleY,j=0,h=0,k=0,m=0,n=a.scaleZ,l=0,s=0,z=0,t=b?-1/b:0,r=a.rotation,p=a.zOrigin,q,x,v,w,u;r&&(q=Math.cos(r),r=Math.sin(r),v=g*r,c=e*-r,g*=q,e*=q,d=v);if(r=a.rotationY)q=Math.cos(r),r=Math.sin(r),w=n*-r,u=t*-r,f=e*r,j=d*r,n*=q,t*=q,e*=q,d*=q,k=w,s=u;if(r=a.rotationX)q=Math.cos(r),r=Math.sin(r),x=c*q+f*r,v=g*q+j*r,w=m*q+n*r,u=z*q+t*r,f=c*-r+f*q,j=g*-r+j*q,n=m*-r+n*q,t=z*-r+t*q,c=x,g=v,m=w,z=u;p&&(l-=p,i=f*l,h=j*l,l=n*l+p);
i+=a.x;h+=a.y;l+=a.z;1E-6>l&&-1E-6<l&&(l=0);this.t.style[C]="matrix3d("+(1E-6>e&&-1E-6<e?0:e)+","+(1E-6>d&&-1E-6<d?0:d)+","+(1E-6>k&&-1E-6<k?0:k)+","+(1E-6>s&&-1E-6<s?0:s)+","+(1E-6>c&&-1E-6<c?0:c)+","+(1E-6>g&&-1E-6<g?0:g)+","+(1E-6>m&&-1E-6<m?0:m)+","+(1E-6>z&&-1E-6<z?0:z)+","+(1E-6>f&&-1E-6<f?0:f)+","+(1E-6>j&&-1E-6<j?0:j)+","+(1E-6>n&&-1E-6<n?0:n)+","+(1E-6>t&&-1E-6<t?0:t)+","+(1E-6>i&&-1E-6<i?0:i)+","+(1E-6>h&&-1E-6<h?0:h)+","+l+","+(b?1+-l/b:1)+")"},Ma=function(){var a=this.data;if(!a.rotation&&
!a.skewX)this.t.style[C]="matrix("+a.scaleX+",0,0,"+a.scaleY+","+a.x+","+a.y+")";else{var b=a.rotation,e=b-a.skewX,c=Math.cos(b)*a.scaleX,b=Math.sin(b)*a.scaleX,f=Math.sin(e)*-a.scaleY,e=Math.cos(e)*a.scaleY;this.t.style[C]="matrix("+(1E-6>c&&-1E-6<c?0:c)+","+(1E-6>b&&-1E-6<b?0:b)+","+(1E-6>f&&-1E-6<f?0:f)+","+(1E-6>e&&-1E-6<e?0:e)+","+a.x+","+a.y+")"}};p("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,transformPerspective",
null,function(a,b,e,c,f,i,d){if(c._transform)return f;var b=c._transform=ea(a,s,!0),g=a.style,j=za.length,h,k,m,n;if("string"===typeof d.transform&&C)k=g[C],g[C]=d.transform,h=ea(a,null,!1),g[C]=k;else if("object"===typeof d){k=null!=d.rotation?d.rotation:null!=d.rotationZ?d.rotationZ:b.rotation*N;h={scaleX:G(null!=d.scaleX?d.scaleX:d.scale,b.scaleX),scaleY:G(null!=d.scaleY?d.scaleY:d.scale,b.scaleY),scaleZ:G(null!=d.scaleZ?d.scaleZ:d.scale,b.scaleZ),x:G(d.x,b.x),y:G(d.y,b.y),z:G(d.z,b.z),perspective:G(d.transformPerspective,
b.perspective)};h.rotation=null!=d.shortRotation||null!=d.shortRotationZ?ha(d.shortRotation||d.shortRotationZ||0,b.rotation):"number"===typeof k?k*E:L(k,b.rotation);I&&(h.rotationX=null!=d.shortRotationX?ha(d.shortRotationX,b.rotationX):"number"===typeof d.rotationX?d.rotationX*E:L(d.rotationX,b.rotationX),h.rotationY=null!=d.shortRotationY?ha(d.shortRotationY,b.rotationY):"number"===typeof d.rotationY?d.rotationY*E:L(d.rotationY,b.rotationY),1E-6>h.rotationX&&-1E-6<h.rotationX&&(h.rotationX=0),1E-6>
h.rotationY&&-1E-6<h.rotationY&&(h.rotationY=0));h.skewX=null==d.skewX?b.skewX:"number"===typeof d.skewX?d.skewX*E:L(d.skewX,b.skewX);h.skewY=null==d.skewY?b.skewY:"number"===typeof d.skewY?d.skewY*E:L(d.skewY,b.skewY);if(k=h.skewY-b.skewY)h.skewX+=k,h.rotation+=k;1E-6>h.skewY&&-1E-6<h.skewY&&(h.skewY=0);1E-6>h.skewX&&-1E-6<h.skewX&&(h.skewX=0);1E-6>h.rotation&&-1E-6<h.rotation&&(h.rotation=0)}n=b.z||b.rotationX||b.rotationY||h.z||h.rotationX||h.rotationY;!n&&null!=h.scale&&(h.scaleZ=1);if(C){if(oa){na=
!0;if(""===g.zIndex&&(k=v(a,"zIndex",s),"auto"===k||""===k))g.zIndex=0;pa&&(g.WebkitBackfaceVisibility=d.WebkitBackfaceVisibility||(n?"visible":"hidden"))}}else g.zoom=1;f=new q(a,"transform",0,0,f,2);f.setRatio=n&&I?La:C?Ma:Ka;f.plugin=i;f.data=b;for(Z.pop();-1<--j;)if(e=za[j],m=h[e]-b[e],1E-6<m||-1E-6>m||null!=T[e])f=new q(b,e,b[e],m,f),f.xs0=0,f.plugin=i,c._overwriteProps.push(f.n);if((m=d.transformOrigin)||I&&n&&b.zOrigin)C?(m=(m||v(a,e,s,!1,"50% 50%"))+"",e=Aa,f=new q(g,e,0,0,f,-1,"css_transformOrigin"),
f.b=g[e],f.plugin=i,I?(k=b.zOrigin,m=m.split(" "),b.zOrigin=(2<m.length?parseFloat(m[2]):k)||0,f.xs0=f.e=g[e]=m[0]+" "+(m[1]||"50%")+" 0px",f=new q(b,"zOrigin",0,0,f,-1,f.n),f.b=k,f.xs0=f.e=b.zOrigin):f.xs0=f.e=g[e]=m):ga(m+"",b);return f.t===a?(f._next&&(f._next._prev=null),f._next):f},!0);p("boxShadow","0px 0px 0px 0px #999",null,!0,!0);p("borderRadius","0px",function(a,b,e,c,f){var b=this.format(b),c=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
i=a.style,d,g,j,h,k,m,n,l,q,p,t,r;l=parseFloat(a.offsetWidth);q=parseFloat(a.offsetHeight);b=b.split(" ");for(d=0;d<c.length;d++)this.p.indexOf("border")&&(c[d]=Q(c[d])),h=j=v(a,c[d],s,!1,"0px"),k=g=b[d],m=parseFloat(h),t=h.substr((m+"").length),(r="="===k.charAt(1))?(n=parseInt(k.charAt(0)+"1"),k=k.substr(2),n*=parseFloat(k),p=k.substr((n+"").length-(0>n?1:0))||""):(n=parseFloat(k),p=k.substr((n+"").length)),""===p&&(p=Y[e]||t),p!==t&&(h=D(a,"borderLeft",m,t),m=D(a,"borderTop",m,t),"%"===p?(h=100*
(h/l)+"%",j=100*(m/q)+"%"):"em"===p?(t=D(a,"borderLeft",1,"em"),h=h/t+"em",j=m/t+"em"):(h+="px",j=m+"px"),r&&(k=parseFloat(h)+n+p,g=parseFloat(j)+n+p)),f=W(i,c[d],h+" "+j,k+" "+g,!1,"0px",f);return f},!0,!1,xa("0px 0px 0px 0px",!1,!0));p("backgroundPosition","0 0",null,!1,!1,ga);p("backgroundSize","0 0",null,!1,!1,ga);p("perspective","0px",null,!0);p("perspectiveOrigin","50% 50%",null,!0);p("transformStyle","preserve-3d",null,!0);p("margin",null,x("marginTop,marginRight,marginBottom,marginLeft"));
p("padding",null,x("paddingTop,paddingRight,paddingBottom,paddingLeft"));p("clip","rect(0px,0px,0px,0px)");p("textShadow","0px 0px 0px #999",null,!1,!0);p("autoRound",null,function(a,b,e,c,f){return f});p("border","0px solid #000",function(a,b,e,c,f,i){return this.parseComplex(a.style,this.format(v(a,"borderTopWidth",s,!1,"0px")+" "+v(a,"borderTopStyle",s,!1,"solid")+" "+v(a,"borderTopColor",s,!1,"#000")),this.format(b),f,i)},!1,!0,function(a){var b=a.split(" ");return b[0]+" "+(b[1]||"solid")+" "+
(a.match(H)||["#000"])[0]});var Na=function(a){var b=this.t,a=this.s+this.c*a,e;100===a&&(b.removeAttribute("filter"),e=!v(this.data,"filter"));e||(this.xn1&&(b.filter=b.filter||"alpha(opacity=100)"),b.filter=-1===b.filter.indexOf("opacity")?b.filter+(" alpha(opacity="+(a>>0)+")"):b.filter.replace(ba,"opacity="+(a>>0)))};p("opacity,alpha,autoAlpha","1",function(a,b,e,c,f,i){var d=parseFloat(v(a,"opacity",s,!1,"1")),b=parseFloat(b),g=a.style,j;"autoAlpha"===e&&(j=v(a,"visibility",s),1===d&&"hidden"===
j&&(d=0),f=new q(g,"visibility",0,0,f,-1,null,!1,0,0!==d?"visible":"hidden",0===b?"hidden":"visible"),f.xs0="visible",c._overwriteProps.push(f.n));K?f=new q(g,"opacity",d,b-d,f):(f=new q(g,"opacity",100*d,100*(b-d),f),f.xn1="autoAlpha"===e?1:0,g.zoom=1,f.type=2,f.b="alpha(opacity="+f.s+")",f.e="alpha(opacity="+(f.s+f.c)+")",f.data=a,f.plugin=i,f.setRatio=Na);return f});var Oa=function(a){if(1===a||0===a){this.t.className=1===a?this.e:this.b;for(var a=this.data,b=this.t.style,e=b.removeProperty?"removeProperty":
"removeAttribute";a;){if(a.v)b[a.p]=a.v;else b[e](a.p.replace(ka,"-$1").toLowerCase());a=a._next}}else this.t.className!==this.b&&(this.t.className=this.b)};p("className",null,function(a,b,e,c,f,i,d){var g=a.className,j=a.style.cssText,f=c._classNamePT=new q(a,e,0,0,f,2);f.setRatio=Oa;f.b=g;f.e="="!==b.charAt(1)?b:"+"===b.charAt(0)?g+" "+b.substr(2):g.split(b.substr(2)).join("");c._tween._duration&&(b=V(a,s,!0),a.className=f.e,d=va(a,b,V(a),d),a.className=g,f.data=d.firstMPT,a.style.cssText=j,f=f.xfirst=
c.parse(a,d.difs,f,i));return f});F("bezier","BezierPlugin");F("throwProps","ThrowPropsPlugin");l=w.prototype;l._firstPT=null;l._onInitTween=function(a,b,e){if(!a.nodeType)return!1;this._target=a;this._tween=e;ca=b.autoRound;X=!1;Y=b.suffixMap||w.suffixMap;s=U(a,"");Z=this._overwriteProps;var e=a.style,c,f,i;if(na&&""===e.zIndex&&(c=v(a,"zIndex",s),"auto"===c||""===c))e.zIndex=0;"string"===typeof b&&(f=e.cssText,c=V(a,s),e.cssText=f+";"+b,c=va(a,c,V(a)).difs,!K&&Ca.test(b)&&(c.opacity=parseFloat(RegExp.$1)),
b=c,e.cssText=f);this._firstPT=a=this.parse(a,b,null);if(X){for(;a;){e=a._next;for(b=f;b&&b.pr>a.pr;)b=b._next;(a._prev=b?b._prev:i)?a._prev._next=a:f=a;(a._next=b)?b._prev=a:i=a;a=e}this._firstPT=f}return!0};l.parse=function(a,b,e,c){var f=a.style,i,d,g,j,h,k,m,l;for(i in b){h=b[i];if(d=J[i])e=d.parse(a,h,i,this,e,c,b);else if(d=v(a,i,s)+"",m="string"===typeof h,"color"===i||"fill"===i||"stroke"===i||-1!==i.indexOf("Color")||m&&!h.indexOf("rgb"))m||(h=ia(h),h=(3<h.length?"rgba(":"rgb(")+h.join(",")+
")"),e=W(f,i,d,h,!0,"transparent",e,0,c);else if(m&&(-1!==h.indexOf(" ")||-1!==h.indexOf(",")))e=W(f,i,d,h,!0,null,e,0,c);else{g=parseFloat(d);k=d.substr((g+"").length);if(""===d||"auto"===d)if("width"===i||"height"===i){g=a;l=i;j=s;k=parseFloat("width"===l?g.offsetWidth:g.offsetHeight);l=Ga[l];var p=l.length;for(j=j||U(g,null);-1<--p;)k-=parseFloat(v(g,"padding"+l[p],j,!0))||0,k-=parseFloat(v(g,"border"+l[p]+"Width",j,!0))||0;g=k;k="px"}else g="opacity"!==i?0:1,k="";(l=m&&"="===h.charAt(1))?(j=parseInt(h.charAt(0)+
"1"),h=h.substr(2),j*=parseFloat(h),m=h.substr((j+"").length-(0>j?1:0))||""):(j=parseFloat(h),m=m?h.substr((j+"").length)||"":"");""===m&&(m=Y[i]||k);h=j||0===j?(l?j+g:j)+m:b[i];if(k!==m&&""!==m&&(j||0===j))if(g||0===g)if(g=D(a,i,g,k),"%"===m?(g/=D(a,i,100,"%")/100,100<g&&(g=100)):"em"===m?g/=D(a,i,1,"em"):(j=D(a,i,j,m),m="px"),l&&(j||0===j))h=j+g+m;l&&(j+=g);(g||0===g)&&(j||0===j)?(e=new q(f,i,g,j-g,e,0,"css_"+i,!1!==ca&&("px"===m||"zIndex"===i),0,d,h),e.xs0=m):(e=new q(f,i,j||g||0,0,e,-1,"css_"+
i,!1,0,d,h),e.xs0="display"===i&&"none"===h?d:h)}c&&(e&&!e.plugin)&&(e.plugin=c)}return e};l.setRatio=function(a){var b=this._firstPT,e,c;if(1===a&&(this._tween._time===this._tween._duration||0===this._tween._time))for(;b;)2!==b.type?b.t[b.p]=b.e:b.setRatio(a),b=b._next;else if(a||!(this._tween._time===this._tween._duration||0===this._tween._time)||-1E-6===this._tween._rawPrevTime)for(;b;){e=b.c*a+b.s;b.r?e=0<e?e+0.5>>0:e-0.5>>0:1E-6>e&&-1E-6<e&&(e=0);if(b.type)if(1===b.type)if(c=b.l,2===c)b.t[b.p]=
b.xs0+e+b.xs1+b.xn1+b.xs2;else if(3===c)b.t[b.p]=b.xs0+e+b.xs1+b.xn1+b.xs2+b.xn2+b.xs3;else if(4===c)b.t[b.p]=b.xs0+e+b.xs1+b.xn1+b.xs2+b.xn2+b.xs3+b.xn3+b.xs4;else if(5===c)b.t[b.p]=b.xs0+e+b.xs1+b.xn1+b.xs2+b.xn2+b.xs3+b.xn3+b.xs4+b.xn4+b.xs5;else{e=b.xs0+e+b.xs1;for(c=1;c<b.l;c++)e+=b["xn"+c]+b["xs"+(c+1)];b.t[b.p]=e}else-1===b.type?b.t[b.p]=b.xs0:b.setRatio&&b.setRatio(a);else b.t[b.p]=e+b.xs0;b=b._next}else for(;b;)2!==b.type?b.t[b.p]=b.b:b.setRatio(a),b=b._next};l._linkCSSP=function(a,b,e){a&&
(b&&(b._prev=a),a._next&&(a._next._prev=a._prev),e&&(e._next=a),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next),a._next=b,a._prev=e);return a};l._kill=function(a){var b=a,e=!1,c,f;if(a.css_autoAlpha||a.css_alpha){b={};for(f in a)b[f]=a[f];b.css_opacity=1;b.css_autoAlpha&&(b.css_visibility=1)}if(a.css_className&&(c=this._classNamePT))(a=c.xfirst)&&a._prev?this._linkCSSP(a._prev,c._next,a._prev._prev):a===this._firstPT&&(this._firstPT=null),c._next&&this._linkCSSP(c._next,c._next._next,
a._prev),this._target._gsOverwrittenClassNamePT=this._linkCSSP(c,this._target._gsOverwrittenClassNamePT),this._classNamePT=null,e=!0;return R.prototype._kill.call(this,b)||e};R.activate([w]);return w},!0)});window._gsDefine&&_gsQueue.pop()();;

/*!
 * VERSION: beta 0.42
 * DATE: 2012-09-19
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.CSSRulePlugin",["plugins.TweenPlugin","TweenLite"],function(r){var l=function(){r.call(this,"cssRule");this._overwriteProps.pop()},n=l.prototype=new r("cssRule");n.constructor=l;l.API=2;l.suffixMap={top:"px",right:"px",bottom:"px",left:"px",width:"px",height:"px",fontSize:"px",padding:"px",margin:"px"};var p=/[^\d\-\.]/g,A=/(\d|\-|\+|=|#|\.)*/g,L=/(\d|\.)+/g,B=/opacity *= *([^)]*)/,M=/([A-Z])/g,N=/(M11|M12|M21|M22)=[\d\-\.e]+/gi, O=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,q=Math.PI/180,m=document,s=m.createElement("div"),o=navigator.userAgent,C,D,t,E=o.indexOf("Android"),F=m.createElement("div");D=-1!==o.indexOf("Safari")&&-1===o.indexOf("Chrome")&&(-1===E||3<Number(o.substr(E+8,1)));F.innerHTML="<a style='top:1px;opacity:.55;'>a</a>";t=(o=F.getElementsByTagName("a")[0])?/^0.55/.test(o.style.opacity):!1;var G=function(c){if(!c||""===c)return u.black;if(u[c])return u[c];if("number"===typeof c)return[c>>16,c>>8& 255,c&255];if("#"===c.charAt(0)){if(4===c.length)var a=c.charAt(1),d=c.charAt(2),c=c.charAt(3),c="#"+a+a+d+d+c+c;c=parseInt(c.substr(1),16);return[c>>16,c>>8&255,c&255]}return c.match(L)||u.transparent},H=m.defaultView?m.defaultView.getComputedStyle:function(){},x=function(c,a,d,b){return!t&&"opacity"===a?B.test("string"===typeof c?c:(c.currentStyle?c.currentStyle.filter:c.style.filter)||"")?parseFloat(RegExp.$1)/100:1:!b&&c.style[a]?c.style[a]:(d=d||H(c,null))?(c=d.getPropertyValue(a.replace(M,"-$1").toLowerCase()))|| d.length?c:d[a]:c.currentStyle?(d=c.currentStyle,b=d[a],!b&&"backgroundPosition"===a?d[a+"X"]+" "+d[a+"Y"]:b):null},I={scaleX:1,scaleY:1,x:1,y:1,rotation:1,shortRotation:1,skewX:1,skewY:1,scale:1},J="",y="",i=function(c,a){var a=a||m.body||m.documentElement,d=H(a,""),b,e;if(x(a,c))return c;c=c.substr(0,1).toUpperCase()+c.substr(1);b=["O","Moz","ms","Ms","Webkit"];for(e=5;-1<--e&&!x(a,b[e]+c,d););return 0<=e?(y=3===e?"ms":b[e],J="-"+y.toLowerCase()+"-",y+c):null}("transform"),P=J+"transform";l.getRule= function(c){var a=m.all?"rules":"cssRules",d=m.styleSheets,b=d.length,e=":"===c.charAt(0),f,g,h,c=(e?"":",")+c+",";for(e&&(h=[]);-1<--b;){g=d[b][a];for(f=g.length;-1<--f;)if(-1!==(","+g[f].selectorText.split("::").join(":")+",").indexOf(c))if(e)h.push(g[f].style);else return g[f].style}return h};var K=function(c,a){s.cssText=c.cssText;var d=c._gsTransform,b;i?b=x(s,P,null,!0):s.currentStyle&&(b=(b=s.currentStyle.filter.match(N))&&4===b.length?b[0].substr(4)+","+Number(b[2].substr(4))+","+Number(b[1].substr(4))+ ","+b[3].substr(4)+","+(d?d.x:0)+","+(d?d.y:0):null);b=(b||"").replace(/[^\d\-\.e,]/g,"").split(",");var e=6<=b.length,f=e?Number(b[0]):1,g=e?Number(b[1]):0,h=e?Number(b[2]):0,j=e?Number(b[3]):1,d=a?d||{skewY:0}:{skewY:0},k=0>d.scaleX;d.x=e?Number(b[4]):0;d.y=e?Number(b[5]):0;d.scaleX=Math.sqrt(f*f+g*g);d.scaleY=Math.sqrt(j*j+h*h);d.rotation=f||g?Math.atan2(g,f):d.rotation||0;d.skewX=h||j?Math.atan2(h,j)+d.rotation:d.skewX||0;Math.abs(d.skewX)>Math.PI/2&&(k?(d.scaleX*=-1,d.skewX+=0>=d.rotation?Math.PI: -Math.PI,d.rotation+=0>=d.rotation?Math.PI:-Math.PI):(d.scaleY*=-1,d.skewX+=0>=d.skewX?Math.PI:-Math.PI));if(1E-6>d.rotation&&-1E-6<d.rotation&&(f||g))d.rotation=0;if(1E-6>d.skewX&&-1E-6<d.skewX&&(g||h))d.skewX=0;a&&(c._gsTransform=d);return d},z=function(c,a){if(null==c||""===c||"auto"===c)c="0 0";var a=a||{},d=-1!==c.indexOf("left")?"0%":-1!==c.indexOf("right")?"100%":c.split(" ")[0],b=-1!==c.indexOf("top")?"0%":-1!==c.indexOf("bottom")?"100%":c.split(" ")[1];null==b?b="0":"center"===b&&(b="50%"); "center"===d&&(d="50%");a.oxp=-1!==d.indexOf("%");a.oyp=-1!==b.indexOf("%");a.oxr="="===d.charAt(1);a.oyr="="===b.charAt(1);a.ox=parseFloat(d.replace(p,""));a.oy=parseFloat(b.replace(p,""));return a},v=function(c,a){return null==c?a:"string"===typeof c&&1===c.indexOf("=")?parseInt(c.charAt(0)+"1")*Number(c.substr(2))+a:Number(c)},w=function(c,a){var d=-1===c.indexOf("rad")?q:1,b=1===c.indexOf("="),c=Number(c.replace(p,""))*d;return b?c+a:c},u={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192], black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};n._onInitTween=function(c,a,d){this._style=c;this._tween=d;this._transform=null;if(C&&(""===this._style.zIndex||"auto"===this._style.zIndex))this._style.zIndex=0;this._parseVars(a,c,a.suffixMap|| l.suffixMap);return!0};n._parseVars=function(c,a,d){var b,e,f,g,h,j,k;for(b in c)if(e=c[b],"transform"===b||b===i)this._parseTransform(a,e,d);else if(I[b]||"transformOrigin"===b)this._parseTransform(a,c,d);else{if("alpha"===b||"autoAlpha"===b)b="opacity";else if("margin"===b||"padding"===b){e=(e+"").split(" ");g=e.length;f={};f[b+"Top"]=e[0];f[b+"Right"]=1<g?e[1]:e[0];f[b+"Bottom"]=4===g?e[2]:e[0];f[b+"Left"]=4===g?e[3]:2===g?e[1]:e[0];this._parseVars(f,a,d);continue}else if("backgroundPosition"=== b||"backgroundSize"===b){f=z(e);k=z(g=a[b]||"50% 50%");this._firstPT=f={_next:this._firstPT,t:a,p:b,b:g,f:!1,n:"css_"+b,type:3,s:k.ox,c:f.oxr?f.ox:f.ox-k.ox,ys:k.oy,yc:f.oyr?f.oy:f.oy-k.oy,sfx:f.oxp?"%":"px",ysfx:f.oyp?"%":"px",r:!f.oxp&&!1!==c.autoRound};f.e=f.s+f.c+f.sfx+" "+(f.ys+f.yc)+f.ysfx;continue}else if("border"===b){e=(e+"").split(" ");this._parseVars({borderWidth:e[0],borderStyle:e[1]||"none",borderColor:e[2]||"#000000"},a,d);continue}else if("autoRound"===b)continue;g=a[b];g=null!=g?g+ "":"";this._firstPT=f={_next:this._firstPT,t:a,p:b,b:g,f:!1,n:"css_"+b,sfx:"",r:!1,type:0};"opacity"===b&&null!=c.autoAlpha&&(this._firstPT=f._prev={_next:f,t:a,p:"visibility",f:!1,n:"css_visibility",r:!1,type:-1,b:0!==Number(g)?"visible":"hidden",i:"visible",e:0===Number(e)?"hidden":"visible"},this._overwriteProps.push("css_visibility"));if("color"===b||"fill"===b||"stroke"===b||-1!==b.indexOf("Color")||"string"===typeof e&&!e.indexOf("rgb(")){if(h=G(g),e=G(e),f.e=f.i=(3<e.length?"rgba(":"rgb(")+ e.join(",")+")",f.b=(3<h.length?"rgba(":"rgb(")+h.join(",")+")",f.s=Number(h[0]),f.c=Number(e[0])-f.s,f.gs=Number(h[1]),f.gc=Number(e[1])-f.gs,f.bs=Number(h[2]),f.bc=Number(e[2])-f.bs,f.type=1,3<h.length||3<e.length)if(t)f.as=4>h.length?1:Number(h[3]),f.ac=(4>e.length?1:Number(e[3]))-f.as,f.type=2;else if(0==e[3]&&(f.e=f.i="transparent",f.type=-1),0==h[3])f.b="transparent"}else{h=g.replace(A,"");k=""===g||"auto"===g?"opacity"!==b?0:1:-1===g.indexOf(" ")?parseFloat(g.replace(p,"")):NaN;"string"=== typeof e?(g="="===e.charAt(1),j=e.replace(A,""),e=-1===e.indexOf(" ")?parseFloat(e.replace(p,"")):NaN):(g=!1,j="");""===j&&(j=d[b]||h);f.e=e||0===e?(g?e+k:e)+j:c[b];if(h!==j&&""!==j&&(e||0===e))if(k||0===k)throw"CSSRulePlugin error: starting and ending units don't match on tween of "+b+" ("+h+" vs "+j+")";if((k||0===k)&&(e||0===e)&&(f.c=g?e:e-k))if(f.s=k,f.sfx=j,"opacity"===b)t||(f.type=4,f.p="filter",f.b="alpha(opacity="+100*f.s+")",f.e="alpha(opacity="+100*(f.s+f.c)+")",f.dup=null!=c.autoAlpha, this._style.zoom=1);else{if(!1!==c.autoRound&&("px"===j||"zIndex"===b))f.r=!0}else f.type=-1,f.i="display"===b&&"none"===f.e?f.b:f.e,f.s=f.c=0}this._overwriteProps.push("css_"+b);f._next&&(f._next._prev=f)}};n._parseTransform=function(c,a){if(!this._transform){var d=this._transform=K(c,!0),b,e,f;if("object"===typeof a){b={scaleX:v(null!=a.scaleX?a.scaleX:a.scale,d.scaleX),scaleY:v(null!=a.scaleY?a.scaleY:a.scale,d.scaleY),x:v(a.x,d.x),y:v(a.y,d.y)};null!=a.shortRotation?(b.rotation="number"===typeof a.shortRotation? a.shortRotation*q:w(a.shortRotation,d.rotation),e=(b.rotation-d.rotation)%(2*Math.PI),e!==e%Math.PI&&(e+=Math.PI*(0>e?2:-2)),b.rotation=d.rotation+e):b.rotation=null==a.rotation?d.rotation:"number"===typeof a.rotation?a.rotation*q:w(a.rotation,d.rotation);b.skewX=null==a.skewX?d.skewX:"number"===typeof a.skewX?a.skewX*q:w(a.skewX,d.skewX);b.skewY=null==a.skewY?d.skewY:"number"===typeof a.skewY?a.skewY*q:w(a.skewY,d.skewY);if(e=b.skewY-d.skewY)b.skewX+=e,b.rotation+=e;1E-6>b.skewY&&-1E-6<b.skewY&& (b.skewY=0);1E-6>b.skewX&&-1E-6<b.skewX&&(b.skewX=0);1E-6>b.rotation&&-1E-6<b.rotation&&(b.rotation=0);if(null!=(e=a.transformOrigin))i?(f=i+"Origin",this._firstPT=e={_next:this._firstPT,t:c,p:f,s:0,c:0,n:f,f:!1,r:!1,b:c[f],e:e,i:e,type:-1,sfx:""},e._next&&(e._next._prev=e)):z(e,d)}else if("string"===typeof a&&i)e=c[i],c[i]=a,b=K(c,!1),c[i]=e;else return;if(i){if(D&&(C=!0,""===c.WebkitBackfaceVisibility&&(c.WebkitBackfaceVisibility="hidden"),""===c.zIndex))c.zIndex=0}else c.zoom=1;for(f in I)d[f]!== b[f]&&("shortRotation"!==f&&"scale"!==f)&&(this._firstPT=e={_next:this._firstPT,t:d,p:f,s:d[f],c:b[f]-d[f],n:f,f:!1,r:!1,b:d[f],e:b[f],type:0,sfx:0},e._next&&(e._next._prev=e),this._overwriteProps.push("css_"+f))}};n.setRatio=function(c){var a=this._firstPT,d=1E-6,b,e;if(1===c&&(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)a.t[a.p]=a.e,a=a._next;else if(c||!(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)b=a.c*c+a.s,a.r?b=0<b?b+0.5>>0:b-0.5>> 0:b<d&&b>-d&&(b=0),a.type?1===a.type?a.t[a.p]="rgb("+(b>>0)+", "+(a.gs+c*a.gc>>0)+", "+(a.bs+c*a.bc>>0)+")":2===a.type?a.t[a.p]="rgba("+(b>>0)+", "+(a.gs+c*a.gc>>0)+", "+(a.bs+c*a.bc>>0)+", "+(a.as+c*a.ac)+")":-1===a.type?a.t[a.p]=a.i:3===a.type?(e=a.ys+c*a.yc,a.r&&(e=0<e?e+0.5>>0:e-0.5>>0),a.t[a.p]=b+a.sfx+" "+e+a.ysfx):(a.dup&&(a.t.filter=a.t.filter||"alpha(opacity=100)"),a.t.filter=-1===a.t.filter.indexOf("opacity")?a.t.filter+(" alpha(opacity="+(100*b>>0)+")"):a.t.filter.replace(B,"opacity="+ (100*b>>0))):a.t[a.p]=b+a.sfx,a=a._next;else for(;a;)a.t[a.p]=a.b,a=a._next;if(this._transform)if(a=this._transform,i&&!a.rotation&&!a.skewX)this._style[i]=(a.x||a.y?"translate("+a.x+"px,"+a.y+"px) ":"")+(1!==a.scaleX||1!==a.scaleY?"scale("+a.scaleX+","+a.scaleY+")":"")||"translate(0px,0px)";else{b=i?a.rotation:-a.rotation;e=i?b-a.skewX:b+a.skewX;c=Math.cos(b)*a.scaleX;b=Math.sin(b)*a.scaleX;var f=Math.sin(e)*-a.scaleY;e=Math.cos(e)*a.scaleY;c<d&&c>-d&&(c=0);b<d&&b>-d&&(b=0);f<d&&f>-d&&(f=0);e<d&& e>-d&&(e=0);i?this._style[i]="matrix("+c+","+b+","+f+","+e+","+a.x+","+a.y+")":(d=b,b=-f,a=this._style.filter,this._style.filter="",d="progid:DXImageTransform.Microsoft.Matrix(M11="+c+", M12="+b+", M21="+-d+", M22="+e+",sizingMethod='auto expand')",this._style.filter=-1!==a.indexOf("DXImageTransform.Microsoft.Matrix(")?a.replace(O,d):d+" "+a)}};n._kill=function(c){var a=c,d;if(c.autoAlpha||c.alpha){a={};for(d in c)a[d]=c[d];a.opacity=1;a.autoAlpha&&(a.visibility=1)}return r.prototype._kill.call(this, a)};r.activate([l]);return l},!0)});window._gsDefine&&_gsQueue.pop()();;

/*!
 * VERSION: beta 1.0
 * DATE: 2012-06-19
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.ColorPropsPlugin",["plugins.TweenPlugin"],function(i){var g=function(){i.call(this,"colorProps",-1);this._overwriteProps.pop()},j=g.prototype=new i("colorProps",-1),l=/(\d|\.)+/g,k=function(a){return""===a||null==a||"none"===a?h.transparent:h[a]?h[a]:"number"===typeof a?[a>>16,a>>8&255,a&255]:"#"===a.charAt(0)?(4===a.length&&(a="#"+a.charAt(1)+a.charAt(1)+a.charAt(2)+a.charAt(2)+a.charAt(3)+a.charAt(3)),a=parseInt(a.substr(1), 16),[a>>16,a>>8&255,a&255]):a.match(l)||h.transparent},h={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};j.constructor=g;g.API=2;j._onInitTween=function(a,b){this._target=a;var d,e,f,c;for(d in b){f= k(b[d]);this._firstPT=c={_next:this._firstPT,p:d,f:"function"===typeof a[d],n:d,r:!1};e=k(!c.f?a[d]:a[d.indexOf("set")||"function"!==typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)]());c.s=Number(e[0]);c.c=Number(f[0])-c.s;c.gs=Number(e[1]);c.gc=Number(f[1])-c.gs;c.bs=Number(e[2]);c.bc=Number(f[2])-c.bs;if(c.rgba=3<e.length||3<f.length)c.as=4>e.length?1:Number(e[3]),console.log("as "+c.as),c.ac=(4>f.length?1:Number(f[3]))-c.as;c._next&&(c._next._prev=c)}return!0};j.setRatio=function(a){for(var b= this._firstPT,d;b;){d=(b.rgba?"rgba(":"rgb(")+(b.s+a*b.c>>0)+", "+(b.gs+a*b.gc>>0)+", "+(b.bs+a*b.bc>>0)+(b.rgba?", "+(b.as+a*b.ac):"")+")";if(b.f)this._target[b.p](d);else this._target[b.p]=d;b=b._next}};i.activate([g]);return g},!0)});window._gsDefine&&_gsQueue.pop()();;

/**
 * VERSION: beta 0.11
 * DATE: 2012-10-26
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.EaselPlugin",["plugins.TweenPlugin"],function(j){var h=function(){j.call(this,"easel",-1);this._overwriteProps.pop()},k=h.prototype=new j("easel",-1),l=/(\d|\.)+/g,i;_colorProps="redMultiplier greenMultiplier blueMultiplier alphaMultiplier redOffset greenOffset blueOffset alphaOffset".split(" ");_parseColorFilter=function(a,c,d){if(!i&&(i=window.ColorFilter||window.createjs.ColorFilter,!i))throw"EaselPlugin error: The EaselJS ColorFilter JavaScript file wasn't loaded.";
for(var b=a.filters||[],f=b.length,g,e;-1<--f;)if(b[f]instanceof i){g=b[f];break}g||(g=new i,b.push(g),a.filters=b);b=g.clone();if(null!=c.tint)f=_parseColor(c.tint),e=null!=c.tintAmount?Number(c.tintAmount):1,b.redOffset=Number(f[0])*e,b.greenOffset=Number(f[1])*e,b.blueOffset=Number(f[2])*e,b.redMultiplier=b.greenMultiplier=b.blueMultiplier=1-e;else for(e in c)"exposure"!==e&&"brightness"!==e&&(b[e]=Number(c[e]));null!=c.exposure?(b.redOffset=b.greenOffset=b.blueOffset=255*(Number(c.exposure)-1),
b.redMultiplier=b.greenMultiplier=b.blueMultiplier=1):null!=c.brightness&&(e=Number(c.brightness)-1,b.redOffset=b.greenOffset=b.blueOffset=0<e?255*e:0,b.redMultiplier=b.greenMultiplier=b.blueMultiplier=1-Math.abs(e));for(f=8;-1<--f;)e=_colorProps[f],g[e]!==b[e]&&d._addTween(g,e,g[e],b[e],"easel_colorFilter");d._overwriteProps.push("easel_colorFilter");if(!a.cacheID)throw"EaselPlugin warning: for filters to display in EaselJS, you must call the object's cache() method first. "+a;};_parseColor=function(a){return""===
a||null==a||"none"===a?_colorLookup.transparent:_colorLookup[a]?_colorLookup[a]:"number"===typeof a?[a>>16,a>>8&255,a&255]:"#"===a.charAt(0)?(4===a.length&&(a="#"+a.charAt(1)+a.charAt(1)+a.charAt(2)+a.charAt(2)+a.charAt(3)+a.charAt(3)),a=parseInt(a.substr(1),16),[a>>16,a>>8&255,a&255]):a.match(l)||_colorLookup.transparent};_colorLookup={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,
0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};k.constructor=h;h.API=2;k._onInitTween=function(a,c){this._target=a;var d,b,f;for(d in c)"colorFilter"===d||"tint"===d||"tintAmount"===d||"exposure"===d||"brightness"===d?f||(_parseColorFilter(a,c.colorFilter||c,this),f=!0):null!=a[d]&&(this._firstPT=b={_next:this._firstPT,t:a,p:d,f:"function"===typeof a[d],
n:d,pr:0,type:0},b.s=!b.f?parseFloat(a[d]):a[d.indexOf("set")||"function"!==typeof a["get"+d.substr(3)]?d:"get"+d.substr(3)](),b.c="number"===typeof c[d]?c[d]-b.s:"string"===typeof c[d]?parseFloat(c[d].split("=").join("")):0,b._next&&(b._next._prev=b));return!0};k.setRatio=function(a){for(var c=this._firstPT,d;c;){d=c.c*a+c.s;c.r&&(d=d+(0<d?0.5:-0.5)>>0);if(c.f)c.t[c.p](d);else c.t[c.p]=d;c=c._next}this._target.cacheID&&this._target.updateCache()};j.activate([h]);return h},!0)});
window._gsDefine&&_gsQueue.pop()();;

/*!
 * VERSION: beta 0.14
 * DATE: 2012-06-19
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.RaphaelPlugin",["plugins.TweenPlugin","TweenLite"],function(o){var i=function(){o.call(this,"raphael");this._overwriteProps.pop()},k=i.prototype=new o("raphael");k.constructor=i;i.API=2;var p=/[^\d\-\.]/g,j=Math.PI/180,t=/(\d|\.)+/g,q=function(b){return"number"===typeof b?[b>>16,b>>8&255,b&255]:""===b||null==b||"none"===b||"string"!==typeof b?l.transparent:l[b]?l[b]:"#"===b.charAt(0)?(4===b.length&&(b="#"+b.charAt(1)+b.charAt(1)+ b.charAt(2)+b.charAt(2)+b.charAt(3)+b.charAt(3)),b=parseInt(b.substr(1),16),[b>>16,b>>8&255,b&255]):b.match(t)||l.transparent},r={scaleX:1,scaleY:1,tx:1,ty:1,rotation:1,shortRotation:1,skewX:1,skewY:1,scale:1},s=function(b,a){var c=b.matrix,e=c.a,d=c.b,g=c.c,f=c.d,h=a?b._gsTransform||{skewY:0}:{skewY:0},i=0>h.scaleX;h.tx=c.e-(h.ox||0);h.ty=c.f-(h.oy||0);h.scaleX=Math.sqrt(e*e+d*d);h.scaleY=Math.sqrt(f*f+g*g);h.rotation=e||d?Math.atan2(d,e):h.rotation||0;h.skewX=g||f?Math.atan2(g,f)+h.rotation:h.skewX|| 0;Math.abs(h.skewX)>Math.PI/2&&(i?(h.scaleX*=-1,h.skewX+=0>=h.rotation?Math.PI:-Math.PI,h.rotation+=0>=h.rotation?Math.PI:-Math.PI):(h.scaleY*=-1,h.skewX+=0>=h.skewX?Math.PI:-Math.PI));if(1.0E-6>h.rotation&&-1.0E-6<h.rotation&&(e||d))h.rotation=0;if(1.0E-6>h.skewX&&-1.0E-6<h.skewX&&(d||g))h.skewX=0;a&&(b._gsTransform=h);return h},m=function(b,a){return null==b?a:"string"===typeof b&&1===b.indexOf("=")?Number(b.split("=").join(""))+a:Number(b)},n=function(b,a){var c=-1===b.indexOf("rad")?j:1,e=1=== b.indexOf("="),b=Number(b.replace(p,""))*c;return e?b+a:b},l={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};k._onInitTween=function(b,a,c){if(!b.attr)return!1;this._target=b;this._tween=c; this._props=b._gsProps=b._gsProps||{};var e,d,g,f;for(e in a)(c=a[e],"transform"===e)?this._parseTransform(b,c):r[e]||"pivot"===e?this._parseTransform(b,a):(d=b.attr(e),this._firstPT=g={_next:this._firstPT,t:this._props,p:e,b:d,f:!1,n:"raphael_"+e,r:!1,type:0},"fill"===e||"stroke"===e?(d=q(d),f=q(c),g.e=c,g.s=Number(d[0]),g.c=Number(f[0])-g.s,g.gs=Number(d[1]),g.gc=Number(f[1])-g.gs,g.bs=Number(d[2]),g.bc=Number(f[2])-g.bs,3<d.length||3<f.length?(g.as=4>d.length?1:Number(d[3]),g.ac=(4>f.length?1: Number(f[3]))-g.as,g.type=2):g.type=1):(d="string"===typeof d?parseFloat(d.replace(p,"")):Number(d),"string"===typeof c?(f="="===c.charAt(1),c=parseFloat(c.replace(p,""))):f=!1,g.e=c||0===c?f?c+d:c:a[e],(d||0===d)&&(c||0===c)&&(g.c=f?c:c-d))?g.s=d:(g.type=-1,g.i=a[e],g.s=g.c=0),this._overwriteProps.push("raphael_"+e),g._next&&(g._next._prev=g));return!0};k._parseTransform=function(b,a){if(!this._transform){var c=this._transform=s(b,!0),e,d,g,f,h;if("object"===typeof a){e={scaleX:m(null!=a.scaleX? a.scaleX:a.scale,c.scaleX),scaleY:m(null!=a.scaleY?a.scaleY:a.scale,c.scaleY),tx:m(a.tx,c.tx),ty:m(a.ty,c.ty)};null!=a.shortRotation?(e.rotation="number"===typeof a.shortRotation?a.shortRotation*j:n(a.shortRotation,c.rotation),d=(e.rotation-c.rotation)%(2*Math.PI),d!==d%Math.PI&&(d+=Math.PI*(0>d?2:-2)),e.rotation=c.rotation+d):e.rotation=null==a.rotation?c.rotation:"number"===typeof a.rotation?a.rotation*j:n(a.rotation,c.rotation);e.skewX=null==a.skewX?c.skewX:"number"===typeof a.skewX?a.skewX*j: n(a.skewX,c.skewX);e.skewY=null==a.skewY?c.skewY:"number"===typeof a.skewY?a.skewY*j:n(a.skewY,c.skewY);if(d=e.skewY-c.skewY)e.skewX+=d,e.rotation+=d;1.0E-6>e.skewY&&-1.0E-6<e.skewY&&(e.skewY=0);1.0E-6>e.skewX&&-1.0E-6<e.skewX&&(e.skewX=0);1.0E-6>e.rotation&&-1.0E-6<e.rotation&&(e.rotation=0);f=a.localPivot||a.globalPivot;"string"===typeof f?(f=f.split(","),d=Number(f[0]),f=Number(f[1])):"object"===typeof f?(d=Number(f.x),f=Number(f.y)):a.localPivot?(f=b.getBBox(!0),d=f.width/2,f=f.height/2):(f=b.getBBox(), d=f.x+f.width/2,f=f.y+f.height/2);a.localPivot?(h=b.matrix,d+=b.attr("x"),f+=b.attr("y"),this._pxl=d,this._pyl=f,this._pxg=d*h.a+f*h.c+h.e-c.tx,this._pyg=d*h.b+f*h.d+h.f-c.ty):(h=b.matrix.invert(),this._pxl=d*h.a+f*h.c+h.e,this._pyl=d*h.b+f*h.d+h.f,this._pxg=d-c.tx,this._pyg=f-c.ty)}else if("string"===typeof a&&_transformProp)f=this._target.transform(),b.transform(a),e=s(b,!1),b.transform(f);else return;for(g in r)c[g]!==e[g]&&("shortRotation"!==g&&"scale"!==g)&&(this._firstPT=d={_next:this._firstPT, t:c,p:g,s:c[g],c:e[g]-c[g],n:g,f:!1,r:!1,b:c[g],e:e[g],type:0},d._next&&(d._next._prev=d),this._overwriteProps.push("raphael_"+g))}};k.setRatio=function(b){for(var a=this._firstPT,c;a;)c=a.c*b+a.s,a.r&&(c=0<c?c+0.5>>0:c-0.5>>0),a.type?1===a.type?a.t[a.p]="rgb("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+")":2===a.type?a.t[a.p]="rgba("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+", "+(a.as+b*a.ac)+")":-1===a.type&&(a.t[a.p]=a.i):a.t[a.p]=c,a=a._next;this._target.attr(this._props);if(this._transform){a= this._transform;c=a.rotation;var e=c-a.skewX,b=Math.cos(c)*a.scaleX;c=Math.sin(c)*a.scaleX;var d=Math.sin(e)*-a.scaleY,e=Math.cos(e)*a.scaleY,g=this._pxl,f=this._pyl;1.0E-6>c&&-1.0E-6<c&&(c=0);1.0E-6>d&&-1.0E-6<d&&(d=0);a.ox=this._pxg-(g*b+f*d);a.oy=this._pyg-(g*c+f*e);this._target.transform("m"+b+","+c+","+d+","+e+","+(a.tx+a.ox)+","+(a.ty+a.oy))}};o.activate([i]);return i},!0)});window._gsDefine&&_gsQueue.pop()();;

/**
 * VERSION: beta 1.31
 * DATE: 2012-11-19
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.RoundPropsPlugin",["plugins.TweenPlugin"],function(i){var c=function(){i.call(this,"roundProps",-1);this._overwriteProps.length=0},f=c.prototype=new i("roundProps",-1);f.constructor=c;c.API=2;f._onInitTween=function(b,e,d){this._tween=d;return!0};f._onInitAllProps=function(){for(var b=this._tween,e=b.vars.roundProps instanceof Array?b.vars.roundProps:b.vars.roundProps.split(","),d=e.length,c={},f=b._propLookup.roundProps,h,
a,g;-1<--d;)c[e[d]]=1;for(d=e.length;-1<--d;){h=e[d];for(a=b._firstPT;a;)g=a._next,a.pg?a.t._roundProps(c,!0):a.n===h&&(this._add(a.t,h,a.s,a.c),g&&(g._prev=a._prev),a._prev?a._prev._next=g:b._firstPT===a&&(b._firstPT=g),a._next=a._prev=null,b._propLookup[h]=f),a=g}return!1};f._add=function(b,e,d,c){this._addTween(b,e,d,d+c,e,!0);this._overwriteProps.push(e)};i.activate([c]);return c},!0)});window._gsDefine&&_gsQueue.pop()();;

/**
 * VERSION: beta 1.5
 * DATE: 2012-11-16
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.ScrollToPlugin",["plugins.TweenPlugin"],function(e){var d=function(){e.call(this,"scrollTo");this._overwriteProps.pop()},c=d.prototype=new e("scrollTo"),f=document.documentElement,g=window,i=d.max=function(a,b){var c="x"===b?"Width":"Height",d="scroll"+c,e="client"+c,h=document.body;return a===g||a===f||a===h?Math.max(f[d],h[d])-Math.max(f[e],h[e]):a[d]-a["offset"+c]},j=e.prototype.setRatio;c.constructor=d;d.API=2;c._onInitTween=
function(a,b,c){this._wdw=a===g;this._target=a;this._tween=c;"object"!==typeof b&&(b={y:b});this._autoKill=b.autoKill;this.x=this.xPrev=this.getX();this.y=this.yPrev=this.getY();null!=b.x?this._addTween(this,"x",this.x,"max"===b.x?i(a,"x"):b.x,"scrollTo_x",!0):this.skipX=!0;null!=b.y?this._addTween(this,"y",this.y,"max"===b.y?i(a,"y"):b.y,"scrollTo_y",!0):this.skipY=!0;return!0};c.getX=function(){return!this._wdw?this._target.scrollLeft:null!=g.pageXOffset?g.pageXOffset:null!=f.scrollLeft?f.scrollLeft:
document.body.scrollLeft};c.getY=function(){return!this._wdw?this._target.scrollTop:null!=g.pageYOffset?g.pageYOffset:null!=f.scrollTop?f.scrollTop:document.body.scrollTop};c._kill=function(a){a.scrollTo_x&&(this.skipX=!0);a.scrollTo_x&&(this.skipY=!0);return e.prototype._kill.call(this,a)};c._checkAutoKill=function(){this._autoKill&&(this.skipX&&this.skipY)&&this._tween.kill()};c.setRatio=function(a){j.call(this,a);var a=this.getX(),b=this.getY();!this.skipX&&a!==this.xPrev&&(this.skipX=!0,this._checkAutoKill());
!this.skipY&&b!==this.yPrev&&(this.skipY=!0,this._checkAutoKill());this._wdw?g.scrollTo(!this.skipX?this.x:a,!this.skipY?this.y:b):(this.skipY||(this._target.scrollTop=this.y),this.skipX||(this._target.scrollLeft=this.x));this.xPrev=this.x;this.yPrev=this.y};e.activate([d]);return d},!0)});window._gsDefine&&_gsQueue.pop()();;

var PF=function(){var e=function(t,n){var r=e.resolve(t,n||"/"),i=e.modules[r];if(!i)throw new Error("Failed to resolve module "+t+", tried "+r);var s=i._cached?i._cached:i();return s};return e.paths=[],e.modules={},e.extensions=[".js",".coffee"],e._core={assert:!0,events:!0,fs:!0,path:!0,vm:!0},e.resolve=function(){return function(t,n){function u(t){if(e.modules[t])return t;for(var n=0;n<e.extensions.length;n++){var r=e.extensions[n];if(e.modules[t+r])return t+r}}function a(t){t=t.replace(/\/+$/,"");var n=t+"/package.json";if(e.modules[n]){var i=e.modules[n](),s=i.browserify;if(typeof s=="object"&&s.main){var o=u(r.resolve(t,s.main));if(o)return o}else if(typeof s=="string"){var o=u(r.resolve(t,s));if(o)return o}else if(i.main){var o=u(r.resolve(t,i.main));if(o)return o}}return u(t+"/index")}function f(e,t){var n=l(t);for(var r=0;r<n.length;r++){var i=n[r],s=u(i+"/"+e);if(s)return s;var o=a(i+"/"+e);if(o)return o}var s=u(e);if(s)return s}function l(e){var t;e==="/"?t=[""]:t=r.normalize(e).split("/");var n=[];for(var i=t.length-1;i>=0;i--){if(t[i]==="node_modules")continue;var s=t.slice(0,i+1).join("/")+"/node_modules";n.push(s)}return n}n||(n="/");if(e._core[t])return t;var r=e.modules.path();n=r.resolve("/",n);var i=n||"/";if(t.match(/^(?:\.\.?\/|\/)/)){var s=u(r.resolve(i,t))||a(r.resolve(i,t));if(s)return s}var o=f(t,i);if(o)return o;throw new Error("Cannot find module '"+t+"'")}}(),e.alias=function(t,n){var r=e.modules.path(),i=null;try{i=e.resolve(t+"/package.json","/")}catch(s){i=e.resolve(t,"/")}var o=r.dirname(i),u=(Object.keys||function(e){var t=[];for(var n in e)t.push(n);return t})(e.modules);for(var a=0;a<u.length;a++){var f=u[a];if(f.slice(0,o.length+1)===o+"/"){var l=f.slice(o.length);e.modules[n+l]=e.modules[o+l]}else f===o&&(e.modules[n]=e.modules[o])}},e.define=function(t,n){var r=e._core[t]?"":e.modules.path().dirname(t),i=function(t){return e(t,r)};i.resolve=function(t){return e.resolve(t,r)},i.modules=e.modules,i.define=e.define;var s={exports:{}};e.modules[t]=function(){return e.modules[t]._cached=s.exports,n.call(s.exports,i,s,s.exports,r,t),e.modules[t]._cached=s.exports,s.exports}},typeof process=="undefined"&&(process={}),process.nextTick||(process.nextTick=function(){var e=[],t=typeof window!="undefined"&&window.postMessage&&window.addEventListener;return t&&window.addEventListener("message",function(t){if(t.source===window&&t.data==="browserify-tick"){t.stopPropagation();if(e.length>0){var n=e.shift();n()}}},!0),function(n){t?(e.push(n),window.postMessage("browserify-tick","*")):setTimeout(n,0)}}()),process.title||(process.title="browser"),process.binding||(process.binding=function(t){if(t==="evals")return e("vm");throw new Error("No such module")}),process.cwd||(process.cwd=function(){return"."}),process.env||(process.env={}),process.argv||(process.argv=[]),e.define("path",function(e,t,n,r,i){function s(e,t){var n=[];for(var r=0;r<e.length;r++)t(e[r],r,e)&&n.push(e[r]);return n}function o(e,t){var n=0;for(var r=e.length;r>=0;r--){var i=e[r];i=="."?e.splice(r,1):i===".."?(e.splice(r,1),n++):n&&(e.splice(r,1),n--)}if(t)for(;n--;n)e.unshift("..");return e}var u=/^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;n.resolve=function(){var e="",t=!1;for(var n=arguments.length;n>=-1&&!t;n--){var r=n>=0?arguments[n]:process.cwd();if(typeof r!="string"||!r)continue;e=r+"/"+e,t=r.charAt(0)==="/"}return e=o(s(e.split("/"),function(e){return!!e}),!t).join("/"),(t?"/":"")+e||"."},n.normalize=function(e){var t=e.charAt(0)==="/",n=e.slice(-1)==="/";return e=o(s(e.split("/"),function(e){return!!e}),!t).join("/"),!e&&!t&&(e="."),e&&n&&(e+="/"),(t?"/":"")+e},n.join=function(){var e=Array.prototype.slice.call(arguments,0);return n.normalize(s(e,function(e,t){return e&&typeof e=="string"}).join("/"))},n.dirname=function(e){var t=u.exec(e)[1]||"",n=!1;return t?t.length===1||n&&t.length<=3&&t.charAt(1)===":"?t:t.substring(0,t.length-1):"."},n.basename=function(e,t){var n=u.exec(e)[2]||"";return t&&n.substr(-1*t.length)===t&&(n=n.substr(0,n.length-t.length)),n},n.extname=function(e){return u.exec(e)[3]||""}}),e.define("/core/Node.js",function(e,t,n,r,i){function s(e,t,n){this.x=e,this.y=t,this.walkable=n===undefined?!0:n}t.exports=s}),e.define("/core/Grid.js",function(e,t,n,r,i){function o(e,t,n){this.width=e,this.height=t,this.nodes=this._buildNodes(e,t,n)}var s=e("./Node");o.prototype._buildNodes=function(e,t,n){var r,i,o=new Array(t),u;for(r=0;r<t;++r){o[r]=new Array(e);for(i=0;i<e;++i)o[r][i]=new s(i,r)}if(n===undefined)return o;if(n.length!==t||n[0].length!==e)throw new Error("Matrix size does not fit");for(r=0;r<t;++r)for(i=0;i<e;++i)n[r][i]&&(o[r][i].walkable=!1);return o},o.prototype.getNodeAt=function(e,t){return this.nodes[t][e]},o.prototype.isWalkableAt=function(e,t){return this.isInside(e,t)&&this.nodes[t][e].walkable},o.prototype.isInside=function(e,t){return e>=0&&e<this.width&&t>=0&&t<this.height},o.prototype.setWalkableAt=function(e,t,n){this.nodes[t][e].walkable=n},o.prototype.getNeighbors=function(e,t,n){var r=e.x,i=e.y,s=[],o=!1,u=!1,a=!1,f=!1,l=!1,c=!1,h=!1,p=!1,d=this.nodes;return this.isWalkableAt(r,i-1)&&(s.push(d[i-1][r]),o=!0),this.isWalkableAt(r+1,i)&&(s.push(d[i][r+1]),a=!0),this.isWalkableAt(r,i+1)&&(s.push(d[i+1][r]),l=!0),this.isWalkableAt(r-1,i)&&(s.push(d[i][r-1]),h=!0),t?(n?(u=h&&o,f=o&&a,c=a&&l,p=l&&h):(u=h||o,f=o||a,c=a||l,p=l||h),u&&this.isWalkableAt(r-1,i-1)&&s.push(d[i-1][r-1]),f&&this.isWalkableAt(r+1,i-1)&&s.push(d[i-1][r+1]),c&&this.isWalkableAt(r+1,i+1)&&s.push(d[i+1][r+1]),p&&this.isWalkableAt(r-1,i+1)&&s.push(d[i+1][r-1]),s):s},o.prototype.clone=function(){var e,t,n=this.width,r=this.height,i=this.nodes,u=new o(n,r),a=new Array(r),f;for(e=0;e<r;++e){a[e]=new Array(n);for(t=0;t<n;++t)a[e][t]=new s(t,e,i[e][t].walkable)}return u.nodes=a,u},t.exports=o}),e.define("/core/Heap.js",function(e,t,n,r,i){(function(){var e,n,r,i,s,o,u,a,f,l,c,h,p,d,v;r=Math.floor,l=Math.min,n=function(e,t){return e<t?-1:e>t?1:0},f=function(e,t,i,s,o){var u;i==null&&(i=0),o==null&&(o=n);if(i<0)throw new Error("lo must be non-negative");s==null&&(s=e.length);while(o(i,s)<0)u=r((i+s)/2),o(t,e[u])<0?s=u:i=u+1;return[].splice.apply(e,[i,i-i].concat(t)),t},o=function(e,t,r){return r==null&&(r=n),e.push(t),d(e,0,e.length-1,r)},s=function(e,t){var r,i;return t==null&&(t=n),r=e.pop(),e.length?(i=e[0],e[0]=r,v(e,0,t)):i=r,i},a=function(e,t,r){var i;return r==null&&(r=n),i=e[0],e[0]=t,v(e,0,r),i},u=function(e,t,r){var i;return r==null&&(r=n),e.length&&r(e[0],t)<0&&(i=[e[0],t],t=i[0],e[0]=i[1],v(e,0,r)),t},i=function(e,t){var i,s,o,u,a,f,l,c;t==null&&(t=n),f=function(){c=[];for(var t=0,n=r(e.length/2);0<=n?t<n:t>n;0<=n?t++:t--)c.push(t);return c}.apply(this).reverse(),l=[];for(s=0,u=f.length;s<u;s++)i=f[s],l.push(v(e,i,t));return l},p=function(e,t,r){var i;return r==null&&(r=n),i=e.indexOf(t),d(e,0,i,r),v(e,i,r)},c=function(e,t,r){var s,o,a,f,l;r==null&&(r=n),o=e.slice(0,t);if(!o.length)return o;i(o,r),l=e.slice(t);for(a=0,f=l.length;a<f;a++)s=l[a],u(o,s,r);return o.sort(r).reverse()},h=function(e,t,r){var o,u,a,c,h,p,d,v,m,g;r==null&&(r=n);if(t*10<=e.length){c=e.slice(0,t).sort(r);if(!c.length)return c;a=c[c.length-1],v=e.slice(t);for(h=0,d=v.length;h<d;h++)o=v[h],r(o,a)<0&&(f(c,o,0,null,r),c.pop(),a=c[c.length-1]);return c}i(e,r),g=[];for(u=p=0,m=l(t,e.length);0<=m?p<m:p>m;u=0<=m?++p:--p)g.push(s(e,r));return g},d=function(e,t,r,i){var s,o,u;i==null&&(i=n),s=e[r];while(r>t){u=r-1>>1,o=e[u];if(i(s,o)<0){e[r]=o,r=u;continue}break}return e[r]=s},v=function(e,t,r){var i,s,o,u,a;r==null&&(r=n),s=e.length,a=t,o=e[t],i=2*t+1;while(i<s)u=i+1,u<s&&!(r(e[i],e[u])<0)&&(i=u),e[t]=e[i],t=i,i=2*t+1;return e[t]=o,d(e,a,t,r)},e=function(){function e(e){this.cmp=e!=null?e:n,this.nodes=[]}return e.name="Heap",e.push=o,e.pop=s,e.replace=a,e.pushpop=u,e.heapify=i,e.nlargest=c,e.nsmallest=h,e.prototype.push=function(e){return o(this.nodes,e,this.cmp)},e.prototype.pop=function(){return s(this.nodes,this.cmp)},e.prototype.peek=function(){return this.nodes[0]},e.prototype.contains=function(e){return this.nodes.indexOf(e)!==-1},e.prototype.replace=function(e){return a(this.nodes,e,this.cmp)},e.prototype.pushpop=function(e){return u(this.nodes,e,this.cmp)},e.prototype.heapify=function(){return i(this.nodes,this.cmp)},e.prototype.updateItem=function(e){return p(this.nodes,e,this.cmp)},e.prototype.clear=function(){return this.nodes=[]},e.prototype.empty=function(){return this.nodes.length===0},e.prototype.size=function(){return this.nodes.length},e.prototype.clone=function(){var t;return t=new e,t.nodes=this.nodes.slice(0),t},e.prototype.toArray=function(){return this.nodes.slice(0)},e.prototype.insert=e.prototype.push,e.prototype.remove=e.prototype.pop,e.prototype.top=e.prototype.peek,e.prototype.front=e.prototype.peek,e.prototype.has=e.prototype.contains,e.prototype.copy=e.prototype.clone,e}(),(typeof t!="undefined"&&t!==null?t.exports:void 0)?t.exports=e:window.Heap=e}).call(this)}),e.define("/core/Util.js",function(e,t,n,r,i){function s(e){var t=[[e.x,e.y]];while(e.parent)e=e.parent,t.push([e.x,e.y]);return t.reverse()}function o(e,t){var n=s(e),r=s(t);return n.concat(r.reverse())}function u(e){var t,n=0,r,i,s,o;for(t=1;t<e.length;++t)r=e[t-1],i=e[t],s=r[0]-i[0],o=r[1]-i[1],n+=Math.sqrt(s*s+o*o);return n}function a(e,t,n,r){var i=Math.abs,s=[],o,u,a,f,l,c;a=i(n-e),f=i(r-t),o=e<n?1:-1,u=t<r?1:-1,l=a-f;for(;;){s.push([e,t]);if(e===n&&t===r)break;c=2*l,c>-f&&(l-=f,e+=o),c<a&&(l+=a,t+=u)}return s}function f(e,t){var n=t.length,r=t[0][0],i=t[0][1],s=t[n-1][0],o=t[n-1][1],u,f,l,c,h,p,d,v,m,g,y,b,w;u=r,f=i,h=t[1][0],p=t[1][1],d=[[u,f]];for(v=2;v<n;++v){g=t[v],l=g[0],c=g[1],y=a(u,f,l,c),w=!1;for(m=1;m<y.length;++m){b=y[m];if(!e.isWalkableAt(b[0],b[1])){w=!0,d.push([h,p]),u=h,f=p;break}}w||(h=l,p=c)}return d.push([s,o]),d}n.backtrace=s,n.biBacktrace=o,n.pathLength=u,n.getLine=a,n.smoothenPath=f}),e.define("/core/Heuristic.js",function(e,t,n,r,i){t.exports={manhattan:function(e,t){return e+t},euclidean:function(e,t){return Math.sqrt(e*e+t*t)},chebyshev:function(e,t){return Math.max(e,t)}}}),e.define("/finders/AStarFinder.js",function(e,t,n,r,i){function a(e){e=e||{},this.allowDiagonal=e.allowDiagonal,this.dontCrossCorners=e.dontCrossCorners,this.heuristic=e.heuristic||u.manhattan}var s=e("../core/Heap"),o=e("../core/Util"),u=e("../core/Heuristic");a.prototype.findPath=function(e,t,n,r,i){var u=new s(function(e,t){return e.f-t.f}),a=i.getNodeAt(e,t),f=i.getNodeAt(n,r),l=this.heuristic,c=this.allowDiagonal,h=this.dontCrossCorners,p=Math.abs,d=Math.SQRT2,v,m,g,y,b,w,E,S;a.g=0,a.f=0,u.push(a),a.opened=!0;while(!u.empty()){v=u.pop(),v.closed=!0;if(v===f)return o.backtrace(f);m=i.getNeighbors(v,c,h);for(y=0,b=m.length;y<b;++y){g=m[y];if(g.closed)continue;w=g.x,E=g.y,S=v.g+(w-v.x===0||E-v.y===0?1:d);if(!g.opened||S<g.g)g.g=S,g.h=g.h||l(p(w-n),p(E-r)),g.f=g.g+g.h,g.parent=v,g.opened?u.updateItem(g):(u.push(g),g.opened=!0)}}return[]},t.exports=a}),e.define("/finders/BestFirstFinder.js",function(e,t,n,r,i){function o(e){s.call(this,e);var t=this.heuristic;this.heuristic=function(e,n){return t(e,n)*1e6}}var s=e("./AStarFinder");o.prototype=new s,o.prototype.constructor=o,t.exports=o}),e.define("/finders/BreadthFirstFinder.js",function(e,t,n,r,i){function o(e){e=e||{},this.allowDiagonal=e.allowDiagonal,this.dontCrossCorners=e.dontCrossCorners}var s=e("../core/Util");o.prototype.findPath=function(e,t,n,r,i){var o=[],u=this.allowDiagonal,a=this.dontCrossCorners,f=i.getNodeAt(e,t),l=i.getNodeAt(n,r),c,h,p,d,v;o.push(f),f.opened=!0;while(o.length){p=o.shift(),p.closed=!0;if(p===l)return s.backtrace(l);c=i.getNeighbors(p,u,a);for(d=0,v=c.length;d<v;++d){h=c[d];if(h.closed||h.opened)continue;o.push(h),h.opened=!0,h.parent=p}}return[]},t.exports=o}),e.define("/finders/DijkstraFinder.js",function(e,t,n,r,i){function o(e){s.call(this,e),this.heuristic=function(e,t){return 0}}var s=e("./AStarFinder");o.prototype=new s,o.prototype.constructor=o,t.exports=o}),e.define("/finders/BiAStarFinder.js",function(e,t,n,r,i){function a(e){e=e||{},this.allowDiagonal=e.allowDiagonal,this.dontCrossCorners=e.dontCrossCorners,this.heuristic=e.heuristic||u.manhattan}var s=e("../core/Heap"),o=e("../core/Util"),u=e("../core/Heuristic");a.prototype.findPath=function(e,t,n,r,i){var u=function(e,t){return e.f-t.f},a=new s(u),f=new s(u),l=i.getNodeAt(e,t),c=i.getNodeAt(n,r),h=this.heuristic,p=this.allowDiagonal,d=this.dontCrossCorners,v=Math.abs,m=Math.SQRT2,g,y,b,w,E,S,x,T,N=1,C=2;l.g=0,l.f=0,a.push(l),l.opened=N,c.g=0,c.f=0,f.push(c),c.opened=C;while(!a.empty()&&!f.empty()){g=a.pop(),g.closed=!0,y=i.getNeighbors(g,p,d);for(w=0,E=y.length;w<E;++w){b=y[w];if(b.closed)continue;if(b.opened===C)return o.biBacktrace(g,b);S=b.x,x=b.y,T=g.g+(S-g.x===0||x-g.y===0?1:m);if(!b.opened||T<b.g)b.g=T,b.h=b.h||h(v(S-n),v(x-r)),b.f=b.g+b.h,b.parent=g,b.opened?a.updateItem(b):(a.push(b),b.opened=N)}g=f.pop(),g.closed=!0,y=i.getNeighbors(g,p,d);for(w=0,E=y.length;w<E;++w){b=y[w];if(b.closed)continue;if(b.opened===N)return o.biBacktrace(b,g);S=b.x,x=b.y,T=g.g+(S-g.x===0||x-g.y===0?1:m);if(!b.opened||T<b.g)b.g=T,b.h=b.h||h(v(S-e),v(x-t)),b.f=b.g+b.h,b.parent=g,b.opened?f.updateItem(b):(f.push(b),b.opened=C)}}return[]},t.exports=a}),e.define("/finders/BiBestFirstFinder.js",function(e,t,n,r,i){function o(e){s.call(this,e);var t=this.heuristic;this.heuristic=function(e,n){return t(e,n)*1e6}}var s=e("./BiAStarFinder");o.prototype=new s,o.prototype.constructor=o,t.exports=o}),e.define("/finders/BiBreadthFirstFinder.js",function(e,t,n,r,i){function o(e){e=e||{},this.allowDiagonal=e.allowDiagonal,this.dontCrossCorners=e.dontCrossCorners}var s=e("../core/Util");o.prototype.findPath=function(e,t,n,r,i){var o=i.getNodeAt(e,t),u=i.getNodeAt(n,r),a=[],f=[],l,c,h,p=this.allowDiagonal,d=this.dontCrossCorners,v=0,m=1,g,y;a.push(o),o.opened=!0,o.by=v,f.push(u),u.opened=!0,u.by=m;while(a.length&&f.length){h=a.shift(),h.closed=!0,l=i.getNeighbors(h,p,d);for(g=0,y=l.length;g<y;++g){c=l[g];if(c.closed)continue;if(c.opened){if(c.by===m)return s.biBacktrace(h,c);continue}a.push(c),c.parent=h,c.opened=!0,c.by=v}h=f.shift(),h.closed=!0,l=i.getNeighbors(h,p,d);for(g=0,y=l.length;g<y;++g){c=l[g];if(c.closed)continue;if(c.opened){if(c.by===v)return s.biBacktrace(c,h);continue}f.push(c),c.parent=h,c.opened=!0,c.by=m}}return[]},t.exports=o}),e.define("/finders/BiDijkstraFinder.js",function(e,t,n,r,i){function o(e){s.call(this,e),this.heuristic=function(e,t){return 0}}var s=e("./BiAStarFinder");o.prototype=new s,o.prototype.constructor=o,t.exports=o}),e.define("/finders/JumpPointFinder.js",function(e,t,n,r,i){function a(e){e=e||{},this.heuristic=e.heuristic||u.manhattan}var s=e("../core/Heap"),o=e("../core/Util"),u=e("../core/Heuristic");a.prototype.findPath=function(e,t,n,r,i){var u=this.openList=new s(function(e,t){return e.f-t.f}),a=this.startNode=i.getNodeAt(e,t),f=this.endNode=i.getNodeAt(n,r),l;this.grid=i,a.g=0,a.f=0,u.push(a),a.opened=!0;while(!u.empty()){l=u.pop(),l.closed=!0;if(l===f)return o.backtrace(f);this._identifySuccessors(l)}return[]},a.prototype._identifySuccessors=function(e){var t=this.grid,n=this.heuristic,r=this.openList,i=this.endNode.x,s=this.endNode.y,o,a,f,l,c,h=e.x,p=e.y,d,v,m,g,y,b,w,E=Math.abs,S=Math.max;o=this._findNeighbors(e);for(l=0,c=o.length;l<c;++l){a=o[l],f=this._jump(a[0],a[1],h,p);if(f){d=f[0],v=f[1],w=t.getNodeAt(d,v);if(w.closed)continue;y=u.euclidean(E(d-h),E(v-p)),b=e.g+y;if(!w.opened||b<w.g)w.g=b,w.h=w.h||n(E(d-i),E(v-s)),w.f=w.g+w.h,w.parent=e,w.opened?r.updateItem(w):(r.push(w),w.opened=!0)}}},a.prototype._jump=function(e,t,n,r){var i=this.grid,s=e-n,o=t-r,u,a;if(!i.isWalkableAt(e,t))return null;if(i.getNodeAt(e,t)===this.endNode)return[e,t];if(s!==0&&o!==0){if(i.isWalkableAt(e-s,t+o)&&!i.isWalkableAt(e-s,t)||i.isWalkableAt(e+s,t-o)&&!i.isWalkableAt(e,t-o))return[e,t]}else if(s!==0){if(i.isWalkableAt(e+s,t+1)&&!i.isWalkableAt(e,t+1)||i.isWalkableAt(e+s,t-1)&&!i.isWalkableAt(e,t-1))return[e,t]}else if(i.isWalkableAt(e+1,t+o)&&!i.isWalkableAt(e+1,t)||i.isWalkableAt(e-1,t+o)&&!i.isWalkableAt(e-1,t))return[e,t];if(s!==0&&o!==0){u=this._jump(e+s,t,e,t),a=this._jump(e,t+o,e,t);if(u||a)return[e,t]}return i.isWalkableAt(e+s,t)||i.isWalkableAt(e,t+o)?this._jump(e+s,t+o,e,t):null},a.prototype._findNeighbors=function(e){var t=e.parent,n=e.x,r=e.y,i=this.grid,s,o,u,a,f,l,c=[],h,p,d,v;if(t)s=t.x,o=t.y,f=(n-s)/Math.max(Math.abs(n-s),1),l=(r-o)/Math.max(Math.abs(r-o),1),f!==0&&l!==0?(i.isWalkableAt(n,r+l)&&c.push([n,r+l]),i.isWalkableAt(n+f,r)&&c.push([n+f,r]),(i.isWalkableAt(n,r+l)||i.isWalkableAt(n+f,r))&&c.push([n+f,r+l]),!i.isWalkableAt(n-f,r)&&i.isWalkableAt(n,r+l)&&c.push([n-f,r+l]),!i.isWalkableAt(n,r-l)&&i.isWalkableAt(n+f,r)&&c.push([n+f,r-l])):f===0?i.isWalkableAt(n,r+l)&&(i.isWalkableAt(n,r+l)&&c.push([n,r+l]),i.isWalkableAt(n+1,r)||c.push([n+1,r+l]),i.isWalkableAt(n-1,r)||c.push([n-1,r+l])):i.isWalkableAt(n+f,r)&&(i.isWalkableAt(n+f,r)&&c.push([n+f,r]),i.isWalkableAt(n,r+1)||c.push([n+f,r+1]),i.isWalkableAt(n,r-1)||c.push([n+f,r-1]));else{h=i.getNeighbors(e,!0);for(d=0,v=h.length;d<v;++d)p=h[d],c.push([p.x,p.y])}return c},t.exports=a}),e.define("/PathFinding.js",function(e,t,n,r,i){t.exports={Node:e("./core/Node"),Grid:e("./core/Grid"),Heap:e("./core/Heap"),Util:e("./core/Util"),Heuristic:e("./core/Heuristic"),AStarFinder:e("./finders/AStarFinder"),BestFirstFinder:e("./finders/BestFirstFinder"),BreadthFirstFinder:e("./finders/BreadthFirstFinder"),DijkstraFinder:e("./finders/DijkstraFinder"),BiAStarFinder:e("./finders/BiAStarFinder"),BiBestFirstFinder:e("./finders/BiBestFirstFinder"),BiBreadthFirstFinder:e("./finders/BiBreadthFirstFinder"),BiDijkstraFinder:e("./finders/BiDijkstraFinder"),JumpPointFinder:e("./finders/JumpPointFinder")}}),e("/PathFinding.js"),e("/PathFinding")}();

