import re

def update_checklist():
    with open('D:/sunnovative-australia-website/Website_Admin/src/components/OnboardingChecklist.jsx', 'r') as f:
        content = f.read()

    # Add new state items
    content = content.replace("brands: { configured: false, count: 0 },", "brands: { configured: false, count: 0 },\n    demandSupply: { configured: false, count: 0 },\n    discoms: { configured: false, count: 0 },\n    bdes: { configured: false, count: 0 },\n    eligibility: { configured: false, count: 0 },")

    # Update Promise.all fetches
    content = content.replace("fetch(`${API_BASE}/api/brands?country=${selectedCountry}`)", "fetch(`${API_BASE}/api/brands?country=${selectedCountry}`),\n          fetch(`${API_BASE}/api/demand-supply?country=${selectedCountry}`),\n          fetch(`${API_BASE}/api/discoms?country=${selectedCountry}`),\n          fetch(`${API_BASE}/api/bdes?country=${selectedCountry}`),\n          fetch(`${API_BASE}/api/customer-eligibility?country=${selectedCountry}`)")

    # Await results
    content = content.replace("const [ptRes, distRes, journeyRes, prodRes, brandRes] = await Promise.all([", "const [ptRes, distRes, journeyRes, prodRes, brandRes, dsRes, discomRes, bdeRes, eligRes] = await Promise.all([")

    # Parse JSON
    content = content.replace("const brand = await brandRes.json();", "const brand = await brandRes.json();\n        const ds = await dsRes.json();\n        const discom = await discomRes.json();\n        const bde = await bdeRes.json();\n        const elig = await eligRes.json();")

    # Update setStatus
    content = content.replace("brands: { configured: brand.data?.length > 0, count: brand.data?.length || 0 }", "brands: { configured: brand.data?.length > 0, count: brand.data?.length || 0 },\n          demandSupply: { configured: ds.data?.length > 0, count: ds.data?.length || 0 },\n          discoms: { configured: discom.data?.length > 0, count: discom.data?.length || 0 },\n          bdes: { configured: bde.data?.length > 0, count: bde.data?.length || 0 },\n          eligibility: { configured: elig.data !== undefined, count: elig.data ? 1 : 0 }")

    # Update UI checks
    content = content.replace("{ key: 'brands', label: 'Brands', desc: 'Assign brands to the products' }", "{ key: 'brands', label: 'Brands', desc: 'Assign brands to the products' },\n    { key: 'demandSupply', label: 'Demand & Supply Rules', desc: 'Configure regional rules' },\n    { key: 'discoms', label: 'Discom Management', desc: 'Map Discoms to districts' },\n    { key: 'bdes', label: 'BDE Management', desc: 'Add Business Development Executives' },\n    { key: 'eligibility', label: 'Customer Eligibility', desc: 'Configure subsidy and criteria rules' }")

    with open('D:/sunnovative-australia-website/Website_Admin/src/components/OnboardingChecklist.jsx', 'w') as f:
        f.write(content)

update_checklist()
