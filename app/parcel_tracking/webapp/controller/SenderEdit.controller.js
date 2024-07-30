sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  'sap/ui/Device',
  'sap/ui/core/Fragment',
  "sap/ui/core/syncStyleClass",
], function (Controller, MessageToast, History, Device, Fragment, syncStyleClass) {
  "use strict";
  var iTimeoutId;
  var sFragmentId;
  return Controller.extend("parceltracking.controller.Edit", {
    initEdit: async function (packageID, that) {
      this._controller = that;

      this.onEdit(packageID)

      this.sFragmentId = await this._controller.getView().createId("SenderEditFragment");
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
   
    onEdit: async function (packageID) {
      await this._controller.getView().bindElement("/Packages(" + packageID + ")");
      await this._controller.getView().getBindingContext().requestObject();
      await this.validateReset();
      await this.allInputFieldEditable(true);
      await this.editMode(false);
      await this.checkUpdateStatusAvailable();
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setVisible(false);
    },
    onCancel: async function () {
      // await this.validateReset();

      this.SenderEdit.editMode(false);
    },
    onSubmit: async function () {

      sap.ui.core.BusyIndicator.show(0); // Show busy indicator


      var oModel = this.SenderEdit._controller.getView().getModel();

      var oAction = await new Promise(function (resolve, reject) {
        sap.m.MessageBox.confirm(
          "Do you want to edit this package?",
          {
            title: "Confirm Edit",
            onClose: function (oAction) {
              resolve(oAction);
            }
          }
        );
      });

      if (oAction === sap.m.MessageBox.Action.OK) {
        var mycontext = await this.SenderEdit._controller.getView().getBindingContext();



        var sReceiverID = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "_IDGenComboBox1").getSelectedKey();
        var shippingCity = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "shippingCity").getValue();
        var shippingState = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "shippingState").getValue();
        var shippingCountry = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "shippingCountry").getValue();
        var shippingPostal = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "shippingPostal").getValue();
        var shippingAddressLine = sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "shippingAddressLine").getValue();

        await mycontext.setProperty("receiver_ID", sReceiverID);
        await mycontext.setProperty("shippingAddress/city", shippingCity);
        await mycontext.setProperty("shippingAddress/state", shippingState);
        await mycontext.setProperty("shippingAddress/country", shippingCountry);
        await mycontext.setProperty("shippingAddress/postalCode", shippingPostal);
        await mycontext.setProperty("shippingAddress/addressLine", shippingAddressLine);

        // // Notify user of successful edit
        var packageNumber = await mycontext.getProperty("packageNumber");
        sap.m.MessageToast.show("Package \"" + packageNumber + "\" edited successfully.");

        oModel.refresh();
        this.SenderEdit.editMode(false);
        
         await sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "onEdit").setVisible(true);
      } else {
         await sap.ui.core.Fragment.byId(this.SenderEdit.sFragmentId, "updateStatusButton").setVisible(false);
      }
      sap.ui.core.BusyIndicator.hide(); // Hide busy indicator regardless of outcome

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
          return "Warning";
        case "DELIVERED":
          return "Success";
        default:
          return "None";
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
        var oContext = await this._controller.getView().getBindingContext();
        console.log("Checking current status...");
        var currentStatus = await oContext.getProperty("shippingStatus");
        if (!currentStatus) {
          console.error("ObjectStatus not found!");
          return;
        }
        console.log("Current Status: ", currentStatus);
        if (currentStatus === "NEW") {
          this.allInputFieldEditable(true);
          sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setVisible(true);
        } else {
          await this.allInputFieldEditable(false);
          await sap.ui.core.Fragment.byId(this.sFragmentId, "onEdit").setVisible(false);
          await sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setVisible(false);
          console.log("After setting visible:", this.getView().byId("onSubmit").getVisible());
        }

        // Enable the button only if the status is "NEW"
        var isButtonEnabled = (currentStatus === "NEW");

        sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setEnabled(isButtonEnabled);
        sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setVisible(isButtonEnabled);
        if (currentStatus == "SHIPPING")
          sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setVisible(true);
        else
          sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setVisible(false);
      } catch (error) {
        console.error("Error in checkUpdateStatusAvailable: ", error);
      }
    },

    allInputFieldEditable: function (state) {
      var comboBox = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1");
      comboBox.setEnabled(state);
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
      var that = this;
      sap.m.MessageBox.warning("Are you sure you want to update the package status from New to Shipping?", {
        title: "Confirm Status Update",
        emphasizedAction: sap.m.MessageBox.Action.OK,
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.OK) {
            that.SenderEdit.updateStatus();
          }
        }
      });
    },
    updateStatus: async function () {
      var oModel = this._controller.getView().getModel();
      var mycontext = await this._controller.getView().getBindingContext();
      var packageNumber = await mycontext.getProperty("packageNumber");

      var currentStatus = await mycontext.getProperty("shippingStatus");
      var nextStatus = this.getNextStatus(currentStatus);

      // Update the data
      await mycontext.setProperty("shippingStatus", nextStatus);
      oModel.refresh();
      this.showToast("Package \"" + packageNumber + "\" status successfully updated to " + nextStatus);
      await this._controller.getView().byId("onSubmit").setVisible(false);
      this.allInputFieldEditable(false);
      await this.editMode(false);

      await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setEnabled(false);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setVisible(false);


      await sap.ui.core.Fragment.byId(this.sFragmentId, "onEdit").setVisible(false);

      await sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setEnabled(true);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setVisible(true);
    },
    getNextStatus: function (currentStatus) {
      return currentStatus === "NEW" ? "SHIPPING" : null;
    },
    onComboBoxChange: function (oEvent) {
      var sInputValue = oEvent.getParameter("value");
      var oComboBox = oEvent.getSource();
      var aItems = oComboBox.getItems();

      // Check if the entered value exists in the items
      var bExists = aItems.some(function (oItem) {
        return oItem.getText() === sInputValue;
      });
      var inputField = oEvent.getSource();
      var value = inputField.getValue();
      if (!value) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This field is required.");
      }
      else if (!bExists) {
        inputField.setValueState(sap.ui.core.ValueState.Error);
        inputField.setValueStateText("This user does not exist in the list.");
      }
      else {
        inputField.setValueState(sap.ui.core.ValueState.None);
        oComboBox.setSelectedKey(aItems.find(oItem => oItem.getText() === sInputValue).getKey());
      }
      this.validateForm();
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
      var sPackageNumber = sap.ui.core.Fragment.byId(this.sFragmentId, "packageNumber").getValue();
      var sPackageWeight = sap.ui.core.Fragment.byId(this.sFragmentId, "packageWeight").getValue();
      var sPackageHeight = sap.ui.core.Fragment.byId(this.sFragmentId, "packageHeight").getValue();
      var shippingCity = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCity").getValue();
      var shippingState = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingState").getValue();
      var shippingCountry = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCountry").getValue();
      var shippingPostal = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingPostal").getValue();
      var shippingAddressLine = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddressLine").getValue();
      var sReceiverID = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1").getSelectedKey();

      // Check if all required fields are filled
      var isFormValid = sPackageNumber !== "" &&
        sPackageWeight !== "" &&
        sPackageHeight !== "" &&
        shippingCity !== "" &&
        shippingState !== "" &&
        shippingCountry !== "" &&
        shippingPostal !== "" &&
        shippingAddressLine !== "" &&
        sReceiverID !== "";
      // Enable or disable the submit button based on the validation
      this.getView().byId("onSubmit").setEnabled(isFormValid);
    },
    editMode: async function (canEdit) {
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageEditForm").setVisible(canEdit);
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageDetailsForm").setVisible(!canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onEdit").setVisible(!canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onCancel").setVisible(canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setVisible(canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setVisible(!canEdit);
    },
    initBUttons: async function (canEdit) {
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageEditForm").setVisible(canEdit);
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageDetailsForm").setVisible(!canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onEdit").setVisible(!canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onCancel").setVisible(canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setVisible(!canEdit);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setVisible(!canEdit);
    },
    onEnableEditMode: async function () {

      await this.SenderEdit.checkUpdateStatusAvailable();
      await this.SenderEdit.editMode(true);
      await sap.ui.core.Fragment.byId(this.sFragmentId, "onSubmit").setEnabled(false);
      this.setReceiverAndAddressFields();
    },
    onBack: function () {
      this.onNavBack();
    },
    // onOpenDialog: function () {
    //   // load BusyDialog fragment asynchronously
    //   if (!this._pBusyDialog) {
    //     this._pBusyDialog = Fragment.load({
    //       name: "parceltracking.view.BusyDialog",
    //       controller: this
    //     }).then(function (oBusyDialog) {
    //       this.getView().addDependent(oBusyDialog);
    //       syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
    //       return oBusyDialog;
    //     }.bind(this));
    //   }

    //   this._pBusyDialog.then(function (oBusyDialog) {
    //     oBusyDialog.open();
    //     this.simulateServerRequest();
    //   }.bind(this));
    // },

    // simulateServerRequest: function () {
    //   // simulate a longer running operation
    //   this.iTimeoutId = setTimeout(function () {
    //     this._pBusyDialog.then(function (oBusyDialog) {
    //       oBusyDialog.close();
    //     });
    //   }.bind(this), 3000);
    // },

    // onDialogClosed: function (oEvent) {
    //   clearTimeout(this.iTimeoutId);

    //   if (oEvent.getParameter("cancelPressed")) {
    //     MessageToast.show("The update status operation has been cancelled");
    //   } else {
    //     this.updateStatus();
    //   }
    // },
    setReceiverAndAddressFields: async function () {

      var mycontext = await this._controller.getView().getBindingContext();
      var addressObject = mycontext.getObject("shippingAddress");
      console.log(addressObject);
      if (addressObject) {
        var shippingCity = await addressObject.city;
        var shippingState = await addressObject.state;
        var shippingCountry = await addressObject.country;
        var shippingPostal = await addressObject.postalCode;
        var shippingAddressLine = await addressObject.addressLine;
      }
      var receiverID = await mycontext.getProperty("receiver_ID");
      console.log(shippingCity);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCity").setValue(shippingCity);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingState").setValue(shippingState);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCountry").setValue(shippingCountry);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingPostal").setValue(shippingPostal);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddressLine").setValue(shippingAddressLine);
      sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1").setSelectedKey(receiverID);
    },
    validateReset: function () {


      // Get all input fields
      var aInputs = [
        sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCity"),
        sap.ui.core.Fragment.byId(this.sFragmentId, "shippingState"),
        sap.ui.core.Fragment.byId(this.sFragmentId, "shippingCountry"),
        sap.ui.core.Fragment.byId(this.sFragmentId, "shippingPostal"),
        sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddressLine"),
        sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1")
      ];

      // Validate each input field
      aInputs.forEach(function (oInput) {
        oInput.setValueState(sap.ui.core.ValueState.None);
      });

    },
    textFormatter: function (status) {
      console.log(status);
      switch (status) {
        case "NEW":
          return "New";
        case "SHIPPING":
          return "Shipping";
        case "DELIVERED":
          return "Delivered";
      }
    },
    onCancelShipping: async function () {
      var that = this;
      sap.m.MessageBox.warning("Are you sure you want to revert the package status from Shipping to New?", {
        title: "Confirm Cancel Shipping",
        emphasizedAction: sap.m.MessageBox.Action.OK,
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.OK) {
            that.SenderEdit.revertShippingStatus();
          }
        }
      });


    },
    revertShippingStatus: async function () {
      var oModel = this._controller.getView().getModel();
      var mycontext = await this._controller.getView().getBindingContext();
      var packageNumber = await mycontext.getProperty("packageNumber");

      var currentStatus = await mycontext.getProperty("shippingStatus");
      if (currentStatus.toLowerCase() == "shipping") {
        await mycontext.setProperty("shippingStatus", "NEW");
        oModel.refresh();
        this.showToast("Package \"" + packageNumber + "\" status successfully reverted back to " + "New");

        await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setEnabled(true);
        await sap.ui.core.Fragment.byId(this.sFragmentId, "updateStatusButton").setVisible(true);
        await sap.ui.core.Fragment.byId(this.sFragmentId, "onEdit").setVisible(true);
        await sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setEnabled(false);
        await sap.ui.core.Fragment.byId(this.sFragmentId, "cancelShippingButton").setVisible(false);
      }
    }
  });
});