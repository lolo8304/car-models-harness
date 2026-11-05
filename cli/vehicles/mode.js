// cli/vehicles/mode.js
const { Command } = require("commander");
export function modeSearch(cli) {
  return new Command().arguments("<mode>").description("Select search mode: exact or match");
}
