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
      var day = oldBooking.day || booking.day;
      if (day instanceof Date) {
        day = day.toJSON().substr(0,10);
      }
      var yearMonthDay = day.toString().split(/-/);
      var bookingDate = new Date(yearMonthDay[0], yearMonthDay[1]-1,yearMonthDay[2]);
      var daysInMs = 2 * 24 * 60 * 60 * 1000;
      var startTime = new Date(bookingDate.getTime() - daysInMs);
      var endTime = new Date(bookingDate.getTime() + daysInMs);
      var events = calendar.getEvents(startTime, endTime, {
        search: booking.id
      });
      var event = events[0];
      var atts = bookingToEvent(booking);

      if (event) {
        event.setTime(atts.startTime, atts.endTime);
        event.setLocation(atts.location);
      }
    };

    // find all bookings
    api.findAllReservations = function(/*parameters*/) {
      var events = api.getEventObjectsForNext6Months();

      return events.map(function(event) {
        return {
          id: event.getId(),
          title: event.getTitle(),
          start: event.getStartTime(),
          end: event.getEndTime(),
          location: event.getLocation(),
          description: event.getDescription(),
          bookingId: event.getTag('bookingId')
        };
      });
    };

    // get all events
    api.getEventObjectsForNext6Months = function() {
      var startDate = moment().startOf('day').add('days',1).toDate();
      var endDate = moment(startDate).add('months', 6).toDate();
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
      var yearMonthDay = booking.day.toString().split(/-/);
      var bookingDate = new Date(yearMonthDay[0], yearMonthDay[1]-1,yearMonthDay[2]);

      event.startTime = new Date(bookingDate.setHours( parseInt(booking.startTime) ));
      event.endTime = new Date(bookingDate.setHours( parseInt(booking.startTime) + parseInt(booking.duration) ));

      event.bookingId = booking.id;
      event.subject = booking.room + ' by ' + booking.email;
      event.location = booking.room;
      event.guests = booking.email;
      event.description = 'Booked via zurich.impacthub.net on ' + (new Date()) + ' ('+booking.id+')';

      return event;
    }

    return api;
  };

  global.BookingsCalendar = BookingsCalendar;
}(this));
