

/*
 Welcome to ap37, a text-based launcher that allows changing
   its source code from inside the launcher itself at runtime.
 Hint: try changing the ap37.setTextSize(11) line below to
   ap37.setTextSize(14) and press save at the top right.
*/

(function script() {
  'use strict';
  var w, h, c;

  function init() {

    ap37.setTextSize(11);

    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();
    c = ap37.getCornersWidth();

    background.init();
    print(c, 0, '        gml-rnd');
    time.init();
    battery.init();
    markets.init();
    apps.init();
    notifications.init();
    transmissions.init();
    print(w - c - 5, h - 1, 'EOF');

    ap37.setOnTouchListener(function (x, y) {
      notifications.onTouch(x, y);
      apps.onTouch(x, y);
      transmissions.onTouch(x, y);
      lineGlitch.onTouch(x, y);
      wordGlitch.onTouch(x, y);
    });
  }

  // modules

  
var background = {
  enabled: false,
  buffer: [],
  bufferColors: [],
  pattern: '',

  printPattern: function (x0, xf, y) {
    // sengaja dikosongkan → hitam polos
  },

  saveBuffer: function (x, y, text, color) {
    if (!background.buffer[y]) return;
    background.buffer[y] =
      background.buffer[y].substr(0, x) +
      text +
      background.buffer[y].substr(x + text.length);

    for (var i = x; i < x + text.length; i++) {
      background.bufferColors[y][i] = color;
    }
  },

  init: function () {
    for (var i = 0; i < h; i++) {
      background.buffer.push(rightPad('', w, ' '));
      background.bufferColors.push(arrayFill('#000000', w));
    }

    // layar langsung hitam polos
    ap37.printLines(background.buffer, '#000000');
  }
};


  var time = {
    update: function () {
      var d = ap37.getDate();
      var time = d.year +
        leftPad(d.month, 2, '0') + leftPad(d.day, 2, '0') + ' ' +
        leftPad(d.hour, 2, '0') + leftPad(d.minute, 2, '0');
      print(w - c - 16, 1, time);
    },
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    }
  };

  var battery = {
    update: function () {
      print(w - c - 17, 0,
        leftPad(ap37.getBatteryLevel(), 3, ' '));
    },
    init: function () {
      battery.update();
      setInterval(battery.update, 60000);
    }
  };

  
var markets = {

  update: function () {


    // 1. DEFAULT OUTPUT (PASTI MUNCUL)

    background.printPattern(1, w, h - 52);

    print(1, h - 52, 'INDONESIA SENTIMENT LOADING…');


    // 2. COBA FETCH (KALAU GAGAL, DEFAULT TETAP ADA)

    get(

      'https://hacker-news.firebaseio.com/v0/topstories.json',

      function (response) {


        var positive = 0;

        var negative = 0;


        try {

          var ids = JSON.parse(response).slice(0, 5);

        } catch (e) {

          print(1, h - 52, 'INDONESIA SENTIMENT OFFLINE');

          return;

        }


        var done = 0;


        for (var i = 0; i < ids.length; i++) {

          get(

            'https://hacker-news.firebaseio.com/v0/item/' + ids[i] + '.json',

            function (itemResponse) {

              try {

                var item = JSON.parse(itemResponse);

                if (item && item.title) {

                  var t = item.title.toLowerCase();


                  if (t.indexOf('growth') !== -1 ||

                      t.indexOf('market') !== -1 ||

                      t.indexOf('economy') !== -1) {

                    positive++;

                  }


                  if (t.indexOf('crash') !== -1 ||

                      t.indexOf('recession') !== -1 ||

                      t.indexOf('layoff') !== -1) {

                    negative++;

                  }

                }

              } catch (e) {}


              done++;

              if (done === ids.length) {

                var sentiment = 'NETRAL —';

                if (positive > negative) sentiment = 'BULLISH ▲';

                if (negative > positive) sentiment = 'BEARISH ▼';


                background.printPattern(1, w, h - 52);

                print(1, h - 52,

                  ' GLOBAL ' + sentiment);

              }

            }

          );

        }

      }

    );

  },


  init: function () {

    print(1, h - 53, ' Market Sentiment');

    markets.update();

    setInterval(markets.update, 300000);

  }

};


var apps = {
  list: [],
  filtered: [],
  rendered: [],

  searchMode: false,
  selectedLetter: null,

  topMargin: 6,
  cols: 2,
  lines: 4,          // ← 4 BARIS PER HALAMAN
  rowGap: 1,         // ← JARAK DIKURANGI 1 BARIS

  appWidth: 0,
  perPage: 0,
  page: 0,

  alpha1: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
  alpha2: ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],

  /* ===== SORT ===== */
  sortAZ: function (arr) {
    return arr.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
  },

  /* ===== CLEAR HELPERS ===== */
  clearLine: function (y) {
    print(0, y, rightPad('', w, ' '), '#000000');
  },

  clearGrid: function () {
    for (var row = 0; row < apps.lines; row++) {
      var y = apps.topMargin + row * (apps.rowGap + 1);

      apps.clearLine(y);

      for (var g = 1; g <= apps.rowGap; g++) {
        apps.clearLine(y + g);
      }
    }
  },

  clearAlphabet: function () {
    for (var y = h - 16; y <= h - 10; y++) {
      apps.clearLine(y);
    }
  },

  /* ===== FILTER ===== */
  applyLetter: function (letter) {
    apps.selectedLetter = letter;
    apps.filtered = [];

    for (var i = 0; i < apps.list.length; i++) {
      if (apps.list[i].name[0].toUpperCase() === letter) {
        apps.filtered.push(apps.list[i]);
      }
    }

    apps.page = 0;
    apps.draw();
  },

  /* ===== DRAW ===== */
  draw: function () {
    apps.clearGrid();
    apps.clearAlphabet();

    var src = apps.searchMode ? apps.filtered : apps.list;
    var idx = apps.page * apps.perPage;

    apps.rendered = [];

    for (var col = 0; col < apps.cols; col++) {
      var x = col * apps.appWidth;

      for (var row = 0; row < apps.lines; row++) {
        var y = apps.topMargin + row * (apps.rowGap + 1);

        if (idx < src.length) {
          var app = src[idx];

          print(x, y,
            '_' + app.name.substring(0, apps.appWidth - 2),
            '#999999'
          );
          print(x + 1, y, app.name[0], '#ffffff');

          apps.rendered.push({
            id: app.id,
            name: app.name,
            x0: x,
            xf: x + apps.appWidth,
            y: y
          });

          idx++;
        }
      }
    }

    if (apps.searchMode) apps.drawAlphabet();
  },

  /* ===== BIG LETTER ===== */
  drawBigLetter: function (x, y, letter, active) {
    var color = active ? '#ff3333' : '#cccccc';

    for (var i = 0; i < 3; i++) {
      print(x, y + i, '   ', '#000000');
    }

    print(x + 1, y + 1, letter, color);
  },

  drawAlphabet: function () {
    var y1 = h - 15;
    var y2 = h - 12;
    var startX = 2;
    var step = 4;

    for (var i = 0; i < apps.alpha1.length; i++) {
      apps.drawBigLetter(
        startX + i * step,
        y1,
        apps.alpha1[i],
        apps.alpha1[i] === apps.selectedLetter
      );
    }

    for (var j = 0; j < apps.alpha2.length; j++) {
      apps.drawBigLetter(
        startX + j * step,
        y2,
        apps.alpha2[j],
        apps.alpha2[j] === apps.selectedLetter
      );
    }
  },

  /* ===== INIT ===== */
  init: function () {
    apps.list = apps.sortAZ(ap37.getApps());
    apps.filtered = [];

    apps.appWidth = Math.floor(w / apps.cols);
    apps.perPage = apps.lines * apps.cols;
    apps.page = 0;

    apps.draw();

    print(w - 4, apps.topMargin - 1, '[?]');
    print(0, h - 8, '<<<');
    print(w - 4, h - 8, '>>>');

    ap37.setOnAppsListener(apps.init);
  },

  /* ===== TOUCH ===== */
  onTouch: function (x, y) {

    /* SEARCH */
    if (y === apps.topMargin - 1 && x >= w - 4) {
      apps.searchMode = !apps.searchMode;
      apps.selectedLetter = null;
      apps.filtered = [];
      apps.page = 0;

      print(w - 4, apps.topMargin - 1, apps.searchMode ? '[×]' : '[?]');
      apps.draw();
      return;
    }

    /* ALPHABET */
    if (apps.searchMode) {
      var idx = Math.floor((x - 2) / 4);

      if (y >= h - 15 && y <= h - 13 && apps.alpha1[idx]) {
        apps.applyLetter(apps.alpha1[idx]);
        return;
      }

      if (y >= h - 12 && y <= h - 10 && apps.alpha2[idx]) {
        apps.applyLetter(apps.alpha2[idx]);
        return;
      }
    }

    /* APP */
    for (var i = 0; i < apps.rendered.length; i++) {
      var r = apps.rendered[i];
      if (y === r.y && x >= r.x0 && x < r.xf) {

        print(r.x0, r.y,
          '_' + r.name.substring(0, apps.appWidth - 2),
          '#ff3333'
        );

        ap37.openApp(r.id);
        return;
      }
    }

    /* NAV */
    var src = apps.searchMode ? apps.filtered : apps.list;

    if (y === h - 8 && x >= w - 4) {
      apps.page++;
      if (apps.page * apps.perPage >= src.length) apps.page = 0;
      apps.draw();
    }

    if (y === h - 8 && x <= 3) {
      apps.page--;
      if (apps.page < 0)
        apps.page = Math.floor((src.length - 1) / apps.perPage);
      apps.draw();
    }
  }
};

