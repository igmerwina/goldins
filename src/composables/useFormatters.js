/**
 * useFormatters Composable
 * Provides reusable formatting functions for currency and numbers
 */

export function useFormatters() {
  /**
   * Format number as Indonesian Rupiah
   * @param {string|number} value - The value to format
   * @returns {string} Formatted rupiah string (e.g., "Rp 1.500.000")
   */
  function formatRupiah(value) {
    if (!value) return '';
    const num = value.toString().replace(/[^\d]/g, '');
    return 'Rp ' + num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Remove formatting from rupiah string to get numeric value
   * @param {string} value - Formatted rupiah string
   * @returns {string} Numeric string without formatting
   */
  function unformatRupiah(value) {
    return value ? value.toString().replace(/[^\d]/g, '') : '';
  }

  /**
   * Format number with thousand separators (Indonesian format)
   * @param {number} x - Number to format
   * @returns {string} Formatted number string
   */
  function numberWithCommas(x) { 
    if (x == null || isNaN(x)) return '-'; 
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
  }

  /**
   * Format date to Indonesian locale
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date (e.g., "7 Okt 2025")
   */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * Format number as percentage
   * @param {number} value - Percentage value
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted percentage string
   */
  function formatPercentage(value, decimals = 2) {
    if (value == null || isNaN(value)) return '0.00%';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format weight in grams
   * @param {number} grams - Weight in grams
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted weight string
   */
  function formatWeight(grams, decimals = 2) {
    if (grams == null || isNaN(grams)) return '0.00 gr';
    return `${grams.toFixed(decimals)} gr`;
  }

  return {
    formatRupiah,
    unformatRupiah,
    numberWithCommas,
    formatDate,
    formatPercentage,
    formatWeight
  };
}
