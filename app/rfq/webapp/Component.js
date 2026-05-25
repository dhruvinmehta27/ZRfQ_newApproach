sap.ui.define(['sap/fe/core/AppComponent'], function (AppComponent) {
  'use strict';

  // Standalone polyfill: FE v4 calls storeInnerAppStateAsync on the ushell
  // AppState service when navigating between pages. Without a Fiori Launchpad
  // the service is absent, causing a TypeError that silently blocks navigation.
  // Providing a no-op implementation lets FE proceed normally.
  (function patchUshell() {
    if (typeof sap === 'undefined') { return; }
    sap.ushell = sap.ushell || {};
    if (sap.ushell.Container) { return; } // real shell already present
    var oState = {
      storeInnerAppStateAsync : function () { return Promise.resolve({ appStateKey: '' }); },
      setData                  : function () {},
      getData                  : function () { return {}; },
      save                     : function () { return Promise.resolve(); }
    };
    var oAppStateSvc = {
      createEmptyAppState : function () { return oState; },
      getAppState         : function () { return Promise.resolve(oState); }
    };
    sap.ushell.Container = {
      getServiceAsync : function () { return Promise.resolve(oAppStateSvc); },
      getService      : function () { return oAppStateSvc; }
    };
  })();

  return AppComponent.extend('com.zrfq.rfq.Component', {
    metadata: {
      interfaces: ['sap.ui.core.IAsyncContentCreation']
    }
  });
});
