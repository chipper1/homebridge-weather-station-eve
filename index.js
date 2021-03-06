/*jshint esversion: 6,node: true,-W041: false */
"use strict";
var Wunderground = require('./wundergroundnode');
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
var timeout;
const version = require('./package.json').version;

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
	ObservationTime: 'c1b27812-1fc4-4223-a20e-7b5f64d693ae',
	SelectedStation: 'a2327812-1fc4-4223-f10e-7b5f64d69334',
	StationID: 'ccb2787d-1fc4-af45-abce-7b5a12d693ed',
};

var CustomCharacteristic = {};
var EveService = {};

module.exports = function (homebridge) {
	var FakeGatoHistoryService = require('fakegato-history')(homebridge);
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-wunderground-eve", "WUWeatherStationEve", WUWeatherStationEve);

	function WUWeatherStationEve(log, config) {

		this.log = log;
		this.language = config.language;
		this.wunderground = new Wunderground(config.key, this.language);
		this.name = config.name;
		this.displayName = config.name;
		this.location = config.location;
		this.serial = config.serial || "000";
		this.timestampOfLastUpdate = 0;
		this.maxStationID = this.location.length;

		const strings = require('./lang/' + this.language + '.json').strings;

		CustomCharacteristic.WeatherConditionCategory = function () {
			Characteristic.call(this, strings.CONDITION_CATEGORY, CustomUUID.WeatherConditionCategory);
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

		CustomCharacteristic.WeatherCondition = function () {
			Characteristic.call(this, strings.CONDITION, CustomUUID.WeatherCondition);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.WeatherCondition, Characteristic);

		CustomCharacteristic.Rain1h = function () {
			Characteristic.call(this, strings.RAIN_LAST_HOUR, CustomUUID.Rain1h);
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

		CustomCharacteristic.Rain24h = function () {
			Characteristic.call(this, strings.RAIN_DAY, CustomUUID.Rain24h);
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

		CustomCharacteristic.WindDirection = function () {
			Characteristic.call(this, strings.WIND_DIRECTION, CustomUUID.WindDirection);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.WindDirection, Characteristic);

		CustomCharacteristic.WindSpeed = function () {
			Characteristic.call(this, strings.WIND_SPEED, CustomUUID.WindSpeed);
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

		CustomCharacteristic.AirPressure = function () {
			Characteristic.call(this, strings.AIR_PRESSURE, CustomUUID.AirPressure);
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

		CustomCharacteristic.Visibility = function () {
			Characteristic.call(this, strings.VISIBILITY, CustomUUID.Visibility);
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

		CustomCharacteristic.UVIndex = function () {
			Characteristic.call(this, strings.UV_INDEX, CustomUUID.UVIndex);
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

		CustomCharacteristic.MeasuringStation = function () {
			Characteristic.call(this, strings.STATION, CustomUUID.MeasuringStation);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.MeasuringStation, Characteristic);

		CustomCharacteristic.StationID = function () {
			Characteristic.call(this, strings.STATION_ID, CustomUUID.StationID);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.StationID, Characteristic);

		CustomCharacteristic.LastUpdate = function () {
			Characteristic.call(this, strings.LAST_UPDATE, CustomUUID.LastUpdate);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.LastUpdate, Characteristic);

		CustomCharacteristic.ObservationTime = function () {
			Characteristic.call(this, strings.LAST_OBSERVATION, CustomUUID.ObservationTime);
			this.setProps({
				format: Characteristic.Formats.STRING,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.ObservationTime, Characteristic);

		CustomCharacteristic.SelectedStation = function () {
			Characteristic.call(this, strings.DEFAULT_STATION, CustomUUID.SelectedStation);
			this.setProps({
				format: Characteristic.Formats.UINT8,
				maxValue: 10,
				minValue: 0,
				minStep: 1,
				perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
			});
			this.value = this.getDefaultValue();
		};
		inherits(CustomCharacteristic.SelectedStation, Characteristic);

		EveService.WeatherService = function (displayName, subtype) {
			Service.call(this, displayName, 'E863F001-079E-48FF-8F27-9C2605A29F52', subtype);
			this.addCharacteristic(Characteristic.CurrentTemperature);
			this.addCharacteristic(Characteristic.CurrentRelativeHumidity);
			this.addCharacteristic(CustomCharacteristic.AirPressure);
			this.getCharacteristic(Characteristic.CurrentTemperature)
				.setProps({
					minValue: -40,
					maxValue: 60
				});
		};
		inherits(EveService.WeatherService, Service);

		this.informationService = new Service.AccessoryInformation();
		this.informationService
			.setCharacteristic(Characteristic.Manufacturer, "Simone Tisa")
			.setCharacteristic(Characteristic.Model, "Weather Underground Eve")
			.setCharacteristic(Characteristic.FirmwareRevision, version)
			.setCharacteristic(Characteristic.SerialNumber, this.serial);


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
		this.weatherStationService.addCharacteristic(CustomCharacteristic.ObservationTime);
		this.weatherStationService.addCharacteristic(CustomCharacteristic.SelectedStation);
		this.weatherStationService.addCharacteristic(CustomCharacteristic.StationID);

		this.weatherStationService.getCharacteristic(CustomCharacteristic.SelectedStation).props.maxValue = this.maxStationID - 1;


		this.weatherStationService.getCharacteristic(CustomCharacteristic.SelectedStation)
			.on('change', (callback) => {
				this.weatherStationService.setCharacteristic(CustomCharacteristic.StationID, this.location[this.weatherStationService.getCharacteristic(CustomCharacteristic.SelectedStation).value]);
			});

		this.weatherStationService.getCharacteristic(CustomCharacteristic.StationID)
			.on('change', (callback) => {
				clearTimeout(timeout);
				this.updateWeatherConditions("pws:" + this.weatherStationService.getCharacteristic(CustomCharacteristic.StationID).value);
			});

		this.weatherStationService.setCharacteristic(CustomCharacteristic.SelectedStation, 0);

		if (config.storage == 'fs')
			this.loggingService = new FakeGatoHistoryService("weather", this, { storage: 'fs' });
		else
			this.loggingService = new FakeGatoHistoryService("weather", this, { storage: 'googleDrive', path: 'homebridge' });
		this.updateWeatherConditions("pws:" + this.location[0]);
	}

	WUWeatherStationEve.prototype = {
		identify: function (callback) {
			this.log("Identify requested!");
			callback(); // success
		},

		getServices: function () {
			return [this.informationService, this.weatherStationService, this.loggingService];
		},

		updateWeatherConditions: function (station) {
			var that = this;

			that.wunderground.conditions().request(station, function (err, response) {
				if (!err && response.current_observation && response.current_observation.temp_c) {
					that.timestampOfLastUpdate = moment().locale('it').format("HH:mm, DD-MM-YY");
					let conditionIcon = response.current_observation.icon;
					that.condition = response.current_observation.weather;
					switch (conditionIcon) {
						case "snow":
						case "sleet":
						case "flurries":
						case "chanceflurries":
						case "chancesleet":
						case "chancesnow":
							that.conditionValue = 3;
							break;
						case "rain":
						case "tstorm":
						case "tstorms":
						case "chancerain":
						case "chancetstorms":
							that.conditionValue = 2;
							break;
						case "cloudy":
						case "fog":
						case "hazy":
						case "mostlycloudy":
						case "partlycloudy":
							that.conditionValue = 1;
							break;
						case "partlysunny":
						case "clear":
						case "mostlysunny":
						case "sunny":
							that.conditionValue = 0;
							break;
						default:
							that.conditionValue = 4;
							break;
					}

					that.temperature = response.current_observation.temp_c;
					that.humidity = parseInt(response.current_observation.relative_humidity.substr(0, response.current_observation.relative_humidity.length - 1));
					that.uv = parseInt(response.current_observation.UV);
					that.rain_1h_metric = parseInt(response.current_observation.precip_1hr_metric);
					if (isNaN(that.rain_1h_metric))
						that.rain_1h_metric = 0;
					that.rain_24h_metric = parseInt(response.current_observation.precip_today_metric);
					if (isNaN(that.rain_24h_metric))
						that.rain_24h_metric = 0;
					that.windDirection = response.current_observation.wind_dir;
					that.windSpeed = parseFloat(response.current_observation.wind_kph);
					that.airPressure = parseInt(response.current_observation.pressure_mb);
					that.visibility = parseInt(response.current_observation.visibility_km);
					if (isNaN(that.visibility))
						that.visibility = 0;
					that.uvIndex = parseInt(response.current_observation.UV);
					if (isNaN(that.uvIndex) || that.uvIndex < 0)
						that.uvIndex = 0;
					that.station = response.current_observation.observation_location.city;
					that.stationID = response.current_observation.station_id;
					that.observationTime = response.current_observation.observation_time;

					that.weatherStationService.setCharacteristic(Characteristic.CurrentTemperature, that.temperature);
					that.weatherStationService.setCharacteristic(Characteristic.CurrentRelativeHumidity, that.humidity);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.WeatherConditionCategory, that.conditionValue);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.WeatherCondition, that.condition);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.Rain1h, that.rain_1h_metric);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.Rain24h, that.rain_24h_metric);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.WindDirection, that.windDirection);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.WindSpeed, that.windSpeed);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.AirPressure, that.airPressure);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.Visibility, that.visibility);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.UVIndex, that.uvIndex);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.MeasuringStation, that.station);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.LastUpdate, that.timestampOfLastUpdate);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.ObservationTime, that.observationTime);
					that.weatherStationService.setCharacteristic(CustomCharacteristic.StationID, that.stationID);

					that.loggingService.addEntry({ time: moment().unix(), temp: that.temperature, pressure: that.airPressure, humidity: that.humidity });

				} else {
					that.log.debug("Error retrieving the weather conditions");
					that.weatherStationService.setCharacteristic(CustomCharacteristic.MeasuringStation, "Error!");
				}
			});

			//wunderground limits to 500 api calls a day. Making a call every 10 minutes == 144 calls
			timeout = setTimeout(this.updateWeatherConditions.bind(this), 10 * 60 * 1000, station);
		}
	};
};
