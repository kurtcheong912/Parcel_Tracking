sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "parceltracking/controller/SenderOverview.controller",
  "parceltracking/controller/SenderCreate.controller",
  "parceltracking/controller/SenderEdit.controller",
  "parceltracking/controller/ReceiverDetail.controller",
  "parceltracking/controller/ReceiverOverview.controller",
],
  function (Controller, SenderOverview, SenderCreate, SenderEdit, ReceiverOverview, ReceiverDetail) {
    "use strict";

    return Controller.extend("parceltracking.controller.Home", {
      SenderOverview: new SenderOverview(this),
      SenderCreate: new SenderCreate(this),
      SenderEdit: new SenderEdit(this),
      ReceiverOverview: new ReceiverOverview(this),
      ReceiverDetail: new ReceiverDetail(this),
      onInit: function () {
      },
      onMenuButtonPress: function () {
        var toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },
      onItemSelect: function (oEvent) {
        var item = oEvent.getParameter('item');
        switch (item.getKey()) {
          case "Sender_Overview":
            this.byId("pageContainer").to(this.getView().createId(item.getKey()));
            break;
          case "Receiver_Overview":
            this.byId("pageContainer").to(this.getView().createId(item.getKey()));
            break;
        }
      },
      onNavBack: function () {
        this.byId("pageContainer").back();
      }
    });
  });
