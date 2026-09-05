import boxImg from '../assets/box.jpg'
import maskImg from '../assets/mask.jpg'

// The backend's `products.images` column is real (an array of URLs) but
// nothing uploads to it yet — there's no image-hosting step wired up
// (Cloudinary/Supabase Storage, per project-spec.md Section 1). Until
// that exists, match by product name to the photos we already have
// locally. Once image upload is built, delete this file and use
// product.images[0] directly.

export const PRODUCT_VISUALS = {
  'Aangraa Hair Oil': {
    image: boxImg,
    badge: '100% Herbal',
    ingredients: ['Coconut Oil', 'Neem & Dill', 'Curry Leaves', 'Rosemary', 'Natural preservatives'],
  },
  'Premium Herbal Hair Mask': {
    image: maskImg,
    badge: '100% Natural',
    ingredients: ['Amla', 'Rosemary', 'Curry Leaf', 'Mint & Bay', 'Dried whole herbs'],
  },
}

export const DEFAULT_VISUAL = {
  image: maskImg,
  badge: null,
  ingredients: [],
}
