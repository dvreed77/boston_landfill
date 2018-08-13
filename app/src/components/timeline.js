import React, {Component} from 'react'
import * as d3 from 'd3'
import scrub from '../utils/scrub'

function getSizes(width) {  
  if (width < 400) {
    return {
      width,
      barHeight: 10,
      barPad: 3,
      svgPad: 20,
      showText: false,
      tickLabelFontSize: 15,
      yearLabelFontSize: 20
    }
  } else if (width >= 400) {
    return {
      width,
      barHeight: 30,
      barPad: 3,
      svgPad: 20,
      showText: true,
      tickLabelFontSize: 20,
      yearLabelFontSize: 30
    }
  } else {
    return {
      width: 400,
      barHeight: 30,
      barPad: 3,
      svgPad: 20,
      showText: true,
      tickLabelFontSize: 10,
      yearLabelFontSize: 30
    }
  }
}

export default class Timeline extends Component {

  static defaultProps = {
    width: 400,
    barHeight: 10,
    barPad: 3,
    svgPad: 20,
    showText: false,
    tickLabelFontSize: 10,
    yearLabelFontSize: 30
  }

  constructor(props) {
    super(props);
    this.draw = this.draw.bind(this)
    this.state = {
      cursorPosition: 0,
      xScale: null,
      sizes: getSizes()
    }
  }

  componentWillReceiveProps(props) {
    this.draw(props.layerData)
  }

  componentDidMount() {
    const parentWidth = this.svg.parentElement.clientWidth

    d3.select(this.svg).attr('width', parentWidth);

    const xScale = d3.scaleLinear()
      .range([0, parentWidth - 2*this.props.svgPad])

    this.setState({
      xScale,
      sizes: getSizes(parentWidth)
    })
  }

  draw(layerData) {
    const {onChange, barPad, svgPad} = this.props
    const {xScale, barHeight, sizes} = this.state
    const svg = d3.select(this.svg)

    const minYear = d3.min(layerData, d => d.years[0])

    const height = layerData.length * (sizes.barHeight + sizes.barPad) + 60

    xScale
      .domain([minYear-5, 2017])

    svg
      .attr('height', height)

    const brush = scrub()
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
      .ticks(5)
      .tickSizeOuter(6)
      .tickSizeInner(3)
      .tickPadding(8)
      .tickFormat(d3.format(""))

    svg.select('g.x.axis')
      .style("font-size", sizes.tickLabelFontSize)
      .call(xAxis);
  }

  render() {
    const {xScale, sizes} = this.state;
    const {layerData, svgPad, year,
      
    } = this.props

    const height = layerData.length * (sizes.barHeight + sizes.barPad)
    
    return (
      <div style={{flexGrow: 1}}>
        <svg ref={svg=>this.svg = svg}>
          <g transform={`translate(${sizes.svgPad}, ${sizes.svgPad})`}>
            <g className='x axis' transform={`translate(0, ${height})`}/>
            {layerData.map((zone, idx) => {
              return <rect
                key={idx}
                x={xScale(zone.years[0])}
                y={idx * (sizes.barHeight + sizes.barPad)}
                width={xScale(zone.years[1]) - xScale(zone.years[0])}
                height={sizes.barHeight}
                fill={`#${zone.color}`}
              />
            })}
            {sizes.showText && layerData.map((zone, idx) => {
              let c = d3.hsl(`#${zone.color}`)

              c.h = (c.h + 180) % 360;
              c.s = 1 - c.s
              c.l = 1 - c.l

              return <text
                key={idx}
                className={'timeline2'}
                x={xScale(zone.years[0])}
                y={idx * (sizes.barHeight + sizes.barPad)}
                dx={10}
                dy={sizes.barHeight/2 + 8}
                fontWeight={400}
                fontSize={20}
                fill={c + ""}
              >
                {zone.name.replace('_', ' ')}
              </text>
            })}
            <g transform={`translate(0, ${sizes.svgPad})`}>
              <text
                x={sizes.width-sizes.svgPad-10}
                textAnchor="end"
                fontSize={sizes.yearLabelFontSize}
              >{Math.round(year)}</text>
            </g>
            <g className="slider" />
          </g>
        </svg>


      </div>
    )
  }
}
