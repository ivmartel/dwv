# Contributing to `gren` 🍺🤖👍

❤️ Thanks for contributing to this project.
Following, you can find a couple of things to keep in mind before contributing to gren.


1. [Issues](#issues)
2. [Commits](#commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)

## Issues

Every piece of work has to be related to an issue.
The issue will have a capitalised title, which follows the same rules of [commits messages](#commits).

Every issue should contain one label that reflects the issue category.
If the issue is going to be close with no development, use one of these labels:

- `wontfix`
- `can't replicate`
- `gren ignore`
- `invalid`
- `duplicate`

When a task is completed, create a [Pull Request](#pull-requests) which closes the issue.

## Commits

1. Start the subject line with a verb (e.g. **Change** header styles)
2. Use the imperative mood in the subject line (e.g. **Fix**, not _Fixed_ or _Fixes_ header styles)
3. Limit the subject line to about 50 characters
4. Do not end the subject line with a period
5. Separate subject from body with a blank line
6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how

## Branches

For every piece of development, create a branch. The naming convention for the branch is `lowercases-with-dashes`.
Branch off `master` rebase on top of `master` and create a PR back to `master`.

The branch will be deleted straight after the pull request.

## Pull Requests

A PR has to close at least one issue and preferably only one. The less amount of work is in one PR, the easier is to review it.

The body of the PR should start with a [message that closes the related issues](https://help.github.com/articles/closing-issues-via-commit-messages/) and the actual description in a new lines.

The commit history in a PR should not contain `Merge` commits and should be rebased on top of `master`.

It's easier to review the PR, if you rebase your commits so that every commit represents a sub-piece of the development and can be independently reviewed or a clear list of the features on that branch.

e.g.
```
Closes #123

Here any further informations needed to the reviewer, e.g. run yarn before reviewing.
```

### Checks

Every PR has to be reviewed before can be merged in.

