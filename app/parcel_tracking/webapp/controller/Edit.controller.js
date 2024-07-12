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
      this.allInputFieldEditable(false);
    },

    onEdit: function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      this.getView().bindElement("/Packages(" + packageId + ")");
    },
    onCancel: function () {
      this.onNavBack();
    },
    onSubmit: function () {
      var oModel = this.getView().getModel();
      oModel.submitBatch(oModel.getUpdateGroupId());
      var packageNumber = this.getView().byId("packageNumber").getValue();
      sap.m.MessageBox.success("Package \"" + packageNumber + "\" edited successfully.");
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
        this.getView().byId("userFirstName").setText(oUser.first_name || "");
        this.getView().byId("userLastName").setText(oUser.last_name || "");
      }
    },
    onEditPress: function (oEvent) {
      var oToggleButton = oEvent.getSource();
      if (oToggleButton.getPressed()) {
        oToggleButton.setText("Disable Edit");
        this.allInputFieldEditable(false);
        this.showToast("Currently exited edit mode");
      } else {
        this.allInputFieldEditable(true)
        oToggleButton.setText("Currently in edit mode");
      }
    },
    
    allInputFieldEditable: function(state){
      var oView = this.getView();
      this.getView().byId("_IDGenSelect1").setEnabled(state);
      var aInputs = oView.findAggregatedObjects(true).filter(function (oControl) {
        return oControl instanceof sap.m.Input;
      });
      aInputs.forEach(function (oInput) {
        oInput.setEditable(state);
      });
    },
    showToast: function (sMessage) {
      sap.m.MessageToast.show(sMessage, {
          duration: 3000, // Duration in milliseconds
          width: "15em", // Width of the toast
          my: "center bottom", // Positioning
          at: "center bottom",
          offset: "0 50",
          autoClose: true // Automatically close after duration
      });
  }
  });
});