sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
  "use strict";

  return Controller.extend("parceltracking.controller.Edit", {
    onInit: async function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      await oRouter.getRoute("edit").attachPatternMatched(await this.onEdit, this);
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
      // var oModel = this.getView().getModel();
      // console.log(oModel);
      // var id = this.getView().getBindingContext().getObject().ID;
      // var packageNumber = this.getView().byId("packageNumber").getValue();
      // var receiverId = this.getView().byId("receiverId").getValue();
      // var shippingAddress = this.getView().byId("shippingAddress").getValue();

      // var oData = {
      //   packageNumber: packageNumber,
      //   receiver_ID: receiverId,
      //   shippingAddress: shippingAddress,
      //   status: 'NEW',
      // }
      // oModel.update("/Packages(" + id + ")", oData, {
      //   success: function () {
      //     MessageToast.show("Package edited successfully!");
      //     this.onNavBack();
      //   }.bind(this), 
      //   error: function () {
      //     MessageToast.show("Error editing package.");
      //   }
      // });

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
    stateFormatter: function (status) {
      switch (status) {
        case "NEW":
          return "Information";
        case "SHIPPING":
          return "Warning"; // You can set this based on your logic
        case "DELIVERED":
          return "Success";
        default:
          return "None"; // Default state if needed
      }
    },
    onSelectChange: function (oEvent) {
      // Get the selected item context
      var oSelect = oEvent.getSource();
      var oSelectedItem = oSelect.getSelectedItem();

      if (oSelectedItem) {
        var oContext = oSelectedItem.getBindingContext();
        // Retrieve the user details from the context
        var oUser = oContext.getObject();
        console.log(oUser);
        // Set values to the respective inputs
        this.getView().byId("userFirstName").setValue(oUser.first_name || "");
        this.getView().byId("userLastName").setValue(oUser.last_name || "");
      }
    },
  });
});