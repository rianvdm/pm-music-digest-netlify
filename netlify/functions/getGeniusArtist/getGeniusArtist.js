const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const access_token = process.env.GENIUS_ACCESS_TOKEN; 
    const artistid = event.queryStringParameters.artistid;  

    // Check if the prompt is defined and not empty
      if (!artistid || artistid.trim().length === 0) {
        throw new Error("Song ID is required");
      }

    // Send a POST request to the OpenAI API to generate text
    const response = await fetch(`https://api.genius.com/artists/${artistid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
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
