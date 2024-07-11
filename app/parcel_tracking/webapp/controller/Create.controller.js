sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("parceltracking.controller.Create", {
        onInit: function () {
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

        onSave: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var packageNumber = oView.byId("packageNumber").getValue();
            var receiverId = oView.byId("receiverId").getValue();
            var shippingAddress = oView.byId("shippingAddress").getValue();
            var packageData = oModel.bindList("/Packages");
            this.oNewPackage = packageData.create({
                packageNumber: packageNumber,
                receiver_ID: receiverId,
                shippingAddress: shippingAddress,
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