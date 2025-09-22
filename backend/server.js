const express = require('express');
const cors = require('cors');
const NexShopFraudSDK = require('./nexshop-fraud-sdk-backend.js');

const app = express();
const PORT = 3001;

// Middlewares básicos
app.use(cors()); // Permite requisições de origens diferentes (ex: nosso index.html)
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- Configuração das Regras de Risco do SDK ---
const fraudRules = [
    {
        name: 'New Device',
        condition: (data) => {
            // A regra é acionada se o device atual for diferente do histórico e houver histórico
            return data.history && data.device.userAgent !== data.history.lastDevice;
        },
        score_impact: 40,
        status: 'review',
        message: 'Dispositivo incomum detectado para este usuário.',
    },
    {
        name: 'Suspicious IP',
        condition: (data) => {
            // A regra é acionada se o IP atual for diferente do histórico e houver histórico
            return data.history && data.clientIp !== data.history.lastIp;
        },
        score_impact: 60,
        status: 'review',
        message: 'Acesso de um novo endereço de IP.',
    },
    {
        name: 'Very Low Time On Page',
        condition: (data) => {
            // Ações muito rápidas (menos de 2 segundos) podem ser de bots
            return data.behavior.timeOnPage < 2000;
        },
        score_impact: 30,
        status: 'review',
        message: 'Ação realizada rápido demais, comportamento suspeito.',
    },
    {
        name: 'No Mouse Movement',
        condition: (data) => {
            // Ausência de movimento do mouse pode indicar um script automatizado
            return data.behavior.mouseMovementDistance === 0;
        },
        score_impact: 70,
        status: 'deny',
        message: 'Nenhum movimento de mouse detectado.',
    },
    {
        name: 'Too Many Tab Focus Changes',
        condition: (data) => {
             // Usuário que troca de aba muitas vezes pode estar copiando/colando dados
            return data.behavior.tabFocusChanges > 5;
        },
        score_impact: 25,
        status: 'review',
        message: 'Comportamento de troca de abas excessivo.',
    },
];

// --- Instanciação e Integração do SDK ---
const fraudSdk = new NexShopFraudSDK({
    rules: fraudRules,
});

// Define a rota de verificação de identidade e aplica o middleware do SDK
app.post('/identity/verify', fraudSdk.middleware);

app.listen(PORT, () => {
    console.log(`Servidor de exemplo da NexShop rodando na porta ${3001}`);
    console.log('Endpoint do SDK de fraude ativo em: POST http://localhost:3001/identity/verify');
});

