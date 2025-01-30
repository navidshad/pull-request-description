const core = require('@actions/core');
const { execSync } = require('child_process');
const OpenAI = require('openai');

async function run() {
  try {
    // Get inputs
    const apiKey = core.getInput('api_key');
    const userPrompt = core.getInput('prompt');
    const gitDiff = core.getInput('git_diff');

    // Configure OpenAI client
    const openai = new OpenAI({ apiKey });

    // Create combined prompt
    const messages = [
      {
        role: "system",
        content: "You are an expert code review assistant. Generate a clear and concise description for a Pull Request based on the changes provided."
      },
      {
        role: "user",
        content: `${userPrompt}\n\nCode Changes:\n\`\`\`diff\n${gitDiff}\n\`\`\``
      }
    ];

    // Call the ChatGPT API
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    // Get and save response
    const description = completion.choices[0].message.content;
    core.setOutput('description', description);

  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
