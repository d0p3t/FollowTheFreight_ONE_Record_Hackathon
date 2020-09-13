<template>   
    <gmap-map
		:center="center"
		:options="{minZoom: 1, maxZoom: 6}"
		:zoom="3"
		style="width:100%;  height: 100%;">
		<gmap-marker	
			:key="index"
			v-for="(m, index) in markers"
			:position="m.position"
			@click="center=m.position">
		</gmap-marker>
		<gmap-polyline 
			:key="i"
			v-for="(p, i) in getGoogleMapsData.shipments"
			:path="p.path" 
			:visible="p.isVisible"
			:options="{strokeColor: p.color, geodesic:true}">
		</gmap-polyline>
		<GmapCircle
			v-for="(p, index) in getGoogleMapsData.points"
			:key="index"
			:center="p.position"
			:radius="1"
			:visible="true"
			:options="{strokeWeight: '14', strokeColor: '#e09100', fillColor:'#e09100',fillOpacity:1.0, border:none}"
		></GmapCircle>
		<GmapCircle
			v-for="(p, index) in getGoogleMapsData.points"
			:key="index"
			:center="p.position"
			:radius="1"
			:visible="true"
			:options="{strokeWeight: '8', strokeColor: '#FFA500', fillColor:'#e09100',fillOpacity:1.0, border:none}"
		></GmapCircle>
    </gmap-map>
</template>

<script>
import {gmapApi} from 'vue2-google-maps';	
import axios from 'axios';

export default {
	name: "GoogleMap",
	computed: {
		getGoogleMapsData: function(){
			console.log(this.$store.getters.getGoogleMapsData);
			return this.$store.getters.getGoogleMapsData;
		},
		
		google: gmapApi
	},

	data() {
		return {
			// default to Montreal to keep it simple
			// change this to whatever makes sense
			center: { lat: 45.508, lng: -73.587 },
			markers: [],
			places: [],
			info: null,
			currentPlace: null,
			paths:[
				
			],
			show_paths:[],
			colors:[
							
			]
		};
	},
	
	mounted() {
		this.geolocate();
	},	

	methods: {
		// receives a place object via the autocomplete component
		setPlace(place) {
			this.currentPlace = place;
		},
		addMarker() {
			if (this.currentPlace) {
				const marker = {
					lat: this.currentPlace.geometry.location.lat(),
					lng: this.currentPlace.geometry.location.lng()
				};
				this.markers.push({ position: marker });
				this.places.push(this.currentPlace);
				this.center = marker;
				this.currentPlace = null;
			}
		},
		geolocate: function() {			
			navigator.geolocation.getCurrentPosition(position => {
				this.center = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
			});			
		},
		
		reload: function(store_data){
			for(var i = 0; i < store_data.length; i++){
				this.addAWB(store_data[i]);
			}
		},
		
		requestAWB: function(AWBNumber){
			axios.get('http://localhost:8080/shipment/single/' + AWBNumber)
				.then(response => (this.drawRoute(response.data)))
				.catch(error => (console.log(error)));
		},
		
		addAWB: function(AWB, color='#FFA500') {			
			console.log(AWB);
			var path = new Array();
			var data = AWB.data;
			var AWBNumber = data.airwayBillNumber;
			var schedules = data.flightPlan.schedules;	
			var visibility = 1;
			
			if (schedules != null){
				
				for(var i = 0; i < schedules.length; i++){
					if (i == schedules.length - 1 || schedules[i].flightNumber != schedules[i+1].flightNumber){
						console.log(schedules[i]);
						path.push({lat: schedules[i].origin.latitude, lng: schedules[i].origin.longitude});
						path.push({lat: schedules[i].destination.latitude, lng: schedules[i].destination.longitude});	
						console.log(path);
					}
				}
			} else {
				path.push({lat: data.originInfo.latitude, lng: data.originInfo.longitude});
				path.push({lat: data.destinationInfo.latitude, lng: data.destinationInfo.longitude});
			}
			console.log(path);
			this.paths.push(path);
			this.colors.push(color);
			this.show_paths.push(visibility);
			this.AWBs.push(AWBNumber);			
		}
	}
};
</script>