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
       // model: "gpt-3.5-turbo",
        model: "gpt-4",
        messages: [
//          {role: "system", content: "You are a friendly assistant who wants to help people find music they will love."},
          {role: "system", content: "You use succinct, plain language focused on accuracy and professionalism."},
          {role: "user", content: prompt}
        ],
        max_tokens: max_tokens,
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
