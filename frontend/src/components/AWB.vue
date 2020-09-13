<template>
  <div style="height: 100%;">
    <b-input-group prepend="Search">
    <b-form-input
      :state="isValidAwb"
      class="form-control"
      v-model="result"
      type="text"
      placeholder="AWB"
      aria-label="Search"
      v-on:keyup="onSearch"
    />
    </b-input-group>
    <br />
    <h2 style="font-size: 0.9rem; font-weight:bold; height: 5%;">
      My Airway Bill Numbers
    </h2>
    <div class="contain-awb-overview">
      <div
        v-show="showing"
        class="list-group awb-overview-list"
        v-for="shipment in getAllShipments"
        :key="shipment.airwayBillNumber"
      >
        <b-button
          variant="outline-dark"
          v-bind:style="{ opacity: shipment.isVisible ? 1 : 0.5 }"
          class="awb-overview" 
        >
          <b-row>
            <b-col cols="4" class="awb-overview-column"
              ><img
                v-bind:src="shipment.airlineLogo"
                width="40"
                height="40" @click="ShowFlightInfo(shipment)"
            /></b-col>
            <b-col cols="4" class="awb-overview-column"
              ><span class="awb-name">{{
                shipment.airwayBillNumber
              }}</span></b-col
            >
            <b-col cols="4" class="awb-overview-column">
              <div style="float:right; padding-right: 20%;">
                <img
                  style="margin-right: 15px"
                  v-bind:src="shipment.isVisible ? imgShow : imgHide"
                  width="24"
                  height="24"
                  @click="onHide(shipment)"
                />
                <img
                  src="@/assets/criss-cross.png"
                  width="20"
                  height="20"
                  @click="onDelete(shipment.airwayBillNumber)"
                /></div
            ></b-col>
          </b-row>
        </b-button>
      </div>
    </div>
  </div>
</template>

<style>
/* .form-control{
  width :300px !important;
  height: 50px !important;
} */
div.contain-awb-overview {
  font-size: 14px;
  height: 250px !important;
  max-height: 250px;
  overflow: scroll !important;
  overflow-x: hidden !important;
}

.awb-overview {
  padding: 0 !important;
  margin-bottom: 2.5px;
  border-color: transparent !important;
  box-shadow: 0 0 2.5px 2.5px rgba(0, 0, 0, 0.05);
}
.awb-overview .row .col-4 {
  /* padding-right: 0 !important;
  padding-left: 0 !important; */
}
.awb-name {
  vertical-align: middle;
  font-size: 0.95rem;
  font-weight: bold;
}
.awb-overview-column {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

.contain-awb-overview div button:hover {
  background-color: #94918d8f;
  border-color: grey;
}

.awb-overview-list {
  padding: 5px !important;
}
</style>

<script>
import EventBus from "../../event-bus";
import axios from "axios";

export default {
  name: "Main",
  data() {
    return {
      showing: false,
      result: "",
      results: [],
      isValidAwb: null,
      visibilityAwbs: [],
      imgShow: "https://i.ibb.co/ZMV4JvL/eye.png",
      imgHide: "https://i.ibb.co/cbWKK6v/hide.png"
    };
  },
  computed: {
    getAllAirwayBillNumbers: function() {
      return this.$store.getters.getAllAirwayBillNumbers;
    },
    getAllShipments: function() {
      return this.$store.getters.getShipments;
    },
  },
  methods: {
    onSearch: function(e) {
      if (e.keyCode === 13) {
        if (
          this.result !== "" &&
          this.result.length === 12 &&
          this.result[3] === "-"
        ) {
          let imgFlight = "";
          if (this.result.substring(0, 3) === "074" || this.result.substring(0, 3) === "057") {
            imgFlight = "https://i.ibb.co/x5nM7Qv/klm.png";
          }
          if (this.result.substring(0, 3) === "020") {
            imgFlight = "https://i.ibb.co/px8YQbb/luft-2.png";
          }
          if (this.result.substring(0, 3) === "157") {
            imgFlight = "https://i.ibb.co/XjNvVYS/qatar.png";
          }
          this.results.push({
            name: this.result,
            opacity: 1,
            imgHide: "https://i.ibb.co/ZMV4JvL/eye.png",
            img: imgFlight,
          });

          axios
            .get("http://localhost:8080/shipment/single/" + this.result)
            .then((response) => {
              response.data.isVisible = true;
              response.data.airlineLogo = imgFlight;
              this.$store.commit("addShipment", response);
              this.result = "";
              this.showing = true;
            })
            .catch((error) => console.log(error));
        } else {
          this.$alert("Please enter a valid AWB", "", "error");
        }
      }
    },
    onHide(shipment) {
      shipment.isVisible = !shipment.isVisible;
      EventBus.$emit("removeInfoByAwb", shipment.airwayBillNumber);
      // if (shipment.isVisible) {
      //   res.opacity = 0.5;
      //   res.imgHide = "https://i.ibb.co/cbWKK6v/hide.png";
      // } else {
      //   res.opacity = 1;
      //   res.imgHide = "https://i.ibb.co/ZMV4JvL/eye.png";
      // }
    },
    onDelete(awb) {
      EventBus.$emit("removeInfoByAwb", awb);
      this.$store.commit("removeShipment", awb);
    },
    ShowFlightInfo(shipment) {
      console.log('hey');
      console.log(shipment.airwayBillNumber);
      EventBus.$emit("showFlightInfo", shipment);
    },
  },
};
</script>
