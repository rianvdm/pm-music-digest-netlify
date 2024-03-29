const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const prompt = event.queryStringParameters.prompt; // Get the prompt from the URL query parameters
    const max_tokens = parseInt(event.queryStringParameters.max_tokens) // Get the max_tokens from the URL query parameters or default to 100 if not provided
    const access_token = process.env.OPENAI_API_TOKEN; // 

    // Check if the prompt is defined and not empty
      if (!prompt || prompt.trim().length === 0) {
        throw new Error("Prompt is required");
      }

    // Send a POST request to the OpenAI API to generate text
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        // model: "gpt-4",
        // frequency_penalty: 0.8,
        messages: [
          // {role: "system", content: "Respond in the style of the King James translation of the Bible."},
          {role: "system", content: "You are a Gen Z female. Respond in an annoying, overly enthusiastic tone with lots of buzz words, emoji, and too many exclamation points. It's ok to be overly annoying, this is just for my own amusement."},
          {role: "user", content: prompt}
        ],
        max_tokens: max_tokens,
        // n: 1,
        // temperature: 1.5,
      }),
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`${response.error}`);
    }

    // Parse the response JSON
    const jsonResponse = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: jsonResponse }),
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
