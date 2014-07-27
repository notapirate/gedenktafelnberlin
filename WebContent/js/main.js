// OpenStreetMap with Leaflet:
var map;
var posmarker;
var mq;

function initmap() {
	mq = window.matchMedia( "(min-width: 480px)" );
	// set up the map
	map = new L.Map('map');

	// create the tile layer with correct attribution
	var bounds_text = "berlin";
	var bounds_berlin = L.latLngBounds([52.33, 13.77], [52.69, 13.08]);
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var berlinUrl='http://fbinter.stadt-berlin.de/fb/wms/senstadt/berlinzoom';
	var xyz = 'http://www.umwelt.sachsen.de/umwelt/infosysteme/ags/services/wasser/gewaesserpegelmessnetz/MapServer/WMSServer';
	var osmAttrib='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var bounds = L.latLngBounds(L.latLng(52.3005, 12.9709), L.latLng(52.6954, 13.8109));
	var osm = new L.TileLayer(osmUrl, {
		minZoom: 12,
		attribution: osmAttrib,
		bounds: bounds_berlin,
		reuseTiles: true
	});
	/*var crs = new L.Proj.CRS.TMS('EPSG:3068',
	        '+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +datum=potsdam +units=m +no_defs"',
	        [20810, 19620, 27200, 24435],
	        { resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25] }
	    );
	var berlinzoom = L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/berlinzoom", {
		crs: crs,
	    layers: '0',
	    minZoom: 11,
	    format: 'image/png',
	    attribution: "Geoportal Berlin / Berlin-Zoom"
	});
	var hauptstadt = L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/TK10_BHB", {
		crs: crs,
	    layers: '0',
	    minZoom: 11,
	    format: 'image/png',
	    attribution: "Geoportal Berlin / Bundeshauptstadt Berlin"
	});
	
	var overlay = {
		'berlinzoom': new L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/berlinzoom", {
		crs: crs,
	    layers: '0',
	    format: 'image/png',
	    attribution: "Geoportal Berlin / Berlin-Zoom"
	}),
	'detailnetz': new L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_vms_detailnetz_wms_spatial", {
	    layers: '0,1,2,3,4',
	    //styles: 'default',
	    format: 'image/png',
	    attribution: "Geoportal Berlin / Detailnetz"
	}),
	'Blockkarte': new L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/ISU5", {
		crs: crs,
	    layers: '0,1,2,3,4,5,6,7',
	    format: 'image/png',
	    attribution: "Geoportal Berlin / Blockkarte"
	})
	}*/

	// start the map in Berlin
	// setView must be called in case the user ignores the location request or chooses "Not now" (Firefox), which fires no callback
	map.setView([52.52001, 13.40495],12);
	posmarker = L.marker([1,1]).bindPopup('Ihre Position').addTo(map);
	
	// If supported, set marker on current location. User can still deny.
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(geolocation_action);
	}
	map.addLayer(osm);
	//hauptstadt.addTo(map);
	
	// Define icons for existent and removed boards
	var board = L.icon({
	    iconUrl: 'js/images/t_board_pin.png',
	    shadowUrl: 'js/images/st_board_pin.png',

	    iconSize:     [60, 48], // size of the icon
	    shadowSize:   [80, 48], // size of the shadow
	    iconAnchor:   [22, 47], // point of the icon which will correspond to marker's location
	    shadowAnchor: [12, 47],  // the same for the shadow
	    popupAnchor:  [15, -40] // point from which the popup should open relative to the iconAnchor
	});
	
	var r_board = L.icon({
	    iconUrl: 'js/images/r_board_pin.png',
	    shadowUrl: 'js/images/st_board_pin.png',

	    iconSize:     [60, 48], // size of the icon
	    shadowSize:   [80, 48], // size of the shadow
	    iconAnchor:   [22, 47], // point of the icon which will correspond to marker's location
	    shadowAnchor: [12, 47],  // the same for the shadow
	    popupAnchor:  [15, -40] // point from which the popup should open relative to the iconAnchor
	});

	var items = L.geoJson(null, {
		// Set normal board icon
		pointToLayer: function (feature, latlng) {
        	return L.marker(latlng, {icon: board});
    	},	
		onEachFeature: onEachFeature
	});
	
	var items_removed = L.geoJson(null, {
		// Set removed board icon
		pointToLayer: function (feature, latlng) {
        	return L.marker(latlng, {icon: r_board});
    	},
		onEachFeature: onEachFeature
	});
	
	var markers = L.markerClusterGroup(),
	markers_removed = L.markerClusterGroup();
	
	// Add text to header buttons on wide screens
	if(mq.matches) {
		document.getElementById("pos").innerHTML = 'Position';
		document.getElementById("pos").className = 'ui-btn ui-btn-inline ui-icon-location ui-btn-icon-left ui-btn-left ui-corner-all';
		/*document.getElementById("search").innerHTML = 'Suche';
		document.getElementById("search").className = 'ui-btn ui-btn-inline ui-icon-location ui-btn-icon-left ui-btn-right ui-corner-all';*/
	}
	
	// Read data from xml file
	/*$.ajax({
		type: "GET",
		url: "Gedenktafeln_1.xml",
		dataType: "xml",
		success: function(xml) {
	$(xml).find("item").each(function(){
		// Get content from file
		var name = $(this).find("Name").text();
		var removed = $(this).find("entfernt").text();
		if(removed.match("1")) name += ' (entfernt)';
		var lon = parseFloat($(this).find("longitude").text());
        var lat = parseFloat($(this).find("latitude").text());
		
		var data = {
		    "type": "Feature",
		    "properties": {
		        "name": name,
		        "address": $(this).find("strasse").text() + ", " + $(this).find("ortsteil").text(),
		        "description": $(this).find("erlauterung").text(),
		        "content": $(this).find("inhalt").text(),
		        "url": $(this).find("url").text()
		    },
		    "geometry": {
		        "type": "Point",
		        "coordinates": [lon,lat]
		    }
		};
		if(removed.match("1")) items_removed.addData(data);
		else items.addData(data);
    });
		}
		});*/
		
		// Read data from json file
		$.ajax({
			type: "GET",
			url: "data/gedenktafeln.json",
			dataType: "json",
			success: function(json) {
				$.each(json, function(key, val){
					if(key.indexOf('features') > -1) for(var i in val) {
						var removed = val[i].properties.entfernt;
						if(removed.match("1")) {
							val[i].properties.Name += ' (entfernt)';
							items_removed.addData(val[i]);
						}
						else items.addData(val[i]);
					}
				});	
				markers.addLayer(items);
				markers_removed.addLayer(items_removed);
				map.addLayer(markers);
			}
		});
	
	L.control.layers(null, {"Entfernte Tafeln": markers_removed}).addTo(map);
	
	// Get position on 'Position'-button click
	$('#pos').click(function() {
		navigator.geolocation.getCurrentPosition(geolocation_action, errors_action, {enableHighAccuracy : true});
	});
	
}

