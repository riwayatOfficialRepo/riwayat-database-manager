/**
 * Generalizes the upload-failure-only failed_reason column into status_reason,
 * which holds the reason for the media's CURRENT status regardless of which
 * status that is (not just UPLOAD_FAILED) — and adds it to feedback_media too,
 * matching kitchen_media/dish_media.
 */
exports.up = (pgm) => {
  pgm.renameColumn('kitchen_media', 'failed_reason', 'status_reason');
  pgm.renameColumn('dish_media', 'failed_reason', 'status_reason');
  pgm.addColumn('feedback_media', {
    status_reason: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('feedback_media', 'status_reason');
  pgm.renameColumn('dish_media', 'status_reason', 'failed_reason');
  pgm.renameColumn('kitchen_media', 'status_reason', 'failed_reason');
};
