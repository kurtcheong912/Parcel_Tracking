sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/ui/core/Fragment',
  'sap/ui/core/routing/History'
], function (Controller, Fragment, History) {
  "use strict";
  return Controller.extend("parceltracking.controller.ReceiverDetail", {
    onInit: async function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      await oRouter.getRoute("detail").attachPatternMatched(await this.onEdit, this);
    },
    onEdit: async function (oEvent) {
      var packageId = oEvent.getParameter("arguments").packageId;
      this.getView().bindElement("/Packages(" + packageId + ")");

      await this.getView().getBindingContext().requestObject();
      await this.checkUpdateStatusAvailable();
    },
    checkUpdateStatusAvailable: async function () {
      try {
        var oContext = this.getView().getBindingContext();
        var currentStatus = oContext.getProperty("status");
        var signature = oContext.getProperty("signature");

        // Enable the button only if the status is "NEW" or "SHIPPING"
        var isButtonEnabled = (currentStatus === "DELIVERED");
        var  isSigned = signature !==  null;
        console.log(signature);

        this.getView().byId("toggleableButtonSection").setVisible(isButtonEnabled);
        this.getView().byId("_IDGenFormElement22222222").setVisible(isSigned);

      } catch (error) {
        console.error("Error in checkUpdateStatusAvailable: ", error);
      }
    },
    onMenuButtonPress: function () {
      var toolPage = this.byId("toolPage");
      toolPage.setSideExpanded(!toolPage.getSideExpanded());
  },
    onOrderReceived: function () {
      this.orderStatus = "RECEIVED";
      this.onReceiveDialogPress();
    },
    onOrderDamaged: function () {
      this.orderStatus = "DAMAGED";
      this.onReceiveDialogPress();
    },
    onReceiveDialogPress: function () {
      var oView = this.getView();

      // Check if the dialog already exists
      if (!this._pDialog) {
        this._pDialog = Fragment.load({
          id: oView.getId(),
          name: "parceltracking.view.SignaturePad",
          controller: this // Set the controller to this if needed
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pDialog.then(function () {
        // Accessing the HTML element inside the VBox
        var oHtml = sap.ui.core.Fragment.byId(oView.getId(), "html");

        if (oHtml) {
          oHtml.setContent("<canvas id='signature-pad' width='400' height='200' class='signature-pad'></canvas>");
        } else {
          console.log("HTML element not found.");
        }
      }); // Ensure the context is correct by binding this

      this._pDialog.then(function (oDialog) {
        oDialog.open();
        this.onSign();
      }.bind(this));
    },
    stateFormatter: function (status) {
      switch (status) {
        case "NEW":
          return "Information";
        case "SHIPPING":
          return "Warning"; // You can set this based on your logic
        case "DELIVERED":
          return "Success";
        default:
          return "None"; // Default state if needed
      }
    },
    onSign: function (oEvent) {
      var canvas = document.getElementById("signature-pad");
      var context = canvas.getContext("2d");
      canvas.width = 400;
      canvas.height = 200;
      context.fillStyle = "#fff";
      context.strokeStyle = "#444";
      context.lineWidth = 1.5;
      context.lineCap = "round";
      context.fillRect(0, 0, canvas.width, canvas.height);
      var disableSave = true;
      var pixels = [];
      var cpixels = [];
      var xyLast = {};
      var xyAddLast = {};
      var calculate = false;
      { 	//functions
        function remove_event_listeners() {
          canvas.removeEventListener('mousemove', on_mousemove, false);
          canvas.removeEventListener('mouseup', on_mouseup, false);
          canvas.removeEventListener('touchmove', on_mousemove, false);
          canvas.removeEventListener('touchend', on_mouseup, false);

          document.body.removeEventListener('mouseup', on_mouseup, false);
          document.body.removeEventListener('touchend', on_mouseup, false);
        }

        function get_coords(e) {
          var x, y;

          if (e.changedTouches && e.changedTouches[0]) {
            var canvasArea = canvas.getBoundingClientRect();
            var offsety = canvasArea.top || 0;
            var offsetx = canvasArea.left || 0;

            x = e.changedTouches[0].pageX - offsetx;
            y = e.changedTouches[0].pageY - offsety;
          } else if (e.layerX || 0 == e.layerX) {
            x = e.layerX;
            y = e.layerY;
          } else if (e.offsetX || 0 == e.offsetX) {
            x = e.offsetX;
            y = e.offsetY;
          }

          return {
            x: x, y: y
          };
        };

        function on_mousedown(e) {
          e.preventDefault();
          e.stopPropagation();

          canvas.addEventListener('mouseup', on_mouseup, false);
          canvas.addEventListener('mousemove', on_mousemove, false);
          canvas.addEventListener('touchend', on_mouseup, false);
          canvas.addEventListener('touchmove', on_mousemove, false);
          document.body.addEventListener('mouseup', on_mouseup, false);
          document.body.addEventListener('touchend', on_mouseup, false);

          var xy = get_coords(e);
          context.beginPath();
          pixels.push('moveStart');
          context.moveTo(xy.x, xy.y);
          pixels.push(xy.x, xy.y);
          xyLast = xy;
        };

        function on_mousemove(e, finish) {
          e.preventDefault();
          e.stopPropagation();

          var xy = get_coords(e);
          var xyAdd = {
            x: (xyLast.x + xy.x) / 2,
            y: (xyLast.y + xy.y) / 2
          };

          if (calculate) {
            var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
            var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
            pixels.push(xLast, yLast);
          } else {
            calculate = true;
          }

          context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
          pixels.push(xyAdd.x, xyAdd.y);
          context.stroke();
          context.beginPath();
          context.moveTo(xyAdd.x, xyAdd.y);
          xyAddLast = xyAdd;
          xyLast = xy;

        };

        function on_mouseup(e) {
          remove_event_listeners();
          disableSave = false;
          context.stroke();
          pixels.push('e');
          calculate = false;
        };
        canvas.addEventListener('touchstart', on_mousedown, false);
        canvas.addEventListener('mousedown', on_mousedown, false);
      }
    },
    saveButton :async function(oEvent){
      var canvas = document.getElementById("signature-pad");
      var link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg',0.3);

      link.download = 'sign.jpeg';

      var packageId = this.byId("packageID").getText();

      var oModel = this.getView().getModel();

      var sPath = "/Packages("+ packageId + ")";

      var oContext = oModel.bindContext(sPath);

      var oBindingContext = oContext.getBoundContext();

      oBindingContext.setProperty("status", this.orderStatus);
      oBindingContext.setProperty("signature",  link.href);
      oModel.refresh();
      this.getView().byId("toggleableButtonSection").setVisible(false);
      this.getView().byId("_IDGenFormElement22222222").setVisible(true);
      this.onCloseDialog();
  },

    /************Clear Signature Pad**************************/

    clearButton: function (oEvent) {
      var canvas = document.getElementById("signature-pad");
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
        backgroundColor: '#ffffff',
      })
    },
    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("receiver", {}, true);
      }
    },
    onCloseDialog: function () {
      this.clearButton();
      if (this._pDialog) {
        this._pDialog.then(function (oDialog) {
          oDialog.close();
        });
      }
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
    }
  })
});