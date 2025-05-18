const fs = require("node:fs/promises");
const path = require("node:path");

const Count = {};
module.exports = Count;

const queue = [];

async function lock() {
  return new Promise((res) => {
    const i = queue.push(res);

    if (i === 1) {
      res();
    }
  });
}

function unlock() {
  queue.shift();
  if (queue.length > 0) {
    const next = queue[0];

    next();
  }
}

Count.next = async () => {
  const visitsPath = path.resolve(process.cwd(), ".data", "visits.txt");

  await lock();
  await fs.mkdir(path.dirname(visitsPath), { recursive: true });

  const file = await fs.open(visitsPath, "a+");

  try {
    let buffer = Buffer.alloc(32);

    const { bytesRead } = await file.read({
      buffer,
      offset: 0,
      length: buffer.length,
      position: 0,
    });

    const text = buffer.subarray(0, bytesRead).toString("utf-8");

    let json;
    if (bytesRead === 0) {
      json = { count: 0 };
    } else {
      json = JSON.parse(text);
    }

    json.count++;

    await file.truncate(0);
    await file.write(JSON.stringify(json));

    return json.count;
  } finally {
    unlock();
    await file.close();
  }
};
