import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import fetch from 'node-fetch'

interface NginxFile {
  name: string
  contents?: string
}

interface NginxFiles {
  files?: NginxFile[]
  rootDir: string
}

interface Payload {
  configFiles: NginxFiles
  auxFiles?: NginxFiles
  ignoreConflict: boolean
  updateTime: string
  validateConfig: boolean
}

export async function publish(
  githubToken: string,
  githubRepo: string,
  githubOwner: string,
  nimUrl: string,
  nimApiToken: string,
  configFilesDirectory: string,
  auxFilesDirectory: string
): Promise<void> {
  if (githubToken === '') {
    throw new Error('missing github token')
  }

  if (configFilesDirectory === '') {
    throw new Error('missing config files directory')
  }

  try {
    core.debug(`Running action...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())

    const octokit = getOctokit(githubToken)

    const payload: Payload = {
      configFiles: {
        rootDir: '/etc/nginx',
        files: await getGithubFiles(
          githubOwner,
          githubRepo,
          configFilesDirectory,
          octokit
        )
      },
      ignoreConflict: true,
      validateConfig: true,
      updateTime: new Date().toISOString()
    }

    if (auxFilesDirectory !== '') {
      payload.auxFiles = {
        rootDir: '/etc/nginx/aux',
        files: await getGithubFiles(
          githubOwner,
          githubRepo,
          auxFilesDirectory,
          octokit
        )
      }
    }

    const response = await sendFilesToNMS(nimUrl, payload, nimApiToken)
    core.debug(response)

    core.setOutput('payload', JSON.stringify(payload))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function getGithubFiles(
  githubOwner: string,
  githubRepo: string,
  configFilesDirectory: string,
  octokit
): Promise<NginxFile[]> {
  const ghOptions = {
    owner: githubOwner,
    repo: githubRepo,
    path: configFilesDirectory
  }

  const { data: files } = await octokit.rest.repos.getContent(ghOptions)

  if (files instanceof Array) {
    return await Promise.all(
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
  } else {
    return [] as NginxFile[]
  }
}

export async function sendFilesToNMS(
  url: string,
  payload: Payload,
  apiToken: string
): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json', Authorization: apiToken }
  })

  if (!response.ok) {
    return 'Error'
  } else if (response.status >= 400) {
    return `HTTP Error: ${response.status} - ${response.statusText}`
  } else {
    return JSON.stringify(response.json())
  }
}
