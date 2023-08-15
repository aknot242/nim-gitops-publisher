import * as core from '@actions/core'
import { publish } from './publisher'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {
      required: true
    })
    const owner = core.getInput('owner', {
      required: true
    })
    const repo = core.getInput('repo', {
      required: true
    })
    const nimUrl = core.getInput('nim_url', {
      required: true
    })
    const nimApiToken = core.getInput('nim_api_token', {
      required: true
    })
    const configFilesDirectory = core.getInput('conf_files_directory', {
      required: true
    })
    const auxFilesDirectory = core.getInput('aux_files_directory', {
      required: false
    })
    await publish(
      token,
      repo,
      owner,
      nimUrl,
      nimApiToken,
      configFilesDirectory,
      auxFilesDirectory
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
