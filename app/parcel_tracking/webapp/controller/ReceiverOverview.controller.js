sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/Device',
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    'sap/ui/model/json/JSONModel',
    'sap/m/Menu',
    'sap/m/MenuItem',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
	"sap/ui/model/FilterOperator"
],
    function (Controller, Device , Filter, Sorter, JSONModel, Menu, MenuItem, MessageToast, Fragment, FilterOperator) {
        "use strict";
        return Controller.extend("parcelTracking.controller.ReceiverOverview", {
            onInit: function () {
                var oModel = 


                Device.media.attachHandler(this.checkSize, null, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
                var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
                var toolPage = this.byId("toolPage");
                var shellBar = this.byId("_IDGenShellBar1");

                switch(oParams.name)
                {
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

                console.log(oParams);

                this._mViewSettingsDialogs = {};

                this.mGroupFunctions = {
                    Status: function(oContext) {
                        var name = oContext.getProperty("Status");
                        return {
                            key: name,
                            text: name
                        };
                    },
                    Sender: function(oContext) {
                        var name = oContext.getProperty("Sender");
                        return {
                            key: name,
                            text: name
                        };
                    },
                    Created_Date: function(oContext) {
                        var name = oContext.getProperty("Created_Date");
                        return {
                            key: name,
                            text: name
                        };
                    }
                }

            },
            resetGroupDialog:function (oEvent) {
                this.groupReset = true;
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
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
            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("parceltracking.view.SortDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("parceltracking.view.FilterDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            handleGroupButtonPressed: function () {
                this.getViewSettingsDialog("parceltracking.view.GroupDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            onFilterItems: function(oEvent) {
                var sQuery = oEvent.getSource().getValue();
                this.filtering(sQuery);
            },
            filtering: function(value) {
                var oFilterId = new Filter("ID", FilterOperator.Contains, value);
                var oFilterStatus = new Filter("status", FilterOperator.Contains, value);
                var oFilterWeight = new Filter("weight", FilterOperator.Contains, value);
                var oFilterHeight = new Filter("height", FilterOperator.Contains, value);
                var oFilterAddress = new Filter("shippingAddress", FilterOperator.Contains, value);
                var oFilterNumber = new Filter("packageNumber", FilterOperator.Contains, value);
                var allFilter = new Filter([oFilterStatus, oFilterNumber, oFilterWeight, oFilterHeight], false)
                var oTable = this.byId("idProductsTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(allFilter);
            },
            handleSortDialogConfirm: function(oEvent) {
                var oTable = this.byId("idProductsTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                oBinding.sort(aSorters);
            },
            handleGroupDialogConfirm: function(oEvent) {
                var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

                if(mParams.groupItem) {
                    sPath = mParams.groupItem.getKey();
                    bDescending = mParams.groupDescending;
                    vGroup = this.mGroupFunctions[sPath];
                    aGroups.push(new Sorter(sPath, bDescending, vGroup));
                    oBinding.sort(aGroups);
                }else if(this.groupReset) {
                    oBinding.sort();
                    this.groupReset = false;
                }
            },
            onEditButtonPress: function(oEvent) 
            {
                var oItem = oEvent.getSource();
                var oRouter =  sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("detail", {
                    packageId: oItem.getBindingContext().getProperty("ID")
                });
            }

        });
    });