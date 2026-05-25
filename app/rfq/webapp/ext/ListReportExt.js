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
                    // Give FE time to create the inner sap.m.Table
                    setTimeout(function () { that._setupNavigation(); }, 500);
                }
            }
        },

        _setupNavigation: function () {
            var oView  = this.base.getView();
            var oTable = oView.byId("fe::table::RFQs::LineItem");

            if (!oTable || oTable.__rfqNavDone) { return; }

            var oRouter = oView.getController().getOwnerComponent().getRouter();

            oTable.initialized().then(function () {
                var oInner = oTable._oTable; // sap.m.Table created by MDC
                if (!oInner) { return; }
                oTable.__rfqNavDone = true;

                // Mark existing rows with the ">" chevron
                var fnSetNav = function () {
                    oInner.getItems().forEach(function (oItem) {
                        if (oItem.setType) { oItem.setType("Navigation"); }
                    });
                };
                fnSetNav();

                // Re-mark whenever OData data refreshes
                var oBinding = oInner.getBinding("items");
                if (oBinding) {
                    oBinding.attachChange(function () {
                        requestAnimationFrame(fnSetNav);
                    });
                }

                // Navigate on row press
                oInner.attachItemPress(function (oEvent) {
                    var oItem = oEvent.getParameter("listItem");
                    var oCtx  = oItem && oItem.getBindingContext();
                    if (!oCtx) { return; }
                    var sKey = "ObjectID='" + oCtx.getProperty("ObjectID") + "'";
                    oRouter.navTo("RFQsObjectPage", { key: sKey });
                });
            });
        }
    });
});
