// Method for creating parameterized tests cases with Jasmine
function paramTest(title, params, func) {
  params.forEach(paramArray => {
    it(title, function () {
      console.info("Parameters: ", params);
      func.apply(null, paramArray);
    });
  });
}

/*
// Example usage:
describe('parameterized test case', function () {
  var params = [
    [1, 2],
    [2, 3],
    [2, 2],
  ];

  paramTest("should do a thang", params, function (a, b) {
    expect(a).toBe(b);
  });
*/
