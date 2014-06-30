/* global define */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function ($) {
      root.hubRoombookingApi = factory($);
      return root.hubRoombookingApi;
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.hubRoombookingApi = factory(root.jQuery);
  }
})(this, function ($) {
  'use strict';

  var api = {};
  var baseUrl;

  api.setup = function(settings) {
    var googleScriptId = settings.googleScriptId;
    baseUrl = 'https://script.google.com/macros/s/'+googleScriptId+'/exec?callback=?';
  };

  api.createBooking = function(properties) {
    var params = $.param(properties);
    return $.getJSON(baseUrl + '&action=addBooking&'+ params).then(pipeResponse);
  };

  api.findBooking = function(id) {
    return $.getJSON(baseUrl + '&action=getBooking/' + id).then(pipeResponse);
  };

  api.confirmBooking = function(id) {
    return $.getJSON(baseUrl + '&action=confirmBooking/' + id).then(pipeResponse);
  };

  api.cancelBooking = function(id) {
    return $.getJSON(baseUrl + '&action=cancelBooking/' + id).then(pipeResponse);
  };

  api.updateBooking = function(id, properties) {
    var params = $.param( properties );
    return $.getJSON(baseUrl + '&action=updateBooking/' + id + '&' + params).then(pipeResponse);
  };

  api.getReservations = function(options) {
    var url = baseUrl + '&action=getReservations';
    if (! options) options = {};
    if (options.ignore) url += '&ignore=' + options.ignore;
    return $.getJSON(url).then(pipeResponse);
  };

  function pipeResponse(response) {
    var error;
    var defer = $.Deferred();
    var args = Array.prototype.slice.call(arguments);

    if (response.error) {
      error = new Error(response.error.message);
      $.extend(error, response.error);
      return defer.reject(error).promise();
    }

    defer.resolve.apply(defer, args);
    return defer.promise();
  }

  return api;
});
