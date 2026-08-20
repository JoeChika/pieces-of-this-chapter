const { neon } = require('@neondatabase/serverless');

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function json(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Secret'
    },
    body: JSON.stringify(body)
  };
}

module.exports = async function handler(req) {
  if (req.method === 'OPTIONS') return json({}, 204);

  try {
    const sql = db();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, name, relation, message, mood,
               TO_CHAR(created_at AT TIME ZONE 'UTC', 'DD Mon YYYY') AS date
        FROM guestbook_messages
        WHERE approved = TRUE
        ORDER BY created_at DESC
        LIMIT 200
      `;
      return json(rows);
    }

    if (req.method === 'POST') {
      const { name, relation, message, mood = '💌' } = req.body || {};
      if (!name || !relation || !message) return json({ error: 'Name, relationship and message are required.' }, 400);
      if (String(name).length > 60 || String(relation).length > 80 || String(message).length > 500) {
        return json({ error: 'One or more fields are too long.' }, 400);
      }

      const rows = await sql`
        INSERT INTO guestbook_messages (name, relation, message, mood)
        VALUES (${String(name).trim()}, ${String(relation).trim()}, ${String(message).trim()}, ${String(mood).trim()})
        RETURNING id, name, relation, message, mood,
                  TO_CHAR(created_at AT TIME ZONE 'UTC', 'DD Mon YYYY') AS date
      `;
      return json(rows[0], 201);
    }

    if (req.method === 'DELETE') {
      if (!process.env.ADMIN_SECRET || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const id = Number(req.query?.id);
      if (!Number.isInteger(id)) return json({ error: 'A valid message id is required.' }, 400);
      await sql`DELETE FROM guestbook_messages WHERE id = ${id}`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: 'Guestbook service is not configured yet.' }, 503);
  }
};
