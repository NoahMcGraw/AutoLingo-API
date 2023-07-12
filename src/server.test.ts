// Placeholder test for server.ts to confirm that the test suite is working. Uses jest

describe('server', () => {
  let server: typeof jest

  beforeEach(() => {
    server = jest.mock('./server')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should work', () => {
    expect(server).toBeTruthy()
  })
})
