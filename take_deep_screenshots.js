const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  await page.type('input[placeholder="admin or admin@email.com"]', 'admin');
  await page.type('input[type="password"]', 'admin123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  const deepPages = [
    { route: '/sales/new', name: 'new-sale' },
    { route: '/purchases/new', name: 'new-purchase' },
    { route: '/customers/new', name: 'new-customer' }
  ];

  for (const item of deepPages) {
    console.log(`Capturing ${item.name}...`);
    try {
      await page.goto(`http://localhost:3000${item.route}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `public/screenshots/${item.name}.png` });
    } catch(err) {
      console.log(`Error on ${item.name}:`, err);
    }
  }

  // To capture a memo, we navigate to /sales and click the first table row's view link
  console.log('Attempting to capture a Sales Memo...');
  try {
    await page.goto('http://localhost:3000/sales', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    // Find an href that matches an ID pattern (excluding /new)
    const links = await page.$$eval('a[href^="/sales/"]', els => els.map(e => e.getAttribute('href')));
    const validLink = links.find(l => !l.includes('/new'));
    if (validLink) {
      await Promise.all([
        page.goto(`http://localhost:3000${validLink}`),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `public/screenshots/sale-memo.png` });
      console.log('Sale memo captured!');
    } else {
      console.log('No existing sales found to capture memo.');
    }
  } catch(err) {
    console.log('Error capturing memo', err);
  }
  
  // Capture customer ledger
  console.log('Attempting to capture Customer Ledger...');
  try {
    await page.goto('http://localhost:3000/customers', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const links = await page.$$eval('a[href^="/customers/"]', els => els.map(e => e.getAttribute('href')));
    const validLink = links.find(l => !l.includes('/new'));
    if (validLink) {
      await Promise.all([
        page.goto(`http://localhost:3000${validLink}`),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `public/screenshots/customer-ledger.png` });
      console.log('Customer ledger captured!');
    } else {
      console.log('No existing customers found for ledger.');
    }
  } catch(err) {
    console.log('Error capturing customer ledger', err);
  }

  console.log('Done deep deep capturing!');
  await browser.close();
})();
