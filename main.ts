import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { User } from "./types.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";


const env = await load();

Deno.env.set("DENO_KV_ACCESS_TOKEN", env['DENO_KV_ACCESS_TOKEN']);

const db = await Deno.openKv("https://api.deno.com/databases/db399a2a-abf6-439d-beb5-1ba7a6ea32ab/connect");

const router = new Router();
router
  .post("/create", async (context) => {
    const body = context.request.body();
    const user: User = await body.value;
    user.id = crypto.randomUUID();
    await db.set(['users', user.id], user);
    context.response.body = `User ${user.name} created with id ${user.id}`;
  })
  .get("/:id", async (context) => {
    const userId = context.params.id;
    const hello: User | unknown = (await db.get(['users', userId])).value;

    if (hello) {
      context.response.body = hello;
    } else {
      context.response.body = 'User not found!';
    }
  })


const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
console.log("Dein Server ist jetzt unter http://localhost:8000/ erreichbar.");
await app.listen({ port: 8000 });

