const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const Groq = require('groq-sdk');
const express = require('express');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

// 1. إعداد السيرفر (للحفاظ على البوت مستيقظاً عبر UptimeRobot)
const app = express();
app.get('/', (req, res) => res.send('Bot Active'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Ready on port ${PORT}`));

// 2. إعداد Groq للاتصال بـ Llama 3
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const authenticatedUsers = new Set();
const PASSWORD = "kill"; // يمكنك تغيير كلمة السر هنا

const SYSTEM_PROMPT = "أنتِ مساعدة ذكية، تتحدثين بالعامية اللطيفة.";

// دالة الرد من الذكاء الاصطناعي
async function getAIResponse(userMessage) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.3-70b-versatile',
        });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Llama/Groq Error:", error.message);
        return "هناك خلل تقني بسيط، سأعود حالن";
    }
}

// 3. الاتصال بالواتساب
async function connectToWhatsApp() {

