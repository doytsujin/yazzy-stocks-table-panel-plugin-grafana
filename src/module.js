import _ from 'lodash'
import kbn from 'app/core/utils/kbn'
import * as fileExport from 'app/core/utils/file_export'
import {MetricsPanelCtrl} from 'app/plugins/sdk'
import {Builder} from './util/builder'
import {Sorter} from './util/sorter'
import {Exporter} from './util/exporter'

const panelDefaults = {
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
}

class Ctrl extends MetricsPanelCtrl {
  constructor ($scope, $injector) {
    super($scope, $injector)
    _.defaults(this.panel, panelDefaults)

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this))
    this.events.on('data-received', this.onDataReceived.bind(this))
    this.events.on('render', this.onRender.bind(this))
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this))

    this.builder = new Builder(this.panel)
    this.sorter = new Sorter(this.panel)
    this.exporter = new Exporter(this.panel.rowspec) // TODO
    this.rows = []
  }

  onInitEditMode () {
    this.addEditorTab('Options', 'public/plugins/yazzy-stocks-table-panel/editor.html')
    this.unitFormats = kbn.getUnitFormats()
    this.rowNames = this.builder.getRowNames(this.seriesList) // TODO
  }

  onDataReceived (seriesList) {
    this.seriesList = seriesList
    this.render()
  }

  onRender () {
    this.cols = this.builder.cols(this.seriesList)
    this.rows = this.builder.call(this.seriesList, this.cols)
    this.rows = this.sorter.sort(this.rows)
  }

  getOpt (opt) {
    return this.builder.options[opt]
  }

  onInitPanelActions (actions) {
    actions.push({text: 'Export CSV', click: 'ctrl.exportCSV()'})
  }

  onEditorAddRowspecClick () {
    this.panel.rowspec.push({ match: '/.*/', format: 'none', higherBetter: false, decimals: 2 })
    this.render()
  }

  onEditorRemoveRowspecClick (index) {
    this.panel.rowspec.splice(index, 1)
    this.render()
  }

  onEditorFormatSelect (format, rowspec) {
    rowspec.format = format.value
    this.render()
  }

  onEditorGlobalFormatSelect (format) {
    this.panel.globalFormat = format.value
    this.render()
  }

  onColumnClick (index) {
    this.sorter.toggle(index)
    this.render()
  }

  onRowClick (index) {
    // TODO sort row
  }

  getCellSpec (colindex, row) {
    for (var i = 0; i < this.panel.rowspec.length; i++) {
      var rowspec = this.panel.rowspec[i]
      if ((rowspec.match[0] === '/' && row.name.match(new RegExp(rowspec.match.slice(1, -1)))) || (rowspec.match === row.name)) {
        return rowspec
      }
    }
    return null
  }

  format (value, colindex, row) {
    var format = this.panel.globalFormat
    var decimals = this.panel.globalDecimals
    var spec = this.getCellSpec(colindex, row)
    if (spec !== null) {
      format = spec.format
      decimals = spec.decimals
    }
    return kbn.valueFormats[format](value, decimals, null)
    // TODO time duration decimals
  }

  sortIcon (index) {
    return this.sorter.icon(index)
  }

  exportCSV () {
    fileExport.saveSaveBlob(this.exporter.call(this.rows), 'grafana_data_export')
  }

  trendColor (trend, isMini, row) {
    var c
    var spec = this.getCellSpec(-1 /* TODO colindex */, row)
    var higherBetter = false
    if (spec !== null) {
      higherBetter = spec.higherBetter
    }

    if ((higherBetter && trend < 0) || (!higherBetter && trend > 0)) {
      if (isMini) {
        c = 'darkred'
      } else {
        c = 'red'
      }
    } else if ((higherBetter && trend > 0) || (!higherBetter && trend < 0)) {
      if (isMini) {
        c = 'green'
      } else {
        c = 'lime'
      }
    } else {
      if (isMini) {
        c = 'transparent'
      } else {
        // c = 'dimgray'
        c = 'darkcyan'
      }
    }
    return c
  }

  trendIcon (val, trend, isMini) {
    var s = ''
    if (val == null) {
      if (isMini) {
        s = '◆'
      }
    } else {
      if (trend < 0) {
        s = '▼'
      } else if (trend > 0) {
        s = '▲'
      } else {
        s = '◼'
      }
    }
    return s
  }
}

Ctrl.templateUrl = 'module.html'
export { Ctrl as PanelCtrl }
