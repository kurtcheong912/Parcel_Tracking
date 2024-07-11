sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
function (Controller) {
    "use strict";

    return Controller.extend("parceltracking.controller.Home", {
        onInit: function () {
        },

        onListItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("edit", {
              packageId: oItem.getBindingContext().getProperty("ID")
            });
          },

        onCreate: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("create");
        }
    });
});
