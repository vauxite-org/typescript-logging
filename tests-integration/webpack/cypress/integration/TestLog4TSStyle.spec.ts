it("Log4ts style logging works", () => {
  cy.visit("http://localhost:8080")
    .get('#logArea')
    .should("have.value", "")
    .get("#log4TSStyleButton")
    .click()
    .get('#logArea')
    .should("have.value", "model.Example Debug debug!\n" +
      "model.Example Info info!\n" +
      "model.Example Warn warn!\n" +
      "model.Example Error error!\n" +
      "model.Example Fatal fatal!\n")
    .get("#clearButton")
    .click()
    .get('#logArea')
    .should("have.value", "");
});
