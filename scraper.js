const fs = require('fs');
const puppeteer = require('puppeteer');

// Path to the URLs file
const urlsFile = 'dining_urls.txt';

// Check if the file exists; if not, create a default one
if (!fs.existsSync(urlsFile)) {
  console.log('Created default dining_urls.txt');
  fs.writeFileSync(urlsFile, 'https://example.com/menu1\nhttps://example.com/menu2\n');
}

// Read the URLs
const urls = fs.readFileSync(urlsFile, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

console.log(`Loaded ${urls.length} URL${urls.length !== 1 ? 's' : ''}:`);
urls.forEach((url, i) => console.log(`${i + 1}: ${url}`));

(async () => {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`Visiting ${url} ...`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Example: grab the page title (replace this with your scraping logic)
      const title = await page.title();
      console.log(`Title of page ${i + 1}: ${title}`);
      
      // TODO: Add code here to extract menu items and save them if needed

    } catch (err) {
      console.error(`Error visiting ${url}:`, err);
    }
  }

  await browser.close();
  console.log('Scraping completed.');
})();
