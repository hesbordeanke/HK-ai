const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const { messages, useWebSearch } = req.body;
  const tools = useWebSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : [];
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: 'You are HK AI, a powerful general-purpose assistant that combines web search and deep AI reasoning to give the most accurate, up-to-date answers. Be thorough, clear, and use markdown formatting.',
        messages,
        ...(tools.length ? { tools } : {})
      })
    });
    const data = await response.json();
    let text = '';
    if (data.content) { for (const block of data.content) { if (block.type === 'text') text += block.text; } }
    res.json({ text: text || data.error?.message || 'No response.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ HK AI running on port ${PORT}`));
