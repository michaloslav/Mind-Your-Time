export default function addMockProject(){
  localStorage.projects = JSON.stringify([
    {
      id: 12345678,
      name: "Existing project",
      estimatedDuration: "120",
      color: "#4BFFD1",
      plannedTime: {
        start: {h: 3, m: 30, pm: true},
        end: {h: 5, m: 30, pm: true}
      },
      state: "notStarted",
      order: 0
    }
  ])
  localStorage.defaultColorIndex = 1

  let keys = ["id", "name", "estimatedDuration", "color", "plannedTime", "state", "order"]
  keys.forEach(key => {
    localStorage["lastModified_projects_12345678_" + key] = new Date().toISOString()
  })
}
