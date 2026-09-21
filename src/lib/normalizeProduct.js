import { PRODUCT_VISUALS, DEFAULT_VISUAL } from '../data/catalogAssets.js'

// Turns a raw /api/products row into the shape the UI works with
// (ProductCard, ProductDetailPage, CartContext). Single source of truth
// so the Shop grid and the product detail page never disagree about
// what "in stock" or "pre-order" means for a given product.
export const discountLabel = (row) =>
  row.discount_type === 'percent'
    ? `-${Number(row.discount_value)}%`
    : `-Rs. ${Number(row.discount_value).toLocaleString('en-US')}`

export function normalizeProduct(p) {
  const visual = PRODUCT_VISUALS[p.name] ?? DEFAULT_VISUAL
  const uploadedImages = p.images?.length ? p.images : null
  const badges = p.badges || []
  // A live discount arrives as sale_price_lkr; `price` is always what the
  // customer pays, `listPrice` the crossed-out original.
  const sale = p.sale_price_lkr != null ? Number(p.sale_price_lkr) : null
  return {
    id: p.id,
    type: 'product',
    name: p.name,
    name_si: p.name_si || null,
    name_ta: p.name_ta || null,
    tagline: p.category ? p.category.replace('-', ' ') : '',
    category: p.category || 'other',
    categoryId: p.category_id || null,
    description: p.description,
    description_si: p.description_si || null,
    description_ta: p.description_ta || null,
    price: sale ?? Number(p.price_lkr),
    listPrice: sale != null ? Number(p.price_lkr) : null,
    discountLabel: sale != null ? discountLabel(p) : null,
    stockQty: p.stock_qty,
    outOfStock: p.out_of_stock,
    images: uploadedImages || [visual.image],
    image: uploadedImages?.[0] || visual.image,
    hoverGif: p.hover_gif_url || null,
    hoverVideo: p.hover_video_url || null,
    hoverWebp: p.hover_webp_url || null,
    detailVideo: p.detail_video_url || null,
    imageFocal: { x: Number(p.image_focal_x ?? 50), y: Number(p.image_focal_y ?? 50) },
    badges,
    badge: badges[0] || null,
    ingredients: p.ingredients || [],
    createdAt: p.created_at,
    availability: p.availability || (p.out_of_stock ? 'out_of_stock' : 'in_stock'),
    preorderEtaDays: p.preorder_eta_days || null,
    unitsSold: Number(p.units_sold) || 0,
    avgRating: Number(p.avg_rating) || 0,
    reviewCount: Number(p.review_count) || 0,
  }
}
