const lodash = require('lodash')

class SimpleProfilingTool {
  constructor ({ nesting }) {
    this.checkPoints = {}
    this.nesting = nesting
  }

  static timeConverter (time) {
    if (time > 1000)
      return `${time / 1000} sec`
    else return `${time} ms`
  }

  static addEventNum (keys, field, status) {
    let eventKeys = keys
    if (keys.length) {
      const groupedEvents = lodash.groupBy(keys, w => w.replace(/[0-9]/g, ''))

      if (!groupedEvents[field]) return field
      else eventKeys = groupedEvents[field]
    } else return field

    if (field) {
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
      const lastElement = eventKeys
        .map(c => parseInt(c.replaceAll(/[^0-9]+/g, '')))
        .filter(i => i)
        .sort(collator.compare)
        .pop()
      if (status === 'end') {
        return eventKeys
          .sort(collator.compare)
          .pop()
      }

      if (lastElement) field += lastElement + 1
      else field += 1
    }
    return field
  }

  start (event, level) {
    if (typeof level !== 'number') throw new Error('Level should be a number')

    event = SimpleProfilingTool.addEventNum(Object.keys(this.checkPoints), event, 'start')
    this.checkPoints[event] = {}

    Object.defineProperty(this.checkPoints, `${event}`, {
      value: {
        start: {}
      },
      writable: true
    })
    this.checkPoints[event].start = {
      time: new Date().getTime(),
      event,
      level
    }
  }

  end (event, level) {
    if (typeof level !== 'number') throw new Error('Level should be a number')

    event = SimpleProfilingTool.addEventNum(Object.keys(this.checkPoints), event, 'end')
    this.checkPoints[event].end = {
      time: new Date().getTime(),
      event,
      level
    }
  }

  getReport () {
    if (this.nesting) {
      const groupedCheckPoints = lodash.groupBy(this.checkPoints, 'start.level')

      Object.keys(groupedCheckPoints).forEach(k => {
        groupedCheckPoints[k] = groupedCheckPoints[k].map(e => {
          if (!e?.start?.time) throw new Error(`Start checkpoint ${e.start.event} doesn't exists`)
          if (!e?.end?.time) throw new Error(`End checkpoint ${e.start.event} doesn't exists`)

          return { event: e.start.event, time: e.end.time - e.start.time }
        })
      })

      const sum = {}

      Object.keys(groupedCheckPoints).forEach((key, index) => {
        const sumTime = SimpleProfilingTool.timeConverter(groupedCheckPoints[key].reduce((acc, el) => acc += el.time, 0))
        if (index === 0) sum.total = sumTime
        sum['Level ' + key] = sumTime
        groupedCheckPoints[key] = groupedCheckPoints[key].map(({ event, time }) => ({
          event,
          time: SimpleProfilingTool.timeConverter(time)
        }))
      })

      return {
        groupedByNestingLevels: groupedCheckPoints,
        sum
      }
    } else {
      const count = {
        time: 0
      }

      Object.keys(this.checkPoints).forEach(cp => {
        if (!this.checkPoints[cp].start) throw new Error(`Start checkpoint ${cp} doesn't exists`)
        if (!this.checkPoints[cp].end) throw new Error(`End checkpoint ${cp} doesn't exists`)

        const time = this.checkPoints[cp].end.time - this.checkPoints[cp].start.time

        this.checkPoints[cp] = {
          time: SimpleProfilingTool.timeConverter(time)
        }

        count.time += time
      })

      this.checkPoints.total = {
        time: SimpleProfilingTool.timeConverter(count.time)
      }

      return this.checkPoints
    }
  }
}

module.exports = SimpleProfilingTool
