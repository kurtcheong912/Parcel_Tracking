sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  'sap/ui/Device'
], function (Controller, MessageToast, History, Device) {
  "use strict";

  return Controller.extend("parceltracking.controller.SenderCreate", {
    initAdd: function (that) {
      this._controller = that;
      var sFragmentId = this._controller.getView().createId("SenderCreateFragment");

      sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").setSelectedKey("");

      sap.ui.core.Fragment.byId(sFragmentId, "shippingCity").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "shippingState").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "shippingCountry").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "shippingPostal").setValue("");
      sap.ui.core.Fragment.byId(sFragmentId, "shippingAddressLine").setValue("");
      Device.media.attachHandler(this.checkSize, null, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
      var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
      var toolPage = this.byId("toolPage");
      var shellBar = this.byId("_IDGenShellBar1");

      // switch (oParams.name) {
      //   case "Phone":
      //   case "Tablet":
      //     toolPage.setSideExpanded(false);
      //     shellBar.setShowMenuButton(false);
      //     break;
      //   default:

      //     shellBar.setShowMenuButton(true);
      //     break;
      // }
      this.validateReset();
      sap.ui.core.Fragment.byId(sFragmentId, "onSubmit").setEnabled(false);
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
      this.SenderCreate.validateForm();
    },

    onPackageIDChange: function (oEvent) {
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      var oModel = this.SenderCreate._controller.getView().getModel(); // Ensure this is an OData V4 model
      this.SenderCreate.validateForm();
      // Validation for required field
      if (!value || value == "") {

        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
        return;
      }

      inputField.setValueState(sap.ui.core.ValueState.None);

      var sUrl = oModel.sServiceUrl + "/Packages?$filter=packageNumber eq '" + encodeURIComponent(value) + "'";

      // Fetch data using the URL
      fetch(sUrl, {
        headers: {
          "Accept": "application/json"
        }
      })
        .then(response => response.json())
        .then(data => {
          // Check if data exists
          if (data.value.length > 0) {
            inputField.setValueState(sap.ui.core.ValueState.Error);
            inputField.setValueStateText("This package ID already exists.");
          } else {
            inputField.setValueState(sap.ui.core.ValueState.None);
          }
        })
        .catch(error => {
          // Handle error
          console.error("Error while fetching data: ", error);
          inputField.setValueState(sap.ui.core.ValueState.Error);
          inputField.setValueStateText("Error while validating package ID.");
        });
    },


    onInputChange: async function (oEvent) {
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      await this.SenderCreate.validateForm();
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
      this.SenderCreate.validateForm();
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

    validateForm: async function () {

      var sFragmentId = this._controller.getView().createId("SenderCreateFragment");

      // Get required fields
      var sPackageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
      var sPackageWeight = sap.ui.core.Fragment.byId(sFragmentId, "packageWeight").getValue();
      var sPackageHeight = sap.ui.core.Fragment.byId(sFragmentId, "packageHeight").getValue();
      var sReceiverID = sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1").getSelectedKey();
      var shippingCity = sap.ui.core.Fragment.byId(sFragmentId, "shippingCity").getValue();
      var shippingState = sap.ui.core.Fragment.byId(sFragmentId, "shippingState").getValue();
      var shippingCountry = sap.ui.core.Fragment.byId(sFragmentId, "shippingCountry").getValue();
      var shippingPostal = sap.ui.core.Fragment.byId(sFragmentId, "shippingPostal").getValue();
      var shippingAddressLine = sap.ui.core.Fragment.byId(sFragmentId, "shippingAddressLine").getValue();

      // Check if all required fields are filled
      var isFormValid = sPackageNumber !== "" &&
        sPackageWeight !== "" && !(sPackageWeight >= 1000) &&
        sPackageHeight !== "" && !(sPackageHeight >= 1000) &&
        sReceiverID !== "" &&
        shippingCity !== "" &&
        shippingState !== "" &&
        shippingCountry !== "" &&
        shippingPostal !== "" &&
        shippingAddressLine !== "" &&
        // Enable or disable the submit button based on the validation

        await sap.ui.core.Fragment.byId(sFragmentId, "onSubmit").setEnabled(isFormValid);
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
      var sFragmentId = this._controller.getView().createId("SenderCreateFragment");

      // Get all input fields
      var aInputs = [
        sap.ui.core.Fragment.byId(sFragmentId, "packageNumber"),
        sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1"),
        sap.ui.core.Fragment.byId(sFragmentId, "packageWeight"),
        sap.ui.core.Fragment.byId(sFragmentId, "packageHeight"),
        sap.ui.core.Fragment.byId(sFragmentId, "shippingCity"),
        sap.ui.core.Fragment.byId(sFragmentId, "shippingState"),
        sap.ui.core.Fragment.byId(sFragmentId, "shippingCountry"),
        sap.ui.core.Fragment.byId(sFragmentId, "shippingPostal"),
        sap.ui.core.Fragment.byId(sFragmentId, "shippingAddressLine"),
      ];

      // Validate each input field
      aInputs.forEach(function (oInput) {
        oInput.setValueState(sap.ui.core.ValueState.None);
      });

    },
  });
});