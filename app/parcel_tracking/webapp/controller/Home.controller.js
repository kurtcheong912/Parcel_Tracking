sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "parceltracking/controller/SenderOverview.controller",
    "parceltracking/controller/SenderCreate.controller"
],
function (Controller, SenderOverview, SenderCreate) {
    "use strict";

    return Controller.extend("parceltracking.controller.Home", {
        SenderOverview: new SenderOverview(this),
        SenderCreate: new SenderCreate(this),
        onInit: function () {
        },
        onMenuButtonPress: function () {
            var toolPage = this.byId("toolPage");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },
        onItemSelect: function (oEvent) {
            console.log(this.byId("pageContainer"));
            var item = oEvent.getParameter('item');
            this.byId("pageContainer").to(this.getView().createId(item.getKey()))
        }
    });
});
