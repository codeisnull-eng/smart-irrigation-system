import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, image } = await request.json();

    const model = image ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile';

    const userContent = image
      ? [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ]
      : message;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a smart irrigation and plant care assistant for Verdirra. 
When analyzing plant images: identify the plant species, assess health condition, detect diseases or pests, and give specific care recommendations.
When user mentions a plant name: provide ideal moisture %, temperature range, watering frequency, and care tips.
Keep responses concise and practical. Respond in the same language the user uses (Arabic or English).`,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json({ reply: 'عذراً، واجهت مشكلة في الاتصال بـ Groq API.' });
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}