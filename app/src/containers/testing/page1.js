import React from 'react'
import Timeline from '../../components/timeline'



class Page1 extends React.Component {
  state = {
    dataSource: [],
  }

  render() {
    return (
      <div>
        <h1>Timeline</h1>
        <Timeline />
      </div>
    );
  }
}

export default Page1