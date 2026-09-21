import boxImg from '../assets/box.jpg'
import maskImg from '../assets/mask.jpg'
import logoImg from '../assets/logo.jpg'

// Local photos for the two original demo products, used only if no photo has
// been uploaded for them in the admin panel. (Their ingredient lists and
// badges used to be hard-coded here too, which made them impossible to edit;
// they now live in the database — see Admin → Products.)
export const PRODUCT_VISUALS = {
  'Aangraa Hair Oil': { image: boxImg },
  'Premium Herbal Hair Mask': { image: maskImg },
}

// Anything without an uploaded photo shows the Shani'z logo rather than
// some other product's picture.
export const DEFAULT_VISUAL = { image: logoImg }
