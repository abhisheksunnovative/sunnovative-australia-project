import os
import re

cache_utility_code = """
let countriesCache = null;
let fetchPromise = null;

// Ek smart Fetch Wrapper jo normal fetch ko replace karega
export const fetchWithCache = (url, options = {}) => {
  const isCountriesApi = typeof url === 'string' && url.includes('/api/countries');
  const method = options.method || 'GET';

  // 1. Agar koi naya country ADD/UPDATE ho raha hai (POST/PUT), toh cache delete kar do
  if (isCountriesApi && method !== 'GET') {
    countriesCache = null; 
    return fetch(url, options); // Normal API call
  }

  // 2. Agar Countries GET kar rahe hain, toh CACHE use karo
  if (isCountriesApi && method === 'GET') {
    // Agar pehle se data saved hai, turant wahi wapas kar do (0ms delay)
    if (countriesCache) {
      return Promise.resolve({
        json: () => Promise.resolve(countriesCache),
        status: 200,
        ok: true
      });
    }

    // Agar ek component API call kar raha hai aur dusra component load ho gaya, toh wait karo
    if (fetchPromise) {
      return fetchPromise.then(data => ({
        json: () => Promise.resolve(data),
        status: 200,
        ok: true
      }));
    }

    // Pehli baar: Original API hit karo aur response ko save kar lo
    fetchPromise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        countriesCache = data; // Data save kar liya (Memory me)
        fetchPromise = null;
        return data;
      })
      .catch(err => {
        fetchPromise = null;
        throw err;
      });

    return fetchPromise.then(data => ({
      json: () => Promise.resolve(data),
      status: 200,
      ok: true
    }));
  }

  // 3. Kisi aur API (like /api/users) ke liye, normal fetch use karo
  return fetch(url, options);
};
"""

os.makedirs('Website_Admin/src/utils', exist_ok=True)
with open('Website_Admin/src/utils/fetchWithCache.js', 'w', encoding='utf-8') as f:
    f.write(cache_utility_code.strip())

# Now update the components
components_dir = 'Website_Admin/src/components'
import_statement = "import { fetchWithCache } from '../utils/fetchWithCache';"

for root, _, files in os.walk(components_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'fetch(' in content and 'api/countries' in content:
                # Add import if not exists
                if 'fetchWithCache' not in content:
                    # Find last import to append
                    imports_end = content.rfind('import ')
                    if imports_end != -1:
                        next_newline = content.find('\n', imports_end)
                        content = content[:next_newline] + f'\n{import_statement}' + content[next_newline:]
                    else:
                        content = f'{import_statement}\n' + content

                # Replace ONLY fetch( for API calls to countries
                # Using regex to replace fetch(url) with fetchWithCache(url)
                # This regex looks for fetch( followed by anything containing api/countries
                content = re.sub(r'fetch\(([^)]*api/countries[^)]*)\)', r'fetchWithCache(\1)', content)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Created fetchWithCache and updated components!")
