sap.ui.define([], () => {
	"use strict";
	return {
		getSystemSize(sSize) {
			switch (sSize) {
				case "S":
					return "SMALL";
					break;
				case "M":
					return "MEDIUM";
					break;
				case "L":
					return "LARGE";
					break;
				default:
					return "";
					break;
			}
		},
		getWorkpackage(sType) {
			switch (sType) {
				case "L":
					return "Lift & Shift your S/4 System";
				case "U":
					return "Upgrade & Migrate Your Older S/4 HANA";
				case "C":
					return "Conversion and Migration of ECC";
				default:
					return "";
			}
		},

		onChangeHoursMonth: function (sMonth, sHours, sOption) {
			switch (sOption) {
				case "H":
					return +sHours;
					break;
				default:
					return +sMonth;
					break;
			}
		},

		getBaseAndRangeInfo: function (nBaseLine, nRange) {
			if (nBaseLine && nRange)
				return `Baseline= ${+nBaseLine}, Range= ${nRange}`;
		},

		// convertTwoDecimal: function (amtVal) {
		// 	if (+amtVal) {
		// 		return parseFloat(amtVal).toFixed(2);
		// 	} else {
		// 		return "";
		// 	}
		// },

		// MathRound: function(val){
		// 	if (val) {
		// 		return Math.round(val);
		// 	} else {
		// 		return "";
		// 	}
		// },

		getFVisible: function (chkVal) {
			if (chkVal) {
				if (chkVal.trim() === 'L')
					return false;
				return true;
			}

		},

		// Changing input Data to MetaData Types
		changeDataTypes: function (oModel, oJsData) {
			let oEntityTypes = oModel.getServiceMetadata().dataServices.schema[0].entityType;
			oEntityTypes.forEach(element => {
				if (element.name == "zi_hcl_headerType") {
					element.property.forEach(value => {
						switch (value.type) {
							case "Edm.Decimal":
								//oJsData[value.name] = parseFloat(oJsData[value.name]).toFixed(value.scale);
								oJsData[value.name] = oJsData[value.name] != '' ? !isNaN(oJsData[value.name]) ? (parseFloat(oJsData[value.name]).toFixed(value.scale)) : parseFloat(0).toFixed(3) : parseFloat(0).toFixed(3);
								break;
							case "Edm.Int16":
								oJsData[value.name] = oJsData[value.name] != '' ? !isNaN(oJsData[value.name]) ? parseInt(oJsData[value.name]) : 0 : 0;
								break;
							case "Edm.Time":
								oJsData[value.name] = !oJsData[value.name] ? null : oJsData[value.name];
								break;
							case "Edm.DateTime":
								oJsData[value.name] = !oJsData[value.name] ? null : oJsData[value.name];
								break
							default:
								oJsData[value.name] = oJsData[value.name].toString();
								break;
						}

					})
					// if (Array.isArray(element.navigationProperty)) {
					//     element.navigationProperty.forEach(value => {
					//         oModelEstCal[value.name] = [];
					//     })
					// }
				}
			});

			return oJsData;
		}

	};
});