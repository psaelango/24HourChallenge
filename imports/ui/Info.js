import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { EventHistory } from '../api/event-history';
import { AggregatedData } from '../api/aggregated-data';

import { DateRange , Calendar } from 'react-date-range';
 
import "react-datepicker/dist/react-datepicker.css";

 
// App component - represents the whole app
class Info extends Component {

  constructor(props) {
    super(props);
    this.state = {
        currentTransport: "car",
        aggregatedData: []
    }
    this.categories= [
        "car",
        "walking",
        "tram",
        "biking",
        "flight",
        "train"
    ];
    this.handleTransportChange = this.handleTransportChange.bind(this);
  }

  handleTransportChange(transport){
    this.setState({
      currentTransport: transport
    })
  }

  componentDidMount(){
    Meteor.call("getAggregatedData",(err,res)=>{
      if(res){
        this.setState({
          aggregatedData: res
        })
      }
    })
  }
 
  render() {
    let transportAggData = {};
    for (let i = 0; i < this.state.aggregatedData.length; i++) {
      transportAggData[this.state.aggregatedData[i]._id] = this.state.aggregatedData[i];
    }
    const listItems = this.categories.map((transport) =>
      <a key={transport} className="dropdown-item"  onClick={()=>this.handleTransportChange(transport)}>{transport.toLocaleUpperCase()}</a>
    );

    return (
      <div style={{display: "flex" , flexDirection: "column", margin: "10px", margin: "0 auto", width: "100%"}}>
        <div style={{display: "flex" , margin: "10px"}}>
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Change Transport
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {listItems}
            </div>
            </div>
        </div>
        <div className="panel panel-default" style={{margin: "10px", margin: "0 auto", width: "100%"}}>
          <div className="panel-heading" style={{textAlign: "center"}}>{this.state.currentTransport.toUpperCase()} Information</div>
          <div className="panel-body" style={{display: "flex", flexDirection: "row", minWidth: "500px"}}>
            <div style={{display: "flex"}}>
              <img src={`${this.state.currentTransport}.jpg`} alt="Smiley face" width="250" height="250"></img>
            </div>
          <table className="table">
            <thead className="thead-light">
                <tr>
                <th scope="col">Total Distance (m)</th>
                <th scope="col">Total Duration (m)</th>
                <th scope="col">Total Count</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>{ transportAggData && transportAggData[this.state.currentTransport] ? transportAggData[this.state.currentTransport].transport_distance : "" }</td>
                <td>{ transportAggData && transportAggData[this.state.currentTransport] ? Math.round(transportAggData[this.state.currentTransport].transport_duration / 1000) : "" }</td>
                <td>{ transportAggData && transportAggData[this.state.currentTransport] ? transportAggData[this.state.currentTransport].transport_count : "" }</td>
                </tr>
            </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}


const InfoContainer = withTracker(({ eventData }) => {
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
})(Info);

export default InfoContainer;

