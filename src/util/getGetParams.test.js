import getGetParams from './getGetParams'

test("getGetParams regular case", () => {
  expect(getGetParams("?a=123&b=456")).toEqual({a: "123", b: "456"})
})
