describe('TMNT Application utility functions', function () {
  it('should do create', function () {
    expect(util.create({ a: 5 }, { b: 6 })).to.have.keys(['b']);
  });
});
