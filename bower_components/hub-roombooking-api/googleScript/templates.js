/* global Handlebars, config, _ */

(function(global) {
  'use strict';

  function newBookingConfirmationEmail(booking) {
    var template = [
      'Hi {{{ name }}}',
      '',
      'please confirm or edit your booking request at: ',
      '{{{ baseUrl }}}#/booking/{{{ id }}}',
      '',
      'Booking Id: {{{ id }}}',
      'Day: {{{ day }}}',
      'Room: {{{ room }}}',
      'Start Time: {{{ startTime }}}',
      'Duration: {{{ duration }}}',
      'Name: {{{ name }}}',
      'E-Mail: {{{ email }}}',
      'Category: {{{ category }}} {{{ memberId }}}',
      'Note: {{{ note }}}',
      '',
      '– Team Impacthub Zurich'
    ].join('\n');

    return Handlebars.compile(template)(_.extend({baseUrl: config.appBaseUrl}, booking));
  }

  function bookingUpdateNotificationEmail(booking) {
    var template = [
      'Hi {{{ name }}}',
      '',
      'Your booking request has been updated: ',
      '{{{ baseUrl }}}#/booking/{{{ id }}}',
      '',
      '– Team Impacthub Zurich'
    ].join('\n');

    return Handlebars.compile(template)(_.extend({baseUrl: config.appBaseUrl}, booking));
  }

  global.TEMPLATES = {
    newBookingConfirmationEmail: newBookingConfirmationEmail,
    bookingUpdateNotificationEmail: bookingUpdateNotificationEmail
  };
}(this));
