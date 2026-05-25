sap.ui.define([
  'sap/fe/core/AppComponent',
  'sap/ui/core/service/ServiceFactoryRegistry',
  'sap/ui/core/service/ServiceFactory'
], function (AppComponent, ServiceFactoryRegistry, ServiceFactory) {
  'use strict';

  // Standalone polyfill: FE v4 calls storeInnerAppStateAsync on the ushell
  // AppState service when navigating between pages. Without a Fiori Launchpad
  // the service is absent, causing a TypeError that silently blocks navigation.
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

  // Standalone polyfill: FE v4 looks up ShellUIService in UI5's
  // ServiceFactoryRegistry at component load time. Without an FLP the factory
  // is absent, causing a [FUTURE FATAL] that prevents the component from loading.
  (function registerShellUIService() {
    var sName = 'sap.ushell.ui5service.ShellUIService';
    if (ServiceFactoryRegistry.get(sName)) { return; } // real shell registered it already
    var NoopFactory = ServiceFactory.extend('com.zrfq.rfq.NoopShellUIServiceFactory', {
      createInstance : function () {
        var oSvc = {
          setTitle       : function () {},
          setHierarchy   : function () {},
          setRelatedApps : function () {},
          getTitle       : function () { return ''; },
          attachTitleChanged   : function () {},
          detachTitleChanged   : function () {},
          destroy        : function () {}
        };
        oSvc.getInterface = function () { return oSvc; };
        return Promise.resolve(oSvc);
      }
    });
    ServiceFactoryRegistry.register(sName, new NoopFactory());
  })();

  return AppComponent.extend('com.zrfq.rfq.Component', {
    metadata: {
      interfaces: ['sap.ui.core.IAsyncContentCreation']
    }
  });
});
