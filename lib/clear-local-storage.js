/**
 * phantom-clear-local-storage
 *
 * Prerender.io plugin that will clear localStorage on each request
 *
 *
 * @author justin.fiedler
 *
 * @copyright (c) 2014 Hightail Inc. All Rights Reserved
 */

var _ = require('lodash'),
    fs = require('fs'),
    Q = require('q'),
    glob = require('glob');

var PHANTOM_LOCAL_STORAGE_PATH = process.env.PHANTOM_LOCAL_STORAGE_PATH || './LocalStorage/*.localstorage';

function clearLocalStorage() {
  console.log("clearLocalStorage");
  var deferred = Q.defer();

  glob(PHANTOM_LOCAL_STORAGE_PATH, function (err, filePaths) {
    //var page = 'http_localhost_5000';

    if (err) {
      deferred.reject(err);
    } else {
      //Load each SASS file and concat them
      _.each(filePaths, function(filePath) {
        console.log('Removing filePath', filePath);
        fs.unlinkSync(filePath);
      });

      //console.log('Removed ' + filePaths);
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function addPhantomModifications(page) {
  /**
   * onConsoleMessage Handler
   */
  page.set('onConsoleMessage', function () {
    var args = _.toArray(arguments);
    args.unshift('[phantom.page.console]');
    console.log.apply(this, args);
  });

  /**
   * onLoadStarted Handler
   */
  page.set('onLoadStarted', function () {
    console.log('[phantom.page.onLoadStarted]');

    //Clearing local storage causes an error here, too early I guess
    //prerenderPage.evaluate(function () {
    //  localStorage.clear();
    //});
  });

  /**
   * onLoadStarted Handler
   */
  page.set('onLoadFinished', function () {
    console.log('[phantom.page.onLoadFinished]');
    //console.log(this);

    page.evaluate(function () {
      if (localStorage) {
        localStorage.clear();
      }
    });
  });
}

var phantomClearLocalStoragePlugin = function (prerenderServer) {

  return {
    init: function() {
      //clearLocalStorage();
    },
    beforePhantomRequest: function(req, res, next) {
      console.log('[beforePhantomRequest]');

      clearLocalStorage().then(
        function() {
          //localStorage files have been successfully deleted
          next();
        },
        function(error) {
          console.log("WARNING: Unable to clear localStorage!!!");
          next();
        }
      );
    },
    onPhantomPageCreate: function(page, req, res, next) {
      console.log('[onPhantomPageCreate]');

      //var prerenderPage = req.prerender.page;
      //addPhantomModifications(page);

      next();
    },
    beforeSend: function(req, res, next) {
      console.log('[beforeSend]');

      //We need to kill Phantom because it appears to kill localStorage in memory...
      req.on("end", function() {
        console.log("End");
        //do a timeout, cause it makes things work
        setTimeout(function() {
          prerenderServer._killPhantomJS();
        }, 100);
      });

      next();
    }
  }
};

module.exports = phantomClearLocalStoragePlugin;