module.exports = class FsUploadStorage {
  constructor(opts) {
    Object.assign(this, opts || {});

    if (!this.tmpUploadsDir) {
      throw new Error(`Missing tmpUploadsDir.`);
    }

    if (!this.uploadsDir) {
      throw new Error(`Missing uploadsDir.`);
    }
  }
};
