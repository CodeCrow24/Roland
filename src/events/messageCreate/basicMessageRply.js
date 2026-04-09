const partyChat = require("../../utils/dbUtils/updatePartyChat");

module.exports = (client, msg) => {
    if(msg.author.bot  || msg.channel.name != "marktplatz") return;
    
    const date = msg.createdAt;
    let hasSent = false

    if (msg.content.toLowerCase().includes('moin roland')) {
        if (!hasSent) {
            msg.reply(`Moin ${msg.member.displayName}!`);
        } else {
            msg.channel.send(`Moin ${msg.member.displayName}!`)
        }
        hasSent = true
    }
    if (msg.content.toLowerCase().includes('wie spät ist es?')) {
        if (!hasSent) {
            msg.reply(`Es ist ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`)
        } else {
            msg.channel.send(`Es ist ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`)
        }
        hasSent = true
    }
    if (msg.member.displayName == "Leo von Rahden" && msg.content.toLowerCase().includes('aktualisiere bitte den parteien kanal')){
        partyChat(client, msg.guild);
        if (!hasSent) {
            msg.reply(`Wird gemacht Boss.`)
        } else {
            msg.channel.send(`Wird gemacht Boss.`)
        }
        hasSent = true
    }
    if (msg.content.toLowerCase().includes('bist du teil der revolution?')){
        if (!hasSent) {
            msg.reply(`Jawohl Kamerad!`)
        } else {
            msg.channel.send(`Jawohl Kamerad!`)
        }
        hasSent = true
    }
    
};