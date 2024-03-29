# ******* DEPRECATED REPOSITORY *******
This repository has reached its EOL and has been deprecated and will be publicly removed in September 2023. Users will still be able to download the latest version under demand by sending a request message to  [support@ftrack.com](mailto:support@ftrack.com).

We highly encourage our users to use the new integrations framework which supports the latest versions of the most used DCC and is much easier to customize and extend.
You can find the latest downloadable version of the framework in the plugin manager of ftrack connect <https://go.ftrack.com/connect-download>.

Framework documentation: <https://ftrackhq.github.io/integrations/libs/framework-core/>

All our maintained code is now under a monorepo repository that as of the date of this message (26/05/2023) is still private as we are still doing some migration and setup jobs. We are working hard to open it publicly as soon as we can. You will be able to find the monorepo at: <https://github.com/ftrackhq/integrations>. 

Don't hesitate on contact our support team if you have any inquiries: [support@ftrack.com](mailto:support@ftrack.com)

# ftrack connect spark

ftrack-connect-spark provides a base to build ftrack integrations using
web technologies and a shared interface which is used across
integrations in supported applications.

## Setting up node environment

You will need a recent version of node (5+) with npm installed. It is
highly recommended that you also install a version manager for node,
such as [n (Mac OS)](https://github.com/tj/n) or [nodist
(windows)](https://github.com/marcelklehr/nodist). It enables you can
use different node versions in different projects.

### Mac OS

1.  Install [homebrew](http://brew.sh/), unless already installed.

2.  Ensure homebrew is installed correctly:

        brew doctor

3.  Install latest node and npm versions:

        brew install node

4.  Install n globally:

        npm install -g n

5.  Install latest stable version:

        n stable

### Windows

TODO

## Setting up development environment

1.  Checkout this repository

2.  Install dependencies (will run for a few minutes for the first
    setup):

        npm install

3.  Start development server

    > npm start

### Commands

Start for development:

    npm start # or
    npm run serve

Start the dev-server with the adobe entry in development mode:

    npm run serve:adobe

Start the dev-server with the cinema4d entry in development mode:

    npm run serve:cinema4d

Start the dev-server with the dist version:

    npm run serve:dist

Just build the dist version and copy static files:

    npm run dist

Run unit tests:

    npm test

Run the unit tests continuously (repeat the test when code changes are
saved):

    npm run test:watch

Lint all files in source (also automatically done after tests are run):

    npm run lint

Clean up the dist directory:

    npm run clean

Just copy the static assets:

    npm run copy

## Configuring your editor

If your editor supports [EditorConfig](http://editorconfig.org/), the
configuration should be picked up automatically. Plugins for several
editors such as Sublime Text, Visual Studio Code and Atom exists.

Syntax highlighting for JavaScript extensions should be extended to add
support for ES2015 and JSX language extensions through Babel. For
sublime text, install the <span class="title-ref">Babel</span> package
and change the default syntax used for .js files, by navigating to <span
class="title-ref">View -\> Syntax -\> Open all with current extension as
-\> Babel -\> JavaScript (Babel)</span>.

Next up, you should make sure your editor supplies you with linting
information. For Sublime Text, install the following packages:

-   Sublime-Linter
-   SublimeLinter-contrib-eslint

## Technology used

-   [Webpack](https://webpack.github.io/) module loader with development
    server with loader for [CSS
    Modules](https://github.com/css-modules/css-modules).
-   [Babel](babeljs.io) JavaScript compilter with
    [es2015](https://babeljs.io/docs/learn-es2015/) and
    [react](https://babeljs.io/docs/plugins/preset-react/) presets.
-   [React](https://facebook.github.io/react/), library for building
    user interfaces.
-   [Redux](redux.js.org), a predictable state container.
-   [React router](https://github.com/reactjs/react-router) with [react
    router redux](https://github.com/reactjs/react-router-redux)
    provides a routing solution.
-   [React toolbox](react-toolbox.com), component library implementing
    [material design](https://design.google.com/) as react components.
-   [ESLint](eslint.org) linter for JS and JSX with [Airbnb JavaScript
    Style Guide](https://github.com/airbnb/javascript) configuration.
-   Testing using [karma](https://github.com/karma-runner/karma),
    [Mocha](https://mochajs.org/) and [Chai](chaijs.com/).

## Project structure

The project directory structure looks like the following:

    .
    ├── .babelrc               # Babel configuration file
    ├── .editorconfig          # Editor configuration to follow style guide.
    ├── .eslintrc              # Linter configuration, based on AirBnb's config.
    ├── config                 # Webpack configuration files
    ├── coverage               # Code coverage reports
    ├── dist                   # Built application for distribution.
    ├── karma.conf.js          # Karma test runner configuration.
    ├── yarn.lock              # Locked package dependencies.
    ├── package.json           # Package configuration and dependencies.
    ├── server.js              # Webpack dev server entry point
    ├── source                 # Application source code
    │   ├── action             # Redux actions
    │   ├── application        # Application-specific behavior and entry points
    │   ├── component          # Presentational, "dumb", react components
    │   ├── container          # Components that provide context (e.g. Redux Provider)
    │   ├── layout             # Components that dictate major page structure
    │   ├── reducer            # Redux reducers
    │   ├── route              # Application route definitions
    │   ├── store              # Redux store
    │   ├── saga               # Sagas orchestrate asynchronous operations.
    │   ├── static             # Static assets (images, etc..)
    │   ├── style              # Application-wide styles
    │   ├── view               # Components that live at a route
    │   └── index.js           # Application bootstrap and rendering
    ├── test                   # Unit tests
    └── webpack.config.js      # Loads webpack configuration based on environment.

### Layouts, views and components

A Layout is something that describes an entire page structure, such as a
fixed navigation, viewport, sidebar, and footer. Most applications will
probably only have one layout, but keeping these components separate
makes their intent clear. Views are components that live at routes, and
are generally rendered within a Layout. What this ends up meaning is
that, with this structure, nearly everything inside of Components ends
up being a dumb component.

## Webpack

The webpack configuration file, <span
class="title-ref">webpack.config.js</span> will build a configuration
for one of three environments: dev, dist or test. The actual
configuration resides within the <span class="title-ref">config</span>
directory.

In the configuration, we make use of [resolve
alias](http://webpack.github.io/docs/configuration.html#resolve-alias)
to enable you to import modules relative to source root.

## Styles

Both .scss and .css file extensions are supported out of the box and are
configured to use CSS Modules. After being imported, styles will be
processed with PostCSS for minification and autoprefixing, and will be
extracted to a .css file during production builds.

## Testing

Any Javascript file starting with <span class="title-ref">test\_</span>
in <span class="title-ref">test/</span> will be treated as a unit test
and be run by Karma.

When running tests, coverage information (provided via Istanbul) will
also be written into the coverage/ directory.

## Development

### ftrack API credentials

Specify your API credentials in a file, <span
class="title-ref">source/ftrack_api_credentials.json</span>. It should
contain the following keys:

    {
        "serverUrl": "",
        "apiUser": "",
        "apiKey": ""
    }

### Hot module replacement

React components, CSS styles and redux reducers will be replaced when
modified when running in development mode. Hot module replacement is a
feature provided with
[webpack](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)
and allows faster development iterations by replacing modules while an
application is running without reloading. A babel preset, [react
hmr](https://github.com/danmartinez101/babel-preset-react-hmre),
provides transformations necessary to support replacing components.

### Redux development tools

[Redux DevTools
Extension](https://github.com/zalmoxisus/redux-devtools-extension)
provides [Redux DevTools](https://github.com/gaearon/redux-devtools) as
a Chrome extension. This allows you to inspect redux actions and states
and go back in time and replay actions.
