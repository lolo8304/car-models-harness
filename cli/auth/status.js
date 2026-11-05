// cli/auth/status.js
const { Command } = require("commander");
export function authStatus(cli) {
  const cmd = new Command("status").description("Check authentication status and token expiry");
} 
