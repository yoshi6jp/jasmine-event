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
      clientX: 0,
      clientY: 0,
      ele: null
    },
    mouse: function(eventType, element, options){
      var deltaX,deltaY;
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
          deltaX = ((options.clientX||0) - jasmine.Event.position.clientX)/delta;
          deltaY = ((options.clientY||0) - jasmine.Event.position.clientY)/delta;
          for(i=0;i<delta;i++){
            options.clientX = jasmine.Event.position.clientX + deltaX * i;
            options.clientY = jasmine.Event.position.clientY + deltaY * i;
            jasmine.Event.triggerMouseEvent('mousemove',element,options);
          }
          break;
        case 'dragTo':
          jasmine.Event.triggerMouseEvent('mousedown',element,options);
          deltaX = ((options.clientX||0) - jasmine.Event.position.clientX)/delta;
          deltaY = ((options.clientY||0) - jasmine.Event.position.clientY)/delta;
          for(i=0;i<delta;i++){
            options.clientX = jasmine.Event.position.clientX + deltaX * i;
            options.clientY = jasmine.Event.position.clientY + deltaY * i;
            jasmine.Event.triggerMouseEvent('mousemove',element,options);
          }
          jasmine.Event.triggerMouseEvent('mouseup',element,options);
          jasmine.Event.triggerMouseEvent('click',element,options);
          break;

      }
      jasmine.Event.position.clientX = options.clientX || 0;
      jasmine.Event.position.clientY = options.clientY || 0;
    },
    triggerMouseEvent: function(eventType, element, options){
      var clientX = 0, clientY = 0, offset = {}, evt = {};
      if(element.jquery){
        offset = element.offset();
        clientX = offset.left;
        clientY = offset.top;
        element = element.get(0);
      }
      evt = _createEvent(element, eventType, {clientX: clientX, clientY: clientY});
      _dispatchEvent(element, evt);
    }
  };
})();

