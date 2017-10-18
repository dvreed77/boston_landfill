import React, {Component} from 'react'
import * as d3 from 'd3'

export default class GeoMap extends Component {

  static defaultProps = {
    width: 800,
    height: 800
  }

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
    const filterFunc = f=>{
      return f.properties.zone.zone !== 'base'
    }

    const t = d3.transition()
      .delay(1000)
      .duration(750);

    const svg = d3.select(this.svg)

    svg
      .selectAll("path")
      .filter(filterFunc)
      .attr('visibility', f=>{
        return f.properties.visible(year) ? 'visible' : 'hidden'
      })
      // .data(mapData.features)
      .attr('fill', 'orange')
      // .filter(f=>f.properties.visible(year))
      // .transition(t)
      // .attr('fill', 'lightgreen')

  }

  draw(mapData) {
    const {path, projection} = this.state
    const {width, height} = this.props

    // console.log('MAPDATA', mapData)
    if (!('features' in mapData)) return

    const svg = d3.select(this.svg)

    svg
      .append('g')
      .attr('transform', 'translate(15,20)')

    // mapData.features.forEach(f=>{
    //   const {years} = f.properties.zone
    //   if (f.properties.zone.zone === 'base') {
    //     f.properties.color = 'green'
    //   } else if (year >= years[0]) {
    //     f.properties.color = 'yellow'
    //   } else {
    //     f.properties.color = 'blue'
    //   }
    // })

    const bounds = path.bounds(mapData)

    const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / width,
      (bounds[1][1] - bounds[0][1]) / height);
    const transl = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2,
      (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(scale).translate(transl);


    svg
      .selectAll("path")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr('d', path)
      .attr('visibility', d=>{
        return d.properties.zone.zone === 'base' ? 'visible' : 'hidden'
      })
      .attr('fill', d=>{
        return d.properties.zone.zone === 'base' ? 'green' : 'orange'
      })
  }

  render() {
    const {mapData, width, height} = this.props

    return (
      <div>
        <svg width={width} height={height} ref={(svg) => { this.svg = svg}}/>
      </div>
    )
  }
}
