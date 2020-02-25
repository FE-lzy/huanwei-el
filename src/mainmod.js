import mod_depend from './mod/depend';
import mod_date from './mod/date';

import mod_formatType from './mod/formatType';
import mod_map from './mod/map/main';

import mod_moddata from './mod/moddata';
import mod_device from './mod/device';
import mod_buildroad from './mod/map/build/buildroad';

let mainmod = {
  depend: mod_depend,
  date: mod_date,
  formatType: mod_formatType,
  map: mod_map,
  moddata: mod_moddata,
  device: mod_device,
  buildroad: mod_buildroad,
  screenful: { data: 0 }
}

mainmod.depend.LoadModDo = function (modname) {
  return new Promise((resolve, reject) => {
    if (modname == 'formatType') {
      mainmod.formatType.FuncInit().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'modcar') {
      mainmod.moddata.data.car.FuncInit().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'modroad') {
      mainmod.moddata.data.road.FuncInit().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'modtrash') {
      mainmod.moddata.data.trash.FuncInit().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'modparking') {
      mainmod.moddata.data.parking.FuncInit().then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'moddevice') {
      mainmod.device.FuncInit('total', mainmod.moddata).then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    } else if (modname == 'modotherdevice') {
      mainmod.device.FuncInit('other', mainmod.moddata).then(res => {
        resolve(res);
      }, res => {
        reject(res);
      });
    }
  });
};

export default mainmod;