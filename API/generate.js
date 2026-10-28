// api/generate.js - SiteForge AI Core Engine
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are SiteForge AI, a world-class website builder. 
            Build a complete, modern, beautiful, responsive website for: ${prompt}.
            
            Requirements:
            - Return ONLY full HTML code
            - Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"><\/script>
            - Make it production-ready, beautiful UI
            - No explanation, no markdown, just pure HTML code
            - Use modern design trends`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
        throw new Error('No response from AI');
    }

    let code = data.content[0].text;
    // Remove ```html and ``` if AI added
    code = code.replace(/```html|```/g, '').trim();

    return res.status(200).json({ code: code });

  } catch (error) {
    console.error('SiteForge Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
