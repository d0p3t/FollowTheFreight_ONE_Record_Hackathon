<template>
  <div style="height:100%;">
    <h2 style="font-size: 0.9rem; font-weight:bold; height: 5%;">
      Flight Information
    </h2>
    <div class="contain-flight-info">
      <div
        class="list-group flight-info-list"
        v-for="awbFlightPlans in getFlightPlans"
        :key="awbFlightPlans.flightNumber"
      >
        <b-card
          no-body
          class="text-center flight-info-card"
          style="min-width: 100% !important;"
        >
            <b-row class="logo align-content: center;">
              <b-col cols="4"></b-col>

              <b-col cols="4"
                ><img :src="awbFlightPlans.schedules[0].airlineLogo" width="40" height="40"
              /></b-col>
              <b-col cols="4">
                <img
                  style="float:right; margin-right: 15px;"
                  src="../assets/info.png"
                  width="20"
                  height="20"
              /></b-col>
            </b-row>
            <b-row class="flight">
              <b-col cols="4" class="flight-info">
                <p class="flight-info-text">
                  {{ awbFlightPlans.schedules[0].origin }}
                  <br />
                  {{awbFlightPlans.schedules[0].departureDate }}
                  <br />
                  Departure {{awbFlightPlans.schedules[0].departureTime}}
                </p>
              </b-col>
              <b-col cols="4" class="flight-info">
                <img src="../assets/plane.png" width="30" height="30" />
              </b-col>
              <b-col cols="4" class="flight-info">
                <p class="flight-info-text">
                  {{ awbFlightPlans.schedules[0].destination}}
                  <br />
                  {{awbFlightPlans.schedules[0].arrivalDate }}
                  <br />
                  Departure {{awbFlightPlans.schedules[0].arrivalTime}}
                </p>
              </b-col>
            </b-row>
        </b-card>
      </div>
    </div>
  </div>
</template>

<style>
div.flight {
  font-size: 0.7;
  margin-top: 10px !important;
  margin-left: 10px !important;
  margin-right: 10px !important;
}
div.imgi {
  margin-top: 10px !important;
  margin-left: 290px !important;
  margin-right: 10px !important;
}
.flight-info {
  padding-bottom: 0 !important;
  /* padding-top: 10px !important; */
}

.flight-info-list {
  padding: 5px !important;
}
.flight-info-card {
  margin-bottom: 2.5px;
  border-color: transparent !important;
  box-shadow: 0 0 2.5px 2.5px rgba(0, 0, 0, 0.05);
}
.flight-info-text {
  font-size: 0.9rem;
  font-weight: bold;
}
div.contain-flight-info {
  width: 100%;
  height: 95%;
  max-height: 450px;
  overflow: scroll !important;
  overflow-x: hidden !important;
}
</style>

<script>
import EventBus from "../../event-bus";

export default {
  name: "Main",
  data() {
    return {
      awbsFlightPlans: [],
    };
  },

  methods: {
    showInfo(awbFlightPlans) {
      if (!this.awbsFlightPlans.includes(awbFlightPlans)) {
        console.log('adding...')
        console.log(awbFlightPlans)
        this.awbsFlightPlans.push(awbFlightPlans);
      }
    },
    removeInfo(awb) {
      console.log('flight plans are')
      console.log(this.awbsFlightPlans)
      const newone =  this.awbsFlightPlans.filter((fp) => fp.airwayBillNumber !== awb);
      this.awbsFlightPlans = newone;
    }
  },
  computed: {
    getFlightPlans: function()
    {
      return this.awbsFlightPlans;
    }
  },
  mounted() {
    EventBus.$on("showFlightInfo", (shipment) => {
      const milestones = shipment.data.milestoneEvents;
      const schedules = [];

      shipment.data.flightPlan.schedules.forEach((schedule) => {
        const departureDate = new Date(schedule.expectedDepartureTime);
        const arrivalDate = new Date(schedule.expectedArrivalTime);

        const flightSchedule = {
          flightNumber: schedule.flightNumber,
          airlineLogo: shipment.airlineLogo,
          origin: schedule.origin.airportCode,
          destination: schedule.destination.airportCode,
          departureDate: departureDate.toDateString(),
          departureTime: departureDate.toLocaleTimeString(),
          arrivalDate: arrivalDate.toDateString(),
          arrivalTime: arrivalDate.toLocaleTimeString(),
          milestones: milestones,
        };
        schedules.push(flightSchedule);
      });

      const awbFlightPlans = {
        airwayBillNumber: shipment.airwayBillNumber,
        schedules: schedules,
      };
      this.showInfo(awbFlightPlans);
    });
    EventBus.$on("removeInfoByAwb", (awb) => {
      this.removeInfo(awb);
    })

  },
};
</script>
