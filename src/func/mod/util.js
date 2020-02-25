let until = {
  jsondefault: {
    'string': {
      'data': ''
    },
    'array': {
      'data': []
    },
    'number': {
      'data': 0
    },
    'boolean': {
      'data': false
    },
    'null': {
      'data': null
    }
  }
};
// 对象操作
until.showjson = function (json) {
  console.log(JSON.stringify(json));
}
until.isArray = function (data) {
  if (Array.isArray) {
    return Array.isArray(data);
  } else {
    return Object.prototype.toString.call(data) === '[object Array]';
  }
};
until.CheckType = function (data) {
  let type = typeof (data);
  if (type == 'object') {
    if (this.isArray(data)) {
      type = 'array';
    } else if (data == null) {
      type = 'null';
    }
  }
  return type;
};
until.copyjson = function (json) {
  return JSON.parse(JSON.stringify(json));
};
until.clearjson = function (json, setjson = {}) {
  for (let val in json) {
    let type = this.CheckType(json[val]);
    if (type != 'function') {
      if (type == 'object') {
        this.clearjson(json[val]);
      } else if (setjson[type]) {
        json[val] = setjson[type].data;
      } else if (this.jsondefault[type]) {
        json[val] = this.jsondefault[type].data;
      } else {
        json[val] = '';
      }
    }
  }
};

until.keyinjson = function (key, json) {
  for (let k in json) {
    if (k == key) {
      return true;
    }
  }
  return false;
};
until.copyto = function (data, json) {
  for (let val in data) {
    json[val] = data[val];
  }
};
until.copyarrayto = function (data, arr) {
  for (let n in data) {
    arr.push(data[n]);
  }
};
until.isinarray = function (val, arr) {
  if (arr.indexOf(val) > -1) {
    return true;
  } else {
    return false;
  }
};
until.change = function (main, fg, val) {
  for (let n in main) {
    main[n][fg] = false;
  }
  if (val) {
    val[fg] = true;
  }
};
// 字符串操作

until.setstring = function (str, interval = '0', target = 2, type = 'head') {
  str = str.toString();
  interval = interval.toString();
  for (let i = 0; str.length < target; i++) {
    if (type == 'head') {
      str = interval + str;
    } else if (type == 'foot') {
      str = str + interval;
    } else {
      return str;
    }
  }
  return str;
}

// 数字操作

until.getnum = function (original, type = 'round', radix = 2) { // 格式化数字
  let num = parseFloat(original);
  if (isNaN(num)) {
    num = 0;
    console.log('NAN is find');
  } else if (Math.round(num) !== num) {
    let rate = Math.pow(10, radix);
    num = Math[type](num * rate) / rate;
  }
  return num;
}

until.getrandom = function (start = 0, size = 10) {
  return start + Math.floor(Math.random() * size);
}

// 日期操作函数
until.CreateDateObj = function () {
  return {
    date: null,
    origin: {}, // 数字数据
    str: {} // 字符串数据
  }
}
until.BuildDateObjByAct = function (act, TimeData) {
  let DateObj = this.CreateDateObj();
  if (act == 'time') {
    DateObj.date = new Date(TimeData);
  } else if (act == 'date') {
    DateObj.date = TimeData;
  }
  this.CountDateObj(DateObj);
  return DateObj;
}
until.CountDateObj = function (DateObj) {
  DateObj.origin.time = DateObj.date.getTime();
  DateObj.origin.year = DateObj.date.getFullYear();
  DateObj.origin.month = DateObj.date.getMonth() + 1;
  DateObj.origin.date = DateObj.date.getDate();
  DateObj.origin.hour = DateObj.date.getHours();
  DateObj.origin.min = DateObj.date.getMinutes();
  DateObj.origin.sec = DateObj.date.getSeconds();
  // 字符串格式化02
  DateObj.str.time = DateObj.origin.time.toString();
  DateObj.str.year = DateObj.origin.year.toString();
  DateObj.str.month = this.setstring(DateObj.origin.month);
  DateObj.str.date = this.setstring(DateObj.origin.date);
  DateObj.str.hour = this.setstring(DateObj.origin.hour);
  DateObj.str.min = this.setstring(DateObj.origin.min);
  DateObj.str.sec = this.setstring(DateObj.origin.sec);
}
until.TimestampToStr = function (timestamp, start = 0, end = 5, spitlist) {
  let funclist = [
    {
      func: 'getFullYear',
      offset: 0
    },
    {
      func: 'getMonth',
      offset: 1
    },
    {
      func: 'getDate',
      offset: 0
    },
    {
      func: 'getHours',
      offset: 0
    },
    {
      func: 'getMinutes',
      offset: 0
    },
    {
      func: 'getSeconds',
      offset: 0
    }
  ];
  if (!spitlist) {
    spitlist = ['-', '-', ' ', ':', ':', ''];
  }
  let res = '';
  let dateobj = new Date(timestamp);
  for (let i = start; i <= end; i++) {
    res += this.setstring(dateobj[funclist[i].func]() + funclist[i].offset);
    if (spitlist[i]) {
      res += spitlist[i];
    }
  }
  return res;
}

until.FuncFile = function (from, to, data, filename) {
  return new Promise((resolve) => {
    if (from == 'DATAURL') {
      let arr = data.split(',');
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      if (to == 'BLOB') {
        resolve({ data: new Blob([u8arr], { type: mime }) });
      } else if (to == 'FILE') {
        console.log('this is never use, func this name');
        resolve({ data: new File([u8arr], '', { type: mime }) });
      }
    } else if (from == 'FILE') {
      if (to == 'DATAURL') {
        let reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = function (e) {
          resolve({ data: e.target.result });
        }
      } else if (to == 'BLOB') {
        console.log('this is never use, check right');
        resolve({ data: new Blob([data], { type: data.type }) });
      }
    } else if (from == 'BLOB') {
      if (to == 'DATAURL') {
        let reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = function (e) {
          resolve({ data: e.target.result });
        }
      } else if (to == 'FILE') {
        let suffix = data.type.split('/')[1];
        if (!filename) {
          filename = 'newfile';
        }
        filename = filename + '.' + suffix;
        resolve({ data: new File([data], filename, { type: data.type }) });
      }
    }
  });
}



export default until;