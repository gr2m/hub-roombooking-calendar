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
  var baseUrl = 'https://www.impacthub.ch/hublebookingapi/api';

  api.setup = function(settings) {
    if (settings && settings.baseUrl) {
      baseUrl = settings.baseUrl;
    }
  };


  api.createBooking = function(properties) {
    return $.ajax({
      type: 'POST',
      url: baseUrl + '/bookings',
      data: properties,
      dataType: 'json'
    });
  };

  api.resendConfirmation = function(bookingId) {
    return $.ajax({
      type: 'POST',
      url: baseUrl + '/bookings/'+bookingId+'/confirmation_notification',
      dataType: 'json'
    });
  }

  api.getReservations = function(options) {
    var query = $.param(options || {});
    return $.ajax({
      type: 'GET',
      url: baseUrl + '/events?'+query,
      dataType: 'json'
    });
  };

  return api;
});
