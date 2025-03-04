import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { exec } from 'child_process';

async function downloadAndExtract(url: string, outputDir: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);

  const nodeStream = Readable.fromWeb(response.body as ReadableStream);

  const compressedFilePath = path.join(outputDir, 'archive.tar.xz');
  const fileStream = fs.createWriteStream(compressedFilePath);

  nodeStream.pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on('finish', () => {
      // Use native tar command to extract files
      exec(`tar -xJf ${compressedFilePath} -C ${outputDir}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Extraction error: ${stderr}`);
          reject(error);
        } else {
          console.log('Extraction complete');

          // Clean up the archive file
          fs.unlink(compressedFilePath, (err) => {
            if (err) {
              console.error(`Error removing archive: ${err.message}`);
              reject(err);
            } else {
              console.log('Archive cleaned up');
              resolve();
            }
          });
        }
      });
    });

    fileStream.on('error', (err) => {
      console.error('File stream error', err);
      reject(err);
    });
  });
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: bun run downloadAndExtract.ts <url> <outputDir>');
  process.exit(1);
}

const [url, outputDir] = args;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

downloadAndExtract(url, outputDir).catch((err) => console.error('Download failed', err));
