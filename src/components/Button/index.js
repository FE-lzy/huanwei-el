import vButton from './index.vue';

/* istanbul ignore next */
vButton.install = function(Vue) {
  Vue.component(vButton.name, vButton);
};

export default vButton;