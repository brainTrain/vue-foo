/**
  FB js SDK plugin
  lovingly lifted from: https://stackoverflow.com/questions/43665115/i-use-nuxtvue-js-how-to-use-facebook-sdk
*/

/* eslint-disable */
import Vue from 'vue';

const VueFB = {};

VueFB.install = function install (Vue, options) {
  (function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return};
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'))

  window.fbAsyncInit = function onSDKInit() {
    FB.init(options);
    FB.AppEvents.logPageView();
    Vue.FB = FB;
    window.dispatchEvent(new Event('fb-sdk-ready'));
  }
  Vue.FB = undefined;
}

Vue.use(VueFB, {
  appId: '1609724182447275',
  autoLogAppEvents: true,
  xfbml: true,
  version: 'v2.11',
});

export default VueFB;
