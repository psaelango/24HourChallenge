import { AggregatedData } from './aggregated-data';

export const MomentHistory = new Mongo.Collection('momenthistory');

let momentcursor = MomentHistory.find({});
let momenthandle = momentcursor.observeChanges({
  added(id, momenthistory) {
    let aggregateddata = AggregatedData.findOne({});
    let current_moment_duration = momenthistory.duration || 0;
    if(!aggregateddata){
        AggregatedData.insert({"total_moment_duration": current_moment_duration});
    }
    else{
        let aggregated_moment_duration = aggregateddata.total_duration || 0;
        AggregatedData.update({"_id":aggregateddata._id},{$set: {
            "total_moment_duration": current_moment_duration + aggregated_moment_duration
        }})
    }
  },
  removed() {
  }
});
