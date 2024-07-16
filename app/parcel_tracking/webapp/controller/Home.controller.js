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
            console.log(this.byId("pageContainer"));
            var item = oEvent.getParameter('item');
            this.byId("pageContainer").to(this.getView().createId(item.getKey()))
        },
        onNavBack: function () {
            this.byId("pageContainer").back();
        }
    });
});
