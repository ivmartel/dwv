module.exports = {
    "dataSource": "issues",
    "ignore-issues-with": ["duplicate", "invalid", "question", "wontfix"],
    "groupBy": {
      "Fixed": ["bug"],
      "Added": ["enhancement"],
      "Dependencies": ["dependencies"]
    },
    "template": {
      release: "## [{{release}}] - {{date}}\n{{body}}",
      group: "\n### {{heading}}\n",
      issue: "- {{name}} [{{text}}]({{url}})",
    }
}
