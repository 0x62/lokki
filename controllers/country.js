var Trip = require('../models/Trip');
var Country = require('../models/Country');
var api = require('./api');
var gm = require('googlemaps');
var Forecast = require('forecast');

var countryMap = {"afghanistan":"Afghanistan","albania":"Albania","algeria":"Algeria","american-samoa":"American Samoa","andorra":"Andorra","british-virgin-islands":"Virgin Islands, British ","angola":"Angola","anguilla":"Anguilla (U.K.)","antarctica":"Antarctica","antigua-and-barbuda":"Barbuda","argentina":"Argentina","armenia":"Armenia","aruba":"Aruba","french-polynesia":"Tubuai","australia":"Australia","austria":"Austria","azerbaijan":"Azerbaijan","azores":"Azores","the-bahamas":"Bahamas, The","bahrain":"Bahrain","bangladesh":"Bangladesh","barbados":"Barbados","belarus":"Belarus","belgium":"Belgium","belize":"Belize","benin":"Benin","bermuda":"Bermuda (U.K.)","bhutan":"Bhutan","bolivia":"Bolivia","bonaire":"Bonaire","bosnia-and-herzegovina":"Bosnia and Herzegovina","botswana":"Botswana","brazil":"Brazil","british-indian-ocean-territory":"British Indian Ocean Territory (U.K.)","brunei":"Brunei","bulgaria":"Bulgaria","burkina-faso":"Burkina Faso","burma":"Burma (Myanmar)","burundi":"Burundi","turks-and-caicos":"Turks and Caicos Islands (U.K.)","cambodia":"Cambodia","cameroon":"Cameroon","canada":"Canada","canary-islands":"Canary Islands (Spain)","cape-verde":"Cape Verde","cayman-islands":"Cayman Islands (U.K.)","central-african-republic":"Central African Republic","chad":"Chad","chile":"Chile","china":"China","christmas-island":"Christmas Island (Australia)","cocos-islands":"Cocos (Keeling) Islands (Australia)","colombia":"Colombia","comoros":"Comoros","congo":"Congo, Republic of the","cook-islands":"Cook Islands (New Zealand)","costa-rica":"Costa Rica","croatia":"Croatia","cuba":"Cuba","curacao":"Curaçao","cyprus":"Cyprus","czech-republic":"Czech Republic","ivory-coast":"Ivory Coast","democratic-republic-of-congo":"Democratic Republic of the Congo","denmark":"Denmark","djibouti":"Djibouti","dominica":"Dominica","dominican-republic":"Dominican Republic","united-arab-emirates":"United Arab Emirates","easter-island":"Easter Island (Chile)","ecuador":"Galápagos Islands","egypt":"Egypt","el-salvador":"El Salvador","united-kingdom":"Wales","equatorial-guinea":"Equatorial Guinea","eritrea":"Eritrea","estonia":"Estonia","ethiopia":"Ethiopia","falkland-islands":"Falkland Islands (Islas Malvinas)","faroe-island":"Faroe Islands (Denmark)","fiji":"Fiji","finland":"Finland","france":"France","french-guiana":"French Guiana (France)","gabon":"Gabon","the-gambia":"Gambia, The","georgia":"Georgia","germany":"Germany","ghana":"Ghana","gibraltar":"Gibraltar (U.K.)","greece":"Greece","greenland":"Greenland (Denmark)","grenada":"Grenada","saint-vincent-and-the-grenadines":"Saint Vincent and the Grenadines","guadeloupe":"Guadeloupe","guam":"Guam (U.S.)","guatemala":"Guatemala","guinea":"Guinea","guinea-bissau":"Guinea-Bissau","guyana":"Guyana","haiti":"Haiti","italy":"Vatican City","honduras":"Honduras","hong-kong-sar":"Hong Kong SAR (China)","hungary":"Hungary","iceland":"Iceland","india":"India","indonesia":"Indonesia","iran":"Iran","iraq":"Iraq","ireland":"Ireland","israel":"Israel, including the West Bank and Gaza","jamaica":"Jamaica","japan":"Japan","jordan":"Jordan","kazakhstan":"Kazakhstan","kenya":"Kenya","kiribati":"Kiribati","kosovo":"Kosovo","kuwait":"Kuwait","kyrgyzstan":"Kyrgyzstan","laos":"Laos","latvia":"Latvia","lebanon":"Lebanon","lesotho":"Lesotho","liberia":"Liberia","libya":"Libya","liechtenstein":"Liechtenstein","lithuania":"Lithuania","luxembourg":"Luxembourg","macau-sar":"Macau SAR (China)","macedonia":"Macedonia","madagascar":"Madagascar","maderia-islands":"Madeira Islands (Portugal)","malawi":"Malawi","malaysia":"Malaysia","maldives":"Maldives","mali":"Mali","malta":"Malta","marshall-islands":"Marshall Islands","martinique":"Martinique (France)","mauritania":"Mauritania","mauritius":"Mauritius","mayotte":"Mayotte (France)","mexico":"Mexico","micronesia":"Micronesia, Federated States of","moldova":"Moldova","monaco":"Monaco","mongolia":"Mongolia","montenegro":"Montenegro","montserrat":"Montserrat (U.K.)","morocco":"Morocco","mozambique":"Mozambique","namibia":"Namibia","nauru":"Nauru","nepal":"Nepal","netherlands":"Netherlands, The","new-caledonia":"New Caledonia (France)","new-zealand":"New Zealand","nicaragua":"Nicaragua","niger":"Niger","nigeria":"Nigeria","niue":"Niue (New Zealand)","norfolk-island":"Norfolk Island (Australia)","north-korea":"North Korea","northern-mariana-islands":"Tinian","norway":"Norway","oman":"Oman","pakistan":"Pakistan","palau":"Palau","panama":"Panama","papua-new-guinea":"Papua New Guinea","paraguay":"Paraguay","peru":"Peru","philippines":"Philippines","pitcairn-islands":"Pitcairn Islands (U.K.)","poland":"Poland","portugal":"Portugal","puerto-rico":"Puerto Rico (U.S.)","qatar":"Qatar","romania":"Romania","russia":"Russia","rwanda":"Rwanda","reunion":"Réunion (France)","saba":"Saba","saint-barthelemy":"Saint Barthelemy","usvirgin-islands":"Virgin Islands, U.S.","saint-helena":"Saint Helena (U.K.)","st-kitts-and-nevis":"Saint Kitts and Nevis","saint-lucia":"Saint Lucia","saint-martin":"Saint Martin","saint-pierre-and-miquelon":"Saint Pierre and Miquelon (France)","samoa":"Samoa","san-marino":"San Marino","saudi-arabia":"Saudi Arabia","senegal":"Senegal","serbia":"Serbia","seychelles":"Seychelles","sierra-leone":"Sierra Leone","singapore":"Singapore","sint-eustatius":"Sint Eustatius","sint-maarten":"Sint Maarten","slovakia":"Slovakia","slovenia":"Slovenia","solomon-islands":"Solomon Islands","somalia":"Somalia","south-africa":"South Africa","south-georgia-south-sandwich-islands":"South Sandwich Islands","south-korea":"South Korea","south-sudan":"South Sudan","spain":"Spain","sri-lanka":"Sri Lanka","sudan":"Sudan","suriname":"Suriname","swaziland":"Swaziland","sweden":"Sweden","switzerland":"Switzerland","syria":"Syria","sao-tome-and-principe":"São Tomé and Príncipe","taiwan":"Taiwan","tajikistan":"Tajikistan","tanzania":"Zanzibar","thailand":"Thailand","east-timor":"Timor-Leste (East Timor)","trinidad-and-tobago":"Trinidad and Tobago","togo":"Togo","tokelau":"Tokelau (New Zealand)","tonga":"Tonga","tunisia":"Tunisia","turkey":"Turkey","turkmenistan":"Turkmenistan","tuvalu":"Tuvalu","uganda":"Uganda","ukraine":"Ukraine","united-states":"United States","uruguay":"Uruguay","uzbekistan":"Uzbekistan","vanuatu":"Vanuatu","venezuela":"Venezuela","vietnam":"Vietnam","wake-island":"Wake Island","western-sahara":"Western Sahara","yemen":"Yemen","zambia":"Zambia","zimbabwe":"Zimbabwe"};
var config = {
  key: process.env.GOOGLEMAPSAPI || 'AIzaSyCxxMWErXBpAdcN6n-_pooI-ycDFgsiUZc',
  stagger_time: 1000, // for elevationPath
  encode_polylines: false,
  secure: true, // use https
};
var maps = new gm(config);

