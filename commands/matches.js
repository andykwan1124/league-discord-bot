const { fetchContent, isNumberArgumentGiven } = require('../src/misc');

const convertUnixToDate = time => {
	const dateObject = new Date(time);
	return dateObject.toLocaleString();
};

const secondsToMinutesSeconds = seconds => (seconds - (seconds %= 60)) / 60 + (seconds > 9 ? ':' : ':0') + seconds;

const findChampionNameById = (championInfo, targetId) => Object.values(championInfo.data).find(champData => champData.key === targetId.toString()).id;


module.exports = {
	name: 'matches',
	description: 'Shows a player\'s previous match(es)',
	execute: async (message, args) => {
		try {
			const [username, ...rest] = args;
			console.log(username);
			const targetUsername = username.replace('/', ' ');
			const currUser = await fetchContent(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${targetUsername}`);
			const matchHistory = await fetchContent(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${currUser.accountId}`, ['endIndex', isNumberArgumentGiven(rest[0]) && parseInt(rest[0]) <= 5 ? rest[0] : 1]);
			const matchesInfo = await Promise.all(matchHistory.matches.map(async match => {
				return await fetchContent(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.gameId}`);
			}));
			const championInfo = await fetchContent('http://ddragon.leagueoflegends.com/cdn/11.2.1/data/en_US/champion.json');
			matchesInfo.forEach((match, index) => {
				const { participantIdentities, participants, gameId, gameMode, gameCreation, gameDuration } = match;
				const playerIdInMatch = participantIdentities.find(identityInfo => identityInfo.player.summonerName === currUser.name).participantId;
				const playerGeneral = participants.find(participantInfo => participantInfo.participantId === playerIdInMatch);
				const { championId, stats } = playerGeneral;
				const { kills, deaths, assists, win, goldEarned, visionScore, totalDamageDealtToChampions, totalMinionsKilled, neutralMinionsKilled } = stats;
				const embeddedMessage = {
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
				message.channel.send(embeddedMessage);
			});
		}
		catch (error) {
			message.channel.send(error.message);
		}
	},
};