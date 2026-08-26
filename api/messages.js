const { neon } = require('@neondatabase/serverless');

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function send(res, body, status = 200) {
  res.status(status).setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Secret');
  return res.json(body);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, {}, 204);

  try {
    const sql = db();
    const adminSecret = req.headers['x-admin-secret'];

       if (req.method === 'GET') {
      const isAdmin = !!(adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET);
      if (adminSecret && !isAdmin) {
        return send(res, { error: 'Unauthorized' }, 401);
      }
      // Public visitors only ever receive names — the actual message text,
      // relation and mood stay in the database and are never sent to the
      // browser unless a valid admin secret is presented.
      const rows = isAdmin
        ? await sql`
            SELECT id, name, relation, message, mood,
                   TO_CHAR(created_at AT TIME ZONE 'UTC', 'DD Mon YYYY') AS date
            FROM guestbook_messages
            WHERE approved = TRUE
            ORDER BY created_at DESC
            LIMIT 200
          `
        : await sql`
            SELECT id, name,
                   TO_CHAR(created_at AT TIME ZONE 'UTC', 'DD Mon YYYY') AS date
            FROM guestbook_messages
            WHERE approved = TRUE
            ORDER BY created_at DESC
            LIMIT 200
          `;
      return send(res, rows);
    }

    if (req.method === 'POST') {
      const { name, relation, message, mood = '💌', website = '' } = req.body || {};
      if (website) return send(res, { error: 'Thanks — your piece could not be submitted.' }, 400);
      if (!name || !relation || !message) return send(res, { error: 'Name, relationship and message are required.' }, 400);
      if (String(name).length > 60 || String(relation).length > 80 || String(message).length > 500) {
        return send(res, { error: 'One or more fields are too long.' }, 400);
      }

      const trimmedMessage = String(message).trim();
      const recentDuplicate = await sql`
        SELECT id FROM guestbook_messages
        WHERE message = ${trimmedMessage}
          AND created_at > NOW() - INTERVAL '60 seconds'
        LIMIT 1
      `;
      if (recentDuplicate.length) {
        return send(res, { error: 'This piece was just added — give it a moment before trying again.' }, 429);
      }

      const rows = await sql`
        INSERT INTO guestbook_messages (name, relation, message, mood)
        VALUES (${String(name).trim()}, ${String(relation).trim()}, ${trimmedMessage}, ${String(mood).trim()})
        RETURNING id, name, relation, message, mood,
                  TO_CHAR(created_at AT TIME ZONE 'UTC', 'DD Mon YYYY') AS date
      `;
      return send(res, rows[0], 201);
    }

    if (req.method === 'DELETE') {
      if (!process.env.ADMIN_SECRET || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
        return send(res, { error: 'Unauthorized' }, 401);
      }
      const id = Number(req.query?.id);
      if (!Number.isInteger(id)) return send(res, { error: 'A valid message id is required.' }, 400);
      await sql`DELETE FROM guestbook_messages WHERE id = ${id}`;
      return send(res, { ok: true });
    }

    return send(res, { error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Guestbook API error:', error);
    return send(res, { error: 'Guestbook service is unavailable. Please try again.' }, 503);
  }
};
