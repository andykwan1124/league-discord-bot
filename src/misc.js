const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const handleResponse = async response => {
	const parsedResponse = await response.json();
	if (!response.ok) throw Error(parsedResponse.status.message);
	return parsedResponse;
};

const createSearchParamsArray = args => {
	const searchParamsArray = args.filter(arg => arg);
	searchParamsArray.push(['api_key', process.env.LEAGUE_API_TOKEN]);
	return searchParamsArray;
};

module.exports = {
	fetchContent: async (url, ...args) => {
		const response = await fetch(`${url}?${new URLSearchParams(createSearchParamsArray(args))}`);
		const result = handleResponse(response);
		return result;
	},
	isNumberArgumentGiven: arg => {
		if (arg) {
			if (!isNaN(parseInt(arg))) {
				return true;
			}
			else {
				throw Error('Expected argument to be a number');
			}
		}
		else {
			return false;
		}
	},
	getUserIdFromMention: mention => {
		const discordIdData = mention.match(/^<@!?(\d+)>$/);
		return discordIdData ? discordIdData[1] : null;
	},
};