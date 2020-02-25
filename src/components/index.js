import vbutton from './Button/index.vue';
const components = {
  vbutton
}

const install = function (Vue) {
  if (install.installed) return;
  components.map(component => Vue.component(component.name, component));
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
// Vue.component('vButton',vbutton)

// if(typeof window !== 'undefined' && window.Vue){
//     install(window.Vue)
// }

export default {
  install
}