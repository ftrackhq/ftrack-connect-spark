####################
ftrack connect spark
####################

ftrack-connect-spark provides a base to build ftrack integrations using web
technologies and a shared interface which is used across integrations
in supported applications.


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
