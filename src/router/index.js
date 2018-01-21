import Vue from 'vue';
import VueRouter from 'vue-router';

const Main = () => import('src/views/Main.vue');
const Crews = () => import('src/views/Crews.vue');
const NotFound = () => import('src/views/404.vue');
const Admin = () => import('src/views/Admin.vue');
const Login = () => import('src/views/Login.vue');
const Job = () => import('src/views/Job.vue');

Vue.use(VueRouter);

export function createRouter() {
  return new VueRouter({
    mode: 'history',

    scrollBehavior(to, from, savedPosition) {
      return savedPosition ? savedPosition : { x: 0, y: 0 };
    },

    routes: [
      { path: '/', name: 'main', component: Main },
      { path: '/crews', name: 'crews', component: Crews },
      { path: '/admin', name: 'admin', component: Admin },
      { path: '/login', name: 'login', component: Login },
      { path: '/job/:id', name: 'job', component: Job },
      { path: '*', name: 'notfound', component: NotFound }
    ]
  });
};
