import { env } from "bun";
import { Rcon } from "rcon-client";

type RConRequest = {
	id: number;
	command: string;
};

type RConResponse = {
	id: number;
	result: string;
};

const SERVER_PORT = env.SERVER_PORT || "8080";
const RCON_HOST = env.RCON_HOST ?? null;
const RCON_PORT = env.RCON_PORT ? Number(env.RCON_PORT) : 25575;
const RCON_PASS = env.RCON_PASS ?? null;

if (!SERVER_PORT) throw new Error("SERVER_PORT is not set");
if (!RCON_HOST) throw new Error("RCON_HOST is not set");
if (!RCON_PORT) throw new Error("RCON_PORT is not set");
if (!RCON_PASS) throw new Error("RCON_PASS is not set");

Bun.serve({
	port: SERVER_PORT,
	routes: {
		"/": async (request, server) => {
			console.log(request);
			const query = new URL(request.url).searchParams;
			const password = query.get("password");
			if (password !== RCON_PASS)
				return new Response("Unauthorized", { status: 401 });

			const rcon = await Rcon.connect({
				host: RCON_HOST,
				port: Number(RCON_PORT),
				password: RCON_PASS,
			});

			const success = server.upgrade(request, {
				data: { rcon },
			});
			if (success) return;
			return new Response("Upgrade failed", { status: 500 });
		},
	},
	websocket: {
		data: {} as { rcon: Rcon },

		open: (ws) => {
			ws.data.rcon.on("end", () => {
				ws.close();
			});
		},
		message: async (ws, raw) => {
			const rawString = typeof raw === "string" ? raw : raw.toString();
			const message = JSON.parse(rawString) as RConRequest;
			const result = await ws.data.rcon.send(message.command);
			const response = { id: message.id, result } as RConResponse;
			ws.send(JSON.stringify(response));
		},
		close: (ws) => {
			ws.data.rcon.end();
		},
	},
});
