import { Meteor } from 'meteor/meteor';
import { MomentHistory } from '../imports/api/moment-history';
import { EventHistory } from '../imports/api/event-history';
import { Segments } from '../imports/api/segments';
import { AggregatedData } from '../imports/api/aggregated-data';

// import './endpoints'

Meteor.startup(() => {

  // Development purposes only
  if(Meteor.isDevelopment && !EventHistory.findOne({})){ 

    // Empty Collections
    MomentHistory.remove({});
    EventHistory.remove({});
    Segments.remove({});
    AggregatedData.remove({});

    // Upload ( https://s3-eu-west-1.amazonaws.com/sentiance.solutions/datasets/public/user1.json ) data into Collections 
    HTTP.get(Meteor.absoluteUrl("mockdata.json"),(err,result)=>{
    // HTTP.get("https://s3-eu-west-1.amazonaws.com/sentiance.solutions/datasets/public/user1.json",(err,result)=>{

      for (let i = 0; i < result.data.data.user.moment_history.length; i++) {
        const momenthistory = result.data.data.user.moment_history[i];
        momenthistory.starttime = Math.round(new Date(momenthistory.start).getTime()); // StartTime - Timestamp in milliseconds
        momenthistory.endtime = Math.round(new Date(momenthistory.end).getTime()); // EndTime - Timestamp in milliseconds
        momenthistory.duration = momenthistory.endtime - momenthistory.starttime; // Duration - Timestamp in milliseconds
        MomentHistory.insert(momenthistory);
      }

      for (let i = 0; i < result.data.data.user.event_history.length; i++) {
        const eventhistory = result.data.data.user.event_history[i];
        eventhistory.starttime = Math.round(new Date(eventhistory.start).getTime()); // StartTime - Timestamp in milliseconds
        eventhistory.endtime = Math.round(new Date(eventhistory.end).getTime()); // EndTime - Timestamp in milliseconds
        eventhistory.duration = eventhistory.endtime - eventhistory.starttime; // Duration - Timestamp in milliseconds
        EventHistory.insert(eventhistory);
      }

      for (let i = 0; i < result.data.data.user.segments.length; i++) {
        const segment = result.data.data.user.segments[i];
        Segments.insert(segment);
      }

      console.log("Data Uploaded!!!");

    });

  }

  Meteor.methods({
		"getEventsWithinRange"(startDate, endDate){
			function isValidDate(d) {
        d = new Date(d);
				return d instanceof Date && !isNaN(d);
			}
			if(isValidDate(startDate) && isValidDate(endDate)){
				let starttime = Math.round(new Date(startDate).getTime());
				let endtime = Math.round(new Date(endDate).getTime());
				if(starttime > endtime){
					throw new Meteor.Error("Invalid Date Range");
				}
				var result =  EventHistory.find({$and: [
					{"starttime": {$gte: starttime}},
					{"endtime": {$lte: endtime}},
				]}).fetch();
				return result;
			}
			else{
				throw new Meteor.Error("Invalid Date");
			}
		},

		"getAggregatedData"(){
			return (
				Promise.await(
					EventHistory.aggregate([
						{
							$group:
								{
									_id: "$mode",
									transport_distance: { $sum: "$distance" },
									transport_duration: { $sum: "$duration" },
									transport_count: { $sum: 1 }
								}
							}
					]).toArray()
				)
			)
		}
  });
  

  // Server side API
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  app.get('/api/get/events', Meteor.bindEnvironment(function(req, res){
    if(!req.body.startdate || !req.body.enddate){
        res.status(400).send("Start & End time are required");
    }
    else{
      try{
        token = Meteor.call("getEventsWithinRange",req.body.startdate,req.body.enddate);
        res.status(201).send(token);
      }
      catch(error){
        res.status(500).send(error);
      }
    }
  }));
  app.get('/api/get/aggregate', Meteor.bindEnvironment(function(req, res){
    try{
      token = Meteor.call("getAggregatedData");
      res.status(201).send(token);
    }
    catch(error){
      res.status(500).send(error);
    }
  }));
  WebApp.connectHandlers.use(app);

});
