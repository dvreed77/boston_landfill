import React, {Component} from 'react'
import * as d3 from 'd3'
import scrub from '../utils/scrub'

export default class Timeline extends Component {

  static defaultProps = {
    width: 800,
    barHeight: 30,
    barPad: 3,
    svgPad: 30
  }

  constructor(props) {
    super(props);

    this.draw = this.draw.bind(this)
    // this.setScale = this.setScale.bind(this)

    const xScale = d3.scaleLinear()
      .range([0, props.width])

    this.state = {
      cursorPosition: 0,
      xScale
    }
  }

  componentWillReceiveProps(props) {
    this.draw(props.layerData)
  }

  draw(layerData) {
    const {onChange, barHeight, barPad, svgPad, width} = this.props
    const {xScale} = this.state
    const svg = d3.select(this.svg)

    const minYear = d3.min(layerData, d => d.years[0])
    const maxYear = d3.max(layerData, d => d.years[1])

    xScale
      .domain([minYear, maxYear])

    svg
      .attr('height', layerData.length * (barHeight + barPad) + 2*svgPad)

    const brush = scrub()
      // .extent([0, width])
      .on("brush", d => {
        if (d3.event.sourceEvent) { // not a programmatic event
          const x = d3.mouse(this.svg)[0]
          onChange(xScale.invert(x))
        }
      })

    svg.select('g.slider')
      .call(brush)

    const xAxis = d3.axisBottom(xScale)
      .tickSize(3)
      .tickPadding(8)
      .tickFormat(d3.format(""))

    svg.select('g.x.axis')
      .call(xAxis);
  }

  render() {
    const {xScale, cursorPosition} = this.state;
    const {layerData, width, barHeight, barPad, svgPad} = this.props

    const height = layerData.length * (barHeight + barPad)

    return (
      <div>
        <svg width={width + 2*svgPad} ref={svg=>this.svg = svg}>
          <g transform={`translate(${svgPad}, ${svgPad})`}>
            {layerData.map((zone, idx) => {
              return <rect
                key={idx}
                x={xScale(zone.years[0])}
                y={idx * (barHeight + barPad)}
                width={xScale(zone.years[1]) - xScale(zone.years[0])}
                height={barHeight}
                fill={`#${zone.color}`}
              />
            })}
            {layerData.map((zone, idx) => {
              let c = d3.hsl(`#${zone.color}`)

              c.h = (c.h + 180) % 360;
              c.s = 1 - c.s
              c.l = 1 - c.l

              return <text
                key={idx}
                className={'timeline2'}
                x={xScale(zone.years[0])}
                y={idx * (barHeight + barPad)}
                dx={10}
                dy={barHeight/2 + 8}
                fontWeight={400}
                fontSize={20}
                fill={c + ""}
              >
                {zone.name.replace('_', ' ')}
              </text>
            })}
            <g className='x axis' transform={`translate(0, ${height})`}/>
            <g className="slider" />
          </g>
        </svg>


      </div>
    )
  }
}
