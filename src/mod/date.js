import _func from '@/func/main';

let date = {
  current: {}
}
date.ResetCurrent = function () {
  this.current = _func.BuildDateObjByAct('date', new Date());
}
date.ResetCurrent();
export default date;