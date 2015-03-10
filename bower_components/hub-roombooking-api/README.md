Hub Roombooking API
===================

This app is using [Huble](http://www.forcebase.org/huble) as its backend.

The currently available APIs are

```
GET /calendar?since=2015-01-01&until=2015-27-01
POST /booking
```

We've made a JavaScript wrapper around it, to make your life easier:

```js
// setup API
hubRoombookingApi.setup({baseUrl: 'http://member.impacthub.ch/api'})

// all Api methods return jQuery compatible promises for async callbacks
hubRoombookingApi.createBooking({
  "category": "member",
  "name": "Joe",
  "email": "joe@example.net",
  "memberId": "123456",
  "room": "smallmeetingroom",
  "startTime": 9,
  "duration": 2,
  "day": "2015-02-20",
  "invoiceName": "Bill Boss",
  "invoiceEmail": "bill@example.com",
  "additionalInvoiceData": "Bookkeeping Department",
  "street": "Street name 10235",
  "zip": "12345",
  "city": "City",
  "country": "Switzerland",
  "note": "Note here"
})
  .done(function(booking) {
    alert('booking created')
    console.log(booking)
  })
  .fail(function(xhr, error) {
    console.log(error)
  })

hubRoombookingApi.resendConfirmation(bookingId)
  .done(function() {
    alert('Booking confirmation resent')
  })
  .fail(function(xhr, error) {
    console.log(error)
  })

hubRoombookingApi.getReservations({
  since: '2015-02-01',
  until: '2015-02-28'
})
  .done(function(reservations) {
    alert(reservations.length + ' reservations found')
    console.log(reservations)
  })
  .fail(function(xhr, error) {
    console.log(error)
  })
```


Fine Print
----------

hub-roombooking-api.js have been authored by [Gregor Martynus](https://github.com/gr2m),
proud member at [Impact Hub Zurich](http://zurich.impacthub.net/)

License: MIT
