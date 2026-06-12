export const EVENT_IMAGE_IDS_BY_SLUG: Record<string, string> = {
  'medan-startup-forum-2026': '1552664730-d307ca884978',
  'medan-street-food-night': '1504674900247-0877df9cc836',
  'palembang-food-carnival': '1565299624946-b28f40a0ae38',
  'palembang-arts-craft-expo': '1460661419201-fd4cecdf8a8b',
  'pekanbaru-music-showcase': '1514525253161-7a46d19cd819',
  'riau-digital-creator-camp': '1497366754035-f200968a6e72',
  'jakarta-creator-night-2026': '1517245386807-bb43f82c33c4',
  'jakarta-fashion-week-preview': '1496747611176-843222e1e57c',
  'jakarta-edm-night-warehouse-party': '1501386761578-eac5c94b800a',
  'jakarta-music-festival-2026': '1459749411175-04bf5292ceea',
  'bandung-visual-expo-2026': '1541961017774-22349e4a1262',
  'bandung-street-food-festival': '1555939594-58d7cb561ad1',
  'yogyakarta-batik-culture-fest': '1536924940846-227afb31e2a5',
  'jogja-jazz-coffee-night': '1511920170033-f8396924c348',
  'surabaya-tech-conference-2026': '1519389950473-47ba0277781c',
  'surabaya-business-summit-2026': '1542744173-8e7e53415bb0',
  'semarang-night-market-live': '1528605248644-14dd04022da1',
  'semarang-marathon-2026': '1461896836934-ffe607ba8211',
  'bali-sunset-yoga-day': '1506126613408-eca07ce68773',
  'bali-surf-beach-cleanup': '1507525428034-b723cf961d3e',
  'bali-sunset-art-exhibition': '1513364776144-60967b0f800f',
  'bali-yoga-retreat-weekend-2026': '1544367567-0f2fcb009e0b',
  'lombok-beach-market': '1511632765486-a01980e01a18',
  'lombok-travel-dive-fest': '1544551763-46a013bb70d5',
  'balikpapan-corporate-connect': '1556761175-b413da4baf72',
  'balikpapan-music-food-night': '1524368535928-5b5e00ddc76b',
  'banjarmasin-river-run': '1476480862126-209bfaa8edc8',
  'banjarmasin-floating-market-fest': '1531058020387-3be344556be6',
  'pontianak-khatulistiwa-festival': '1531913764164-f85c52e6e654',
  'pontianak-culinary-journey': '1567620905732-2d1ec7ab7445',
  'makassar-music-harbor': '1516450360452-9312f5e86fc7',
  'makassar-indie-film-screening': '1478720568477-152d9b164e26',
  'manado-ocean-cleanup-day': '1488521787991-ed7bbaae773c',
  'manado-culinary-culture-fair': '1551218808-94e220e084d2',
  'palu-youth-charity-run': '1552674605-db6ffd4facb5',
  'palu-community-craft-market': '1493106819501-66d381c466f1',
  'ambon-cultural-showcase': '1518998053901-5348d3961a04',
  'ambon-music-city-festival': '1501612780327-45045538702b',
  'jayapura-youth-tech-talk': '1540575467063-178a50c2df87',
  'papua-noken-art-exhibition': '1536922246289-88c42f957773',
  'ambon-spice-heritage-trail': '1513635269975-59663e0ac1ad',
  'maluku-sea-charity-run': '1500534623283-312aade485b7',
}

export const FALLBACK_EVENT_IMAGE_IDS = Object.values(EVENT_IMAGE_IDS_BY_SLUG)

export function getEventImageUrlById(imageId: string, width = 1200, height = 800) {
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`
}

export function getSeedEventImageUrl(slug: string, width = 1200, height = 800) {
  const imageId = EVENT_IMAGE_IDS_BY_SLUG[slug]
  if (!imageId) return null

  return getEventImageUrlById(imageId, width, height)
}

export function getFallbackEventImageUrl(key: string, width = 600, height = 380) {
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const imageId = FALLBACK_EVENT_IMAGE_IDS[index % FALLBACK_EVENT_IMAGE_IDS.length]

  return getEventImageUrlById(imageId, width, height)
}
