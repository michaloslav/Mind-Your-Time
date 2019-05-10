const sectionInfo = {
  general: {
    order: 0,
    label: "General settings",
    icon: "settings"
  },
  detection: {
    order: 1,
    label: "Automatic detection",
    icon: "search"
  },
  misc: {
    order: 2,
    label: "Miscellaneous",
    icon: "menu"
  },
}

const inputInfo = {
  timeFormat24H: {
    label: "Use the 24-hour time format",
    type: "boolean",
    section: "general",
    order: 0,
    icon: "timer"
  },
  bufferTimePercentage: {
    label: "Bufffer time percentage",
    type: "percentage",
    max: 1,
    tooltip: "Buffer times are short breaks inserted after each project. Their length depends on the length of the project before them. This field determines what percentage of the previous project's duration the buffer will be.",
    section: "general",
    order: 1,
    icon: "view_week"
  },
  showResetButtonAfter: {
    label: "Show reset button after (hours)",
    type: "int",
    section: "misc",
    order: 3,
    icon: "restore"
  },
  defaultColors: {
    label: "Default colors:",
    type: "colors",
    section: "misc",
    order: 0,
    icon: "color_lens"
  },
  updateTimesAfterDrag: {
    label: "Adjust planned times after changing the order of projects",
    type: "boolean",
    section: "detection",
    order: 0,
    icon: "swap_vert"
  },
  updateTimesAfterEdit: {
    label: "Adjust planned times after editing a project",
    type: "boolean",
    section: "detection",
    order: 1,
    icon: "edit"
  },
  updateTimesAfterDelete: {
    label: "Adjust planned times after deleting a project",
    type: "boolean",
    section: "detection",
    order: 2,
    icon: "delete"
  },
  roundTo: {
    label: "Round to (minutes)",
    type: "int",
    section: "misc",
    order: 2,
    icon: "access_time"
  },
  changeModeOnTab: {
    label: "Change mode when the Tab key is pressed",
    type: "boolean",
    section: "misc",
    order: 1,
    icon: "redo"
  },
  detectBreaksAutomatically: {
    label: "Detect breaks automatically",
    type: "boolean",
    section: "detection",
    order: 3,
    icon: "pause"
  },
  adjustDurationOnPause: {
    label: "If you set progress to a number higher than the project's duration, adjust its duration",
    type: "boolean",
    section: "detection",
    order: 4,
    icon: "input"
  },
  offerToAdjustDurationOnDone: {
    label: "If a project takes longer than expected, offer to adjust its duration",
    type: "boolean",
    section: "detection",
    order: 5,
    icon: "build"
  },
  darkTheme: {
    label: "Dark theme",
    type: "boolean",
    section: "general",
    order: 0,
    icon: "invert_colors"
  }
}

export {sectionInfo, inputInfo}
