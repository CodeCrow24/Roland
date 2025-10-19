module.exports = (client, msg) => {
    if(msg.author.bot  || msg.channel.name != "bot-cmd") return;
    
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
    
};