prerender-clear-local-storage
======

#Summary
Plugin for Prerender that clears PhantomJS's local storage before each request

```
npm install prerender-clear-local-storage
```

#Getting started
##Set up a custom prerender server
Follow the instructions to create a custom prerender server

[Create a custom prerender server](https://prerender.io/server#customize-it)

##Require the plugin
```
var clearLocalStoragePlugin = require('prerender-clear-local-storage');
```

##Use the plugin
```
server.use(clearLocalStoragePlugin(server));
```

##Configuration
This plugin uses the env variable PHANTOM_LOCAL_STORAGE_PATH to determine what localstorage files to clear.

This defaults to *./LocalStorage/*.localstorage* which unfortunately is useless since I cannot get PhantomJS's "--local-storage-path" to work.

You will need to set this to be the location of the PhantomJS .localstorage files on your machine. See [Phantom Local Storage Locations](#phantom-local-storage-locations) for some suggestions.

Additionally this variable is used as a glob path so you will need to provide the wildcard of your choice. I recommend using *.localstorage so that only .localstorage files are removed.

e.g.
```
PHANTOM_LOCAL_STORAGE_PATH = /Users/user.name//Library/Application Support/Ofi Labs/PhantomJS/*.localstorage
```

You can set this variable via the commandline as shown below or if you use grunt checkout [grunt-env](https://www.npmjs.org/package/grunt-env).
```
PHANTOM_LOCAL_STORAGE_PATH=/path/to/phantom/localstorage/*.localstorage node server.js
```

##Phantom Local Storage Locations
###OSX
```
/Users/user.name//Library/Application Support/Ofi Labs/PhantomJS/
```

###Windows
```
C:\Documents and Settings\user\Local Settings\Application Data\Ofi Labs\PhantomJS
```

#Server Code example (server.js)

```
var prerender = require('prerender');
var clearLocalStoragePlugin = require('prerender-clear-local-storage');

var server = prerender({
  workers: process.env.PHANTOM_CLUSTER_NUM_WORKERS || 1,
  iterations: process.env.PHANTOM_WORKER_ITERATIONS || 10,
  phantomBasePort: process.env.PHANTOM_CLUSTER_BASE_PORT || 12300,
  messageTimeout: process.env.PHANTOM_CLUSTER_MESSAGE_TIMEOUT,
});

server.use(prerender.blacklist());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(clearLocalStoragePlugin(server));

server.start();
```