Applying patch for history module
=================================

Fixes two issues in history < v3

* https://github.com/ReactTraining/history/issues/126
* https://github.com/ReactTraining/history/issues/295

Applying patch
-------------
cd node_modules/history
patch -p2 --dry-run -i ../../patch-node-modules-history-v2-for-ie11-c4d-windows.diff
cd -
