const {areIdenticalObjects, mergeObjects} = require('./objectUtil')

const aIO = areIdenticalObjects
const mO = mergeObjects

test("areIdenticalObjects detects identical objects of primitives", () => {
  expect(aIO({a: 123, b: 456, c: 789}, {a: 123, b: 456, c: 789})).toBe(true)
})

test("areIdenticalObjects detects non-identical objects of primitives", () => {
  expect(aIO({a: 123, b: 456, c: 789}, {a: 123, b: 456})).toBe(false)
  expect(aIO({a: 123, b: 456}, {a: 123, b: 456, c: 789})).toBe(false)
  expect(aIO({a: 123, b: 456, c: 987}, {a: 123, b: 456, c: 789})).toBe(false)
  expect(aIO({}, {a: 123, b: 456, c: 789})).toBe(false)
})

test("areIdenticalObjects detects identical arrays of primitives", () => {
  expect(aIO([123, 456], [123, 456])).toBe(true)
  expect(aIO(["123", "456"], ["123", "456"])).toBe(true)
})

test("areIdenticalObjects detects non-identical arrays of primitives", () => {
  expect(aIO([123, 456], [123, 456, 789])).toBe(false)
  expect(aIO([123, 456, 789], [123, 456])).toBe(false)
  expect(aIO([123, 456, 789], [123, 456, 987])).toBe(false)
})

test("areIdenticalObjects detects identical deep objects", () => {
  expect(aIO({a: {}, b: {}}, {a: {}, b: {}})).toBe(true)
  expect(aIO(
    {a: {aa: 123}, b: {ba: 456, bb: 789}},
    {a: {aa: 123}, b: {ba: 456, bb: 789}}
  )).toBe(true)
})

test("areIdenticalObjects detects non-identical deep objects", () => {
  const testCases = [
    {args: [
      {a: {}, b: {}}, {a: {}}
    ]},
    {args: [
      {a: {}, b: {ba: 123}}, {a: {}, b: {}}
    ]},
    {args: [
      {a: {aa: 123}, b: {ba: 456, bb: {bba: 789}}},
      {a: {aa: 123}, b: {ba: 456, bb: 789}}
    ]},
    {args: [
      {a: {aa: 123}, b: {ba: 456, bb: {bba: 789}}},
      {a: {aa: 123}, b: {ba: 456, bb: {bba: 987}}}
    ], dontSwapArgs: true}
  ]

  testCases.forEach(testCase => {
    expect(aIO(...testCase.args)).toBe(false)

    if(!testCase.dontSwapArgs){
      testCase.args.reverse()
      expect(aIO(...testCase.args)).toBe(false)
    }
  })
})

test("areIdenticalObjects detects non-identical arrays of objects", () => {
  const testCases = [
    {args: [
      [{}, {}], [{}]
    ]},
    {args: [
      [{}, {b: 123}], [{}, {}]
    ]},
    {args: [
      [{}, {b: {ba: 123}}], [{}, {b: {}}]
    ]},
    {args: [
      [{a: [123]}], [{a: [123, 456]}]
    ]}
  ]

  testCases.forEach(testCase => {
    expect(aIO(...testCase.args)).toBe(false)

    if(!testCase.dontSwapArgs){
      testCase.args.reverse()
      expect(aIO(...testCase.args)).toBe(false)
    }
  })
})

test("mergeObjects works in normal cases", () => {
  expect(mO(
    {a: 123, b: {ba: 456, bb: 789}},
    {b: {bb: 987}}
  )).toEqual(
    {a: 123, b: {ba: 456, bb: 987}}
  )
})

test("mergeObjects works with dates", () => {
  let date1 = new Date()
  let date2 = new Date("5/6/2019")

  expect(mO(
    {a: date1, b: {ba: date2}},
    {a: date2, b: {ba: date1}, c: date2, d: {da: date1}}
  )).toEqual(
    {a: date2, b: {ba: date1}, c: date2, d: {da: date1}}
  )
})
