import Vue from 'vue';
import { createApp } from './app';
import { findAsyncComponents } from './helpers';
import { beforeRouteUpdate, clientTitleMixin } from './mixins';
import { setupHttpClient } from './utils'

Vue.mixin({
  mounted: clientTitleMixin,
  // See docs to understand why this is necessary
  beforeRouteUpdate
});

setupHttpClient();

const { app, store, router } = createApp();

// *********************
// Replace store
// *********************

// Server filled the store - don't need to do it again
// on the client side
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

// *********************
// Main logic
// *********************

router.onReady(() => {
  store.dispatch('user/fetchUserInfo');
  // store.commit('user/setPreferences', { cookies: document.cookie })

  router.beforeResolve(async (to, from, next) => {
    const matchedPrev = router.getMatchedComponents(from);
    const matchedCurr = router.getMatchedComponents(to);

    let diffed = false;
    const activated = matchedCurr.filter((component, i) => {
      return diffed || (diffed = (matchedPrev[i] !== component));
    });

    // 404: message + stay on the current page
    if (!matchedCurr.length) {
      Vue.prototype.$toast.open({
        message: 'Error 404: Page Not Found',
        type: 'is-danger'
      });
      return next(false);
    }

    // console.log('no progress bar anymore :(')
    // Vue.prototype.$Progress.fail();

    // Don't need to resolve async components if nothing changed
    if (!activated.length) {
      return next();
    }

    const asyncDataPromises = findAsyncComponents({
      components: activated,
      store,
      route: to
    });

    const promisesExist = asyncDataPromises.length > 0;
    const progressBar = Vue.prototype.$Progress;

    if (promisesExist) {
      progressBar.start();
      try {
        await Promise.all(asyncDataPromises);
      } catch (error) {
        progressBar.fail();
        return next(false);
      }
      progressBar.finish();
    }

    next();
  }); // router.beforeResolve

  app.$mount('#app');
});
