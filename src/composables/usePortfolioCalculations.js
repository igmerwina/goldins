// usePortfolioCalculations.js - Composable for portfolio calculations
import { computed } from 'vue';

export function usePortfolioCalculations(transactions, latestPrice) {
  // Format number with commas
  function numberWithCommas(x) {
    if (x == null || isNaN(x)) return '-';
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Calculate total gold owned (buy - sell)
  const totalGold = computed(() => {
    return transactions.value.reduce((sum, t) => {
      const gram = Number(t.denom) * Number(t.count);
      return sum + (t.type === 'beli' ? gram : -gram);
    }, 0);
  });

  // Calculate average buy price per gram
  const avgPrice = computed(() => {
    const buys = transactions.value.filter(
      t => t.type === 'beli' && t.total_price > 0 && t.denom > 0
    );
    
    if (buys.length === 0) return latestPrice.value || 0;
    
    const sumTotal = buys.reduce((s, t) => s + Number(t.total_price), 0);
    const sumGram = buys.reduce((s, t) => s + (Number(t.denom) * Number(t.count)), 0);
    
    return sumGram > 0 ? Math.round(sumTotal / sumGram) : 0;
  });

  // Calculate total portfolio value
  const totalPorto = computed(() => 
    numberWithCommas(latestPrice.value * totalGold.value)
  );

  // Formatted prices
  const avgPriceFormatted = computed(() => 
    numberWithCommas(avgPrice.value)
  );

  const latestPriceFormatted = computed(() => 
    numberWithCommas(latestPrice.value)
  );

  // Calculate potential profit
  const potentialProfit = computed(() => 
    Math.round((latestPrice.value - avgPrice.value) * totalGold.value)
  );

  const potentialProfitFormatted = computed(() => 
    numberWithCommas(potentialProfit.value)
  );

  // Calculate profit percentage
  const profitPercent = computed(() => {
    const avg = avgPrice.value || 1;
    const percent = Math.round(((latestPrice.value || 0) - avg) / avg * 100);
    return `${percent}%`;
  });

  // Calculate composition data per brand
  const donutData = computed(() => {
    const result = {};
    
    transactions.value.forEach(t => {
      const brand = t.brand || 'Other';
      if (!result[brand]) {
        result[brand] = { gram: 0, nominal: 0 };
      }
      
      const gram = Number(t.denom) * Number(t.count) * (t.type === 'beli' ? 1 : -1);
      const nominal = Number(t.total_price) * (t.type === 'beli' ? 1 : -1);
      
      result[brand].gram += gram;
      result[brand].nominal += nominal;
    });
    
    // Ensure no negative values
    Object.keys(result).forEach(brand => {
      result[brand].gram = Math.max(result[brand].gram, 0);
      result[brand].nominal = Math.max(result[brand].nominal, 0);
    });
    
    return result;
  });

  const donutBrands = computed(() => Object.keys(donutData.value));

  return {
    numberWithCommas,
    totalGold,
    avgPrice,
    totalPorto,
    avgPriceFormatted,
    latestPriceFormatted,
    potentialProfit,
    potentialProfitFormatted,
    profitPercent,
    donutData,
    donutBrands
  };
}
