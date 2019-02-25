const EventEmitter = require('events');
const fs = require('fs');
const fsRename = require('./utils/fsRename');
const mkdirp = require('./utils/mkdirp');

module.exports = class FsUpload {
  constructor(opts) {
    Object.assign(this, opts || {});

    this.resumeMode = this.resumeMode || 'overwrite';

    if (!['append', 'overwrite'].includes(
      this.resumeMode,
    )) {
      throw new Error(
        `Unknown resumeMode: '${this.resumeMode}'.`,
      );
    }

    if (!this.size) {
      throw new Error(`Missing size.`);
    }

    if (!this.hash) {
      throw new Error(`Missing hash.`);
    }

    if (!this.stream) {
      throw new Error(`Missing stream.`);
    }

    if (!this.storage) {
      throw new Error(`Missing storage.`);
    }

    this.tmpUploadPath = (
      `${this.storage.tmpUploadsDir}/${this.hash}`
    );

    this.uploadPath = (
      `${this.storage.uploadsDir}/${this.hash}`
    );

    this.bytesReceived = 0;

    this.ee = new EventEmitter();
  }

  once(ev, cb) {
    this.ee.once(ev, cb);
  }

  on(ev, cb) {
    this.ee.on(ev, cb);
  }

  off(ev, cb) {
    this.ee.off(ev, cb);
  }

  async start() {
    if (this.writeStream) {
      throw new Error(`Upload has already started.`);
    }

    await mkdirp(this.storage.uploadsDir);
    await mkdirp(this.storage.tmpUploadsDir);

    this.writeStream = fs.createWriteStream(
      this.tmpUploadPath, {
        flags: {
          append: 'a',
          overwrite: 'w',
        }[this.resumeMode],
      },
    );

    for (const ev of ['close', 'drain', 'error']) {
      this.writeStream.on(
        ev, (...args) => this.ee.emit(ev, ...args),
      );
    }

    this.writeStream.on('finish', async () => {
      try {
        await this.verifySize();
        await this.verifyHash();

        await fsRename(
          this.tmpUploadPath,
          this.uploadPath,
        );

        this.ee.emit('finish');
      }
      catch (err) {
        this.ee.emit('error', err);
      }
    });

    this.stream.on('data', chunk => {
      this.bytesReceived += chunk.length;

      this.ee.emit('progress', {
        bytesReceived: this.bytesReceived,
        percentage: (this.bytesReceived / this.size) * 100,
      });
    });

    this.stream.pipe(this.writeStream);

    await new Promise((resolve, reject) => {
      this.on('error', reject);
      this.on('finish', resolve);
    });
  }

  // TODO
  async verifySize() {
  }

  // TODO
  async verifyHash() {
  }
};
