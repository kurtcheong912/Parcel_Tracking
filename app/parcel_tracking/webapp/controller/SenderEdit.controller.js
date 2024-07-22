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
    onInit: async function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      await oRouter.getRoute("edit").attachPatternMatched(await this.onEdit, this);
      this.sFragmentId = await this.getView().createId("SenderEditFragment");
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

    onEdit: async function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      await this.getView().bindElement("/Packages(" + packageId + ")");
      await this.getView().getBindingContext().requestObject();
      await this.validateReset();
      await this.allInputFieldEditable(true);
      await this.checkUpdateStatusAvailable();
      await this.validateForm();
      await this.editMode(false);

    },
    onCancel: async function () {
      await this.validateReset();
      this.editMode(false);
    },
    onSubmit: function () {
      var that = this; // Keep reference to the controller

      sap.m.MessageBox.confirm(
        "Do you want to edit this package?",
        {
          title: "Confirm Edit",
          onClose: async function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              // User clicked OK, proceed with edit
              var oModel = that.getView().getModel();

              var sShippingAddress = sap.ui.core.Fragment.byId(that.sFragmentId, "shippingAddress").getValue();
              var oComboBox = sap.ui.core.Fragment.byId(that.sFragmentId, "_IDGenComboBox1");
              var sReceiverID = oComboBox.getSelectedKey();

              var mycontext = await that.getView().getBindingContext();
              await mycontext.setProperty("shippingAddress", sShippingAddress);
              await mycontext.setProperty("receiver_ID", sReceiverID);

              var packageNumber = await mycontext.getProperty("packageNumber");
              sap.m.MessageToast.show("Package \"" + packageNumber + "\" edited successfully.");

              oModel.refresh();
              that.editMode(false);
              await that.getView().byId("onEdit").setVisible(true);

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
        var oContext = await this.getView().getBindingContext();
        console.log("Checking current status...");
        var currentStatus = await oContext.getProperty("shippingStatus");
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
          await this.getView().byId("onEdit").setVisible(false);
          await this.getView().byId("onSubmit").setVisible(false);
          console.log("After setting visible:", this.getView().byId("onSubmit").getVisible());
        }

        // Enable the button only if the status is "NEW"
        var isButtonEnabled = (currentStatus === "NEW");
        this.getView().byId("updateStatusButton").setEnabled(isButtonEnabled);
        this.getView().byId("updateStatusButton").setVisible(isButtonEnabled);

      } catch (error) {
        console.error("Error in checkUpdateStatusAvailable: ", error);
      }
    },

    allInputFieldEditable: function (state) {
      var oView = this.getView();
      var comboBox = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1");
      comboBox.setEnabled(state);
      var shippingAddress = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddress");
      shippingAddress.setEnabled(state);
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
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: function (oAction) {
          if (oAction === sap.m.MessageBox.Action.OK) {
            that.onOpenDialog();
          }
        }
      });
    },
    updateStatus: async function () {
      var oModel = this.getView().getModel();
      var mycontext = await this.getView().getBindingContext();
      var packageNumber = await mycontext.getProperty("packageNumber");

      var currentStatus = await mycontext.getProperty("shippingStatus");
      var nextStatus = this.getNextStatus(currentStatus);

      // Update the data
      await mycontext.setProperty("shippingStatus", nextStatus);
      oModel.refresh();
      this.showToast("Package \"" + packageNumber + "\" status successfully updated to " + nextStatus);
      await this.getView().byId("onSubmit").setVisible(false);
      this.allInputFieldEditable(false);
      this.getView().byId("updateStatusButton").setEnabled(false);
      this.getView().byId("updateStatusButton").setVisible(false);

      this.editMode(false);
      await this.getView().byId("onEdit").setVisible(false);
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
      var sShippingAddress = sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddress").getValue();
      var sReceiverID = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1").getSelectedKey();

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
    },
    editMode: async function (canEdit) {
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageEditForm").setVisible(canEdit);
      sap.ui.core.Fragment.byId(this.sFragmentId, "packageDetailsForm").setVisible(!canEdit);

      await this.getView().byId("onEdit").setVisible(!canEdit);
      await this.getView().byId("onBack").setVisible(!canEdit);
      await this.getView().byId("onCancel").setVisible(canEdit);
      await this.getView().byId("onSubmit").setVisible(canEdit);
      await this.getView().byId("updateStatusButton").setVisible(canEdit);

      var oPage = this.byId("Sender_Edit");
      if (canEdit) {
        oPage.setTitle("Edit");
      } else {
        oPage.setTitle("Details");
      }
    },
    onEnableEditMode: async function () {
      await this.editMode(true);
      await this.checkUpdateStatusAvailable();
      console.log("ewdfewfw");
      this.setReceiverAndAddressFields();
    },
    onBack: function () {
      this.onNavBack();
    },
    onOpenDialog: function () {
      // load BusyDialog fragment asynchronously
      if (!this._pBusyDialog) {
        this._pBusyDialog = Fragment.load({
          name: "parceltracking.view.BusyDialog",
          controller: this
        }).then(function (oBusyDialog) {
          this.getView().addDependent(oBusyDialog);
          syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
          return oBusyDialog;
        }.bind(this));
      }

      this._pBusyDialog.then(function (oBusyDialog) {
        oBusyDialog.open();
        this.simulateServerRequest();
      }.bind(this));
    },

    simulateServerRequest: function () {
      // simulate a longer running operation
      this.iTimeoutId = setTimeout(function () {
        this._pBusyDialog.then(function (oBusyDialog) {
          oBusyDialog.close();
        });
      }.bind(this), 3000);
    },

    onDialogClosed: function (oEvent) {
      clearTimeout(this.iTimeoutId);

      if (oEvent.getParameter("cancelPressed")) {
        MessageToast.show("The update status operation has been cancelled");
      } else {
        this.updateStatus();
      }
    },
    setReceiverAndAddressFields: async function () {
      var mycontext = await this.getView().getBindingContext();
      var receiverID = await mycontext.getProperty("receiver_ID");
      var shippingAddress = await mycontext.getProperty("shippingAddress");

      sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenComboBox1").setSelectedKey(receiverID);
      sap.ui.core.Fragment.byId(this.sFragmentId, "shippingAddress").setValue(shippingAddress);
    },
    validateReset: function () {
      var isValid = true;
      var sFragmentId = this.getView().createId("SenderEditFragment");

      // Get all input fields
      var aInputs = [
        sap.ui.core.Fragment.byId(sFragmentId, "shippingAddress"),
        sap.ui.core.Fragment.byId(sFragmentId, "_IDGenComboBox1")
      ];

      // Validate each input field
      aInputs.forEach(function (oInput) {
        oInput.setValueState(sap.ui.core.ValueState.None);
      });

    },
  });
});