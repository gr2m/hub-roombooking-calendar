/* global config, GmailApp */

(function(global) {
  'use strict';

  var GMail = function() {
    // publi API
    var api = {};

    api.send = function(data) {
      var options = {};
      if (config.emailAlias) options.from = config.emailAlias;
      GmailApp.sendEmail(data.recipient, data.subject, data.body, options);
    };

    return api;
  };

  global.GMail = GMail;
}(this));
