import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { EventHistory } from '../api/event-history';
import { AggregatedData } from '../api/aggregated-data';

import { DateRange , Calendar } from 'react-date-range';
 
import "react-datepicker/dist/react-datepicker.css";

 
// App component - represents the whole app
class Chart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chartview: "distance",
      startDate: null,
      endDate: null,
      updatedData: []
    }
    this.drawChart = this.drawChart.bind(this);
    this.renderChartDom = this.renderChartDom.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.updateChart = this.updateChart.bind(this);
  }

  drawChart(rawData){
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
    for (let i = 0; i < rawData.length; i++) {
      const dataRow = rawData[i];
      if(dataRow.type == "Transport" && dataRow.mode){
        totalDistanceByMode[dataRow.mode] = totalDistanceByMode[dataRow.mode] || 0 + dataRow.distance;
        totalDurationByMode[dataRow.mode] = totalDurationByMode[dataRow.mode] || 0 + (dataRow.duration / 1000);
        if(!Session.get('sliderstart') && !Session.get('sliderend')){
          slidermintime = slidermintime ? (dataRow.starttime < slidermintime ? dataRow.starttime : slidermintime) : dataRow.starttime;
          slidermaxtime = slidermaxtime ? (dataRow.endtime > slidermaxtime ? dataRow.endtime : slidermaxtime) : dataRow.endtime;
        }
      }
    }
    // this.timeSlider.noUiSlider.on('update', function (values, handle) {
        
    // });
    for (let i = 0; i < chartCategories.length; i++) {
      const mode = chartCategories[i];
      distanceChartData[0].data.push(totalDistanceByMode[mode] || 0);
      durationChartData[0].data.push(totalDurationByMode[mode] || 0);
    }
    if(this.state.chartview == "distance"){
      Highcharts.chart('distance-charts-container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Distance Data'
        },
        xAxis: {
            categories: chartCategories,
          // crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Distance (m)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} m</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: distanceChartData
      });
    }
    else if(this.state.chartview == "duration"){
      Highcharts.chart('duration-charts-container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Duration Data'
        },
        xAxis: {
            categories: chartCategories,
          // crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Duration (sec)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} sec</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: durationChartData
      });
    }
  }

  updateChart(){
    if(this.state.startDate && this.state.endDate){
      var startDateRange = moment(this.state.startDate).toDate();
      var endDateRange = moment(this.state.endDate).toDate();
      if(startDateRange.getTime() > endDateRange.getTime()){
        let temp = null;
        temp = startDateRange;
        startDateRange = endDateRange;
        endDateRange = temp;
        alert("Start date is greater than End date!!!")
      }
      Meteor.call("getEventsWithinRange",startDateRange,endDateRange, (err,res)=>{
        if(err){
          alert("Invalid Date!!!")
        }
        this.setState({updatedData: res})
      });
    }
  }

  renderChartDom(chartview){
    switch(chartview){
      case "distance":
        return <div id="distance-charts-container"></div>
      case "duration":
        return <div id="duration-charts-container"></div>
      default:
        return null

    }
  }


  handleDateChange(range){
    this.setState({
      startDate: range.startDate,
      endDate: range.endDate,
    })
  }

  componentDidMount(){
    if(Array.isArray(this.props.rawData) || this.props.rawData.length){
      this.drawChart(this.props.rawData)
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.loading){
      return;
    }
    this.drawChart(nextProps.rawData)
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.chartview != prevState.chartview){
      this.drawChart(this.props.rawData)
    }
    if(this.state.updatedData.length){
      if(this.state.updatedData.length != prevState.updatedData.length){this.drawChart(this.state.updatedData)}
    }
    else{
      if(this.props.rawData.length != prevProps.rawData.length){this.drawChart(this.props.rawData)}
    }
  }
 
  render() {
    return (
      <div className="chart-view-container" style={{display: "flex", flexDirection: "column", margin: "10px"}}>
        <div style={{display: "flex" , margin: "10px"}}>
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Select Chart
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a className="dropdown-item"  onClick={()=>{this.setState({chartview: "distance"})}}>Distance</a>
              <a className="dropdown-item"  onClick={()=>{this.setState({chartview: "duration"})}}>Duration</a>
            </div>
            </div>
        </div>
        <div className="chart-container" style={{display: "flex", flexDirection: "column"}}>
          {this.renderChartDom(this.state.chartview)}        
        </div>
        <div style={{display: "flex", margin: "10px", alignContent: "center"}}>
        {
          this.props.aggregatedData.length ? 
          <DateRange
            startDate={moment(new Date(this.props.aggregatedData[0].mintime))}
            minDate={moment(new Date(this.props.aggregatedData[0].mintime))}
            endDate={moment(new Date(this.props.aggregatedData[0].maxtime))}
            maxDate={moment(new Date(this.props.aggregatedData[0].maxtime))}
            onChange={this.handleDateChange}
          /> : null
        }
          <button type="button" className="btn btn-primary" onClick={this.updateChart}>Update Chart</button>
        </div>
      </div>
    );
  }
}


const ChartContainer = withTracker(({ eventData }) => {
  const subscription = Meteor.subscribe('alldata');
  let loading = subscription.ready();
  let rawData = EventHistory.find({}).fetch();
  let aggregatedData = AggregatedData.find({}).fetch();
  const dataExists = !loading && !!rawData;
  return {
    loading,
    rawData,
    aggregatedData,
    dataExists
  };
})(Chart);

export default ChartContainer;

