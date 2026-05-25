sap.ui.define([
  'sap/fe/core/AppComponent',
  'sap/ui/core/service/ServiceFactoryRegistry',
  'sap/ui/core/service/ServiceFactory'
], function (AppComponent, ServiceFactoryRegistry, ServiceFactory) {
  'use strict';

  // Standalone polyfill: provide the ushell services FE v4 expects from a
  // Fiori Launchpad. Without these, view creation and routing both crash.
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

    // FE RouterProxy calls splitHash to parse the URL hash for app-name resolution.
    var oUrlParsingSvc = {
      splitHash        : function () { return { semanticObject: '', action: '', params: {}, appSpecificRoute: '', contextRaw: '' }; },
      parseShellHash   : function () { return { semanticObject: '', action: '', params: {} }; },
      combineParameters: function () { return ''; },
      constructShellHash: function () { return ''; },
      isIntentUrl      : function () { return false; }
    };

    // FE ShellServicesFactory calls getUser().getContentDensity() when creating views.
    var oUser = {
      getFullName       : function () { return ''; },
      getFirstName      : function () { return ''; },
      getLastName       : function () { return ''; },
      getId             : function () { return ''; },
      getEmail          : function () { return ''; },
      getLanguage       : function () { return 'EN'; },
      getContentDensity : function () { return 'cozy'; },
      isJamActive       : function () { return false; }
    };

    function _getSvc(sName) {
      if (sName === 'AppState')   { return oAppStateSvc; }
      if (sName === 'URLParsing') { return oUrlParsingSvc; }
      return {};
    }

    sap.ushell.Container = {
      getServiceAsync : function (sName) { return Promise.resolve(_getSvc(sName)); },
      getService      : function (sName) { return _getSvc(sName); },
      getUser         : function ()      { return oUser; }
    };
  })();

  // Standalone polyfill: register a no-op ShellUIService factory in UI5's
  // ServiceFactoryRegistry. FE looks this up at component load time; without
  // an FLP the factory is absent, causing a [FUTURE FATAL] blank page.
  // setBackNavigation is called by RouterProxy on every row press before navigating.
  (function registerShellUIService() {
    var sName = 'sap.ushell.ui5service.ShellUIService';
    if (ServiceFactoryRegistry.get(sName)) { return; }
    var NoopFactory = ServiceFactory.extend('com.zrfq.rfq.NoopShellUIServiceFactory', {
      createInstance : function () {
        var oSvc = {
          setTitle             : function () {},
          setHierarchy         : function () {},
          setRelatedApps       : function () {},
          setBackNavigation    : function () {},
          getTitle             : function () { return ''; },
          attachTitleChanged   : function () {},
          detachTitleChanged   : function () {},
          destroy              : function () {}
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
