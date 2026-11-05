import {execFile} from "node:child_process";
import {promisify} from "node:util";

const exec = promisify(execFile);

export function execWithClosedStdin(file, args, options) {
    const pending = exec(file, args, options);
    pending.child.stdin?.end();
    return pending;
}
