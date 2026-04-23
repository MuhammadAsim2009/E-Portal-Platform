const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'sasim4589@gmail.com');
    await page.fill('input[type="password"]', 'Asim@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); 
    
    await page.goto('http://localhost:5173/faculty');
    await page.waitForTimeout(4000);
    
    const bodyText = await page.innerText('body');
    
    console.log('--- DASHBOARD PAGE ---');
    if (bodyText.includes('Introduction to AI')) {
      const parts = bodyText.split('Introduction to AI');
      console.log('Before title:', parts[0].substring(parts[0].length - 150));
      console.log('After title:', parts[1].substring(0, 150));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
