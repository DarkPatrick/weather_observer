class DateTime {
  constructor(/*date, time | day, month, year, hour, minute*/) {
    if (arguments.length == 2) {
      this.day = parseInt(arguments[0][0]);
      this.month = parseInt(arguments[0][1]);
      this.year = parseInt(arguments[0][2]);
      this.hour = parseInt(arguments[1][0]);
      this.minute = parseInt(arguments[1][1]);
    } else {
      this.day = parseInt(arguments[0]);
      this.month = parseInt(arguments[1]);
      this.year = parseInt(arguments[2]);
      this.hour = parseInt(arguments[3]);
      this.minute = parseInt(arguments[4]);
    }
    var leap_years = (this.year - 1) / 4 - (this.year - 1) / 100 + (this.year - 1) / 400;
    var non_leap_years = this.year - leap_years;
    var m_in_y = leap_years * 527040 + non_leap_years * 525600;
    var m_in_m = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if (((this.year % 4 == 0) && (this.year % 100 != 0)) || (this.year % 400 == 0)) {
      m_in_m[1] = 29;
    }
    for (var i = 0; i < this.month - 1; i++) {
      m_in_y += m_in_m[i] * 1440;
    }
    m_in_y += (this.day - 1) * 1440 + this.hour * 60 + this.minute;
    this.ful_val = m_in_y;
  }
}

class FullDataArray {
  constructor(file_data) {

    var rational_num = /(?:[\+-]?(?:0\.\d+(?:[eE][\+-]?[1-9]\d*)?)|(?:[1-9]\d*(?:\.\d+)?(?:[eE][\+-]?[1-9]\d*)?))(?![\d\.\-:,\\/_#])/g;
    var date_dd_mm_yy = /(?:\D|^)(?:(?:((?:0?[1-9])|(?:[12]\d)|(?:3[01]))[\.\-:,\\/_#]((?:0?[13578])|(?:1[02]))[\.\-:,\\/_#](\d+))|(?:((?:0?[1-9])|(?:[12]\d)|(?:30))[\.\-:,\\/_#]((?:0?[469])|(?:11))[\.\-:,\\/_#](\d+))|(?:((?:0?[1-9])|(?:1\d)|(?:2[0-8]))[\.\-:,\\/_#]((?:0?2))[\.\-:,\\/_#](\d+))|(?:((?:0?[1-9])|(?:1\d)|(?:2[0-9]))[\.\-:,\\/_#]((?:0?2))[\.\-:,\\/_#]((?:(?:\d?)*(?:(?:0[48])|(?:[2468][048])|(?:[13579][26])))|(?:(?:\d?)*(?:(?:[02468][048])|(?:[13579][26]))00)|(?:0+))))/g;
    var time_hh_mm = /((?:[01]?\d)|(?:2[0-3])):([0-5]?\d)(?![\d\.\-:,\\/_#])/g;

    var temp_date_arr, date_arr, time_arr, nums_arr;

    var do_further;
    var k, r_k;

    date_arr = new Array();
    time_arr = new Array();
    nums_arr = new Array();

    do_further = true;
    k = 0;
    r_k = 0;
    while (do_further) {
      temp_date_arr = date_dd_mm_yy.exec(file_data);
      do_further = false;
      if (temp_date_arr != null) {
        for (var i = 0; i < temp_date_arr.length; i++) {
          if (temp_date_arr[i] != undefined) {
            if (r_k != 0) {
              date_arr[k - 1][r_k - 1] = temp_date_arr[i];
            } else {
              date_arr[k] = new Array(3);
              k++;
            }
            r_k = (r_k + 1) % 4;
            do_further = true;
          }
        }
      }
    }
    file_data = file_data.replace(date_dd_mm_yy, '');

    this.nums = k;

    do_further = true;
    k = 0;
    r_k = 0;
    while (do_further) {
      temp_date_arr = time_hh_mm.exec(file_data);
      do_further = false;
      if (temp_date_arr != null) {
        for (var i = 0; i < temp_date_arr.length; i++) {
          if (temp_date_arr[i] != undefined) {
            if (r_k != 0) {
              time_arr[k - 1][r_k - 1] = temp_date_arr[i];
            } else {
              time_arr[k] = new Array(2);
              k++;
            }
            r_k = (r_k + 1) % 3;
            do_further = true;
          }
        }
      }
    }
    file_data = file_data.replace(time_hh_mm, '')

    do_further = true;
    k = 0;
    while (do_further) {
      temp_date_arr = rational_num.exec(file_data);
      do_further = false;
      if (temp_date_arr != null) {
        for (var i = 0; i < temp_date_arr.length; i++) {
          if (temp_date_arr[i] != undefined) {
            nums_arr[k] = temp_date_arr[i];
            k++;
            do_further = true;
          }
        }
      }
    }
    file_data = file_data.replace(rational_num, '')

    this.date_time = new Array(this.nums);
    this.temperature = new Array(this.nums);
    this.pressure = new Array(this.nums);
    for (k = 0; k < this.nums; k++) {
      this.date_time[k] = new DateTime(date_arr[k], time_arr[k]);
      this.pressure[k] = nums_arr[k * 2];
      this.temperature[k] = nums_arr[k * 2 + 1];
    }
  }
}

function getXmlHttp() {
  var xmlhttp;

  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }

  return xmlhttp;
}

function get_data() {
  xhr = getXmlHttp();

  xhr.open('POST', 'testFile.txt', true);
  xhr.send(null);

  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      alert(xhr.status + ': ' + xhr.statusText);
    } else {
      if (old_response != xhr.responseText) {
        doAllStuff(xhr.responseText);
        old_response = xhr.responseText;
      }
      xhr.abort();
    }
    xhr.readyState = 0;
  }
};

function doAllStuff(file_data) {
  var window_width = 800;

  var data_arr = new FullDataArray(file_data);
  var min_date = new DateTime(05, 11, 2016, 20, 28);
  var max_date = new DateTime(15, 11, 2016, 20, 37);

  var total_num = 0;
  var good_dates = new Array();
  var arr_idx = new Array();
  var last_date = 0;
  var fist_date = 0;

  for (var i = 0; i < data_arr.nums; i++) {
    if ((data_arr.date_time[i].ful_val >= min_date.ful_val) &&
        (data_arr.date_time[i].ful_val <= max_date.ful_val)) {
      if (total_num == 0) {
        good_dates[total_num] = 0;
        fist_date = data_arr.date_time[i].ful_val;
      } else {
        good_dates[total_num] = data_arr.date_time[i].ful_val - last_date;
      }
      last_date = data_arr.date_time[i].ful_val;
      arr_idx[total_num] = i;
      total_num++;
    }
  }
  last_date -= fist_date;
  var step = window_width / last_date;
  for (var i = 0; i < total_num; i++) {
    good_dates[i] = Math.round(good_dates[i] * step);
  }

  var c = document.getElementById("temperature_chart_canvas");
  var ctx = c.getContext("2d");
  ctx.strokeStyle="#FF0000";
  ctx.beginPath();
  ctx.moveTo(good_dates[0], data_arr.temperature[arr_idx[0]]);
  //ctx.lineTo(300, 150);
  //ctx.lineTo(600, 0);
  for (var i = 1; i < total_num; i++) {
    ctx.lineTo(good_dates[i], data_arr.temperature[arr_idx[i]]);
  }
  ctx.stroke();
}


var xhr;
var old_response = "";
var dims = 3;
var max_rows = 10000;
/*var date_arr = new Array(max_rows);

for(var i = 0; i < max_rows; i++) {
  date_arr[i] = new Array(dims);
}
*/

get_data();
setInterval(get_data, 20000);
