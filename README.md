<p align="center">
  <a href="https://github.com/aknot242/nim-gitops-publisher/actions"><img alt="typescript-action status" src="https://github.com/aknot242/nim-gitops-publisher/workflows/build-test/badge.svg"></a>
</p>

# GitHub Action for NGINX Instance Manager

Use this action to publish NGINX configuration files to NIM when they are updated.

## Usage

1. Create a GitHub Actions secret called `NIM_API_TOKEN` in the repository you wish to use this action. The value should be a valid API token for the NGINX Instance Manager API.

1. In your GitHub repo, create a `github/workflows/publish.yml` file.

1. Insert the contents into the file:

```yaml
name: "publish"
on: # rebuild any PRs and main branch changes
  pull_request:
  push:
    branches:
      - main
      - "releases/*"

jobs:
  publish: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          repository: aknot242/nim-gitops-publisher
          path: nim-gitops-publisher
      - uses: ./nim-gitops-publisher
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          nim_url: "https://echo.whatis.cloud"
          conf_files_directory: conf
          aux_files_directory: auxfiles
```

1. Update the above content as appropriate for your environment. The list of expected parameters can be found in [action.yml](action.yml).

> NOTE: The above workflow is set to trigger more than you intended. Adjust accordingly.

## Development

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```
