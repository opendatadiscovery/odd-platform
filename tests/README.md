# Playwright tests

## Prerequisites

- Node.js and npm
- Docker Engine 19.03.0+
- Preferably the latest docker-compose

## Usage

1. Clone the repo

1. Go to `tests` dir

1. Install dependencies:

        npm install

1. Install browsers:

        npx playwright install --with-deps chromium

1. Configure and run ODD Platform (inside the docker containers):

        npm run odd-up

    Note: Check the instructions in Step 1 of [this manual](../docker/README.md) if you encounter any problems.

1. Run test suite:

    - in headful mode:

            npm test

    - or in headless mode:

            npm run test-ci

1. Tear down all parts of the ODD platform (i.e. stop and remove containers):

        npm run odd-down
