sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  'sap/ui/Device'
], function (Controller, MessageToast, History, Device) {
  "use strict";

  return Controller.extend("parceltracking.controller.SenderCreate", {
    onInit: async function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");

      sap.ui.core.Fragment.byId(sFragmentId, "packageNumberCreate").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageWeightCreate").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageHeightCreate").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "shippingAddressCreate").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1Create").setSelectedKey("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").setValue("");

      Device.media.attachHandler(this.checkSize, null, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
      var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
      var toolPage = this.byId("toolPage");
      var shellBar = this.byId("_IDGenShellBar1");

      switch (oParams.name) {
        case "Phone":
        case "Tablet":
          toolPage.setSideExpanded(false);
          shellBar.setShowMenuButton(false);
          break;
        default:
          toolPage.setSideExpanded(true);
          shellBar.setShowMenuButton(true);
          break;
      }
    },

    onCancel: function () {
      this.onNavBack();
    },
    //   onSubmit: function () {
    //     var that = this; // Keep reference to the controller
    //     var sFragmentId = this.getView().createId("SenderCreateFragment");

    //     // Show confirmation dialog
    //     sap.m.MessageBox.confirm(
    //       "Do you want to edit this package?",
    //       {
    //         title: "Confirm Edit",
    //         onClose: async function (oAction) {
    //           if (oAction === sap.m.MessageBox.Action.OK) {
    //              // User clicked OK, proceed with edit
    //              var oModel = that.getView().getModel();
    //              oModel.submitBatch(oModel.getUpdateGroupId());
    //              var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
    //              var sPackageWeight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
    //              var sPackageHeight = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
    //              var sShippingAddress = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddress").getValue();
    //              var sReceiverID = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getValue()

    //              console.log(packageNumber);

    //              var sPackageId =sap.ui.core.Fragment.byId(sFragmentId, "packageID").getValue();
    //              var oModel = that.getView().getModel();

    //              // Construct the path to the package in the model
    //              var sPath = "/Packages(" + sPackageId + ")";

    //              // Bind the context
    //              var oContext = oModel.bindContext(sPath);

    //              // Get the context object
    //              var oBindingContext = oContext.getBoundContext();


    //              // Update the data
    //               oBindingContext.setProperty("packageNumber", packageNumber);
    //               oBindingContext.setProperty("weight", sPackageWeight);
    //               oBindingContext.setProperty("height", sPackageHeight);
    //               oBindingContext.setProperty("shippingAddress", sShippingAddress);
    //               oBindingContext.setProperty("receiver_ID", sReceiverID);


    //             sap.m.MessageToast.show("Package \"" + packageNumber + "\" edited successfully.");
    //           }
    //         }
    //       }
    //     );
    //   },

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

    onComboBoxChange: function (oEvent) {
      var sInputValue = oEvent.getParameter("value");
      var oComboBox = oEvent.getSource();
      var aItems = oComboBox.getItems();
      this.validateForm();

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
      } else if (Number(value) >= 1000) {
        inputField.setValueStateText("Value exceeded 1000.");
      }
      else {
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
      var sFragmentId = this.getView().createId("SenderCreateFragment");

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
    },

    onSubmit: function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");
      var oView = this.getView();
      var oModel = oView.getModel();
      var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      var receiver = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getSelectedKey();
      var shippingAddress = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddress").getValue();
      var weight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
      var height = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
      var packageData = oModel.bindList("/Packages");
      this.oNewPackage = packageData.create({
        packageNumber: packageNumber,
        receiver_ID: receiver,
        shippingAddress: shippingAddress,
        weight: weight,
        height: height,
        signature: null,
        status: 'NEW',
      });
      this.oNewPackage.created().then(function () {
        sap.m.MessageToast.show("Package saved successfully!");
        this.onNavBack();
        oModel.refresh();
      }.bind(this),
        function (oError) {
          sap.m.MessageToast.show("Error saving package.");
        });
    }
  });
});