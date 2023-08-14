import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod
} from '@octokit/types'

import { Octokit } from '@octokit/rest'

interface ConfigFile {
  name: string
  contents: string
}

interface Payload {
  configFiles: ConfigFiles
  ignoreConflict: boolean
  updateTime: string
  validateConfig: boolean
}
interface ConfigFiles {
  files?: ConfigFile[]
  rootDir: string
}
const octokit = new Octokit()
type GetContentResponseType = GetResponseTypeFromEndpointMethod<
  typeof octokit.repos.getContent
>
type GetContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.repos.getContent
>

async function run(): Promise<void> {
  try {
    core.debug(`Running action...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    const token = core.getInput('token', { required: true })
    const tokenOctokit = getOctokit(token)

    const files = await tokenOctokit.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: 'conf'
    })

    const payload: Payload = {
      configFiles: { rootDir: '/etc/nginx' },
      ignoreConflict: true,
      validateConfig: true,
      updateTime: new Date().toISOString()
    }

    if (files instanceof Array) {
      payload.configFiles.files = (files as any[]).map(c => {
        return { contents: c.content, name: `/etc/nginx/${c.name}` }
      })
    }

    core.setOutput('payload', JSON.stringify(payload))
    // core.debug(`Payload: ${JSON.stringify(payload)}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
