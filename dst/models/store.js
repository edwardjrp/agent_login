var PulseBridge, Setting, Store, libxmljs, _;

Store = require('./schema').Store;

_ = require('underscore');

libxmljs = require("libxmljs");

PulseBridge = require('../pulse_bridge/pulse_bridge');

Setting = require('../models/setting');

Store.prototype.schedule = function(respond) {
  var me;
  me = this;
  return Setting.kapiqua(function(err, settings) {
    var pulse_com_error, store_request;
    if (err) {
      return console.error(err.stack);
    } else {
      pulse_com_error = function(comm_err) {
        console.error(comm_err.stack);
        return respond(comm_err);
      };
      store_request = new PulseBridge(null, me.storeid, me.ip, settings.pulse_port);
      return store_request.schedule(pulse_com_error, function(res_data) {
        var doc, schedule;
        doc = libxmljs.parseXmlString(res_data);
        schedule = doc.get('//StoreSchedule').toString();
        if (schedule != null) {
          return me.updateAttributes({
            store_schedule: schedule
          }, function(update_store_error, updated_store) {
            if (update_store_error) {
              console.log(update_store_error.stack);
              return respond(update_store_error);
            } else {
              return respond(null, updated_store);
            }
          });
        }
      });
    }
  });
};

module.exports = Store;
