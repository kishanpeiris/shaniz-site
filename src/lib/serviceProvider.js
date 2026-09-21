// The company (a Shani'z subsidiary) that provides every service.
// Edited by admins in Admin -> Services -> "Service provider".
// These helpers mirror shaniz-api/src/lib/serviceProvider.js so the website,
// emails and invoices all say the same thing.

export const DEFAULT_PROVIDER = {
  name: 'Miracles Hair and Skin Clinic',
  logo_url: '',
  wording_en: 'Provided by {name}',
  wording_si: '{name} විසින් සපයනු ලබන සේවාවකි',
  wording_ta: '{name} வழங்கும் சேவை',
}

// "Provided by Miracles Hair and Skin Clinic" in the visitor's language
// (English is used when that language has no wording written yet).
export function providerWording(provider, language = 'en') {
  const template = (provider[`wording_${language}`] || provider.wording_en || DEFAULT_PROVIDER.wording_en).trim()
  return template.replace(/\{name\}/g, provider.name)
}

// An appointment location always sits under the provider's name:
// "Miracles Hair and Skin Clinic — Kandy". The prefix is skipped when the
// branch name already contains the provider's name, so it never reads twice.
export function providerBranchLabel(provider, branchName) {
  if (!provider?.name) return branchName || ''
  if (!branchName) return provider.name
  return branchName.toLowerCase().includes(provider.name.toLowerCase()) ? branchName : `${provider.name} — ${branchName}`
}
