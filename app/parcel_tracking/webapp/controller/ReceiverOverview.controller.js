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
    function (Controller, Device, Filter, Sorter, JSONModel, Menu, MenuItem, MessageToast, Fragment, FilterOperator) {
        "use strict";
        return Controller.extend("parcelTracking.controller.ReceiverOverview", {
            checkSize: function (oParams) {
                var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
                var oColumn = sap.ui.core.Fragment.byId(this.sFragmentId, "_IDGenText8");
                switch (oParams.name) {
                    case "Phone":
                    // case "Tablet":
                        oColumn.setVisible(false)
                        break;
                    default:
                        oColumn.setVisible(true)
                        break;
                }
            },
            initReceiverOverview: function (that) {
                this._controller = that;
                this.sFragmentId = this._controller.getView().createId("ReceiverOverviewFragment");
                 Device.media.attachHandler(this.checkSize, this, Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
                var oParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
                this.checkSize(oParams);
            
                this._mViewSettingsDialogs = {};

                this.mGroupFunctions = {
                    Status: function (oContext) {
                        var name = oContext.getProperty("Status");
                        return {
                            key: name,
                            text: name
                        };
                    },
                    Sender: function (oContext) {
                        var name = oContext.getProperty("Sender");
                        return {
                            key: name,
                            text: name
                        };
                    },
                    Created_Date: function (oContext) {
                        var name = oContext.getProperty("Created_Date");
                        return {
                            key: name,
                            text: name
                        };
                    }
                }

            },
            resetGroupDialog: function (oEvent) {
                this.groupReset = true;
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

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
                this.ReceiverOverview.getViewSettingsDialog("parceltracking.view.SortDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("parceltracking.view.FilterDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            handleGroupButtonPressed: function () {
                this.ReceiverOverview.getViewSettingsDialog("parceltracking.view.GroupDialog").then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
            },
            onFilterItems: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                this.ReceiverOverview.filtering(sQuery);
            },
            filtering: function (value) {
                var aFilters = [];

                // Always apply the initial filter for excluding "NEW" shipping status
                var oInitialFilter = new sap.ui.model.Filter("shippingStatus", sap.ui.model.FilterOperator.NE, "NEW");
                aFilters.push(oInitialFilter);

                if (value && value.length > 0) {
                    // Apply search filters if value is not empty
                    var oFilterStatus = new Filter({ path: "shippingStatus", operator: FilterOperator.Contains, value1: value, caseSensitive: false });
                    var oFilterPackage = new Filter({ path: "packageStatus", operator: FilterOperator.Contains, value1: value, caseSensitive: false });
                    var oFilterWeight = new Filter("weight", FilterOperator.Contains, value);
                    var oFilterHeight = new Filter("height", FilterOperator.Contains, value);
                    var oFilterNumber = new Filter({ path: "packageNumber", operator: FilterOperator.Contains, value1: value, caseSensitive: false });

                    // Combine all search filters with OR logic
                    var oSearchFilters = new Filter([oFilterStatus, oFilterWeight, oFilterHeight, oFilterNumber, oFilterPackage], false);
                    aFilters.push(oSearchFilters);
                }

                var oTable = sap.ui.core.Fragment.byId(this.sFragmentId, "idProductsTable");
                var oBinding = oTable.getBinding("items");

                // Apply the combined filters
                oBinding.filter(aFilters);
            },
            handleSortDialogConfirm: async function (oEvent) {
                var oTable = await sap.ui.core.Fragment.byId(this.sFragmentId, "idProductsTable"),
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
            handleGroupDialogConfirm: function (oEvent) {
                var oTable = sap.ui.core.Fragment.byId(this.sFragmentId, "idProductsTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    vGroup,
                    aGroups = [];

                if (mParams.groupItem) {
                    sPath = mParams.groupItem.getKey();
                    bDescending = mParams.groupDescending;
                    vGroup = this.mGroupFunctions[sPath];
                    aGroups.push(new Sorter(sPath, bDescending, vGroup));
                    oBinding.sort(aGroups);
                } else if (this.groupReset) {
                    oBinding.sort();
                    this.groupReset = false;
                }
            },
            onEditButtonPress: function (oEvent) {
                var oItem = oEvent.getSource();
                // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // oRouter.navTo("detail", {
                //     packageId: oItem.getBindingContext().getProperty("ID")
                // }); 
                this.ReceiverDetail.initDetail(oItem.getBindingContext().getProperty("ID"), this);
                this.byId("pageContainer").to(this.getView().createId("Receiver_Detail"));

            },
            availableState: function (status) {
                console.log(status);
                switch (status) {
                    case "NEW":
                        return 6;
                    case "SHIPPING":
                        return 1;
                    case "DELIVERED":
                    case "RECEIVED":
                        return 8;
                    case "DAMAGED":
                        return 2;
                    default:
                        return 6; // Default color scheme
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