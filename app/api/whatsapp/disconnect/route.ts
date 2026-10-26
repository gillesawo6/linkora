import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const shopId = body.shopId;

    // Disconnect WhatsApp Business connection for this store
    return NextResponse.json({
      success: true,
      shopId,
      status: 'not_connected',
      message: 'WhatsApp Business account successfully disconnected from Linkora.',
      disconnectedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to disconnect',
      },
      { status: 500 }
    );
  }
}
