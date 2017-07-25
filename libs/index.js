const Sugar = require('sugar-date')
require('./locales/ja')
const timezoneJS = require('timezone-js')
const path = require('path')

timezoneJS.timezone.zoneFileBasePath = path.join(__dirname, '../tz')
timezoneJS.timezone.init()

const _timezonedDateClasses = {
  GMT: buildTimezonedDate('GMT')
}

let _useServiceTimezoneByDefault = false

let _systemTimezone = 'GMT'
let _systemTimezonedDateClass = _timezonedDateClasses.GMT

const _defaultLocalization = {
  locale: 'en',
  timezone: 'GMT'
}

// HACK: SugarがnewDateInternalへ
let _currentTimezonedDateClass = _systemTimezonedDateClass

Sugar.Date.setOption('newDateInternal', function() {
  const d = new _currentTimezonedDateClass()
  return d
})

function _isString(v) {
  return v && (typeof v === 'string' || v instanceof String)
}

function _isNumber(v) {
  return v && (typeof v === 'number' || v instanceof Number)
}

function mixInSugar(target) {
  const methods = Sugar.Date;
  for (let key in methods) {
    if (!methods.hasOwnProperty(key)) continue;
    const m = methods[key];
    if (m.instance && !target[key]) {
      target[key] = m.instance;
    }
  }
}

function buildTimezonedDate(timezoneString) {
  // Sugar/lib/extras/timezonejs-shim.js
  function DateWithTimezone (...dateFormat) {
    timezoneJS.Date.apply(this, [...dateFormat, timezoneString]);
  }

  DateWithTimezone.prototype = new timezoneJS.Date();
  mixInSugar(DateWithTimezone.prototype);

  return DateWithTimezone;
}

function getTimezonedClass(timezone) {
  if (!(timezone in _timezonedDateClasses)) {
    _timezonedDateClasses[timezone] = buildTimezonedDate(timezone)
  }
  return _timezonedDateClasses[timezone]
}

function getServiceSettings(localization={}) {
  return {
    locale: localization.locale || _defaultLocalization.locale,
    timezone: localization.timezone || _defaultLocalization.timezone
  }
}

function createDateOfServiceTimezone(dateFormat, locale, timezone) {
  const _Date = getTimezonedClass(timezone)
  const fromUTC = _isString(dateFormat) ? false : true
  const _d = Sugar.Date.create(dateFormat, locale, {fromUTC})
  // console.log('ServiceTime', _d.long(), _d.getTime(), locale, timezone, fromUTC, dateFormat)
  const d = new _Date(_d.getTime())
  return d
}

function createDateOfSystemTimezone(dateFormat, locale) {
  const _d = Sugar.Date.create(dateFormat, locale, {fromUTC: true})
  // console.log('SystemTime', _d.long(), _d.getTime(), locale, dateFormat)
  const d = new _systemTimezonedDateClass(_d.getTime())
  return d
}

exports.setDefaultLocalization = function(options) {
  for (let k in _defaultLocalization)
    if (k in options)
      _defaultLocalization[k] = options[k];
}

exports.setSystemTimezone = function(timezone) {
  _systemTimezone = timezone
  _systemTimezonedDateClass = getTimezonedClass(timezone)
}

exports.setUseServiceTimezoneByDefault = function(f) {
  _useServiceTimezoneByDefault = f
}

exports.createDate = function createDate(...args) {
  let date;
  let dateFormat;
  let _locale;

  if (args.length > 0 && args[0].getTime) {
    dateFormat = args.shift().getTime()
  }
  else if (_isString(args[0])) {
    dateFormat = args.shift()
  }
  else if (_isNumber(args[0])) {
    dateFormat = args.shift()
  }
  else {
    dateFormat = (new Date()).getTime()
  }

  if (_isString(args[0])) {
    _locale = args.shift()
  }

  const {localization, serviceTimezone} = Object.assign({
    localization: {},
    serviceTimezone: _useServiceTimezoneByDefault
  }, ...args)

  let {locale, timezone} = getServiceSettings(localization)
  if (_locale) locale = _locale;

  if (serviceTimezone) {
    // 無理やり切り替える
    // javascriptはシングルスレッドのなので、
    // 復帰処理まで一貫して行われることは一応保証されている
    const bak = _currentTimezonedDateClass
    _currentTimezonedDateClass = getTimezonedClass(timezone)
    date = createDateOfServiceTimezone(dateFormat, locale, timezone)
    _currentTimezonedDateClass = bak
  }
  else {
    date = createDateOfSystemTimezone(dateFormat, locale)
  }

  return date
}