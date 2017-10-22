import React, {Component} from 'react'
import * as d3 from 'd3'

export default class GeoMap extends Component {

  static defaultProps = {
    width: 800,
    height: 800,
    svgPad: 30
  }

  constructor(props) {
    super(props);

    this.setupBounds = this.setupBounds.bind(this)
    this.drawBase = this.drawBase.bind(this)

    this.updateYear = this.updateYear.bind(this)

    this.state = {
      mapData: null,
      projection: null,
      path: null,
      bounds: []
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
    const {baseLayer, landfillLayers} = props

    if ('features' in baseLayer && 'features' in landfillLayers) {
      const mapData = {
        "type": "FeatureCollection",
        "features": baseLayer.features.concat(landfillLayers.features)
      }
      this.setupBounds(mapData)
    }

    if ('features' in baseLayer) this.drawBase(baseLayer)
    if ('features' in landfillLayers) this.draw(landfillLayers)
  }

  componentWillUpdate(nextProps) {
    this.updateYear(nextProps.year)
  }

  setupBounds(mapData) {
    const {path, projection} = this.state
    const {width, height} = this.props

    const bounds = path.bounds(mapData)

    const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / width,
      (bounds[1][1] - bounds[0][1]) / height);
    const transl = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2,
      (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(scale).translate(transl);

    this.setState({
      projection
    })
  }

  updateYear(year) {
    const t = d3.transition()
      .delay(1000)
      .duration(750);

    const svg = d3.select(this.svg)

    svg
      .selectAll("path.layer")
      .attr('visibility', f=>{
        return f.properties.visible(year) ? 'visible' : 'hidden'
      })
  }

  draw(mapData) {
    const {path, projection} = this.state
    const {width, height} = this.props

    if (!('features' in mapData)) return

    const svg = d3.select(this.svg).select('g.layer')

    svg
      .selectAll("path.layer")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr('class', 'layer')
      .attr('d', path)
      .attr('fill', f=>{
        let c = d3.hsl(`#${f.properties.color}`)

        c.h = (c.h + 2*f.properties.layer_id) % 360;
        c.l -= (c.l - 0)*f.properties.layer_id/f.properties.nFrames/5

        return c + ""
      })
  }

  drawBase(mapData) {
    const {path} = this.state

    if (!('features' in mapData)) return

    const svg = d3.select(this.svg).select('g.base-layer')

    const baseColor = 'green'
    let fill = d3.hsl(baseColor)
    let strokeColor = d3.hsl(baseColor)

    strokeColor.s += 0.6

    svg
      .selectAll("path.base-layer")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr('class', 'base-layer')
      .attr('d', path)
      .attr('fill', fill + "")
      .attr('stroke', strokeColor + "")
      .attr('stroke-width', 2)
  }

  render() {
    const {width, height, svgPad} = this.props

    return (
      <div>
        <svg width={width+2*svgPad} height={height+2*svgPad} ref={(svg) => { this.svg = svg}}>
          <defs>
            <clipPath id="myClip">
              <rect x={0} y={1} width={width} height={height-2}/>
            </clipPath>
          </defs>
          <g transform={`translate(${svgPad}, ${svgPad})`}>
            <image href="/boston_sat.png" x={-276} y={-266} width={800/996.3*1703.685} clipPath="url(#myClip)"/>
            <g className="layer" />
            <g className="base-layer" />
          </g>
        </svg>
      </div>
    )
  }
}
