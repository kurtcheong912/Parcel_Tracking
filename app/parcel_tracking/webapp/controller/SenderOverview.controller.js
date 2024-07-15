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
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("edit", {
          packageId: oItem.getBindingContext().getProperty("ID")
        });
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
