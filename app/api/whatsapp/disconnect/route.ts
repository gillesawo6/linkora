import { NextRequest, NextResponse } from 'next/server';
import { disconnectShopConnection } from '@/lib/whatsapp-connection-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const shopId = body.shopId || 'shop-maison-ndolo';

    // Clear server-side connection record
    const updated = disconnectShopConnection(shopId);

    return NextResponse.json({
      success: true,
      shopId,
      status: updated.status,
      verified: updated.verified,
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
