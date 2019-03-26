export const defaultSettings = {
  timeFormat24H: false,
  bufferTimePercentage: .2,
  showResetButtonAfter: 16, // in hours
  defaultColors: [
    "#4BFFD1",
    "#39FF00",
    "#E8A60C",
    "#FF4848",
    "#290CE8",
  ],
  updateTimesAfterDrag: true,
  updateTimesAfterEdit: true,
  updateTimesAfterDelete: true,
  roundTo: 5,
  changeModeOnTab: false,
  detectBreaksAutomatically: true
}

export const defaultDataValues = {
  projects: [],
  breaks: [],
  defaultProjects: [],
  settings: defaultSettings,
  startTime: {h: 2, m: "00", pm: true},
  endTime: {h: 9, m: "00", pm: true},
  mode: "planning",
  defaultColorIndex: 0,
  defaultColorIndexDefaultProjects: 0,
  productivityPercentage: undefined,
  useDefaultProjects: true,
  lastReset: undefined
}
