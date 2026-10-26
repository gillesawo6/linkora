import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://lpimodrjtrdngnzgikgk.supabase.co';

  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_scrxwvtFefLLUAkPHM0VNw_HIu_p8WA'
  )
    .trim()
    .replace(/\.$/, '');

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      configured: false,
      error: 'Missing Supabase credentials',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test querying shops
    const { data: shopsData, error: shopsError } = await supabase
      .from('shops')
      .select('count')
      .limit(1);

    // Test querying products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    return NextResponse.json({
      configured: true,
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      tables: {
        shops: {
          exists: !shopsError || shopsError.code !== '42P01', // 42P01 is table does not exist
          error: shopsError ? { message: shopsError.message, code: shopsError.code } : null,
        },
        products: {
          exists: !productsError || productsError.code !== '42P01',
          error: productsError ? { message: productsError.message, code: productsError.code } : null,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      error: err.message || 'Failed to connect to Supabase',
    });
  }
}
