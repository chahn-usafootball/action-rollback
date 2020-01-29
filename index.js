const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN)

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const id = core.getInput('release_id', { required: false })
    const tag = core.getInput('tag', { required: false })

    if (!id && !tag) {
      core.setFailed('At least one of the following inputs must be defined: release_id or tag.')
      return
    }

    // Retrieve the release ID
    if (!id) {
      const data = await github.repos.getReleaseByTag({
        owner,
        repo,
        release
      })

      // Fail if no release is found
      if (!data || !data.hasOwnProperty('id')) {
        core.setFailed(`"${tag}" was not found or a release ID is not associated with it.`)
        return
      } else {
        id = data.id
      }
    }
    
    // API Documentation: https://developer.github.com/v3/repos/releases/#delete-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-delete-release
    const response = await github.repos.deleteRelease({
      owner,
      repo,
      release_id: id
    })

    core.setOutput('id', id)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()