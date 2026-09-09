import { DEFAULT_VISUAL } from '../data/catalogAssets.js'

// Turns a raw /api/services row into the shape the UI works with
// (ServiceCard, ServiceDetailPage). Single source of truth so the Shop
// grid and the service detail page never disagree — same reasoning as
// normalizeProduct.js for products.
export function normalizeService(s) {
  const uploadedImages = s.images?.length ? s.images : null
  return {
    id: s.id,
    type: 'service',
    name: s.name,
    tagline: `${s.service_type === 'bookable' ? 'In-Studio' : 'Add to Basket'}${
      s.duration_minutes ? ` · ${s.duration_minutes} Minutes` : ''
    }`,
    category: s.category || null,
    categoryId: s.category_id || null,
    description: s.description,
    price: Number(s.price_lkr),
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
    branch: s.branch_id
      ? {
          id: s.branch_id,
          name: s.branch_name,
          address: s.branch_address,
          latitude: s.branch_latitude,
          longitude: s.branch_longitude,
          phone: s.branch_phone,
        }
      : null,
  }
}
