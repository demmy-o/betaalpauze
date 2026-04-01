export type Company = {
  name: string
  kvkNumber?: string // Will come from KvK API later
  city?: string
}

// Mock data — replace with KvK API integration later
// See: https://developers.kvk.nl/documentation/search-v2
export const mockCompanies: Company[] = [
  { name: "Intrum Nederland", kvkNumber: "12345678", city: "Amsterdam" },
  { name: "Flanderijn Incasso", kvkNumber: "23456789", city: "Rotterdam" },
  { name: "Syncasso", kvkNumber: "34567890", city: "Leeuwarden" },
  { name: "DirectPay", kvkNumber: "45678901", city: "Breda" },
  { name: "Credifin", kvkNumber: "56789012", city: "Den Haag" },
  { name: "GGN Mastering Credit", kvkNumber: "67890123", city: "Almere" },
  { name: "CJIB", kvkNumber: "78901234", city: "Leeuwarden" },
  { name: "Nationale-Nederlanden", kvkNumber: "89012345", city: "Den Haag" },
  { name: "Ziggo", kvkNumber: "90123456", city: "Utrecht" },
  { name: "Vattenfall", kvkNumber: "01234567", city: "Amsterdam" },
  { name: "Eneco", kvkNumber: "11234567", city: "Rotterdam" },
  { name: "T-Mobile", kvkNumber: "21234567", city: "Den Haag" },
  { name: "KPN", kvkNumber: "31234567", city: "Den Haag" },
  { name: "Zilveren Kruis", kvkNumber: "41234567", city: "Leiden" },
  { name: "CZ Zorgverzekering", kvkNumber: "51234567", city: "Tilburg" },
  { name: "DAS Rechtsbijstand", kvkNumber: "61234567", city: "Amsterdam" },
  { name: "Wehkamp", kvkNumber: "71234567", city: "Zwolle" },
  { name: "Bol.com", kvkNumber: "81234567", city: "Utrecht" },
  { name: "Essent", kvkNumber: "91234567", city: "Den Bosch" },
  { name: "Achmea", kvkNumber: "10234567", city: "Zeist" },
]

/**
 * Search companies by name — currently uses mock data.
 * To integrate with KvK API later, replace this function body with:
 * fetch(`https://api.kvk.nl/api/v2/zoeken?handelsnaam=${encodeURIComponent(query)}`)
 */
export function searchCompanies(query: string): Company[] {
  if (!query || query.length < 1) return []
  const lower = query.toLowerCase()
  return mockCompanies.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 8)
}
