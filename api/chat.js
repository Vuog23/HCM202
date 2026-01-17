  // ===================================
  // VERCEL SERVERLESS FUNCTION
  // Backend API for HCM202 Chat
  // ===================================

  export default async function handler(req, res) {
    // ===================================
    // CORS HEADERS
    // ===================================
    // Cho phép tất cả domains truy cập API này
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ===================================
    // HANDLE CORS PREFLIGHT REQUEST
    // ===================================
    // Browser sẽ gửi OPTIONS request trước khi gửi POST
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // ===================================
    // ONLY ALLOW POST METHOD
    // ===================================
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed. Only POST is supported.' 
      });
    }

    try {
      // ===================================
      // PARSE REQUEST BODY
      // ===================================
      const { messages, model, temperature, max_tokens, top_p } = req.body;

      // ===================================
      // VALIDATE REQUEST
      // ===================================
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          error: 'Invalid request: messages array is required' 
        });
      }

      // Check if API key is configured
      if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not configured');
        return res.status(500).json({ 
          error: 'Server configuration error: API key not set' 
        });
      }

      // ===================================
      // CALL GROQ API
      // ===================================
      console.log('🔄 Calling Groq API...');
      console.log('📝 Model:', model || 'llama-3.3-70b-versatile');
      console.log('💬 Messages count:', messages.length);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: temperature || 0.8,
          max_tokens: max_tokens || 4096,
          top_p: top_p || 1,
          stream: false
        })
      });

      // ===================================
      // CHECK RESPONSE STATUS
      // ===================================
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Groq API Error:', errorData);
        console.error('Status:', response.status);
        
        return res.status(response.status).json(errorData);
      }

      // ===================================
      // RETURN SUCCESS RESPONSE
      // ===================================
      const data = await response.json();
      console.log('✅ Groq API Success');
      console.log('📊 Tokens used:', data.usage);

      return res.status(200).json(data);

    } catch (error) {
      // ===================================
      // ERROR HANDLING
      // ===================================
      console.error('💥 Server Error:', error);
      console.error('Error stack:', error.stack);
      
      return res.status(500).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  }

  // ===================================
  // VERCEL CONFIG
  // ===================================
  export const config = {
    api: {
      bodyParser: true,
    },
  };