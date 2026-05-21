import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a smart irrigation assistant. When the user mentions a plant name, provide:
1. Whether it's indoor or outdoor
2. Ideal soil moisture range (%)
3. Ideal temperature range (°C)
4. Watering frequency
5. Any special care tips
Keep responses concise and practical.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    
    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}