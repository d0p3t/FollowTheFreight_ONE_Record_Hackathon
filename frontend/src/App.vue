<template>
  <b-container fluid class="main-container">
    <Nav />
    <b-row align-h="between" style="height:92.5vh;">
      <b-col cols="9" style="height: 100%;">
        <google-map />
      </b-col>
      <b-col cols="3" style="height: 100%; padding-top: 0px;">
        <b-row class="my-awbs-row">
          <b-col cols="12"> <AWB /></b-col>
        </b-row>
        <b-row class="flightinfo-row"
          ><b-col cols="12" style="padding-top: 25px;"> <FlightInfo /></b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #e4e4e4;
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #d3d3d3;
  -webkit-border-radius: 10px;
  border-radius: 10px;
}

.main-container {
  height: 1vh;
  padding-left: 25px !important;
  padding-right: 25px !important;
}
.my-awbs-row {
  height: 40%;
}
.flightinfo-row {
  height: 60%;
}
</style>

<script>
import Nav from "./components/Nav";
import AWB from "./components/AWB";
import FlightInfo from "./components/FlightInfo";
import GoogleMap from "./components/GoogleMap";
export default {
  name: "App",
  components: {
    Nav,
    AWB,
    FlightInfo,
    GoogleMap,
  },
};
</script>
