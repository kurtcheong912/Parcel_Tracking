sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
  "use strict";

  return Controller.extend("parceltracking.controller.SenderEdit", {

    onCancel: function () {
      this.onNavBack();
    },
    onSubmit: function () {
      var sFragmentId = this.getView().createId("SenderEditFragment");
      var oModel = this.getView().getModel();
      oModel.submitBatch(oModel.getUpdateGroupId());
      var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      sap.m.MessageBox.success("Package \"" + packageNumber + "\" edited successfully.");
      this.onNavBack();
      oModel.refresh();
    },

    onNavBack: function () {
      this.byId("pageContainer").back();
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
      var sFragmentId = this.getView().createId("SenderEditFragment");
      // Get the selected item context
      var oSelect = oEvent.getSource();
      var oSelectedItem = oSelect.getSelectedItem();

      if (oSelectedItem) {
        var oContext = oSelectedItem.getBindingContext();
        // Retrieve the user details from the context
        var oUser = oContext.getObject();
        // Set values to the respective inputs
        var firstName = sap.ui.core.Fragment.byId(sFragmentId, "userFirstName");
        firstName.setText(oUser.first_name || "")
        var lastName = sap.ui.core.Fragment.byId(sFragmentId, "userLastName");
        lastName.setText(oUser.last_name || "");
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

    allInputFieldEditable: function (state) {
      var oView = this.getView();
      this.getView().byId("_IDGenSelect1").setEnabled(state);
      this.getView().byId("updateStatusButton").setEnabled(state);
      var aInputs = oView.findAggregatedObjects(true).filter(function (oControl) {
        return oControl instanceof sap.m.Input;
      });
      aInputs.forEach(function (oInput) {
        // Check if the input ID is the one you want to make non-editable
        if (oInput.getId() !== oView.createId("packageID")) {
          oInput.setEditable(state);
        } else {
          oInput.setEditable(false); // Ensure this specific input is not editable
        }
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
    },
    onUpdateStatus: function () {
      var that = this; // Reference to the controller context

      // Show a warning message box
      sap.m.MessageBox.warning("Are you sure you want to update the package status?", {
        title: "Confirm Status Update",
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.OK) {
            // If OK is pressed, proceed to update the status
            that.updateStatus(); // Call the internal function to update the status
          }
        }
      });
    },
    updateStatus: function () {
      var oObjectStatus = this.byId("_IDGenObjectStatus1");
      var currentStatus = oObjectStatus.getText();
      console.log("Current Status:", currentStatus);

      // Assuming you have a method to get the next status based on the current status
      var nextStatus = this.getNextStatus(currentStatus);
      console.log("Next Status:", nextStatus);

      // Retrieve the package ID from the input field
      var oInput = this.byId("packageID");
      var sPackageId = oInput.getValue();
      console.log("Package ID:", sPackageId);

      // Get the model
      var oModel = this.getView().getModel();

      // Construct the path to the package in the model
      var sPath = "/Packages(" + sPackageId + ")";

      // Bind the context
      var oContext = oModel.bindContext(sPath);

      // Get the context object
      var oBindingContext = oContext.getBoundContext();


      // Update the data
      oBindingContext.setProperty("status", nextStatus);
      oModel.refresh();

    },






    getNextStatus: function (currentStatus) {
      switch (currentStatus) {
        case "NEW":
          return "SHIPPING";
        case "SHIPPING":
          return "DELIVERED";
        default:
          return null;
      }
    }

  });
});