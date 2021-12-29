import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import L from 'leaflet';
import { antPath } from 'leaflet-ant-path';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  map: Leaflet.Map;


  constructor() {}

  ionViewDidEnter() { this.leafletMap(); }

  leafletMap() {
    this.map = Leaflet.map('map').setView([28.644800, 77.216721], 5);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'edupala.com © Angular LeafLet',
    }).addTo(this.map);

    var classicIcon = L.icon({
      iconUrl: 'marker-icon.png',
      //shadowUrl: 'leaf-shadow.png',
  
      iconSize:     [28, 45], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  [-8, -76] // point from which the popup should open relative to the iconAnchor
    });

    Leaflet.marker([28.6, 77], {icon: classicIcon}).addTo(this.map).bindPopup('Delhi').openPopup();
    Leaflet.marker([34, 77], {icon: classicIcon}).addTo(this.map).bindPopup('Leh').openPopup();

    antPath([[28.6, 77.216721], [34, 77.5771]],
      { color: '#FF0000', weight: 5, opacity: 0.6 })
      .addTo(this.map);
  }

  /** Remove map when we have multiple map object */
  ngOnDestroy() {
    this.map.remove();
  }
  
  }
