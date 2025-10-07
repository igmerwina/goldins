// useGoldPrice.js - Composable for gold price management
import { ref } from 'vue';
import { supabase } from '../lib/SupabaseClient';

export function useGoldPrice() {
  const latestPrice = ref(0);
  const latestDate = ref('-');
  const apiStatus = ref('idle');
  
  const goldBrands = ['Galeri24', 'Antam', 'UBS'];

  // Fetch latest price from Supabase
  async function fetchLatestPrice() {
    console.log('useGoldPrice: fetchLatestPrice called');
    apiStatus.value = 'loading';
    
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      console.log('useGoldPrice: Fetching for date:', todayStr);
      const prices = [];
      
      for (const brand of goldBrands) {
        const { data, error } = await supabase
          .from('gold_prices')
          .select('date, price_buyback')
          .eq('brand', brand)
          .eq('denom', 1)
          .lte('date', todayStr)
          .order('date', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error(`useGoldPrice: Error fetching ${brand}:`, error);
        }
          
        if (!error && data && data.length > 0) {
          console.log(`useGoldPrice: ${brand} price:`, data[0].price_buyback);
          prices.push(Number(data[0].price_buyback) || 0);
          latestDate.value = data[0].date;
        } else {
          console.warn(`useGoldPrice: No data for ${brand}`);
        }
      }
      
      if (prices.length > 0) {
        latestPrice.value = Math.round(
          prices.reduce((a, b) => a + b, 0) / prices.length
        );
        console.log('useGoldPrice: Average price:', latestPrice.value);
        apiStatus.value = 'ok';
      } else {
        latestPrice.value = 0;
        apiStatus.value = 'no-data';
        console.warn('useGoldPrice: No prices found');
      }
    } catch (err) {
      console.error('useGoldPrice: fetchLatestPrice failed', err);
      apiStatus.value = 'failed';
    }
  }

  // Get price for specific brand and date
  async function getPriceForDate(brand, denom, date, type = 'beli') {
    const field = type === 'beli' ? 'price_buyback' : 'price_sell';
    
    try {
      const { data, error } = await supabase
        .from('gold_prices')
        .select(`${field}, date`)
        .eq('brand', brand)
        .eq('denom', denom)
        .lte('date', date)
        .order('date', { ascending: false })
        .limit(1);
        
      if (!error && data && data.length > 0) {
        return data[0][field];
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
    
    return null;
  }

  return {
    latestPrice,
    latestDate,
    apiStatus,
    goldBrands,
    fetchLatestPrice,
    getPriceForDate
  };
}
