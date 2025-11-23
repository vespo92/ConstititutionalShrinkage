import { app } from "./app";

const PORT = parseInt(process.env.PORT || "3006", 10);
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Blockchain Service listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
