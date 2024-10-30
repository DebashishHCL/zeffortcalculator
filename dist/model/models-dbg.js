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

            getlabelsPageWise: function(oData){
                let aPages = [];
                let aFieldIds = []
                oData.results.forEach(item => {
                    switch (item.PageId) {
                        case "DO":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["DO"] =  aFieldIds;
                        break;
                        case "DT":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["DT"] =  aFieldIds;
                        break;
                        case "DP":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["DP"] =  aFieldIds;
                        break;
                        case "WP":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["WP"] =  aFieldIds;
                        break;
                        case "S":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["S"] =  aFieldIds;
                        break;
                        case "H":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["H"] =  aFieldIds;
                        break;
                        case "PT":
                            aFieldIds[item.FieldId] =  item.Description;
                            aPages["PT"] =  aFieldIds;
                        break;  
                    
                        default:
                            break;
                    }
                });
                console.log(aPages);
                return new JSONModel(aPages); ;
            }
           
        };

    });