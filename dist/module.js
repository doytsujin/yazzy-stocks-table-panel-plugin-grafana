'use strict';

System.register(['lodash', 'app/core/utils/kbn', 'app/core/utils/file_export', 'app/plugins/sdk', './util/builder', './util/sorter', './util/exporter'], function (_export, _context) {
  "use strict";

  var _, kbn, fileExport, MetricsPanelCtrl, Builder, Sorter, Exporter, _createClass, panelDefaults, Ctrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreUtilsFile_export) {
      fileExport = _appCoreUtilsFile_export;
    }, function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_utilBuilder) {
      Builder = _utilBuilder.Builder;
    }, function (_utilSorter) {
      Sorter = _utilSorter.Sorter;
    }, function (_utilExporter) {
      Exporter = _utilExporter.Exporter;
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

      panelDefaults = {
        defaultColor: 'rgb(117, 117, 117)',
        decimals: 2,
        nameComponentsRows: '1,2',
        nameComponentsColumns: '3,4',
        globalFormat: 'none',
        globalDecimals: 0,
        rowspec: [],
        sortColumn: -1,
        // sortRow: -1,
        sortMultiplier: 1,
        topLeftLabel: 'Name'
      };

      _export('PanelCtrl', Ctrl = function (_MetricsPanelCtrl) {
        _inherits(Ctrl, _MetricsPanelCtrl);

        function Ctrl($scope, $injector) {
          _classCallCheck(this, Ctrl);

          var _this = _possibleConstructorReturn(this, (Ctrl.__proto__ || Object.getPrototypeOf(Ctrl)).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_this));

          _this.builder = new Builder(_this.panel);
          _this.sorter = new Sorter(_this.panel);
          _this.exporter = new Exporter(_this.panel.rowspec); // TODO
          _this.rows = [];
          return _this;
        }

        _createClass(Ctrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/yazzy-stocks-table-panel/editor.html');
            this.unitFormats = kbn.getUnitFormats();
            this.rowNames = this.builder.getRowNames(this.seriesList); // TODO
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(seriesList) {
            this.seriesList = seriesList;
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.cols = this.builder.cols(this.seriesList);
            this.rows = this.builder.call(this.seriesList, this.cols);
            this.rows = this.sorter.sort(this.rows);
          }
        }, {
          key: 'getOpt',
          value: function getOpt(opt) {
            return this.builder.options[opt];
          }
        }, {
          key: 'onInitPanelActions',
          value: function onInitPanelActions(actions) {
            actions.push({ text: 'Export CSV', click: 'ctrl.exportCSV()' });
          }
        }, {
          key: 'onEditorAddRowspecClick',
          value: function onEditorAddRowspecClick() {
            this.panel.rowspec.push({ match: '/.*/', format: 'none', higherBetter: false, decimals: 2 });
            this.render();
          }
        }, {
          key: 'onEditorRemoveRowspecClick',
          value: function onEditorRemoveRowspecClick(index) {
            this.panel.rowspec.splice(index, 1);
            this.render();
          }
        }, {
          key: 'onEditorFormatSelect',
          value: function onEditorFormatSelect(format, rowspec) {
            rowspec.format = format.value;
            this.render();
          }
        }, {
          key: 'onEditorGlobalFormatSelect',
          value: function onEditorGlobalFormatSelect(format) {
            this.panel.globalFormat = format.value;
            this.render();
          }
        }, {
          key: 'onColumnClick',
          value: function onColumnClick(index) {
            this.sorter.toggle(index);
            this.render();
          }
        }, {
          key: 'onRowClick',
          value: function onRowClick(index) {
            // TODO sort row
          }
        }, {
          key: 'getCellSpec',
          value: function getCellSpec(colindex, row) {
            for (var i = 0; i < this.panel.rowspec.length; i++) {
              var rowspec = this.panel.rowspec[i];
              if (rowspec.match[0] === '/' && row.name.match(new RegExp(rowspec.match.slice(1, -1))) || rowspec.match === row.name) {
                return rowspec;
              }
            }
            return null;
          }
        }, {
          key: 'format',
          value: function format(value, colindex, row) {
            var format = this.panel.globalFormat;
            var decimals = this.panel.globalDecimals;
            var spec = this.getCellSpec(colindex, row);
            if (spec !== null) {
              format = spec.format;
              decimals = spec.decimals;
            }
            return kbn.valueFormats[format](value, decimals, null);
            // TODO time duration decimals
          }
        }, {
          key: 'sortIcon',
          value: function sortIcon(index) {
            return this.sorter.icon(index);
          }
        }, {
          key: 'exportCSV',
          value: function exportCSV() {
            fileExport.saveSaveBlob(this.exporter.call(this.rows), 'grafana_data_export');
          }
        }, {
          key: 'trendColor',
          value: function trendColor(trend, isMini, row) {
            var c;
            var spec = this.getCellSpec(-1 /* TODO colindex */, row);
            var higherBetter = false;
            if (spec !== null) {
              higherBetter = spec.higherBetter;
            }

            if (higherBetter && trend < 0 || !higherBetter && trend > 0) {
              if (isMini) {
                c = 'darkred';
              } else {
                c = 'red';
              }
            } else if (higherBetter && trend > 0 || !higherBetter && trend < 0) {
              if (isMini) {
                c = 'green';
              } else {
                c = 'lime';
              }
            } else {
              if (isMini) {
                c = 'transparent';
              } else {
                // c = 'dimgray'
                c = 'darkcyan';
              }
            }
            return c;
          }
        }, {
          key: 'trendIcon',
          value: function trendIcon(val, trend, isMini) {
            var s = '';
            if (val == null) {
              if (isMini) {
                s = '◆';
              }
            } else {
              if (trend < 0) {
                s = '▼';
              } else if (trend > 0) {
                s = '▲';
              } else {
                s = '◼';
              }
            }
            return s;
          }
        }]);

        return Ctrl;
      }(MetricsPanelCtrl));

      Ctrl.templateUrl = 'module.html';

      _export('PanelCtrl', Ctrl);
    }
  };
});
//# sourceMappingURL=module.js.map
