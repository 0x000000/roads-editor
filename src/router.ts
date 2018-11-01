import Vue from 'vue';
import Router from 'vue-router';
import Builder from './views/builder.vue';
import About from './views/about.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Builder,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
});
