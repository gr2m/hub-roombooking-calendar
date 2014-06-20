/* global SpreadsheetApp, generateId, config */

(function(global) {
  'use strict';

  var BookingsSpreadSheet = function(spreadsheetKey, sheetName) {
    // publi API
    var api = {};

    var spreadSheetFile = SpreadsheetApp.openById(spreadsheetKey);
    var bookingsSheet = spreadSheetFile.getSheetByName(sheetName);

    // returns all current bookings
    api.findAll = function() {
      var properties = getHeaderRow();

      var rows = getDataRows();
      var data = [];
      for (var r = 0, l = rows.length; r < l; r++) {
        var row = rows[r];
        var record = {};
        for (var p in properties) {
          record[properties[p]] = row[p];
        }
        data.push(record);
      }
      return data;
    };

    // returns only one booking
    api.find = function(id) {
      var bookings = api.findAll();
      var booking;
      for (var i = 0; i < bookings.length; i++) {
        booking = bookings[i];
        if (booking.bookingId === id) {
          return booking;
        }
      }
    };

    // update an existing booking
    api.update = function(id, properties) {
      var bookings = api.findAll();
      var booking;
      var range, nr;
      for (var i = 0; i < bookings.length; i++) {
        booking = bookings[i];
        if (booking.bookingId === id) {

          booking.changed = {};
          for (var key in properties) {
            if (booking[key] !== properties[key]) {
              booking.changed[key] = booking[key];
              booking[key] = properties[key];
            }
          }
          nr = i + 2; // starting at one + header row
          range = bookingsSheet.getRange('A'+nr+':V'+nr);
          range.setValues([bookingToRow(booking)]);

          return booking;
        }
      }
    };

    // add new booking
    api.add = function(booking) {

      booking.id = generateId();
      booking.timestamp = (new Date()).toISOString().substr(0,10);
      booking.status = config.states[0];

      bookingsSheet.appendRow( bookingToRow(booking) );

      return booking;
    };

    //
    api.remove = function(id) {
      var bookings = api.findAll();
      var booking;
      for (var i = 0; i < bookings.length; i++) {
        booking = bookings[i];
        if (booking.bookingId === id) {

          // https://developers.google.com/apps-script/reference/spreadsheet/sheet?hl=de#deleteRow%28Integer%29
          // rows start at 1. And row #1 is the header row
          bookingsSheet.deleteRow( i + 2);
          return true;
        }
      }

      return false;
    };

    function getDataRows() {
      return bookingsSheet.getRange(2, 1, bookingsSheet.getLastRow() - 1, bookingsSheet.getLastColumn()).getValues();
    }

    function getHeaderRow() {
      var properties = bookingsSheet.getRange(1, 1, 1, bookingsSheet.getLastColumn()).getValues()[0];

      return properties.map(function(property) {
        return config.headerToPropertyMap[property];
      });
    }

    function formatTime(hours) {
      var minutes;

      hours = parseFloat(hours);
      minutes = hours % 1 === 0.5 ? '30' : '00';
      return [hours,minutes].join(':');
    }
    function formatStartTime(booking) {
      return formatTime(booking.startTime);
    }
    function formatDuration(booking) {
      return formatTime(booking.duration);
    }

    function formatEndTime(booking) {
      var hours = parseFloat(booking.startTime) + parseFloat(booking.duration);
      return formatTime(hours);
    }

    function bookingToRow (booking) {
      var row = [];
      var headerKey;
      var value;
      var formatterMap = {
        startTime: formatStartTime,
        endTime: formatEndTime,
        duration: formatDuration
      };
      var formatter;

      //
      booking.bookingId = booking.bookingId || booking.id;

      for(headerKey in config.PropertyToHeaderMap) {
        value = booking[headerKey] || '';
        formatter = formatterMap[headerKey];

        if (formatter) value = formatter(booking);

        row.push(value);
      }

      return row;
    }

    return api;
  };

  global.BookingsSpreadSheet = BookingsSpreadSheet;
}(this));
