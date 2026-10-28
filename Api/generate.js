export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });
  
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert web developer. Create a full single-page website HTML with Tailwind CSS based on user prompt. Return ONLY the HTML code with <!DOCTYPE html>... no explanation, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const html = data.choices[0].message.content.replace(/```html|```/g, '').trim();
    res.status(200).json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
