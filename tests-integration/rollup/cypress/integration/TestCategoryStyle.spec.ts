it("Category style logging works", () => {
  cy.visit("http://localhost:8080")
    .get("#buttonLogCategory")
    .click()
    .get('#logIdCategory')
    .should("have.value", "Debug This is root at debug\n" +
      "Info This is root at info\n" +
      "Debug This is child on debug\n");
});
