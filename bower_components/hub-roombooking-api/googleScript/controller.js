// # Controller
// the controller provieds the main methods that are exposed
// as API. The methods are mapped in `routes`

/* global GMail, ContentService, config, BookingsSpreadSheet, BookingsCalendar, TEMPLATES, generateId */

(function(global) {
  'use strict';

  var Controller = function() {
    // public API
    var api = {};

    var output = ContentService.createTextOutput();
    var response;
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);

    var bookings = new BookingsSpreadSheet(config.spreadsheetKey, config.sheetName);
    var calendar = new BookingsCalendar(config.calendarId);
    var gmail = new GMail();

    // ## getBookings
    // returns list of all room bookings from spreadsheet. Can be filtered by status (new, approved, canceled)
    api.getBookings = function(/* params */) {
      setResponse(bookings.findAll());
    };

    // ## getBooking
    // returns the booking with passed id, otherwise a not found
    api.getBooking = function( params, id ) {
      var booking = bookings.find(id);

      if (booking) {
        return setResponse(booking);
      }

      // booking not found
      setError({
        status: 404,
        name: 'NOT_FOUND',
        message: 'Booking could not be found'
      });
    };

    // ## confirmBooking
    // returns the booking with passed id, otherwise a not found
    api.confirmBooking = function( params, id ) {
      var booking = bookings.find(id);

      if (! booking) {
        // booking not found
        return setError({
          status: 404,
          name: 'NOT_FOUND',
          message: 'Booking could not be found'
        });
      }

      if (booking.status.toLowerCase() === config.states[1]) {
        return setError({
          status: 403,
          name: 'FORBIDDEN',
          message: 'Booking is already confirmed.'
        });
      }

      if (booking.status.toLowerCase() !== config.states[0]) {
        return setError({
          status: 403,
          name: 'FORBIDDEN',
          message: 'Booking cannot be confirmed, it\'s already "'+booking.status+'".'
        });
      }

      booking = bookings.update(id, {status: config.states[1]});
      return setResponse(booking);
    };

    // ## cancelBooking
    // returns the booking with passed id, otherwise a not found
    api.cancelBooking = function( params, id ) {
      var booking = bookings.find(id);

      if (! booking) {
        // booking not found
        return setError({
          status: 404,
          name: 'NOT_FOUND',
          message: 'Booking could not be found'
        });
      }

      if (booking.status.toLowerCase() !== config.states[0]) {
        return setError({
          status: 403,
          name: 'FORBIDDEN',
          message: 'Booking cannot be cancelled, it\'s already "'+booking.status+'".'
        });
      }

      booking = bookings.update(id, {status: config.states[4]});
      return setResponse(booking);
    };

    // ## getReservations
    // returns list of all room reservations from calendar
    api.getReservations = function( params ) {
      var resevations = calendar.findAllReservations(params);
      setResponse(resevations);
    };

    // ## addBooking
    // adds a new Booking. Parameters: name, email, room
    api.addBooking = function( params ) {
      var booking = getNewBooking(params);
      try {
        bookings.add(booking);
        calendar.addBooking(booking);
        gmail.send({
          recipient: booking.email,
          subject: '[IMPACT HUB ZURICH] Your Roombooking ' + booking.id,
          body: TEMPLATES.newBookingConfirmationEmail(booking)
        });

        setResponse(booking);
      } catch(error) {
        error.status = 500;
        setError(error);
      }
    };

    // ## addBooking
    // adds a new Booking. Parameters: name, email, room
    api.updateBooking = function( params, id ) {
      try {
        var booking = bookings.update(id, params);

        if (booking.changed.day || booking.changed.time) {
          calendar.updateBooking(booking, booking.changed);
        }
        gmail.send({
          recipient: booking.email,
          subject: '[IMPACT HUB ZURICH] Roombooking updated ' + booking.id,
          body: TEMPLATES.bookingUpdateNotificationEmail(booking)
        });

        setResponse(booking);
      } catch(error) {
        error.status = 500;
        setError(error);
      }
    };

    // ## response
    // returns JSONP response for request
    api.response = function(callbackName) {
      if (! response) {
        setError({status: 404, name: 'NOT_FOUND', message: 'action not found'});
      }

      // turn json into jsonp
      output.setContent( callbackName + '(' + JSON.stringify(response) + ')' );

      return output;
    };

    function setResponse (newResponse) {
      response = newResponse;
    }

    function setError (error) {
      setResponse({error: error});
    }

    return api;
  };


  function getNewBooking (properties) {
    properties.id = generateId();
    properties.timestamp = (new Date()).toISOString().substr(0,10);
    properties.status = config.states[0];
    return properties;
  }

  // expose
  global.Controller = Controller;
}(this));
