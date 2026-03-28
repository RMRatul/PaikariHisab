const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  // Login
  await page.type('input[placeholder="admin or admin@email.com"]', 'admin');
  await page.type('input[type="password"]', 'admin123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  const pagesToCapture = [
    { route: '/', name: 'dashboard' },
    { route: '/customers', name: 'customers' },
    { route: '/suppliers', name: 'suppliers' },
    { route: '/inventory', name: 'inventory' },
    { route: '/sales', name: 'sales' },
    { route: '/returns', name: 'returns' },
    { route: '/purchases', name: 'purchases' },
    { route: '/expenses', name: 'expenses' },
    { route: '/reports', name: 'reports' },
    { route: '/settings', name: 'settings' }
  ];

  for (const item of pagesToCapture) {
    console.log(`Capturing ${item.name}...`);
    try {
      await page.goto(`http://localhost:3000${item.route}`, { waitUntil: 'networkidle0' });
      // Wait for any data fetching/animations to complete
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `public/screenshots/${item.name}.png`, fullPage: false }); // Disable fullpage so the sidebar stays neat
    } catch (err) {
      console.log(`Failed to capture ${item.name}: ${err.message}`);
    }
  }

  console.log('All screenshots captured!');
  await browser.close();
})();
