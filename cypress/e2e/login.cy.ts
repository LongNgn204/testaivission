describe('Login Flow & Protected Routing', () => {
  const HOME_HASH = '/#/home';
  const LOGIN_HASH = '/#/login';

  it('redirects unauthenticated users from /home to /login', () => {
    // Ensure logged-out state
    localStorage.removeItem('user_data');

    cy.visit(HOME_HASH);
    cy.location('hash').should('eq', '#/login');
  });

  it('logs in via form and lands on /home', () => {
    // Visit login page
    cy.visit(LOGIN_HASH);

    // Fill form fields by type
    cy.get('input[type="text"]').type('E2E User');
    cy.get('input[type="number"]').clear().type('26');
    cy.get('input[type="tel"]').type('0912345678');

    // Submit form
    cy.get('form').submit();

    // Expect to be on /home
    cy.location('hash').should('eq', '#/home');

    // LocalStorage should contain user_data
    cy.window().then((win) => {
      const raw = win.localStorage.getItem('user_data');
      expect(raw).to.be.a('string');
      const user = raw && JSON.parse(raw);
      expect(user.name).to.eq('E2E User');
    });
  });

  it('allows direct access to /home when authenticated', () => {
    cy.loginByStorage();
    cy.visit(HOME_HASH);
    cy.location('hash').should('eq', '#/home');
  });
});

