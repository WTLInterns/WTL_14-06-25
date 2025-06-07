import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Replace this with your DeepSeek or OpenRouter API key
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY || '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',
  defaultHeaders: {
    'HTTP-Referer': 'https://worldtriplink.com',
    'X-Title': 'WTL Tourism',
  },
});

// Website-specific context (replace with your actual FAQ/content or use a vector DB for RAG)
const WEBSITE_CONTEXT = `\
World Trip Link (https://worldtriplink.com/) is a cab booking platform for Maharashtra and India.\n\
- Services: Outstation cabs, local rentals, airport transfers, corporate travel, holiday packages.\n\
- Booking: Online booking, instant confirmation, 24/7 support.\n\
- Contact: +91 9730545491, WhatsApp available.\n\
- Payment: Multiple options, transparent pricing, no hidden charges.\n\
- Popular routes: Mumbai, Pune, Nashik, Shirdi, Lonavala, Kolhapur, Aurangabad, and more.\n\
- App: Android/iOS available.\n\
- Only answer questions related to cab booking, our services, pricing, routes, or company info.\n\
If a user asks anything unrelated to worldtriplink.com or cab booking, politely refuse and say: 'Sorry, I can only answer questions about cab booking and our services at worldtriplink.com.'\n`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;
    // Insert the website context as a system prompt
    const systemPrompt = { role: 'system', content: WEBSITE_CONTEXT };
    const filteredMessages = [systemPrompt, ...messages.filter((msg: any) => msg.role !== 'system')];
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: filteredMessages,
      max_tokens: 700,
      temperature: 0.2,
    });
    return NextResponse.json(completion.choices[0].message);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'An error occurred while processing your request',
        details: error.message,
        code: error.status || error.code
      },
      { status: error.status || error.code || 500 }
    );
  }
}