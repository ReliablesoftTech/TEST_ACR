exports.ACSUpdateURL = (args) => {
  let URL = args.URL;
  URL = URL + args.sSerialNumber;
  URL = URL + "/tasks?connection_request";
  return URL;
};
