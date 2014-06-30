var config = {};

config.appBaseUrl = 'http://hub-roombooking.martynus.net/';

// get value of key parameter from URL
// /spreadsheet/ccc?key=0Av9qrYlfMEQXdGNIX0pXOHZPaFdKT1lYN0szd29Od2c#gid=0
config.spreadsheetKey = '0Av9qrYlfMEQXdGNIX0pXOHZPaFdKT1lYN0szd29Od2c';

// Name of the sheet to be open
config.sheetName = 'Requests';

// Calender ID aus iframe embed code
config.calendarId = 'martynus.net_6hfsvj2oeit6o0l5ia55hscijo@group.calendar.google.com';

// Alias as configured in GMAIL
// config.emailAlias = 'booking.zurich@impacthub.ch';

// List of states a booking can be in
config.states = [
  'new request',
  'request confirmed',
  'offer sent',
  'booking confirmed',
  'cancelled'
];

// maps sheet headers to property names
config.PropertyToHeaderMap = {
  bookingId: 'Booking Id',
  timestamp: 'Timestamp',

  name: 'Name',
  email: 'E-Mail',
  category: 'Category',
  memberId: 'Member Id',

  day: 'Day',
  room: 'Room',
  startTime: 'Start Time',
  endTime: 'End Time',
  duration: 'Duration',
  price: 'Price',
  note: 'Note',

  invoiceEmail: 'Invoice Email',
  invoiceName: 'Invoice Name',
  additionalInvoiceData: 'Additional Invoice Data',
  street: 'Street',
  zip: 'Zip',
  city: 'City',
  country: 'Country',

  internalNote: 'Internal Note',
  history: 'History',
  status: 'Status'
};

// ivnerted propertyNamesMap
config.headerToPropertyMap = {};
for (var header in config.PropertyToHeaderMap) {
  config.headerToPropertyMap[config.PropertyToHeaderMap[header]] = header;
}
