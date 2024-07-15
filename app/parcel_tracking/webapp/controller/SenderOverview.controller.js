sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
],
  function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("parceltracking.controller.SenderOverview", {
      onInit: function () {
      },

      onListItemPress: function (oEvent) {
        var oItem = oEvent.getSource();
        var id = oItem.getBindingContext().getProperty("ID");
        var oNavContainer = this.byId("pageContainer");
        var oSenderEditPage = this.getView().createId("Sender_Edit");
        var oSenderEditPage = this.byId("Sender_Edit");
        oSenderEditPage.bindElement("/Packages(" + id + ")");
        oNavContainer.to(oSenderEditPage);
      },

      onCreate: function () {
        this.byId("pageContainer").to(this.getView().createId("Sender_Create"));
      },

      onSearch: function (oEvent) {
        var sQuery = oEvent.getSource().getValue();
        var oGridList = this.byId("gridList3");
        var oBinding = oGridList.getBinding("items");

        if (sQuery && sQuery.length > 0) {
          var oFilter = new Filter("packageNumber", FilterOperator.Contains, sQuery);
          var aFilters = [];
          aFilters.push(oFilter);
          oBinding.filter(aFilters);
        } else {
          oBinding.filter([]);
        }
      }
    });
  });
