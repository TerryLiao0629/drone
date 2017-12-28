const logger = require('../../logger');
const models = require('../../models');

exports.create = params => models.sceneDatalandMark.create(params);

exports.findOneBySceneDatalandMarkId = datalandmark_id => models.sceneDatalandMark.findOne({
  where: { datalandmark_id},
  attributes: ['datalandmark_id', 'markbmode_id', 'scedp_id',
    'scenevideo_id', 'device_id', 'notifibuser_id', 'track_id']
});
