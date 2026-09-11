import { mkdir, readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { dirname } from "node:path";
// ZIP store format keeps the distributable reproducible and dependency-free.
const files = ["index.html", "style.css", "app.js", "story.js", "scenery.js"];
for (const name of (await readdir("assets")).sort()) {
  if (name.endsWith(".png")) files.push(`assets/${name}`);
}
await mkdir("dist", { recursive: true });
await mkdir("release", { recursive: true });
const crc32 = (data) => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
const local = [],
  central = [];
let offset = 0;
for (const file of files) {
  await mkdir(dirname("dist/" + file), { recursive: true });
  await copyFile(file, "dist/" + file);
  const data = await readFile(file),
    name = Buffer.from(file),
    crc = crc32(data);
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50);
  h.writeUInt16LE(20, 4);
  h.writeUInt16LE(33, 12);
  h.writeUInt32LE(crc, 14);
  h.writeUInt32LE(data.length, 18);
  h.writeUInt32LE(data.length, 22);
  h.writeUInt16LE(name.length, 26);
  local.push(h, name, data);
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50);
  c.writeUInt16LE(20, 4);
  c.writeUInt16LE(20, 6);
  c.writeUInt16LE(33, 14);
  c.writeUInt32LE(crc, 16);
  c.writeUInt32LE(data.length, 20);
  c.writeUInt32LE(data.length, 24);
  c.writeUInt16LE(name.length, 28);
  c.writeUInt32LE(offset, 42);
  central.push(c, name);
  offset += h.length + name.length + data.length;
}
const directory = Buffer.concat(central),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
await writeFile(
  "release/bottleography-itch.zip",
  Buffer.concat([...local, directory, end]),
);
console.log("Built dist/ and release/bottleography-itch.zip");
