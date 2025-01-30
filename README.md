# ChatGPT PR Description Action 🤖

[![GitHub release](https://img.shields.io/github/v/release/alvarocperez/pull-request-description)](https://github.com/alvarocperez/pull-request-description/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically generate meaningful Pull Request descriptions using ChatGPT. This GitHub Action analyzes your code changes and creates a comprehensive PR description with summaries, technical details, and testing requirements.

## Features ✨

- Automated PR description generation based on code changes
- Uses GPT-4 Turbo for high-quality analysis
- Customizable prompts to match your team's needs
- Supports markdown formatting in descriptions
- Handles large diffs and complex changes
- Secure handling of API keys

## Setup 🛠️

### Prerequisites

1. An OpenAI API key with access to GPT-4
2. GitHub repository with Actions enabled

### Configuration

1. Add your OpenAI API key as a repository secret:
   - Go to your repository's Settings > Secrets and variables > Actions
   - Create a new secret named `OPENAI_API_KEY`
   - Add your OpenAI API key as the value

2. Create a new workflow file (e.g., `.github/workflows/pr-description.yml`):

```yaml
name: Generate PR Description

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  generate-description:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 2

    - name: Get Git Diff
      id: git_diff
      run: |
        DIFF=$(git diff HEAD^ HEAD)
        echo "diff=$(echo "$DIFF" | jq -sRr @uri)" >> $GITHUB_OUTPUT

    - name: Generate PR Description
      id: generate_desc
      uses: alvarocperez/pull-request-description@v1.0.2
      with:
        api_key: ${{ secrets.OPENAI_API_KEY }}
        prompt: |
          Analyze the code changes and generate a PR description in markdown with:
          - Summary of changes
          - Technical implementation details
          - Testing requirements
        git_diff: ${{ steps.git_diff.outputs.diff }}

    - name: Update PR Description
      uses: actions/github-script@v6
      env:
        PR_DESCRIPTION: ${{ steps.generate_desc.outputs.description }}
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        script: |
          const { owner, repo } = context.repo;
          await github.rest.pulls.update({
            owner,
            repo,
            pull_number: context.payload.pull_request.number,
            body: process.env.PR_DESCRIPTION
          });
```

## Usage 💡

Once configured, the action will automatically run when:
- A new PR is opened
- An existing PR is edited
- New commits are pushed to a PR

The generated description will include:
- A summary of the changes
- Technical implementation details
- Testing requirements

### Customizing the Prompt

You can customize the prompt to match your team's PR description format:

```yaml
- uses: alvarocperez/pull-request-description@v1.0.2
  with:
    api_key: ${{ secrets.OPENAI_API_KEY }}
    prompt: |
      Please analyze the code changes and provide:
      1. Impact assessment
      2. Architecture changes
      3. Security considerations
      4. Performance implications
    git_diff: ${{ steps.git_diff.outputs.diff }}
```

## Contributing 🤝

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/alvarocperez/pull-request-description.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Make your changes
5. Build the action:
   ```bash
   npm run build
   ```
6. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
7. Push to your fork:
   ```bash
   git push origin main
   ```
8. Create a Pull Request

### Development Notes

- The action is built using Node.js
- We use `@vercel/ncc` to compile the action and its dependencies into a single file
- The main logic is in `index.js`
- The action definition is in `action.yml`

## Project Structure 📁

```
├── dist/               # Compiled action code
│   └── index.js
├── node_modules/       # Dependencies
├── action.yml         # Action metadata
├── index.js           # Main action code
├── package.json       # Project configuration
└── README.md          # Documentation
```

## Troubleshooting 🔍

### Common Issues

1. **API Key Issues**
   - Ensure your OpenAI API key is correctly set in repository secrets
   - Verify the key has access to GPT-4

2. **Workflow Permission Issues**
   - Check that the workflow has `pull-requests: write` permission
   - Verify the `GITHUB_TOKEN` has sufficient permissions

3. **Large Diffs**
   - The action handles large diffs by default
   - If you encounter issues, try increasing the `fetch-depth` in the checkout step

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
