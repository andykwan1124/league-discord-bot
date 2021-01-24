require('dotenv').config();
const { Client, Collection } = require('discord.js');
const fs = require('fs');

const PREFIX = '?';
const client = new Client();
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	client.commands.set(command.name, command);
}


client.once('ready', () => {
	console.log(`${client.user.username} has logged in`);
});

client.on('message', message => {
	if (message.author.bot || !message.content.startsWith(PREFIX)) return;
	try {
		const [CMD_NAME, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);
		client.commands.get(CMD_NAME).execute(message, args);
	}
	catch (error) {
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.DISCORD_TOKEN);