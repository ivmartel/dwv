module.exports = {
    "dataSource": "milestones",
    "ignore-issues-with": ["duplicate", "invalid", "question", "wontfix"],
    "groupBy": {
      "Breaking": ["breaking"],
      "Added": ["enhancement"],
      "Fixed": ["bug"],
      "Dependencies": ["dependencies"]
    },
    "template": {
      release: "## [{{release}}](https://github.com/ivmartel/dwv/releases/tag/{{release}}) - {{date}}\n{{body}}",
      group: "\n### {{heading}}\n",
      issue: "- {{name}} [{{text}}]({{url}})",
    }
}
