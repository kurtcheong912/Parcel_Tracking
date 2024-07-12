sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    function (Controller) {
        "use strict";
        return Controller.extend("parcelTracking.controller.ReceiverOverview", {
            onInit: function () {
            },
            onMenuButtonPress: function () {
                var toolPage = this.byId("toolPage");
                toolPage.setSideExpanded(!toolPage.getSideExpanded());
            },
            onItemSelect: function (oEvent) {
                var item = oEvent.getParameter('item');
                if (item.getKey() != 'Create') {
                    this.byId("pageContainer").to(this.getView().createId(item.getKey()))
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("create");
                }
            }
        });
    });