/// <reference types="cypress" />
/**
 * Shared commands + seed helpers for the functional tests.
 */

type MutationResult =
  | { __typename: "QuerySuccess"; id?: string | null; message: string }
  | { __typename: "StandardError"; message: string }
  | { __typename: "Redirect"; redirectTo: string };

declare global {
  namespace Cypress {
    interface Chainable {
      mutate(name: string, body: Record<string, unknown>): Chainable<MutationResult>;
    }
  }
}

Cypress.Commands.add("mutate", (name, body) =>
  cy.request("POST", `/${name}`, body).then((r) => r.body as MutationResult),
);

beforeEach(() => {
  cy.task("dbReset");
  cy.request({
    method: "POST",
    url: "/__reset-cache",
    failOnStatusCode: false,
  });
});

/** Log URL + a body snippet after each test so failures self-diagnose. */
afterEach(() => {
  cy.url().then((url) =>
    cy.document().then((doc) => {
      const text = (doc.body.textContent || "").replace(/\s+/g, " ").slice(0, 300);
      cy.task("log", `[after ${url}] ${text}`);
    }),
  );
});

export {};
