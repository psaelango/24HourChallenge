import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Loader from 'react-loader-spinner';

import Map from './Map';
import Chart from './Chart';
import Info from './Info';

import { EventHistory } from '../api/event-history';


// App component - represents the whole app
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      view: "chart"
    }
  }

  renderView(view){
    switch(view){
      case "chart":
        return <Chart />
      case "map":
        return <Map />
      case "info":
        return <Info />
      default:
        return null

    }
  }
 
  render() {
    if(this.props.loading){
      return(
        <Loader 
           type="Puff"
           color="#00BFFF"
           height="100"	
           width="100"
        />   
       ); 
    }
    return (
      <div className="app-container">
        <div className="nav-container">
          <nav className="navbar navbar-inverse">
            <div className="container-fluid">
              <div className="navbar-header">
                <a className="navbar-brand" onClick={()=>{this.setState({view: "chart"})}}>Chart View</a>
                <a className="navbar-brand" onClick={()=>{this.setState({view: "map"})}}>Map View</a>
                <a className="navbar-brand" onClick={()=>{this.setState({view: "info"})}}>Transport Info</a>
              </div>
            </div>
          </nav>
        </div>
        {this.renderView(this.state.view)}
        {/* <div className="chart-container" style={{display: "flex", flexDirection: "column"}}>
          <div id="distance-charts-container"></div>
          <div id="duration-charts-container"></div>
          <div id="time-slider" style={{margin: "50px"}}></div>
        </div>
        <div className="map-container" style={{display: "flex", flexDirection: "column"}}>
          <div id='map' style={{position:"absolute",bottom:0, width:"100%"}}></div>
        </div> */}
      </div>

    );
  }
}

const AppContainer = withTracker(({ id }) => {
  const subscription = Meteor.subscribe('alldata');
  let loading = subscription.ready();
  let rawData = EventHistory.find({}).fetch();
  const dataExists = !loading && !!rawData;
  return {
    loading,
    rawData,
    dataExists
  };
})(App);

export default AppContainer;
