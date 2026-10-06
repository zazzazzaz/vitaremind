import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to generate an uncompressed or zlib-compressed PNG buffer
function createPng(width, height, r, g, b, isMaskable = false) {
  // A simple valid RGBA PNG creator
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression method: deflate
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace: none

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data: scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.45 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Circle pill / drop emblem
      let pr = r;
      let pg = g;
      let pb = b;
      let pa = 255;

      if (!isMaskable) {
        // Rounded card background
        const cornerDist = Math.max(Math.abs(dx) - width * 0.35, 0) ** 2 + Math.max(Math.abs(dy) - height * 0.35, 0) ** 2;
        if (cornerDist > (width * 0.12) ** 2) {
          pa = 0;
        }
      }

      // Draw emblem in center: a stylized water drop & medical cross
      const dropY = cy - height * 0.05;
      const distDrop = Math.hypot(dx, y - dropY);
      
      // Cross pattern:
      const inCrossH = Math.abs(x - cx) < width * 0.18 && Math.abs(y - cy) < height * 0.06;
      const inCrossV = Math.abs(x - cx) < width * 0.06 && Math.abs(y - cy) < height * 0.18;
      
      if (inCrossH || inCrossV) {
        pr = 255;
        pg = 255;
        pb = 255;
      } else if (dist < radius) {
        // Gradient effect
        const grad = 1 - (dist / radius) * 0.3;
        pr = Math.min(255, Math.floor(r * grad));
        pg = Math.min(255, Math.floor(g * grad));
        pb = Math.min(255, Math.floor(b * grad));
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Write the files
// Primary color: Vibrant Teal/Emerald #0D9488 (13, 148, 136)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 13, 148, 136, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 13, 148, 136, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 13, 148, 136, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 13, 148, 136, false));

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad)" />
  <!-- Water Drop Outline -->
  <path d="M256 96 C256 96 160 230 160 310 C160 363 203 406 256 406 C309 406 352 363 352 310 C352 230 256 96 256 96 Z" fill="#ffffff" fill-opacity="0.25"/>
  <!-- Medical Plus / Pill Symbol -->
  <path d="M256 180 V340 M176 260 H336" stroke="#ffffff" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="360" cy="150" r="28" fill="#38bdf8"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Icons generated successfully!');
