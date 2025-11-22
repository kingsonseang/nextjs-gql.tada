/**
 * Utility functions for downloading Pokemon cards as images
 * Converts SVG template to canvas and downloads as PNG
 */

interface PokemonCardData {
  id: string;
  name: string;
  imageUrl: string;
  types?: string[];
}

/**
 * Creates an SVG string for a Pokemon card
 * @param data - Pokemon card data
 * @returns SVG string
 */
export function createPokemonCardSVG(data: PokemonCardData): string {
  const { id, name, imageUrl, types = [] } = data;
  
  // Create a card-like SVG template with black theme
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Card Background -->
      <rect width="400" height="600" rx="20" fill="url(#cardGradient)" stroke="#1f1f1f" stroke-width="2"/>
      
      <!-- Pokemon Image Area -->
      <rect x="20" y="20" width="360" height="360" rx="10" fill="#0a0a0a" stroke="#1f1f1f" stroke-width="2"/>
      <image href="${imageUrl}" x="20" y="20" width="360" height="360" preserveAspectRatio="xMidYMid meet"/>
      
      <!-- Pokemon Name -->
      <text x="200" y="420" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#ffffff">
        ${name}
      </text>
      
      <!-- Pokemon ID -->
      <text x="200" y="450" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#9ca3af">
        #${id.padStart(3, '0')}
      </text>
      
      <!-- Types -->
      ${types.length > 0 ? `
        <text x="200" y="490" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#9ca3af">
          ${types.join(' / ')}
        </text>
      ` : ''}
      
      <!-- Decorative elements -->
      <circle cx="50" cy="50" r="15" fill="#1f1f1f" opacity="0.5"/>
      <circle cx="350" cy="50" r="15" fill="#1f1f1f" opacity="0.5"/>
      <circle cx="50" cy="550" r="15" fill="#1f1f1f" opacity="0.5"/>
      <circle cx="350" cy="550" r="15" fill="#1f1f1f" opacity="0.5"/>
    </svg>
  `.trim();
  
  return svg;
}

/**
 * Converts SVG string to PNG blob and triggers download
 * @param svgString - SVG string to convert
 * @param filename - Name for the downloaded file
 */
export async function downloadCardAsPNG(
  svgString: string,
  filename: string = 'pokemon-card.png'
): Promise<void> {
  try {
    // Create a blob from SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create an image element
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = svgUrl;
    });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Could not create blob from canvas');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(svgUrl);
    }, 'image/png');
  } catch (error) {
    console.error('Error downloading card:', error);
    throw error;
  }
}

/**
 * Converts an image URL to a data URL for use in SVG
 * @param url - Image URL
 * @returns Promise resolving to data URL
 */
async function imageUrlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      // Fallback to original URL if CORS fails
      resolve(url);
    };
    
    img.src = url;
  });
}

/**
 * Downloads a Pokemon card as PNG
 * @param data - Pokemon card data
 */
export async function downloadPokemonCard(data: PokemonCardData): Promise<void> {
  try {
    // Convert image URL to data URL to avoid CORS issues
    const imageDataUrl = await imageUrlToDataUrl(data.imageUrl);
    
    // Create SVG with data URL
    const svgString = createPokemonCardSVG({
      ...data,
      imageUrl: imageDataUrl,
    });
    
    const filename = `${data.name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
    await downloadCardAsPNG(svgString, filename);
  } catch (error) {
    console.error('Error preparing card download:', error);
    throw error;
  }
}

