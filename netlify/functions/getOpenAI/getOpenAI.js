const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const prompt = event.queryStringParameters.prompt; // Get the prompt from the URL query parameters
    const access_token = process.env.OPENAI_API_TOKEN; // 

    // Check if the prompt is defined and not empty
      if (!prompt || prompt.trim().length === 0) {
        throw new Error("Prompt is required");
      }

    // Send a POST request to the OpenAI API to generate text
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100,
        n: 1,
      }),
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to generate text: ${response.statusText}`);
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
