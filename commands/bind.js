const { database, tableName } = require('../database');
const { getUserIdFromMention } = require('../src/misc');

const constructIdAndUsernameObject = (discordId, leagueUsername) => {
	return {
		TableName: tableName,
		Item: {
			discordUserId: discordId,
			leagueUsername: leagueUsername,
		},
	};
};

const insertDataToDatabase = (dataObject, message, targetUsername) => {
	database.put(dataObject, (error) => {
		if (error) throw error;
		message.channel.send(`The summoner username "${targetUsername}" has been successfully binded to the specified discord member`);
	});
};

module.exports = {
	name: 'bind',
	description: 'Binds a discord id to the supplied summoner username',
	execute: async (message, args) => {
		try {
			if (args.length !== 2) throw Error('Please supply a discord user and a league username to bind to');
			const [discordMention, username] = args;
			const discordUserId = getUserIdFromMention(discordMention);
			if (!discordUserId) throw new Error('Please mention a specific discord user');
			const targetUsername = username.replace('/', ' ');
			insertDataToDatabase(constructIdAndUsernameObject(discordUserId, targetUsername), message, targetUsername);
		}
		catch (error) {
			message.channel.send(error.message);
		}
	},
};