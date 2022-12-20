# Playwright tests

## Prerequisites

- Node.js and npm
- Java 17
- [jq](https://github.com/stedolan/jq/wiki/Installation)
- Docker Engine 19.03.0+
- Preferably the latest docker-compose

## Usage

1. Clone the repo and go to its directory

1. Build ODD Platform's docker image locally:

       ./gradlew jibDockerBuild -x test --image odd-platform:e2e-latest-build
   or use the following command if your environment is ARM based

       ./gradlew jibDockerBuild -x test --image odd-platform:e2e-latest-build -PcontainerBuildArm=true

1. Go to `tests` directory

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

            npm run test:ci

1. Tear down all parts of the ODD platform (i.e. stop and remove containers):

        npm run odd-down

## Useful commands

- `npm run lint` to run linter
- `npm run format` to run code formatter
- `npm run lint:fix` to fix fixable linter issues and run code formatter

## Setup user friendly development environment

1. Install the ESLint plugin to lint your code
    - [ESLint plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [ESLint plugin for IntelliJ IDEA](https://www.jetbrains.com/help/idea/eslint.html) (Note: The plugin is available only in IntelliJ IDEA Ultimate)
    - [ESLint plugin for WebStorm](https://www.jetbrains.com/help/webstorm/eslint.html)


1. Install the Prettier plugin to automatically format your code on Save
    - [Prettier plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    - [Prettier plugin for IntelliJ IDEA](https://www.jetbrains.com/help/idea/prettier.html) (Note: The plugin is available only in IntelliJ IDEA Ultimate)
    - [Prettier plugin for WebStorm](https://www.jetbrains.com/help/webstorm/prettier.html)

1. Open a project from the "tests" directory, so that the ESLint and Prettier plugins work correctly in the text editor

## Notes

1. Do the following if you want to run tests in CI to check your changes in your feature branch **without creating a pull request**:
    - create a feature branch with a name that starts with "debug/" (for instance: `debug/my_wonderful_tests`)
