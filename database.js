const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = {
	database: dynamodb,
	tableName: 'league-discord-bot',
};