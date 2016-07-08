describe('TMNT Application utility functions', function () {
  it('should do create', function () {
    throw Error(JSON.stringify(util.keys(util.create({ a: 5 }, { b: 6 }))));
    expect(util.create({ a: 5 }, { b: 6 })).to.have.keys(['b']);
  });
});
