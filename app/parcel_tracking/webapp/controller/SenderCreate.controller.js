sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("parceltracking.controller.SenderCreate", {
        onInit: function () {
        },

        onNavBack: function () {
            this.byId("pageContainer").back();
        },

        onCancel: function () {
            this.onNavBack();
        },

        onSelectChange: function (oEvent) {
            var sFragmentId = this.getView().createId("SenderCreateFragment");
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

        onSubmit: function () {
            var sFragmentId = this.getView().createId("SenderCreateFragment");
            var oView = this.getView();
            var oModel = oView.getModel();
            var packageNumber = sap.ui.core.Fragment.byId(sFragmentId, "packageNumber").getValue();
            var receiver = sap.ui.core.Fragment.byId(sFragmentId, "userSelect").getSelectedKey();
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