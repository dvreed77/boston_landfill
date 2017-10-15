import React from 'react'
import Timeline from '../components/timeline'
import Map from '../components/map'



class Page1 extends React.Component {
  state = {
    dataSource: [],
  }

  render() {
    return (
      <div>
        <h1>Timeline</h1>
        <Timeline />
        <Map/>
      </div>
    );
  }
}

export default Page1