import { readFile, writeFile, mkdir } from 'node:fs/promises';
const files = ['git-lab.cjs', 'README.md'];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const chunks = [],
  directory = [];
let offset = 0;
for (const name of files) {
  const content = await readFile(new URL(`../labs/${name}`, import.meta.url)),
    filename = Buffer.from(name),
    checksum = crc32(content);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(0x21, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(content.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(filename.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(0x21, 14);
  central.writeUInt32LE(checksum, 16);
  central.writeUInt32LE(content.length, 20);
  central.writeUInt32LE(content.length, 24);
  central.writeUInt16LE(filename.length, 28);
  central.writeUInt32LE(offset, 42);
  chunks.push(header, filename, content);
  directory.push(central, filename);
  offset += header.length + filename.length + content.length;
}
const central = Buffer.concat(directory),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
await mkdir(new URL('../assets/downloads/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../assets/downloads/kopi-kita-labs.zip', import.meta.url),
  Buffer.concat([...chunks, central, end]),
);
console.log('Paket latihan siap: assets/downloads/kopi-kita-labs.zip');
