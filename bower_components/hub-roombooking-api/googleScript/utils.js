(function(global) {
  'use strict';

  // https://github.com/gr2m/hub-roombooking/issues/27
  var ID_LENGTH = 6;

  global.generateId = (function() {
    var chars, i, radix;

    // our IDs consist of numbers only, to be compatible
    // with the Hub's Door System keys
    // https://github.com/gr2m/hub-roombooking/issues/27
    chars = '0123456789'.split('');
    radix = chars.length;

    function generateId() {
      var id = '';

      for (i = 0; i < ID_LENGTH; i++) {
        var rand = Math.random() * radix;
        var char = chars[Math.floor(rand)];
        id += String(char).charAt(0);
      }

      return id;
    }

    return generateId;
  })();

}(this));
