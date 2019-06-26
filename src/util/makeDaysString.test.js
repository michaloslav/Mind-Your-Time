import makeDaysString from './makeDaysString'

const mDS = makeDaysString

test("makeDaysString with no positives", () => {
  expect(mDS([
    false, false, false, false, false, false, false
  ])).toBe("Never")
})

test("makeDaysString with few positives", () => {
  expect(mDS([
    true, false, false, true, false, false, false
  ])).toBe("Monday & Thursday")

  expect(mDS([
    true, false, true, false, false, true, false
  ], true)).toBe("Mon, Wed & Sat")
})

test("makeDaysString with many positives", () => {
  expect(mDS([
    true, true, true, false, false, true, true
  ])).toBe("Every day except Thursday & Friday")

  expect(mDS([
    true, false, true, false, true, true, true
  ], true)).toBe("All except Tue & Thu")
})

test("makeDaysString with all positives", () => {
  expect(mDS([
    true, true, true, true, true, true, true
  ])).toBe("Every day")
})
