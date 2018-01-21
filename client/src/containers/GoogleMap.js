// almost 100% copy-paste from react-google-maps documentation

import React from 'react';
import _ from 'lodash';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

import { SearchBox } from 'react-google-maps/lib/components/places/SearchBox';

// i don't see a way around this.
const k = 'AIzaSyBXAcVcMKkBiDR3OkoNmemQbAFhJUipnOo';

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${k}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100%' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};

      this.setState({
        bounds: null,
        center: {
          lat: this.props.latitude,
          lng: this.props.longitude,
        },
        markers: [],
        onMapMounted: (ref) => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          });
        },
        onSearchBoxMounted: (ref) => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox
            .getPlaces()
            // this doesn't do a lot, but keeps some non-apartment stuff out of red markers on map
            .filter(p => p.types.includes('lodging') || p.types.includes('establishment'));
          // console.log(places);
          const bounds = new window.google.maps.LatLngBounds();

          places.forEach((place) => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          let nextMarkers = places.map(place => ({
            placename: place.name,
            place_id: place.place_id,
            address_components: place.address_components,
            position: place.geometry.location,
            geo: {
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng()
            }
          }));

          nextMarkers.forEach((place) => {
            switch (place.address_components.length) {
              //Different addresses will return different arrays
              //with cities and counties and such in Different
              //positions. I'm not sure how much variance there is,
              //I was only able to find these three cases
              case 8:
                place.address =
                  place.address_components[0].short_name + " " +
                  place.address_components[1].short_name + " " +
                  place.address_components[3].short_name + " " +
                  place.address_components[5].short_name + " " +
                  place.address_components[7].short_name;
                delete place.address_components;
                break;

              case 7:
                place.address =
                  place.address_components[0].short_name + " " +
                  place.address_components[1].short_name + " " +
                  place.address_components[2].short_name + " " +
                  place.address_components[4].short_name + " " +
                  place.address_components[6].short_name;
                delete place.address_components;
                break;

              case 9:
                place.address =
                  place.address_components[0].short_name + " " +
                  place.address_components[1].short_name + " " +
                  place.address_components[3].short_name + " " +
                  place.address_components[5].short_name + " " +
                  place.address_components[7].short_name;
                delete place.address_components;
                break;

              default:
                delete place.address_components;
                break;
            }
          });

          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);

          this.setState({
            center: nextCenter,
            markers: nextMarkers,
          });
          // refs.map.fitBounds(bounds);
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={10}
    center={props.center}
    onBoundsChanged={props.onBoundsChanged}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Type a location here..."
        style={{
          boxSizing: 'border-box',
          border: '1px solid transparent',
          width: '240px',
          height: '32px',
          marginTop: '27px',
          padding: '0 12px',
          borderRadius: '3px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          fontSize: '14px',
          outline: 'none',
          textOverflow: 'ellipses',
        }}
      />
    </SearchBox>
    {props.markers.map((marker, index) => (
      <Marker
        onClick={() => props.handleClick(marker.place_id, marker.placename, marker.geo, marker.address)}
        key={index} // eslint-disable-line
        position={marker.position}
      />
    ))}
  </GoogleMap>
));

export default MapWithASearchBox;
