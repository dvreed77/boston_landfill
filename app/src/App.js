import React from 'react'
import Timeline from './components/timeline'
import Map from './components/geomap'
import * as d3 from 'd3'
import {find} from 'lodash'
import ReactModal from 'react-modal'
// import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this)
    this.state = {
      year: 1906,
      baseLayer: {},
      landfillLayers: {},
      layerData: [],
      showModal: false
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentWillMount() {
    const urls = [
      './out_v3.geojson',
      './layer_data.json'
    ]

    // separate function to make code more clear
    const grabContent = url => fetch(url)
      .then(res => res.json())

    Promise
      .all(urls.map(grabContent))
      .then(([mapData, layerData]) => {

        const baseLayer = {
          "type": "FeatureCollection",
          "features": mapData.features.filter(f => f.properties.zone === 'Base')
        }

        const landfillLayers = {
          "type": "FeatureCollection",
          "features": mapData.features.filter(f => f.properties.zone !== 'Base')
        }

        layerData.forEach(d => d.name = d.name.replace(' ', '_'))

        // console.log(layerData, baseLayer, landfillLayers)

        var entries = d3.nest()
          .key(function (d) {
            return d.properties.zone;
          })
          .entries(landfillLayers.features)
          .map(d => ({
            name: d.key,
            nFrames: d.values.length
          }));


        layerData.forEach(d => {
          const t = find(entries, {'name': d.name})
          Object.assign(d, t)

          d.scale = d3.scaleLinear()
            .range(d.years)
            .domain([d.nFrames - 1, 0])
        })

        landfillLayers.features.forEach(f => {

          const zone = layerData.filter(_ => {
            return f.properties.zone === _.name.replace(' ', '_')
          })

          f.properties = Object.assign({}, f.properties, zone[0])

          f.properties.year = f.properties.scale(f.properties.layer_id)

          f.properties.visible = year => {
            return year > f.properties.year
          }
        })

        mapData.features = mapData.features.sort((a, b) => {
          if (a.properties.zone.zone === 'base') return 1
          if (b.properties.zone.zone === 'base') return -1

          return b.properties.zone.zone - a.properties.zone.zone
        })

        this.setState({landfillLayers, baseLayer, layerData})
      })
  }

  handleOpenModal() {
    this.setState({showModal: true});
  }

  handleCloseModal() {
    this.setState({showModal: false});
  }

  onChange(year) {
    this.setState({
      year
    })
  }

  render() {
    const {year, landfillLayers, layerData, baseLayer, showModal} = this.state

    const layerData_ = layerData.filter(d => d.zone !== 'base')

    return (
      <div className="container">
        <div className='header'>
          <div className='item'>
            <a href='https://dvreed.com' target='_blank' rel='noopener noreferrer'>dvreed.com</a>
          </div>
          <div style={{display: 'flex'}}>
            <div className='item button' onClick={this.handleOpenModal}>
              about
            </div>
            <div className="item">
              <a href="https://github.com/dvreed77/boston_landfill" target='_blank' rel='noopener noreferrer'>
                <i className="fa fa-github fa-lg" />
              </a>
            </div>

          </div>
        </div>
        <ReactModal
          isOpen={showModal}
          contentLabel="Minimal Modal Example"
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => {
            this.setState({ showModal: false });
          }}
          style={{
            overlay: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            },
            content: {
              width: '50%',
              left: '25%',
              // height: 300,
              bottom: 'auto',
              borderRadius: '10px',
            }
          }}
        >
          <div style={{fontSize: 20}}>
            <p>If you didn't know, Boston was once a tiny peninsula.</p>

            <p>Starting in the early 19th century Boston started to take shape into what you see now.</p>

            <p>I was inspired to create this app when a friend of mine posted a GIF she found from Boston College, which
              can be found <a target='_blank' rel='noopener noreferrer' href="http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html">here</a>. I became frustrated because it was moving too fast for me to see all the changes that
              were taking place and I wanted to be able to scrub through the animation.</p>
          </div>
        </ReactModal>

        <div className='title'>
          <h1>Boston Landfill</h1>
          <div>
            an exploration of how Boston grew from a tiny peninsula to what you see today.
          </div>
        </div>

        <div className="dave">
          <Timeline onChange={this.onChange} layerData={layerData_} year={year}/>
          <Map year={year} landfillLayers={landfillLayers} baseLayer={baseLayer}/>
        </div>        
      </div>
    );
  }
}

export default App