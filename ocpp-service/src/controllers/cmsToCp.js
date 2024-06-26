const { getClient } = require('../middlewares/clientsManager');

// Function to send a message to a specific client
async function sendMessageToClient(evID, messageType, payLoad) {
    const client = await getClient(evID)
    if (!client) {
        throw Error("EV Client not found");
    }

    let ocppCommand = messageType;
    let ocppPayload = payLoad;


    const response = await client.call(ocppCommand, ocppPayload);



    if (response.status === 'Accepted') {
        console.log(`${ocppCommand} worked!`, response);
        return true
    } else {
        console.log(`${ocppCommand} rejected.`);
        throw new Error(`${ocppCommand} rejected.`);
    }



}

module.exports = sendMessageToClient;