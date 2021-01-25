const { fetchContent, isNumberArgumentGiven, getUserIdFromMention } = require('../src/misc');
const { database, tableName } = require('../database');

const convertUnixToDate = time => {
	const dateObject = new Date(time);
	return dateObject.toLocaleString();
};

const secondsToMinutesSeconds = seconds => (seconds - (seconds %= 60)) / 60 + (seconds > 9 ? ':' : ':0') + seconds;

const findChampionNameById = (championInfo, targetId) => Object.values(championInfo.data).find(champData => champData.key === targetId.toString()).id;

const constructDiscordIdObject = discordId => {
	return {
		TableName: tableName,
		Key: {
			discordUserId: discordId,
		},
	};
};

const produceTargetUsername = (username) => {
	return new Promise((resolve, reject) => {
		const parsedMentionId = getUserIdFromMention(username);
		if (parsedMentionId) {
			database.get(constructDiscordIdObject(parsedMentionId), (error, data) => {
				if (error) {
					reject(error);
				}
				else if (Object.keys(data).length === 0) {
					reject(Error('Mentioned user has not been binded to a summoner username'));
				}
				else {
					resolve(data.Item.leagueUsername);
				}
			});
		}
		else {
			resolve(username.replace('/', ' '));
		}
	});
};

const constructEmbedMessage = (match, index, championInfo, currUser) => {
	const { participantIdentities, participants, gameId, gameMode, gameCreation, gameDuration } = match;
	const playerIdInMatch = participantIdentities.find(identityInfo => identityInfo.player.summonerName === currUser.name).participantId;
	const { championId, stats } = participants.find(participantInfo => participantInfo.participantId === playerIdInMatch);
	const { kills, deaths, assists, win, goldEarned, visionScore, totalDamageDealtToChampions, totalMinionsKilled, neutralMinionsKilled } = stats;
	return {
		embed: {
			title: `${currUser.name}'s Game ${index + 1}`,
			color: win ? '#00FF00' : '#FF0000',
			url: `https://lolprofile.net/match/na/${gameId}#${currUser.name.replace(' ', '%20')}`,
			description: `${gameMode} Game
			Game Start: ${convertUnixToDate(gameCreation)}
			Game Duration: ${secondsToMinutesSeconds(gameDuration)}`,
			thumbnail: {
				url: `http://ddragon.leagueoflegends.com/cdn/11.2.1/img/champion/${findChampionNameById(championInfo, championId)}.png`,
			},
			fields: [
				{
					name: 'K/D/A',
					value: `${kills}/${deaths}/${assists}`,
					inline: true,
				},
				{
					name: 'Damage Dealt',
					value: `${totalDamageDealtToChampions}`,
					inline: true,
				},
				{
					name: 'CS',
					value: `${totalMinionsKilled + neutralMinionsKilled}`,
					inline: true,
				},
				{
					name: 'Gold Earned',
					value: `${goldEarned}`,
					inline: true,
				},
				{
					name: 'Vision Score',
					value: `${visionScore}`,
					inline: true,
				},
			],
		},
	};
};

module.exports = {
	name: 'matches',
	description: 'Shows a player\'s previous match(es)',
	execute: async (message, args) => {
		try {
			if (args.length > 2 || args.length < 1) throw Error('Please supply a discord mention or a summoner username, and optionally how many matches you would like to see');
			const [username, ...rest] = args;
			const targetUsername = await produceTargetUsername(username);
			const currUser = await fetchContent(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${targetUsername}`);
			const matchHistory = await fetchContent(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${currUser.accountId}`, ['endIndex', isNumberArgumentGiven(rest[0]) && parseInt(rest[0]) <= 3 ? rest[0] : 1]);
			const matchesInfo = await Promise.all(matchHistory.matches.map(async match => await fetchContent(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.gameId}`)));
			const championInfo = await fetchContent('http://ddragon.leagueoflegends.com/cdn/11.2.1/data/en_US/champion.json');
			matchesInfo.forEach((match, index) => {
				const embeddedMessage = constructEmbedMessage(match, index, championInfo, currUser);
				message.channel.send(embeddedMessage);
			});
		}
		catch (error) {
			message.channel.send(error.message);
		}
	},
};