import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

interface ConfigFile {
  name: string
  contents?: string
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

export async function publish(
  githubToken: string,
  githubRepo: string,
  githubOwner: string,
  nimUrl: string,
  configFilesDirectory: string,
  auxFilesDirectory?: string
): Promise<void> {
  if (githubToken === '') {
    throw new Error('missing github token')
  }

  if (configFilesDirectory === '') {
    throw new Error('missing config files directory')
  }

  try {
    core.debug(`Running action...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    if (typeof auxFilesDirectory !== 'undefined') {
      // do something
    }

    core.debug(new Date().toTimeString())

    const octokit = getOctokit(githubToken)

    const ghOptions = {
      owner: githubOwner,
      repo: githubRepo,
      path: configFilesDirectory
    }

    const { data: files } = await octokit.rest.repos.getContent(ghOptions)

    const payload: Payload = {
      configFiles: { rootDir: '/etc/nginx' },
      ignoreConflict: true,
      validateConfig: true,
      updateTime: new Date().toISOString()
    }

    if (files instanceof Array) {
      payload.configFiles.files = await Promise.all(
        files.map(async c => {
          ghOptions.path = c.path
          ghOptions['mediaType'] = { format: 'vnd.github.raw' }
          const content = await octokit.rest.repos.getContent(ghOptions)
          return {
            contents: Buffer.from(
              content['data'] as unknown as string,
              'utf8'
            ).toString('base64'),
            name: `/etc/nginx/${c.name}`
          }
        })
      )
    }

    const response = await sendFilesToNMS(nimUrl, payload)
    core.debug(response)

    core.setOutput('payload', JSON.stringify(payload))
    // core.debug(`Payload: ${JSON.stringify(payload)}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export async function sendFilesToNMS(url: string, payload: Payload): Promise<string> {
  const response = await fetch('https://echo.whatis.cloud', {
    method: 'POST',
    body: JSON.stringify(payload),
    // headers: { 'Content-Type': 'application/json', 'Authorization': 'key=' + API_KEY }
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    return 'Error'
  } else if (response.status >= 400) {
    return `HTTP Error: ${response.status} - ${response.statusText}`
  } else {
    return response.statusText
  }
}
