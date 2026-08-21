describe("smoke", () => {
  it("loads the app", () => {
    cy.visit("/");
    cy.contains("Guided Reader").should("exist");
  });
});
