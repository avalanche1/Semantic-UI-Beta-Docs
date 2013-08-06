/*  ******************************
  Semantic Module: Transition
  Author: Jack Lukic
  Notes: First Commit March 25, 2013

  A module for controlling css animations

******************************  */

;(function ( $, window, document, undefined ) {

$.fn.transition = function() {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',
    
    time            = new Date().getTime(),
    performance     = [],
    
    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query == 'string'),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    invokedResponse
  ;
  $allModules
    .each(function() {
      var
        $module  = $(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        animationEnd,
        animationName,

        namespace,
        moduleNamespace,
        module
      ;

      module = {

        initialize: function() {
          // get settings
          settings        = module.get.settings.apply(element, moduleArguments);
          module.verbose('Converted arguments into settings object', settings);
          
          // set shortcuts
          error           = settings.error;
          className       = settings.className;
          namespace       = settings.namespace;
          metadata        = settings.metadata;
          moduleNamespace = 'module-' + namespace;
          
          animationEnd    = module.get.animationEvent();
          animationName   = module.get.animationName();
          
          instance        = $module.data(moduleNamespace);

          if(instance === undefined) {
            module.instantiate();
          }
          if(methodInvoked) {
            invokedResponse = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(!methodInvoked || invokedResponse === false) {
            module.animate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
          ;
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(module.is.animating()) {
            module.queue(settings.animation);
            return false;
          }
          module.save.conditions();
          module.set.duration(settings.duration);
          module.set.animating();
          module.repaint();
          $module
            .addClass(className.transition)
            .addClass(settings.animation)
            .one(animationEnd, module.complete)
          ;
          if(!module.has.direction() && module.can.transition()) {
            module.set.direction();
          }
          if(!module.can.animate()) {
            module.restore.conditions();
            module.error(error.noAnimation);
            return false;
          }
          module.show();
          module.debug('Beginning animation', settings.animation, $module.attr('class'));
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          $module
            .one(animationEnd, function() {
              module.queuing = false;
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          if(!module.is.looping()) {
            if($module.hasClass(className.outward) && !module.queuing) {
              module.restore.conditions();
              module.hide();
            }
            else if($module.hasClass(className.inward) && !module.queuing) {
              module.restore.conditions();
              module.show();
            }
            else {
              module.restore.conditions();
            }
            module.remove.animating();
          }
          settings.complete();
        },

        repaint: function(fakeAssignment) {
          module.verbose('Forcing repaint event');
          fakeAssignment = element.offsetWidth;
        },

        has: {
          direction: function(animation) {
            animation = animation || settings.animation;
            if( $module.hasClass(className.inward) || $module.hasClass(className.outward) ) {
              return true;
            }
          }
        },

        set: {

          animating: function() {
            $module.addClass(className.animating);
          },

          direction: function() {
            if($module.is(':visible')) {
              module.debug('Automatically determining the direction of animation', 'Outward');
              $module
                .addClass(className.outward)
                .removeClass(className.inward)
              ;
            }
            else {
              module.debug('Automatically determining the direction of animation', 'Inward');
              $module
                .addClass(className.inward)
                .removeClass(className.outward)
              ;
            }
          },

          looping: function() {
            module.debug('Transition set to loop');
            $module
              .addClass(className.looping)
            ;
          },

          duration: function(duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number') 
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            $module
              .css({
                '-webkit-animation-duration': duration,
                '-moz-animation-duration': duration,
                '-ms-animation-duration': duration,
                '-o-animation-duration': duration,
                'animation-duration': duration
              })
            ;
          }
        },

        save: {
          conditions: function() {
            module.cache = {
              className : $module.attr('class'),
              style     : $module.attr('style')
            };
            module.verbose('Saving original attributes', module.cache);
          }
        },

        restore: {
          conditions: function() {
            if(typeof module.cache === undefined) {
              module.error(error.cache);
              return false;
            }
            if(module.cache.className) {
              $module.attr('class', module.cache.className);
            }
            else {
              $module.removeAttr('class');
            }
            if(module.cache.style) {
              $module.attr('style', module.cache.style);
            }
            else {
              $module.removeAttr('style');
            }
            if(module.is.looping()) {
              module.remove.looping();
            }
            module.verbose('Restoring original attributes', module.cache);
          }
        },

        remove: {

          animating: function() {
            $module.removeClass(className.animating);
          },

          looping: function() {
            module.debug('Transitions are no longer looping');
            $module
              .removeClass(className.looping)
            ;
          }

        },

        get: {

          settings: function(animation, duration, complete) {
            // single settings object
            if($.isPlainObject(animation)) {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof complete == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : complete,
                duration  : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation,
                complete  : duration
              });
            }
            // only animation provided
            else {
              return $.extend(true, {}, $.fn.transition.settings, {
                animation : animation
              });
            }
            return $.fn.transition.settings;
          },

          animationName: function() {
            var
              element     = document.createElement('element'),
              animations  = {
                'animation'       :'animationName',
                'OAnimation'      :'oAnimationName',
                'MozAnimation'    :'mozAnimationName',
                'WebkitAnimation' :'webkitAnimationName'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                module.verbose('Determining animation vendor name property', animations[animation]);
                return animations[animation];
              }
            }
            return false;
          },

          animationEvent: function() {
            var
              element     = document.createElement('element'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                module.verbose('Determining animation vendor end event', animations[animation]);
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          animate: function() {
            if($module.css(animationName) !== 'none') {
              module.debug('CSS definition found'); 
              return true;
            }
            else {
              module.debug('Unable to find css definition');
              return false;
            }
          },
          transition: function() {
            var
              currentAnimation = $module.css(animationName),
              inAnimation      = $module.addClass(className.inward).css(animationName)
            ;
            if(currentAnimation != inAnimation) {
              module.debug('In/out transitions exist');
              $module.removeClass(className.inward);
              return true;
            }
            else {
              module.debug('Static animation found');
              $module.removeClass(className.inward);
              return false;
            }
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          },
          looping: function() {
            return $module.hasClass(className.looping);
          },
          visible: function() {
            return $module.is(':visible');
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          $module
            .removeClass(className.visible)
            .addClass(className.transition)
            .addClass(className.hidden)
          ;
        },
        show: function() {
          module.verbose('Showing element');
          $module
            .removeClass(className.hidden)
            .addClass(className.transition)
            .addClass(className.visible)
          ;
        },

        start: function() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        stop: function() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
        },

        toggle: function() {
          module.debug('Toggling play status');
          $module.toggleClass(className.disabled);
        },

        setting: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, settings, name);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.moduleName + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.moduleName + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.moduleName + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            searchInstance = instance,
            maxDepth,
            found
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && searchInstance !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              if( $.isPlainObject( searchInstance[value] ) && (depth != maxDepth) ) {
                searchInstance = searchInstance[value];
                return true;
              }
              else if( searchInstance[value] !== undefined ) {
                found = searchInstance[value];
                return true;
              }
              return false;
            });
          }
          if ( $.isFunction( found ) ) {
            instance.verbose('Executing invoked function', found);
            return found.apply(context, passedArguments);
          }
          return found || false;
        }
      };
      module.initialize();
    })
  ;
  return (invokedResponse)
    ? invokedResponse
    : this
  ;
};

$.fn.transition.settings = {

  // module info
  moduleName   : 'Transition',
  
  // debug content outputted to console
  debug        : true,
  
  // verbose debug output
  verbose      : true,
  
  // performance data output
  performance  : true,
  
  // event namespace
  namespace    : 'transition',
  
  // animation complete event
  complete     : function() {},
  
  // animation duration (useful only with future js animations)
  animation    : 'fade',
  duration     : '700ms',
  
  className    : {
    transition : 'ui transition',
    animating  : 'animating',
    looping    : 'looping',
    disabled   : 'disabled',
    hidden     : 'hidden',
    visible    : 'visible',
    inward     : 'in',
    outward    : 'out'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    method      : 'The method you called is not defined'
  }

};


})( jQuery, window , document );