sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
  "use strict";

  return Controller.extend("parceltracking.controller.SenderEdit", {

    onEdit: async function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      await this.getView().bindElement("/Packages(" + packageId + ")");
      await this.getView().getBindingContext().requestObject();
      await this.checkUpdateStatusAvailable();
    },
    onCancel: function () {
      this.onNavBack();
    },
    onNavBack: function () {
      this.byId("pageContainer").back();
    },

    onSubmit: function () {
      var sFragmentId = this.getView().createId("SenderEditFragment");
      var that = this; // Keep reference to the controller

      // Show confirmation dialog
      sap.m.MessageBox.confirm(
        "Do you want to edit this package?",
        {
          title: "Confirm Edit",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              // User clicked OK, proceed with edit
              var oModel = that.getView().getModel();
              oModel.submitBatch(oModel.getUpdateGroupId());
              var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
              sap.m.MessageToast.show("Package \"" + packageNumber + "\" edited successfully.");
              oModel.refresh();
              that.onNavBack();
            }
          }
        }
      );
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
        this.showToast("Currently in edit mode");
        oToggleButton.setText("Currently in edit mode");
      }
    },
    checkUpdateStatusAvailable: async function () {
      try {
        var oContext = this.getView().getBindingContext();
        console.log("Checking current status...");
        var currentStatus = oContext.getProperty("status");

        if (!currentStatus) {
          console.error("ObjectStatus not found!");
          return;
        }
        console.log("Current Status: ", currentStatus);
        // Enable the button only if the status is "NEW" or "SHIPPING"
        var isButtonEnabled = (currentStatus === "NEW" || currentStatus === "SHIPPING");
        this.getView().byId("updateStatusButton").setEnabled(isButtonEnabled);

      } catch (error) {
        console.error("Error in checkUpdateStatusAvailable: ", error);
      }
    },

    allInputFieldEditable: function (state) {
      var oView = this.getView();
      this.getView().byId("_IDGenComboBox1").setEnabled(state);
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
            console.log(that);
            // If OK is pressed, proceed to update the status
            that.SenderEdit.updateStatus(that); // Call the internal function to update the status
          }
        }
      });
    },

    updateStatus: function (that) {
      var sFragmentId = that.getView().createId("SenderEditFragment");
      var oObjectStatus = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenObjectStatus1");
      var currentStatus = oObjectStatus.getText();
      console.log("Current Status:", currentStatus);

      // Assuming you have a method to get the next status based on the current status
      var nextStatus = that.SenderEdit.getNextStatus(currentStatus);
      console.log("Next Status:", nextStatus);

      // Retrieve the package ID from the input field
      var oInput = sap.ui.core.Fragment.byId(sFragmentId, "packageID");
      var sPackageId = oInput.getValue();
      console.log("Package ID:", sPackageId);

      // Get the model
      var oModel = that.getView().getModel();

      // Construct the path to the package in the model
      var sPath = "/Packages(" + sPackageId + ")";

      // Bind the context
      var oContext = oModel.bindContext(sPath);

      // Get the context object
      var oBindingContext = oContext.getBoundContext();


      // Update the data
      oBindingContext.setProperty("status", nextStatus);
      oModel.refresh();

      that.SenderEdit.showToast("Package \"" + packageNumber + "\" status successfully updated to " + nextStatus);
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