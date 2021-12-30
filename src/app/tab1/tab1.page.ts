/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Component } from '@angular/core';
import 'leaflet/dist/leaflet.css';
import * as L from "leaflet";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder";
import * as ELG from "esri-leaflet-geocoder";


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  map: L.Map;
  marker;
  propertyList = [];
  locate;
  apiKey = "AAPK0932e4c918794ef190d526dca145eafa4gkMAbVk_i2vyUy3k--v1M6oER9i6hoOtBDBFsk-xxs9CEyAGNrjFlHNKFMbVOEi";
  basemapEnum = "ArcGIS:Navigation";//Streets

  constructor() { }

  ionViewDidEnter() {
    this.leafletMap();
  }

  leafletMap() {
    //initial settings
    //  Map options, Map rendering, Marker options
    this.map = new L.Map('map1', {
      minZoom: 2
    }).setView([41.390205,2.154007], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'edupala.com © Angular LeafLet',
    }).addTo(this.map);
    /*
    L.esri.Vector.vectorBasemapLayer(this.basemapEnum, {
      apiKey: this.apiKey
    }).addTo(this.map);
    */

    // Custom icons
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png',
      iconSize:     [28, 45], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [24, 110],  // the same for the shadow
      popupAnchor:  [-7.7, -76] // point from which the popup should open relative to the iconAnchor
    });

    const classicIcon = L.icon({
      iconUrl: 'marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png',

      iconSize:     [28, 45], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [24, 110],  // the same for the shadow
      popupAnchor:  [-8, -76] // point from which the popup should open relative to the iconAnchor
    });

    const locate = new L.LayerGroup().addTo(this.map);
    this.locate = locate;
    this.map.locate({setView: true, watch: true}) /* This will return map so you can do chaining */
        .on('locationfound', function(e){
            const marker = L.marker([e.latitude, e.longitude]).bindPopup('Your are here :)');
            const circle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
                weight: 1,
                color: 'blue',
                fillColor: '#cacaca',
                fillOpacity: 0.2
            });
            locate.addLayer(marker);
            locate.addLayer(circle);
        })
       .on('locationerror', function(e){
            console.log(e);
            alert("Location access denied.");
        });

    //-- Create Controls --

    //- Select dropdown - add to the top-right of the map
    L.Control.PlacesSelect = L.Control.extend({
      onAdd: function(map) {
        // Array of options
        const optionsInfos = [["","Choose a category..."],["Coffee shop","Coffee shop"],["Gas station","Gas station"],["Food","Food"],["Hotel","Hotel"],["Parks and Outdoors","Parks and Outdoors"]];
        // Create select
        const select = L.DomUtil.create("select","");
        select.setAttribute("id", "optionsSelect");
        select.setAttribute("style", "font-size: 16px;padding:4px 8px;");
        optionsInfos.forEach((optionsInfo) => {
          const option = L.DomUtil.create("option");
          option.value = optionsInfo[0];
          option.innerHTML = optionsInfo[1];
          select.appendChild(option);
        });
        return select;
      },

      onRemove: function(map) {
        // Nothing to do here
      }
    });

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    L.control.placesSelect = function(opts) {
      return new L.Control.PlacesSelect(opts);
    };

    L.control.placesSelect({
      position: 'topright'
    }).addTo(this.map);


    //- Search Control
    const layerGroup = L.layerGroup().addTo(this.map);
    const searchControl = new ELG.Geosearch({
      position: 'topright',
      placeholder: 'Enter an address or place e.g. 1 York St',
      useMapBounds: false,
      showMarker: true,
      marker: this.marker,
      providers: [ELG.arcgisOnlineProvider({
        apikey: this.apiKey, // replace with your api key - https://developers.arcgis.com
        nearby: {
          lat: -33.8688,
          lng: 151.2093
        }
      })]
    }).addTo(this.map);

    const results = new L.LayerGroup().addTo(this.map);
    searchControl
      .on('results', function(data) {
        locate.clearLayers();
        layerGroup.clearLayers();
        results.clearLayers();
        for (let i = data.results.length - 1; i >= 0; i--) {
          results.addLayer(
            L.marker(
              // eslint-disable-next-line max-len
              data.results[i].latlng).bindPopup(`<b>${data.results[i].properties.PlaceName}</b></br>${data.results[i].properties.Place_addr}`)
            );

        }
      })
      .addTo(this.map);

    // When the selected where clause changes, do the geocode
    const select = document.getElementById('optionsSelect');
    select.addEventListener('change', () => {
      const selectValue = (<HTMLInputElement>document.getElementById('optionsSelect')).value;

      if(selectValue !== '') {
        const geocoder = ELG.geocodeService({
          apikey: this.apiKey
        });
        geocoder.geocode()
          .category(selectValue)
          .nearby(this.map.getCenter(), 10)
          .run(function(error, response) {
          if (error) {
            return;
          }

          layerGroup.clearLayers();
          locate.clearLayers();
          response.results.forEach((searchResult) => {
            L.marker(searchResult.latlng)
              .addTo(layerGroup)
              .bindPopup(`<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}`);
          });
        });
      }
    });

    //this.enableMapNewMarkerClickListener();
  }

  enableMapNewMarkerClickListener(){
    const clickable = new L.LayerGroup().addTo(this.map);
      this.map.on('click', function(e) {
        const latlng = e.latlng;

        this.locate.clearLayers();
        clickable.clearLayers();
        clickable.addLayer(
          L.marker(latlng)
          //bindPopup(`<b>${data.results[i].properties.PlaceName}</b></br>${data.results[i].properties.Place_addr}`)
        );
      });
  }

  ionViewWillLeave() {
    this.map.remove();
  }
}
