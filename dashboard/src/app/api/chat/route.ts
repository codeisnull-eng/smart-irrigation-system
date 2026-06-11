import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, image } = await request.json();

    const model = image 
      ? 'meta-llama/llama-4-scout-17b-16e-instruct' 
      : 'llama-3.3-70b-versatile';

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
            content: `You are an expert plant pathologist for Verdirra Smart Irrigation System.
When analyzing plant images:
- Look CAREFULLY at the actual image provided
- Identify the REAL plant species from what you see
- Assess the ACTUAL health condition visible in the image
- Detect any REAL diseases, pests, or deficiencies you can see
- Do NOT assume or fabricate conditions - only report what you actually observe
- Give specific care recommendations based on your real observations
Respond in the same language the user uses (Arabic or English).`,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json({ reply: 'عذراً، واجهت مشكلة في الاتصال.' });
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}