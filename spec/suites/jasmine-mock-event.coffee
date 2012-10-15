describe 'jasmine-mock-event', ->
  spyEvts = {}
  beforeEach ->
    setFixtures sandbox()
    spyEvts =
      click: spyOnEvent "#sandbox", "click"
      mousemove: spyOnEvent "#sandbox", "mousemove"
      mousedown: spyOnEvent "#sandbox", "mousedown"
      mouseup: spyOnEvent "#sandbox", "mouseup"
      mouseover: spyOnEvent "#sandbox", "mouseover"
      mouseout: spyOnEvent "#sandbox", "mouseout"
  describe 'mouse', ->
    describe 'click', ->
      beforeEach ->
#        $("#sandbox").click()
        jasmine.Event.mouse 'click', $('#sandbox')
      it 'click event was fired', ->
        expect(spyEvts.click).toHaveBeenTriggered()
    describe 'move', ->
      beforeEach ->
        jasmine.Event.mouse 'move', $('#sandbox')
      it 'mousemove event was fired', ->
        expect(spyEvts.mousemove).toHaveBeenTriggered()


