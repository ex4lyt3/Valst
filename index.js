// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const ValorantAPI = require('unofficial-valorant-api')
const {prefix} = require('./config.json')
const keepAlive = require('./server.js')
const ranks = require('./ranks.js')


// Create a new client instance
const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_VOICE_STATES], 
  presence: {
      status: 'online',
      activities: [{
        name: `v/help`,
        type: 'LISTENING'
      }]
     } 
    });


client.once('ready',()=>{
  console.log("Bot is ready")
})

client.on('messageCreate', async message=>{
  let Message = message.content
  if (Message.startsWith(prefix)){
    const args = Message.slice(prefix.length).split(" ")

    switch(args[0]){
      case "account":

      if (args[1]){

        let name
        let tag
        let region = "ap"
        let version = "v1"

        name = args[1].substring(0,args[1].indexOf("#"))
        name.replace('/SPACE/'," ")
        console.log(name)

        tag = args[1].substring(args[1].indexOf("#")+1,args[1][args[1].length])
        console.log(tag)

        message.reply(`Gathering account information...`)

        const response =  await ValorantAPI.getMMR(version, region, name, tag)
        const accResponse = await ValorantAPI.getAccount(name,tag)

        if (response["status"] == 200){

          const rank = response["data"]["currenttierpatched"].split(" ")[0]
          let accountEmbed = new MessageEmbed()
          accountEmbed.setTitle(`<:val:899975995816304680> ${accResponse.data.name}#${accResponse.data.tag}`)
          accountEmbed.setDescription(`Account Information \n Level ${accResponse.data.account_level}`)
          accountEmbed.addField('Current Rank', `${ranks[rank]} \n ${response["data"]["currenttierpatched"]}`)
          accountEmbed.addField(`Elo Rating`, `${response["data"]["elo"]}`, true)
          accountEmbed.addField('Recent Change',`${response["data"]["mmr_change_to_last_game"]} RR`, true)
          accountEmbed.setFooter(`API Rate Limit in ${response["ratelimits"]["remaining"]} requests`)
          accountEmbed.setImage(`${accResponse.data.card.wide}`)


          message.reply({
            embeds:[accountEmbed]
          })
        }else{
          message.reply("Example: v/account kronus#1111 [To add a space, replace ' ' with '/SPACE/' instead] ")
        }
      }else{
        message.reply("Type your username")
      }

      break

      case "career":

      if (args[1]){
      let region = "ap"
      let name
      let tag
      let filter = "None"

      if (args[2]){
        filter = args[2]
      }

      name = args[1].substring(0,args[1].indexOf("#"))
      name.replace('/SPACE/'," ")
      console.log(name)

      tag = args[1].substring(args[1].indexOf("#")+1,args[1][args[1].length])
      console.log(tag)

      message.reply("Gathering match information...")

      const matchResponse = await ValorantAPI.getMMRHistory(region,name,tag)

      if (matchResponse["status"] == 200){
        message.reply(`${matchResponse["data"][0]} a`)
      }else{
        message.reply(`${matchResponse["data"]["message"]}`)
      }
      }else{
        message.reply("poo")
      }

      break

      case "news":

      const newsResponse = await ValorantAPI.getWebsiteContent("en-us")

      let newsEmbed = new MessageEmbed()
      let page = 0

      newsEmbed.setAuthor(`VALORANT News`)
      newsEmbed.setTitle(`<:val:899975995816304680> ${newsResponse.data[0].title}`)
      newsEmbed.setURL(`${newsResponse.data[0].url}`)
      newsEmbed.setFooter(`${newsResponse.data[0].date}`)
      newsEmbed.setImage(`${newsResponse.data[0].banner_url}`)

      const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Next')
					.setLabel('Next')
					.setStyle('PRIMARY'),
          new MessageButton()
					.setCustomId('Back')
					.setLabel('Back')
					.setStyle('PRIMARY'),
			);

      let newMessage = await message.reply({
        embeds:[newsEmbed],
        components: [row]
      })


      const filter = i => i.customId === 'Next' || i.customId === 'Back' && i.user.id === message.author.id;

      const collector = message.channel.createMessageComponentCollector({ filter, time: 120000 });

      collector.on('collect', async i => {
        console.log(i.customId)
      if (i.customId === "Next"){
      if (page <= newsResponse.data.length && page >= 0){
        console.log("yes")
        page += 1
        newsEmbed.setTitle(`<:val:899975995816304680> ${newsResponse.data[page].title}`)
      newsEmbed.setURL(`${newsResponse.data[page].url}`)
      newsEmbed.setFooter(`${newsResponse.data[page].date}`)
      newsEmbed.setImage(`${newsResponse.data[page].banner_url}`)
      }
      }else if (i.customId === "Back"){
      if (page > 0){
			page -= 1
        newsEmbed.setTitle(`<:val:899975995816304680> ${newsResponse.data[page].title}`)
      newsEmbed.setURL(`${newsResponse.data[page].url}`)
      newsEmbed.setFooter(`${newsResponse.data[page].date}`)
      newsEmbed.setImage(`${newsResponse.data[page].banner_url}`)
      }
      }
      await i.update({
        embeds: [newsEmbed]
      })
	   })
     collector.on('end', collected => {
       newMessage.edit({
         embeds: [newsEmbed],
         components: []
       })
     })
    }
  }

})

keepAlive();
// Login to Discord with your client's token
client.login(process.env.token);
