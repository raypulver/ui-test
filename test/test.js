describe('TMNT Application utility functions', function () {
  it('should do create natively', function () {
    var created;
    expect((created = Util.create({ a: 5 }, { b: 6 }))).to.have.keys(['b']);
    expect(Object.getPrototypeOf(created)).to.have.keys(['a']);
  });
  it('should shim create', function () {
    var created;
    expect((created = Util._createShim({ a: 5 }, { b: 6 }))).to.have.keys(['b']);
    expect(Object.getPrototypeOf(created)).to.have.keys(['a']);
  });
  it('should shim Array#map', function () {
    expect(Util._mapShim.call([1, 5, 9], function (v) {
      return v*3;
    })).to.eql([3, 15, 27]);
  });
  it('should shim Array#find', function () {
    expect(Util.find.call([1, 5, 9], function (v) {
      return !(v % 3);
    })).to.equal(9);
    expect(Util.find.call([1, 5, 9], function (v, i) {
      return i === 3;
    })).to.be.null;
  });
  it('should shim Array#forEach', function () {
    var results = [], data;
    Util._forEachShim.call((data = [1, 5, 9]), function (v, i) {
      results.push(i);
    });
    expect(results).to.eql([0, 1, 2]);
  });
});
describe('TMNT Store object', function () {
  beforeEach(function () {
    Store.setReducer(Store.combineReducers({
      first: function (evt, state) {
        if (!state) state = {};
        switch (evt.type) {
          case 'SOME_EVENT':
            return {
              prop: evt.prop
            };
          default:
            return state;
        }
      },
      second: function (evt, state) {
        if (!state) state = {};
        switch (evt.type) {
          case 'OTHER_EVENT':
            return {
              prop: evt.prop
            };
          default:
            return state;
        }
      }
    }));
    Store.dispatch({
      type: 'SOME_EVENT',
      prop: 5
    });
    Store.dispatch({
      type: 'OTHER_EVENT',
      prop: false
    });
  });
  it('should reduce a state tree to a new state', function () {
    expect(Store.getState()).to.eql({
      first: { prop: 5 },
      second: { prop: false }
    });
  });
  it('should provide the new state to subscribers', function (done) {
    Store.subscribe(function (state, oldState) {
      expect(state).to.eql({ first: { prop: 6 }, second: { prop: false } });
      expect(oldState).to.eql({ first: { prop: 5 }, second: { prop: false } });
      done();
    });
    Store.dispatch({
      type: 'SOME_EVENT',
      prop: 6
    });
  });
});
