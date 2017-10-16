import React, {Component} from 'react'
import * as d3 from 'd3'
import scrub from '../utils/scrub'

export default class Timeline extends Component {

  static defaultProps = {
    width: 800,
    barHeight: 10,
    barPad: 3
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
    const {onChange, barHeight, barPad} = this.props
    const {xScale} = this.state
    const svg = d3.select(this.svg)

    const minYear = d3.min(layerData, d => d.years[0])
    const maxYear = d3.max(layerData, d => d.years[1])

    xScale
      .domain([minYear, maxYear])

    svg
      .attr('height', layerData.length * (barHeight + barPad))

    const brush = scrub()
      .on("brush", d => {
        if (d3.event.sourceEvent) { // not a programmatic event

          const x = d3.mouse(this.svg)[0]
          onChange(xScale.invert(x))
        }
      })

    svg.select('g.slider')
      .call(brush);
  }

  render() {
    const {xScale, cursorPosition} = this.state;
    const {layerData, width, barHeight, barPad} = this.props

    const height = layerData.length * (barHeight + barPad)

    return (
      <div>
        <svg width={width} ref={(svg) => {
          this.svg = svg
        }}>
          {layerData.map((zone, idx) => {
            return <rect
              key={idx}
              x={xScale(zone.years[0])}
              y={idx * (barHeight + barPad)}
              width={xScale(zone.years[1]) - xScale(zone.years[0])}
              height={barHeight}
              fill={'green'}
            />
          })}

          <line
            x1={cursorPosition}
            y1={0}
            x2={cursorPosition}
            y2={height}
            stroke={'black'}
            strokeWidth={2}
          />

          <g className="slider" />
        </svg>


      </div>
    )
  }
}
