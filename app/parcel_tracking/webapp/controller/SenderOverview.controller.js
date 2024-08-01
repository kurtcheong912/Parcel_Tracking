sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  'sap/ui/model/Sorter',
  'sap/ui/core/Fragment',
  'sap/ui/Device',
],
  function (Controller, Filter, FilterOperator, Sorter, Fragment, Device) {
    "use strict";

    return Controller.extend("parceltracking.controller.SenderOverview", {
      checkSize: function (oParams) {
        var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
        var oColumn = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenText8");
        switch (oParams.name) {
            case "Phone":
            case "Tablet":
                oColumn.setVisible(false)
                break;
            default:
                oColumn.setVisible(true)
                break;
        }
    },
      initSenderOverview: function (that) {
        this._controller = that;
        this._mViewSettingsDialogs = {};
      },

      onListItemPress: function (oEvent) {
        var oItem = oEvent.getSource();
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("edit", {
        //   packageId: oItem.getBindingContext().getProperty("ID")
        // });
        this.SenderEdit.initEdit(oItem.getBindingContext().getProperty("ID"), this);
        this.byId("pageContainer").to(this.getView().createId("Sender_Edit"));
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
        this.SenderCreate.initAdd(this);
        this.byId("pageContainer").to(this.getView().createId("Sender_Create"));
      },

      onSearch: function (oEvent) {
        var sQuery = this.byId("searchField").getValue().toLowerCase();
        var oList = this.byId("packageList");
        var oGridList = this.byId("packageGridList");
        var gridBinding = oGridList.getBinding("items");
        var listBinding = oList.getBinding("items");

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
            path: "shippingStatus",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false
          }));

          // Combine filters using OR operator
          var oCombinedFilter = new Filter({
            filters: aFilters,
            and: false
          });

          gridBinding.filter(oCombinedFilter);
          listBinding.filter(oCombinedFilter);
        } else {
          gridBinding.filter([]);
          listBinding.filter([]);
        }
      },

      //Sorting Dialog
      handleSortButtonPressed: function () {
        //byebye
        this.SenderOverview.getViewSettingsDialog("parceltracking.view.SortDialog").then(function (oViewSettingsDialog) {
          oViewSettingsDialog.open();
        });
      },
      getViewSettingsDialog: function (sDialogFragmentName) {
        var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
        console.log(this._controller);
        console.log(this._controller.getView());
        if (!pDialog) {
          pDialog = Fragment.load({
            id: this._controller.getView().getId(),
            name: sDialogFragmentName,
            controller: this
          }).then(function (oDialog) {
            if (Device.system.desktop) {
              oDialog.addStyleClass("sapUiSizeCompact");
            }
            return oDialog;
          });
          this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
        }
        return pDialog;
      },

      handleSortDialogConfirm: function (oEvent) {
        var oList = this._controller.byId("packageList");
        var oGridList = this._controller.byId("packageGridList"),
          mParams = oEvent.getParameters(),
          sPath,
          bDescending,
          aSorters = [];
        var gridBinding = oGridList.getBinding("items");
        var listBinding = oList.getBinding("items");
        sPath = mParams.sortItem.getKey();
        bDescending = mParams.sortDescending;
        aSorters.push(new Sorter(sPath, bDescending));

        gridBinding.sort(aSorters);
        listBinding.sort(aSorters);
      },

      //Color Formatter for Shipping Status
      formatColorScheme: function (shippingStatus) {
        switch (shippingStatus) {
          case "NEW":
            return 6;
          case "SHIPPING":
            return 1;
          case "DELIVERED":
            return 8;
          default:
            return 7; // Default color scheme
        }
      },

      onGrid: function (oEvent) {
        if (oEvent.getSource().getPressed()) {
          this.byId("packageList").setVisible(false);
          this.byId("packageGridList").setVisible(true);
          this.byId("listToggleButton").setPressed(false);
        } else {
          this.byId("gridToggleButton").setPressed(true);
        }
      },

      onList: function (oEvent) {
        if (oEvent.getSource().getPressed()) {
          this.byId("packageGridList").setVisible(false);
          this.byId("packageList").setVisible(true);
          this.byId("gridToggleButton").setPressed(false);
        } else {
          this.byId("listToggleButton").setPressed(true);
        }
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
          case "RECEIVED":
            return "Received";
          case "DAMAGED":
            return "Damaged";
          default:
            return "Pending"; // Default color scheme
        }
      }
    });
  });
