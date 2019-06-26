describe("UI layout viewport", () => {
  it("Displays properly on desktop", () => {
    cy.viewport(1000, 900)
    cy.visit("/")

    cy.get(".ModeSwitch div:first-child button").should("be.visible")
    cy.get(".ModeSwitch div:last-child button").should("be.visible")

    cy.contains("Duration estimate")
  })

  it("Displays properly on mobile", () => {
    cy.viewport(360, 640)
    cy.visit("/")

    cy.get("header").should("be.visible")

    cy.get("button[aria-label=\"Add a project\"]").should("be.visible")
  })
})
