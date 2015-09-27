var secrets = require('../config/secrets');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('lodash');

var Country = require('../models/Country');
var countryMap = {"afghanistan":"Afghanistan","albania":"Albania","algeria":"Algeria","american-samoa":"American Samoa","andorra":"Andorra","british-virgin-islands":"Virgin Islands, British ","angola":"Angola","anguilla":"Anguilla (U.K.)","antarctica":"Antarctica","antigua-and-barbuda":"Barbuda","argentina":"Argentina","armenia":"Armenia","aruba":"Aruba","french-polynesia":"Tubuai","australia":"Australia","austria":"Austria","azerbaijan":"Azerbaijan","azores":"Azores","the-bahamas":"Bahamas, The","bahrain":"Bahrain","bangladesh":"Bangladesh","barbados":"Barbados","belarus":"Belarus","belgium":"Belgium","belize":"Belize","benin":"Benin","bermuda":"Bermuda (U.K.)","bhutan":"Bhutan","bolivia":"Bolivia","bonaire":"Bonaire","bosnia-and-herzegovina":"Bosnia and Herzegovina","botswana":"Botswana","brazil":"Brazil","british-indian-ocean-territory":"British Indian Ocean Territory (U.K.)","brunei":"Brunei","bulgaria":"Bulgaria","burkina-faso":"Burkina Faso","burma":"Burma (Myanmar)","burundi":"Burundi","turks-and-caicos":"Turks and Caicos Islands (U.K.)","cambodia":"Cambodia","cameroon":"Cameroon","canada":"Canada","canary-islands":"Canary Islands (Spain)","cape-verde":"Cape Verde","cayman-islands":"Cayman Islands (U.K.)","central-african-republic":"Central African Republic","chad":"Chad","chile":"Chile","china":"China","christmas-island":"Christmas Island (Australia)","cocos-islands":"Cocos (Keeling) Islands (Australia)","colombia":"Colombia","comoros":"Comoros","congo":"Congo, Republic of the","cook-islands":"Cook Islands (New Zealand)","costa-rica":"Costa Rica","croatia":"Croatia","cuba":"Cuba","curacao":"Curaçao","cyprus":"Cyprus","czech-republic":"Czech Republic","ivory-coast":"Ivory Coast","democratic-republic-of-congo":"Democratic Republic of the Congo","denmark":"Denmark","djibouti":"Djibouti","dominica":"Dominica","dominican-republic":"Dominican Republic","united-arab-emirates":"United Arab Emirates","easter-island":"Easter Island (Chile)","ecuador":"Galápagos Islands","egypt":"Egypt","el-salvador":"El Salvador","united-kingdom":"Wales","equatorial-guinea":"Equatorial Guinea","eritrea":"Eritrea","estonia":"Estonia","ethiopia":"Ethiopia","falkland-islands":"Falkland Islands (Islas Malvinas)","faroe-island":"Faroe Islands (Denmark)","fiji":"Fiji","finland":"Finland","france":"France","french-guiana":"French Guiana (France)","gabon":"Gabon","the-gambia":"Gambia, The","georgia":"Georgia","germany":"Germany","ghana":"Ghana","gibraltar":"Gibraltar (U.K.)","greece":"Greece","greenland":"Greenland (Denmark)","grenada":"Grenada","saint-vincent-and-the-grenadines":"Saint Vincent and the Grenadines","guadeloupe":"Guadeloupe","guam":"Guam (U.S.)","guatemala":"Guatemala","guinea":"Guinea","guinea-bissau":"Guinea-Bissau","guyana":"Guyana","haiti":"Haiti","italy":"Vatican City","honduras":"Honduras","hong-kong-sar":"Hong Kong SAR (China)","hungary":"Hungary","iceland":"Iceland","india":"India","indonesia":"Indonesia","iran":"Iran","iraq":"Iraq","ireland":"Ireland","israel":"Israel, including the West Bank and Gaza","jamaica":"Jamaica","japan":"Japan","jordan":"Jordan","kazakhstan":"Kazakhstan","kenya":"Kenya","kiribati":"Kiribati","kosovo":"Kosovo","kuwait":"Kuwait","kyrgyzstan":"Kyrgyzstan","laos":"Laos","latvia":"Latvia","lebanon":"Lebanon","lesotho":"Lesotho","liberia":"Liberia","libya":"Libya","liechtenstein":"Liechtenstein","lithuania":"Lithuania","luxembourg":"Luxembourg","macau-sar":"Macau SAR (China)","macedonia":"Macedonia","madagascar":"Madagascar","maderia-islands":"Madeira Islands (Portugal)","malawi":"Malawi","malaysia":"Malaysia","maldives":"Maldives","mali":"Mali","malta":"Malta","marshall-islands":"Marshall Islands","martinique":"Martinique (France)","mauritania":"Mauritania","mauritius":"Mauritius","mayotte":"Mayotte (France)","mexico":"Mexico","micronesia":"Micronesia, Federated States of","moldova":"Moldova","monaco":"Monaco","mongolia":"Mongolia","montenegro":"Montenegro","montserrat":"Montserrat (U.K.)","morocco":"Morocco","mozambique":"Mozambique","namibia":"Namibia","nauru":"Nauru","nepal":"Nepal","netherlands":"Netherlands, The","new-caledonia":"New Caledonia (France)","new-zealand":"New Zealand","nicaragua":"Nicaragua","niger":"Niger","nigeria":"Nigeria","niue":"Niue (New Zealand)","norfolk-island":"Norfolk Island (Australia)","north-korea":"North Korea","northern-mariana-islands":"Tinian","norway":"Norway","oman":"Oman","pakistan":"Pakistan","palau":"Palau","panama":"Panama","papua-new-guinea":"Papua New Guinea","paraguay":"Paraguay","peru":"Peru","philippines":"Philippines","pitcairn-islands":"Pitcairn Islands (U.K.)","poland":"Poland","portugal":"Portugal","puerto-rico":"Puerto Rico (U.S.)","qatar":"Qatar","romania":"Romania","russia":"Russia","rwanda":"Rwanda","reunion":"Réunion (France)","saba":"Saba","saint-barthelemy":"Saint Barthelemy","usvirgin-islands":"Virgin Islands, U.S.","saint-helena":"Saint Helena (U.K.)","st-kitts-and-nevis":"Saint Kitts and Nevis","saint-lucia":"Saint Lucia","saint-martin":"Saint Martin","saint-pierre-and-miquelon":"Saint Pierre and Miquelon (France)","samoa":"Samoa","san-marino":"San Marino","saudi-arabia":"Saudi Arabia","senegal":"Senegal","serbia":"Serbia","seychelles":"Seychelles","sierra-leone":"Sierra Leone","singapore":"Singapore","sint-eustatius":"Sint Eustatius","sint-maarten":"Sint Maarten","slovakia":"Slovakia","slovenia":"Slovenia","solomon-islands":"Solomon Islands","somalia":"Somalia","south-africa":"South Africa","south-georgia-south-sandwich-islands":"South Sandwich Islands","south-korea":"South Korea","south-sudan":"South Sudan","spain":"Spain","sri-lanka":"Sri Lanka","sudan":"Sudan","suriname":"Suriname","swaziland":"Swaziland","sweden":"Sweden","switzerland":"Switzerland","syria":"Syria","sao-tome-and-principe":"São Tomé and Príncipe","taiwan":"Taiwan","tajikistan":"Tajikistan","tanzania":"Zanzibar","thailand":"Thailand","east-timor":"Timor-Leste (East Timor)","trinidad-and-tobago":"Trinidad and Tobago","togo":"Togo","tokelau":"Tokelau (New Zealand)","tonga":"Tonga","tunisia":"Tunisia","turkey":"Turkey","turkmenistan":"Turkmenistan","tuvalu":"Tuvalu","uganda":"Uganda","ukraine":"Ukraine","united-states":"United States","uruguay":"Uruguay","uzbekistan":"Uzbekistan","vanuatu":"Vanuatu","venezuela":"Venezuela","vietnam":"Vietnam","wake-island":"Wake Island","western-sahara":"Western Sahara","yemen":"Yemen","zambia":"Zambia","zimbabwe":"Zimbabwe"};

