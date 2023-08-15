import * as core from '@actions/core'
import { publish } from './publisher'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    const owner = core.getInput('owner')
    const repo = core.getInput('repo')
    const nimUrl = core.getInput('nim_url', {
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
      configFilesDirectory,
      auxFilesDirectory
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
