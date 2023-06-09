import React from "react";
import GoogleMapReact from 'google-map-react';
import MarkerClusterer from "../../node_modules/@googlemaps/markerclustererplus";


const AnyReactComponent = ({ text }) => <div>{text}</div>;

class MapComponent extends React.Component{
  constructor(props){
    super(props);
  }
  static defaultProps = {
    center: { lat: 20.5937, lng: 78.9629  },
    zoom: 5
  };
  setGoogleMapRef (map, maps) {
    this.googleMapRef = map
    this.googleRef = maps
    let locations = this.props.ClusteringData;
    let markers = locations && locations.map((location) => {
      return new this.googleRef.Marker({position: location})
    })
    let markerCluster = new MarkerClusterer(map, markers, {
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      gridSize: 10,
      minimumClusterSize: 1
    })
  }
  render(){
    return (
        <div style={{ height: '100vh', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={
              { key: 'AIzaSyCyEkgS8iltcCJsoC17s02KaZL0UNiZJwA'}
            }
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => this.setGoogleMapRef(map, maps)}
          >
          </GoogleMapReact>
        </div>
    );
  }
}

export default MapComponent;