var scrapeHandlers = {
  'vaccines-and-medicines': parseVaccines,
  'travel-notices': parseNotices
}

var idMap = {
  'vaccines-and-medicines': 'vaccines',
  'travel-notices': 'alerts'
}

var dateMap = {
  'January': 'Jan',
  'February': 'Feb',
  'March': 'Mar',
  'April': 'Apr',
  'May': 'May',
  'June': 'Jun',
  'July': 'Jul',
  'August': 'Aug',
  'September': 'Sep',
  'October': 'Oct',
  'November': 'Nov',
  'December': 'Dec'
}

function parseVaccines(row, $) {
  var output = {
    all: [],
    most: [],
    some: []
  };
  var headers = 0;
  var map = {
    1: 'all',
    2: 'most',
    3: 'some'
  }

  row.find('tbody').children().each(function(){
    var self = $(this);
    // Check if this row is a header
    if (self.has('.group-head').length) return headers++;
    // Now let's get the required vaccine
    var vaccine = self.find('td.traveler-disease a').text();
    output[map[headers]].push(vaccine);
  })

  return output;
}

function parseNotices(row, $) {
  var currentType = '';
  var output = {
    watch: [],
    alert: [],
    warning: []
  }

  row.find('.section_body').children().each(function(){
    var self = $(this);
    // Check if is alert header
    if (self.hasClass('notice-typename')) {
      // Not always in order, so need to check what kind of alert it is
      if (self.hasClass('notice-typename-watch')) {
        currentType = 'watch';
      } else if (self.hasClass('notice-typename-alert')) {
        currentType = 'alert';
      } else if (self.hasClass('notice-typename-warning')) {
        currentType = 'warning';
      } else {
        // This row isn't anything important
        return;
      }
    };

    // Check if it's a list, if not then useless so return;
    if (!self.has('li').length) return;

    self.children().each(function(){
      var row = $(this);

      output[currentType].push({
        title: row.find('a').text(),
        date: row.find('span.date').text(),
        summary: row.find('span.summary').text(),
        link: 'http://wwwnc.cdc.gov' + row.find('a').attr('href'),
        source: 'cdc'
      })
    })
  })

  return output;
}

