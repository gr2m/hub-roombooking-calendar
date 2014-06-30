/* global CalendarApp, moment */

(function(global) {
  'use strict';

  var BookingsCalendar = function(calendarId) {
    // publi API
    var api = {};

    var calendar = CalendarApp.getCalendarById(calendarId);

    // add new booking
    // ADD BOOKING TO SPREADSHEET & CALENDAR
    api.addBooking = function(booking) {

      var atts = bookingToEvent(booking);

      var event = calendar.createEvent(atts.subject, atts.startTime, atts.endTime, {
        location: atts.location,
        // guests: atts.guests,
        description: atts.description
      });
      event.setTag('bookingId', atts.bookingId);
    };

    api.updateBooking = function(booking, oldBooking) {
      var bookingId = booking.id || booking.bookingId;
      var day = oldBooking.day || booking.day;
      if (day instanceof Date) {
        day = day.toJSON().substr(0,10);
      }
      var startTime = moment(day).add(2, 'days').toDate();
      var endTime = moment(day).subtract(2, 'days').toDate();
      var events = calendar.getEvents(startTime, endTime, {
        search: bookingId
      });
      var event = events[0];
      var atts = bookingToEvent(booking);

      if (event) {
        event.setTime(atts.startTime, atts.endTime);
        event.setLocation(atts.location);
      }
    };

    // find all bookings
    api.findAllReservations = function(parameters) {
      var events = api.getFutureEvents();

      if (parameters.ignore) {
        events = events.filter(function (event) {
          var bookingId = event.getTag('bookingId');
          return bookingId !== parameters.ignore;
        });
      }
      return events.map(function(event) {
        return {
          id: event.getId(),
          title: event.getLocation(),
          start: event.getStartTime(),
          end: event.getEndTime(),
          location: event.getLocation()
        };
      });
    };

    // get all events
    api.getFutureEvents = function() {
      var startDate = moment().startOf('day').add('days',1).toDate();
      var endDate = moment(startDate).add('years', 5).toDate();
      return calendar.getEvents(startDate, endDate);
    };

    function bookingToEvent (booking) {
      // id
      // day
      // time
      // room
      // name
      // email
      // status

      var event = {};
      if (booking.day instanceof Date) {
        booking.day = booking.day.toJSON().substr(0,10);
      }

      event.startTime = moment(booking.day).add(booking.startTime, 'hours').toDate();
      event.endTime = moment(event.startTime).add(booking.duration, 'hours').toDate();

      event.bookingId = booking.bookingId || booking.id;
      event.subject = booking.room + ' by ' + booking.name;
      if (booking.email) {
        event.subject += ' (' + booking.email + ')';
      }
      event.location = booking.room;
      event.guests = booking.email;
      event.description = 'Booked via zurich.impacthub.net on ' + (new Date()) + ' ('+event.bookingId+')\n' + JSON.stringify(booking, '', '  ');

      return event;
    }

    return api;
  };

  global.BookingsCalendar = BookingsCalendar;
}(this));
