import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_TOKEN'] = 'token'
  process.env['INPUT_NIM_HOST'] = 'myhostname'
  process.env['INPUT_CONF_FILES_DIRECTORY'] = 'conf'
  process.env['INPUT_AUX_FILES_DIRECTORY'] = 'auxfiles'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
