sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
  "use strict";

  return Controller.extend("parceltracking.controller.Edit", {
    onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("edit").attachPatternMatched(this.onEdit, this);
    },

    onEdit: function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      this.getView().bindElement("/Packages(" + packageId + ")");
    },

    onSave: function () {
      var oModel = this.getView().getModel();
      oModel.submitBatch(oModel.getUpdateGroupId());
      sap.m.MessageToast.show("Package saved successfully!");
      this.onNavBack();
      oModel.refresh();
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home", {}, true);
      }
    },

  });
});