var forecast = new Forecast({
  service: 'forecast.io',
  key: '1c6a08a2f4eef28c75338291285f0737',
  units: 'celcius', // Only the first letter is parsed 
  cache: true,      // Cache API requests? 
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
    minutes: 30,
    seconds: 0
  }
});

/**
 * GET /create
 * Get the create trip page
 */
exports.getCreateTrip = function(req, res) {
  res.render('create', {
    title: 'Create Trip'
  });
};

exports.postCreateTrip = function(req, res) {
  var country = {
    name: countryMap[req.body.country],
    slug: req.body.country
  };

  Country.findOne({ slug: country.slug }, function(err, data) {
    if (data) return done(null, data);
    maps.geocode({ address: req.body.country }, function(err, result){
      country.coordinates = [result[0].geometry.location.lat, result[0].geometry.location.lng];
      api.addCountry(country, done)
    });
  })

  function done(err, country) {
    console.log(country);
  }
};

/**
 * GET /country/:slug
 * Get the dashboard for an individual country
 */
exports.getCountry = function(req, res) {
  Country.findOne({ slug: req.params.slug }, function(err, country) {
    if (!country) {
      var country = {
        name: countryMap[req.params.slug],
        slug: req.params.slug
      }

      api.addCountry(country, function(err, country) {
        if (err) return done(err);

        maps.geocode({ address: country.name }, function(err, result){
          if (!result) return done('Unable to locate country');
          country.coordinates = [result.results[0].geometry.location.lat, result.results[0].geometry.location.lng];
          forecast.get(country.coordinates, function(err, weather) {
            country.weather = {
              summary: weather.daily.summary,
              temp: Math.floor(weather.currently.temperature),
              icon: weather.daily.icon
            }
            country.save(done);
          });
        });
      })
    } else {
      done(null, country);
    }
  })

  function done(err, country) {
    if (err) return res.render('error', { title: 'Error', error: err });

    res.render('country', {
      title: country.name,
      country: country
    });
  }
};