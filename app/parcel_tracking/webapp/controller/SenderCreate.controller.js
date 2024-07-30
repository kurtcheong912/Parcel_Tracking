sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  'sap/ui/Device'
], function (Controller, MessageToast, History, Device) {
  "use strict";

  return Controller.extend("parceltracking.controller.SenderCreate", {
    onInit: function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");

      sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").setSelectedKey("");

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
      this.validateReset();
    },

    onCancel: function () {
      this.onNavBack();
    },

    onNavBack: function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");
      sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").setSelectedKey("");
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home", {}, true);
      }

      this.validateReset();
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
      if (!value) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
      }
      else if (!bExists) {
        // Optionally clear the selection
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This user does not exist in the list.");
      }
      else {
        inputField.setValueState(sap.ui.core.ValueState.None);
        // Set the selected key if valid
        oComboBox.setSelectedKey(aItems.find(oItem => oItem.getText() === sInputValue).getKey());
      }
      this.validateForm();
    },

    onPackageIDChange: function (oEvent) {
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      var oModel = this.getView().getModel();
      let oBindList = oModel.bindList("/Packages");
      let aFilter = new sap.ui.model.Filter("packageNumber", sap.ui.model.FilterOperator.EQ, value);

      this.validateForm();
      if (!value) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
      } else {
        inputField.setValueState(sap.ui.core.ValueState.None);
      }

      oBindList.filter(aFilter).requestContexts().then(function (aContexts) {
        if (aContexts[0].getObject() !== null) {
          inputField.setValueState(sap.ui.core.ValueState.Error);
          inputField.setValueStateText("This package ID is existed.");
        } else {
          inputField.setValueState(sap.ui.core.ValueState.None);
        }
      });


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
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("Value exceeded 1000.");
      }
      else {
        inputField.setValueState(sap.ui.core.ValueState.None);
      }
    },

    validateForm: function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");

      // Get required fields
      var sPackageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      var sPackageWeight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
      var sPackageHeight = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
      var sReceiverID = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getSelectedKey();

      // Check if all required fields are filled
      var isFormValid = sPackageNumber !== "" &&
        sPackageWeight !== "" && !(sPackageWeight >= 1000) &&
        sPackageHeight !== "" && !(sPackageHeight >= 1000) &&
        sReceiverID !== "";
      // Enable or disable the submit button based on the validation
      this.getView().byId("onSubmit").setEnabled(isFormValid);
    },

    onSubmit: async function () {
      var sFragmentId = this.getView().createId("SenderCreateFragment");
      var oView = this.getView();
      var oModel = oView.getModel();
      var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      var receiver = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getSelectedKey();
      var weight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
      var height = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();

      var shippingCity = sap.ui.core.Fragment.byId(sFragmentId, "shippingCity").getValue();
      var shippingState = sap.ui.core.Fragment.byId(sFragmentId, "shippingState").getValue();
      var shippingCountry = sap.ui.core.Fragment.byId(sFragmentId, "shippingCountry").getValue();
      var shippingPostal = sap.ui.core.Fragment.byId(sFragmentId, "shippingPostal").getValue();
      var shippingAddressLine = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddressLine").getValue();
      var packageData = oModel.bindList("/Packages");
      var addressData = oModel.bindList("/Addresses");
      var newAddressID = this.SenderCreate.generateUUID();
      var oNewAddress = {
        ID: newAddressID,
        addressLine: shippingAddressLine,
        city: shippingCity,
        state: shippingState,
        country: shippingCountry,
        postalCode: shippingPostal
      };
      // Create the new address in the backend
      await addressData.create(oNewAddress);


      // Use addressID as needed
      var oNewPackage = {
        packageNumber: packageNumber,
        receiver_ID: receiver, // Assuming receiver is the correct ID or key of the user
        shippingAddress_ID: newAddressID, // Link to the newly created address
        weight: weight,
        height: height,
        signature: null,
        shippingStatus: 'NEW',
        packageStatus: null
      };
      packageData.create(oNewPackage);
      sap.m.MessageToast.show("Package saved successfully!");
      this.onNavBack();
      oModel.refresh()
    },
    generateUUID: function () {
      // Generate a random UUID following RFC 4122 version 4
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
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
    validateReset: function () {
      var isValid = true;
      var sFragmentId = this.getView().createId("SenderCreateFragment");

      // Get all input fields
      var aInputs = [
        sap.ui.core.Fragment.byId(sFragmentId, "packageNumber"),
        sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1"),
        sap.ui.core.Fragment.byId(sFragmentId, "packageWeight"),
        sap.ui.core.Fragment.byId(sFragmentId, "packageHeight"),
      ];

      // Validate each input field
      aInputs.forEach(function (oInput) {
        oInput.setValueState(sap.ui.core.ValueState.None);
      });

    },
  });
});