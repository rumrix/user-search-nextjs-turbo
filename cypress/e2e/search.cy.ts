describe("GitHub user search", () => {
  it("searches, sorts, infinite scrolls, and respects dark mode", () => {
    cy.visit("/search?term=john&perPage=2", {
      onBeforeLoad(win) {
        // Force dark mode for the session
        win.matchMedia =
          win.matchMedia ||
          ((query: string) =>
            ({
              matches: true,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false
            } as any));
      }
    });

    cy.contains("GitHub User Search").should("be.visible");
    cy.contains("Results:").should("be.visible");
    cy.get("div").contains("jane").should("exist");
    cy.get("div").contains("john").should("exist");

    cy.get("body").should("have.css", "background-color", "rgb(15, 23, 42)");

    // Change sort and submit
    cy.get("#search-sort").click();
    cy.contains("Followers").click();
    cy.contains("button", "Search").click();

    cy.get("div").contains("jane").should("exist");

    // Infinite scroll loads the next page (mike)
    cy.scrollTo("bottom");
    cy.contains("mike", { timeout: 8000 }).should("exist");
  });
});
