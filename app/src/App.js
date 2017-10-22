import React from 'react'
import Timeline from './components/timeline'
import Map from './components/geomap'
import * as d3 from 'd3'
import Palette from "./components/palette"
import {merge, find} from 'lodash'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this)
    this.state = {
      year: 1906,
      baseLayer: {},
      landfillLayers: {},
      layerData: []
    }
  }

  componentWillMount() {
    const urls = [
      '/out_v3.geojson',
      '/layer_data.json'
    ]

    // separate function to make code more clear
    const grabContent = url => fetch(url)
      .then(res => res.json())

    Promise
      .all(urls.map(grabContent))
      .then(([mapData, layerData]) => {

        const baseLayer = {
          "type": "FeatureCollection",
          "features": mapData.features.filter(f=>f.properties.zone === 'Base')
        }

        const landfillLayers = {
          "type": "FeatureCollection",
          "features": mapData.features.filter(f=>f.properties.zone !== 'Base')
        }

        layerData.forEach(d=>d.name = d.name.replace(' ', '_'))

        console.log(layerData, baseLayer, landfillLayers)

        var entries = d3.nest()
          .key(function(d) { return d.properties.zone; })
          .entries(landfillLayers.features)
          .map(d=>({
            name: d.key,
            nFrames: d.values.length
          }));


        layerData.forEach(d=>{
          const t = find(entries, {'name': d.name})
          Object.assign(d, t)

          d.scale = d3.scaleLinear()
            .range(d.years)
            .domain([d.nFrames-1, 0])
        })

        landfillLayers.features.forEach(f=>{

          const zone = layerData.filter(_=>{
            return f.properties.zone === _.name.replace(' ', '_')
          })

          f.properties = Object.assign({}, f.properties, zone[0])

          f.properties.year = f.properties.scale(f.properties.layer_id)

          f.properties.visible = year => {
            return year > f.properties.year
          }
        })

        mapData.features = mapData.features.sort((a,b)=>{
          if (a.properties.zone.zone === 'base') return 1
          if (b.properties.zone.zone === 'base') return -1

          return b.properties.zone.zone - a.properties.zone.zone
        })

        this.setState({landfillLayers, baseLayer, layerData})
      })
  }

  onChange(year) {
    this.setState({
      year
    })
  }

  render() {
    const {year, landfillLayers, layerData, baseLayer} = this.state

    const layerData_ = layerData.filter(d=>d.zone !== 'base')

    return (
      <div className="container">
        <Timeline onChange={this.onChange} layerData={layerData_} year={year}/>
        <Map year={year} landfillLayers={landfillLayers} baseLayer={baseLayer}/>
      </div>
    );
  }
}

export default App