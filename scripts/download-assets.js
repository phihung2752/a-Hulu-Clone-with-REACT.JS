const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  {
    url: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
    filename: 'app-store.png'
  },
  {
    url: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
    filename: 'google-play.png'
  },
  {
    url: 'https://assetshuluimcom-a.akamaihd.net/h3o/facebook_share_thumb_default_hulu.jpg',
    filename: 'hgulu-white.pn'
  }
];

const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

assets.forEach(asset => {
  const filePath = path.join(imagesDir, asset.filename);
  const file = fs.createWriteStream(filePath);

  https.get(asset.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${asset.filename}`);
    });
  }).on('error', err => {
    fs.unlink(filePath);
    console.error(`Error downloading ${asset.filename}:`, err.message);
  });
});
