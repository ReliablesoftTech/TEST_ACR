import axios from "axios";
const { graphqlclient } = require("./graphqlclient");
const ACSGraphql = require("@reliablesofttech/acsgraphqlquery");
const { ACSService } = ACSGraphql;
const { updateACSCommandStatus: UPDATEACSCOMMANDSTATUS } = ACSService;
exports.ascController = async (acsUpdateData) => {
  let { URL, variable, iTransId, sAcsUrl, sACSGateWayToken } = acsUpdateData;
  console.log("URL", URL);
  await axios({
    method: "POST",
    url: URL,
    data: { ...variable },
  })
    .then(async (response) => {
      if (response && response.status === 200) {
        await graphqlclient(
          UPDATEACSCOMMANDSTATUS(),
          {
            iTransId: +iTransId,
            sResponse: JSON.stringify(response.data),
            iCommandStatusId: 3,
          },
          sAcsUrl,
          sACSGateWayToken
        );
        axios({
          method: "POST",
          url: URL,
          data: {
            name: "refreshObject",
            objectName: "",
          },
        });
      } else {
        await graphqlclient(
          UPDATEACSCOMMANDSTATUS(),
          {
            iTransId: +iTransId,
            sResponse: JSON.stringify(response.data),
            iCommandStatusId: 4,
          },
          sAcsUrl,
          sACSGateWayToken
        );
      }
    })
    .catch((error) => console.log("Error: ", error));
};
