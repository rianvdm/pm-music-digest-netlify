// functions/redis-test.js

const Redis = require('ioredis');

exports.handler = async (event, context) => {
  try {
    console.log('Creating Redis client');
    const client = new Redis(process.env.REDIS_URL, {
      connectTimeout: 10000, // 10 seconds
    });

    console.log('Connecting to Redis');
    client.once('connect', () => {
      console.log('Connected to Redis');
    });

    // Test Redis connection by setting and getting a key
    console.log('Setting key-value pair');
    await client.set('netlify_function_test', 'Connected to Redis');
    console.log('Getting key-value pair');
    const value = await client.get('netlify_function_test');
    console.log('Quitting Redis client');
    await client.quit();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: value }),
    };
  } catch (error) {
    console.error('Error connecting to Redis:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error connecting to Redis' }),
    };
  }
};


    // console.log('Setting and getting key-value pair using pipeline');
    // const pipeline = client.pipeline();
    // pipeline.set('netlify_function_test', 'Connected to Redis');
    // pipeline.get('netlify_function_test');
    // const results = await pipeline.exec();
    // const value = results[1][1];