## 0.4.0
* changed name of plugin to homebridge-wunderground-eve, accessory name to "WUWeatherStationEve"
## 0.3.8
* fix name of localization files
* added optional "storage" parameter. If "fs" will persist history on filesystem, otherwise on googledrive
* fix for Eve 3.2 and custom "Station ID" characteristics
## 0.3.7
* Updated fakegato-history dependency and added history persistance on google drive
* Added localization

## 0.3.6
* Updated fakegato-history dependency

## 0.3.5
* Updated fakegato-history dependency

## 0.3.4
* Updated fakegato-history dependency
## 0.3.3
* Updated fakegato-history dependency

## 0.3.2
* Fix for negative temperatures

## 0.3.1
* Updated fakegato-history dependency

## 0.3.0
* Added Eve's like history using fakegato-history

## 0.1.0

* Added characteristics for precip 1 hour, precip today, wind direction, wind speed, air pressure, visibility, uv-index and station
* Added condition category for sunny weather
* Renamed condition values to condition categories
* Changed condition category values
* Changed service to temperature-sensor so that the device is recognized by apple home app