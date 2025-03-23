import React from 'react';
import romanAntiqueFontFile from '../assets/fonts/RomanAntique.ttf';

// This component doesn't render anything visible
// It just injects the font into the document head
const FontLoader = () => {
  React.useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    
    // Define the @font-face rule
    style.textContent = `
      @font-face {
        font-family: 'RomanAntique';
        src: url('${romanAntiqueFontFile}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    
    // Append the style to the document head
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null; // Component doesn't render anything
};

export default FontLoader; 