/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';

import { configuration } from '../config/configuration';

const make_dir_if_not_exists = dir => {
    if (!fs.existsSync(dir)) {
        console.log(`creating ${dir} directory..`);
        fs.mkdirSync(path.resolve(dir), { recursive: true });
        console.log(`directory ${path.resolve(dir)} created: `, fs.existsSync(path.resolve(dir)));
    }
};

const setup = (config: FullConfig): void => {
    make_dir_if_not_exists('./dist');
    make_dir_if_not_exists('./dist/workers');
    console.log(`playwright checks: 
      directory to run: ${config.rootDir}
      tests to run: ${config.grep}
      environment: ${configuration.environment}
 `);
};

export default setup;
