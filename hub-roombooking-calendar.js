/* global define, moment */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'hub-roombooking-api', 'fullcalendar'], function (jquery, hubRoombookingApi) {
      root.hubRoombookingCalendar = factory(jquery, hubRoombookingApi);
      return root.hubRoombookingCalendar;
    });
  } else if (typeof exports === 'object') {
    require('fullcalendar');
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
    var selectCallback = getSelectCallback(options.select);

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
        agenda: 'H:mm',
        timeFormat: 'H:mm',
        minTime: '08:00:00',
        maxTime: '23:00:00',
        firstDay: 1, // Monday
        height: 602,
        events: function(start, end, timezone, callback) {
          loadEventsPromise.done(callback);
        },
        timezone: 'local',
        unselectAuto: false,
        allDaySlot: false,
        unselect: handleUnselect
      };
      hubRoombookingApi.setup(options);
      loadEventsPromise = hubRoombookingApi.getReservations({
        ignore: options.ignoreBookingId,
        since: moment().startOf('month').format('YYYY-MM-DD'),
        until: moment().add(1, 'year').format('YYYY-MM-DD')
      }).then(mapNewRoomNames);

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
        loading: handleLoading,
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
            calendarOptions.selectHelper = selectable;
            calendarOptions.select = selectCallback;

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
        selectHelper: selectable,
        select: selectCallback
      }));

      if (options.filterFor) {
        api.filterFor(options.filterFor);
      }
    }


    //
    //
    //
    api.filterFor = function filterFor(roomName) {
      roomFilter = normalize(roomName);
      if (roomFilter === 'all') {
        roomFilter = undefined;
        $wrapper.removeAttr('data-filter');
      } else {
        $wrapper.attr('data-filter', roomFilter);
      }
    };


    //
    //
    //
    api.select =function(start, end) {
      $monthWeekCalendar.fullCalendar('select', start, end);
      $dayCalendar.fullCalendar('select', start, end);
    };

    //
    //
    //
    api.unselect =function() {
      $monthWeekCalendar.fullCalendar('unselect');
      $dayCalendar.fullCalendar('unselect');
    };


    function getSelectCallback(callback) {
      if (! callback) return;

      return function(start, end) {
        var error;
        var startCheck = start.clone().add(1, 'second');
        var endCheck = end.clone().subtract(1, 'second');
        try {
          $monthWeekCalendar.fullCalendar( 'clientEvents', function(event) {
            var eventRoom = normalize(event.location);
            if (event.start > endCheck || event.end < startCheck) return;

            if (roomFilter && BLOCKING_ROOMS[eventRoom].indexOf(roomFilter) === -1) {
              return;
            }

            error = new Error('The selected time conflicts with an existing booking');
            throw error;
          });
        } catch(e) {}

        if (!error && options.validateSelection) {
          error = options.validateSelection(start, end);
        }

        if (start < moment()) {
          error = new Error('Selected time is in the past');
        }

        if (error) {
          // $monthWeekCalendar.fullCalendar('unselect');
          // $dayCalendar.fullCalendar('unselect');
          $wrapper.find('.fc-select-helper').addClass('error').html('<span>'+error.message+'</span>');

          if (options.error) {
            options.error(error.message, start, end);
          }
          return;
        }

        callback(start, end);
      };
    }
    function selectDay (start) {
      $dayCalendar.fullCalendar( 'gotoDate', start );
    }
    function handleLoading (isLoading) {
      $wrapper.toggleClass('loading', isLoading);
      if (!isLoading && options.ready) {
        setTimeout(options.ready, 1000);
        delete options.ready;
      }
    }

    // might be triggered twice in some circumstances,
    // we work around that with the timeout
    // var unselectTimeout;
    function handleUnselect () {
      if (!options.unselect) return;
      // clearTimeout(unselectTimeout);
      // unselectTimeout = setTimeout(options.unselect);
      options.unselect();
    }

    //
    function mapNewRoomNames (events) {
      return events.map(function(event) {
        event.title = {
          smallmeetingroom: 'Vienna',
          largemeetingroom: 'Sao',
          gallery: 'Dubai',
          arch: 'Bay',
          garagemeetingroom: 'Amsterdam',
          garage: 'Singapore'
        }[normalize(event.location)];
        return event;
      });
    }

    initialize();

    return api;
  }

  // PRIVATE
  var BLOCKING_ROOMS = {
    smallmeetingroom: ['smallmeetingroom', 'gallery', 'arch'],
    largemeetingroom: ['largemeetingroom', 'gallery', 'arch'],
    gallery: ['smallmeetingroom', 'largemeetingroom', 'gallery', 'arch'],
    arch: ['smallmeetingroom','largemeetingroom','gallery', 'arch'],
    garagemeetingroom: ['garage'],
    garage: ['garagemeetingroom']
  };

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

// // Fixtures for debugging
// var fixtures = [ // jshint ignore:line
//   {
//     title: 'Small Meeting Room',
//     start: '2014-06-19T08:00:00.000Z',
//     end: '2014-06-19T11:00:00.000Z',
//     location: 'Small Meeting Room'
//   },
//   {
//     title: 'Large Meeting Room',
//     start: '2014-06-20T08:00:00.000Z',
//     end: '2014-06-20T11:00:00.000Z',
//     location: 'Large Meeting Room'
//   },
//   {
//     title: 'Gallery',
//     start: '2014-06-21T08:00:00.000Z',
//     end: '2014-06-21T11:00:00.000Z',
//     location: 'Gallery'
//   },
//   {
//     title: 'Arch',
//     start: '2014-06-22T08:00:00.000Z',
//     end: '2014-06-22T11:00:00.000Z',
//     location: 'Arch'
//   },
//   {
//     title: 'Garage Meeting Room',
//     start: '2014-06-23T08:00:00.000Z',
//     end: '2014-06-23T11:00:00.000Z',
//     location: 'Garage Meeting Room'
//   },
//   {
//     title: 'Garage',
//     start: '2014-06-24T08:00:00.000Z',
//     end: '2014-06-24T11:00:00.000Z',
//     location: 'Garage'
//   }
// ];
