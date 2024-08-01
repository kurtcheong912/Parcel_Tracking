sap.ui.define([
  "sap/ui/core/mvc/Controller",
  'sap/ui/Device',
  "parceltracking/controller/SenderOverview.controller",
  "parceltracking/controller/SenderCreate.controller",
  "parceltracking/controller/SenderEdit.controller",
  "parceltracking/controller/ReceiverDetail.controller",
  "parceltracking/controller/ReceiverOverview.controller",
],
  function (Controller, Device, SenderOverview, SenderCreate, SenderEdit, ReceiverDetail, ReceiverOverview) {
    "use strict";

    return Controller.extend("parceltracking.controller.Home", {
      SenderOverview: new SenderOverview(this),
      SenderCreate: new SenderCreate(this),
      SenderEdit: new SenderEdit(this),
      ReceiverOverview: new ReceiverOverview(this),
      ReceiverDetail: new ReceiverDetail(this),
      onInit: function () {
        Device.media.attachHandler(this.checkSize, this, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
        var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
        this.checkSize(oParams);
      },
      checkSize: function (oParams) {
        var toolPage = this.byId("toolPage");
        console.log(toolPage);
        var shellBar = this.byId("_IDGenShellBar1");

        // Ensure elements are available before trying to set properties
        if (toolPage && shellBar) {
          switch (oParams.name) {
            case "Phone":
            case "Tablet":
              
              toolPage.setSideExpanded(false);
              shellBar.setShowMenuButton(true);
              break;
            default:
              toolPage.setSideExpanded(false);
              shellBar.setShowMenuButton(true);
              break;
          }
        } else {
          console.error("ToolPage or ShellBar control is not available.");
        }
      },
      onAfterRendering: function () {
        this.SenderOverview.initSenderOverview(this);
        this.byId("pageContainer").to(this.getView().createId("Sender_Overview"));
      },
      onMenuButtonPress: function () {
        var toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },
      onItemSelect: function (oEvent) {
        var item = oEvent.getParameter('item');
        switch (item.getKey()) {
          case "Sender_Overview":
            this.SenderOverview.initSenderOverview(this);
            this.byId("pageContainer").to(this.getView().createId(item.getKey()));
            break;
          case "Receiver_Overview":
            this.ReceiverOverview.initReceiverOverview(this);
            this.byId("pageContainer").to(this.getView().createId(item.getKey()));
            break;
        }
      },
      onNavBack: function () {
        this.byId("pageContainer").back();
      }
    });
  });
