describe("Adding a new project", () => {
  it("Works on desktop", () => {
    cy.viewport(1000, 900)
    cy.visit("/")

    cy.get("#addProjectRow div[aria-label=Name] input").type("New project")

    cy.get("#addProjectRow div[aria-label=Duration] input").type("180")

    cy.get("#addProjectRow .TimeSetterDesktop div[aria-label=Hours] input").type("{selectall}5")
    cy.get("#addProjectRow .TimeSetterDesktop div[aria-label=Minutes] input").type("{selectall}15")
    cy.get("#addProjectRow .TimeSetterDesktop > div:last-child").click()
    cy.get("ul[role=listbox] li[data-value=PM]").click()

    cy.get("#addProjectRow td:last-child button").click()

    cy.contains("New project")
    cy.contains("180 minutes")
    cy.contains("5:15-8:15 PM")
  })

  it("Works on mobile", () => {
    cy.viewport(360, 640) // Galaxy S5

    cy.visit("/add")

    cy.get(".MobileInputFields div[aria-label=Name] input").type("New project")

    cy.get(".MobileInputFields div[aria-label=Duration] input").type("180")

    cy.get(".MobileInputFields .TimeSetterMobile input").click()

    cy.get("div[role=dialog] div[class^=TimePicker-body] div[class^=Clock-circle]")
      .click(128, 230, {force: true}) // 6
    cy.wait(250)
    cy.get("div[role=dialog] div[class^=TimePicker-body] div[class^=Clock-circle]")
      .click(230, 128, {force: true}) // 15
    cy.get("div[role=dialog] button:nth-child(2)").click()

    cy.get(".MobileInputFields div:last-child button").click()

    cy.contains("New project")
    cy.contains("6:15-9:15 PM")
  })

  it("Validates text", () => {
    cy.viewport(1000, 900)
    cy.visit("/")

    cy.get("#addProjectRow div[aria-label=Name] input")
      .type("Testing{];")
      .should("have.value", "Testing")

    cy.get("#addProjectRow div[aria-label=Duration] input")
      .type("a1s2d0f")
      .should("have.value", "120")

    cy.get("#addProjectRow .TimeSetterDesktop div[aria-label=Hours] input")
      .type("{selectall}5asd")
      .should("have.value", "5")
      .type("{selectall}65")
      .should("have.value", "6")

    cy.get("#addProjectRow .TimeSetterDesktop div[aria-label=Minutes] input")
      .type("{selectall}15asd15")
      .should("have.value", "15")
  })
})
