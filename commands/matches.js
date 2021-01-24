const { fetchContent } = require('../src/misc');

module.exports = {
	name: 'matches',
	description: 'Shows a player\'s previous match(es)',
	execute: async (message, args) => {
		try {
			const currUser = await fetchContent(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${args[0]}`);
			const matches = await fetchContent(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${currUser.accountId}`);
			console.log(matches);
			message.channel.send(currUser.id);
		}
		catch (error) {
			message.channel.send(error.message);
		}
	},
};