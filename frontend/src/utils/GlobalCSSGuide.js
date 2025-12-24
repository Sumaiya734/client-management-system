/**
 * Global CSS Guide for Soft Purple Background
 * 
 * This utility file provides documentation and examples for using the global CSS
 * classes that implement the soft purple background across all pages.
 * 
 * Available CSS Variables:
 * --soft-purple: #e0b0ff (main soft purple color)
 * --light-soft-purple: #f3e8ff (lighter soft purple for content areas)
 * --dark-soft-purple: #c084fc (darker soft purple for accents)
 * 
 * Available CSS Classes:
 * .page-background: Applies soft purple background to entire page
 * .page-content: Applies lighter soft purple background for content areas
 * 
 * Usage:
 * 1. Import globals.css in your main App.jsx file (already done)
 * 2. Apply the classes to your page containers as needed
 */

// Example usage component demonstrating how to use the global CSS classes
export const SoftPurplePageExample = () => {
  return (
    <div className="page-background">
      <div className="page-content">
        <h1>This page has a soft purple background</h1>
        <p>Content within the page-content class has a lighter purple background</p>
      </div>
    </div>
  );
};

// CSS Variables for reference
export const CSSVariables = {
  softPurple: 'var(--soft-purple)',
  lightSoftPurple: 'var(--light-soft-purple)',
  darkSoftPurple: 'var(--dark-soft-purple)'
};