function createNote(options = {}) {
  Object.assign(options, {
    text: `Revaluation battle selfish derive suicide revaluation society love superiority salvation spirit virtues revaluation. Aversion sexuality play burying mountains intentions battle reason strong burying war insofar inexpedient war. Fearful intentions selfish madness suicide.`,
  })
  cy.visit('http://localhost:5000')
  const text = options.text
  cy.get('[data-testid=input-note]').type(text)
  cy.get('[data-testid=button-create]').click()
  cy.wait(500)
  return cy
    .get('[data-testid=note-share-link]')
    .invoke('val')
    .then((link) => {
      return [link, text]
    })
}

describe('Basics', () => {
  it('Share note', () => {
    createNote().then(([link, text]) => {
      cy.visit(link)
      cy.get('[data-testid=button-show]').click()
      cy.wait(250)
      cy.get('[data-testid=note-result]').should('have.text', text)
    })
  })

  it('Check destroyed', () => {
    createNote().then(([link, text]) => {
      // Check the first time
      cy.visit(link)
      cy.get('[data-testid=button-show]').click()
      cy.wait(250)
      cy.get('[data-testid=note-result]').should('have.text', text)

      // Should not exists anymore
      cy.visit(link)
      cy.get('[data-testid=note-not-found]').should('exist')
    })
  })
})
