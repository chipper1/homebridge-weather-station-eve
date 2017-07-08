"use strict";
var Wunderground = require('wundergroundnode');
const moment = require('moment');
var inherits = require('util').inherits;
var Service, Characteristic;

var weatherStationService;

var WeatherCondition;
var WeatherConditionCategory;
var Rain1h;
var Rain24h;
var WindDirection;
var WindSpeed;
var AirPressure;
var Visibility;
var UVIndex;
var MeasuringStation;

var CustomUUID = {
	// Eve
	AirPressure: 'E863F10F-079E-48FF-8F27-9C2605A29F52',
	// Other
	WindSpeed: '49C8AE5A-A3A5-41AB-BF1F-12D5654F9F41',
	// Weather Station
	WeatherCondition: 'cd65a9ab-85ad-494a-b2bd-2f380084134d',
	WeatherConditionCategory: 'cd65a9ab-85ad-494a-b2bd-2f380084134c',
	// Weather Station Extended
	Rain1h: '10c88f40-7ec4-478c-8d5a-bd0c3cce14b7',
	Rain24h: 'ccc04890-565b-4376-b39a-3113341d9e0f',
	WindDirection: '46f1284c-1912-421b-82f5-eb75008b167e',
	Visibility: 'd24ecc1e-6fad-4fb5-8137-5af88bd5e857',
	UVIndex: '05ba0fe0-b848-4226-906d-5b64272e05ce',
	MeasuringStation: 'd1b2787d-1fc4-4345-a20e-7b5a74d693ed',
	LastUpdate: 'd1b27812-1fc4-4383-a20e-7b5a74d693ae',
};

var CustomCharacteristic = {};
var EveService = {};

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-wunderground-extended", "WUWeatherStationExtended", WUWeatherStationExtended);

	CustomCharacteristic.WeatherConditionCategory = function() {
		Characteristic.call(this, 'Weather Condition Category', CustomUUID.WeatherConditionCategory);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 4,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.WeatherConditionCategory, Characteristic);

	CustomCharacteristic.WeatherCondition = function() {
		Characteristic.call(this, 'Condizioni meteo', CustomUUID.WeatherCondition);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.WeatherCondition, Characteristic);

	CustomCharacteristic.Rain1h = function() {
		Characteristic.call(this, 'Precipitazioni ultima ora', CustomUUID.Rain1h);
		this.setProps({
			format: Characteristic.Formats.UINT16,
			unit: "mm",
			maxValue: 1000,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.Rain1h, Characteristic);

	CustomCharacteristic.Rain24h = function() {
		Characteristic.call(this, 'Precipitazioni odierne', CustomUUID.Rain24h);
		this.setProps({
			format: Characteristic.Formats.UINT16,
			unit: "mm",
			maxValue: 1000,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.Rain24h, Characteristic);

	CustomCharacteristic.WindDirection = function() {
		Characteristic.call(this, 'Direzione vento', CustomUUID.WindDirection);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.WindDirection, Characteristic);

	CustomCharacteristic.WindSpeed = function() {
		Characteristic.call(this, 'Velocità vento', CustomUUID.WindSpeed);
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: "km/h",
			maxValue: 100,
			minValue: 0,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.WindSpeed, Characteristic);

	CustomCharacteristic.AirPressure = function() {
		Characteristic.call(this, 'Air Pressure', CustomUUID.AirPressure);
		this.setProps({
			format: Characteristic.Formats.UINT16,
			unit: "mBar",
			maxValue: 1100,
			minValue: 700,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.AirPressure, Characteristic);

	CustomCharacteristic.Visibility = function() {
		Characteristic.call(this, 'Visibilità', CustomUUID.Visibility);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			unit: "km",
			maxValue: 100,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.Visibility, Characteristic);

	CustomCharacteristic.UVIndex = function() {
		Characteristic.call(this, 'Indice UV', CustomUUID.UVIndex);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 10,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.UVIndex, Characteristic);
	
	CustomCharacteristic.MeasuringStation = function() {
		Characteristic.call(this, 'Stazione', CustomUUID.MeasuringStation);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.MeasuringStation, Characteristic);
	
	CustomCharacteristic.LastUpdate = function() {
		Characteristic.call(this, 'Ultimo update', CustomUUID.LastUpdate);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ]
		});
		this.value = this.getDefaultValue();
	};
	inherits(CustomCharacteristic.LastUpdate, Characteristic);
	

	EveService.WeatherService = function(displayName, subtype) {
			Service.call(this, displayName, 'E863F001-079E-48FF-8F27-9C2605A29F52', subtype);
			this.addCharacteristic(Characteristic.CurrentTemperature);
			this.addCharacteristic(Characteristic.CurrentRelativeHumidity);
			this.addCharacteristic(CustomCharacteristic.AirPressure);
	};
	inherits(EveService.WeatherService, Service);

	EveService.Logging = function(displayName, subtype) {
			Service.call(this, displayName, 'E863F007-079E-48FF-8F27-9C2605A29F52', subtype);
			/*this.addCharacteristic(LegrandMyHome.E863F116);
			this.addCharacteristic(LegrandMyHome.E863F117);
			this.addCharacteristic(LegrandMyHome.E863F11C);
			this.addCharacteristic(LegrandMyHome.E863F121);*/
	};
	inherits(EveService.Logging, Service);
	
}

function WUWeatherStationExtended(log, config) {
	this.log = log;
	this.language = config['language'];
	this.wunderground = new Wunderground(config['key'], this.language);
	this.name = config['name'];
	this.location = config['location'];
	this.timestampOfLastUpdate = 0;
	

	this.informationService = new Service.AccessoryInformation();
	this.informationService
	.setCharacteristic(Characteristic.Manufacturer, "HomeBridge")
	.setCharacteristic(Characteristic.Model, "Weather Underground")
	.setCharacteristic(Characteristic.SerialNumber, this.location);

	
	this.weatherStationService = new EveService.WeatherService(this.name);
	
	this.weatherStationService.addCharacteristic(CustomCharacteristic.WeatherCondition);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.WeatherConditionCategory);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.Rain1h);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.Rain24h);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.WindDirection);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.WindSpeed);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.Visibility);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.UVIndex);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.MeasuringStation);
	this.weatherStationService.addCharacteristic(CustomCharacteristic.LastUpdate);
	
	