function parseDates(data) {
  var response = data;
  if (!data.alerts) return;

  response.news = [];
  
  data.alerts.watch.forEach(function(alert) {
    var day = alert.date.split(' ')[1].replace(',', '');
    var month = alert.date.split(' ')[0];
    month = dateMap[month];

    response.news.push({
      day: day,
      month: month,
      title: alert.title,
      summary: alert.summary,
      class: 'card-blue'
    })
  })

  data.alerts.alert.forEach(function(alert) {
    var day = alert.date.split(' ')[1].replace(',', '');
    var month = alert.date.split(' ')[0];
    month = dateMap[month];

    response.news.push({
      day: day,
      month: month,
      title: alert.title,
      summary: alert.summary,
      class: 'card-amber'
    })
  })

  data.alerts.warning.forEach(function(alert) {
    var day = alert.date.split(' ')[1].replace(',', '');
    var month = alert.date.split(' ')[0];
    month = dateMap[month];

    response.news.push({
      day: day,
      month: month,
      title: alert.title,
      summary: alert.summary,
      class: 'card-red'
    })
  })

  return response;
}

function calculateRating(country) {
  var base = -100; // Perfect country
  var type = 'green';

  base += country.alerts.entries.watch.length * 5;
  base += country.alerts.entries.alert.length * 15;
  base += country.alerts.entries.warning.length * 30;

  var previous = base;
  base += country.vaccines.entries.most.length * 5;
  base += country.vaccines.entries.some.length * 10;
  if (previous + base > previous - 20) base = previous - 20; // Max out vaccine damage

  if (country.alerts.entries.warning.length >= 1) {
    base += 20;
  }

  if (base > 0) base = 0;
  base = 100 + base;
  
  if (base > 84) {
    type = 'deep_orange';
  } else if (base > 70) {
    type = 'orange';
  } else if (base > 56) {
    type = 'amber';
  } else if (base > 42) {
    type = 'yellow';
  } else if (base > 28) {
    type = 'lime';
  } else if (base > 14) {
    type = 'light_green';
  }
 
  return {
    value: base,
    type: type
  }
}

