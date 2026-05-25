sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    return ControllerExtension.extend("com.zrfq.rfq.ext.ListReportExt", {

        // Lifecycle hooks declared directly (not in override) are called
        // automatically by the FE controller extension mechanism.
        onAfterRendering: function () {
            console.log("[RFQ Nav] onAfterRendering fired");
            var that = this;
            setTimeout(function () { that._setupNavigation(); }, 600);
        },

        _findMdcTable: function (oView) {
            // Try the known generated ID first
            var oT = oView.byId("fe::table::RFQs::LineItem");
            if (oT) { console.log("[RFQ Nav] table found by ID"); return oT; }

            // Fallback: scan every element in the view tree
            var found = null;
            oView.findAggregatedObjects(true, function (el) {
                if (!found && el.isA && el.isA("sap.ui.mdc.Table")) { found = el; }
            });
            if (found) { console.log("[RFQ Nav] table found by scan:", found.getId()); return found; }

            console.warn("[RFQ Nav] MDC table NOT FOUND");
            return null;
        },

        _setupNavigation: function () {
            var oView = this.base.getView();
            console.log("[RFQ Nav] _setupNavigation, view:", oView ? oView.getId() : "null");

            var oTable = this._findMdcTable(oView);
            if (!oTable || oTable.__rfqNavDone) { return; }

            var oRouter = oView.getController().getOwnerComponent().getRouter();
            var oReady  = oTable.initialized ? oTable.initialized() : Promise.resolve();

            oReady.then(function () {
                var oInner = oTable._oTable;
                if (!oInner) { console.warn("[RFQ Nav] _oTable (sap.m.Table) not found"); return; }

                console.log("[RFQ Nav] inner table ready:", oInner.getId());
                oTable.__rfqNavDone = true;

                // Apply ">" chevron and keep it on every data refresh
                var fnSetNav = function () {
                    oInner.getItems().forEach(function (it) {
                        if (it.setType) { it.setType("Navigation"); }
                    });
                };
                fnSetNav();
                var oBinding = oInner.getBinding("items");
                if (oBinding) { oBinding.attachChange(function () { requestAnimationFrame(fnSetNav); }); }

                // Navigate to Object Page on row press
                oInner.attachItemPress(function (oEvent) {
                    var oItem = oEvent.getParameter("listItem");
                    var oCtx  = oItem && oItem.getBindingContext();
                    if (!oCtx) { return; }
                    var sKey = "ObjectID='" + oCtx.getProperty("ObjectID") + "'";
                    console.log("[RFQ Nav] navTo RFQsObjectPage key:", sKey);
                    oRouter.navTo("RFQsObjectPage", { key: sKey });
                });
            });
        }
    });
});
