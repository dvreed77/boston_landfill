import React, {Component} from 'react'
import * as d3 from 'd3'
import scrub from '../utils/scrub'

export default class Timeline extends Component {

  static defaultProps = {
    width: 400,
    barHeight: 20,
    barPad: 3,
    svgPad: 30
  }

  constructor(props) {
    super(props);

    this.draw = this.draw.bind(this)
    // this.setScale = this.setScale.bind(this)

    

    this.state = {
      cursorPosition: 0,
      xScale: null
    }
  }

  componentWillReceiveProps(props) {
    this.draw(props.layerData)
  }

  componentDidMount() {

    const svgwidth = this.svg.parentElement.clientWidth

    d3.select(this.svg).attr('width', svgwidth);

    const xScale = d3.scaleLinear()
      .range([0, svgwidth - 2*30])

    this.setState({
      xScale
    })
  }

  draw(layerData) {
    const {onChange, barHeight, barPad, svgPad} = this.props
    const {xScale} = this.state
    const svg = d3.select(this.svg)

    
    // width = svgwidth - padding.left - padding.right


    

    // xScale.range([0, svgwidth-60])

    const minYear = d3.min(layerData, d => d.years[0])

    const height = layerData.length * (barHeight + barPad) + 2*svgPad

    xScale
      .domain([minYear-5, 2017])

    svg
      .attr('height', height)

    const brush = scrub()
      // .extent([0, width])
      .on("brush", d => {
        if (d3.event.sourceEvent) { // not a programmatic event
          //TODO: major hack here to get it to line up
          const x = d3.mouse(this.svg)[0]-svgPad
          onChange(xScale.invert(x))
        }
      })

    svg.select('g.slider')
      .call(brush)

    const xAxis = d3.axisBottom(xScale)
      .tickSizeOuter(6)
      .tickSizeInner(3)
      .tickPadding(8)
      .tickFormat(d3.format(""))

    svg.select('g.x.axis')
      .call(xAxis);
  }

  render() {
    const {xScale} = this.state;
    const {layerData, width, barHeight, barPad, svgPad, year} = this.props

    const height = layerData.length * (barHeight + barPad)

    return (
      <div style={{flexGrow: 1}}>
        <svg ref={svg=>this.svg = svg}>
          <g transform={`translate(${svgPad}, ${svgPad})`}>
            <g className='x axis' transform={`translate(0, ${height})`}/>
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
            <g transform={`translate(0, 40)`}>
              <text
                x={width-20}
                textAnchor="end"
                fontSize={50}
              >{Math.round(year)}</text>
            </g>
            <g className="slider" />
          </g>
        </svg>


      </div>
    )
  }
}
