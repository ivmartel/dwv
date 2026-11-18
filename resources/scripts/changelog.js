// Generate the changelog section of a release from the closed issues
// of its GitHub milestone (milestone title = release version).
// Usage: node resources/scripts/changelog.js 0.37.0 > new.md
// Set GITHUB_TOKEN to avoid the unauthenticated API rate limit.

const repo = 'ivmartel/dwv';
// issues with these labels are skipped
const ignoreLabels = ['duplicate', 'invalid', 'question', 'wontfix'];
// group title: labels; an issue goes in the first matching group,
// issues matching no group are skipped
const groups = {
  Breaking: ['breaking'],
  Added: ['enhancement'],
  Fixed: ['bug'],
  Dependencies: ['dependencies']
};

/**
 * Get a GitHub API list and its following pages.
 *
 * @param {string} url The request url.
 * @returns {Promise<object[]>} The list items.
 */
async function getAll(url) {
  const headers = {Accept: 'application/vnd.github+json'};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(url, {headers});
  if (!response.ok) {
    throw new Error(
      `GitHub request failed: ${response.status} ${await response.text()}`);
  }
  const items = await response.json();
  const next = /<([^>]+)>; rel="next"/.exec(
    response.headers.get('link') || '');
  return next ? items.concat(await getAll(next[1])) : items;
}

/**
 * Format a date as dd/mm/yyyy.
 *
 * @param {Date} date The date to format.
 * @returns {string} The formatted date.
 */
function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/` +
    `${date.getFullYear()}`;
}

const version = process.argv[2];
if (!version) {
  console.error('Usage: node changelog.js <release version, m.n.p>');
  process.exit(1);
}

const apiUrl = `https://api.github.com/repos/${repo}`;
const milestones = await getAll(`${apiUrl}/milestones?state=all&per_page=100`);
const milestone = milestones.find((item) => item.title === version);
if (!milestone) {
  console.error(`No milestone with title: ${version}`);
  process.exit(1);
}

const issues = (await getAll(`${apiUrl}/issues?state=closed&per_page=100` +
  `&milestone=${milestone.number}`))
  .filter((issue) => typeof issue.pull_request === 'undefined')
  .map((issue) => ({
    ...issue,
    labelNames: issue.labels.map((label) => label.name)
  }))
  .filter((issue) => !issue.labelNames.some(
    (name) => ignoreLabels.includes(name)));

const tag = `v${version}`;
let text = `## [${tag}](https://github.com/${repo}/releases/tag/${tag})` +
  ` - ${formatDate(new Date())}\n`;
const done = new Set();
for (const [title, labels] of Object.entries(groups)) {
  const groupIssues = issues.filter((issue) => !done.has(issue.number) &&
    issue.labelNames.some((name) => labels.includes(name)));
  if (groupIssues.length === 0) {
    continue;
  }
  text += `\n### ${title}\n\n`;
  for (const issue of groupIssues) {
    done.add(issue.number);
    text += `- ${issue.title} [#${issue.number}](${issue.html_url})\n`;
  }
}
process.stdout.write(text);
