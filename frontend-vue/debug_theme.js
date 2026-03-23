import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[Browser PageError] ${error.message} - ${error.stack}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[Network Error] ${response.status()} ${response.url()}`);
    }
  });

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/');
  console.log('Waiting for network idle...');
  await page.waitForLoadState('networkidle');

  console.log('Clicking the light mode toggle...');
  // Find the button inside the theme-switch div with title '切换至浅色模式' or equivalent
  const lightToggleOptions = await page.$$('.theme-switch__option');
  if (lightToggleOptions.length > 0) {
    // Usually the first one is light
    await lightToggleOptions[0].click().catch(e => console.log('Click failed', e));
  } else {
    console.log('Could not find theme toggle button');
  }

  console.log('Waiting 3 seconds to capture logs...');
  await page.waitForTimeout(3000);
  
  // check if app is empty
  const appHtml = await page.evaluate(() => document.getElementById('app').innerHTML);
  if (appHtml.trim() === '') {
    console.log('[DOM] #app is empty!');
  } else {
    console.log('[DOM] #app is NOT empty.');
  }

  await browser.close();
})();
