import Vue from 'vue';
import App from './App.vue';
import store from "./store";
import vuetify from '@/plugins/vuetify';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VueSimpleAlert from "vue-simple-alert";
import * as VueGoogleMaps from "vue2-google-maps";

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueSimpleAlert)
Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyANNhhnYtpyshgxBFO8DXPQ7xpLDLgy-Vw",
    libraries: "places" // necessary for places input
  }
});

new Vue({
  vuetify,
  store,
  render: h => h(App),
}).$mount('#app')

