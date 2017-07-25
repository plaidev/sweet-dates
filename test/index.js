const assert = require('chai').assert
const {createDate, setDefaultLocalization, setUseServiceTimezoneByDefault, setSystemTimezone} = require('../libs')

before(function() {
  setSystemTimezone('GMT') // default is GMT
})

function _genUTCDate(base) {
  const d = new Date()
  d.setUTCFullYear(base.getUTCFullYear())
  d.setUTCMonth(base.getUTCMonth())
  d.setUTCDate(base.getUTCDate())
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d
}

function _genUTCYesterday() {
  const base = new Date(new Date().getTime() - 24*60*60*1000)
  return _genUTCDate(base)
}

function _genUTCToday() {
  const base = new Date(new Date().getTime())
  return _genUTCDate(base)
}

function _genUTCTomorrow() {
  const base = new Date(new Date().getTime() + 24*60*60*1000)
  return _genUTCDate(base)
}

describe('Basic:', function() {
  describe('simple', function() {
    it('can create', function() {
      // now
      assert.property(createDate(), 'long')
      assert.property(createDate(), 'getTime')
      assert.isString(createDate().long('ja'))
      assert.isOk(createDate().is(new Date().getTime(), 1000))
    })

    it('can create: unix timestamp', function() {
      // unix timestamp
      assert.property(createDate(new Date().getTime()), 'long')
      assert.property(createDate(new Date().getTime()), 'getTime')
      assert.isString(createDate(new Date().getTime()).long('ja'))
      assert.isOk(createDate(new Date().getTime()).is(new Date().getTime(), 1000))
    })

    it('can create: Date instance', function() {
      // Date instance
      assert.property(createDate(new Date()), 'long')
      assert.property(createDate(new Date()), 'getTime')
      assert.isString(createDate(new Date()).long('ja'))
      assert.isOk(createDate(new Date()).is(new Date().getTime(), 1000))
    })

    it('can create: relative', function() {
      // relative
      assert.property(createDate('1 hour ago'), 'long')
      assert.property(createDate('1 hour ago'), 'getTime')
      assert.isString(createDate('1 hour ago').long('ja'))
      assert.isOk(createDate('1 hour ago').is(new Date().getTime() - 1000*60*60, 1000))
    })

    it('can create: periodic relative', function() {
      // periodic relative
      assert.property(createDate('today'), 'long')
      assert.property(createDate('today'), 'getTime')
      assert.isString(createDate('today').long('ja'))
      const d = _genUTCToday()
      assert.isOk(createDate('today').is(d.getTime(), 1000))
    })

    it('can create: with locale', function() {
      // periodic relative
      assert.property(createDate('今日', 'ja'), 'long')
      assert.property(createDate('今日', 'ja'), 'getTime')
      assert.isString(createDate('今日', 'ja').long('ja'))
      const d = _genUTCToday()
      assert.isOk(createDate('今日', 'ja').is(d.getTime(), 1000))
    })

  })

  describe('settings', function() {
    describe('setUseServiceTimezoneByDefault', function() {
      before(function() {
        setDefaultLocalization({
          locale: 'ja',
          timezone: 'Asia/Tokyo'
        })
      })

      after(function() {
        setUseServiceTimezoneByDefault(false)
      })

      it('not use service timezone by default', function() {
        setUseServiceTimezoneByDefault(false)
        assert.equal(createDate().getTimezoneOffset(), 0)
        let diff;
        diff = Math.abs(createDate('今日').getTime() - _genUTCToday().getTime())
        assert.isOk(diff < 1000)
      })

      it('use service timezone by default', function() {
        setUseServiceTimezoneByDefault(true)
        assert.equal(createDate().getTimezoneOffset(), -540)
        let diff;
        diff = Math.abs(createDate('今日').getTime() - _genUTCToday().getTime())
        assert.isNotOk(diff < 1000)
      })
    })
  })

  describe('service timezone', function() {
    before(function() {
      setDefaultLocalization({
        locale: 'ja',
        timezone: 'Asia/Tokyo'
      })
      this.localization_PHOT = {
         timezone: 'Pacific/Enderbury' // +13
      }
      this.localization_NUT = {
         timezone: 'Pacific/Niue' // -11
      }
    })

    it('can create', function() {
      // now
      assert.property(createDate({serviceTimezone: true}), 'long')
      assert.property(createDate({serviceTimezone: true}), 'getTime')
      assert.isString(createDate({serviceTimezone: true}).long('ja'))
    })

    it('can create: unix timestamp', function() {
      // unix timestamp
      assert.property(createDate(new Date().getTime(), {serviceTimezone: true}), 'long')
      assert.property(createDate(new Date().getTime(), {serviceTimezone: true}), 'getTime')
      assert.isString(createDate(new Date().getTime(), {serviceTimezone: true}).long('ja'))
      assert.isOk(createDate(new Date().getTime(), {serviceTimezone: true}).is(new Date().getTime() + 9*60*60*1000, 1000))
    })

    it('can create: Date instance', function() {
      // Date instance
      assert.property(createDate(new Date(), {serviceTimezone: true}), 'long')
      assert.property(createDate(new Date(), {serviceTimezone: true}), 'getTime')
      assert.isString(createDate(new Date(), {serviceTimezone: true}).long('ja'))
      assert.isOk(createDate(new Date(), {serviceTimezone: true}).is(new Date().getTime() + 9*60*60*1000, 1000))
    })

    it('can create: relative', function() {
      // relative
      assert.property(createDate('一時間前', {serviceTimezone: true}), 'long')
      assert.property(createDate('一時間前', {serviceTimezone: true}), 'getTime')
      assert.isString(createDate('一時間前', {serviceTimezone: true}).long('ja'))
    })

    it('can create: periodic relative', function() {
      // periodic relative
      assert.property(createDate('今日', {serviceTimezone: true}), 'long')
      assert.property(createDate('今日', {serviceTimezone: true}), 'getTime')
      assert.isString(createDate('今日', {serviceTimezone: true}).long('ja'))
    })

    it('can create: with locale', function() {
      // periodic relative
      assert.property(createDate('today', 'en', {serviceTimezone: true}), 'long')
      assert.property(createDate('today', 'en', {serviceTimezone: true}), 'getTime')
      assert.isString(createDate('today', 'en', {serviceTimezone: true}).long('ja'))
    })

    it('can create: clone', function() {
      // now
      assert.property(createDate(createDate({serviceTimezone: true})), 'long')
      assert.property(createDate(createDate({serviceTimezone: true})), 'getTime')
      assert.isString(createDate(createDate({serviceTimezone: true})).long('ja'))
      assert.isOk(createDate(createDate({serviceTimezone: true})).is(new Date().getTime(), 1000))

      assert.equal(createDate(createDate({serviceTimezone: true})).getTimezoneOffset(), 0)
      assert.equal(createDate(createDate({serviceTimezone: true}), {serviceTimezone: true}).getTimezoneOffset(), -540)

      assert.isOk(
        createDate({serviceTimezone: true})
          .is(createDate(createDate({serviceTimezone: true}), {serviceTimezone: true}), 1000)
      )
      assert.isNotOk(
        createDate({serviceTimezone: true})
          .is(createDate(createDate({serviceTimezone: true})), 1000)
      )
      assert.isOk(
        createDate()
          .is(createDate(createDate({serviceTimezone: true})), 1000)
      )
    })

    it('equality', function() {
      // 若干直感的でないが、isは異なるtimezone間の同時刻（3:00 UTC == 3:00 JST）をtrueとする
      // また、system timezoneで判定される
      assert.isOk(createDate({serviceTimezone: true}).is(new Date().getTime() + 9*60*60*1000, 1000))
      assert.isOk(createDate('1 hour ago', 'en', {serviceTimezone: true}).is(new Date().getTime() + (9-1)*60*60*1000, 1000))
      assert.isOk(createDate('一時間前', {serviceTimezone: true}).is(new Date().getTime() + (9-1)*60*60*1000, 1000))

      let d = _genUTCToday()

      // periodic relative
      if (d.getUTCHours() < 15) {
        assert.isOk(createDate('今日', {serviceTimezone: true}).is(createDate('今日')))

        assert.equal(createDate('今日', {serviceTimezone: true}).getTime(), d.getTime() - 9*60*60*1000)
        assert.isOk(createDate('今日', {serviceTimezone: true}).is(createDate(d.getTime())))
      }
      else if (d.getUTCHours() > 15) {
        // timezoneによって、別の日になる
        assert.isOk(createDate('今日', {serviceTimezone: true}).is(createDate('明日')))

        const d = _genUTCTomorrow()
        assert.equal(createDate('今日', {serviceTimezone: true}).getTime(), d.getTime() - 9*60*60*1000)
        assert.isOk(createDate('今日', {serviceTimezone: true}).is(createDate(d.getTime())))
      }
    })

    it('equality: +13 -11', function() {
      const photNow = createDate({serviceTimezone: true, localization: this.localization_PHOT})
      const nutNow = createDate({serviceTimezone: true, localization: this.localization_NUT})

      assert.isOk(Math.abs(photNow.getTime() - nutNow.getTime()) < 1000)

      const photToday = createDate('今日', {serviceTimezone: true, localization: this.localization_PHOT})
      const nutTomorrow = createDate('明日', {serviceTimezone: true, localization: this.localization_NUT})
      const nutToday = createDate('今日', {serviceTimezone: true, localization: this.localization_NUT})

      // -12:00の'今日'と、+12:00の'明日'は同じ"日付"である
      assert.isOk(photToday.is(nutTomorrow))

      // 丸一日ズレているので、'今日'と'今日'はepocで比較すると常に同じ
      const diff = Math.abs(photToday.getTime() - nutToday.getTime())
      assert.isOk(diff < 1000)
    })

    it('manipulate with timezone', function() {
      const nutTomorrow = createDate('明日', {serviceTimezone: true, localization: this.localization_NUT})
      const nutToday = createDate('今日', {serviceTimezone: true, localization: this.localization_NUT})

      nutToday.addDays(1)

      assert.isOk(nutTomorrow.is(nutToday))
      const diff = Math.abs(nutTomorrow.getTime() - nutToday.getTime())
      assert.isOk(diff < 1000)
    })

    it('manipulate with timezone: periodic relative', function() {
      const _nutTomorrow = createDate('明日', {serviceTimezone: true, localization: this.localization_NUT})
      const nutTomorrow = createDate('明日', {serviceTimezone: true, localization: this.localization_NUT})
      nutTomorrow.set('明日') // tomorrow is NUT tomorrow

      assert.isOk(nutTomorrow.is(_nutTomorrow))
      const diff = Math.abs(nutTomorrow.getTime() - _nutTomorrow.getTime())
      assert.isOk(diff < 1000)
      assert.equal(nutTomorrow.getTimezoneOffset(), 660)
    })

  })

})