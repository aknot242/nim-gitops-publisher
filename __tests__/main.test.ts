import { publish } from '../src/publisher'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import { jest, expect, test } from '@jest/globals'

export const context = {
  payload: {
    pull_request: {
      number: 123
    }
  },
  repo: {
    owner: 'monalisa',
    repo: 'helloworld'
  }
}

const mockApi = {
  rest: {
    repos: {
      getContent: jest.fn()
    }
  }
}

const getOctokit = jest.fn().mockImplementation(() => mockApi)

// const mockedGetOctokit = getOctokit as jest.Mocked<typeof getOctokit>

const gh = getOctokit('_')
// const reposMock = jest.spyOn(gh.rest.repos, 'getContent')

test('runs successfully', async () => {
  await expect(publish("123456", "reponame", "ownername", "https://nimurl", "abc123", "abc")).resolves.toBeUndefined()
  // expect(gh.rest.repos.getContent).toHaveBeenCalled()
})

test('throws invalid token', async () => {
  await expect(publish("", "reponame", "ownername", "https://nimurl", "abc123", "abc")).rejects.toThrow('missing github token')
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_TOKEN'] = 'token'
  process.env['INPUT_OWNER'] = 'ownername'
  process.env['INPUT_REPO'] = 'myreponame'
  process.env['INPUT_NIM_URL'] = 'myhostname'
  process.env['INPUT_NIM_API_TOKEN'] = 'abc123'
  process.env['INPUT_CONF_FILES_DIRECTORY'] = 'conf'
  process.env['INPUT_AUX_FILES_DIRECTORY'] = 'auxfiles'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
    encoding: 'utf8'
  }

  try {
    let res = cp.execFileSync(np, [ip], options)
    console.log("NO ERROR")
    console.log(res.toString())
  }
  catch (err) {
    console.log("output", err)
    // console.log("sdterr", err.stderr.toString())
  }
})
