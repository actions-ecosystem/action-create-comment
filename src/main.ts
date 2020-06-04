import * as github from '@actions/github';
import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const body = core.getInput('body', { required: true });

    const octokit = github.getOctokit(githubToken);

    let { owner, repo } = github.context.repo;
    if (core.getInput('repo')) {
      [owner, repo] = core.getInput('repo').split('/');
    }

    const number =
      core.getInput('number') === ''
        ? github.context.issue.number
        : parseInt(core.getInput('number'));

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body
    });
  } catch (e) {
    core.error(e);
    core.setFailed(e.message);
  }
}

run();
