const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const { saveCredential, validateCredential } = require('./db');

const PORT = 1883;

aedes.authenticate = async (client, username, password, callback) => {
    console.log(`\nTentando autenticar cliente: ${client.id}`);
    try {
        const clientLevel = await validateCredential(username, password.toString());
        if (clientLevel) {
            client.clientLevel = clientLevel;
            console.log(`Cliente autenticado com sucesso: ${client.id}`);
            callback(null, true);
        } else {
            console.log(`Falha na autenticação do cliente: ${client.id}`);
            callback(null, false);
        }
    } catch (error) {
        console.log('EXCEPTION durante a autenticação: ', error);
        callback(error, null);
    }
};

aedes.on('client', (client) => {
    console.log(`Cliente conectado: ${client.id}`);
});

aedes.on('clientError', (client, error) => {
    console.error(`Erro no cliente ${client.id}:`, error.message);
});

aedes.on('clientDisconnect', (client) => {
    console.error(`\nCliente desconectado: ${client.id}`);
});

aedes.on('publish', async (packet, client) => {
    if (packet.topic === 'credentialManager' && client?.clientLevel === 'admin') {
        try {
            const { clientName, clientPass, clientLevel } = JSON.parse(packet.payload.toString());
            await saveCredential(clientName, clientPass, clientLevel);
            console.log(`Credencial para ${clientName} adicionada com sucesso!`);
        } catch (error) {
            console.error('Erro ao salvar a credencial:', error.message);
        }
    }
});

server.listen(PORT, () => {
    console.log(`Broker MQTT rodando na porta ${PORT}`);
});
