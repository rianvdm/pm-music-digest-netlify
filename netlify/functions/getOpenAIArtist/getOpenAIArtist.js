const fetch = require("node-fetch");
const Redis = require("ioredis");

exports.handler = async function(event, context) {
  try {
    const artistName = event.queryStringParameters.name.toLowerCase();
    const prompt = event.queryStringParameters.prompt; // Get the prompt from the URL query parameters
    const max_tokens = parseInt(event.queryStringParameters.max_tokens) // Get the max_tokens from the URL query parameters
    const access_token = process.env.OPENAI_API_TOKEN;

    // Check if the prompt is defined and not empty
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    const client = new Redis(process.env.REDIS_URL, {
      connectTimeout: 26000,
    });

    let artistSummary = await client.get(artistName); // Use artistName to get data from Redis

    if (!artistSummary) {
      console.log("Getting new summary from OpenAI")
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          // frequency_penalty: 0.8,
          messages: [
            {role: "system", content: "You use succinct, plain language focused on accuracy and professionalism."},
            {role: "user", content: prompt}
          ],
          max_tokens: max_tokens,
          n: 1,
          temperature: 1,
          // temperature: 1.5,
        }),
      });

      // If the response is not successful, throw an error
      if (!openAIResponse.ok) {
        throw new Error(`Failed to fetch from OpenAI API: ${openAIResponse.statusText}`);
      }

      // Parse the response JSON
      const openAIJsonResponse = await openAIResponse.json();
      artistSummary = openAIJsonResponse.choices[0].message.content; // Depending on the response structure

      // await client.set(artistName, artistSummary);
      await client.set(artistName, artistSummary, 'EX', 30 * 24 * 60 * 60);  // Set timeout while setting key

      return {
        statusCode: 200,
        body: JSON.stringify({ data: artistSummary }),
      };

    } else {
      console.log("Using existing summary from Redis");
    }

    await client.quit();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: artistSummary }),
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
