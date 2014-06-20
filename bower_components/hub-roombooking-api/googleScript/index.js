// https://script.google.com/macros/s/AKfycbxTHF25oGgqA0nIIvAHMKx6Klhi3ZJ91ZGugQruk9Uev_EGA9k/exec?action=getBookings
// https://script.google.com/macros/s/AKfycbxTHF25oGgqA0nIIvAHMKx6Klhi3ZJ91ZGugQruk9Uev_EGA9k/exec?action=getBooking/abc4567
// https://script.google.com/macros/s/AKfycbxTHF25oGgqA0nIIvAHMKx6Klhi3ZJ91ZGugQruk9Uev_EGA9k/exec?action=getReservations
// https://script.google.com/macros/s/AKfycbxTHF25oGgqA0nIIvAHMKx6Klhi3ZJ91ZGugQruk9Uev_EGA9k/exec?action=addBooking&day=2014-01-15&time=morning&name=Gregor Martynus&email=gregor@martynus.net&room=Arche

// jshint unused:false, strict:false
/* global Controller, crossroads, ContentService, SpreadsheetApp, readData_, CalendarApp, ScriptApp, Logger, Browser, _ */


// routes map the ?action parameter to methods on the Controller (see controller.js)
var routes = {
  'getBookings': 'getBookings',
  'getBooking/{id}': 'getBooking',
  'confirmBooking/{id}': 'confirmBooking',
  'cancelBooking/{id}': 'cancelBooking',
  'updateBooking/{id}': 'updateBooking',
  'getReservations': 'getReservations',
  'addBooking': 'addBooking'
};

function doGet(request) {
  var path = request.parameters.action;
  var callbackName = request.parameters.callback;
  var router = crossroads.create();
  var routeName, methodName;
  var controller = new Controller();

  for (routeName in routes) {
    methodName = routes[routeName];
    router.addRoute(routeName).matched.add(controller[methodName]);
  }

  delete request.parameters.action;
  delete request.parameters.callback;
  for (var key in request.parameters) {
    request.parameters[key] = decodeURIComponent(request.parameters[key]);
  }
  router.parse(path, [request.parameters]);

  Logger.log('request');
  Logger.log(request.parameters);
  Logger.log('response');
  Logger.log(controller.response(callbackName).getContent());

  return controller.response(callbackName);
}

// spreadsheet trigger
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: 'Check differences between calendar & sheet', functionName: 'sync'}];
  spreadsheet.addMenu('⇄ Sync w. Calendar', menuEntries);
}

// update properties (esp. id) here for debugging
// with functions below
var debugBooking = {
  id: 'abc4567',

  // booking person
  category: 'member', // external, member, partner, team
  name: 'Gregor',
  email: 'gregor@martynus.net',
  memberId: '123456',

  // room & date/time
  room: 'small meeting room', // small meeting room, large meeting room, gallery, arch
  startTime: 11.5, // start hour (0-23)
  endTime: 13.5, // end hour (0-23)
  duration: 2, // hours
  day: '2014-05-09', // YYYY-MM-DD
  prize: 123.45, // EUR

  // invoice contact
  invoiceName: 'Gregor Martynus',
  invoiceEmail: 'gregor+invoice@martynus.net',
  department: 'Department',
  street: 'Am Mustergraben 123',
  zip: '12345',
  city: 'Buzdehude',
  country: 'Germany',

  // free text additions
  note: 'Note here'
};

// send fake requests for debugging
function debugAddBooking() {
  var request = {
    parameters: _.extend({}, debugBooking, {action: 'addBooking', callback: 'debugCallback'})
  };
  doGet(request);
}
function debugUpdateBooking() {
  var request = {
    parameters: _.extend({}, debugBooking, {action: 'addBooking', id: undefined, callback: 'debugCallback'})
  };
  doGet(request);
}

function debugGetBookings() {
  var request = {
    parameters: {
      action: 'getBookings',
      callback: 'debugCallback',
    }
  };
  doGet(request);
}

function debugGetBooking() {
  var request = {
    parameters: {
      action: 'getBooking/' + debugBooking.id,
      callback: 'debugCallback',
    }
  };
  doGet(request);
}

function debugCancelBooking() {
  var request = {
    parameters: {
      action: 'cancelBooking/' + debugBooking.id,
      callback: 'debugCallback'
    }
  };
  doGet(request);
}

function debugConfirmBooking() {
  var request = {
    parameters: {
      action: 'confirmBooking/' + debugBooking.id,
      callback: 'debugCallback',
    }
  };
  doGet(request);
}

function debug() {
  for(headerKey in config.PropertyToHeaderMap) {
    Logger.log(headerKey)
  }
}
