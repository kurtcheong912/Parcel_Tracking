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
        var oRouter =  sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("edit", {
            packageId: oItem.getBindingContext().getProperty("ID")
        });
        // var oItem = oEvent.getSource();
        // var id = oItem.getBindingContext().getProperty("ID");
        // var oNavContainer = this.byId("pageContainer");
        // var oSenderEditPage = this.getView().createId("Sender_Edit");
        // var oSenderEditPage = this.byId("Sender_Edit");
        // oSenderEditPage.bindElement("/Packages(" + id + ")");
        // oNavContainer.to(oSenderEditPage);
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
      onCreate: function () {
        var oRouter =  sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("create");
      },

      onSearch: function (oEvent) {
        var sQuery = oEvent.getSource().getValue().toLowerCase();
        var oGridList = this.byId("gridList3");
        var oBinding = oGridList.getBinding("items");

        if (sQuery && sQuery.length > 0) {
          var aFilters = [];

          // Filter for packageNumber (case-insensitive)
          aFilters.push(new Filter({
            path: "packageNumber",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false
          }));

          // Split the query to handle first and last names
          var aQueryParts = sQuery.split(" ");
          if (aQueryParts.length === 1) {
            // Single word query: search in both first and last names
            aFilters.push(new Filter({
              path: "receiver/first_name",
              operator: FilterOperator.Contains,
              value1: sQuery,
              caseSensitive: false
            }));
            aFilters.push(new Filter({
              path: "receiver/last_name",
              operator: FilterOperator.Contains,
              value1: sQuery,
              caseSensitive: false
            }));
          } else if (aQueryParts.length >= 2) {
            // Multi-word query: create combinations for first and last names
            var sFirstNamePart = aQueryParts[0];
            var sLastNamePart = aQueryParts[1];
            aFilters.push(new Filter({
              path: "receiver/first_name",
              operator: FilterOperator.Contains,
              value1: sFirstNamePart,
              caseSensitive: false
            }));
            aFilters.push(new Filter({
              path: "receiver/last_name",
              operator: FilterOperator.Contains,
              value1: sLastNamePart,
              caseSensitive: false
            }));
            aFilters.push(new Filter({
              path: "receiver/first_name",
              operator: FilterOperator.Contains,
              value1: sLastNamePart,
              caseSensitive: false
            }));
            aFilters.push(new Filter({
              path: "receiver/last_name",
              operator: FilterOperator.Contains,
              value1: sFirstNamePart,
              caseSensitive: false
            }));
          }

          // Filter for Status (case-insensitive)
          aFilters.push(new Filter({
            path: "status",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false
          }));

          // Combine filters using OR operator
          var oCombinedFilter = new Filter({
            filters: aFilters,
            and: false
          });

          oBinding.filter(oCombinedFilter);
        } else {
          oBinding.filter([]);
        }
      },
    });
  });
