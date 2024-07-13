sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/Device',
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    'sap/ui/model/json/JSONModel',
    'sap/m/Menu',
    'sap/m/MenuItem',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment'
],
    function (Controller, Device , Filter, Sorter, JSONModel, Menu, MenuItem, MessageToast, Fragment) {
        "use strict";
        return Controller.extend("parcelTracking.controller.ReceiverOverview", {
            onInit: function () {
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
                if (item.getKey() != 'Create') {
                    this.byId("pageContainer").to(this.getView().createId(item.getKey()))
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("create");
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