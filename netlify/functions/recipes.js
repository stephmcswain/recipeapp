import { Client } from "pg";

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function normalizeRecipe(input) {
  const r = input || {};
  const id = Number(r.id ?? r.number ?? Date.now());

  return {
    id,
    name: String(r.name ?? "").trim(),
    tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    instructions: String(r.instructions ?? ""),
    calories: Number(r.calories ?? 0) || 0,
    protein: Number(r.protein ?? 0) || 0,
    fiber: Number(r.fiber ?? 0) || 0,
    carbs: Number(r.carbs ?? 0) || 0,
    fat: Number(r.fat ?? 0) || 0,
    sugar: Number(r.sugar ?? 0) || 0,
    sodium: Number(r.sodium ?? 0) || 0,
    cholesterol: Number(r.cholesterol ?? 0) || 0,
    saturated: Number(r.saturated ?? 0) || 0,
    image: r.image ? String(r.image) : null,
  };
}

function toClientRecipe(row) {
  // Client expects `number` today.
  return {
    number: Number(row.id),
    name: row.name,
    tags: row.tags ?? [],
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? "",
    calories: row.calories ?? 0,
    protein: row.protein ?? 0,
    fiber: row.fiber ?? 0,
    carbs: row.carbs ?? 0,
    fat: row.fat ?? 0,
    sugar: row.sugar ?? 0,
    sodium: row.sodium ?? 0,
    cholesterol: row.cholesterol ?? 0,
    saturated: row.saturated ?? 0,
    image: row.image ?? "",
  };
}

function isWriteMethod(method) {
  return method === "POST" || method === "PUT" || method === "DELETE";
}

function getHeader(event, name) {
  const headers = event.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function isAuthorized(event) {
  const header = getHeader(event, "authorization");
  if (!header || !header.startsWith("Basic ")) return false;

  const token = header.slice("Basic ".length).trim();
  if (!token) return false;

  let decoded = "";
  try {
    decoded = Buffer.from(token, "base64").toString("utf8");
  } catch {
    return false;
  }

  const splitAt = decoded.indexOf(":");
  if (splitAt < 0) return false;
  const username = decoded.slice(0, splitAt);
  const password = decoded.slice(splitAt + 1);

  const expectedUsername = process.env.RECIPE_ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.RECIPE_ADMIN_PASSWORD || "recipes123";
  return username === expectedUsername && password === expectedPassword;
}

async function withClient(fn) {
  const connectionString = process.env.NETLIFY_DATABASE_URL;
  if (!connectionString) {
    return json(500, { error: "Missing NETLIFY_DATABASE_URL env var" });
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function handler(event) {
  const method = String(
    event.httpMethod || event.requestContext?.http?.method || ""
  ).toUpperCase();
  const base = "/.netlify/functions/recipes";
  const path = event.path || "";
  const suffix = path.startsWith(base) ? path.slice(base.length) : "";
  const parts = suffix.split("/").filter(Boolean);

  if (method === "OPTIONS") return json(204, {});
  if (method === "GET" && parts[0] === "auth") {
    if (!isAuthorized(event)) return json(401, { error: "Unauthorized" });
    return json(200, { ok: true });
  }
  if (isWriteMethod(method) && !isAuthorized(event)) {
    return json(401, { error: "Unauthorized" });
  }

  return withClient(async (client) => {
    const id = parts.length ? Number(parts[0]) : null;

    if (method === "GET") {
      const { rows } = await client.query(
        "select * from recipes order by updated_at desc, created_at desc"
      );
      return json(200, rows.map(toClientRecipe));
    }

    if (method === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      const r = normalizeRecipe(body);
      if (!r.name) return json(400, { error: "Recipe name is required" });

      const { rows } = await client.query(
        `
        insert into recipes
          (id, name, tags, ingredients, instructions, calories, protein, fiber, carbs, fat, sugar, sodium, cholesterol, saturated, image, updated_at)
        values
          ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now())
        on conflict (id) do update set
          name = excluded.name,
          tags = excluded.tags,
          ingredients = excluded.ingredients,
          instructions = excluded.instructions,
          calories = excluded.calories,
          protein = excluded.protein,
          fiber = excluded.fiber,
          carbs = excluded.carbs,
          fat = excluded.fat,
          sugar = excluded.sugar,
          sodium = excluded.sodium,
          cholesterol = excluded.cholesterol,
          saturated = excluded.saturated,
          image = excluded.image,
          updated_at = now()
        returning *
        `,
        [
          r.id,
          r.name,
          JSON.stringify(r.tags),
          JSON.stringify(r.ingredients),
          r.instructions,
          r.calories,
          r.protein,
          r.fiber,
          r.carbs,
          r.fat,
          r.sugar,
          r.sodium,
          r.cholesterol,
          r.saturated,
          r.image,
        ]
      );

      return json(200, toClientRecipe(rows[0]));
    }

    if (method === "PUT") {
      if (!id) return json(400, { error: "Missing id in path" });
      const body = event.body ? JSON.parse(event.body) : {};
      const r = normalizeRecipe({ ...body, id });
      if (!r.name) return json(400, { error: "Recipe name is required" });

      const { rows } = await client.query(
        `
        update recipes set
          name = $2,
          tags = $3::jsonb,
          ingredients = $4::jsonb,
          instructions = $5,
          calories = $6,
          protein = $7,
          fiber = $8,
          carbs = $9,
          fat = $10,
          sugar = $11,
          sodium = $12,
          cholesterol = $13,
          saturated = $14,
          image = $15,
          updated_at = now()
        where id = $1
        returning *
        `,
        [
          r.id,
          r.name,
          JSON.stringify(r.tags),
          JSON.stringify(r.ingredients),
          r.instructions,
          r.calories,
          r.protein,
          r.fiber,
          r.carbs,
          r.fat,
          r.sugar,
          r.sodium,
          r.cholesterol,
          r.saturated,
          r.image,
        ]
      );

      if (!rows.length) return json(404, { error: "Not found" });
      return json(200, toClientRecipe(rows[0]));
    }

    if (method === "DELETE") {
      if (!id) return json(400, { error: "Missing id in path" });
      await client.query("delete from recipes where id = $1", [id]);
      return json(204, {});
    }

    return json(405, { error: "Method not allowed" });
  });
}