function errors_action(error) {
    switch(error.code){
        case error.PERMISSION_DENIED: alert("Der Nutzer m&ouml;chte keine Daten teilen.");break;
        case error.POSITION_UNAVAILABLE: alert("Die Geodaten sind nicht erreichbar.");break;
        case error.PERMISSION_DENIED: alert("Timeout erhalten");break;
        default: alert ("Unbekannter Error");break;
    }
}

function geolocation_action(position){
	// Center map on position and place a marker with popup there 
    var latlng = new L.LatLng(position.coords.latitude,position.coords.longitude);
    map.panTo(latlng);
    posmarker.setLatLng(latlng).update().openPopup();
}

function onEachFeature(feature, layer) {
	var address = feature.properties.strasse + ", " + feature.properties.ortsteil;
    layer.on('click', function(e){
    	if(mq.matches) {
    		// Wide screen: Open Panel
    		layer.bindPopup(feature.properties.Name, {autoPan: false});
    		//layer.setIcon(c_board);
    		document.getElementById("w-address").innerHTML = address;
    		document.getElementById("w-name").innerHTML = feature.properties.Name;
    		document.getElementById("w-description").innerHTML = feature.properties.inhalt;
    		document.getElementById("w-content").innerHTML = feature.properties.erlauterung;
    		document.getElementById("w-link").href = feature.properties.url;
    		layer.openPopup();
    		$( "#contentpanel" ).panel({
    			beforeclose: function( event, ui ) {
    				//layer.setIcon(board);
    				layer.closePopup();
    			}
    		});
    		$( "#contentpanel" ).panel( "open" );
    	}
    	else {
    		// Mobile screen: Open new page
    		document.getElementById("m-link").href = feature.properties.url;
    		document.getElementById("m-name").innerHTML = feature.properties.Name;
    		document.getElementById("m-address").innerHTML = address;
        	document.getElementById("m-description").innerHTML = feature.properties.inhalt;
        	document.getElementById("m-content").innerHTML = feature.properties.erlauterung;
        	$( "body" ).pagecontainer( "change", "#contentpage" );
    	}
    
    });
}

initmap();