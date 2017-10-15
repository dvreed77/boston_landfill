import React from 'react'
import Timeline from '../components/timeline'
import Map from '../components/geomap'

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this)
    this.state = {
      year: 1906
    }
  }

  onChange(year) {
    console.log('dave', year)
    this.setState({
      year
    })
  }

  render() {
    const {year} = this.state
    return (
      <div>
        Current Year: {year}
        <Timeline onChange={this.onChange}/>
        <Map year={year}/>
      </div>
    );
  }
}

export default Page