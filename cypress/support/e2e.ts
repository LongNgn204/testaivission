// Cypress Support - runs before each spec

// Preserve localStorage between tests when desired
Cypress.Commands.add('preserveLocalStorage', () => {
  const USER_KEY = 'user_data';
  const saved = localStorage.getItem(USER_KEY);
  if (saved) {
    Cypress.env('preserved_user_data', saved);
  }
});

Cypress.Commands.add('restoreLocalStorage', () => {
  const saved = Cypress.env('preserved_user_data');
  if (saved) {
    localStorage.setItem('user_data', saved);
  }
});

// Custom command to login via localStorage (bypass form)
Cypress.Commands.add('loginByStorage', (user = {
  name: 'E2E Tester',
  age: '25',
  phone: '0912345678',
  loginTime: Date.now(),
}) => {
  localStorage.setItem('user_data', JSON.stringify(user));
});

declare global {
  namespace Cypress {
    interface Chainable {
      preserveLocalStorage(): Chainable<void>;
      restoreLocalStorage(): Chainable<void>;
      loginByStorage(user?: { name: string; age: string; phone: string; loginTime: number }): Chainable<void>;
    }
  }
}

