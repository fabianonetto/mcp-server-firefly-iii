const axios = require("axios");
require("dotenv").config();

// Configuration
const FIREFLY_URL = process.env.FIREFLY_URL;
const FIREFLY_TOKEN = process.env.FIREFLY_TOKEN;
const PORT = process.env.PORT; 

if (!FIREFLY_URL || !FIREFLY_TOKEN) {
  // If we are in test mode, we bypass the error
  if (process.env.NODE_ENV !== "test") {
    console.error("Error: FIREFLY_URL and FIREFLY_TOKEN are required.");
    process.exit(1);
  }
}

const baseUrl = (FIREFLY_URL || "").replace(/\/+$/, "");
const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: {
    Authorization: `Bearer ${FIREFLY_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Debug interceptor to capture raw outgoing requests
apiClient.interceptors.request.use(config => {
  console.error(`DEBUG: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  if (config.params) console.error(`DEBUG PARAMS: ${JSON.stringify(config.params)}`);
  return config;
});

module.exports = {
  FIREFLY_URL,
  FIREFLY_TOKEN,
  PORT,
  apiClient
};
