var mongoose = require('mongoose');

var tripSchema = new mongoose.Schema({
  country: String,
  user: String,
  dates: [],

  contacts: {
    entries: [],
    deadmanSwitch: Boolean,
    smsAlerts: Boolean,
    emailAlerts: Boolean
  },

  vaccinations: {
    extraRequired: Boolean,
    remindLater: Boolean,
    remindAt: Date,
    hideForever: Boolean
  },

  warnings: {
    multipleAlerts: Boolean,
    remindLater: Boolean,
    remindAt: Date,
    hideForever: Boolean,
    highRisk: Boolean
  }
});

module.exports = mongoose.model('Trip', tripSchema);
