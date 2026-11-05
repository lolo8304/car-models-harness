// cli/auth/login.js
const { Command } = require("commander");
export function authLogin(cli) {
  const cmd = new Command("login").description("Authenticate via Clerk OAuth and PKCE");
} 
