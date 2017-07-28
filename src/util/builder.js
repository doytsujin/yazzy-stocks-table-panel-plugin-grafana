import _ from 'lodash'

export class Builder {
  constructor (options) {
    this.options = options
  }

  call (seriesList = [], cols = []) {
    var groupedSeries = _.groupBy(seriesList, _.bind(this._shortName, this))
    /*
      {airflow-temperature-cel:[0:{datapoints:[],target:'node.alpha.smart.SAMSUNG_S07GJ10Y768586.airflow-temperature-cel.raw'},1:{}],command-timeout:[],}
    */

    return _.map(groupedSeries, (rowSeries, shortName) => {
      return { name: shortName, cells: this._cellsFor(rowSeries, cols) }
    })
  }

  _shortName (series) {
    var rowsNameComponents = this.options.nameComponentsRows.split(',')
    var components = series.target.split('.')
    return _.map(rowsNameComponents, (nc) => components[parseInt(nc)]).join('.').replace(/^\./, '').replace(/\.$/, '')
  }

  cols (seriesList = []) {
    /*
      [0:{datapoints:[],target:'node.alpha.smart.SAMSUNG_S07GJ10Y768586.airflow-temperature-cel.raw'},1:{}]
    */
    var columnsNameComponents = this.options.nameComponentsColumns.split(',')
    var columns = _.map(seriesList, (series) => {
      var components = series.target.split('.')
      return _.map(columnsNameComponents, (nc) => components[parseInt(nc)]).join('.').replace(/^\./, '').replace(/\.$/, '')
    })
    columns = Array.from(new Set(columns))
    return _.map(columns, (label) => {
      var nodes = []
      var components = label.split('.')
      for (var i = 0; i < columnsNameComponents.length; i++) {
        nodes.push({n: columnsNameComponents[i], v: components[i]})
      }
      return {
        nodes: nodes,
        name: label
      }
    })
  }

  getRowNames (seriesList = []) {
    var rowsNameComponents = this.options.nameComponentsRows.split(',')
    var names = _.map(seriesList, (series) => {
      var components = series.target.split('.')
      return _.map(rowsNameComponents, (nc) => components[parseInt(nc)]).join('.').replace(/^\./, '').replace(/\.$/, '')
    })
    return Array.from(new Set(names))
  }

  _cellsFor (rowSeriesList, cols) {
    return _.map(cols, (col) => {
      var columnSeries = _.filter(rowSeriesList, (rowSeries) => {
        var components = rowSeries.target.split('.')
        var match = true
        for (var i = 0; i < col.nodes.length; i++) {
          var nc = col.nodes[i].n
          if (components[nc] !== col.nodes[i].v) {
            match = false
            break
          }
        }
        return match
      })
      return this._trendForColumn(columnSeries)
    })
  }

  _trendForColumn (seriesList) {
    var trends = seriesList.map((series) => this._trendPoint(series.datapoints))
    return trends.length > 0 ? trends[0] : [null, null, null, null, null]
  }

  _trendPoint (points) {
    var basePoint
    var trendPoint
    points = _.filter(points, point => point[0] != null)
    if (points.length === 0) return [null, null, null, null, null]
    // sort by timestamp
    points.sort((a, b) => a[1] - b[1])
    basePoint = points[0]
    // we are interested in the last point
    trendPoint = points[points.length - 1]
    // save trending sign in [2]
    trendPoint[2] = Math.sign(trendPoint[0] - basePoint[0])

    if (trendPoint[2] < 0) {
      trendPoint[3] = Math.sign(points.filter((e) => e[0] < trendPoint[0]).length)
      trendPoint[4] = Math.sign(points.filter((e) => e[0] > basePoint[0]).length)
    } else if (trendPoint[2] > 0) {
      trendPoint[3] = Math.sign(points.filter((e) => e[0] < basePoint[0]).length)
      trendPoint[4] = Math.sign(points.filter((e) => e[0] > trendPoint[0]).length)
    } else {
      trendPoint[3] = Math.sign(points.filter((e) => e[0] < basePoint[0]).length)
      trendPoint[4] = Math.sign(points.filter((e) => e[0] > basePoint[0]).length)
    }
    return trendPoint
  }
}
