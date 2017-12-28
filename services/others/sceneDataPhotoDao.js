const models = require('../../models');

exports.create = params => models.sceneDataPhoto.create(params);

exports.updateById = (scedp_id, params) => {
  const {scedp_name, scedp_url, scedp_deleted, scedp_status, scedp_sequence,
    scedp_deleted_time, scedp_created_time} = params;
  const attrObj = {};
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_name')) {
    Object.assign(attrObj, { scedp_name });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_url')) {
    Object.assign(attrObj, { scedp_url });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_deleted')) {
    Object.assign(attrObj, { scedp_deleted });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_status')) {
    Object.assign(attrObj, { scedp_status });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_sequence')) {
    Object.assign(attrObj, { scedp_sequence });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_deleted_time')) {
    Object.assign(attrObj, { scedp_deleted_time });
  }
  if (Object.prototype.hasOwnProperty.call(params, 'scedp_created_time')) {
    Object.assign(attrObj, { scedp_created_time });
  }
  return models.sceneDataPhoto.update(attrObj, {
    where: {scedp_id}
  });
};
