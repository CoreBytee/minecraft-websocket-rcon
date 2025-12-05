import { $ } from "bun";

const targets = [
	"bun-linux-x64",
	"bun-linux-arm64",
	"bun-windows-x64",
	"bun-darwin-x64",
	"bun-darwin-arm64",
	"bun-linux-x64-musl",
	"bun-linux-arm64-musl",
];

for (const target of targets) {
	await $`bun build --compile --target=${target} ./index.ts --outfile ./dist/minecraft-websocket-rcon-${target.slice(4)}`;
}
