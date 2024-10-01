sap.ui.define([
    "./BaseController",
    "sap/ui/core/library",
    "sap/m/MessageBox",
    "com/zeffortcalculator/model/models",
],
    function (BaseController, CoreLib, MessageBox, models) {
        "use strict";
        const { BusyIndicator } = CoreLib;
        return BaseController.extend("com.zeffortcalculator.controller.Opportunity", {
            onInit: function () {
                this.getView().addEventDelegate({
                    onBeforeShow: () => {
                        // Clearing the Global Input Model and the radio buttons
                        this.getOwnerModel("oModelEstCal").destroy();
                        this.setOwnerModel(models.getEcInputModel(this.getOwnerModel()), "oModelEstCal");
                        this.getView().byId("radio_L").setSelected(false);
                        this.getView().byId("radio_U").setSelected(false);
                        this.getView().byId("radio_C").setSelected(false);
                    },
                    onAfterShow: () => {
                        this.getView().byId("hclImg").attachPress(() => {
                            this.onHome();
                        });
                    }
                });
            },
            onWorkpackage: function (oEvent, value) {
                if (value) {
                    this.getOwnerModel("oModelEstCal").setProperty("/OppType", value);
                }
            },

            onSpecialCharacterCheck: function(oEvent){
                if(!this.specialCharacterCheck(oEvent.getSource().getValue())){
                    // oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, oEvent.getSource().getValue().length - 1));
                    oEvent.getSource().setValue( oEvent.getSource().getValue().replace(/[^a-zA-Z0-9]/g, '').trim() );
                }
            },

            onOpportunitysubmit: function () {
                let oJsData = {
                    "CustId": this.getOwnerModel("oModelEstCal").getProperty("/CustId").trim(),
                    "OppType": this.getOwnerModel("oModelEstCal").getProperty("/OppType").trim(),
                    "CustName": this.getOwnerModel("oModelEstCal").getProperty("/CustName").trim(),
                    "OppName": this.getOwnerModel("oModelEstCal").getProperty("/OppName").trim(),
                };

                if (oJsData.CustId.trim() && oJsData.CustName.trim() && oJsData.OppName.trim() && oJsData.OppType.trim()) {
                    BusyIndicator.show();
                    let oResponse = this.callBackEnd("/zi_hcl_opp_custom", "POST", [], oJsData);
                    oResponse.then((oResponse) => {
                        let result = oResponse.data;
                        this.getOwnerModel("oModelEstCal").setProperty("/OpportunityId", result.OpportunityId);
                        this.getOwnerModel("oModelEstCal").setProperty("/Version", result.Version);
                        BusyIndicator.hide();
                        if (JSON.parse(oResponse.headers['sap-message'])?.severity == "error") {
                            MessageBox.error(JSON.parse(oResponse.headers['sap-message']).message, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: () => {
                                    return;
                                }
                            });
                            return;
                        }

                        MessageBox.information("Opportunity ID " + result.OpportunityId + " has been created for future reference", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: () => {
                                this.getRouter().navTo("Calculate", {}, false);
                                return;
                            }
                        });

                    }).catch((error) => {
                        MessageBox.error(JSON.stringify(error));
                        BusyIndicator.hide();
                    });

                } else {
                    MessageBox.error("Please enter all the required fields");
                }

            },
        });
    });
