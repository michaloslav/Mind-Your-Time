import addMockProject from './_addMockProject'

describe("Navigating between different endpoints on desktop", () => {
  beforeEach(() => {
    cy.viewport(1000, 900)
    cy.visit("/")
  })

  it("Navigates to settings and back", () => {
    cy.get("#linkToSettings").click()
    cy.location("pathname").should("include", "settings")

    cy.get("a.LinkToRoot").click()
    cy.location("pathname").should("not.include", "settings")
  })

  it("Navigates to about and back", () => {
    cy.get("#dropdownMenuButton svg").click()
    cy.get("ul[role=menu] li:first-child").click()
    cy.location("pathname").should("include", "about")

    cy.get("a.LinkToRoot").click()
    cy.location("pathname").should("not.include", "about")
  })
})

// opens the drawer menu and clicks its nth element
function goToNth(n, additionalSelector = ""){
  cy.get("@openBtn").click()
  return cy.get(`#DrawerMenu ul > div:nth-child(${n}) ${additionalSelector}`).click()
}

function goToNthAndBack(n, pathname, additionalSelector = ""){
  goToNth(n, additionalSelector)
  cy.location("pathname").should("include", pathname)

  goToNth(1)
  cy.location("pathname").should("not.include", pathname)
}

describe("Navigation between different endpoints on mobile", () => {
  beforeEach(() => {
    cy.viewport(360, 640)
    cy.visit("/")
    cy.get("header button[aria-label=Menu]").as("openBtn") // open the drawer menu
  })

  it("Navigates to breaks and back", () => {
    goToNthAndBack(2, "breaks", "div[role=button]:first-child")
  })

  it("Navigates to repetitive projects and back", () => {
    goToNthAndBack(2, "defaultProjects", "div[role=button]:last-child")
  })

  it("Navigates to settings and back", () => {
    goToNthAndBack(4, "settings")
  })

  it("Navigates to about and back", () => {
    goToNthAndBack(5, "about")
  })
})

function assertMode(expected){
  expect(localStorage.mode).to.eq(expected)
}

describe("Switching between planning and working", () => {
  beforeEach(addMockProject)

  it("Works on desktop", () => {
    cy.viewport(1000, 900)
    cy.visit("/")

    // the "Let's get to work" button
    cy.get(".container > div:nth-child(2) > div:last-child > div:nth-child(2) button")
      .click()
      .should(() => assertMode("working"))

    // the Plan button
    cy.get(".ModeSwitch > div:first-child button")
      .click()
      .should(() => assertMode("planning"))

    // the Work button
    cy.get(".ModeSwitch > div:last-child button")
      .click()
      .should(() => assertMode("working"))
  })

  it("Works on mobile", () => {
    cy.viewport(360, 640)
    cy.visit("/")

    cy.get("header button[aria-label=Menu]").as("openBtn")

    // the "Let's get to work" button
    cy.get(".container > div:first-child > div:last-child button")
      .click()
      .should(() => assertMode("working"))

    // the Plan button
    goToNth(1)
      .should(() => assertMode("planning"))

    // the Work button
    goToNth(3)
      .should(() => assertMode("working"))
  })
})

describe("Menu drawer opening and closing (mobile)", () => {
  beforeEach(() => {
    cy.viewport(360, 640)
    cy.visit("/")
    cy.get("header button[aria-label=Menu]").as("openBtn") // open the drawer menu
  })

  it("Opens and closes the drawer", () => {
    cy.get("@openBtn").click()
    cy.get("#DrawerMenu ul").should("be.visible")

    cy.get("#DrawerMenu").click("right")
    cy.get("#DrawerMenu ul").should("not.be.visible")
  })

  it("Opens and closes the planning collapsable", () => {
    cy.get("@openBtn").click() // open the drawer

    cy.contains("Repetitive projects") // collapsable should be open

    // close the collapsable
    cy.get("#DrawerMenu ul > div:first-child > button").click()
    cy.contains("Repetitive projects").should('not.exist')

    // open the collapsable
    cy.get("#DrawerMenu ul > div:first-child > button").click()
    cy.contains("Repetitive projects")

    cy.get("#DrawerMenu").click("right") // close the drawer
  })
})
