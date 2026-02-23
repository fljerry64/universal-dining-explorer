const fs = require('fs-extra');
const puppeteer = require('puppeteer');

const urls = fs.readFileSync('dining_urls.txt', 'utf-8')
  .split('\n')
  .filter(Boolean);

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });

  const page = await browser.newPage();
  let restaurants = [];

  for (const url of urls) {
    try {
      console.log('Scraping:', url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      const restaurant = await page.evaluate((url) => {
        const sections = [];
        const headings = document.querySelectorAll('h2, h3');

        headings.forEach(heading => {
          const sectionName = heading.innerText.trim();
          const items = [];

          let sibling = heading.nextElementSibling;
          while (sibling && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
            const text = sibling.innerText || '';
            if (text.includes('$')) {
              const lines = text.split('\n');
              lines.forEach(line => {
                if (line.includes('$')) {
                  const priceMatch = line.match(/\$[0-9]+(\.[0-9]{2})?/);
                  if (priceMatch) {
                    items.push({
                      name: line.replace(priceMatch[0], '').trim(),
                      description: '',
                      price: parseFloat(priceMatch[0].replace('$',''))
                    });
                  }
                }
              });
            }
            sibling = sibling.nextElementSibling;
          }

          if (items.length > 0) {
            sections.push({ name: sectionName, items });
          }
        });

        const nameMatch = url.match(/dining\/([^\/]+)/);
        const name = nameMatch ? nameMatch[1].replace(/-/g,' ') : 'Unknown';

        let park = "Unknown";
        if (url.includes("universal")) park = "Universal Studios Florida";
        if (url.includes("islands")) park = "Islands of Adventure";
        if (url.includes("epic")) park = "Epic Universe";

        return { name, park, sections };
      }, url);

      restaurants.push(restaurant);

    } catch (err) {
      console.log('Failed:', url);
    }
  }

  await browser.close();

  await fs.writeJson('data/menus.json', restaurants, { spaces: 2 });
  console.log('Menus updated.');
})();
