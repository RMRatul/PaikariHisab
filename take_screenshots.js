const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  // Login
  await page.type('input[placeholder="admin or admin@email.com"]', 'admin');
  await page.type('input[type="password"]', 'admin123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log('Logged in. Capturing Dashboard...');
  // Wait a bit for charts/data to load
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'public/screenshots/dashboard.png', fullPage: true });

  console.log('Navigating to Inventory...');
  await page.goto('http://localhost:3000/dashboard/inventory', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/screenshots/inventory.png', fullPage: true });

  console.log('Navigating to Sales...');
  await page.goto('http://localhost:3000/dashboard/sales', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'public/screenshots/sales.png', fullPage: true });

  console.log('Done!');
  await browser.close();
})();
