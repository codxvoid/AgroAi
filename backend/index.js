import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const promptWrapper = (query) => `
You are AgroAi, a CLI-style multi-agent assistant for agriculture.

[CROP SIMULATION]
• Estimate yield, weather dependency, and pest risk

[CHEMICAL ANALYSIS]
• Soil toxicity, leaching, and bans

[HUMAN HEALTH IMPACT]
• Potential human health risks

[RECOMMENDATION]
• Safer alternatives or actions

User Query: ${query}
`;

async function getGeminiResponse(query) {
    const prompt = promptWrapper(query);

    try {
        console.log('Trying Gemini 1.5 Pro...');
        const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {

        const isQuota = err.message?.includes('429') || err.message?.includes('quota');
        console.error('Pro Model Error:', err.message);

        if (isQuota) {
            try {
                console.log('Falling back to Gemini 1.5 Flash...');
                const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (flashErr) {
                console.error(' Flash Model Error:', flashErr.message);
                throw new Error('Both models exceeded quota.');
            }
        } else {
            throw err;
        }
    }
}

app.post('/query', async (req, res) => {
    const userQuery = req.body.query;
    try {
        const reply = await getGeminiResponse(userQuery);
        res.json({ text: reply });
    } catch (err) {
        res.status(500).json({ text: 'Gemini failed: ' + err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(` Gemini backend live at http://localhost:${PORT}`));
