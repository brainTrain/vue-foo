import Vue from 'vue';
import Router from 'vue-router';
import Homepage from '@/components/homepage';
import RadioheadGifs from '@/components/radiohead-gifs';
import RHMBTopics from '@/components/rhmb-topics';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Homepage',
      component: Homepage,
    },
    {
      path: '/radiohead',
      name: 'RadioheadGifs',
      component: RadioheadGifs,
    },
    {
      path: '/rhmb-topics',
      name: 'RHMBTopics',
      component: RHMBTopics,
    },
  ],
});
