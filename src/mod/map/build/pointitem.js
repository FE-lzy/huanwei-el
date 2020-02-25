import _plugin from '../plugin';
import _mapsearch from './mapsearch';

let icon = {
  default: {
    start: require('./../../../../public/images/point/start.svg'),
    base: require('./../../../../public/images/point/middle.svg'),
    end: require('./../../../../public/images/point/end.svg')
  },
  back: {
    start: require('./../../../../public/images/point/start-back.svg'),
    base: require('./../../../../public/images/point/middle-back.svg'),
    end: require('./../../../../public/images/point/end-back.svg')
  }
};
let id = 0;
/*
标记点类
1.通过maintype进行对应的路线的判断
2.通过对象引用回调对应路线的函数，在路线中对点进行操作 - 如何辨别点的额外属性

*/
class pointitem {
  load = '';
  roadtype = ''; // roadtype为点归属的道路对象的标记，detault back
  current = 'base'; // 当前选中的对象，需要设置大小
  icon = ''; // start end base
  show = false;
  mapprogram = null;
  program = null;
  callback = {

  };
  data = {
    description: '',
    lng: '',
    lat: ''
  }
  extdata = {

  };
  constructor(initdata) {
    if (initdata) {
      this.FuncInit(initdata);
    }
    this.id = id;
    id++;
  }
  // 该函数会在创建和调整的时候调用，在创建的时候进行判断
  FuncInit({ roadtype, type, map, lng, lat, hide, extdata, callback }) {
    this.SetOpttions(roadtype, type, map);
    this.SetLnglat(lng, lat);
    this.FuncExtdata('init', extdata);
    this.FuncShow('set', !hide);
    this.FuncCallback('set', callback);
    this.FuncBuild();
  }
  FuncBuild() {
    if (!this.load) {
      this.program = _plugin.FuncMod('marker', {
        options: {
          position: [this.data.lng, this.data.lat],
          content: this.GetContent(this.type),
          title: '拖动以更改路线',
          offset: this.GetOffset(),
          draggable: true,
          zIndex: 109
        },
        map: this.mapprogram
      });
      this.program.on('click', (e) => {
        this.FuncSetCurrent();
      });
      this.program.on('dragstart', (e) => {
        this.FuncSetCurrent();
      });
      this.program.on('dragend', (e) => {
        this.SetLnglat(e.lnglat.lng, e.lnglat.lat);
        this.FuncCallback('trigger', {
          event: 'dragend',
          pointitem: this
        });
      });
      this.load = 'success';
    } else {
      // this.ReContent();
      this.FuncAct('move', this.GetLnglat());
    }
    this.FuncShow('synchro');
  }
  FuncCurrentType(current) {
    if (this.current != current) {
      this.current = current;
      this.GetOffset();
      this.ReContent();
    }
  }
  FuncSetCurrent() {
    this.FuncCallback('trigger', {
      event: 'current',
      pointitem: this
    });
  }
  FuncCallback(act, data) {
    if (act == 'set') {
      if (data) {
        this.callback[data.name] = data.func;
      }
    } else if (act == 'trigger') {
      for (let v in this.callback) {
        this.callback[v](data);
      }
    }
  }
  SetType(type) {
    this.type = type;
    this.ReContent();
  }
  ReBuild(type, show) {
    this.SetType(type);
    this.FuncShow('set', show);
    this.FuncShow('synchro');
  }
  ReContent() {
    this.program.setContent(this.GetContent(this.type));
  }

  FuncExtdata(act, data) {
    if (act == 'init') {
      this.extdata = data || {};
    } else if (act == 'get') {
      return this.extdata;
    }
  }
  SetOpttions(roadtype = 'default', type = 'base', map) {
    this.roadtype = roadtype;
    this.type = type;
    this.mapprogram = map;
  }
  FuncShow(act, data) {
    if (act == 'set') {
      this.show = data;
    } else if (act == 'synchro') { // 根据当前显示值进行显示隐藏的同步操作
      if (this.show) {
        if (!this.load) {
          this.FuncBuild();
        }
        this.FuncAct('show');
      } else {
        this.FuncAct('hide');
      }
    }
  }
  // 设置经纬度，操作为数据同步，也就是点已经在对应位置而仅仅是把经纬度数据更改，此时需要进行描述的拉取操作set
  SetLnglat(lng, lat, move) {
    this.data.lng = lng;
    this.data.lat = lat;
    this.GetDescription();
    if (move == 'move') {
      this.FuncAct('move', this.GetLnglat());
    }
  }
  GetLnglat(type = 'array') {
    if (type == 'array') {
      return [this.data.lng, this.data.lat];
    } else {
      return {
        lng: this.data.lng,
        lat: this.data.lat
      };
    }
  }
  GetDescription() {
    if (this.data.lng && this.data.lat) {
      _mapsearch.GetData(this.data.lng, this.data.lat).then(res => {
        this.data.description = res.position;
      }, res => {
      });
    }
  }
  ReOffset() {
    this.program.setOffset(this.GetOffset());
  }
  GetOffset() {
    let mainwidth = this.GetCurrentWidth('main');
    let width = this.GetCurrentWidth();
    let basex = mainwidth / 2 * -1;
    let padding = (mainwidth - width) / 2;
    let baseyoffset = 2;
    let basey;
    if (this.roadtype == 'default') {
      basey = (width + padding) * -1 + baseyoffset;
    } else {
      basey = 0 - padding - baseyoffset;
    }
    return _plugin.FuncMod('pixel', {
      options: [basex, basey]
    });
  }
  GetCurrentWidth(type = 'current') {
    let width = {
      main: 50,
      current: 40,
      base: 28
    }
    return width[type];
  }
  GetContent(type) {
    let src = icon[this.roadtype][type];
    let mainwidth = this.GetCurrentWidth('main');
    let width = this.GetCurrentWidth(this.current);
    let padding = (mainwidth - width) / 2;
    let html = `
      <div style="width: ${mainwidth}px; height: ${mainwidth}px; padding: ${padding}px;">
        <img style="width: ${width}px; height: ${width}px; " src="${src}" />
      </div>
    `.trim();
    return html;
  }
  FuncAct(act, data) {
    if (this.program) {
      if (act == 'move') {
        this.program.setPosition(data);
      } else if (act == 'show') {
        this.program.show();
        this.show = true;
      } else if (act == 'hide') {
        this.program.hide();
        this.show = false;
      } else if (act == 'destroy') {
        this.program.setMap(null);
        this.program = null;
        this.load = '';
        this.show = false;
      }
    }
  }
}

export default pointitem;
