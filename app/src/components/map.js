import React, {Component} from 'react'
import * as d3 from 'd3'

export default class App2 extends Component {

  state = {
    cursorPosition: 0,
  }

  componentDidMount() {
    this.draw(this.svg)
  }

  draw(ref) {

    if (!ref) return

    const svg = d3.select(ref)

    // const projection = d3.geoAlbers()
      const projection = d3.geoIdentity()
      .scale(1)
      .translate([0,0])

    svg
      .append('g')
      .attr('transform', 'translate(15,20)')

    const features = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {"layer": 5, "region": "logan_airport"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [0,0], [10,0], [12,10], [2,10], [0,0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": {"layer": 5, "region": "logan_airport"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [0,15], [5,15], [5,20], [0,20], [0,15]
            ]]
          }
        }
      ]
    }

    // d3.geoPath()
    const path = d3.geoPath().projection(projection);
    const bounds = path.bounds(features);


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

  }

  render() {
    return (
      <div>
        <svg width={500} height={500} ref={(svg) => { this.svg = svg }}/>
      </div>
    )
  }
}
