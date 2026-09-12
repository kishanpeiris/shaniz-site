// Products/services store admin-typed translations as separate columns
// (name, name_si, name_ta / description, description_si, description_ta)
// rather than a nested object — see SESSION-SUMMARY.md's "no
// auto-translate, manual per-language fields" decision. This is the one
// place that knows how to pick the right one.
//
// Falls back to the English (base) value whenever the requested
// language's field is missing OR blank — an admin part-way through
// translating a catalog should never show a customer an empty name or
// description just because they haven't gotten to that product yet.
export function localizedField(entity, field, lang) {
  if (!entity) return ''
  if (!lang || lang === 'en') return entity[field] ?? ''
  const translated = entity[`${field}_${lang}`]
  return translated && translated.trim() ? translated : entity[field] ?? ''
}
