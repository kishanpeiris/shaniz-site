import { DEFAULT_VISUAL } from '../data/catalogAssets.js'
import { discountLabel } from './normalizeProduct.js'

// Turns a raw /api/services row into the shape the UI works with
// (ServiceCard, ServiceDetailPage). Single source of truth so the Shop
// grid and the service detail page never disagree — same reasoning as
// normalizeProduct.js for products.
export function normalizeService(s) {
  const uploadedImages = s.images?.length ? s.images : null
  const sale = s.sale_price_lkr != null ? Number(s.sale_price_lkr) : null
  return {
    id: s.id,
    type: 'service',
    name: s.name,
    name_si: s.name_si || null,
    name_ta: s.name_ta || null,
    tagline: `${s.service_type === 'bookable' ? 'In-Studio' : 'Add to Basket'}${
      s.duration_minutes ? ` · ${s.duration_minutes} Minutes` : ''
    }`,
    category: s.category || null,
    categoryId: s.category_id || null,
    description: s.description,
    description_si: s.description_si || null,
    description_ta: s.description_ta || null,
    price: sale ?? Number(s.price_lkr),
    listPrice: sale != null ? Number(s.price_lkr) : null,
    discountLabel: sale != null ? discountLabel(s) : null,
    serviceType: s.service_type,
    durationMinutes: s.duration_minutes,
    images: uploadedImages || [DEFAULT_VISUAL.image],
    image: uploadedImages?.[0] || DEFAULT_VISUAL.image,
    hoverVideo: s.hover_video_url || null,
    hoverWebp: s.hover_webp_url || null,
    hoverGif: s.hover_gif_url || null,
    detailVideo: s.detail_video_url || null,
    imageFocal: { x: Number(s.image_focal_x ?? 50), y: Number(s.image_focal_y ?? 50) },
    badges: s.badges || [],
    unitsSold: Number(s.units_sold) || 0,
    // Every branch that offers this service (set in Admin → Branches).
    branches: (s.branches || []).map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      latitude: b.latitude,
      longitude: b.longitude,
      phone: b.phone,
    })),
  }
}
