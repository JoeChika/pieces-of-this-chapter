const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  try {
    const image = fs.readFileSync(path.join(process.cwd(), 'images', 'hero-high-res.jpg'));
    if (image.length < 100 || image[0] !== 0xff || image[1] !== 0xd8) throw new Error('Invalid hero JPEG');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', String(image.length));
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.end(image);
  } catch (error) {
    console.error('Hero image error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Hero image could not be loaded.' }));
  }
};
