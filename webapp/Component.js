/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/zeffortcalculator/model/models",
    "sap/ui/model/json/JSONModel",
    "./controller/ErrorHandler"
],
    function (UIComponent, Device, models, JSONModel, ErrorHandler) {
        "use strict";

        return UIComponent.extend("com.zeffortcalculator.Component", {
            metadata: {
                interfaces: ["sap.ui.core.IAsyncContentCreation"],
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                this._oErrorHandler = new ErrorHandler(this);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // set pgUiData model
                let oModel = new JSONModel();
                oModel.setData({ "loggedInUser": "", "loggedInUserEmail": "", "loggedInUserName": "", "enableTableData": false, "errors": false, "showBaseLines": true, "hoursOrMonth": "M" });
                this.setModel(oModel, "pgUiData");

                this.getModel().metadataLoaded().then(() => {
                    this.setModel(models.getEcInputModel(this.getModel()), "oModelEstCal");                 /* oModelEstCal = global model for application */
                    this.setModel(models.getEcBaseLineModel(this.getModel()), "oModelSelectedBaseLine");    /* oModelBaseLine = Selected BaseLine model for application */
                    this.getModel().read("/zi_hcl_baseline", {
                        success: (oData) => {
                            let oJsModel = new JSONModel();
                            oJsModel.setData(oData.results);
                            this.setModel(oJsModel, "oModelBaseLineDataSet");       /*  Dataset model for Baselines of the application */
                        },
                        error: (oError) => {
                            console.log(oError);
                        }
                    });
                });

                // Get Loggon User
                let oUserModel = new JSONModel();
                const url = this.getManifestObject()._oBaseUri._parts.path + "user-api/attributes";
                oUserModel.loadData(url);
                oUserModel.dataLoaded().then(() => {
                    this.getModel("pgUiData").setProperty("/loggedInUser", oUserModel.getData().hasOwnProperty("sub") ? oUserModel.getData().sub[0] : "");
                    this.getModel("pgUiData").setProperty("/loggedInUserEmail", oUserModel.getData().hasOwnProperty("email") ? oUserModel.getData().email : "");
                    this.getModel("pgUiData").setProperty("/loggedInUserName", oUserModel.getData().firstname + " " + oUserModel.getData().lastname);
                })
                    .catch(() => { });
            },

            destroy: function () {
                this._oErrorHandler.destroy();
                // call the base component's destroy function
                UIComponent.prototype.destroy.apply(this, arguments);
            },

            getContentDensityClass: function () {
                if (this._sContentDensityClass === undefined) {
                    // check whether FLP has already set the content density class; do nothing in this case
                    if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                        this._sContentDensityClass = "";
                    } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            }
        });
    }
);