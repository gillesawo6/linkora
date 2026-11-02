import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('--- LINKORA MOTION & INTERACTION REFINEMENT TEST SUITE ---');

const globalsCss = fs.readFileSync(path.resolve('app/globals.css'), 'utf-8');
const buttonTsx = fs.readFileSync(path.resolve('components/ui/button.tsx'), 'utf-8');
const productCardTsx = fs.readFileSync(path.resolve('components/marketplace/product-card.tsx'), 'utf-8');
const productImageTsx = fs.readFileSync(path.resolve('components/ui/product-image.tsx'), 'utf-8');

// 1. Verify cta-glow-emerald in app/globals.css
console.log('\n[SECTION 1: CTA Ambient Glow Reusable Class]');
assert(globalsCss.includes('.cta-glow-emerald'), 'globals.css must define .cta-glow-emerald');
// Must not have permanent glow at rest
assert(!globalsCss.includes('.cta-glow-emerald {\n  box-shadow: 0 4px 16px -2px rgba(15, 125, 65,'), 'Rest state must not have permanent neon emerald glow');
assert(globalsCss.includes('.cta-glow-emerald:hover'), '.cta-glow-emerald must define hover state');
assert(globalsCss.includes('rgba(15, 125, 65,'), '.cta-glow-emerald hover must use emerald brand palette');
console.log('✓ [PASS] cta-glow-emerald has no permanent rest glow and provides smooth ambient emerald hover glow');

// 2. Verify button.tsx uses cta-glow-emerald on primary only
console.log('\n[SECTION 2: Button Component Variant Rules]');
assert(buttonTsx.includes("case 'primary':"), 'Button must have primary variant');
assert(buttonTsx.includes("cta-glow-emerald"), 'Primary variant must use cta-glow-emerald');
// Ensure secondary and destructive do not have cta-glow-emerald
const secondaryMatch = buttonTsx.match(/case 'secondary':[\s\S]*?break;/);
assert(secondaryMatch && !secondaryMatch[0].includes('cta-glow-emerald'), 'Secondary variant must not use cta-glow-emerald');
const destructiveMatch = buttonTsx.match(/case 'destructive':[\s\S]*?break;/);
assert(destructiveMatch && !destructiveMatch[0].includes('cta-glow-emerald'), 'Destructive variant must not use cta-glow-emerald');
console.log('✓ [PASS] cta-glow-emerald is applied exclusively to primary buttons without contaminating secondary/destructive variants');

// 3. Verify Product Card Clay-inspired Elevation
console.log('\n[SECTION 3: Product Card Clay Elevation]');
assert(globalsCss.includes('.clay-elevate-card'), 'globals.css must define .clay-elevate-card');
assert(globalsCss.includes('transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'), 'clay-elevate-card must use fluid cubic-bezier curve on base selector');
assert(globalsCss.includes('.clay-elevate-card:hover'), 'clay-elevate-card must define hover elevation');
assert(globalsCss.includes('translateY(-5px)'), 'clay-elevate-card:hover must elevate with translateY(-5px)');
assert(!productCardTsx.includes('hover:border-[#0F7D41]'), 'product-card.tsx must not use green hover border');
console.log('✓ [PASS] Product card elevation uses smooth 380ms cubic-bezier elevation and no green borders');

// 4. Verify Product Image Zoom
console.log('\n[SECTION 4: Product Image Zoom & Containment]');
assert(productCardTsx.includes('overflow-hidden'), 'Image container must have overflow-hidden to confine zoom');
assert(productCardTsx.includes('group-hover:scale-105') || productCardTsx.includes('group-hover:scale-[1.05'), 'ProductCard must have subtle controlled image zoom');
assert(productImageTsx.includes('duration-500'), 'ProductImage must support smooth duration-500 transition');
assert(productImageTsx.includes('cubic-bezier(0.16,1,0.3,1)'), 'ProductImage must use coordinated cubic-bezier easing');
console.log('✓ [PASS] Product image zoom is restored, confined to container, and coordinated with card elevation');

// 5. Verify Accessibility & Reduced Motion
console.log('\n[SECTION 5: Accessibility & Reduced Motion]');
assert(globalsCss.includes('@media (prefers-reduced-motion: reduce)'), 'globals.css must respect prefers-reduced-motion');
assert(buttonTsx.includes('focus-visible:ring'), 'Button must retain visible keyboard focus');
assert(productCardTsx.includes('focus-within:z-20'), 'Product card must retain focus-within stacking context');
console.log('✓ [PASS] Full keyboard accessibility and reduced-motion compliance preserved');

console.log('\n========================================');
console.log('TEST SUMMARY: ALL MOTION TESTS PASSED (100%)');
console.log('========================================');
