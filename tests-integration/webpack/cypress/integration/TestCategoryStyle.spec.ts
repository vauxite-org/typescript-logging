it("Category style logging works", () => {
  cy.visit("http://localhost:8080")
    .get('#logArea')
    .should("have.value", "")
    .get("#categoryStyleButton")
    .click()
    .get('#logArea')
    .should("have.value", "root Debug root\n" +
      "root Info info\n" +
      "root#child1 Warn warn\n" +
      "root#child1 Error error\n" +
      "root#child1 Fatal fatal\n")
    .get("#clearButton")
    .click()
    .get('#logArea')
    .should("have.value", "");
});
