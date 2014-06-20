'use strict';

// This script uses [CasperJS](http://casperjs.org/) to open a Google Script (set URL in `scriptUrl`),
// authenticates with `username` & `password`, then updates all the files in `api/*.js`

// TODO:
// - if file does not exist: create it

// CONFIGURATION
// the part between /d/.../edit
var scriptUrl = 'https://script.google.com/a/martynus.net/d/19A1WnHWH-R9O4nkNwoBmYqkX-tDosrra4MXt8y1iakKtWQpifi6Cu8sL/edit';
var username = 'gregor';
var password = 'IwmJ2Kh,ak?!';
var versionDescription = 'auto';
var publishNewVersion = false;

// /CONFIGURATION

var casper = require('casper').create();
var fs = require('fs');
var files = {};
fs.list('api').forEach(function(fileName) {
  if (/\.js$/.test(fileName)) {
    files[fileName] = fs.read('api/' + fileName);
    // Google docs doesn't like tabs
    files[fileName] = files[fileName].replace(/\t/g, '    ');
  }
});

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.73.11 (KHTML, like Gecko) Version/7.0.1 Safari/537.73.11');
casper.options.timeout = 180000; // 3 minutes
// casper.options.stepTimeout = 60000; // 1 minute
// casper.options.waitTimeout = 60000; // 1 minute

// open script URL
casper.start(scriptUrl, function() {
  this.viewport(1280, 1024);
});

// sign in
casper.then(function() {
  this.fill('form', {
    'Email': username,
    'Passwd': password,
  }, true);

  console.log('signing in...');
  this.waitUntilVisible('.project-items-list', function() {
    console.log('signed in.');
  }, function() {
    console.log('error signing in');
    this.capture('debug.png');
  });
});

var googleFileName, code;
var clickOnFileName = function(fileName) {
  return function() {
    this.clickLabel(fileName);
  };
};
var codeIsLoaded = function(fileName) {
  return function() {
    return this.evaluate(function(fileName) {
      var currentTabText = document.querySelector('.gwt-TabLayoutPanelTab-selected').innerText.trim();
      var cursorVisible = document.querySelectorAll('.CodeMirror-cursor').length > 0;
      return currentTabText === fileName && cursorVisible;
    }, fileName);
  };
};
// that makes sure all code gets replaced, otherwise
// it only gets appended
var selectAllCode = function() {
  this.clickLabel('Select all');

  // give it a moment to select the text
  this.wait(1000);
};
var pasteCode = function(code) {
  return function() {
    this.evaluate(function(code) {
      document.querySelector('textarea').value = code;
    }, code);
  };
};
var debugIdx = 1;
var log = function(what) {
  return function() {
    console.log(what);
  };
};
var debug = function() {
  this.capture('debug'+debugIdx+'.png');
  debugIdx++;
};
var inactiveTabsSelector = '.gwt-TabLayoutPanelTab:not(.gwt-TabLayoutPanelTab-selected) .close-button';
var upadeNoticeSelector = '.docs-butterbar-message';

// update all the files.
for (var fileName in files) {
  code = files[fileName];
  // select file in sidebar
  googleFileName = fileName.replace(/\.js$/, '.gs');

  casper.then(clickOnFileName(googleFileName));
  casper.then(log('opening ' + googleFileName));
  casper.waitFor(codeIsLoaded(googleFileName));
  casper.then(log('closing inactive tab'));
  casper.thenClick(inactiveTabsSelector);
  casper.then(selectAllCode);
  // casper.then(debug);
  casper.then(pasteCode(code));
  casper.thenClick('#saveButton');
  casper.waitWhileVisible(upadeNoticeSelector);
  casper.then(log(googleFileName + ' updated.'))
  // casper.then(debug);
}

// publish new version
if (publishNewVersion) {
  casper.then(function() {
    this.clickLabel('Manage versions...');
    console.log('adding version');
  });
  casper.waitUntilVisible('table.versions');
  casper.then(function() {
    this.evaluate(function() {
      document.querySelector('.save-new input').value = versionDescription;
    });
  });
  casper.then(function() {
    this.clickLabel('Save New Version');
    console.log('saving version');
  });
  casper.waitFor(function() {
    return this.evaluate(function(description) {
      return document.querySelector('.save-new input').value !== description;
    }, versionDescription);
  });
  casper.thenClick('.dialog-close-image');
  casper.then(function() {
    console.log('deploying...');
    this.clickLabel('Deploy as web app...');
  });
  casper.waitUntilVisible('.deploy-box .urls');
  casper.then(function() {
    this.evaluate(function() {
      var versionSelect = document.querySelector('.deploy-box select');
      versionSelect.selectedIndex = versionSelect.options.length - 1;
    });
  });
  casper.then(function() {
    this.clickLabel('Update');
  });
  casper.waitForText('This project is now deployed as a web app.');
  casper.then(function() {
    var url = this.evaluate(function() {
      return document.querySelector('.deploy-box input').value;
    });
    console.log('done:\n'+url);
  });
} else {
  casper.then(function() {
    console.log('done.');
  });
}
casper.run();
