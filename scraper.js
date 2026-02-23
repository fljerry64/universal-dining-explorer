const fs = require('fs');
const puppeteer = require('puppeteer');

const urlsFile = 'dining_urls.txt';
const outputFile = 'data/menus.json';

// Make sure data folder exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Create default URLs file if missing
if (!fs.existsSync(urlsFile)) {
  console.log('Created default dining_urls.txt');
  fs.writeFileSync(
    urlsFile,
    'https://www.universalorlando.com/web/en/us/things-to-do/dining/leaky-cauldron/menu.html\n'
  );
}

// Read URLs
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
      console.log(`Visiting ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

      const menuItems = await page.evaluate(() => {
        const items = [];

        const names = document.querySelectorAll('.menu-course-title');
        const descriptions = document.querySelectorAll('.menu-description');
        const dollars = document.querySelectorAll('.u_price_dollar');
        const cents = document.querySelectorAll('.u_price_cent');

        for (let i = 0; i < names.length; i++) {
          const name = names[i]?.innerText.trim() || '';
          const description = descriptions[i]?.innerText.trim() || '';
          const dollar = dollars[i]?.innerText.trim() || '';
          const cent = cents[i]?.innerText.trim() || '';

          const price = dollar ? `$${dollar}.${cent}` : '';

          if (name) {
            items.push({
              item: name,
              description: description,
              price: price
            });
          }
        }

        return items;
      });

      const restaurantName =
        url.split('/dining/')[1]?.split('/')[0]?.replace(/-/g, ' ') || url;

      console.log(`Scraped ${menuItems.length} items from ${restaurantName}`);

      allMenus.push({
        name: restaurantName,
        menu: menuItems
      });

    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(allMenus, null, 2));
  await browser.close();

  console.log(`Done! Data saved to ${outputFile}`);
})();
