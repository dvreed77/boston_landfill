import React, {Component} from 'react'
import * as d3 from 'd3'

export default class GeoMap extends Component {

  constructor(props) {
    super(props);

    this.draw = this.draw.bind(this)

    this.state = {
      mapData: null
    }
  }

  componentWillMount() {

    const urls = [
      '/out.geojson',
      '/layer_data.json'
    ]

    // separate function to make code more clear
    const grabContent = url => fetch(url)
      .then(res => res.json())

    Promise
      .all(urls.map(grabContent))
      .then(([mapData, layerData]) => {

        mapData.features.forEach(f=>{

          const {layer} = f.properties

          const zone = layerData.filter(_=>{
            if (layer === 'base' && _.zone === 'base') return true
            return (+layer+1 >= _.frames[0]) && (+layer+1 <= _.frames[1])
          })

          f.properties.zone = zone[0]
        })

        this.setState({mapData}, this.draw)
      })
  }

  componentDidMount() {
    this.draw(this.state.svg)
  }

  draw() {
    const {mapData} = this.state

    console.log('MAPDATA', mapData)
    if (!mapData) return

    const year = 1906



    const svg = d3.select(this.svg)

    // const projection = d3.geoAlbers()
      const projection = d3.geoIdentity()
      .scale(1)
      .translate([0,0])

    svg
      .append('g')
      .attr('transform', 'translate(15,20)')

    const features = mapData

    features.features = features.features.sort((a,b)=>{
      if (a.properties.zone.zone === 'base') return 1
      if (b.properties.zone.zone === 'base') return -1

      return b.properties.zone.zone - a.properties.zone.zone
    })

    console.log(features.features)

    features.features.forEach(f=>{
      const {years} = f.properties.zone
      if (f.properties.zone.zone === 'base') {
        console.log('FOUND BASE')
        f.properties.color = 'green'
      } else if (year >= years[0]) {
        f.properties.color = 'orange'
      } else {
        f.properties.color = 'yellow'
      }
    })

    const path = d3.geoPath().projection(projection),
      bounds = path.bounds(features);


    const scale = .95 / Math.max((bounds[1][0] - bounds[0][0]) / 500,
      (bounds[1][1] - bounds[0][1]) / 500);
    const transl = [(500 - scale * (bounds[1][0] + bounds[0][0])) / 2,
      (500 - scale * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(scale).translate(transl);


    svg
      .selectAll("path")
      .data(features.features)
      .enter()
      .append("path")
      .attr('d', path)
      .attr('fill', d=>d.properties.color)
  }

  render() {
    return (
      <div>
        <svg width={500} height={500} ref={(svg) => { this.svg = svg}}/>
      </div>
    )
  }
}
