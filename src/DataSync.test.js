import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import DataSync from './DataSync'

test("DataSync renders correctly", () => {
  const renderer = new ShallowRenderer()
  renderer.render(<DataSync />)
  const result = renderer.getRenderOutput()
  expect(result).toMatchSnapshot()
})
