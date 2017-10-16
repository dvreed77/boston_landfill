import React from 'react'
import Timeline from '../components/timeline'
import Map from '../components/geomap'

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this)
    this.state = {
      year: 1906,
      mapData: {},
      layerData: []
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

        mapData.features.forEach(f=>{

          const {layer} = f.properties

          const zone = layerData.filter(_=>{
            if (layer === 'base' && _.zone === 'base') return true
            return (+layer+1 >= _.frames[0]) && (+layer+1 <= _.frames[1])
          })

          f.properties.zone = zone[0]
        })

        mapData.features = mapData.features.sort((a,b)=>{
          if (a.properties.zone.zone === 'base') return 1
          if (b.properties.zone.zone === 'base') return -1

          return b.properties.zone.zone - a.properties.zone.zone
        })

        this.setState({mapData, layerData})
      })
  }

  onChange(year) {
    // console.log('dave', year)
    this.setState({
      year
    })
  }

  render() {
    const {year, mapData, layerData} = this.state

    const layerData_ = layerData.filter(d=>d.zone !== 'base')

    return (
      <div>
        Current Year: {year}
        <Timeline onChange={this.onChange} layerData={layerData_}/>
        <Map year={year} mapData={mapData}/>
      </div>
    );
  }
}

export default Page