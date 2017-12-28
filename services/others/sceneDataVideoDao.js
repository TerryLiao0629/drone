const models = require('../../models');

exports.create = params => models.sceneDataVideo.create(params);

exports.updateById = (scenevideo_id, params) => {
  const {scenevideo_name, scenevideo_url, small_thumbnail_path, large_thumbnail_path,
    scenevideo_deleted, scenevideo_status, scenevideo_sequence, scenevideo_deleted_time,
    scenevideo_created_time, scenevideo_expired_time} = params;
  const attrObj = {};
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_name')) {
    Object.assign(attrObj, { scenevideo_name });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_url')) {
    Object.assign(attrObj, { scenevideo_url });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'small_thumbnail_path')) {
    Object.assign(attrObj, { small_thumbnail_path });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'large_thumbnail_path')) {
    Object.assign(attrObj, { large_thumbnail_path });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_deleted')) {
    Object.assign(attrObj, { scenevideo_deleted });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_status')) {
    Object.assign(attrObj, { scenevideo_status });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_sequence')) {
    Object.assign(attrObj, { scenevideo_sequence });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_deleted_time')) {
    Object.assign(attrObj, { scenevideo_deleted_time });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_created_time')) {
    Object.assign(attrObj, { scenevideo_created_time });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scenevideo_expired_time')) {
    Object.assign(attrObj, { scenevideo_expired_time });
  }
  return models.sceneDataVideo.update(attrObj, {
    where: {scenevideo_id}
  });
};
