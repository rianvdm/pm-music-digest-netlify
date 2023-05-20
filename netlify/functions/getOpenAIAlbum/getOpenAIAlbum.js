const fetch = require("node-fetch");
const Redis = require("ioredis");

exports.handler = async function(event, context) {
  try {
    const albumName = event.queryStringParameters.name.toLowerCase();
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

    let albumSummary = await client.get(albumName); 

    if (!albumSummary) {
      console.log("Getting new summary from OpenAI")
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-0301",
          frequency_penalty: 0.8,
          messages: [
            {role: "user", content: prompt},
            {role: "system", content: "You are a friendly assistant who wants to help people find music they will love."}
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
      albumSummary = openAIJsonResponse.choices[0].message.content; // Depending on the response structure

      await client.set(albumName, albumSummary);

      return {
        statusCode: 200,
        body: JSON.stringify({ data: albumSummary }),
      };

    } else {
      console.log("Using existing summary from Redis");
    }

    await client.quit();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: albumSummary }),
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