this.loggingService = new EveService.Logging(this.name);

	this.updateWeatherConditions();
}

WUWeatherStationExtended.prototype = {
	identify: function (callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function () {
		return [this.informationService, this.weatherStationService, this.loggingService];
	},

	updateWeatherConditions: function() {
		var that = this

		that.wunderground.conditions().request(that.location, function(err, response){
			if (!err && response['current_observation'] && response['current_observation']['temp_c']) {
				that.timestampOfLastUpdate = moment().locale('it').format("HH:mm, DD-MM-YY");;
				let conditionIcon = response['current_observation']['icon']
				that.condition = response['current_observation']['weather']
				switch (conditionIcon) {									
					case "snow":
					case "sleet":
					case "flurries":
					case "chanceflurries":
					case "chancesleet":
					case "chancesnow":
					that.conditionValue = 3
					break;
					case "rain":
					case "tstorm":
					case "tstorms":
					case "chancerain":
					case "chancetstorms":
					that.conditionValue = 2
					break;
					case "cloudy":
					case "fog":
					case "hazy":
					case "mostlycloudy":
					case "partlycloudy":
					that.conditionValue = 1
					break;
					case "partlysunny":
					case "clear":
					case "mostlysunny":
					case "sunny":
					that.conditionValue = 0
					break;
					default:
					that.conditionValue = 4
					break;
				}

				that.temperature = response['current_observation']['temp_c'];
				that.humidity = parseInt(response['current_observation']['relative_humidity'].substr(0, response['current_observation']['relative_humidity'].length-1));
				that.uv = parseInt(response['current_observation']['UV']);
				that.rain_1h_metric = parseInt(response['current_observation']['precip_1hr_metric']);
				if (isNaN(that.rain_1h_metric))
					that.rain_1h_metric = 0;
				that.rain_24h_metric = parseInt(response['current_observation']['precip_today_metric']);
				if (isNaN(that.rain_24h_metric))
					that.rain_24h_metric = 0;
				that.windDirection = response['current_observation']['wind_dir'];
				that.windSpeed = parseFloat(response['current_observation']['wind_kph']);
				that.airPressure = parseInt(response['current_observation']['pressure_mb']);
				that.visibility = parseInt(response['current_observation']['visibility_km']);
				if (isNaN(that.visibility))
					that.visibility = 0;
				that.uvIndex = parseInt(response['current_observation']['UV']);
				if (isNaN(that.uvIndex) || that.uvIndex < 0)
					that.uvIndex = 0;
				that.station = response['current_observation']['display_location']['full'];

				/*that.log("Current Weather Conditions -> Temperature: " + that.temperature + ", Humidity: " + that.humidity + ", WeatherConditionCategory: " + that.conditionValue + ", WeatherCondition: "
					+ that.condition + ", Rain1h: " + that.rain_1h_metric + ", Rain24h: " + that.rain_24h_metric + ", WindDirection: " + that.windDirection + ", WindSpeed: "
					+ that.windSpeed + ", AirPressure: " + that.airPressure + ", Visibility: " + that.visibility + ", UVIndex: " + that.uvIndex  + ", MeasuringStation: " + that.station); */

				that.weatherStationService.setCharacteristic(Characteristic.CurrentTemperature, that.temperature);
				that.weatherStationService.setCharacteristic(Characteristic.CurrentRelativeHumidity, that.humidity);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.WeatherConditionCategory,that.conditionValue);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.WeatherCondition,that.condition);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.Rain1h,that.rain_1h_metric);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.Rain24h,that.rain_24h_metric);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.WindDirection,that.windDirection);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.WindSpeed,that.windSpeed);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.AirPressure,that.airPressure);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.Visibility,that.visibility);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.UVIndex,that.uvIndex);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.MeasuringStation, that.station);
				that.weatherStationService.setCharacteristic(CustomCharacteristic.LastUpdate, that.timestampOfLastUpdate);
	
			} else {
				that.log("Error retrieving the weather conditions")
			}
		});

		// wunderground limits to 500 api calls a day. Making a call every 10 minutes == 144 calls
		setTimeout(this.updateWeatherConditions.bind(this), 10 * 60 * 1000);
	}
};