var notifications = {
  list: [],
  active: false,
  group: false,

  expandedId: null,
  baseY: 0,

  /* ===== CLEAR AREA ===== */
  clearArea: function () {
    for (var y = 0; y < 9; y++) {
      print(0, notifications.baseY + y,
        rightPad('', w, ' '), '#000000');
    }
  },

  /* ===== REMOVE LOCAL ===== */
  removeById: function (id) {
    for (var i = 0; i < notifications.list.length; i++) {
      if (notifications.list[i].id === id) {
        notifications.list.splice(i, 1);
        return;
      }
    }
  },

  /* ===== MESSAGE EXTRACT ===== */
  getMessage: function (n) {
    if (n.message) return n.message;
    if (n.bigText) return n.bigText;
    if (n.body) return n.body;
    if (n.lines && n.lines.length) return n.lines.join(' ');
    if (n.textLines && n.textLines.length) return n.textLines.join(' ');
    if (n.text) return n.text;
    return '';
  },

  /* ===== UPDATE ===== */
  update: function () {
    notifications.active = ap37.notificationsActive();
    notifications.baseY = apps.topMargin - 6;

    notifications.clearArea();

    if (!notifications.active) {
      print(0, notifications.baseY, 'Activate notifications');
      return;
    }

    var nots = notifications.group
      ? ap37.getNotificationGroups()
      : ap37.getNotifications();

    notifications.list = nots.slice(0, 3);

    /* reset expandedId jika sudah tidak ada */
    if (notifications.expandedId) {
      var found = false;
      for (var i = 0; i < notifications.list.length; i++) {
        if (notifications.list[i].id === notifications.expandedId) {
          found = true;
          break;
        }
      }
      if (!found) notifications.expandedId = null;
    }

    for (var i = 0; i < notifications.list.length; i++) {
      var n = notifications.list[i];
      n.y = notifications.baseY + i * 3;
      n.ellipsis = (i === 2 && nots.length > 3);
      notifications.printNotification(n, false);
    }
  },

  /* ===== PRINT ===== */
  printNotification: function (n, highlight) {
    var app = n.name || '';
    var sender = n.title || '';
    var msg = notifications.getMessage(n);
    var isExpanded = (notifications.expandedId === n.id);

    var title = sender || app;
    if (notifications.group && n.count > 1) {
      title += ' [' + n.count + ']';
    }

    var maxLine = w - 2;
    var lines = [];

    if (isExpanded && msg) {
      lines.push(title + ':');

      var text = msg;
      while (text.length && lines.length < 3) {
        var cut = text.lastIndexOf(' ', maxLine);
        if (cut < 0) cut = maxLine;
        lines.push(text.substring(0, cut));
        text = text.substring(cut + 1);
      }
    } else {
      var single = title + (msg ? ' — ' + msg : '');
      if (single.length > maxLine) {
        single = single.substring(0, maxLine - 3) + '...';
      }
      lines.push(single);
    }

    for (var i = 0; i < lines.length; i++) {
      print(
        0,
        n.y + i,
        rightPad(lines[i], w, ' '),
        highlight || isExpanded ? '#ff3333' : '#ffffff'
      );
    }

    if (n.ellipsis && !isExpanded) {
      print(w - 4, n.y,
        '+' + (notifications.list.length - 3),
        '#999999');
    }
  },

  /* ===== INIT ===== */
  init: function () {
    ap37.setOnNotificationsListener(notifications.update);
    notifications.update();
  },

  /* ===== TOUCH ===== */
  onTouch: function (x, y) {
    if (!notifications.active) return;

    for (var i = 0; i < notifications.list.length; i++) {
      var n = notifications.list[i];

      if (y >= n.y && y <= n.y + 2) {

        /* TAP 1 → EXPAND */
        if (notifications.expandedId !== n.id) {
          notifications.expandedId = n.id;
          notifications.update();
          return;
        }

        /* TAP 2 → OPEN & REMOVE */
        notifications.expandedId = null;
        notifications.removeById(n.id);
        notifications.clearArea();

        ap37.openNotification(n.id);

        setTimeout(function () {
          notifications.update();
        }, 1200);

        return;
      }
    }
  }
};


  var transmissions = {
    list: [],
    update: function () {
      get('https://hacker-news.firebaseio.com/v0/topstories.json',
        function (response) {
          try {
            var result = JSON.parse(response),
              line = h - 4,
              t = transmissions;
            t.list = [];
            for (var i = 0; i < result.length && i < 3; i++) {
              get('https://hacker-news.firebaseio.com/v0/item/' +
                result[i] + '.json', function (itemResponse) {
                var itemResult = JSON.parse(itemResponse);
                var transmission = {
                  title: itemResult.title,
                  url: itemResult.url,
                  y: line
                };
                t.list.push(transmission);
                background.printPattern(0, w, line);
                t.printTransmission(transmission, false);
                line++;
              });
            }
          } catch (e) {
          }
        });
    },
    printTransmission: function (transmission, highlight) {
      print(c / 2, transmission.y, transmission.title,
        highlight ? '#ff3333' : '#ffffff');
      if (highlight) {
        setTimeout(function () {
          transmissions.printTransmission(transmission, false);
        }, 1000);
      }
    },
    init: function () {
      print(c / 2, h - 5, '// Transmissions');
      transmissions.update();
      setInterval(transmissions.update, 3600000);
    },
    onTouch: function (x, y) {
      for (var i = 0; i < transmissions.list.length; i++) {
        if (transmissions.list[i].y === y &&
          x <= transmissions.list[i].title.length) {
          transmissions.printTransmission(
            transmissions.list[i], true);
          ap37.openLink(transmissions.list[i].url);
          return;
        }
      }
    }
  };

  var wordGlitch = {
    tick: 0,
    length: 0,
    x: 0,
    y: 0,
    text: [],
    active: false,
    intervalId: null,
    update: function () {
      var g = wordGlitch;
      if (g.tick === 0) { // generate new glitch
        g.length = 5 + Math.floor(Math.random() * 6);
        g.x = Math.floor(Math.random() * (w - g.length));
        g.y = Math.floor(Math.random() * h);

        g.text = [];
        for (var i = 0; i < 5; i++) {
          g.text.push(Math.random().toString(36).substr(2, g.length));
        }

        ap37.print(g.x, g.y, g.text[g.tick], '#666666');
        g.tick++;
      } else if (g.tick === 5) { // remove glitch
        ap37.printMultipleColors(g.x, g.y,
          background.buffer[g.y].substr(g.x, g.length),
          background.bufferColors[g.y].slice(g.x, g.x + g.length)
        );
        g.tick = 0;
        if (!wordGlitch.active) {
          clearInterval(wordGlitch.intervalId);
        }
      } else {
        ap37.print(g.x, g.y, g.text[g.tick], '#666666');
        g.tick++;
      }
    },
    onTouch: function (x, y) {
      if (x > w - 6 && y > h - 4) {
        wordGlitch.active = !wordGlitch.active;
        if (wordGlitch.active) {
          wordGlitch.intervalId = setInterval(wordGlitch.update, 100);
        }
      }
    }
  };

  var lineGlitch = {
    tick: 0,
    line: 0,
    active: false,
    intervalId: null,
    update: function () {
      var g = lineGlitch;
      if (g.tick === 0) { // shift line
        g.line = 1 + Math.floor(Math.random() * h - 1);

        var offset = 1 + Math.floor(Math.random() * 4),
          direction = Math.random() >= 0.5;

        if (direction) {
          ap37.printMultipleColors(0, g.line,
            rightPad(
              background.buffer[g.line].substring(offset), w,
              ' '),
            background.bufferColors[g.line].slice(offset));
        } else {
          ap37.printMultipleColors(0, g.line,
            leftPad(background.buffer[g.line]
              .substring(0, w - offset), w, ' '),
            arrayFill('#ffffff', offset)
              .concat(background.bufferColors[g.line]
                .slice(0, w - offset))
          );
        }
        g.tick++;
      } else { // restore line
        ap37.printMultipleColors(
          0, g.line, background.buffer[g.line],
          background.bufferColors[g.line]);
        g.tick = 0;
        if (!lineGlitch.active) {
          clearInterval(lineGlitch.intervalId);
        }
      }
    },
    onTouch: function (x, y) {
      if (x > w - c - 6 && y > h - 4) {
        lineGlitch.active = !lineGlitch.active;
        if (lineGlitch.active) {
          lineGlitch.intervalId = setInterval(lineGlitch.update, 200);
        }
      }
    }
  };

  //utils

  function print(x, y, text, color) {
    color = color || '#ffffff';
    background.saveBuffer(x, y, text, color);
    ap37.print(x, y, text, color);
  }

  function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.response)
      }
    };
    xhr.send();
  }

  function leftPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      new Array(newLength - str.length + 1).join(char) + str : str;
  }

  function rightPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      str + new Array(newLength - str.length + 1).join(char) : str;
  }

  function arrayFill(value, length) {
    var result = [];
    for (var i = 0; i < length; i++) {
      result.push(value);
    }
    return result;
  }

  init();
})();

// API docs at: https://github.com/apseren/ap37

