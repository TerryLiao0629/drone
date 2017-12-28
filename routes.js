module.exports = (app) => {

  app.use('/apps', require('./controllers/app'));
  app.use('/devices', require('./controllers/device'));
  app.use('/accounts', require('./controllers/account'));
  app.use('/device-groups', require('./controllers/deviceGroup'));
  app.use('/retentions', require('./controllers/retention'));
  app.use('/others', require('./controllers/others'));
  app.use('/notifications', require('./controllers/notification'));
};
