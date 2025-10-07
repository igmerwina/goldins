/**
 * useBrands Composable
 * Provides brand-related constants and utility functions
 */

export function useBrands() {
  // Brand color mapping for UI elements
  const BRAND_COLORS = {
    'Galeri24': '#4CAF50',
    'Antam': '#2196F3',
    'UBS': '#FF9800'
  };

  // Brand colors for charts
  const BRAND_CHART_COLORS = {
    'Galeri24': '#0B6B3A',
    'Antam': '#C69C2F',
    'UBS': '#6B6B6B'
  };

  // Available gold brands
  const GOLD_BRANDS = ['Galeri24', 'Antam', 'UBS'];

  // Available denominations (in grams)
  const DENOMINATIONS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100];

  /**
   * Get UI color for a brand
   * @param {string} brand - Brand name
   * @returns {string} Hex color code
   */
  function getBrandColor(brand) {
    return BRAND_COLORS[brand] || '#9E9E9E';
  }

  /**
   * Get chart color for a brand
   * @param {string} brand - Brand name
   * @returns {string} Hex color code
   */
  function getBrandChartColor(brand) {
    return BRAND_CHART_COLORS[brand] || '#999';
  }

  /**
   * Get brand icon based on brand name
   * @param {string} brand - Brand name
   * @returns {string} Material Design Icon name
   */
  function getBrandIcon(brand) {
    const icons = {
      'Galeri24': 'mdi-star',
      'Antam': 'mdi-shield-check',
      'UBS': 'mdi-bank'
    };
    return icons[brand] || 'mdi-tag';
  }

  return {
    BRAND_COLORS,
    BRAND_CHART_COLORS,
    GOLD_BRANDS,
    DENOMINATIONS,
    getBrandColor,
    getBrandChartColor,
    getBrandIcon
  };
}
