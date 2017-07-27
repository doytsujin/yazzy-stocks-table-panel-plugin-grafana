'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, Builder;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('Builder', Builder = function () {
        function Builder(options) {
          _classCallCheck(this, Builder);

          this.options = options;
        }

        _createClass(Builder, [{
          key: 'call',
          value: function call() {
            var _this = this;

            var seriesList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var cols = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var groupedSeries = _.groupBy(seriesList, _.bind(this._shortName, this));
            /*
              {airflow-temperature-cel:[0:{datapoints:[],target:'node.alpha.smart.SAMSUNG_S07GJ10Y768586.airflow-temperature-cel.raw'},1:{}],command-timeout:[],}
            */

            return _.map(groupedSeries, function (rowSeries, shortName) {
              return { name: shortName, cells: _this._cellsFor(rowSeries, cols) };
            });
          }
        }, {
          key: '_shortName',
          value: function _shortName(series) {
            var rowsNameComponents = this.options.nameComponentsRows.split(',');
            var components = series.target.split('.');
            return _.map(rowsNameComponents, function (nc) {
              return components[parseInt(nc)];
            }).join('.');
          }
        }, {
          key: 'cols',
          value: function cols() {
            var seriesList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            /*
              [0:{datapoints:[],target:'node.alpha.smart.SAMSUNG_S07GJ10Y768586.airflow-temperature-cel.raw'},1:{}]
            */
            var columnsNameComponents = this.options.nameComponentsColumns.split(',');
            var columns = _.map(seriesList, function (series) {
              var components = series.target.split('.');
              return _.map(columnsNameComponents, function (nc) {
                return components[parseInt(nc)];
              }).join('.');
            });
            columns = Array.from(new Set(columns));
            return _.map(columns, function (label) {
              var nodes = [];
              var components = label.split('.');
              for (var i = 0; i < columnsNameComponents.length; i++) {
                nodes.push({ n: columnsNameComponents[i], v: components[i] });
              }
              return {
                nodes: nodes,
                name: label
              };
            });
          }
        }, {
          key: 'getRowNames',
          value: function getRowNames() {
            var seriesList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var rowsNameComponents = this.options.nameComponentsRows.split(',');
            var names = _.map(seriesList, function (series) {
              var components = series.target.split('.');
              return _.map(rowsNameComponents, function (nc) {
                return components[parseInt(nc)];
              }).join('.');
            });
            return Array.from(new Set(names));
          }
        }, {
          key: '_cellsFor',
          value: function _cellsFor(rowSeriesList, cols) {
            var _this2 = this;

            return _.map(cols, function (col) {
              var columnSeries = _.filter(rowSeriesList, function (rowSeries) {
                var components = rowSeries.target.split('.');
                var match = true;
                for (var i = 0; i < col.nodes.length; i++) {
                  var nc = col.nodes[i].n;
                  if (components[nc] !== col.nodes[i].v) {
                    match = false;
                    break;
                  }
                }
                return match;
              });
              return _this2._trendForColumn(columnSeries);
            });
          }
        }, {
          key: '_trendForColumn',
          value: function _trendForColumn(seriesList) {
            var _this3 = this;

            var trends = seriesList.map(function (series) {
              return _this3._trendPoint(series.datapoints);
            });
            return trends.length > 0 ? trends[0] : [null, null, null, null, null];
          }
        }, {
          key: '_trendPoint',
          value: function _trendPoint(points) {
            var basePoint;
            var trendPoint;
            points = _.filter(points, function (point) {
              return point[0] != null;
            });
            if (points.length === 0) return [null, null, null, null, null];
            // sort by timestamp
            points.sort(function (a, b) {
              return a[1] - b[1];
            });
            basePoint = points[0];
            // we are interested in the last point
            trendPoint = points[points.length - 1];
            // save trending sign in [2]
            trendPoint[2] = Math.sign(trendPoint[0] - basePoint[0]);

            if (trendPoint[2] < 0) {
              trendPoint[3] = Math.sign(points.filter(function (e) {
                return e[0] < trendPoint[0];
              }).length);
              trendPoint[4] = Math.sign(points.filter(function (e) {
                return e[0] > basePoint[0];
              }).length);
            } else if (trendPoint[2] > 0) {
              trendPoint[3] = Math.sign(points.filter(function (e) {
                return e[0] < basePoint[0];
              }).length);
              trendPoint[4] = Math.sign(points.filter(function (e) {
                return e[0] > trendPoint[0];
              }).length);
            } else {
              trendPoint[3] = Math.sign(points.filter(function (e) {
                return e[0] < basePoint[0];
              }).length);
              trendPoint[4] = Math.sign(points.filter(function (e) {
                return e[0] > basePoint[0];
              }).length);
            }
            return trendPoint;
          }
        }]);

        return Builder;
      }());

      _export('Builder', Builder);
    }
  };
});
//# sourceMappingURL=builder.js.map
