// Forwarding script: redirects to the primary DevTrack AI backend
const path = require("path");

console.log("ℹ️  Redirecting execution to primary backend at E:\\DevTrack2\\backend\\server.js");
require(path.resolve(__dirname, "../../backend/server.js"));