import { PRODUCT_VISUALS, DEFAULT_VISUAL } from '../data/catalogAssets.js'

// Turns a raw /api/products row into the shape the UI works with
// (ProductCard, ProductDetailPage, CartContext). Single source of truth
// so the Shop grid and the product detail page never disagree about
// what "in stock" or "pre-order" means for a given product.
export function normalizeProduct(p) {
  const visual = PRODUCT_VISUALS[p.name] ?? DEFAULT_VISUAL
  const uploadedImages = p.images?.length ? p.images : null
  return {
    id: p.id,
    type: 'product',
    name: p.name,
    tagline: p.category ? p.category.replace('-', ' ') : '',
    category: p.category || 'other',
    description: p.description,
    price: Number(p.price_lkr),
    stockQty: p.stock_qty,
    outOfStock: p.out_of_stock,
    images: uploadedImages || [visual.image],
    image: uploadedImages?.[0] || visual.image,
    hoverGif: p.hover_gif_url || null,
    hoverVideo: p.hover_video_url || null,
    hoverWebp: p.hover_webp_url || null,
    badge: visual.badge,
    ingredients: visual.ingredients,
    createdAt: p.created_at,
    availability: p.availability || (p.out_of_stock ? 'out_of_stock' : 'in_stock'),
    preorderEtaDays: p.preorder_eta_days || null,
    unitsSold: Number(p.units_sold) || 0,
  }
}
