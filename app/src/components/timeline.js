import React, {Component} from 'react'
import * as d3 from 'd3'

// export default () => {
//   const zones = [
//     {"zone": "base", "frames": [1], "name": "Base", "years": []},
//     {"zone": "1", "frames": [2,3], "name": "West Cove", "years": [1803, 1863]},
//     {"zone": "2", "frames": [4,5], "name": "Mill Pond", "years": [1807, 1829]},
//     {"zone": "3", "frames": [6,8], "name": "South Cove", "years": [1806, 1843]},
//     {"zone": "4", "frames": [9,12], "name": "East Cove", "years": [1823, 1874]},
//     {"zone": "5", "frames": [13,20], "name": "South Boston", "years": [1836, 2016]},
//     {"zone": "6", "frames": [21,24], "name": "South Bay", "years": [1850, 2016]},
//     {"zone": "7", "frames": [25,29], "name": "Back Bay", "years": [1857, 1894]},
//     {"zone": "8", "frames": [30,35], "name": "Charlestown", "years": [1860, 1896]},
//     {"zone": "9", "frames": [36,39], "name": "Fenway", "years": [1878, 1890]},
//     {"zone": "10", "frames": [40,44], "name": "East Boston", "years": [1880, 2016]},
//     {"zone": "11", "frames": [45,48], "name": "Marine Park", "years": [1883, 1900]},
//     {"zone": "12", "frames": [49,52], "name": "Columbus Park", "years": [1890, 1901]},
//     {"zone": "13", "frames": [53,59], "name": "Logan Airport", "years": [1922, 2016]}
//   ]
//
//   const state = {
//     cursorPosition: 0
//   }
//
//   const zones2 = zones.filter(z=>z.zone !== 'base')
//
//   const width = 800,
//     barHeight = 10,
//     barPad = 3,
//     height = zones2.length * (barHeight + barPad)
//
//   const minYear = d3.min(zones2, d=>d.years[0])
//   const maxYear = d3.max(zones2, d=>d.years[1])
//
//   const xScale = d3.scaleLinear()
//     .domain([minYear, maxYear])
//     .range([0, width])
//
//   const totalTime = 5000,
//     steps = 1000,
//     dw = width / steps,
//     dt = totalTime / steps
//
//   console.log(dw, dt)
//
//   setInterval(()=>{
//   //   state.cursorPosition = state.cursorPosition + dw
//     state.cursorPosition = (state.cursorPosition + dw) % 500
//     // console.log('ts', state.cursorPosition)
//   }, dt)
//
//   return (
//     <div>
//       <svg width={width} height={height}>
//         {zones2.map((zone, idx)=>{
//           return <rect
//             key={idx}
//             x={xScale(zone.years[0])}
//             y={idx * (barHeight + barPad)}
//             width={100}
//             height={barHeight}
//             fill={'green'}
//           />
//         })}
//
//         <line
//           x1={state.cursorPosition}
//           y1={0}
//           x2={state.cursorPosition}
//           y2={height}
//           stroke={'black'}
//         />
//       </svg>
//
//
//     </div>
//   )
// }

export default class App2 extends Component {

  state = {
    cursorPosition: 0,
  }

  componentWillMount() {
    const width = 800

    const fps = 30,
      dt = 1/fps

    const totalTime = 5000,
      steps = 1000,
      dw = width / steps
      // dt = totalTime / steps




    setInterval(()=>{
      //   state.cursorPosition = state.cursorPosition + dw
      this.setState({
        cursorPosition: (this.state.cursorPosition + dw) % width
      })
      // console.log('ts', state.cursorPosition)
    }, dt)
  }

  render() {
    const state = this.state;

    const zones = [
      {"zone": "base", "frames": [1], "name": "Base", "years": []},
      {"zone": "1", "frames": [2,3], "name": "West Cove", "years": [1803, 1863]},
      {"zone": "2", "frames": [4,5], "name": "Mill Pond", "years": [1807, 1829]},
      {"zone": "3", "frames": [6,8], "name": "South Cove", "years": [1806, 1843]},
      {"zone": "4", "frames": [9,12], "name": "East Cove", "years": [1823, 1874]},
      {"zone": "5", "frames": [13,20], "name": "South Boston", "years": [1836, 2016]},
      {"zone": "6", "frames": [21,24], "name": "South Bay", "years": [1850, 2016]},
      {"zone": "7", "frames": [25,29], "name": "Back Bay", "years": [1857, 1894]},
      {"zone": "8", "frames": [30,35], "name": "Charlestown", "years": [1860, 1896]},
      {"zone": "9", "frames": [36,39], "name": "Fenway", "years": [1878, 1890]},
      {"zone": "10", "frames": [40,44], "name": "East Boston", "years": [1880, 2016]},
      {"zone": "11", "frames": [45,48], "name": "Marine Park", "years": [1883, 1900]},
      {"zone": "12", "frames": [49,52], "name": "Columbus Park", "years": [1890, 1901]},
      {"zone": "13", "frames": [53,59], "name": "Logan Airport", "years": [1922, 2016]}
    ]

    const zones2 = zones.filter(z=>z.zone !== 'base')

    const width = 800,
      barHeight = 10,
      barPad = 3,
      height = zones2.length * (barHeight + barPad)

    const minYear = d3.min(zones2, d=>d.years[0])
    const maxYear = d3.max(zones2, d=>d.years[1])

    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, width])

    const totalTime = 5000,
      steps = 1000,
      dw = width / steps,
      dt = totalTime / steps

    console.log(dw, dt)



    return (
      <div>
        <svg width={width} height={height}>
          {zones2.map((zone, idx)=>{
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
            x1={state.cursorPosition}
            y1={0}
            x2={state.cursorPosition}
            y2={height}
            stroke={'black'}
            strokeWidth={2}
          />
        </svg>


      </div>
    )
  }
}
