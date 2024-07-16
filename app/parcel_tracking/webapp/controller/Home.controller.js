sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "parceltracking/controller/SenderOverview.controller",
    "parceltracking/controller/SenderCreate.controller",
    "parceltracking/controller/SenderEdit.controller"
],
function (Controller, SenderOverview, SenderCreate, SenderEdit) {
    "use strict";

    return Controller.extend("parceltracking.controller.Home", {
        SenderOverview: new SenderOverview(this),
        SenderCreate: new SenderCreate(this),
        SenderEdit: new SenderEdit(this),
        onInit: function () {
        },
        onMenuButtonPress: function () {
            var toolPage = this.byId("toolPage");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },
        onItemSelect: function (oEvent) {
            var item = oEvent.getParameter('item');
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            switch (item.getKey()) {
              case "Sender_Overview":
                oRouter.navTo("home");
                break;
              case "Receiver_Overview":
                oRouter.navTo("receiver");
                break;
            }
          },
        onNavBack: function () {
            this.byId("pageContainer").back();
        }
    });
});
