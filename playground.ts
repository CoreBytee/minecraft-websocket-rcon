import { env } from "bun";

const ws = new WebSocket(
	`ws://localhost:${env.SERVER_PORT!}/?password=${env.RCON_PASS!}`,
);

ws.addEventListener("open", () => {
	ws.send(JSON.stringify({ id: 1, command: "help" }));

	ws.addEventListener("message", (message) => {
		console.log(JSON.parse(message.data));
	});
});
