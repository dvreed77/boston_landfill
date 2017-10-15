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

        console.log(mapData, layerData)

        this.setState({mapData}, this.draw)
      })


      //
      //   fetch('/out.geojson')
      // .then(d=>d.json())
      // .then(d=>{
      //   this.setState({mapData:d}, this.draw)
      // })
  }

  componentDidMount() {
    this.draw(this.state.svg)
  }

  draw() {
    const {mapData} = this.state

    console.log('MAPDATA', mapData)
    if (!mapData) return

    const svg = d3.select(this.svg)

    // const projection = d3.geoAlbers()
      const projection = d3.geoIdentity()
      .scale(1)
      .translate([0,0])

    svg
      .append('g')
      .attr('transform', 'translate(15,20)')

    const features = mapData

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



  }

  render() {
    return (
      <div>
        <svg width={500} height={500} ref={(svg) => { this.svg = svg}}/>
      </div>
    )
  }
}
