const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const handleResponse = async (response) => {
	const parsedResponse = await response.json();
	if (!response.ok) {
		throw Error(parsedResponse.status.message);
	}
	return parsedResponse;
};

module.exports = {
	fetchContent: async (url) => {
		console.log(`${url}?${new URLSearchParams([['api_key', process.env.LEAGUE_API_TOKEN]])}`);
		const response = await fetch(`${url}?${new URLSearchParams([['api_key', process.env.LEAGUE_API_TOKEN]])}`);
		const result = handleResponse(response);
		return result;
	},
};