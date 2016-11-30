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
    var leap_years = (this.year - 1) / 4 -
      (this.year - 1) / 100 + (this.year - 1) / 400;
    var non_leap_years = this.year - leap_years;
    var m_in_y = leap_years * 527040 + non_leap_years * 525600;
    var m_in_m = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if (((this.year % 4 == 0) &&
        (this.year % 100 != 0)) || (this.year % 400 == 0)) {
      m_in_m[1] = 29;
    }
    for (var i = 0; i < this.month - 1; i++) {
      m_in_y += m_in_m[i] * 1440;
    }
    m_in_y += (this.day - 1) * 1440 + this.hour * 60 + this.minute;
    this.ful_val = m_in_y;
  }

  printDateTime() {
    return (this.day +
            "/" + this.month +
            "/" + this.year +
            " #" + this.hour + 
            ":" + this.minute);
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

var window_width;
var window_height;

var data_arr;
var min_date;
var max_date;

var total_num;
var good_dates;
var arr_idx;
var last_date;
var fist_date;
var max_val;
var min_val;

var re_points;

function doAllStuff(file_data) {
  window_width = (document.body.clientWidth) * 0.95;
  window_height = (document.body.clientHeight) / 2.1;

  data_arr = new FullDataArray(file_data);
  min_date = new DateTime(05, 11, 2016, 20, 28);
  max_date = new DateTime(15, 11, 2016, 20, 37);

  total_num = 0;
  good_dates = new Array();
  arr_idx = new Array();
  last_date = 0;
  fist_date = 0;
  max_val = -1;
  min_val = 300;

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
      if (data_arr.temperature[i] < min_val) {
        min_val = data_arr.temperature[i];
      }
      if (data_arr.temperature[i] > max_val) {
        max_val = data_arr.temperature[i];
      }
      total_num++;
    }
  }
  last_date -= fist_date;
  var step = window_width / last_date;
  for (var i = 0; i < total_num; i++) {
    good_dates[i] = Math.round(good_dates[i] * step);
  }

  re_points = new Array(total_num);

  for (var i = 0; i < total_num; ++i) {
    re_points[i] = new Array(2);
    re_points[i][0] = 0;
    re_points[i][1] = 0;
  }

  var ctx = temperature_el.getContext("2d");
  ctx.strokeStyle="#FF0000";
  ctx.beginPath();
  re_points[0][0] = good_dates[0];
  re_points[0][1] = window_height - 12 -
    (data_arr.temperature[arr_idx[0]] - min_val) *
    (window_height - 12) / (max_val - min_val);
  ctx.moveTo(re_points[0][0], re_points[0][1]);

  var cur_pos = 0;
  
  for (var i = 1; i < total_num; i++) {
    cur_pos += good_dates[i];
    re_points[i][0] = cur_pos;
    re_points[i][1] = window_height - 12 -
      (data_arr.temperature[arr_idx[i]] - min_val) *
      (window_height - 12) / (max_val - min_val);
    ctx.lineTo(re_points[i][0], re_points[i][1]);
  }
  ctx.font="12px Times New Romans";
  ctx.fillText(
               data_arr.date_time[arr_idx[0]].printDateTime(),
               0,
               window_height - 2);
  ctx.fillText(
               data_arr.date_time[arr_idx[total_num - 1]].printDateTime(),
               window_width - 90,
               window_height - 2);
  /*
  todo:
    графу-календарь для выбора отрезка дат для отображения
  */
  
  ctx.stroke();
}

function getTemperaturePoints(event) {
  var x = event.clientX;
  var y = event.clientY;
  var dist, min_dist;
  var min_dist_n;
  var ctx = temperature_el.getContext("2d");

  ctx.clearRect(0, 0, window_width, window_height);
  min_dist = Math.pow(x - re_points[0][0], 2) +
    Math.pow(y - re_points[0][1], 2);
  min_dist_n = 0;
  ctx.strokeStyle="#FF0000";
  ctx.beginPath();
  ctx.moveTo(re_points[0][0], re_points[0][1]);
  for (var i = 1; i < total_num; ++i) {
    ctx.lineTo(re_points[i][0], re_points[i][1]);
    dist = Math.pow(x - re_points[i][0], 2) +
      Math.pow(y - re_points[i][1], 2);
    if (dist < min_dist) {
      min_dist = dist;
      min_dist_n = i;
    }
  }
  ctx.stroke();
  ctx.strokeStyle="#00FF00";
  ctx.beginPath();
  ctx.moveTo(0, re_points[min_dist_n][1]);
  ctx.lineTo(window_width, re_points[min_dist_n][1]);
  ctx.moveTo(re_points[min_dist_n][0], 0);
  ctx.lineTo(re_points[min_dist_n][0], window_height);
  ctx.font="12px Times New Romans";
  ctx.fillText(
               data_arr.date_time[arr_idx[0]].printDateTime(),
               0,
               window_height - 2);
  ctx.fillText(
               data_arr.date_time[arr_idx[total_num - 1]].printDateTime(),
               window_width - 90,
               window_height - 2);
  ctx.fillText(
               data_arr.date_time[arr_idx[min_dist_n]].printDateTime() + "; " +
               data_arr.temperature[arr_idx[min_dist_n]] + "°C",
               window_width / 2,
               window_height - 2);
  ctx.stroke();
}


var xhr;
var temperature_el, pressure_el;
var old_response = "";

temperature_el = document.getElementById("temperature_chart_canvas");
temperature_el.onmousemove = getTemperaturePoints;


get_data();
setInterval(get_data, 20000);

