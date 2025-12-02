describe('Snellen Test - End to end (fail-fast path)', () => {
  const SNELLEN_HASH = '/#/home/test/snellen';

  beforeEach(() => {
    cy.loginByStorage();
    cy.visit(SNELLEN_HASH);
  });

  it('completes the test and shows report (by intentionally answering wrong)', () => {
    // Start screen: click the first primary button
    cy.get('button').first().click({ force: true });

    // Ensure we are on testing screen (grid of 4 answer buttons)
    cy.get('.grid button').should('have.length', 4);

    // Click wrong answers up to 8 times to ensure test finishes quickly
    for (let i = 0; i < 8; i++) {
      cy.get('div[style*="rotate("]')
        .first()
        .invoke('attr', 'style')
        .then((style) => {
          const match = style && style.match(/rotate\((\d+)deg\)/);
          const deg = match ? parseInt(match[1], 10) : 0;
          const currentIndex = Math.floor(deg / 90) % 4; // 0->0, 90->1, 180->2, 270->3
          const wrongIndex = (currentIndex + 1) % 4; // pick a different answer
          cy.get('.grid button').eq(wrongIndex).click({ force: true });
        });
    }

    // After finishing trials, grid should disappear and loading/report should appear
    cy.get('.grid button', { timeout: 20000 }).should('not.exist');

    // Report screen usually has 3 buttons: Redo, Export PDF, Share (optional)
    // Assert at least the redo or export button exists by checking common texts
    cy.contains('button', /pdf|PDF|xuất|Xuất/i, { timeout: 20000 }).should('exist');
  });
});

