import { AggregatedData } from './aggregated-data';

export const EventHistory = new Mongo.Collection('eventhistory');

let eventcursor = EventHistory.find({});
let eventhandle = eventcursor.observeChanges({
  added(id, eventHistory) {
    if(eventHistory.type == "Transport" && eventHistory.mode){
        let aggregateddata = AggregatedData.findOne({});
        let current_transport_distance = eventHistory.distance || 0;
        let current_transport_duration = eventHistory.duration || 0;
        let current_mode = eventHistory.mode;
        if(!aggregateddata){
            const query = {
                "total_transport_distance": current_transport_distance, 
                "total_transport_duration": current_transport_duration,
            };
            query.transport_distance[current_mode] = current_transport_distance;
            query.transport_duration[current_mode] = current_transport_duration;
            query.transport_count[current_mode] = 1
            AggregatedData.insert(query);
        }
        else{
            let total_transport_distance = aggregateddata.total_transport_distance || 0;
            let total_transport_duration = aggregateddata.total_transport_duration || 0;
            let transport_distance_obj = aggregateddata.transport_distance || {};
            let transport_duration_obj = aggregateddata.transport_duration || {};
            let transport_count_obj = aggregateddata.transport_count || {};
            let total_current_mode_distance = transport_distance_obj[current_mode] || 0 + current_transport_distance;
            let total_current_mode_duration = transport_duration_obj[current_mode] || 0 + current_transport_duration;
            let total_current_mode_count = transport_count_obj[current_mode] || 0 + 1;
            const query = {
                "total_transport_distance": current_transport_distance + total_transport_distance,
                "total_transport_duration": current_transport_duration + total_transport_duration
            };
            query.transport_distance = transport_distance_obj;
            query.transport_distance[current_mode] = total_current_mode_distance;
            query.transport_duration = transport_duration_obj;
            query.transport_duration[current_mode] = total_current_mode_duration;
            query.transport_count = transport_count_obj;
            query.transport_count[current_mode] = total_current_mode_count;
            query.mintime = aggregateddata.mintime ? 
                                aggregateddata.mintime > eventHistory.starttime ? eventHistory.starttime : aggregateddata.mintime
                                    : eventHistory.starttime;
            query.maxtime = aggregateddata.maxtime ? 
                                aggregateddata.maxtime < eventHistory.endtime ? eventHistory.endtime : aggregateddata.maxtime
                                    : eventHistory.endtime;
            AggregatedData.update({"_id":aggregateddata._id},{$set: query})
        }
    }
  },
  removed() {
  }
});