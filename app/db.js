const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const db = new sqlite3.Database(':memory:');

// Chave para hash de senha
const HASH_KEY = 'N0uv3nn!#SPC-mqttBroker@2024';

// Função para gerar hash da senha
function hashPassword(password) {
    return crypto.createHmac('sha256', HASH_KEY).update(password).digest('hex');
}

// Cria a tabela de credenciais e insere a credencial mestre
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS credentials (
      clientName TEXT PRIMARY KEY,
      clientPass TEXT NOT NULL,
      clientLevel TEXT CHECK(clientLevel IN ('admin', 'common')) NOT NULL
    )
  `);

    // Insere a credencial mestre padrão com o hash da senha
    const masterClientName = 'nouvenn-spc-manager-admin';
    const masterClientPass = hashPassword('passN0uv3nn2021!#');
    const masterClientLevel = 'admin';

    db.run(
        `INSERT OR IGNORE INTO credentials (clientName, clientPass, clientLevel) VALUES (?, ?, ?)`,
        [masterClientName, masterClientPass, masterClientLevel]
    );
});

// Função para salvar novas credenciais com hash
function saveCredential(clientName, clientPass, clientLevel) {
    const hashedPass = hashPassword(clientPass);
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO credentials (clientName, clientPass, clientLevel) VALUES (?, ?, ?)`,
            [clientName, hashedPass, clientLevel],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

// Função para validar credenciais comparando o hash
function validateCredential(clientName, clientPass) {
    const hashedPass = hashPassword(clientPass);
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT clientLevel FROM credentials WHERE clientName = ? AND clientPass = ?`,
            [clientName, hashedPass],
            (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.clientLevel : null);
            }
        );
    });
}

module.exports = { db, saveCredential, validateCredential };
