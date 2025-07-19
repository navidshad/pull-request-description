const core = require("@actions/core");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

async function run() {
  try {
    const apiKey = core.getInput("api_key");
    const prompt = core.getInput("prompt");
    const model = core.getInput("model");
    let rawDiff = core.getInput("git_diff");
    const rawDiffFile = core.getInput("git_diff_file");

    core.debug(`Prompt: ${prompt}`);
    core.debug(`Model: ${model}`);
    core.debug(`Raw git_diff input: ${rawDiff || "Empty"}`);
    core.debug(`git_diff_file input: ${rawDiffFile || "Not provided"}`);

    if (rawDiffFile) {
      const filePath = path.join(process.cwd(), rawDiffFile);
      core.debug(`Reading file from: ${filePath}`);
      rawDiff = fs.readFileSync(filePath, "utf8");
      core.debug(
        `Raw diff from file (first 500 chars): ${rawDiff.substring(0, 500)}`
      );
    }

    core.debug("Sanitizing diff content...");
    const gitDiff = rawDiff
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");

    core.debug(
      `Sanitized diff (first 500 chars): ${gitDiff.substring(0, 500)}`
    );

    core.debug("Initializing OpenAI client...");
    const openai = new OpenAI({ apiKey });

    core.debug("Requesting completion from OpenAI...");
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert code review assistant. Generate a clear and concise description for a Pull Request based on the changes provided using a valid Markdown.",
        },
        {
          role: "user",
          content: `${prompt}\n\nDIFF:\n\`\`\`diff\n${gitDiff}\n\`\`\``,
        },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 4096,
    });

    core.debug("Processing OpenAI response...");
    const description = completion.choices[0].message.content
      .replace(/```/g, "\\`\\`\\`")
      .replace(/\${/g, "\\${");
    core.debug(
      `Generated description (first 500 chars): ${description.substring(
        0,
        500
      )}`
    );

    core.setOutput("description", description);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
    core.debug(`Full error stack: ${error.stack}`);
  }
}

run();
