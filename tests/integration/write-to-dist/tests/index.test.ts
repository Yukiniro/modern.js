import path from 'path';
import fs from 'fs';
import type { Page } from 'puppeteer';
import {
  launchApp,
  killApp,
  getPort,
  openPage,
} from '../../../utils/modernTestUtils';

const appDir = path.resolve(__dirname, '../');

function existsSync(filePath: string) {
  return fs.existsSync(path.join(appDir, 'dist', filePath));
}

describe('test dev', () => {
  let appPort: number;
  let app: any;
  let page: Page;
  beforeAll(async () => {
    appPort = await getPort();
    app = await launchApp(appDir, appPort, {}, {});
    page = await openPage();
  });

  afterAll(async () => {
    await killApp(app);
    await page.close();
  });

  it(`should render csr page with memory correctly`, async () => {
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    await page.goto(`http://localhost:${appPort}`, {
      waitUntil: ['networkidle0'],
    });

    const root = await page.$('.description');
    const targetText = await page.evaluate(el => el?.textContent, root);
    expect(targetText?.trim()).toEqual('Get started by editing src/App.tsx');
    expect(errors.length).toEqual(0);
  });

  it('should not get production in dist', async () => {
    expect(existsSync('route.json')).toBeTruthy();
    expect(existsSync('html/main/index.html')).toBeFalsy();
  });
});
