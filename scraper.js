const fs = require('fs');
const puppeteer = require('puppeteer');

const urlsFile = 'dining_urls.txt';
const outputFile = 'menu_data.json';

// Step 1: Create default URLs file if it doesn't exist
if (!fs.existsSync(urlsFile)) {
  console.log('Created default dining_urls.txt');
  fs.writeFileSync(urlsFile, 'https://example.com/menu1\nhttps://example.com/menu2\n');
}

// Step 2: Read URLs from the file
const urls = fs.readFileSync(urlsFile, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

(async () => {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const allMenus = [];

  for (let url of urls) {
    try {
      console.log(`Visiting ${url} ...`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Example scraping logic
      const menuItems = await page.evaluate(() => {
        const items = [];
        // Update these selectors to match your menu page
        document.querySelectorAll('.menu-item').forEach(el => {
          const name = el.querySelector('.item-name')?.innerText || '';
          const price = el.querySelector('.item-price')?.innerText || '';
          if (name) items.push({ item: name, price });
        });
        return items;
      });

      allMenus.push({ url, menu: menuItems });
      console.log(`Scraped ${menuItems.length} items from ${url}`);

    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(allMenus, null, 2));
  await browser.close();
  console.log(`Scraping completed. Saved data to ${outputFile}`);
})();
