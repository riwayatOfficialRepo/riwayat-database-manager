/**
 * Add failed_reason to kitchen_media and dish_media, backing the new
 * client-reported upload-status endpoint (status: FILE_UPLOADED | UPLOAD_FAILED).
 * Cleared whenever status moves to FILE_UPLOADED or a file is re-uploaded.
 */
exports.up = (pgm) => {
  pgm.addColumn('kitchen_media', {
    failed_reason: { type: 'text' },
  });
  pgm.addColumn('dish_media', {
    failed_reason: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_media', 'failed_reason');
  pgm.dropColumn('dish_media', 'failed_reason');
};
