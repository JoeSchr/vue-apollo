const ssr = require('../../../vue-apollo-ssr')

describe('ssr states', () => {
  function buildClient (cache) {
    return {
      cache: {
        extract () {
          return cache
        },
      },
    }
  }

  const defaultClient = buildClient({
    'foo': '<alert>hiya!</alert>',
  })

  const otherClient = buildClient({
    'foo': 'bar',
  })

  const clients = {
    defaultClient,
    profile: defaultClient,
    other: otherClient,
  }

  describe('serializeStates', () => {
    it('safely serializes by default', () => {
      const safe = '{"defaultClient":{"foo":"\\u003Calert\\u003Ehiya!\\u003C\\u002Falert\\u003E"},"profile":{"foo":"\\u003Calert\\u003Ehiya!\\u003C\\u002Falert\\u003E"},"other":{"foo":"bar"}}'

      const serialized = ssr.serializeStates(clients)
      expect(serialized).not.toMatch('<alert>hiya!</alert>')
      expect(serialized).toMatch(safe)
    })

    it('allows option to use raw JSON stringify', () => {
      const unsafe = '{"defaultClient":{"foo":"<alert>hiya!</alert>"},"profile":{"foo":"<alert>hiya!</alert>"},"other":{"foo":"bar"}}'

      expect(ssr.serializeStates(clients, { useUnsafeSerializer: true })).toMatch(unsafe)
    })
  })

  describe('getStates', () => {
    it('exports provider clients to object', () => {
      expect(ssr.getStates(clients)).toMatchObject({
        defaultClient: { foo: '<alert>hiya!</alert>' },
        profile: { foo: '<alert>hiya!</alert>' },
        other: { foo: 'bar' },
      })
    })
  })

  describe('exportStates', () => {
    it('sets attachTo and globalName equal to serializedstates', () => {
      const string = ssr.exportStates(clients, { globalName: 'NUXT', attachTo: 'global' })

      expect(string).toMatch(/^global\.NUXT/)
    })
  })
})
