const fetch = require("node-fetch");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

exports.handler = async function(event, context) {
  try {
    const artistName = event.queryStringParameters.artistName; 
    const max_tokens = parseInt(event.queryStringParameters.max_tokens) || 100; 
    const access_token = process.env.OPENAI_API_TOKEN; 

    // Check if the artistName is defined and not empty
    if (!artistName || artistName.trim().length === 0) {
      throw new Error("Artist name is required");
    }

    // Check if a cached summary exists in Redis
    const cachedSummary = await redis.get(artistName);

    if (cachedSummary) {
      console.log('Cache hit');
      return {
        statusCode: 200,
        body: JSON.stringify({ summary: cachedSummary }),
      };
    } else {
      // If a cached summary does not exist, fetch from OpenAI
      console.log('Cache miss');
      const prompt = `Write a summary to help someone decide if they might like the artist ${artistName}. Include information about the artist’s genres and styles. Write no more than three sentences.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
        }),
      });

      // If the response is not successful, throw an error
      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      // Parse the response JSON
      const jsonResponse = await response.json();

      const summary = jsonResponse.choices[0].message['content'];

      // Store the fetched summary in Redis for future use
      await redis.set(artistName, summary);

      return {
        statusCode: 200,
        body: JSON.stringify({ summary: summary }),
      };
    }
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
