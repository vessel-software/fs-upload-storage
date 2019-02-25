const sha256 = require('../utils/sha256');
const t2 = require('through2');
const { FsUpload, FsUploadStorage } = require('..');

const storage = new FsUploadStorage({
  tmpUploadsDir: `${__dirname}/tmpUploads`,
  uploadsDir: `${__dirname}/uploads`,
});

const buf = Buffer.from(String(Math.random()));
const stream = t2();

stream.push(buf);
stream.end();

const upload = new FsUpload({
  resumeMode: 'overwrite',
  size: buf.length,
  hash: sha256(buf),
  stream,
  storage,
});

(async () => {
  await upload.start();
  console.log('Pass.');
})().catch(err => {
  console.error(err);
});
