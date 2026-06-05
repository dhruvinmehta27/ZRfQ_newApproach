// ── Module definition ─────────────────────────────────────────────────────────
// sap.ui.define loads these modules asynchronously before the factory function runs.
// AppComponent     : Fiori Elements v4 base component — provides OData model, routing, etc.
// ServiceFactoryRegistry : UI5 registry used to look up and register named service factories
// ServiceFactory   : base class we extend to create a no-op ShellUIService factory
sap.ui.define([
  'sap/fe/core/AppComponent',
  'sap/ui/core/service/ServiceFactoryRegistry',
  'sap/ui/core/service/ServiceFactory'
], function (AppComponent, ServiceFactoryRegistry, ServiceFactory) {
  'use strict';

  // ── ushell Container polyfill (IIFE) ────────────────────────────────────────
  // When the app runs standalone (no SAP Fiori Launchpad), sap.ushell.Container
  // is absent.  Fiori Elements v4 internally calls several ushell services
  // (AppState, URLParsing, ShellNavigation, getUser) during view creation and
  // routing.  Without these stubs, the app crashes with "Cannot read properties
  // of undefined" before any UI is rendered.
  //
  // The IIFE pattern keeps all polyfill variables private so they don't leak
  // into the outer module scope.
  (function patchUshell() {
    if (typeof sap === 'undefined') { return; }
    sap.ushell = sap.ushell || {};
    // If a real FLP shell is already present, skip polyfilling entirely
    if (sap.ushell.Container) { return; }

    // ── AppState stub ─────────────────────────────────────────────────────────
    // FE uses AppState to save / restore inner-app navigation state (e.g., which
    // tab was open, filter values).  Our stub silently accepts all calls and
    // returns empty state, which is fine for a standalone deployment where
    // cross-session persistence is not needed.
    var oState = {
      storeInnerAppStateAsync : function () { return Promise.resolve({ appStateKey: '' }); },
      setData                  : function () {},
      getData                  : function () { return {}; },
      save                     : function () { return Promise.resolve(); }
    };
    var oAppStateSvc = {
      createEmptyAppState      : function () { return oState; },
      createEmptyAppStateAsync : function () { return Promise.resolve(oState); },
      getAppState              : function () { return Promise.resolve(oState); }
    };

    // ── URLParsing stub ───────────────────────────────────────────────────────
    // FE RouterProxy calls splitHash and getShellHash to decompose the browser
    // URL hash into semantic object + action + params.  Without an FLP the
    // hash has no semantic meaning, so we return empty strings / objects.
    // combineParameters and constructShellHash are used when FE builds deep-link
    // URLs for the back-navigation button — returning '' prevents broken URLs.
    var oUrlParsingSvc = {
      splitHash         : function () { return { semanticObject: '', action: '', params: {}, appSpecificRoute: '', contextRaw: '' }; },
      parseShellHash    : function () { return { semanticObject: '', action: '', params: {} }; },
      getShellHash      : function () { return ''; },
      combineParameters : function () { return ''; },
      constructShellHash: function () { return ''; },
      isIntentUrl       : function () { return false; }
    };

    // ── ShellNavigation stub ──────────────────────────────────────────────────
    // FE RouterProxy registers a navigation filter on ShellNavigation at startup
    // so it can intercept hash-change events.  Without these stubs the
    // registerNavigationFilter call throws and the router never initialises,
    // leaving the app on a blank page.
    var oShellNavSvc = {
      registerNavigationFilter  : function () {},
      unregisterNavigationFilter: function () {},
      navigate                  : function () {},
      isInitialNavigation       : function () { return false; },
      parseShellHash            : function () { return { semanticObject: '', action: '' }; }
    };

    // ── User stub ─────────────────────────────────────────────────────────────
    // FE ShellServicesFactory calls getUser().getContentDensity() when creating
    // views to decide between "cozy" and "compact" layouts.  Returning 'cozy'
    // gives the standard touch-friendly spacing.  All other user-info methods
    // return empty strings — they are only called in FLP scenarios.
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

    // ── Service dispatcher ────────────────────────────────────────────────────
    // Central lookup used by both getService (sync) and getServiceAsync (async).
    // Each case maps an ushell service name to its stub object above.
    // Any unknown service name falls through to an empty object so callers
    // don't crash on null/undefined even if a new FE version requests a
    // service we haven't stubbed yet.
    function _getSvc(sName) {
      if (sName === 'AppState')        { return oAppStateSvc; }
      if (sName === 'URLParsing')      { return oUrlParsingSvc; }
      if (sName === 'ShellNavigation') { return oShellNavSvc; }
      return {};
    }

    // ── Minimal Container interface ───────────────────────────────────────────
    // Expose only the three methods that Fiori Elements v4 actually calls at
    // runtime.  getServiceAsync is the preferred async form; getService is the
    // legacy sync form still used by some FE internals.
    sap.ushell.Container = {
      getServiceAsync : function (sName) { return Promise.resolve(_getSvc(sName)); },
      getService      : function (sName) { return _getSvc(sName); },
      getUser         : function ()      { return oUser; }
    };
  })();

  // ── ShellUIService factory polyfill (IIFE) ──────────────────────────────────
  // UI5's ServiceFactoryRegistry is separate from sap.ushell.Container.
  // FE looks up "sap.ushell.ui5service.ShellUIService" in the registry at
  // component load time.  If it is missing, FE logs a [FUTURE FATAL] warning
  // and the page can go blank on future UI5 versions.
  //
  // We register a no-op factory that returns a stub service instance.
  // setBackNavigation is the most-called method: FE RouterProxy invokes it on
  // every row-press before navigating to the Object Page to configure the
  // browser back button.  All other methods (setTitle, setHierarchy, etc.) are
  // called when the Object Page header loads.
  (function registerShellUIService() {
    var sName = 'sap.ushell.ui5service.ShellUIService';
    // Guard: if a real factory is already registered (e.g., inside FLP), do nothing
    if (ServiceFactoryRegistry.get(sName)) { return; }

    // Extend ServiceFactory to create a named, registerable factory class.
    // createInstance must return a Promise resolving to a service object that
    // also has a getInterface() method (required by the UI5 service protocol).
    var NoopFactory = ServiceFactory.extend('com.zrfq.rfq.NoopShellUIServiceFactory', {
      createInstance : function () {
        // Stub service — all methods silently accept any arguments and do nothing,
        // which is correct for a standalone app with no FLP shell to update.
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
        // getInterface is called by UI5's service infrastructure to get the public
        // API surface of the service; returning the same object means all methods are public
        oSvc.getInterface = function () { return oSvc; };
        return Promise.resolve(oSvc);
      }
    });
    // Register the factory so FE can find it by the well-known service name
    ServiceFactoryRegistry.register(sName, new NoopFactory());
  })();

  // ── App Component ─────────────────────────────────────────────────────────
  // Extend the Fiori Elements v4 AppComponent.  FE reads the app descriptor
  // (manifest.json) to wire up the OData model, routes, and templates
  // automatically — no additional configuration is needed here.
  // IAsyncContentCreation tells UI5 to build the root view asynchronously,
  // which avoids synchronous XMLHttpRequests and the deprecation warnings
  // they produce in modern browsers.
  return AppComponent.extend('com.zrfq.rfq.Component', {
    metadata: {
      interfaces: ['sap.ui.core.IAsyncContentCreation']
    }
  });
});
