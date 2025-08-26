// function forwardxample{
//     const chat = await client.getChatById('905451791030@c.us');
//     const chat2 = await client.getChatById('905428236080@c.us');
//     const messages = await chat.fetchMessages({
//         limit: 6
//     });
//     fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));

//     await Promise.all(messages.map(async (message) => {
//         // const media = await message.downloadMedia();
//         // await client.sendMessage('905428236080@c.us', media);
//         console.log(message.type, 'message type');
//         console.log(message.id._serialized, 'message _serialized');
//         const message2 = await client.getMessageById(message.id._serialized)
//         fs.writeFileSync('message2.json', JSON.stringify(message2, null, 2));
//         // await message2.forward(chat2)
//         await message2.forward('905428236080@c.us')
//         // client.sendMessage('905428236080@c.us', message2.)
//         // if (message.type === 'video' || message.type === 'image') {
//         //   const media = await message2.downloadMedia();
//         //   await client.sendMessage('905428236080@c.us', media);
//         // }
//     }));
// }