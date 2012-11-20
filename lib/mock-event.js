/*
  Jasmine-Event
  */
(function(){
  var applyEvt = false;
  function evtInstall(){
    if(window.jQuery && window.jQuery.fn && window.jQuery.fn.on){
      var evtData = [],
          elements = [];
      (function($){
        function captureMouseEvent(evt){
          var offset = $(evt.target).offset(),
              idx = $.inArray(evt.target,elements);
          if(idx == -1){
            idx = elements.length;
            elements.push(evt.target);
          }
          evtData.push({
            type: evt.type,
            varIdx: idx,
            left: evt.pageX - offset.left,
            top: evt.pageY - offset.top
          });
        }
        function startCapture(){
          $(document).on(jasmine.Event.recorder.eventType, captureMouseEvent);
        }
        function stopCapture(){
          $(document).off(jasmine.Event.recorder.eventType, captureMouseEvent);
        }
        function eleCode(ele,idx,type){
          var $ele = $(ele),
              id = $ele.attr("id"),
              varName  = jasmine.Event.recorder.prefix + idx;
              selector = '',
              code = '';
          if(id){
            selector = '#' + id;
          }else{
            var tagName = $ele.get(0).tagName,
                className = ($ele.attr("class")||'').split(' ').join('.'),
                parentId = $ele.closest('[id]').attr('id');
            if(parentId){
              selector = '#' + parentId +' ';
            }
            if(className){
              className = '.'+className;
            }
            selector += tagName + className + ":first";
          }
          switch(type){
            case 'js':
              return  'var '+ varName +' = $("' + selector +  '");'
            case 'cs':
              return  varName +' = $ "' + selector +  '"'
          }


        }
        function triggerCode(evtDatum,type){
          var funcName = 'jasmine.Event.triggerMouseEvent',
              varEle = jasmine.Event.recorder.prefix + evtDatum.varIdx,
              options = '{left:' + evtDatum.left +',top:' + evtDatum.top +'}';
          switch(type){
            case 'js':
              return funcName + '("' + evtDatum.type + '",' + varEle + ',' + options + ');';
            case 'cs':
              return funcName + ' "' + evtDatum.type + '",' + varEle + ',' + options;
          }
        }
        function codeGenerate(type){
        var i,len,code = [];
        for(i = 0, len = elements.length; i < len; i++ ){
          code.push(eleCode(elements[i],i,type));
        }
        for(var i = 0,len = evtData.length; i < len; i++){
          code.push(triggerCode(evtData[i],type));

        }
        $("<div>")
          .append($("<button>").text("close").on("click",function(){$(this).parent().fadeOut().remove()}))
          .append($("<div>").html(code.join("<br>")))
          .appendTo("body")
          .fadeIn();
        }
        $(function(){
          var keys = jasmine.Event.recorder.keys,
              isCapturing = false,
              action = function(evt){
                var isActive = (jasmine.Event.recorder._listen &&
                                evt.shiftKey == keys.shiftKey && 
                                evt.ctrlKey == keys.ctrlKey && 
                                evt.altKey == keys.altKey),
                    keyCode = isActive ? evt.which : -1;

                switch(keyCode){
                  case keys.start:
                    return "start";
                  case keys.js:
                    return "js";
                  case keys.cs:
                    return "cs";
                  case keys.pause:
                    return "pause";
                  case keys.reset:
                    return "reset";
                  default:
                    return "none";
                }
              };

          $(document)
            .on("keyup",function(evt){
              switch (action(evt)){
                case "start" :
                  stopCapture();
                  startCapture();
                  evt.preventDefault();
                  break;
                case "reset" :
                  stopCapture();
                  evtData = [];
                  evt.preventDefault();
                  break;
                case "pause" :
                  stopCapture();
                  evt.preventDefault();
                  break;
                case "js":
                  stopCapture();
                  codeGenerate('js');
                  evt.preventDefault();
                  break;
                case "cs":
                  stopCapture();
                  codeGenerate('cs');
                  evt.preventDefault();
                  break;
              }
            });
        });
      })(window.jQuery);
    }
  }
  var _createEvent, _dispatchEvent;
  if(!!document.createEvent){
    _createEvent = function(element, eventType, options){
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent(eventType,true, true, window, 0 ,
        0,0, options.clientX, options.clientY,
        false, false, false, false, 0, null);
      return evt;
    };
    _dispatchEvent = function(element, event){
      element.dispatchEvent(event);
    };
  }else{
    _createEvent = function(element, eventType, options){
      var evt = document.createEventObject();
      evt.clientX = options.clientX;
      evt.clicenY = options.clientY;
      evt._type = eventType;
      return evt;
    };
    _dispatchEvent = function(element, event){
      var eventType = event._type;
      delete event._type;
      element.fireEvent('on'+eventType,event);
    };
  }
  if(!window.jasmine){
    window.jasmine = {}
  }
  jasmine.Event = {
    delta: 3,
    position: {
      left: 0,
      top: 0,
      ele: null
    },
    recorder: {
      eventType: "mousemove mousedown mouseup mouseover mouseout click dblclick",
      _listen: false,
      prefix: '$targetEle',
      keys: {
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        start: "S".charCodeAt(),
        js: "J".charCodeAt(),
        cs: "C".charCodeAt(),
        reset: "R".charCodeAt(),
        pause: "P".charCodeAt()
      },
      install: function(){
        jasmine.Event.recorder._listen = true;
        evtInstall();
        this.printUsage("start");
        this.printUsage("js");
        this.printUsage("cs");
        this.printUsage("reset");
        this.printUsage("pause");
      },
      uninstall: function(){
        jasmine.Event.recorder._listen = false;
      },
      printUsage: function(type){
        var keys = this.keys,
            usage = [];
        if(keys.ctrlKey){
          usage.push("[Ctrl]");
        }
        if(keys.shiftKey){
          usage.push("[Shift]");
        }
        if(keys.altKey){
          usage.push("[Alt]");
        }
        usage.push(String.fromCharCode(keys[type]));
        console.log(type,":",usage.join("+"));
      }
    },
    mouse: function(eventType, element, options){
      options = options || {};
      var currentX = jasmine.Event.position.left || 0,
          currentY = jasmine.Event.position.top || 0,
          delta = jasmine.Event.delta,
          deltaX = ((options.left||0) - currentX)/delta,
          deltaY = ((options.top||0) - currentY)/delta;
      switch(eventType){
        case 'click':
          jasmine.Event.triggerMouseEvent('mousedown',element,options);
          jasmine.Event.triggerMouseEvent('mouseup',element,options);
          jasmine.Event.triggerMouseEvent('click',element,options);
          break;
        case 'move':
          jasmine.Event.triggerMouseEvent('mousemove',element,options);
          break;
        case 'drag':
          jasmine.Event.triggerMouseEvent('mousedown',element,options);
          jasmine.Event.triggerMouseEvent('mousemove',element,options);
          jasmine.Event.triggerMouseEvent('mouseup',element,options);
          jasmine.Event.triggerMouseEvent('click',element,options);
          break;
        case 'dragStart':
          jasmine.Event.triggerMouseEvent('mousedown',element,options);
          jasmine.Event.triggerMouseEvent('mousemove',element,options);
          break;
        case 'dragEnd':
          jasmine.Event.triggerMouseEvent('mousemove',element,options);
          jasmine.Event.triggerMouseEvent('mouseup',element,options);
          jasmine.Event.triggerMouseEvent('click',element,options);
          break;
        case 'moveTo':
          for(var i=0;i<delta;i++){
            options.left = currentX + deltaX * i;
            options.top = currentY + deltaY * i;
            jasmine.Event.triggerMouseEvent('mousemove',element,options);
          }
          break;
        case 'dragTo':
          options.left = currentX;
          options.top = currentY;
          jasmine.Event.triggerMouseEvent('mousedown',element,options);
          for(var i=0;i<delta;i++){
            options.left = currentX + deltaX * i;
            options.top = currentY + deltaY * i;
            jasmine.Event.triggerMouseEvent('mousemove',element,options);
          }
          jasmine.Event.triggerMouseEvent('mouseup',element,options);
          jasmine.Event.triggerMouseEvent('click',element,options);
          break;
      }
      jasmine.Event.position.left = options.left || 0;
      jasmine.Event.position.top = options.top || 0;
    },
    triggerMouseEvent: function(eventType, element, options){
      var clientX = 0, clientY = 0, offset = {}, evt = {};
      if(element.length == 0){
        return;
      }
      if(element.jquery){
        offset = element.offset();
        clientX = offset.left;
        clientY = offset.top;
        element = element.get(0);
      }
      if(options.left){
        clientX += options.left;
      }
      if(options.top){
        clientY += options.top;
      }
      evt = _createEvent(element, eventType, {clientX: clientX, clientY: clientY});
      _dispatchEvent(element, evt);
    }
  };
})();

