import { NextRequest, NextResponse } from 'next/server';
import { executeSearch, SearchOptions } from '@/lib/search';
import { PRODUCTS, SHOPS } from '@/lib/data/sample-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const priceBucket = searchParams.get('priceBucket') as any;
    const sortBy = searchParams.get('sortBy') as any;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;

    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;

    const options: SearchOptions = {
      category,
      city,
      priceBucket,
      sortBy,
      minPrice: isNaN(minPrice as any) ? undefined : minPrice,
      maxPrice: isNaN(maxPrice as any) ? undefined : maxPrice,
      limit: isNaN(limit as any) ? undefined : limit,
    };

    const results = executeSearch(q, PRODUCTS, SHOPS, options);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to execute search' },
      { status: 500 }
    );
  }
}
