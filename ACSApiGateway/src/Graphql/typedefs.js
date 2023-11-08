const SchemaType = require("./Schema/SchemaType");

//NOTE ACS Service
const ACSData = require("./Schema/ACS/Get_ACS_Data");

const ACSUpdateData = require("./Schema/ACS/Update_ACS");

const ACS = [ACSData, ACSUpdateData];

const SchemaArray = [SchemaType, ...ACS];

module.exports = SchemaArray;
