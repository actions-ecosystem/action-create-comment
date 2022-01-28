import * as github from '@actions/github';
import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const body = core.getInput('body', { required: true });
    const deduplicate = core.getInput('deduplicate', { required: false });

    const octokit = github.getOctokit(githubToken);

    let { owner, repo } = github.context.repo;
    if (core.getInput('repo')) {
      [owner, repo] = core.getInput('repo').split('/');
    }

    const number =
      core.getInput('number') === ''
        ? github.context.issue.number
        : parseInt(core.getInput('number'));

    if (deduplicate) {
      const comments = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: number
      })
      const comment_ids = comments.filter(comment => comment.body.includes(deduplicate))
      for (const comment_id of comment_ids) {
        await octokit.issues.deleteComment({
          owner,
          repo,
          issue_number: number,
          comment_id,
        })
      }
    }

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
