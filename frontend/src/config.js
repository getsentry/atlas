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
  repoUrl: "http://github.com/getsentry/atlas/issues",
  ...defaultKeys(),
  ...(process.env.ATLAS_CONFIG || window.ATLAS_CONFIG || {})
};
