const fetch = require('node-fetch');

const generateDescription = async (req, res) => {
    const { productName, category } = req.body;

    if (!productName || !category) {
        return res.status(400).json({ message: 'Product name and category are required.' });
    }
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Gemini API key not configured on the server.' });
    }
    try {
        const prompt = `Generate a compelling, one-sentence e-commerce product description for a product named "${productName}" in the category "${category}". The tone should be professional and enticing.`;

        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = process.env.GEMINI_API_KEY
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            const generatedText = result.candidates[0].content.parts[0].text;
            res.json({ description: generatedText.trim() });
        } else {
            throw new Error('Unexpected response format from Gemini API');
        }

    } catch (error) {
        console.error('Gemini API call failed:', error);
        res.status(500).json({ message: 'Failed to generate description from AI' });
    }
};

const generateCategoryDescription = async (req, res) => {
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    try {
        const prompt = `Generate a concise, one-sentence description for an e-commerce category named "${categoryName}". The description should be suitable for display on a category page.`;

        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            const generatedText = result.candidates[0].content.parts[0].text;
            res.json({ description: generatedText.trim() });
        } else {
            console.error('Unexpected Gemini API response format:', result);
            throw new Error('Unexpected response format from Gemini API');
        }

    } catch (error) {
        console.error('Gemini API call failed:', error);
        res.status(500).json({ message: 'Failed to generate category description' });
    }
};

module.exports = { generateDescription, generateCategoryDescription  };