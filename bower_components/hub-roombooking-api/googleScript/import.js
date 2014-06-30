/* global SpreadsheetApp, Logger, generateId, moment, config, BookingsSpreadSheet, BookingsCalendar, formatHours */
/* exported importFromAllData, debugCalendar */
'use strict';

var spreadSheetId = '0Amoyf2JHvz2XdHkzUEdpVGN1bm03bTBMVUdoX255TWc';

var COLUMNS_FORM_RESPONSES = [
  'er',
  'isMember',
  'memberId',
  'firstname1',
  'lastname1',
  'room1',
  'date1',
  'from1',
  'to1',
  'room2',
  'date2',
  'from2',
  'to2',
  'firstname2',
  'lastname2',
  'phone',
  'email',
  'invoiceRecipient',
  'additionalAddressInformation',
  'street',
  'zip',
  'city',
  'country',
  'invoiceReference',
  'comment',
  'status',
  'internalComment1',
  'room3',
  'name',
  'event_name',
  'date3',
  'from3',
  'to3',
  'internalComment2'
];



function importFromAllData() {
  var spreadSheetFile = SpreadsheetApp.openById(spreadSheetId);
  var formResponsesSheet = spreadSheetFile.getSheets()[0];
  var formResponses = getValues(formResponsesSheet);

  var bookings = new BookingsSpreadSheet(config.spreadsheetKey, config.sheetName);
  var calendar = new BookingsCalendar(config.calendarId);

  var bookingsToImport = formResponses.map(formResponseToBookingObject);

 bookingsToImport.forEach(function(booking, i) {
    if (moment(booking.day) < moment('2014-07-01')) {
      Logger.log((i+2) + '. ignored: ' + booking.day + ' is before 2014-07-01');
      return;
    }
    if (booking.startTime === 'Invalid date') {
      Logger.log((i+2) + '. ignored: Invalid start time');
      return;
    }
    if (booking.endTime === 'Invalid date') {
      Logger.log((i+2) + '. ignored: Invalid end time');
      return;
    }
    if (booking.status === 'cancelled') {
      Logger.log((i+2) + '. ignored: status is cancelled');
      return;
    }

    Logger.log((i+2) + '. ✔︎ ' + booking.day + ' ' + formatHours(booking.startTime) + '-' + formatHours(booking.startTime + booking.duration));
    bookings.add(booking);
    calendar.addBooking(booking);
 });

  function getValues(sheet) {
    var lastColumn = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  }

  function formResponseToBookingObject(row) {
    var booking = {};
    COLUMNS_FORM_RESPONSES.forEach( function(property, i) {
      booking[property] = row[i];
    });
    return oldObjectToNew(booking);
  }

  function oldObjectToNew(object) {
    var booking = {};
    booking.bookingId = generateId();
    booking.timestamp = moment(object.er).format('YYYY-MM-DD');

    booking.name = getName(object);
    booking.email = object.email;
    booking.category = getCategory(object);
    booking.memberId = object.memberId;
    booking.day = dmyToYmd( object.date1 || object.date2 || object.date3 );
    booking.room = object.room1 || object.room2 || object.room3;
    booking.startTime = getStartTime(object);
    // booking.endTime gets set automatically
    booking.duration = getDuration(object);
    booking.price = '';
    booking.note = object.comment;
    booking.invoiceEmail = object.email;
    booking.invoiceName = object.invoiceRecipient;
    booking.invoiceAdditionalData = getInvoiceAdditionalData(object);
    booking.street = object.street;
    booking.zip = object.zip;
    booking.city = object.city;
    booking.country = object.country;
    booking.internalNote = getInternalNote(object);
    booking.history = '[imported from old system]';
    booking.status = getStatus(object);

    return booking;
  }

  function getName (object) {
    var firstname;
    var lastname;
    if (object.name) return object.name;

    firstname = object.firstname1 || object.firstname2;
    lastname = object.lastname1 || object.lastname2;

    return [firstname, lastname].join(' ');
  }
  function getCategory (object) {
    if (object.memberId) return 'member';
    if (object.isMember.toLowerCase() === 'team') return 'team';
    return 'external';
  }

  function dmyToYmd(datestring) {
    return moment(datestring).format('YYYY-MM-DD');
  }

  function getStartTime (object) {
    var from = object.from1 || object.from2 || object.from3;
    return moment.duration(moment(from).format('HH:mm')).asHours();
  }

  function getDuration(object) {
    var from = object.from1 || object.from2 || object.from3;
    var to = object.to1 || object.to2 || object.to3;
    var fromHours = moment.duration(from).asHours();
    var toHours = moment.duration(to).asHours();
    var hours = toHours - fromHours;
    if (hours < 0) {
      hours += 24;
    }
    return hours;
  }

  function getInvoiceAdditionalData (object) {
    return [object.additionalAddressInformation, object.invoiceReference].filter(function(string) {
      return !! string;
    }).join('\n');
  }

  function getInternalNote (object) {
    return [object.internalComment1, object.internalComment1].filter(function(string) {
      return !! string;
    }).join('\n');
  }

  function getStatus (object) {
    var STATUS_MAP = {
      'prov.': 'new request',
      'fixed.': 'request confirmed',
      'booked': 'booking confirmed',
      'offerte verschickt': 'offer sent',
      'can not be confirmed': 'cancelled',
      'cancelled': 'cancelled',
      'moved': 'cancelled'
    };
    return STATUS_MAP[object.status] || ('unknown: ' + object.status);
  }
}


// FOR REFERENCE: new booking object properties
// bookingId: 'Booking Id'
// timestamp: 'Timestamp'
// name: 'Name'
// email: 'E-Mail'
// category: 'Category'
// memberId: 'Member Id'
// day: 'Day'
// room: 'Room'
// startTime: 'Start Time'
// endTime: 'End Time'
// duration: 'Duration'
// price: 'Price'
// note: 'Note'
// invoiceEmail: 'Invoice Email'
// invoiceName: 'Invoice Name'
// invoiceAdditionalData: 'Department / Invoice Ref#'
// street: 'Street'
// zip: 'Zip'
// city: 'City'
// country: 'Country'
// internalNote: 'Internal Note'
// history: 'History'
// status: 'Status'
