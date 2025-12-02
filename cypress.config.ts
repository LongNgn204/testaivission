import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    screenshotOnRunFailure: true,
    env: {
      // Force HashRouter URLs
      hash: true,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
})
