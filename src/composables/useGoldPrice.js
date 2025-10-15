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
    apiStatus.value = 'loading';
    
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const prices = [];
      
      for (const brand of goldBrands) {
        const { data, error } = await supabase
          .from('gold_prices_v2')
          .select('date, price_buyback')
          .eq('brand', brand)
          .eq('denom', 1)
          .lte('date', todayStr)
          .order('date', { ascending: false })
          .limit(1);
          
        if (!error && data && data.length > 0) {
          prices.push(Number(data[0].price_buyback) || 0);
          latestDate.value = data[0].date;
        }
      }
      
      if (prices.length > 0) {
        latestPrice.value = Math.round(
          prices.reduce((a, b) => a + b, 0) / prices.length
        );
        apiStatus.value = 'ok';
      } else {
        latestPrice.value = 0;
        apiStatus.value = 'no-data';
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
        .from('gold_prices_v2')
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
