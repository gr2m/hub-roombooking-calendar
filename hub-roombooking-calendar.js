/* global define */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], function () {
      root.hubRoombookingCalendar = factory();
      return root.hubRoombookingCalendar;
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.hubRoombookingCalendar = factory();
  }
})(this, function () {
  'use strict';
  var api = {};

  api.funk = function funk () {
    alert('funk!');
  };

  return api;
});
