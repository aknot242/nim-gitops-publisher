import { publish } from '../src/publisher'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import { expect, test } from '@jest/globals'

test('throws invalid token', async () => {
  await expect(publish("", "reponame", "ownername", "https://nimurl", "abc")).rejects.toThrow('missing github token')
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_TOKEN'] = 'token'
  process.env['INPUT_OWNER'] = 'ownername'
  process.env['INPUT_REPO'] = 'myreponame'
  process.env['INPUT_NIM_URL'] = 'myhostname'
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
