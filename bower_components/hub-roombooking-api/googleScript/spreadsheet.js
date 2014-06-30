/* global SpreadsheetApp, config, formatHours, moment */

(function(global) {
  'use strict';

  var BookingsSpreadSheet = function(spreadsheetKey, sheetName) {
    // publi API
    var api = {};

    var spreadSheetFile = SpreadsheetApp.openById(spreadsheetKey);
    var bookingsSheet = spreadSheetFile.getSheetByName(sheetName);

    // returns all current bookings
    api.findAll = function() {
      return getDataRows().map(rowToBooking);
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
          range = bookingsSheet.getRange('A'+nr+':W'+nr);
          range.setValues([bookingToRow(booking)]);

          return booking;
        }
      }
    };

    // add new booking
    api.add = function(booking) {
      bookingsSheet.appendRow( bookingToRow(booking) );
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
      var lastRowNumber = bookingsSheet.getLastRow();
      if (lastRowNumber < 2) return [];
      return bookingsSheet.getRange(2, 1, bookingsSheet.getLastRow() - 1, bookingsSheet.getLastColumn()).getValues();
    }

    function getHeaderRow() {
      var properties = bookingsSheet.getRange(1, 1, 1, bookingsSheet.getLastColumn()).getValues()[0];

      return properties.map(function(property) {
        return config.headerToPropertyMap[property];
      });
    }

    function formatStartTime(booking) {
      return formatHours(booking.startTime);
    }
    function formatDuration(booking) {
      return formatHours(booking.duration);
    }
    function formatEndTime(booking) {
      var hours = parseFloat(booking.startTime) + parseFloat(booking.duration);
      return formatHours(hours);
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

    function deformatStartTime(startTime) {
      return moment.duration(startTime).asHours();
    }
    function deformatEndTime(endTime) {
      return moment.duration(endTime).asHours();
    }
    function deformatDuration(duration) {
      return moment.duration(duration).asHours();
    }

    function rowToBooking (row) {
      var formatterMap = {
        startTime: deformatStartTime,
        endTime: deformatEndTime,
        duration: deformatDuration
      };
      var formatter;
      var properties = getHeaderRow();
      var record = {};
      var property;
      var value;
      for (var p in properties) {
        property = properties[p];
        value = row[p];
        formatter = formatterMap[property];
        if (formatter) value = formatter(value);
        record[property] = value;
      }

      return record;
    }

    return api;
  };


  global.BookingsSpreadSheet = BookingsSpreadSheet;
}(this));
