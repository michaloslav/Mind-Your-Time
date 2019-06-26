import addMockProject from './_addMockProject'

describe("Editing an existing project", () => {
  beforeEach(addMockProject)

  it("Works on desktop", () => {
    cy.viewport(1000, 900)
    cy.visit("/")

    cy.get("tbody tr:nth-child(1) button[aria-label=\"Edit the project\"]")
      .click()

    cy.get("tbody tr:first-child .setNameCell input")
      .type("{selectall}Modified project")

    cy.get("tbody tr:first-child .setDurationCell input")
      .type("{selectall}150")

    cy.get("tbody tr:first-child .TimeSetterDesktop div[aria-label=Hours] input")
      .type("{selectall}1")

    cy.get("tbody tr:first-child .TimeSetterDesktop div[aria-label=Minutes] input")
      .type("{selectall}00")

    cy.get("tbody tr:first-child td:last-child button:first-child")
      .click()

    cy.contains("Modified project")
    cy.contains("150 minutes")
    cy.contains("1:00-3:30 PM")
  })

  it("Works on mobile", () => {
    cy.viewport(360, 640)
    cy.visit("/edit?id=12345678")

    cy.wait(50) // wait for the data to load

    cy.get(".MobileInputFields div[aria-label=Name] input").type("{selectall}Modified project")

    cy.get(".MobileInputFields div[aria-label=Duration] input").type("{selectall}45")

    cy.get(".MobileInputFields .TimeSetterMobile input").click()

    cy.get("div[role=dialog] div[class^=TimePicker-body] div[class^=Clock-circle]")
      .click(128, 240, {force: true}) // 6
    cy.wait(250)
    cy.get("div[role=dialog] div[class^=TimePicker-body] div[class^=Clock-circle]")
      .click(240, 128, {force: true}) // 15
    cy.get("div[role=dialog] button:nth-child(2)").click()

    cy.get(".MobileInputFields div:last-child button").click()

    cy.contains("Modified project")
    cy.contains("6:15-7:00 PM")
  })
})
