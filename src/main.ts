import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

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

async function run(): Promise<void> {
  try {
    core.debug(`Running action...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    const token = core.getInput('token', { required: true })
    const confFilesDirectory = core.getInput('conf_files_directory', {
      required: true
    })
    const octokit = getOctokit(token)

    const ghOptions = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: confFilesDirectory
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

    core.setOutput('payload', JSON.stringify(payload))
    // core.debug(`Payload: ${JSON.stringify(payload)}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
