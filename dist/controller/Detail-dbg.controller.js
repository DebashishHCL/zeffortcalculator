sap.ui.define([
	"./BaseController",
	"sap/ui/core/library",
	"sap/ui/export/library",
	"../utils/formatter",
],
	function (BaseController, CoreLib, exportLibrary, formatter ) {
		"use strict";
		const EdmType = exportLibrary.EdmType;
		const { BusyIndicator } = CoreLib;
		return BaseController.extend("com.zeffortcalculator.controller.Detail", {
			formatter: formatter,
			onInit: function () {
				this.getView().addEventDelegate({
                    onAfterShow: ()=>{
                       this.getView().byId("hclImg").attachPress(()=>{
                            this.onHome();
                       });
                    }
                });
				this.getRouter().getRoute("Detail").attachPatternMatched(this.onDetailMatched, this);
				this.getView().byId("detailEdit").setVisible(true);
			},
			onEdit: function (sSaveorEdit) {
				this.getOwnerModel("oModelEstCal").setProperty("/SaveOrEdit", sSaveorEdit);
				this.getRouter().navTo("Calculate", {}, false);
			},
			onSearchCust: function () {
				this.getRouter().navTo("Search", {
					OpportunityId: this.getOwnerModel("oModelEstCal").getProperty("/OpportunityId")
				},false);
			},

			onDetailMatched: function (oEvent) {
				if (this.getView().byId("detailSave"))
					this.getView().byId("detailSave").setVisible(true);
	
				if (oEvent.getParameter("arguments").CustId && oEvent.getParameter("arguments").OpportunityId && oEvent.getParameter("arguments").Version) {
					if (this.getView().byId("detailSave"))
						this.getView().byId("detailSave").setVisible(false);
	
					let filters = [this.createFilter("CustId", oEvent.getParameter("arguments").CustId),
					this.createFilter("OpportunityId", oEvent.getParameter("arguments").OpportunityId),
					this.createFilter("Version", oEvent.getParameter("arguments").Version)
					];
					BusyIndicator.show();
					let oDetailData = this.callBackEnd("/zi_hcl_header", "GET", filters, {}, {});
	
					oDetailData.then((oResponse) => {
						let response = oResponse.data;
						this.getOwnerModel("oModelEstCal").setData({});
						this.getOwnerModel("oModelEstCal").setData(response.results[0]);
						BusyIndicator.hide();
					}).catch((error) => {
						BusyIndicator.hide();
						console.log(error);
					});
				}
			},

			/******** Input Output Excel Download  *********/ 
			onInputOutputExport: function(){
				let sFileName = "Input Output";
				let oJsData = this.getOwnerModel("oModelEstCal").getData();
				let labelData = this.getOwnerModel("remotei18n").getData();
				let sUrl = `${this.getOwnerModel().sServiceUrl}/zi_hcl_header?$filter=CustId eq '${oJsData.CustId}' and OpportunityId eq '${oJsData.OpportunityId}' and Version eq '${oJsData.Version}'`;
				let oRowBinding = {
					type: "odata",
					dataUrl: sUrl,
					serviceUrl: this.getOwnerModel().sServiceUrl,
					useBatch: true,
				}
				let aCols = [
					{
						label: labelData.DP.DB_SIZE,
						property: 'SsDbSize',
						type: EdmType.String
					},
					{
						label: labelData.DP.NOC,
						property: 'NoOfCycles',
						type: EdmType.Number
					},
					{
						label: labelData.DP.HC_FM,
						property: 'HighComplexFm',
						type: EdmType.Number
					},
					{
						label: labelData.DP.MC_FM,
						property: 'MedComplexFm',
						type: EdmType.Number
					},
					{
						label: labelData.DP.SC_FM,
						property: 'SimComplexFm',
						type: EdmType.Number
					},
					{
						label: labelData.DP.ATC_VC,
						property: 'AtcViolCount',
						type: EdmType.Number
					},
					{
						label: labelData.DP.FIORI_STD_APP_C,
						property: 'FioriStdAppCount',
						type: EdmType.Number
					},
					{
						label: labelData.DP.FIORI_SEC_CAT_ROLE,
						property: 'FioriSecCatRole',
						type: EdmType.Number
					},
					{
						label: labelData.DP.SEC_MROLE,
						property: 'SecMasterRole',
						type: EdmType.Number
					},
					{
						label: labelData.DP.IC,
						property: 'InterfaceCount',
						type: EdmType.Number
					},
					{
						label: labelData.DP.COMMENTS,
						property: 'Comments',
						type: EdmType.String
					},


				];

				this.onCommonExport(oRowBinding, aCols, sFileName);
			},
			
		});
	});
