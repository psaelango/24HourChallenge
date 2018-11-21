import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Loader from 'react-loader-spinner';
import noUiSlider from 'nouislider'
import { EventHistory } from '../api/event-history';
import '../../client/nouislider.css';
 
// App component - represents the whole app
export default class Timeslider extends Component {

  constructor(props) {
    super(props);
    this.timeSlider = null;
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
        step: 7 * 24 * 60 * 60 * 1000,
    });
  }

  componentWillReceiveProps(nextProps){
    let slidermintime = null;
    let slidermaxtime = null;
    const distanceChartData = [{
      name: 'Distance',
      data: []
    }];
    const durationChartData = [{
      name: 'Duration',
      data: []
    }];
    const chartCategories = [
      "car",
      "walking",
      "tram",
      "biking",
      "flight",
      "train"
    ];
    const totalDistanceByMode = {};
    const totalDurationByMode = {};
    for (let i = 0; i < nextProps.rawData.length; i++) {
      const dataRow = nextProps.rawData[i];
      if(dataRow.type == "Transport" && dataRow.mode){
        totalDistanceByMode[dataRow.mode] = totalDistanceByMode[dataRow.mode] || 0 + dataRow.distance;
        totalDurationByMode[dataRow.mode] = totalDurationByMode[dataRow.mode] || 0 + (dataRow.duration / 1000);
        if(!Session.get('sliderstart') && !Session.get('sliderend')){
          slidermintime = slidermintime ? (dataRow.starttime < slidermintime ? dataRow.starttime : slidermintime) : dataRow.starttime;
          slidermaxtime = slidermaxtime ? (dataRow.endtime > slidermaxtime ? dataRow.endtime : slidermaxtime) : dataRow.endtime;
        }
      }
    }
  }
 
  render() {
    return (
        <div id="time-slider" style={{margin: "50px"}}></div>
    );
  }
}

