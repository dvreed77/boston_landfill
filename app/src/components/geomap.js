import React, {Component} from 'react'
import * as d3 from 'd3'

export default class GeoMap extends Component {

  constructor(props) {
    super(props);

    this.draw = this.draw.bind(this)
    this.updateYear = this.updateYear.bind(this)

    this.state = {
      mapData: null,
      projection: null,
      path: null
    }
  }

  componentWillMount() {
    const projection = d3.geoIdentity()
      .scale(1)
      .translate([0,0])

    this.setState({
      projection,
      path: d3.geoPath().projection(projection)
    })
  }

  componentWillReceiveProps(props) {
    const {mapData} = this.props

    if ('features' in mapData) this.draw(mapData)
  }

  componentWillUpdate(nextProps) {
    const {mapData, year} = nextProps
    // if ('features' in mapData) this.draw(mapData)
    if (mapData !== this.props.mapData) this.draw(mapData)

    if (year !== this.props.year) this.updateYear(year)
  }

  updateYear(year) {
    const {mapData} = this.props

    mapData.features.forEach(f=>{
      const {years} = f.properties.zone
      if (f.properties.zone.zone === 'base') {
        f.properties.color = 'green'
      } else if (year >= years[0]) {
        f.properties.color = 'orange'
      } else {
        f.properties.color = 'yellow'
      }
    })

    const svg = d3.select(this.svg)

    svg
      .selectAll("path")
      .data(mapData.features)
      .attr('fill', d=>d.properties.color)

  }

  draw(mapData) {
    const {path, projection} = this.state
    const {year} = this.props

    // console.log('MAPDATA', mapData)
    if (!('features' in mapData)) return

    const svg = d3.select(this.svg)

    svg
      .append('g')
      .attr('transform', 'translate(15,20)')

    mapData.features.forEach(f=>{
      const {years} = f.properties.zone
      if (f.properties.zone.zone === 'base') {
        f.properties.color = 'green'
      } else if (year >= years[0]) {
        f.properties.color = 'orange'
      } else {
        f.properties.color = 'yellow'
      }
    })

    const bounds = path.bounds(mapData)

    const scale = .95 / Math.max((bounds[1][0] - bounds[0][0]) / 500,
      (bounds[1][1] - bounds[0][1]) / 500);
    const transl = [(500 - scale * (bounds[1][0] + bounds[0][0])) / 2,
      (500 - scale * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(scale).translate(transl);


    svg
      .selectAll("path")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr('d', path)
      .attr('fill', d=>d.properties.color)
  }

  render() {
    const {mapData} = this.props

    // console.log('RNEDER', mapData)
    return (
      <div>
        <svg width={500} height={500} ref={(svg) => { this.svg = svg}}/>
      </div>
    )
  }
}
