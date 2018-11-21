import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Loader from 'react-loader-spinner';
import noUiSlider from 'nouislider'
import { EventHistory } from '../api/event-history';
import '../../client/nouislider.css';
 
// App component - represents the whole app
class Map extends Component {

  constructor(props) {
    super(props);
    this.timeSlider = null;
    this.map = null;
  }

  componentDidMount(){
    this.timeSlider = document.getElementById('time-slider');
    noUiSlider.create(this.timeSlider, {
        start: [0, 100],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        },
        // Steps of one week
        step: 2,
    });
    mapboxgl.accessToken = 'pk.eyJ1IjoicHNhZWxhbmdvIiwiYSI6ImNpejV6end5bzA2ZjEzM3A4NTE3NnM5YXMifQ.OH-2rxal0YdBVhJTAab4fg';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        zoom: 12,
        center: [-122.447303, 37.753574]
    });
    map.on('load', function () {

      map.addLayer({
          'id': 'population',
          'type': 'circle',
          'source': {
              type: 'vector',
              url: 'mapbox://examples.8fgz4egr'
          },
          'source-layer': 'sf2010',
          'paint': {
              // make circles larger as the user zooms from z12 to z22
              'circle-radius': {
                  'base': 1.75,
                  'stops': [[12, 2], [22, 180]]
              },
              // color circles by ethnicity, using a match expression
              // https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
              'circle-color': [
                  'match',
                  ['get', 'ethnicity'],
                  'White', '#fbb03b',
                  'Black', '#223b53',
                  'Hispanic', '#e55e5e',
                  'Asian', '#3bb2d0',
                  /* other */ '#ccc'
              ]
          }
      });
  });
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
        <div className="map-container" style={{display: "flex", flexDirection: "column"}}>
          <div id='map' style={{position:"absolute",top:50,bottom:0, width:"100%"}}></div>
          <div id="time-slider" style={{margin: "50px", bottom: 50}}></div>
        </div>
    );
  }
}


const MapContainer = withTracker(({ id }) => {
  const subscription = Meteor.subscribe('alldata');
  let loading = subscription.ready();
  let rawData = EventHistory.find({}).fetch();
  const dataExists = !loading && !!rawData;
  return {
    loading,
    rawData,
    dataExists
  };
})(Map);

export default MapContainer;

