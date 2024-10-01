sap.ui.define([
	"./BaseController",
	"sap/ui/core/library",
	"../utils/formatter",
	"sap/m/MessageBox"
],
	function (BaseController, CoreLib, formatter, MessageBox) {
		"use strict";

		const { UIComponent, ValueState, BusyIndicator } = CoreLib;

		return BaseController.extend("com.zeffortcalculator.controller.Calculate", {
			formatter: formatter,
			onInit: function () {
				this.getView().addEventDelegate({
                    onAfterShow: ()=>{
                       this.getView().byId("hclImg").attachPress(()=>{
                            this.onHome();
                       });
                    }
                });
				var router = UIComponent.getRouterFor(this);
				router.getRoute("Calculate").attachPatternMatched(this._onObjectFetched, this);
				
			},

			_onObjectFetched: function () {
				this.getView().loaded().then(() => {
					this.getOwnerModel("pgUiData").setProperty("/showBaseLines", false);
					if (this.getOwnerModel("oModelEstCal").getProperty("/SsDbSize")) {
						this.getView().byId("SsDbSize").fireChange({ value: this.getOwnerModel("oModelEstCal").getProperty("/SsDbSize") });
						this.getOwnerModel("oModelEstCal").setProperty("/SaveOrEdit", "");
					}

				});

				this.getView().byId("CalculateButtons").setVisible(false);
				this.getView().byId("CalculateButtons").setVisible(true);
			},

			onHome: function () {
				this.getView().byId("CalculateButtons").setVisible(false);
				this.getRouter().navTo("Home", {}, false);
			},
			onCommentsLength: function (oEvent) {
				if (oEvent.getSource().getValue().length > +oEvent.getSource().getMaxLength()) {
					oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, +oEvent.getSource().getMaxLength()));
					return false;
				}

				const checkValidations = this.specialCharacterCheck(oEvent.getSource().getValue())
				if (!checkValidations) {
					oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, oEvent.getSource().getValue().length - 1))
				}
			},

			onRangeInfo: function (oEvent, sProperty) {
				let sEnteredValue = +this.getOwnerModel("oModelEstCal").getProperty("/" + sProperty);
				let sBaseValue = +this.getOwnerModel("oModelSelectedBaseLine").getProperty("/" + sProperty);
				let sRangeValue = +this.getOwnerModel("rangeData").getProperty("/" + sProperty);
				let sType = "";
				switch (sProperty) {
					case "SimComplexFm":
						sType = ` \n\nNote: The typical Complexity of SAP Modules has been categorized as below. This will vary from Industry type: \n Low 🡪 SD,HCM,PP, PS ,PM, QM`;
						break;
					case "MedComplexFm":
						sType = ` \n\nNote: The typical Complexity of SAP Modules has been categorized as below. This will vary from Industry type: \n Medium 🡪 MM , PP \n`;
						break;
					case "HighComplexFm":
						sType = ` \n\nNote: The typical Complexity of SAP Modules has been categorized as below. This will vary from Industry type: \n High 🡪 FICO & CVI \n`;
						break;
					default:
						break;
				}
				MessageBox.information(
					`The difference between entered value and baseline value should be less than or equal to the range value. \n
					 Entered value(${sEnteredValue}) - Baseline(${sBaseValue}) <= Range value(${sRangeValue})
					 ${sType}`
				);

			},
			checkwithBaseLine: function (oEvent, sProperty) {
				// if (sProperty != "NoOfCycles" && oEvent.getSource().getValue().includes(".")) {
				if (oEvent.getSource().getValue().includes(".")) {
					oEvent.preventDefault();
					oEvent.getSource().setValue(+oEvent.getSource().getValue().split('.').join(""));
				}

				let ooModelSelectedBaseLine = this.getOwnerModel("oModelSelectedBaseLine").getData()[sProperty];
				let oRangeData = this.getOwnerModel("rangeData").getData()[sProperty];
				// let nValue = sProperty != "NoOfCycles" ? +oEvent.getSource().getValue() : oEvent.getSource().getValue();
				let nValue = +oEvent.getSource().getValue();
				oEvent.getSource().setValueState(ValueState.None);
				if (nValue < 0) {
					oEvent.getSource().setValue();
					return;
				}

				if (!((+ooModelSelectedBaseLine - oRangeData <= nValue) && (nValue <= +ooModelSelectedBaseLine + oRangeData))) {
					oEvent.getSource().setValueState(ValueState.Error);
					this.getOwnerModel("pgUiData").setProperty("/errors", true);
				}
				else this.getOwnerModel("pgUiData").setProperty("/errors", false);
				oEvent.getSource().setValueStateText("");
			},
			onDBChange: function (oEvent) {
				let sOpportunityType = this.getOwnerModel("oModelEstCal").getProperty("/OppType");
				let sSourceDB = parseFloat(oEvent.getSource().getValue());
				let alBaseLineModel = this.getOwnerModel("oModelBaseLineDataSet").getData();
				if (sSourceDB) {
					oEvent.getSource().setValueState(ValueState.None);
					oEvent.getSource().setValueStateText("");
					this.getOwnerModel("pgUiData").setProperty("/errors", false);
					this.getOwnerModel("pgUiData").setProperty("/showBaseLines", true);
					if (sSourceDB > 0 && sSourceDB <= 3) {
						this.getOwnerModel("oModelEstCal").setProperty("/SystemSize", "S");
					}
					else if (sSourceDB > 3 && sSourceDB <= 6) {
						this.getOwnerModel("oModelEstCal").setProperty("/SystemSize", "M");
					}
					else if (sSourceDB > 6 && sSourceDB <= 10) {
						this.getOwnerModel("oModelEstCal").setProperty("/SystemSize", "L");
					} else {
						this.getOwnerModel("oModelEstCal").setProperty("/SystemSize", "");
						oEvent.getSource().setValueState(ValueState.Error);
						oEvent.getSource().setValueStateText("Maximum size 10 TB");
						this.getOwnerModel("pgUiData").setProperty("/errors", true);
						this.getOwnerModel("pgUiData").setProperty("/showBaseLines", false);
					}

				}
				else {
					oEvent.getSource().setValueState(ValueState.Error);
					oEvent.getSource().setValueStateText("System Size cannot be 0");
					this.getOwnerModel("pgUiData").setProperty("/errors", true);
				}
				this.getOwnerModel("oModelEstCal").setProperty("/SsDbSize", sSourceDB.toFixed(3));

				// Filter on OpportunityChange
				if (sOpportunityType && sSourceDB) {
					let result = alBaseLineModel.filter((data) => {
						return data.OppTypeWp == sOpportunityType && data.SystemSize == this.getOwnerModel("oModelEstCal").getProperty("/SystemSize");
					});
					this.getOwnerModel("oModelSelectedBaseLine").setData(result[0]);
				}

				// Set By Default data to Input Fields
				let sProperties = ["NoOfCycles", "HighComplexFm", "MedComplexFm", "SimComplexFm", "AtcViolCount", "FioriStdAppCount", "FioriSecCatRole", "SecMasterRole", "InterfaceCount"];
				let ooModelSelectedBaseLine = this.getOwnerModel("oModelSelectedBaseLine").getData();

				// if (this.getOwnerModel("oModelEstCal").getProperty("/NoOfCycles") == "" || this.getOwnerModel("oModelEstCal").getProperty("/NoOfCycles") == null) {
				// 	sProperties.forEach((sProperty) => {
				// 		this.getOwnerModel("oModelEstCal").setProperty("/" + sProperty, +ooModelSelectedBaseLine[sProperty]);
				// 	});
				// }
				if (this.getOwnerModel("oModelEstCal").getProperty("/SaveOrEdit") != "E") {
					sProperties.forEach((sProperty) => {
						this.getOwnerModel("oModelEstCal").setProperty("/" + sProperty, +ooModelSelectedBaseLine[sProperty]);
					});
				}

			},

			onCalculate: function () {
				let userEmail = this.getOwnerModel("pgUiData").getProperty("/loggedInUserEmail")
				let userId = this.getOwnerModel("pgUiData").getProperty("/loggedInUser")
				this.getOwnerModel("oModelEstCal").setProperty("/Email", userEmail)
				this.getOwnerModel("oModelEstCal").setProperty("/SuserId", userId)
				let oData = this.getOwnerModel("oModelEstCal").getData();
				if (oData.SsDbSize == "" || oData.NoOfCycles == "") {
					MessageBox.error("Please provide mendatory data");
					return;
				}

				this.validateInputs();

				if (this.getOwnerModel("pgUiData").getProperty("/errors")) {
					MessageBox.error("Please provide valid data");
					return;
				}

				oData = formatter.changeDataTypes(this.getOwnerModel(), oData);

				delete oData.to_Baseline;
				delete oData.to_Config;
				delete oData.to_Opp;
				delete oData.to_PlatformEffort;
				delete oData.to_PlatformEffortHD;
				delete oData.to_ResourceEff;
				delete oData.to_TotalEffort;

				BusyIndicator.show();

				let oCalculateData = this.callBackEnd("/zi_hcl_header", "POST", [], oData);
				oCalculateData.then((oResponse) => {
					console.log(oResponse);
					BusyIndicator.hide();

					if (JSON.parse(oResponse.headers['sap-message'])?.severity == "error") {
						MessageBox.information(JSON.parse(oResponse.headers['sap-message']).message);
						return;
					}

					let result = oResponse.data;
					this.getOwnerModel("oModelEstCal").setData(null);
					//result.NoOfCycles = parseFloat(result.NoOfCycles).toFixed(2);
					this.getOwnerModel("oModelEstCal").setData(result);

					if (result.OpportunityId && +result.OpportunityId <= 0) {
						MessageBox.error("No Opportunity Id has been created.");
						return;
					}

					//  Send Email
					// let oJsData = {
					// 	"SentToUser": this.getOwnerModel("pgUiData").getProperty("/loggedInUser"),
					// 	"UserEmail": this.getOwnerModel("pgUiData").getProperty("/loggedInUserEmail"),
					// 	"SentFlag": 'x'
					// };
					// let oSendEmail = this.callBackEnd("/zi_hcl_email", "POST", [], oJsData , {});
					// oSendEmail.then((oResponse) => {
					//     //let result = oResponse.data;

					// }).catch((error) => {
					//     MessageBox.error(JSON.stringify(error));
					//     BusyIndicator.hide();
					// });

					MessageBox.success("Successfully Saved", {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: () => {
							//this.getRouter().navTo("Detail", {}, false);
							this.getRouter().navTo("Detail", {
								CustId: result.CustId.trim(),
								OpportunityId: result.OpportunityId.trim(),
								Version: result.Version.trim()
							}, false);
							return;
						}
					});

				}).catch((error) => {
					BusyIndicator.hide();
					console.log(error);
				});


			},
			onNegativeCheck: function (oEvent) {
				let sSourceDB = oEvent.getSource().getValue();
				if (+sSourceDB < 0) {
					oEvent.preventDefault();
					oEvent.getSource().setValue(+sSourceDB.slice(0, -1));
					return;
				}
			},

			onReset: function () {
				let oInputs = this.getOwnerModel("oModelEstCal");
				oInputs.setProperty("/SsDbSize", "");
				oInputs.setProperty("/NoOfCycles", "");
				oInputs.setProperty("/HighComplexFm", "");
				oInputs.setProperty("/MedComplexFm", "");
				oInputs.setProperty("/SimComplexFm", "");
				oInputs.setProperty("/AtcViolCount", "");
				oInputs.setProperty("/FioriStdAppCount", "");
				oInputs.setProperty("/FioriSecCatRole", "");
				oInputs.setProperty("/SecMasterRole", "");
				oInputs.setProperty("/InterfaceCount", "");
				oInputs.setProperty("/Comments", "");
				oInputs.setProperty("/SaveOrEdit", "");
				this.getOwnerModel("pgUiData").setProperty("/showBaseLines", false);
			},

			specialCharacterCheck: function (value) {
				const specialCharRegex = /^[a-zA-Z0-9 .]+$/;
				if (!specialCharRegex.test(value)) return false;
				else return true;
			},

			validateInputs: function () {
				let ooModelSelectedBaseLine = this.getOwnerModel("oModelSelectedBaseLine").getData(),
					oRangeData = this.getOwnerModel("rangeData").getData();
				let sProperties = ["NoOfCycles", "HighComplexFm", "MedComplexFm", "SimComplexFm", "AtcViolCount", "FioriStdAppCount", "FioriSecCatRole", "SecMasterRole", "InterfaceCount"];
				let errors = 0;
				sProperties.forEach((sProperty) => {
					this.getView().byId(sProperty).setValueState(ValueState.None);
					if (this.getView().byId(sProperty).getValue()) {
						if (!((+ooModelSelectedBaseLine[sProperty] - oRangeData[sProperty] <= +this.getView().byId(sProperty).getValue()) && (+this.getView().byId(sProperty).getValue() <= +ooModelSelectedBaseLine[sProperty] + oRangeData[sProperty]))) {
							this.getView().byId(sProperty).setValueState(ValueState.Error);
							errors += 1;
						}
					} else {
						this.getView().byId(sProperty).setValueState(ValueState.Error);
						errors += 1;
					}

				});

				if (errors > 0) {
					this.getOwnerModel("pgUiData").setProperty("/errors", true);
					return;
				}

				this.getOwnerModel("pgUiData").setProperty("/errors", false);

			}

		});
	});
