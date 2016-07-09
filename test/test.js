describe('TMNT Application utility functions', function () {
  it('should do create', function () {
    expect(Util.create({ a: 5 }, { b: 6 })).to.have.keys(['b']);
  });
});
