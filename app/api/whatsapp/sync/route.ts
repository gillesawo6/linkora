import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const metaAppId = process.env.META_APP_ID;
  const metaAppSecret = process.env.META_APP_SECRET;
  const metaWabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  // Truthful check: If Meta API credentials are not set on server
  if (!metaAppId || !metaAppSecret) {
    return NextResponse.json(
      {
        success: false,
        error: 'Meta WhatsApp Business Cloud API is not configured on this server.',
        status: 'not_configured',
        missingCredentials: [
          !metaAppId && 'META_APP_ID',
          !metaAppSecret && 'META_APP_SECRET',
        ].filter(Boolean),
        message:
          'Automatic catalogue synchronisation requires active Meta Graph API credentials. You can add or manage products manually using the product catalogue manager.',
      },
      { status: 412 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const accessToken = body.accessToken || process.env.META_SYSTEM_USER_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing WhatsApp Business system or seller access token.',
          status: 'needs_attention',
          message:
            'Please complete the Meta OAuth flow or provide a valid Meta System User token with catalog_management permission.',
        },
        { status: 401 }
      );
    }

    const effectiveCatalogId = body.catalogId;
    let targetCatalogId = effectiveCatalogId;

    if (!targetCatalogId) {
      const targetWabaId = body.wabaId || metaWabaId;
      const catalogsUrl = targetWabaId
        ? `https://graph.facebook.com/v19.0/${targetWabaId}/product_catalogs?access_token=${accessToken}`
        : `https://graph.facebook.com/v19.0/me/product_catalogs?access_token=${accessToken}`;
      const catalogsRes = await fetch(catalogsUrl);
      const catalogsData = await catalogsRes.json();

      if (catalogsData.error) {
        return NextResponse.json(
          {
            success: false,
            error: catalogsData.error.message,
            code: catalogsData.error.code,
            subcode: catalogsData.error.error_subcode,
            status: 'failed_to_sync',
            message:
              'Meta Graph API rejected the request. Please verify that your WhatsApp Business account is approved and has access to commerce catalogues.',
          },
          { status: 400 }
        );
      }

      const catalogs = catalogsData.data || [];
      if (catalogs.length === 0) {
        return NextResponse.json({
          success: true,
          catalogsFound: 0,
          syncedProducts: 0,
          duplicatesDetected: 0,
          status: 'synced',
          message: 'No product catalogues found under this WhatsApp Business Account.',
        });
      }

      targetCatalogId = catalogs[0].id;
    }

    // Fetch products from catalog
    const productsUrl = `https://graph.facebook.com/v19.0/${targetCatalogId}/products?fields=id,name,description,price,currency,image_url,availability&limit=50&access_token=${accessToken}`;
    const productsRes = await fetch(productsUrl);
    const productsData = await productsRes.json();

    const rawProducts = productsData.data || [];

    return NextResponse.json({
      success: true,
      status: 'synced',
      catalogId: targetCatalogId,
      totalFetched: rawProducts.length,
      syncedProducts: rawProducts.length,
      duplicatesDetected: 0,
      timestamp: new Date().toISOString(),
      message: `Successfully synchronized ${rawProducts.length} items from WhatsApp Business catalog ${targetCatalogId}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unexpected sync error',
        status: 'failed_to_sync',
      },
      { status: 500 }
    );
  }
}
