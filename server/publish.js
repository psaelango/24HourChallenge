Meteor.publish('alldata', function () {
    return [
        MomentHistory.find({}),
        EventHistory.find({}),
        Segments.find({}),
        AggregatedData.find({})
    ];
});