# API Integration

CaloriQ uses the **Open Food Facts API** for food search and nutrition data. It is completely free, requires no API key, and no account registration.

---

## Open Food Facts

### Search by Name

```
GET https://world.openfoodfacts.org/cgi/search.pl
```

**Parameters:**

| Parameter | Value | Description |
|---|---|---|
| `search_terms` | string | Food name to search |
| `json` | `true` | Return JSON response |
| `page_size` | `10` | Number of results |
| `lc` | `en` | Filter to English products |
| `cc` | `us` | Filter to US products |
| `fields` | see below | Limit returned fields |

**Example Request:**
```
https://world.openfoodfacts.org/cgi/search.pl?search_terms=chicken&json=true&page_size=10&lc=en&cc=us
```

---

## Data Extraction

CaloriQ extracts only the fields it needs from the response:

```js
const nutrition = {
  name: product.product_name,
  calories: product.nutriments["energy-kcal_100g"] ?? 0,
  protein: product.nutriments["proteins_100g"] ?? 0,
  carbs: product.nutriments["carbohydrates_100g"] ?? 0,
  fat: product.nutriments["fat_100g"] ?? 0,
};
```

All values are per 100g and scaled based on the user's serving size input.

---

## Service Layer

All Open Food Facts calls are handled through a dedicated service file. Components never call Axios directly.

```js
// src/services/openFoodFacts.js
import axios from 'axios';

export const searchFoods = async (query) => {
  const response = await axios.get(
    'https://world.openfoodfacts.org/cgi/search.pl',
    {
      params: {
        search_terms: query,
        json: true,
        page_size: 10,
        lc: 'en',
        cc: 'us',
      }
    }
  );

  return response.data.products
    .filter(p => p.product_name && p.nutriments?.["energy-kcal_100g"])
    .map(p => ({
      name: p.product_name,
      calories: p.nutriments["energy-kcal_100g"] ?? 0,
      protein: p.nutriments["proteins_100g"] ?? 0,
      carbs: p.nutriments["carbohydrates_100g"] ?? 0,
      fat: p.nutriments["fat_100g"] ?? 0,
    }));
};
```

---

## Rate Limiting

Open Food Facts is a free community API. To avoid rate limiting (503 errors):

- Search only triggers on button click or Enter key — never on keystroke
- No debounce or automatic search on input change
- Playwright MCP tests use mock data instead of live API calls
