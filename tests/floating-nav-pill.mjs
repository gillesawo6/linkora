import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- LINKORA FLOATING COMPACT NAV PILL TEST SUITE ---');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}:`, err.message);
  }
}

test('FloatingNavPill component file exists', () => {
  const filePath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  assert.ok(fs.existsSync(filePath), 'File components/marketplace/floating-nav-pill.tsx must exist');
});

test('Header no longer has sticky top-0 and uses relative positioning', () => {
  const headerPath = path.resolve('components/marketplace/header.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(!content.includes('sticky top-0'), 'Full navbar must not be sticky');
  assert.ok(content.includes('relative z-30 w-full'), 'Full navbar must use natural relative positioning');
});

test('Header uses IntersectionObserver for scroll detection', () => {
  const headerPath = path.resolve('components/marketplace/header.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(content.includes('IntersectionObserver'), 'Must use IntersectionObserver for performant scroll detection');
  assert.ok(content.includes('isPastHeader'), 'Must calculate scroll past header');
  assert.ok(content.includes('FloatingNavPill'), 'Header must render FloatingNavPill');
});

test('FloatingNavPill includes essential navigation links', () => {
  const pillPath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  const content = fs.readFileSync(pillPath, 'utf-8');
  assert.ok(content.includes("href: '/explore'"), 'Must include Explore');
  assert.ok(content.includes("href: '/categories'"), 'Must include Categories');
  assert.ok(content.includes("href: '/shops'"), 'Must include Shops');
});

test('FloatingNavPill supports interactive expandable search', () => {
  const pillPath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  const content = fs.readFileSync(pillPath, 'utf-8');
  assert.ok(content.includes('isSearchOpen'), 'Must support expandable search state');
  assert.ok(content.includes('handleSearchSubmitInternal'), 'Must support search submission');
  assert.ok(content.includes('searchInputRef'), 'Must support search auto-focus');
});

test('FloatingNavPill supports expandable secondary menu with keyboard & click outside', () => {
  const pillPath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  const content = fs.readFileSync(pillPath, 'utf-8');
  assert.ok(content.includes('isMenuOpen'), 'Must support expandable menu state');
  assert.ok(content.includes('handleClickOutside'), 'Must close on click outside');
  assert.ok(content.includes("e.key === 'Escape'"), 'Must close on Escape key');
});

test('FloatingNavPill respects prefers-reduced-motion', () => {
  const pillPath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  const content = fs.readFileSync(pillPath, 'utf-8');
  assert.ok(content.includes('useReducedMotion'), 'Must use useReducedMotion hook');
  assert.ok(content.includes('shouldReduceMotion'), 'Must adapt animations for reduced motion');
});

test('FloatingNavPill active tab is clean bold green text without background bubble', () => {
  const pillPath = path.resolve('components/marketplace/floating-nav-pill.tsx');
  const content = fs.readFileSync(pillPath, 'utf-8');
  assert.ok(!content.includes('bg-[#E8F7EE]/95'), 'Must not have exaggerated background capsule on active tab');
  assert.ok(content.includes('text-[#0F7D41] font-bold'), 'Active tab must be bold green text');
});

test('Header navbar has no underline on active tab and uses bold green text only', () => {
  const headerPath = path.resolve('components/marketplace/header.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(!content.includes('shadow-[0_0_8px_rgba(15,125,65,0.7)]'), 'Header must not have underline glow');
  assert.ok(!content.includes('h-0.5 bg-[#0F7D41]'), 'Header must not have underline bar');
  assert.ok(content.includes("currentPath === '/explore' ? 'text-[#0F7D41] font-bold' : ''"), 'Header active tab must be bold green text only');
});

test('Product details page image showcase frame has no uneven padding', () => {
  const productPagePath = path.resolve('app/products/[id]/page.tsx');
  const content = fs.readFileSync(productPagePath, 'utf-8');
  assert.ok(!content.includes('p-3 sm:p-5'), 'Product showcase frame must not have uneven padding');
  assert.ok(content.includes('containerClassName="w-full h-full rounded-[24px]"'), 'Product showcase must fill frame cleanly');
});

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} / ${total} PASSED`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
