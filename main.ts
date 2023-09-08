import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { User } from "./types.ts";
const db = await Deno.openKv("./db/database.ts");

const router = new Router();
router
  .post("/create", async (context) => {
    const body = context.request.body();
    const user: User = await body.value;
    user.id = crypto.randomUUID();
    const usersFromDB: User[] | null = (await db.get<User[]>(['users'])).value;
    if (!usersFromDB) { await db.set(['users'], [user]); } else { await db.set(['users'], [...usersFromDB, user]); }
    context.response.body = await db.get(['users']);
  })
  .get("/read", async (context) => {
    context.response.body = new TextEncoder().encode(JSON.stringify(await db.get(['users'])));
  })


const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
console.log("Dein Server ist jetzt unter http://localhost:8000/ erreichbar.");
await app.listen({ port: 8000 });

