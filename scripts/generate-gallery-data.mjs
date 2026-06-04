import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const galleryDir = path.join(rootDir, 'galeria-zlot');
const outputFile = path.join(rootDir, 'galeria-zlot.json');

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const videoExtensions = new Set(['.mp4', '.webm', '.ogg', '.mov']);

const videoMimeTypes = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime'
};

function formatLabel(fileName, type) {
  const baseName = path.basename(fileName, path.extname(fileName)).replace(/[_-]+/g, ' ').trim();
  const prefix = type === 'image' ? 'Zdjęcie ze zlotu' : 'Film ze zlotu';
  return baseName ? `${prefix} – ${baseName}` : prefix;
}

async function generateGalleryData() {
  const entries = await fs.readdir(galleryDir, { withFileTypes: true });

  const media = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'pl', { numeric: true }))
    .flatMap((fileName) => {
      const extension = path.extname(fileName).toLowerCase();
      const src = `galeria-zlot/${fileName}`;

      if (imageExtensions.has(extension)) {
        return [{ type: 'image', src, alt: formatLabel(fileName, 'image') }];
      }

      if (videoExtensions.has(extension)) {
        return [{
          type: 'video',
          src,
          alt: formatLabel(fileName, 'video'),
          mime: videoMimeTypes[extension] || 'video/mp4'
        }];
      }

      return [];
    });

  await fs.writeFile(outputFile, `${JSON.stringify(media, null, 2)}\n`, 'utf8');
  console.log(`Generated ${media.length} gallery items in ${path.relative(rootDir, outputFile)}`);
}

generateGalleryData().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
