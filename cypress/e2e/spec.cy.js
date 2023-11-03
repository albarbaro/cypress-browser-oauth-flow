describe('template spec',
  {
    "retries": 3
  },
  () => {
    it('check variables', () => {
      console.log(Cypress.env('SPI_OAUTH_URL'))
      expect(Cypress.env('GH_USER')).to.not.be.empty
      expect(Cypress.env('GH_PASSWORD')).to.not.be.empty
      expect(Cypress.env('GH_2FA_CODE')).to.not.be.empty
      expect(Cypress.env('SPI_OAUTH_URL')).to.not.be.empty
    })

    it('passes', () => {

      const attempt = Cypress.currentRetry
      cy.task('log', 'Waiting ' + attempt * 5 * 1000 + ' milliseconds - attempt #' + attempt)
      cy.wait(attempt * 10 * 1000)

      cy.task('log', 'Visiting ' + Cypress.env('SPI_OAUTH_URL'))
      cy.visit(Cypress.env('SPI_OAUTH_URL'))

      cy.url().then((url) => {
        cy.task('log', 'Current URL is: ' + url)
      })

      cy.origin('https://github.com/login', () => {

        cy.get('#login_field').should('exist')
        cy.get('#password').should('exist')
        cy.get('input[type="submit"][name="commit"]').should('exist')

        cy.url().then((url) => {
          cy.task('log', 'Current Github URL is: ' + url)
        })

        cy.get('#login_field').type(Cypress.env('GH_USER'), { log: false });
        cy.get('#password').type(Cypress.env('GH_PASSWORD'), { log: false });
        cy.get('input[type="submit"][name="commit"]').click();

        cy.task("generateToken", Cypress.env('GH_2FA_CODE')).then(token => {
          cy.get("#app_totp").type(token, { log: false });
          cy.task('log', 'Generated token')
          expect(token).to.not.be.empty
        });

        cy.get('body').then(($el) => {
          if ($el.find('#js-oauth-authorize-btn').length > 0) {
            cy.task('log', 'Need to authorize app')
            cy.get('#js-oauth-authorize-btn').click();
          } else {
            cy.task('log', 'No need to authorize app')
          }
        });

        cy.get('body').then(($el) => {
          if ($el.find('button[type="submit"]').length > 0) {
            cy.task('log', 'Need to confirm recovery settings')
            cy.get('button[type="submit"]').last().click();
          } else {
            cy.task('log', 'No need to confirm recovery settings')
          }
        });

      })

      cy.location('pathname')
        .should('include', '/callback_success')
      cy.url().then((url) => {
        cy.task('log', 'Current Github URL is: ' + url)
      })

    })

  })
