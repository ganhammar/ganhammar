const AWS = require('aws-sdk');
const express = require('express');
const serverless = require('serverless-http');
const { v4 } = require('uuid');

const app = express();

const HIGHSCORE_TABLE = process.env.HIGHSCORE_TABLE;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = 'localhost'
  dynamoDbClientParams.endpoint = 'http://localhost:8000'
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);

app.use(express.json());

app.get('/highscore', async (req, res) => {
  const params = {
    TableName: HIGHSCORE_TABLE,
    Limit: 10,
    ScanIndexForward: false,
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    res.json(Items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Could not retreive highscores' });
  }
});

app.get('/sessionId', async (req, res) => {
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  const sessionId = v4();

  const item = {
    id: sessionId,
    ipAddress,
    createdAt: new Date().toISOString(),
  };
  const params = {
    TableName: SESSIONS_TABLE,
    Item: item,
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Could not start a new session' });
  }
});

app.post('/highscore', async (req, res) => {
  const { sessionId, credentials, score } = req.body;

  if (typeof sessionId !== 'string') {
    res.status(400).json({ error: '\'sessionId\' must be a string' });
    return;
  } else if (typeof credentials !== 'string') {
    res.status(400).json({ error: '\'credentials\' must be a string' });
    return;
  } else if (typeof score !== 'number') {
    res.status(400).json({ error: '\'score\' must be a number' });
    return;
  }

  // Verify session
  let params = {
    TableName: SESSIONS_TABLE,
    Key: {
      id: sessionId,
    },
  };
  try {
    const { Item } = await dynamoDbClient.get(params).promise();

    if (!Item) {
      res
        .status(404)
        .json({ error: 'Could not find a session with provided \'sessionId\'' });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Could not retreive sessions' });
    return;
  }

  // Save score
  const item = {
    id: v4(),
    sessionId: sessionId,
    credentials: credentials,
    score: score,
    createdAt: new Date().toISOString(),
  };
  params = {
    TableName: HIGHSCORE_TABLE,
    Item: item,
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Could not save highscore' });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

module.exports.handler = serverless(app);
