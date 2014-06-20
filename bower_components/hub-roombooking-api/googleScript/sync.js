/* global BookingsCalendar, BookingsSpreadSheet, config, _, moment, Logger, Browser */

function debug() {
  sync();
}

(function(global) {
  'use strict';

  var DATE_TIME_FORMAT = 'YYYY-MM-DD H:mm';

  function sync() {

    var calendar = new BookingsCalendar(config.calendarId);
    var sheet = new BookingsSpreadSheet(config.spreadsheetKey, config.sheetName);

    var events = calendar.getEventObjectsForNext6Months();
    var sheetReservations = sheet.findAll();
    var text;
    var response;

    var calendarBookingIds = events.map(function(event) {
      return event.getTag('bookingId');
    });
    var sheetBookingIds = sheetReservations.map(function(booking) {
      return booking.bookingId;
    });

    var obsoleteCalendarBookingIds = _.difference(calendarBookingIds, sheetBookingIds);
    var obsoleteSheetBookingIds = _.difference(sheetBookingIds, calendarBookingIds);
    var existingBookingIds = _.intersection(calendarBookingIds, sheetBookingIds);
    var timesChangedInBookingIds = [];

    var eventsMapWithStartEnd = {};
    events.forEach(function(event) {
      var bookingId = event.getTag('bookingId');
      eventsMapWithStartEnd[bookingId] = {
        id: event.getId(),
        title: event.getTitle(),
        start: moment(event.getStartTime()).format(DATE_TIME_FORMAT),
        end: moment(event.getEndTime()).format(DATE_TIME_FORMAT),
        eventObject: event
      };
    });

    var bookingsMapWithStartEnd = {};
    sheetReservations.forEach(function(booking) {
      bookingsMapWithStartEnd[booking.bookingId] = {
        start: booking.day + ' ' + booking.startTime,
        end: booking.day + ' ' + booking.endTime
      };
    });

    Logger.log(JSON.stringify(eventsMapWithStartEnd, '', '  '));
    Logger.log(JSON.stringify(bookingsMapWithStartEnd, '', '  '));
    return;


    existingBookingIds.forEach(function(bookingId) {
      if (eventsMapWithStartEnd[bookingId].start !== bookingsMapWithStartEnd[bookingId].start || eventsMapWithStartEnd[bookingId].end !== bookingsMapWithStartEnd[bookingId].end) {
        timesChangedInBookingIds.push(bookingId);
      }
    });

    if (obsoleteCalendarBookingIds.length) {
      text = '' + obsoleteCalendarBookingIds.length + ' event(s) have been removed from the sheet: ' + obsoleteCalendarBookingIds.join(', ') + '.\nDo you want to remove them from the calendar?';
      Logger.log(text);

      response = Browser.msgBox('Obsolete events', text, Browser.Buttons.YES_NO);
      if (response === 'yes') {
         events.forEach(function(event) {
           var bookingId = event.getTag('bookingId');
           if (obsoleteCalendarBookingIds.indexOf(bookingId) !== -1) {
            event.deleteEvent();
           }
         });
      }
    }
    if (obsoleteSheetBookingIds.length) {
      text = '' + obsoleteSheetBookingIds.length + ' booking(s) do not have an according event: ' + obsoleteSheetBookingIds.join(', ') + '.\nDo you want to remove them from the sheet?';
      Logger.log(text);
      response = Browser.msgBox('Obsolete bookings', text, Browser.Buttons.YES_NO);
      if (response === 'yes') {
        obsoleteSheetBookingIds.forEach(function(id) {
          sheet.remove(id);
        });
      }
    }

    if (timesChangedInBookingIds.length) {
      text = '' + timesChangedInBookingIds.length + ' booking(s) have diverged times in sheet / calendar. Do you want the date/times in calendar events to be adjusted?';
      Logger.log(text);
      response = Browser.msgBox('Diverged Date/Times', text, Browser.Buttons.YES_NO);
      if (response === 'yes') {
        timesChangedInBookingIds.forEach(function(id) {
          var event = eventsMapWithStartEnd[id].eventObject;
          var startTime = moment(eventsMapWithStartEnd[id].start, DATE_TIME_FORMAT).toDate();
          var endTime = moment(eventsMapWithStartEnd[id].end, DATE_TIME_FORMAT).toDate();
          event.setTime(startTime, endTime);
        });
      }
    }


    if (!obsoleteCalendarBookingIds.length && !obsoleteSheetBookingIds.length && !timesChangedInBookingIds.length) {
      Browser.msgBox('No differences between Sheet & Calendar.');
    }
  }

  global.sync = sync;
})(this);



