//0.01 

//keeps the node instance open for at least 30seconds.
new Promise(resolve => setTimeout(resolve, 30000));
var fs = require('fs');

//set config to empty jobjec to use the logging functions before config is loaded. 
let config = {};
consoleLogging("starting", true);


consoleLogging("importing packages", true);
const Discord = require("discord.js"); //npm install discord.js
const { Webhook, MessageBuilder } = require('discord-webhook-node'); //npm i discord-webhook-node
var chokidar = require('chokidar'); //npm install chokidar
var Rcon = require('rcon');  //npm install rcon

//read config file via fs, so it can be packaged without the needed configs.
consoleLogging("loading configs", true);
let RAWauth = fs.readFileSync('./bot_auth.json');
const auth = JSON.parse(RAWauth);
let RAWconfig = fs.readFileSync('./config.json');
config = JSON.parse(RAWconfig);
let RAWdiscordNames = fs.readFileSync('./DiscordNames.json');
discordNames = JSON.parse(RAWdiscordNames);

consoleLogging("setting up discord bot");
const bot = new Discord.Client();
const Hook = new Webhook(config.webHook);
//const Hook = new webhook.Webhook(config.webHook);

consoleLogging("clearing chat and player logs");
fs.writeFile(config.chatLog, '', { flag: 'w' }, function(err){if(err)consoleLogging(err);});
fs.writeFile(config.playerLog, '', { flag: 'w' }, function(err){if(err)consoleLogging(err);});

bot.login(auth.token).catch(e => {
	consoleLogging(e);
});

var conn
//connect to Rcon
function RconConnect()
{
	conn = new Rcon(config.RconIP, config.RconPort, config.RconPassword);
	conn.on('auth', function() {
		consoleLogging("Rcon Authed!");
	}).on('response', function(str) {
		consoleLogging("Rcon response: " + str);
	}).on('end', function() {
		consoleLogging("Rcon Socket closed!");
		//failed to connect try again
		RconConnect();
	}).on('error', function(e) {
		consoleLogging("Rcon error: " + e);
		//failed to connect try again
		RconConnect();
	});

	consoleLogging("Connecting to Rcon");
	conn.connect();
}
	
 
//on bot start
bot.on("ready", () => {
	consoleLogging('Logged in as: ' + bot.user.username.toString() + ' - (' + bot.user.id.toString() + ')');

	//connect to rcon
	RconConnect();
	//watch the chat log file for update
	chokidar.watch(config.chatLog, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		consoleLogging("detected change in chat log");
		readLastLine(config.chatLog);
	});
	
	//watch the player log file for update
	chokidar.watch(config.playerLog, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		consoleLogging("detected change in player log");
		readLastLine(config.playerLog);
	});
});

//when we get a message
bot.on("message", (message) => {
	//longetr then 0, not a bot, and in channel = channelListen
	if(message.content.length > 0 && !message.author.bot && message.channel.id === config.channelListen)
	{
		consoleLogging("got message from discord");
		parseDiscordIDfromMessage(message.guild.id, message.content).then(parseMessage => {
			consoleLogging("Discord to Rcon: (" + message.author.username + ': ' + parseMessage + ")");
			conn.send('/silent-command game.print([[[Discord] ' + message.author.username + ': ' + parseMessage + ']])');
		})

	}
});


//-----------------------------------------------
//user functions 

function parseMessage(msg)
{
	consoleLogging("parrsing message from chat log")
	var index = msg.indexOf(']');
	if (undefined !== msg && msg.length && index > 1)
	{
		//send via webhook, parse name abd message via "[" & "]" characters
		sendMessage(msg.slice(1,index), msg.slice(index+1));
	}
	else{
		consoleLogging("mesage was undefined or not of length");
	}
	
}

function readLastLine(path)
{
	consoleLogging("attempting to read file at ", path);
	fs.readFile(path, 'utf-8', function(err, data) 
	{
		//get last line of file. 
		if (err) consoleLogging(err);
		var lines = data.trim().split('\n');
		lastLine = lines.slice(-1)[0];
		if(path == config.chatLog && lastLine.length > 0)  //chatlog
		{
			//pasrs name and message
			parseMessage(lastLine);
		}
		else if(path == config.playerLog  && lastLine.length > 0)  //player join/leave/kill
		{
			//use bot to send leave/join message
			consoleLogging("message to Discord web hook: " + lastLine);
			bot.channels.get(config.channelListen).send("**" + lastLine + "**")
		}
	});
}

//discord webhook
function sendMessage(name, msg)
{
	consoleLogging("message to Discord web hook: " + name +  msg);
	try{
		Hook.setUsername(name);
		Hook.send(msg);
	}catch(e){
		console.log(e);
	}
	
}

//logging function based config, or bypass.
//sets a timeout for 20seconds after each log to keep the instance alive.
function consoleLogging(message, bypass=false){
	if((config && config.debugLogs) || bypass){
		let log = Date() + ": " + message
		console.log(log);
		fs.writeFile("./FactorioChatBot-logs.log", log+'\n', { flag: 'a' }, function(err){if(err)consoleLogging(err);});
		new Promise(resolve => setTimeout(resolve, 20000));
	}
}

async function parseDiscordIDfromMessage(guildId, message){
	consoleLogging("attempting to parse out user ids and replace with server nickname");

	//parse out user ids and replace with server nickname
	var userIDRegexp = /(<@!(\d*)>)/g;
	var userIDMatch = userIDRegexp.exec(message);
	console.log(userIDMatch)
	if(userIDMatch && userIDMatch[1] && userIDMatch[2]){
		consoleLogging("found user ID in message");

		let nickname = null;
		if(discordNames){
			nickname = discordNames[userIDMatch[2]];
			if(!nickname){consoleLogging("id not found in discord names file")}

		}
		else{
			consoleLogging("empty discord name file");
		}


		return nickname? message.replace(userIDRegexp, nickname) : message

		// let guild = await bot.guilds.get(guildId);
		// let member = guild.members();
		// let nickname = member ? member.displayName : member.user.username ? member.user.username : null;
		// consoleLogging("replacing with "+ nickname?nickname:"not found");
		// return nickname? message.replace(userIDRegexp, "@"+nickname) : message
	}

	//parse out channel id and replace iwth channel name
	// var channelIDRegexp = /(<#(\d*)>)/g;
	// var channelIDMatch = channelIDRegexp.exec(message);
	// if(channelIDMatch && channelIDMatch[1] && channelIDMatch[2]){
	// 	consoleLogging("found channel ID in message");
	// 	let channel = await bot.channels.get(channelIDMatch[2]);
	// 	let channelName = channel.name || null;
	// 	consoleLogging("replacing with "+ channelName?channelName:"not found");
	// 	return channelName? message.replace(channelIDRegexp, "#"+channelName) : message
	// }

	return message;
}










