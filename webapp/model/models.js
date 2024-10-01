sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime info for the device the UI5 app is running on as JSONModel
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            getEcInputModel: function (oModel) {
                let oEntityTypes = oModel.getServiceMetadata().dataServices.schema[0].entityType;
                let oModelEstCal = {};
                oEntityTypes.forEach(element => {
                    if (element.name == "zi_hcl_headerType") {
                        element.property.forEach(value => {
                            oModelEstCal[value.name] = "";      
                        })

                        if (Array.isArray(element.navigationProperty)) {
                            element.navigationProperty.forEach(value => {
                                oModelEstCal[value.name] = [];
                            })
                        }

                    }
                });

                return new JSONModel(oModelEstCal);
            },

            getEcBaseLineModel: function (oModel) {
                let oEntityTypes = oModel.getServiceMetadata().dataServices.schema[0].entityType;
                let oModelSelectedBaseLine = {};
                oEntityTypes.forEach(element => {
                    if (element.name == "zi_hcl_baselineType") {
                        element.property.forEach(value => {
                            oModelSelectedBaseLine[value.name] = "";
                        })
                    }
                });
                return new JSONModel(oModelSelectedBaseLine);
            },
           
        };

    });