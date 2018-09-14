import Vue from 'vue';
import Vuex from 'vuex';
import * as modules from './modules';

Vue.use(Vuex);

const isDevelopment = process.env.NODE_ENV !== 'production';

export function createStore() {
  return new Vuex.Store({
    strict: isDevelopment,
    modules
  });
}
