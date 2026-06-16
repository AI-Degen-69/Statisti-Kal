const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  
  // Click formula sheet tab
  const tabs = await page.('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('דף נוסחאות')) {
      await tab.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }
  
  await browser.close();
})();
