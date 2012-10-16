/*
  Jasmine-Event
  */
(function(){
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
    mouse: function(eventType, element, options){
      var currentX = jasmine.Event.position.left || 0,
          currentY = jasmine.Event.position.top || 0,
          delta = jasmine.Event.delta,
          deltaX = ((options.left||0) - currentX)/delta,
          deltaY = ((options.top||0) - currentY)/delta;
      options = options || {};
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

