//0.01 
const Discord = require("discord.js"); //npm install discord.js
var fs = require('fs');
const webhook = require("webhook-discord") //npm install webhook-discord
var chokidar = require('chokidar'); //npm install chokidar
var Rcon = require('rcon');  //npm install rcon

var auth = require('./bot_auth.json');
var config = require('./config.json');

const bot = new Discord.Client();
const Hook = new webhook.Webhook(config.webHook);


fs.writeFile(config.chatLog, '', function(){console.log('clear chat log')});


bot.login(auth.token);

var conn
function RconConnect()
{
	conn = new Rcon(config.RconIP, config.RconPort, config.RconPassword);
		conn.on('auth', function() {
		  console.log("Authed!");
		}).on('response', function(str) {
		  console.log("Got response: " + str);
		}).on('end', function() {
		  console.log("Socket closed!");
		  RconConnect();
		}).on('error', function() {
		  console.log("error");
		  RconConnect();
		});
		console.log("connecting");
		conn.connect();
}
	
 
 
bot.on("ready", () => {
	RconConnect();
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.username + ' - (' + bot.id + ')');

	chokidar.watch(config.chatLog, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		readLastLine(config.chatLog);
	});
});

bot.on("message", (message) => {
	if(message.content > 0 && !message.author.bot)
	{
		console.log(message.content);
		conn.send('/silent-command game.print("[Discord] ' + message.author.username + ': ' + message.content + '")');
	}
});


//-----------------------------------------------
//user functions 

function parseMessage(msg)
{
	var index = msg.indexOf(']');
	if (undefined !== msg && msg.length && index > 1)
	{
		sendMessage(msg.slice(1,index), msg.slice(index+1));
	}
	
}

function readLastLine(path)
{
	fs.readFile(config.chatLog, 'utf-8', function(err, data) {
		if (err) throw err;
		var lines = data.trim().split('\n');
		lastLine = lines.slice(-1)[0];
		console.log(lastLine);
		//parse the message
		parseMessage(lastLine);
		});
}

function sendMessage(name, msg)
{
	console.log(msg);
	const send = new webhook.MessageBuilder()
                .setName(name)
                .setText(msg)
	Hook.send(send);
}









