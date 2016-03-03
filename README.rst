####################
ftrack connect spark
####################

ftrack-connect-spark provides a base to build ftrack integrations using web
technologies and a shared interface which is used across integrations
in supported applications.

Setting up node environment
===========================

You will need a recent version of node (5+) with npm installed. It is highly
recommended that you also install a version manager for node, such as
`n (Mac OS) <https://github.com/tj/n>`_ or
`nodist (windows) <https://github.com/marcelklehr/nodist>`_. It enables you
can use different node versions in different projects.

Mac OS
------

1. Install `homebrew <http://brew.sh/>`_, unless already installed.
2. Ensure homebrew is installed correctly::

    brew doctor

3. Install latest node and npm versions::

    brew install node

4. Install n globally::

    npm install -g n

5. Install latest stable version::

    n stable

Windows
-------

TODO

Setting up development environment
==================================

1. Checkout this repository
2. Install dependencies (will run for a few minutes for the first setup)::

    npm install

3. Start development server

    npm start

Commands
--------

Start for development::

    npm start # or
    npm run serve

Start the dev-server with the dist version::

    npm run serve:dist

Just build the dist version and copy static files::

    npm run dist

Run unit tests::

    npm test

Run the unit tests continuously (repeat the test when code changes are saved)::

    npm run test:watch

Lint all files in source (also automatically done after tests are run)::

    npm run lint

Clean up the dist directory::

    npm run clean

Just copy the static assets::

    npm run copy

Configuring your editor
=======================

If your editor supports `EditorConfig <http://editorconfig.org/>`_, the
configuration should be picked up automatically. Plugins for several editors
such as Sublime Text, Visual Studio Code and Atom exists.

Syntax highlighting for JavaScript extensions should be extended to add support
for ES2015 and JSX language extensions through Babel.
For sublime text, install the `Babel` package and change the default syntax used
for .js files, by navigating to `View -> Syntax -> Open all with current
extension as -> Babel -> JavaScript (Babel)`.

Next up, you should make sure your editor supplies you with linting information.
For Sublime Text, install the following packages:

* Sublime-Linter
* SublimeLinter-contrib-eslint

Technology used
===============

* `Webpack <https://webpack.github.io/>`_ module loader with development server
  with loader for `CSS Modules <https://github.com/css-modules/css-modules>`_.
* `Babel <babeljs.io>`_ JavaScript compilter with
  `es2015 <https://babeljs.io/docs/learn-es2015/>`_ and
  `react <https://babeljs.io/docs/plugins/preset-react/>`_ presets.
* `React <https://facebook.github.io/react/>`_, library for building user
  interfaces.
* `Redux <redux.js.org>`_, a predictable state container.
* `React router <https://github.com/reactjs/react-router>`_ with
  `react router redux <https://github.com/reactjs/react-router-redux>`_
  provides a routing solution.
* `React toolbox <react-toolbox.com>`_, component library implementing
  `material design <https://design.google.com/>`_ as react components.
* `ESLint <eslint.org>`_ linter for JS and JSX with
  `Airbnb JavaScript Style Guide <https://github.com/airbnb/javascript>`_
  configuration.
* Testing using `karma <https://github.com/karma-runner/karma>`_,
  `Mocha <https://mochajs.org/>`_ and `Chai <chaijs.com/>`_.

Project structure
=================

The project directory structure looks like the following::

  .
  ├── .babelrc               # Babel configuration file
  ├── .editorconfig          # Editor configuration to follow style guide.
  ├── .eslintrc              # Linter configuration, based on AirBnb's config.
  ├── config                 # Webpack configuration files
  ├── coverage               # Code coverage reports
  ├── dist                   # Built application for distribution.
  ├── karma.conf.js          # Karma test runner configuration.
  ├── npm-shrinkwrap.json    # Locked package dependencies.
  ├── package.json           # Package configuration and dependencies.
  ├── server.js              # Webpack dev server entry point
  ├── source                 # Application source code
  │   ├── action             # Redux actions
  │   ├── component          # Presentational, "dumb", react components
  │   ├── container          # Components that provide context (e.g. Redux Provider)
  │   ├── layout             # Components that dictate major page structure
  │   ├── reducer            # Redux reducers
  │   ├── route              # Application route definitions
  │   ├── store              # Redux store
  │   ├── static             # Static assets (images, etc..)
  │   ├── style              # Application-wide styles
  │   ├── view               # Components that live at a route
  │   └── index.js           # Application bootstrap and rendering
  ├── test                   # Unit tests
  └── webpack.config.js      # Loads webpack configuration based on environment.


Layouts, views and components
-----------------------------

A Layout is something that describes an entire page structure, such as a fixed
navigation, viewport, sidebar, and footer. Most applications will probably only
have one layout, but keeping these components separate makes their intent clear.
Views are components that live at routes, and are generally rendered within a
Layout. What this ends up meaning is that, with this structure, nearly
everything inside of Components ends up being a dumb component.

Webpack
=======

The webpack configuration file, `webpack.config.js` will build a configuration
for one of three environments: dev, dist or test. The actual configuration
resides within the `config` directory.

In the configuration, we make use of
`resolve alias <http://webpack.github.io/docs/configuration.html#resolve-alias>`_
to enable you to import modules relative to source root.

Styles
======

Both .scss and .css file extensions are supported out of the box and are
configured to use CSS Modules. After being imported, styles will be processed
with PostCSS for minification and autoprefixing, and will be extracted to a .css
file during production builds.

Testing
=======

Any file ending with `Test.js` in `test/` will be treated as a unit test and
be run by Karma.

When running tests, coverage information (provided via Istanbul) will also
be written into the coverage/ directory.

Updating dependencies
=====================

Use `npm-check-updates <https://www.npmjs.com/package/npm-check-updates>`_ to
suggest the latest versions::

    $ npm-check-updates

Update package.json with new versions if you agree::

    $ npm-check-updates -u

Do a clean install::

    $ rm -rf node_modules
    $ npm install

Use `npm shrinkwrap <https://docs.npmjs.com/cli/shrinkwrap>`_ exact versions
to npm config file `npm-shrinkwrap.json`::

    $ rm npm-shrinkwrap.json
    $ npm shrinkwrap
