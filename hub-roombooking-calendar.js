/* global define */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'hub-roombooking-api'], function (jquery, hubRoombookingApi) {
      root.hubRoombookingCalendar = factory(jquery, hubRoombookingApi);
      return root.hubRoombookingCalendar;
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('hub-roombooking-api'));
  } else {
    root.hubRoombookingCalendar = factory(root.jQuery, root.hubRoombookingApi);
  }
})(this, function ($, hubRoombookingApi) {
  'use strict';

  function HubRoombookingCalendar($wrapper, options) {
    var api = this;
    var loadEventsPromise;
    var $monthWeekCalendar = $('<div class="monthWeekCalendar" data-view="month" />');
    var $dayCalendar = $('<div class="dayCalendar" />');

    // handle options
    var defaultView = options.view || 'month';
    var selectable = !! options.select;

    // if roomFilter is set, only events that would block the set
    // room are displayed, the others are hidden
    var roomFilter;

    if (defaultView === 'week') defaultView = 'agendaWeek';

    function initialize () {
      var baseCalendarOptions = {
        header: {
          left:   'title',
          center: '',
          right:  'prev,next'
        },
        agenda: 'h:mm',
        timeFormat: 'h:mm',
        minTime: '07:00:00',
        firstDay: 1, // Monday
        height: 600,
        events: function(start, end, timezone, callback) {
          loadEventsPromise.done(callback);
        }
      };
      hubRoombookingApi.setup(options);
      // loadEventsPromise = hubRoombookingApi.getReservations();
      loadEventsPromise = $.Deferred().resolve(fixtures);

      $wrapper.append($monthWeekCalendar).append($dayCalendar).addClass('calendarWrapper');

      $monthWeekCalendar.fullCalendar($.extend({}, baseCalendarOptions, {
        header: {
          left:   'title',
          center: '',
          right:  'month agendaWeek prev,next'
        },
        selectable: true,
        // selectHelper: true,
        select: selectDay,
        eventDataTransform: function(event) {
          var roomName = normalize(event.location);
          event.className = ['room', roomName];
          return event;
        },
        viewRender: function(view) {
          // don't use .data API here, we depend on data- attribute for CSS
          var currentViewName = $monthWeekCalendar.attr('data-view');
          var calendarOptions = $monthWeekCalendar.fullCalendar('getView').calendar.options;

          if (view.name === currentViewName) return;

          if (view.name === 'month') {
            $monthWeekCalendar.attr('data-view', 'month');

            $monthWeekCalendar.fullCalendar('render');
            $dayCalendar.fullCalendar('render');
            calendarOptions.selectable = true;
            calendarOptions.select = selectDay;
          }
          if (view.name === 'agendaWeek') {
            $monthWeekCalendar.attr('data-view', 'agendaWeek');
            $monthWeekCalendar.fullCalendar({
              selectable: false,
              height:1000
            });

            calendarOptions.selectable = selectable;
            calendarOptions.select = options.select;

            $monthWeekCalendar.fullCalendar('render');
          }
        },
        // editable: true,
        defaultView: defaultView
      }));

      $dayCalendar.fullCalendar($.extend({}, baseCalendarOptions, {
        defaultView: 'agendaDay',
        viewRender: function(view) {
          $monthWeekCalendar.fullCalendar( 'gotoDate', view.intervalStart );
          $monthWeekCalendar.fullCalendar( 'select', view.intervalStart );
        },
        selectable: selectable,
        select: options.select
      }));
    }

    api.filter = function filter(roomName) {
      roomFilter = normalize(roomName);
      if (roomFilter === 'all') {
        roomFilter = undefined;
        $wrapper.removeAttr('data-filter');
      } else {
        $wrapper.attr('data-filter', roomFilter);
      }
    };

    function selectDay (start) {
      $dayCalendar.fullCalendar( 'gotoDate', start );
    }

    initialize();

    return api;
  }

  // PRIVATE
  // var BLOCKING_ROOMS = {
  //   smallmeetingroom: ['gallery', 'arch'],
  //   largemeetingroom: ['gallery', 'arch'],
  //   gallery: ['smallmeetingroom', 'largemeetingroom', 'arch'],
  //   arch: ['smallmeetingroom','largemeetingroom','gallery'],
  //   garagemeetingroom: ['garage'],
  //   garage: ['garagemeetingroom']
  // };

  function normalize(string) {
    return (string || '').toLowerCase().replace(/ /g, '');
  }

  // jQurey API
  $.fn.hubRoombookingCalendar = function(option) {
    var jsApiArgs =  Array.prototype.slice.apply(arguments, [1]);
    var api = this.data('hubRoombookingCalendar');

    if (!api) {
      this.data('bs.editableTable', (api = new HubRoombookingCalendar(this, option)));
      this.data('hubRoombookingCalendar', api);
    }

    // api call
    if (typeof option === 'string') {
      api[option].apply(null, jsApiArgs);
    }

    return this;
  };

  return $;
});


var fixtures = [ // jshint ignore:line
  {
    title: 'Small Meeting Room',
    start: '2014-06-19T07:00:00.000Z',
    end: '2014-06-19T10:00:00.000Z',
    location: 'Small Meeting Room'
  },
  {
    title: 'Large Meeting Room',
    start: '2014-06-20T07:00:00.000Z',
    end: '2014-06-20T10:00:00.000Z',
    location: 'Large Meeting Room'
  },
  {
    title: 'Gallery',
    start: '2014-06-21T07:00:00.000Z',
    end: '2014-06-21T10:00:00.000Z',
    location: 'Gallery'
  },
  {
    title: 'Arch',
    start: '2014-06-22T07:00:00.000Z',
    end: '2014-06-22T10:00:00.000Z',
    location: 'Arch'
  },
  {
    title: 'Garage Meeting Room',
    start: '2014-06-23T07:00:00.000Z',
    end: '2014-06-23T10:00:00.000Z',
    location: 'Garage Meeting Room'
  },
  {
    title: 'Garage',
    start: '2014-06-24T07:00:00.000Z',
    end: '2014-06-24T10:00:00.000Z',
    location: 'Garage'
  }
];
