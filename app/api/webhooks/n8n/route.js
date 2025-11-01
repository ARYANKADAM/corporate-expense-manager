import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('n8n webhook received:', event, data);

    // n8n will call this endpoint
    // We'll send data TO n8n in the expense submission

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook failed', error: error.message },
      { status: 500 }
    );
  }
}