import connections from "../../db/connections.js";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  for (const connection of Object.values(connections)) {
    await connection.sync({
      full: false,
    });
  }

  return Response.json({ success: true });
}
