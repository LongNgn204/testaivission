describe('Navigation after login', () => {
  const HOME_HASH = '/#/home';

  beforeEach(() => {
    cy.loginByStorage();
    cy.visit(HOME_HASH);
    cy.location('hash').should('eq', '#/home');
  });

  it('navigates to History page', () => {
    cy.get('a[href="#/home/history"]').first().click({ force: true });
    cy.location('hash').should('eq', '#/home/history');
  });

  it('navigates to Progress page', () => {
    cy.get('a[href="#/home/progress"]').first().click({ force: true });
    cy.location('hash').should('eq', '#/home/progress');
  });

  it('navigates to Hospitals page', () => {
    cy.get('a[href="#/home/hospitals"]').first().click({ force: true });
    cy.location('hash').should('eq', '#/home/hospitals');
  });

  it('navigates to Reminders page', () => {
    cy.get('a[href="#/home/reminders"]').first().click({ force: true });
    cy.location('hash').should('eq', '#/home/reminders');
  });

  it('navigates to About page', () => {
    cy.get('a[href="#/home/about"]').first().click({ force: true });
    cy.location('hash').should('eq', '#/home/about');
  });
});

