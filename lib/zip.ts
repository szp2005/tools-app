export type ZipSourceFile = {
  filename: string;
  body: string;
};

const encoder = new TextEncoder();
const crcTable = buildCrcTable();

export function createStoredZipBlob(files: ZipSourceFile[]) {
  const entries = files.map((file) => ({
    path: normalizeZipPath(file.filename),
    content: encoder.encode(file.body),
  }));
  const now = new Date();
  const { dosTime, dosDate } = toDosDateTime(now);
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const crc = crc32(entry.content);
    const localHeader = localFileHeader(name.length, crc, entry.content.length, dosTime, dosDate);
    const centralHeader = centralDirectoryHeader(name.length, crc, entry.content.length, offset, dosTime, dosDate);

    localParts.push(localHeader, name, entry.content);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + entry.content.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = endOfCentralDirectory(entries.length, centralSize, centralOffset);

  return new Blob([...localParts, ...centralParts, end].map(toBlobPart), { type: "application/zip" });
}

function normalizeZipPath(value: string) {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim().replace(/^\.+$/, "").replace(/[<>:"|?*]/g, "-"))
    .filter(Boolean)
    .join("/");
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);

  return copy.buffer as ArrayBuffer;
}

function localFileHeader(
  nameLength: number,
  crc: number,
  size: number,
  dosTime: number,
  dosDate: number,
) {
  const bytes = new Uint8Array(30);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, dosTime, true);
  view.setUint16(12, dosDate, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameLength, true);
  view.setUint16(28, 0, true);

  return bytes;
}

function centralDirectoryHeader(
  nameLength: number,
  crc: number,
  size: number,
  offset: number,
  dosTime: number,
  dosDate: number,
) {
  const bytes = new Uint8Array(46);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, dosTime, true);
  view.setUint16(14, dosDate, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);

  return bytes;
}

function endOfCentralDirectory(entries: number, centralSize: number, centralOffset: number) {
  const bytes = new Uint8Array(22);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entries, true);
  view.setUint16(10, entries, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);

  return bytes;
}

function toDosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());

  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let index = 0; index < data.length; index += 1) {
    const byte = data[index];
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function buildCrcTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}
