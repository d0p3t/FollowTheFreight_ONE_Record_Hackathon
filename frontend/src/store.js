import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";

Vue.use(Vuex);

const state = {
  shipments: [],
  visibleShipments: [],
  googleMapsData: [],
  flightplans: []
};

function checkPointExists(points, name){
  if (points.length == 0){
	return false;
  }
  for (var i = 0; i < points.length; i++){
    if (points[i].name == name){
      return true;
    }
  }
  return false;
}

const getters = {
  getShipmentByAwb: (state) => (awb) => {
    return _.find(state.shipments, ["airwayBillNumber"], awb);
  },
  getShipments: (state) => {
    console.log('hey there');
    return state.shipments;
  },
  getGoogleMapsData: (state) => {
	console.log('hello');
	var myData = {};
	var myShipments = [];
	var points = new Array();
	
	// Create array of shipments
    for(var j = 0; j < state.shipments.length; j++){
      var myShipment = {};
      var path = new Array();
      
      var data = state.shipments[j].data;
      var AWBNumber = data.airwayBillNumber;
      var schedules = data.flightPlan.schedules;
      var isVisible = true;
      var color = '#FFA500';
      if (isVisible){
        if (schedules != null){
          for(var i = 0; i < schedules.length; i++){
            if (i == schedules.length - 1 || schedules[i].flightNumber != schedules[i+1].flightNumber){
              if (!checkPointExists(points, schedules[i].origin.airportName)){
                points.push({Id: points.length+1, name: schedules[i].origin.airportName, position: { lat: schedules[i].origin.latitude, lng: schedules[i].origin.longitude}});
              }
              if (!checkPointExists(points, schedules[i].destination.airportName)){
                points.push({Id: points.length+1, 
                  name: schedules[i].destination.airportName, 
                  position: { lat: schedules[i].destination.latitude, lng: schedules[i].destination.longitude}
                });
              }
              path.push({lat: schedules[i].origin.latitude, lng: schedules[i].origin.longitude});
              path.push({lat: schedules[i].destination.latitude, lng: schedules[i].destination.longitude});
            }
          }
        } else {
          path.push({lat: data.originInfo.latitude, lng: data.originInfo.longitude});
          path.push({lat: data.destinationInfo.latitude, lng: data.destinationInfo.longitude});
        }
        myShipment.path = path;
        myShipment.color = color;
        myShipment.isVisible = isVisible;	
        myShipment.AWBNumber = AWBNumber;
        myShipments.push(myShipment);
      }
    }
	myData.shipments = myShipments;
	myData.points = points;
	return myData;
  },

  getAllAirwayBillNumbers: (state) => {
    const awbs = [];
    state.shipments.forEach(shipment => {
      awbs.push(shipment.airwayBillNumber);
    });

    return awbs;
  },

  getFlightPlans: (state) => {
    return state.flightplans;
  }
};

const mutations = {
  addShipment(state, shipment) {
    if (
      !state.shipments.some(
        (s) => s.airwayBillNumber === shipment.airwayBillNumber
      )
    ) {
      state.shipments.push(shipment.data);
      state.visibleShipments.push(shipment.airwayBillNumber);
    }
  },
  removeShipment(state, awb) {
    state.shipments = _.remove(state.shipments, (s) => {
      s.airwayBillNumber === awb;
    });
    state.visibleShipments = _.remove(state.visibleShipments, (s) => s === awb);
  },
  toggleShipmentVisibility(state, awb) {
    if (state.visibleShipments.some((s) => s === awb)) {
      state.visibleShipments = _.remove(
        state.visibleShipments,
        (s) => s === awb
      );
    } else {
      state.visibleShipments.push(awb);
    }
  },
  removeFlightPlan(state, awb)
  {
    state.flightplans = _.remove(state.flightplans, (fp) => fp.airwayBillNumber === awb);
  }
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
});
