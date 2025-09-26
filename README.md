# Gold Insight

Gold Insight is a modern Vue 3 + Vuetify web application for managing and analyzing your Pegadaian gold portfolio. It features a dashboard, interactive charts, and local data storage.

## Features
- User login and local data persistence
- Dashboard with total gold, portfolio value, average buy price, and potential profit
- Chart.js visualizations for gold composition and price history
- Add, view, and delete gold transactions
- Responsive design for desktop and mobile
- API integration for real-time gold prices (Pegadaian)

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

## API Proxy (CORS Solution)
If you deploy to Vercel, use the `/api/prices.js` serverless function to proxy Pegadaian API requests and bypass CORS restrictions.

## Project Structure
- `src/` — Main source code
  - `App.vue` — Main app shell
  - `components/Dashboard.vue` — Dashboard logic and UI
  - `main.js` — Vue and Vuetify setup
  - `style.css` — Custom styles
- `api/prices.js` — Vercel API proxy for Pegadaian
- `vite.config.js` — Vite configuration

## Notes
- All user and transaction data is stored locally in your browser.
- If Pegadaian API is blocked by CORS, use the provided proxy or deploy to Vercel.

---
Made with Vue 3, Vuetify, Chart.js, and Vercel serverless functions.
