import React, {Component} from 'react'
import * as d3 from 'd3'


function getSizes(width) {  
  if (width < 400) {
    return {
      width,
      relax: 70,
      labelFontSize: 20,
      padding: 0
    }
  } else if (width >= 400) {
    return {
      width,
      relax: 90,
      labelFontSize: 25,
      padding: 0
    }
  } else {
    return {
      width,
      relax: 120,
      labelFontSize: 20,
      padding: 0
    }
  }
}


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function relax(nodes, spacing=120, n=0) {
  let again = false;

  if (n > 100) return
  nodes.forEach(n1 => {
    nodes.forEach(n2 => {
      if (n1 === n2) return
      const dx = (n2.cx - n1.cx),
        dy = (n2.cy - n1.cy),
        dd = Math.sqrt(dx*dx + dy*dy)
      if (dd < spacing) {
        again = true

        // console.log(n1.name, n2.name, dd)

        const dd1 = spacing - dd + 10,
          dx1 = dx*dd1/dd,
          dy1 = dy*dd1/dd

        n2.cx += dx1/2
        n1.cx -= dx1/2

        n2.cy += dy1/2
        n1.cy -= dy1/2
      }
    })
  })

  // Adjust our line leaders here
  // so that they follow the labels.
  if(again) {
    relax(nodes, spacing, n+1)
  //   setTimeout(()=>relax(nodes, spacing, n+1),1000)
  }
}

export default class GeoMap extends Component {

  static defaultProps = {
    width: 400,
    height: 400,
    svgPad: 30,
    labelFontSize: 18
  }

  constructor(props) {
    super(props);

    this.setupBounds = this.setupBounds.bind(this)
    this.drawBase = this.drawBase.bind(this)
    this.drawPoints = this.drawPoints.bind(this)


    this.updateYear = this.updateYear.bind(this)

    this.state = {
      mapData: null,
      projection: null,
      path: null,
      bounds: [],
      namePts: [],
      sizes: getSizes()
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

  componentDidMount() {
    const {sizes} = this.state
    const svgwidth = this.svg.parentElement.clientWidth

    d3.select(this.svg)
    .attr('width', svgwidth)
    .attr('height', svgwidth)

    this.setState({
      width: svgwidth - 2*sizes.padding,
      height: svgwidth - 2*sizes.padding,
      sizes: getSizes(svgwidth)
    })
  }

  componentWillReceiveProps(props) {
    const {baseLayer, landfillLayers} = props

    if (baseLayer === this.props.baseLayer && landfillLayers === this.props.landfillLayers) return

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

  componentWillUpdate(nextProps, nextState) {
    this.updateYear(nextProps.year)

    if (nextState.namePts.length) this.drawPoints(nextState.namePts)
  }

  setupBounds(mapData) {
    const {path, projection} = this.state
    const {width, height, sizes} = this.state

    const bounds = path.bounds(mapData)

    const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / width,
      (bounds[1][1] - bounds[0][1]) / height);
    const transl = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2,
      (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(scale).translate(transl);

    const center = {
      cx: (bounds[1][0]+bounds[0][0])/2 * scale,
      cy: (bounds[1][1]+bounds[0][1])/2 * scale
    }

    console.log(center)


    const namePts = d3.nest()
      .key(function(d) { return d.properties.name; })
      .entries(mapData.features)
      .map(d=>{
        const bounds = path.bounds({
          "type": "FeatureCollection",
          "features": d.values
        })

        const namePt = {
          name: d.key,
          cx: (bounds[1][0]+bounds[0][0])/2,
          cy: (bounds[1][1]+bounds[0][1])/2
        }

        return namePt
      })
      .filter(d=>d.name !== 'undefined')


    relax(namePts, sizes.relax)

    this.setState({
      projection,
      namePts
    })
  }

  updateYear(year) {
    const svg = d3.select(this.svg)

    svg
      .selectAll("path.layer")
      .attr('visibility', f=>{
        return f.properties.visible(year) ? 'visible' : 'hidden'
      })
  }

  draw(mapData) {
    const {path, namePts} = this.state
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

    const svg = d3.select(this.svg)

    const baseColor = 'green'
    let fill = d3.hsl(baseColor)
    let strokeColor = d3.hsl(baseColor)

    strokeColor.s += 0.6

    svg
      .select('g.base-layer')
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

  drawPoints(namePts) {
    const {labelFontSize} = this.props
    const {sizes} = this.state

    const svg = d3.select(this.svg)

    const textStyle = {
      fontSize: sizes.labelFontSize,
      fontWeight: 500
    }

    svg
      .select('g.points-layer')
      .selectAll('g.name-pts.bg')
      .data(namePts)
      .enter()
      .append('g')
      .attr('class', 'name-pts bg')
      .attr('transform', d=>`translate(${d.cx}, ${d.cy})`)
      .append('text')
      .attr('font-size', textStyle.fontSize)
      .attr('font-weight', textStyle.fontWeight)
      .attr('fill', 'white')
      .attr('stroke', 'rgba(255,255,255,.6)')
      .attr('stroke-width', 5)
      .attr('stroke-linejoin', "round")
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', 0)
      .attr('dy', 0)
      .text(d=>d.name.replace('_', ' '))
      .call(wrap, 80);

    svg
      .select('g.points-layer')
      .selectAll('g.name-pts.fg')
      .data(namePts)
      .enter()
      .append('g')
      .attr('class', 'name-pts fg')
      .attr('transform', d=>`translate(${d.cx}, ${d.cy})`)
      .append('text')
      .attr('fill', 'black')
      .attr('font-size', textStyle.fontSize)
      .attr('font-weight', textStyle.fontWeight)
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', 0)
      .attr('dy', 0)
      .text(d=>d.name.replace('_', ' '))
      .call(wrap, 80);
  }

  render() {
    const {width, height, svgPad} = this.props
    const {sizes} = this.state

    return (
      <div style={{flexGrow: 1}}>
        <svg ref={(svg) => { this.svg = svg}}>
          <defs>
            <clipPath id="myClip">
              <rect x={0} y={1} width={width} height={height-2}/>
            </clipPath>
          </defs>
          <g transform={`translate(${sizes.padding}, ${sizes.padding})`}>
            <g className="layer" />
            <g className="base-layer" />
            <g className="points-layer" />
          </g>
        </svg>
      </div>
    )
  }
}
