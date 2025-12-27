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
    print(c, 0, '        gml-rnd'); // user name
    print(c, 1, '   live is never flat'); // user quotes 
    time.init();
    battery.init();
    apps.init();
    notifications.init();
    notes.init();
    transmissions.init();
    print(w - c - 5, h - 1, 'EOF');


    ap37.setOnTouchListener(function (x, y) {
      apps.onTouch(x, y);
      notifications.onTouch(x, y);
      notes.onTouch(x, y);
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

var notes = {
    catatanList: [
        "check saham BMRI",
        "cuci baju seragam", 
        "check code untuk catatan",
        "null"
    ],
    indexSekarang: 0,
    posisiY: 0,
    modeInput: false,
    
    // KATA KUNCI YANG LEBIH SEDIKIT AGAR MUAT DI LAYAR
    kataKunci: [
        ["check", "cuci", "bayar", "ambil"],          // 4 kata
        ["baju", "sepatu", "kerja", "saham"],           // 4 kata  
        ["pagi", "sore", "besok", "nanti"],          // 4 kata
        ["kantor", "rumah", "toko", "bank"],         // 4 kata
        ["penting", "ingat", "urgent", "selesai"]    // 4 kata
    ],
    pilihanSekarang: [0, 0],
    teksSementara: "",
    
    muat: function () {
        // POSISI YANG LEBIH AMAN: di bawah notifikasi atau di tengah layar
        notes.posisiY = Math.floor(h / 2) - 2; // Tengah layar
        notes.tampilkan();
    },
    
    tampilkan: function () {
        // Bersihkan area notes (6 baris)
        for (var i = 0; i < 6; i++) {
            print(0, notes.posisiY + i, rightPad('', w, ' '), '#000000');
        }
        
        if (notes.modeInput) {
            notes.tampilkanModeInput();
        } else {
            notes.tampilkanModeNormal();
        }
    },
    
    tampilkanModeNormal: function () {
        // HEADER DITENGAH
        print(Math.floor(w/2) - 4, notes.posisiY, 'CATATAN', '#ffffff');
        
        if (notes.catatanList.length > 0) {
            var catatan = notes.catatanList[notes.indexSekarang];
            var maxPanjang = w - 10;
            var teksDitampilkan = catatan;
            
            if (teksDitampilkan.length > maxPanjang) {
                teksDitampilkan = teksDitampilkan.substring(0, maxPanjang - 3) + "...";
            }
            
            var nomor = "[" + (notes.indexSekarang + 1) + "/" + notes.catatanList.length + "] ";
            // Pusatkan teks
            var posisiX = Math.max(2, Math.floor((w - (nomor.length + teksDitampilkan.length)) / 2));
            print(posisiX, notes.posisiY + 1, nomor + teksDitampilkan, '#33ff33');
        } else {
            print(Math.floor(w/2) - 10, notes.posisiY + 1, "(Tekan BUAT untuk mulai)", '#999999');
        }
        
        // TOMBOL YANG LEBIH SEDERHANA
        var tombolY = notes.posisiY + 2;
        if (notes.catatanList.length > 0) {
            // Hitung posisi agar tombol tidak keluar layar
            var tengah = Math.floor(w/2);
            print(tengah - 15, tombolY, 'BUAT', '#cccccc');
            print(tengah - 8, tombolY, 'EDIT', '#cccccc'); 
            print(tengah, tombolY, 'HAPUS', '#cccccc');
            print(tengah + 10, tombolY, '<  >', '#cccccc');
        } else {
            print(Math.floor(w/2) - 6, tombolY, '[ BUAT CATATAN ]', '#33ff33');
        }
    },
    
    tampilkanModeInput: function () {
        // HEADER INPUT
        print(Math.floor(w/2) - 8, notes.posisiY, '✏️ BUAT CATATAN', '#33ff33');
        
        // TEKS YANG SEDANG DIKETIK (DITENGAH)
        var teksBaris = '» ' + notes.teksSementara;
        if (teksBaris.length > w - 4) {
            teksBaris = '» ' + notes.teksSementara.substring(0, w - 8) + "...";
        }
        var posisiTeks = Math.max(2, Math.floor((w - teksBaris.length) / 2));
        print(posisiTeks, notes.posisiY + 1, teksBaris, '#ffffff');
        
        // KATEGORI (MAKSIMAL 4 AGAR MUAT)
        var kategori = ["AKSI", "BARANG", " WAKTU", " LOKASI"];
        var yKategori = notes.posisiY + 2;
        var lebarKategori = 6; // Karakter per kategori
        var totalLebar = kategori.length * lebarKategori;
        var startX = Math.max(2, Math.floor((w - totalLebar) / 2));
        
        for (var i = 0; i < kategori.length; i++) {
            var warna = (i === notes.pilihanSekarang[0]) ? '#ff3333' : '#999999';
            print(startX + (i * lebarKategori), yKategori, kategori[i], warna);
        }
        
        // KATA DALAM KATEGORI (MAKSIMAL 3 KATA PER BARIS)
        var yKata = notes.posisiY + 3;
        var kataList = notes.kataKunci[notes.pilihanSekarang[0]];
        var kataPerBaris = Math.min(3, Math.floor((w - 4) / 8)); // Sesuaikan dengan lebar layar
        var lebarKata = 8;
        var startXKata = Math.max(2, Math.floor((w - (kataPerBaris * lebarKata)) / 2));
        
        for (var j = 0; j < Math.min(kataPerBaris, kataList.length); j++) {
            var warnaKata = (j === notes.pilihanSekarang[1]) ? '#33ff33' : '#cccccc';
            var kata = kataList[j];
            if (kata.length > 7) kata = kata.substring(0, 7);
            print(startXKata + (j * lebarKata), yKata, kata, warnaKata);
        }
        
        // TOMBOL NAVIGASI SEDERHANA
        var yTombol = notes.posisiY + 4;
        var tengah = Math.floor(w/2);
        print(tengah - 15, yTombol, '←', (notes.pilihanSekarang[1] > 0) ? '#ffffff' : '#555555');
        print(tengah - 5, yTombol, '→', '#ffffff');
        print(tengah + 5, yTombol, '↑', '#ffffff');
        print(tengah + 15, yTombol, '↓', '#ffffff');
        
        // TOMBOL AKSI
        var yAksi = notes.posisiY + 5;
        print(tengah - 20, yAksi, 'TAMBAH', '#33ff33');
        print(tengah - 10, yAksi, 'SPASI', '#cccccc');
        print(tengah, yAksi, 'HAPUS', '#ff3333');
        print(tengah + 10, yAksi, 'SIMPAN', '#33ff33');
    },
    
    // [FUNGSI LAINNYA TETAP SAMA - hanya ganti nama fungsi yang dipanggil]
    pilihKategori: function (kategori) {
        notes.pilihanSekarang[0] = kategori;
        notes.pilihanSekarang[1] = 0;
        notes.tampilkan();
    },
    
    pilihKata: function (arah) {
        var kataList = notes.kataKunci[notes.pilihanSekarang[0]];
        
        if (arah === 'kanan') {
            notes.pilihanSekarang[1]++;
            if (notes.pilihanSekarang[1] >= kataList.length) {
                notes.pilihanSekarang[1] = 0;
            }
        } else if (arah === 'kiri') {
            notes.pilihanSekarang[1]--;
            if (notes.pilihanSekarang[1] < 0) {
                notes.pilihanSekarang[1] = kataList.length - 1;
            }
        } else if (arah === 'atas') {
            notes.pilihanSekarang[0]--;
            if (notes.pilihanSekarang[0] < 0) {
                notes.pilihanSekarang[0] = notes.kataKunci.length - 1;
            }
            notes.pilihanSekarang[1] = 0;
        } else if (arah === 'bawah') {
            notes.pilihanSekarang[0]++;
            if (notes.pilihanSekarang[0] >= notes.kataKunci.length) {
                notes.pilihanSekarang[0] = 0;
            }
            notes.pilihanSekarang[1] = 0;
        }
        notes.tampilkan();
    },
    
    tambahKata: function () {
        var kataList = notes.kataKunci[notes.pilihanSekarang[0]];
        if (notes.pilihanSekarang[1] < kataList.length) {
            var kata = kataList[notes.pilihanSekarang[1]];
            notes.teksSementara += (notes.teksSementara ? " " : "") + kata;
            notes.tampilkan();
        }
    },
    
    tambahSpasi: function () {
        notes.teksSementara += " ";
        notes.tampilkan();
    },
    
    hapusKarakter: function () {
        if (notes.teksSementara.length > 0) {
            notes.teksSementara = notes.teksSementara.substring(0, notes.teksSementara.length - 1);
            notes.tampilkan();
        }
    },
    
    simpanCatatan: function () {
        if (notes.teksSementara.trim() !== "") {
            notes.catatanList.unshift(notes.teksSementara.trim());
            
            if (notes.catatanList.length > 10) {
                notes.catatanList = notes.catatanList.slice(0, 10);
            }
            
            notes.indexSekarang = 0;
            notes.modeInput = false;
            notes.teksSementara = "";
            notes.tampilkan();
        }
    },
    
    batalInput: function () {
        notes.modeInput = false;
        notes.teksSementara = "";
        notes.tampilkan();
    },
    
    mulaiBuatBaru: function () {
        notes.modeInput = true;
        notes.teksSementara = "";
        notes.pilihanSekarang = [0, 0];
        notes.tampilkan();
    },
    
    editCatatanSekarang: function () {
        if (notes.catatanList.length === 0) return;
        notes.modeInput = true;
        notes.teksSementara = notes.catatanList[notes.indexSekarang];
        notes.pilihanSekarang = [0, 0];
        notes.tampilkan();
    },
    
    hapusCatatanSekarang: function () {
        if (notes.catatanList.length === 0) return;
        notes.catatanList.splice(notes.indexSekarang, 1);
        if (notes.catatanList.length === 0) {
            notes.indexSekarang = 0;
        } else if (notes.indexSekarang >= notes.catatanList.length) {
            notes.indexSekarang = notes.catatanList.length - 1;
        }
        notes.tampilkan();
    },
    
    catatanSebelumnya: function () {
        if (notes.catatanList.length === 0) return;
        notes.indexSekarang--;
        if (notes.indexSekarang < 0) {
            notes.indexSekarang = notes.catatanList.length - 1;
        }
        notes.tampilkan();
    },
    
    catatanBerikutnya: function () {
        if (notes.catatanList.length === 0) return;
        notes.indexSekarang++;
        if (notes.indexSekarang >= notes.catatanList.length) {
            notes.indexSekarang = 0;
        }
        notes.tampilkan();
    },
    
    init: function () {
        notes.muat();
    },
    
    onTouch: function (x, y) {
        if (!notes.modeInput) {
            // MODE NORMAL
            if (notes.catatanList.length > 0) {
                if (y === notes.posisiY + 2) {
                    var tengah = Math.floor(w/2);
                    if (x >= tengah - 22 && x <= tengah - 18) notes.mulaiBuatBaru();
                    else if (x >= tengah - 10 && x <= tengah - 6) notes.editCatatanSekarang();
                    else if (x >= tengah - 2 && x <= tengah + 2) notes.hapusCatatanSekarang();
                    else if (x >= tengah + 8 && x <= tengah + 12) notes.catatanSebelumnya();
                    else if (x >= tengah + 14 && x <= tengah + 18) notes.catatanBerikutnya();
                }
                // Klik teks untuk navigasi
                else if (y === notes.posisiY + 1) {
                    if (x < w/2) notes.catatanSebelumnya();
                    else notes.catatanBerikutnya();
                }
            } else if (y === notes.posisiY + 2) {
                // Hanya tombol BUAT
                var tengah = Math.floor(w/2);
                if (x >= tengah - 6 && x <= tengah + 7) notes.mulaiBuatBaru();
            }
        } else {
            // MODE INPUT
            var tengah = Math.floor(w/2);
            
            // Baris kategori (y = posisiY + 2)
            if (y === notes.posisiY + 2) {
                var kategori = ["AKSI", "BARANG", " WAKTU", " LOKASI"];
                var lebarKategori = 6;
                var totalLebar = kategori.length * lebarKategori;
                var startX = Math.max(2, Math.floor((w - totalLebar) / 2));
                
                for (var i = 0; i < kategori.length; i++) {
                    if (x >= startX + (i * lebarKategori) && x <= startX + (i * lebarKategori) + lebarKategori) {
                        notes.pilihKategori(i);
                        return;
                    }
                }
            }
            
            // Baris navigasi (y = posisiY + 4)
            if (y === notes.posisiY + 4) {
                if (x >= tengah - 16 && x <= tengah - 14) notes.pilihKata('kiri');
                else if (x >= tengah - 6 && x <= tengah - 4) notes.pilihKata('kanan');
                else if (x >= tengah + 4 && x <= tengah + 6) notes.pilihKata('atas');
                else if (x >= tengah + 14 && x <= tengah + 16) notes.pilihKata('bawah');
            }
            
            // Baris aksi (y = posisiY + 5)
            if (y === notes.posisiY + 5) {
                if (x >= tengah - 22 && x <= tengah - 18) notes.tambahKata();
                else if (x >= tengah - 12 && x <= tengah - 8) notes.tambahSpasi();
                else if (x >= tengah - 2 && x <= tengah + 2) notes.hapusKarakter();
                else if (x >= tengah + 8 && x <= tengah + 12) notes.simpanCatatan();
            }
            
            // Klik di header untuk batal
            if (y === notes.posisiY && x > tengah + 20) {
                notes.batalInput();
            }
        }
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

  var notifications = {
    list: [],
    active: true,
    group: false,
    displayed: [],
    openedNotifications: [], // Array untuk menyimpan ID notifikasi yang sudah dibuka
    
    update: function () {
      notifications.active = ap37.notificationsActive();
      
      // Hitung posisi notifikasi: setelah aplikasi
      var startY = apps.topMargin + (apps.lines * (apps.rowGap + 1)) + 1;
      
      if (notifications.active) {
        var nots = notifications.group ?
          ap37.getNotificationGroups() : ap37.getNotifications();
        
        // Filter notifikasi yang sudah dibuka
        notifications.list = [];
        for (var n = 0; n < nots.length; n++) {
          var notif = nots[n];
          var isOpened = false;
          for (var o = 0; o < notifications.openedNotifications.length; o++) {
            if (notifications.openedNotifications[o] === notif.id) {
              isOpened = true;
              break;
            }
          }
          if (!isOpened) {
            notifications.list.push(notif);
          }
        }
        
        notifications.displayed = [];
        
        // Bersihkan area notifikasi (3 baris)
        for (var i = 0; i < 3; i++) {
          var y = startY + i;
          print(0, y, rightPad('', w, ' '), '#000000');
        }
        
        // Tampilkan notifikasi yang belum dibuka (maksimal 3)
        for (var i = 0; i < 3 && i < notifications.list.length; i++) {
          var y = startY + i;
          var notif = notifications.list[i];
          notif.y = y;
          
          notifications.displayed.push(notif);
          
          if (i == 2 && notifications.list.length > 3) {
            notif.ellipsis = true;
          } else {
            notif.ellipsis = false;
          }
          notifications.printNotification(notif, false);
        }
        
        // Clear baris kosong jika notifikasi kurang dari 3
        for (var i = notifications.list.length; i < 3; i++) {
          var y = startY + i;
          print(0, y, rightPad('', w, ' '), '#000000');
        }
      } else {
        // Clear area notifikasi
        for (var i = 0; i < 3; i++) {
          var y = startY + i;
          print(0, y, rightPad('', w, ' '), '#000000');
        }
        // Tombol aktivasi di posisi yang benar
        print(c / 2, startY, 'Activate notifications', '#ffffff');
      }
    },
    
    printNotification: function (notification, highlight) {
      var name = notification.name;
      var preview = "";
      
      // Tambahkan preview pesan berdasarkan aplikasi
      if (notification.package) {
        if (notification.package.includes("whatsapp") || notification.package.includes("com.whatsapp")) {
          // Preview untuk WhatsApp
          var text = notification.text || notification.content || notification.title || "";
          preview = " - " + text.substring(0, 20) + (text.length > 20 ? "..." : "");
        } else if (notification.package.includes("email") || notification.package.includes("gmail")) {
          // Preview untuk email
          var subject = notification.title || notification.subject || "";
          preview = " - " + subject.substring(0, 20) + (subject.length > 20 ? "..." : "");
        } else {
          // Preview untuk aplikasi lain
          var content = notification.text || notification.content || notification.title || "";
          if (content && content !== name) {
            preview = " - " + content.substring(0, 15) + (content.length > 15 ? "..." : "");
          }
        }
      }
      
      if (notifications.group && notification.count > 1) {
        name += ' [' + notification.count + ']';
      }
      
      if (notification.ellipsis) {
        var length = Math.min(name.length, w - c / 2 - 10);
        name = name.substring(0, length) + "... +" + (notifications.list.length - 3);
      }
      
      print(c / 2, notification.y, name + preview, highlight ? '#ff3333' : '#ffffff');
    },
    
    init: function () {
      // Hapus listener lama jika ada
      ap37.setOnNotificationsListener(null);
      
      // Set listener baru dengan debouncing
      ap37.setOnNotificationsListener(function() {
        if (notifications.updateTimeout) {
          clearTimeout(notifications.updateTimeout);
        }
        notifications.updateTimeout = setTimeout(function() {
          notifications.update();
        }, 500);
      });
      
      notifications.update();
    },
    
    onTouch: function (x, y) {
      // Hitung posisi notifikasi
      var startY = apps.topMargin + (apps.lines * (apps.rowGap + 1)) + 1;
      
      // Cek apakah klik berada di area notifikasi
      if (notifications.active && 
          y >= startY && 
          y < startY + 3) {
        
        // Cari notifikasi yang ditampilkan pada posisi Y yang diklik
        for (var i = 0; i < notifications.displayed.length; i++) {
          if (notifications.displayed[i].y === y) {
            var notif = notifications.displayed[i];
            
            // Tampilkan highlight
            notifications.printNotification(notif, true);
            
            // Tambahkan ke daftar notifikasi yang sudah dibuka
            notifications.openedNotifications.push(notif.id);
            
            // Hapus dari list yang ditampilkan
            var index = -1;
            for (var j = 0; j < notifications.list.length; j++) {
              if (notifications.list[j].id === notif.id) {
                index = j;
                break;
              }
            }
            if (index !== -1) {
              notifications.list.splice(index, 1);
            }
            
            // Buka notifikasi
            if (notif.id) {
              ap37.openNotification(notif.id);
            }
            
            // Update tampilan tanpa delay
            notifications.update();
            
            return;
          }
        }
      } 
      // Tombol "Activate notifications"
      else if (!notifications.active) {
        var startY = apps.topMargin + (apps.lines * (apps.rowGap + 1)) + 1;
        if (y === startY && x >= c/2 && x <= c/2 + 20) {
          ap37.requestNotificationsPermission();
          setTimeout(function() {
            notifications.update();
          }, 1000);
        }
      }
    },
    
    // Fungsi untuk menghapus semua notifikasi yang sudah dibuka
    clearOpened: function() {
      notifications.openedNotifications = [];
      notifications.update();
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
    var step = 3.5;

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
      var idx = Math.floor((x - 2) / 3.5);

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
