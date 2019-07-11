export const requiredKeys = [
  "googleScopes",
  "googleClientId",
  "googleRedirectUri",
  "googleDomain",
  "googleMapsKey",
  "apiEndpoint"
];

function defaultKeys() {
  let out = {};
  requiredKeys.forEach(k => (out[k] = ""));
  return out;
}

export default {
  ...defaultKeys(),
  ...(process.env.ATLAS_CONFIG || window.ATLAS_CONFIG || {})
};
