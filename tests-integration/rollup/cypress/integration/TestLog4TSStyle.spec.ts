it("Log4TS style logging works", () => {
  cy.visit("http://localhost:8080")
    .get("#buttonLogLog4TS")
    .click()
    .get('#logIdLog4TS')
    .should("have.value", "Debug This is a test at debug\n" +
      "Info This is a test at info\n" +
      "Error This is an an example at error\n");
});
