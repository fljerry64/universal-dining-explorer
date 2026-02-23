// scraper.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// --- Step 1: Setup paths for data folder and URLs file ---
const dataFolder = path.join(__dirname, 'data');
const urlsFilePath = path.join(dataFolder, 'dining_urls.txt');

// --- Step 2: Ensure the data folder exists ---
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

// --- Step 3: Ensure the URLs file exists ---
if (!fs.existsSync(urlsFilePath)) {
  // Default URLs — replace with real ones if needed
  fs.writeFileSync(urlsFilePath, 'https://example.com/menu1\nhttps://example.com/menu2');
  console.log('Created default dining_urls.txt');
}

// --- Step 4: Read URLs from the file ---
const urls = fs.readFileSync(urlsFilePath, 'utf-8')
               .split('\n')
               .filter(line => line.trim() !== '');

console.log(`Loaded ${urls.length} URLs:`)
urls.forEach((url, index) => console.log(`${index + 1}: ${url}`));

// --- Step 5: Puppeteer scraping function ---
(async () => {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (let url of urls) {
    try {
      console.log(`Visiting: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Example: grab the page title
      const title = await page.title();
      console.log(`Page title: ${title}`);
    } catch (err) {
      console.error(`Failed to visit ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Scraping finished.');
})();
