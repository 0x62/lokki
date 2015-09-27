var mongoose = require('mongoose');

var countrySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true, lowercase: true },
  area: String,
  coordinates: [Number],
  weather: {
    entries: [],
    image: String,
    temp: Number,
    icon: String,
    summary: String,
    lastUpdate: Date
  },
  alerts: {
    entries: mongoose.Schema.Types.Mixed,
    lastUpdate: Date
  },
  vaccines: {
    entries: mongoose.Schema.Types.Mixed,
    lastUpdate: Date
  },
  news: {
    entries: mongoose.Schema.Types.Mixed,
    lastUpdate: Date
  },
  risk: {
    value: Number,
    type: { type: String },
    lastUpdate: Date
  },
  contacts: {
    bca: [],
    nzst: []
  },
  social: {
    entries: [],
    lastUpdate: Date,
    keywords: []
  }
});

countrySchema.pre('save', function(next){
  var country = this;
  
  if (country.isModified('weather')) country.weather.lastUpdate = new Date();
  if (country.isModified('alerts')) country.alerts.lastUpdate = new Date();
  if (country.isModified('vaccines')) country.vaccines.lastUpdate = new Date();
  if (country.isModified('news')) country.news.lastUpdate = new Date();
  if (country.isModified('risk')) country.risk.lastUpdate = new Date();
  if (country.isModified('social')) country.social.lastUpdate = new Date();

  next();
})

module.exports = mongoose.model('Country', countrySchema);
