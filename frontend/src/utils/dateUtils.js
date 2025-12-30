/**
 * Date formatting utilities
 * These functions ensure consistent date formatting across the application
 * and remove time components from date displays
 */

/**
 * Format a date string to show only the date part (no time)
 * @param {string|Date} dateString - The date string or Date object to format
 * @param {string} locale - The locale to use for formatting (default: user's locale)
 * @returns {string} - Formatted date string or 'N/A' if invalid
 */
export const formatDate = (dateString, locale = undefined) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (date.toString() === 'Invalid Date') return 'N/A';
    
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format a date range (start date to end date)
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @param {string} locale - The locale to use for formatting
 * @returns {string} - Formatted date range or 'N/A' if invalid
 */
export const formatDateRange = (startDate, endDate, locale = undefined) => {
  if (!startDate || !endDate) return 'N/A';
  
  const formattedStart = formatDate(startDate, locale);
  const formattedEnd = formatDate(endDate, locale);
  
  if (formattedStart === 'N/A' || formattedEnd === 'N/A') return 'N/A';
  
  return `${formattedStart} to ${formattedEnd}`;
};

/**
 * Format a date for input fields (YYYY-MM-DD format)
 * @param {string|Date} dateString - The date string or Date object to format
 * @returns {string} - Formatted date string for input fields
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (date.toString() === 'Invalid Date') return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Check if a date is valid
 * @param {string|Date} dateString - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date';
  } catch (error) {
    return false;
  }
};