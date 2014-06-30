Impact Hub Zurich Room Availability Calendar Widget™
====================================================

Calendar Widget based on [fullcalendar](http://arshaw.com/fullcalendar).

```js
// given page HTML contains <div id="calendar"></div>

// the Id looks something like AKfycbw_tyfAnJhuKz4VXlLtb0904iuAfDdQ5LIaSqklNdqa3u0tC3k
// you can extract it from the "Current web app URL:" in Google's script editor,
// the form is https://script.google.com/macros/s/<googleScriptId>/exec
var googleScriptId = 'AKfycbw_tyfAnJhuKz4VXlLtb0904iuAfDdQ5LIaSqklNdqa3u0tC3k';
$( '#calendar').hubRoombookingCalendar({
  googleScriptId: googleScriptId,
  view: 'month', // month or week. Defaults to month
  select: function(start, end) { // if not set, selecting timeframes is disabled
    // start / end are moment instances
  },
  validateSelection: function(start, end) { // optional. If invalid, return new Error
    var twoHoursInMs = 2 * 1000 * 60 * 60;
    if (end.diff(start) < twoHoursInMs) return new Error('must select 2+ hours');
  }
  filterFor: 'Small Meeting Room', // setting the filter shows only bookings that would conflict with the passed room name,
  unselect: handleUnselect, // called when selection removed

  ignoreBookingId: '12346', // if displayed in edit mode of a booking, don't show it
  ready: handleCalendarReady // called when events are loaded
});

// methods
$( '#calendar').hubRoombookingCalendar('filterFor', 'Arch');
$( '#calendar').hubRoombookingCalendar('select', start, end);
$( '#calendar').hubRoombookingCalendar('unselect');
```

Fine Print
----------

Impact Hub Zurich Room Availability Calendar Widget™ have been authored by [Gregor Martynus](https://github.com/gr2m),
proud member at [Impact Hub Zurich](http://zurich.impacthub.net/)

License: MIT
