module.exports = {
  rules: {
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'docs', // Documentation only changes
        'feature', // A new feature
        'fix', // A bug fix
        'fixme', // Add tags "FIXME"
        'performance', // A code change that improves performance
        'refactoring', // A code change that neither fixes a bug nor adds a feature
        'revert', // Reverts a previous commit
        'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'test', // Adding missing tests or correcting existing tests
        'todo', // Add tags "TODO"
        'update', // Small update
        'workflow', // Workflow update
      ],
    ],
  },
  prompt: {
    settings: {
      enableMultipleScopes: true,
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
          },
          feature: { description: 'A new feature', title: 'Features' },
          fix: { description: 'A bug fix', title: 'Bug Fixes' },
          fixme: { description: 'Add tags "FIXME:"', title: 'FIXME' },
          performance: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
          },
          refactoring: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Style',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
          },
          todo: { description: 'Add tags "TODO:"', title: 'TODO' },
          update: { description: 'Small update', title: 'Update' },
          workflow: { description: 'Workflow update', title: 'Update' },
        },
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
