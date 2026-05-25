sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/mvc/OverrideExecution"
], function (ControllerExtension, OverrideExecution) {
    "use strict";

    return ControllerExtension.extend("com.zrfq.rfq.ext.ListReportExt", {

        override: {
            onAfterRendering: {
                overrideExecution: OverrideExecution.After,
                execute: function () {
                    var that = this;
                    console.log("[RFQ Nav] onAfterRendering fired");
                    setTimeout(function () { that._setupNavigation(); }, 500);
                }
            }
        },

        // Find the MDC table two ways: by known generated ID, then by tree scan
        _findMdcTable: function (oView) {
            var oTable = oView.byId("fe::table::RFQs::LineItem");
            if (oTable) {
                console.log("[RFQ Nav] table found by ID");
                return oTable;
            }
            var aFound = [];
            oView.findAggregatedObjects(true, function (oEl) {
                if (oEl.isA && oEl.isA("sap.ui.mdc.Table")) { aFound.push(oEl); }
            });
            if (aFound.length) {
                console.log("[RFQ Nav] table found by scan:", aFound[0].getId());
                return aFound[0];
            }
            console.warn("[RFQ Nav] MDC table NOT FOUND – check entity set name in ext/ListReportExt.js");
            return null;
        },

        _setupNavigation: function () {
            var oView = this.base.getView();
            console.log("[RFQ Nav] _setupNavigation, view ID:", oView ? oView.getId() : "null");

            var oTable = this._findMdcTable(oView);
            if (!oTable || oTable.__rfqNavDone) { return; }

            var oRouter = oView.getController().getOwnerComponent().getRouter();

            // initialized() is async; fall back to a resolved promise if missing
            var oReady = (oTable.initialized ? oTable.initialized() : Promise.resolve());

            oReady.then(function () {
                var oInner = oTable._oTable; // private sap.m.Table inside MDC
                if (!oInner) {
                    console.warn("[RFQ Nav] _oTable (inner sap.m.Table) not found");
                    return;
                }
                console.log("[RFQ Nav] inner table ready:", oInner.getId());
                oTable.__rfqNavDone = true;

                // Apply ">" chevron to current and future rows
                var fnSetNav = function () {
                    oInner.getItems().forEach(function (oItem) {
                        if (oItem.setType) { oItem.setType("Navigation"); }
                    });
                };
                fnSetNav();
                var oBinding = oInner.getBinding("items");
                if (oBinding) {
                    oBinding.attachChange(function () { requestAnimationFrame(fnSetNav); });
                }

                // Handle row press → navigate to Object Page
                oInner.attachItemPress(function (oEvent) {
                    var oItem = oEvent.getParameter("listItem");
                    var oCtx  = oItem && oItem.getBindingContext();
                    if (!oCtx) { return; }
                    var sKey = "ObjectID='" + oCtx.getProperty("ObjectID") + "'";
                    console.log("[RFQ Nav] navigating, key:", sKey);
                    oRouter.navTo("RFQsObjectPage", { key: sKey });
                });
            });
        }
    });
});
