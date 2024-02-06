
## Requirements
- [nvm](https://github.com/nvm-sh/nvm) with installed [Node.js](https://nodejs.org/en/) of expected version (check `.nvmrc`)
- [pnpm](https://pnpm.io/installation) - package manager
- [Docker](https://www.docker.com/) - to run openapi generator.

## Initialize application

In the project directory, you can run:

### `pnpm install`
Installs project dependencies

### `pnpm run generate`
Generates an openApi client in `src/generated-sources` from API specification `prospectlog-specification//openapi.yml`

**Note for Windows users:** You need to set a bash compatible shell, for example: `npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"`

## Run application in dev mode

### `pnpm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `pnpm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Create build

### `pnpm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

**This step also includes openApi client generation**

## Build docker image

### `docker build -f Dockerfile ..`

Builds docker image based on Nginx with static JS application. For the build-context need to use the parent directory as we use shared OpenAPI specification.

## Links

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

This project uses [Material UI](https://material-ui.com/) components.
