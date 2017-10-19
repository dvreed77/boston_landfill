import React, {Component} from 'react'
import * as d3 from 'd3'
import {interpolateSpectral} from 'd3-scale-chromatic'
import scrub from '../utils/scrub'

export default class Palette extends Component {

  static defaultProps = {
    nColors: 10,
    rectWidth: 40
  }

  constructor(props) {
    super(props);

    this.draw = this.draw.bind(this)

    const xScale = d3.scaleLinear()
      .range([0, props.width])

    this.state = {
      cursorPosition: 0,
      xScale
    }
  }

  componentWillReceiveProps(props) {
    this.draw()
  }

  draw(layerData) {
    const {nColors, rectWidth} = this.props

    // var blues = d3.scaleOrdinal(interpolateSpectral[nColors]);


    var piyg = d3.scaleSequential(interpolateSpectral)
      .domain([0, nColors])

    console.log(piyg(10))


    const svg = d3.select(this.svg)

    svg
      .attr('width', nColors*rectWidth)
      .attr('height', rectWidth)

    svg
      .selectAll('rect.swatch')
      .data(d3.range(nColors))
      .enter()
      .append('rect')
      .attr('class', 'swatch')
      .attr('x', d=>d*rectWidth)
      .attr('y', 'swatch')
      .attr('width', rectWidth)
      .attr('height', rectWidth)
      .attr('fill', d=>piyg(d))




  }

  render() {
    return (
      <div>
        <svg ref={(svg) => {this.svg = svg}} />
      </div>
    )
  }
}
