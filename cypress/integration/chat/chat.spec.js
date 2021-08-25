// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe("OrbitChat", () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit("http://localhost:3000");
  });

  it("displays the login page", () => {
    // We use the `cy.get()` command to get all elements that match the selector.
    // Then, we use `should` to assert that there are two matched items,
    // which are the two default items.
    cy.get("h3").should("have.text", "Enter Username");
  });

  it("fills the login form", () => {
    cy.get("input.form-control").type("Bob").should("have.value", "Bob");
  });

  it("submits login and redirects", () => {
    const username = (Math.random() + 1).toString(36).substring(7);
    cy.get("input.form-control").type(username);
    cy.get("button.btn.btn-success").click();

    cy.wait(1000).then(() => {
      pollAlert();
    });

    const pollAlert = () => {
      const alert = cy.$$("#alert");
      if (!alert.length) {
        cy.get("h3").contains("peers");
        cy.location().should((loc) => {
          expect(loc.hash).to.eq("#/chat");
        });
        cy.get("textarea").type("Test Message");
        cy.get("#chatSubmit").click();
        cy.get(".chat-message").then((messages) => {
          expect(messages.last().text()).to.eq("Test Message");
        });
        cy.get(".bi-trash").then((msg) => {
          const el = msg.last();
          cy.get(el).click();
        });
        cy.openTab("http://localhost:3000", { tab_name: "user2" });
        cy.switchToTab("user2");
        cy.wait(4000).then(() => {
          // clearIndexeddb();
          // cy.visit("http://localhost:3000");
          // cy.reload(true, { timeout: 60000 });
          cy.wait(2000).then(() => {
            const username = "user test 2";
            cy.get("input.form-control").type(username);
            cy.get("button.btn.btn-success").click();
          });
        });
      } else {
        cy.wait(2000).then(() => {
          pollAlert();
        });
      }
    };

    // const clearIndexeddb = async () => {
    //   const dbs = await window.indexedDB.databases();
    //   return dbs.map((db) => indexedDB.deleteDatabase(db.name));
    // };

    // cy.wait(30000).then(() => {
    // });

    // cy.visit("http://localhost:3000");
    // cy.wait("@getChat", { timeout: 20000 }).then((interception) => {
    //   // we can now access the low level interception
    //   // that contains the request body,
    //   // response body, status, etc
    // });
    // cy.location("pathname").should("eq", "/chat");
  });

  // it("posts a message in the chat", () => {
  //   const username = (Math.random() + 1).toString(36).substring(7);
  //   cy.get("input.form-control").type(username);
  //   // cy.intercept("/chat").as("getChat");
  //   cy.get("button.btn.btn-success").click();
  //   cy.wait(10000).then(() => {

  //   });
  // });
});
