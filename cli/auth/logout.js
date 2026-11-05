// cli/auth/logout.js
const { Command } = require("commander");
export function authLogout(cli) {
  const cmd = new Command("logout").description("Clear authentication token and refresh token");
} 
