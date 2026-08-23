const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  try {
    const parts = ['top-photo-01.b64p', 'top-photo-02.b64p', 'top-photo-03.b64p', 'top-photo-04.b64p'];
    const base64 = parts
      .map((name) => fs.readFileSync(path.join(process.cwd(), 'images', name), 'utf8').trim())
      .join('')
      .replace(/\s/g, '');
    const image = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(image);
  } catch (error) {
    res.status(500).json({ error: 'Hero image could not be assembled.' });
  }
};
