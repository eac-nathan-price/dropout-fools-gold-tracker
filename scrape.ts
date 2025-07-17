import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { videoMetadata } from './src/data.js';

// Load views.json file
const viewsData = JSON.parse(readFileSync('./src/views.json', 'utf8')).videos;

function getVideoId(url: string) {
  return url.split('/').filter(Boolean).pop();
}

function findParts(str: string) {
  if (str.includes(' ')) return str.split(' ');
  return [str.slice(0, -1), str.slice(-1)];
}

function convertToNumber(str: string) {
  const [number, unit] = findParts(str);
  const numberValue = parseInt(number);
  let unitValue = 1;
  if ('kt'.includes(unit.toLowerCase()[0])) unitValue = 1000;
  else if (unit.toLowerCase()[0] === 'm') unitValue = 1000000;
  return numberValue * unitValue;
}

const scrape = {
  youtube: {
    url: 'https://www.youtube.com/@GameChangerShorts/shorts',
    regex: '{fullTitle}, (\\d+ \\w+)'
  },
  tiktok: {
    url: 'https://www.tiktok.com/@gamechangershow?lang=en',
    selector: '[href="{link}"] .video-count'
  },
  instagram: {
    url: 'https://www.instagram.com/gamechangershow/reels'
  }
};

async function scrapeTikTokViews() {
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('Starting TikTok scraping...');
    
    const results = {} as Record<string, { rawText: string | null, viewCount: number, error?: string }>;
    
    // Process each video in videoMetadata
    for (const [videoId, video] of Object.entries(videoMetadata)) {
      const tiktokLink = video.links.tiktok;
      console.log(`\nProcessing video: ${videoId}`);
      console.log(`TikTok link: ${tiktokLink}`);
      
      try {
        // Go directly to the video page
        await page.goto(tiktokLink, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(res => setTimeout(res, 4000)); // Wait for dynamic content

        // Try to find the view count element by text (e.g., "Views" or similar)
        // TikTok often uses a span with text like "123.4K views"
        // We'll use XPath to find any span containing "views"
        const viewNode = await page.$("//strong[contains(@data-e2e, 'video-views')] | //span[contains(text(), 'views') or contains(text(), 'Views')]");
        let textContent = null;
        if (viewNode) {
          textContent = await page.evaluate(el => el.textContent, viewNode);
        } else {
          // Try fallback: find any element with 'views' in text
          const allSpans = await page.$$('span');
          for (const span of allSpans) {
            const txt = await page.evaluate(el => el.textContent, span);
            if (txt && txt.toLowerCase().includes('views')) {
              textContent = txt;
              break;
            }
          }
        }

        console.log(`Raw text content: "${textContent}"`);
        
        if (textContent) {
          // Extract the number from the text (e.g., "123.4K views")
          const match = textContent.match(/([\d,.]+\s*[KMB]?)/i);
          const numberStr = match ? match[1].replace(/,/g, '') : textContent;
          const viewCount = convertToNumber(numberStr.trim());
          results[videoId] = {
            rawText: textContent.trim(),
            viewCount: viewCount
          };
          console.log(`Converted view count: ${viewCount}`);
        } else {
          console.log('No text content found');
          results[videoId] = {
            rawText: null,
            viewCount: 0
          };
        }
      } catch (error: any) {
        console.log(`Error processing ${videoId}:`, error.message);
        results[videoId] = {
          rawText: null,
          viewCount: 0,
          error: error.message
        };
      }
    }
    
    console.log('\n=== SCRAPING RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

// Run the scraping function
scrapeTikTokViews().catch(console.error);
