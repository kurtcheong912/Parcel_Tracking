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

    onEdit: async function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      await this.getView().bindElement("/Packages(" + packageId + ")");
      await this.getView().getBindingContext().requestObject();

      await this.allInputFieldEditable(true);
      await this.checkUpdateStatusAvailable();
      await this.validateForm();
    },
    onCancel: function () {
      this.onNavBack();
    },
    onSubmit: function () {
      var that = this; // Keep reference to the controller
      var sFragmentId = this.getView().createId("SenderEditFragment");

      // Show confirmation dialog
      sap.m.MessageBox.confirm(
        "Do you want to edit this package?",
        {
          title: "Confirm Edit",
          onClose: async function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
               // User clicked OK, proceed with edit
               var oModel = that.getView().getModel();
               oModel.submitBatch(oModel.getUpdateGroupId());
               var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
               var sPackageWeight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
               var sPackageHeight = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
               var sShippingAddress = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddress").getValue();
               var sReceiverID = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getValue()
 
               console.log(packageNumber);
           
               var sPackageId =sap.ui.core.Fragment.byId(sFragmentId, "packageID").getValue();
               var oModel = that.getView().getModel();
 
               // Construct the path to the package in the model
               var sPath = "/Packages(" + sPackageId + ")";
         
               // Bind the context
               var oContext = oModel.bindContext(sPath);
         
               // Get the context object
               var oBindingContext = oContext.getBoundContext();
         
         
               // Update the data
                oBindingContext.setProperty("packageNumber", packageNumber);
                oBindingContext.setProperty("weight", sPackageWeight);
                oBindingContext.setProperty("height", sPackageHeight);
                oBindingContext.setProperty("shippingAddress", sShippingAddress);
                oBindingContext.setProperty("receiver_ID", sReceiverID);
                
            
              sap.m.MessageToast.show("Package \"" + packageNumber + "\" edited successfully.");
            }
          }
        }
      );
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
        var oContext = await this.getView().getBindingContext();
        console.log("Checking current status...");
        var currentStatus =await oContext.getProperty("status");
        if (!currentStatus) {
          console.error("ObjectStatus not found!");
          return;
        }
        console.log("Current Status: ", currentStatus);
        if (currentStatus === "NEW") {
          this.allInputFieldEditable(true);
          this.getView().byId("onSubmit").setVisible(true);
        } else {
          this.allInputFieldEditable(false);
          console.log("byebye");
         await this.getView().byId("onSubmit").setVisible(false);
         console.log("After setting visible:", this.getView().byId("onSubmit").getVisible());
        }

        // Enable the button only if the status is "NEW" or "SHIPPING"
        var isButtonEnabled = (currentStatus === "NEW" || currentStatus === "SHIPPING");
        this.getView().byId("updateStatusButton").setEnabled(isButtonEnabled);
     

      } catch (error) {
        console.error("Error in checkUpdateStatusAvailable: ", error);
      }
    },

    allInputFieldEditable: function (state) {
      var oView = this.getView();
      var sFragmentId = this.getView().createId("SenderEditFragment");
      var comboBox = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1");
      comboBox.setEnabled(state);
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
    updateStatus: async function () {
      var sFragmentId = this.getView().createId("SenderEditFragment");

      var mycontext = await this.getView().getBindingContext();
      var packageNumber = await mycontext.getProperty("packageNumber");
    
      
      var oObjectStatus = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenObjectStatus1");
      var currentStatus = oObjectStatus.getText();
      console.log("Current Status:", currentStatus);

      // Assuming you have a method to get the next status based on the current status
      var nextStatus = this.getNextStatus(currentStatus);
      console.log("Next Status:", nextStatus);

      // Retrieve the package ID from the input field
      var oInput =  sap.ui.core.Fragment.byId(sFragmentId, "packageID");
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

      this.showToast("Package \"" + packageNumber + "\" status successfully updated to " + nextStatus);
      if (nextStatus == "DELIVERED") {
        
        this.getView().byId("updateStatusButton").setEnabled(false);
      }
      await this.getView().byId("onSubmit").setVisible(false);
      var isButtonEnabled = (nextStatus === "NEW" || nextStatus === "SHIPPING");
      this.allInputFieldEditable(false);
      this.getView().byId("updateStatusButton").setEnabled(isButtonEnabled);
      oModel.refresh();

      
            var oInput = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber");
      // Set the value
      oInput.setValue(packageNumber);

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
    },
    onComboBoxChange: function (oEvent) {
      var sInputValue = oEvent.getParameter("value");
      var oComboBox = oEvent.getSource();
      var aItems = oComboBox.getItems();

      // Check if the entered value exists in the items
      var bExists = aItems.some(function (oItem) {
        return oItem.getText() === sInputValue; // Compare with the displayed text
      });
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      if (!bExists) {
        // Show error message
        sap.m.MessageToast.show("This user does not exist in the list.");

        // Optionally clear the selection
        oComboBox.setSelectedKey("");
      } else if (!value) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
      }
      else {
        // Set the selected key if valid
        oComboBox.setSelectedKey(aItems.find(oItem => oItem.getText() === sInputValue).getKey());
      }
    },
    onInputChange: function (oEvent) {
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      this.validateForm();
      // Check if the input field is empty
      if (!value) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
      } else {
        inputField.setValueState(sap.ui.core.ValueState.None);
      }
    },
    onDigitInputChange: function (oEvent) {
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      this.validateForm();
      // Check if the value is empty or not a number
      if (value.trim() === "" || isNaN(value)) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("Please enter a valid number.");
      } else {
        inputField.setValueState(sap.ui.core.ValueState.None);
      }
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
    validateForm: function () {
      var oModel = this.getView().getModel();
      var sFragmentId = this.getView().createId("SenderEditFragment");

      // Get required fields
      var sPackageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      var sPackageWeight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
      var sPackageHeight = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
      var sShippingAddress = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddress").getValue();
      var sReceiverID = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getValue()
  
      // Check if all required fields are filled
      var isFormValid = sPackageNumber !== "" && 
      sPackageWeight !== "" && 
      sPackageHeight !== "" && 
      sShippingAddress !== "" && 
      sReceiverID !== "";
      // Enable or disable the submit button based on the validation
      this.getView().byId("onSubmit").setEnabled(isFormValid);
      this.getView().byId("updateStatusButton").setEnabled(isFormValid);
      this.checkUpdateStatusAvailable();
  }

  });
});