function scrapeUSEmbassies(country, next) {
  var response = {}

  request.get('http://travel.state.gov/content/passports/en/country/' + country + '.html', function(err, response, body) {
    if (err) return next(err);
    if (request.statusCode == 301) return next('Unable to pull data from US Travel');

    var $ = cheerio.load(body);
    var embassy = $('#more_embassies').parent().find('h2').find('a').text();
    console.log(embassy);
  })
}

function scrapeUSTravel(country, next) {
  var results = [];
  var filtered = [];

  request.get('http://travel.state.gov/content/passports/en/alertswarnings.html', function(err, response, body) {
    if (err) return next(err);
    if (request.statusCode == 404) return next('Unable to pull data from US Travel');

    var $ = cheerio.load(body);
    $('body').find('tbody').find('tr').each(function(){
      var row = { level: '', date: '', title: '', link: ''};
      var col = 0;
      var map = ['level', 'date', 'title'];
      var _row = $(this);
      _row.find('td').each(function(){
        row[map[col++]] = $(this).text();
        if (col == 3) {
          row.link = 'http://travel.state.gov' + _row.find('a').attr('href');
        }
      })

      row.level = row.level.toLowerCase();
      results.push(row);
    })

    if (country) done();
  })

  function done() {
    results.forEach(function(row) {
      var title = row.title.toLowerCase();
      country = country.toLowerCase();
      var countryName = countryMap[country].toLowerCase();
      console.log('looking for ' + country + ' or ' + countryName + ' in ' + title);
      if (title.indexOf(country) > -1 || title.indexOf(countryName) > -1) filtered.push(row);
    })

    next(filtered);
  }
}

exports.scrapeCDC = function(country, next) {
  var response = {
    vaccines: { 
      all: [],
      most: [],
      some: []
    },

    alerts: {
      watch: [],
      alert: [],
      warning: []
    },

    news: []
  }

  request.get('http://wwwnc.cdc.gov/travel/destinations/traveler/none/' + country, function(err, request, body) {
    if (err) return next(err);
    if (request.statusCode == 404) return next('Unable to pull data from CDC');

    var $ = cheerio.load(body);
    var links = [];
    var gotData = false;
    $('#destination .row').each(function() {
      var module = $(this).find('.section_wrapper');
      var id = module.attr('id');

      if (scrapeHandlers[id]) {
        response[idMap[id]] = scrapeHandlers[id](module, $);
        gotData = true;
      }
    });

    scrapeUSTravel(country, function(rows) {
      rows.forEach(function(row) {
        response.alerts[row.level].push({
          title: row.title,
          date: row.date,
          link: row.link,
          source: 'bca'
        })
      })

      // Parse dates into news feed
      response = parseDates(response);

      next(false, response);
    })
  });
}

exports.addCountry = function(data, next) {
  var country = new Country(data);
  
  // Populate
  country.alerts = {};
  country.vaccines = {};
  country.news = {};

  exports.scrapeCDC(data.slug, function(err, response) {
    if (err) return next(err);

    country.alerts.entries = response.alerts;
    country.vaccines.entries = response.vaccines;
    country.news.entries = response.news;

    country.risk = calculateRating(country);

    //scrapeUSEmbassies(country.name);

    country.save(next);
  })
}

exports.renderArray = function (array) {
  var last = array.pop();
  return array.join(', ') + ' and ' + last;
}
/*
exports.addCountry({
  name: 'Saudi Arabia',
  slug: 'saudi-arabia',
  area: 'Arabian Peninsula',
  coordinates: ['24.266906', '45.1078489']
}, function(err, record) {
  console.log(record);
})


exports.scrapeCDC('iran', function(err, response) {
  console.log(JSON.stringify(response));
});
*/