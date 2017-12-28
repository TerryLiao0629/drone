const Joi = require('joi');
const { validateFormat } = require('../../../utils/validator');

exports.getAllStreamFilesByApplication = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getStreamFilesByName = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamfileName: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.addStreamFile = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamfileName: Joi.string().required(),
    uri: Joi.string().uri().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.updateDeleteStreamFile = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamfileName: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.connectStreamFile = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamfileName: Joi.string().required(),
    mediaCasterType: Joi.string().required(),
    appInstance: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.disconnectStreamFile = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamName: Joi.string().required(),
    appInstance: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getStreamInfoByName = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamName: Joi.string().required(),
    appInstance: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getPlaybackUrl = (value, playbackTypeLists) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamName: Joi.string().required(),
    playbackType: Joi.string().valid(playbackTypeLists).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.startRecording = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    streamName: Joi.string().required(),
    appInstance: Joi.string().required(),
    baseFile: Joi.string().required(),
    fileTemplate: Joi.string().required(),
    segmentDuration: Joi.number().integer().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false, allowUnknown: true });
  return validateFormat(validator);
};

exports.stopRecording = (value, recordActionLists) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    recorderName: Joi.string().required(),
    action: Joi.string().valid(recordActionLists).required(),
    appInstance: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};

exports.getRecordingInfo = (value) => {
  const schema = Joi.object().keys({
    appName: Joi.string().required(),
    recorderName: Joi.string().required(),
    appInstance: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  return validateFormat(validator);
};
