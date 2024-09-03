
//Icon set from Font Awesome
var ICONS = ['fa-chart-bar', 'fa-car-battery', 'fa-user', 'fa-fire-extinguisher'];

//Map Icons, thanks https://github.com/pointhi/leaflet-color-markers

var blueIcon = new L.Icon({
	iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
	iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var yellowIcon = new L.Icon({
	iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var redIcon = new L.Icon({
	iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

//Cards listed in All Warehouses
var allViewCards = [];

//Values to corresponding All Warehouses cards
var allStatus = {};

//Map instance
var localMap;

//Cards of all locations from data
var StatusCards = {
	cities: {},
	type: {},
	all: [],
	updateValues: function() {
		for (var c in this.all)
			this.all[c].updateValue();
	}
};

//Pins on the map
var AllMarkers = {
	updateMarkersColor: function() {
		for (var city in this.markers) {
			//this.markers[city].options.icon = greenIcon;
			
			var currentCityMetrics = StatusCards.cities[city];
			var severety = -1;
			
			for (var i = 0; i < currentCityMetrics.length; i++) {
				if (currentCityMetrics[i].hasThreshold()) {
					if(currentCityMetrics[i].isWithinThreshold()) {
						severety = Math.max(severety, 0);
						
						if(currentCityMetrics[i].isCritical())
							severety = Math.max(severety, 1);
					} else
						severety = Math.max(severety, 2);
				}
			}
			
			var currIcon = this.markers[city].options.icon;
			switch (severety) {
				//Default
				case -1:
					currIcon = blueIcon;
					break;
				//Within range
				case 0:
					currIcon = greenIcon;
					break;
				//Critical
				case 1:
					currIcon = yellowIcon;
					break;
				//Danger!
				case 2:
					currIcon = redIcon;
					break;
			}
			
			//Set icon
			this.markers[city].setIcon(currIcon);
		}
	},
	markers: {}
};

var dataPoints = [];
var graphSource = null;
var chart = null;
var graphMax = 20;
function initGraph() {
	chart = new CanvasJS.Chart("chartContainer",{
		title:{
			text: "History"
		},
		axisY: {
			includeZero: false,
			lineThickness: 1
		},
		data: [{
			type: "line",
			dataPoints: dataPoints,
		}]
	});
	
	chart.render();
}
function updateChart() {
	if (graphSource)
		addGraphPoint({x: new Date(), y: graphSource.getValue()});
	
	chart.render();
}
function addGraphPoint(coord) {
	dataPoints.push(coord);
	
	while (dataPoints.length > graphMax)
		dataPoints.shift();
}

function Update() {
	StatusCards.updateValues();
	AllMarkers.updateMarkersColor();
	updateAllView();
	updateChart();
}

function addIcon(e, icon, width="fw") {
	var ie = document.createElement('i');
	ie.classList = "fas " + width + " " + icon;
	e.appendChild(ie);
}

function createCard(name, property, loc) {
	//if (StatusCards.filter(e => e.loc === loc && e.name == name).length)
	//	return null;
	
	var row = document.createElement('div');
	row.classList = "row";
	
	var card = document.createElement('div');
	card.classList = "card text-white hovershadow card-block text-white w-100";
	
	var modalLink = document.createElement("a");
	modalLink.classList = "text-white";
	modalLink.href = "#myModal";
	modalLink.dataset["toggle"] = "modal";
	modalLink.dataset["target"] = "#myModal";
	
	var r = document.createElement('div');
	r.classList = "row no-gutters";
	
	var iconHolder = document.createElement('div');
	iconHolder.classList = "col-4 text-center";
	//iconHolder.style.backgroundColor = "#009000";
	iconHolder.style.paddingTop = "40px";
	
	addIcon(iconHolder, ICONS[property.icon_class], "fa-3x");
	
	var textHolder = document.createElement('div');
	textHolder.classList = "col-8 text-center";
	var cardBody = document.createElement('div');
	cardBody.classList = "card-body";
	
	var cardValue = document.createElement('span');
	cardValue.style.fontSize = "16pt";
	
	cardBody.appendChild(cardValue);
	cardBody.appendChild(document.createElement('hr'));
	var name_elem = document.createElement('span');
	name_elem.innerText = name;
	cardBody.appendChild(name_elem);
	textHolder.appendChild(cardBody);
	
	r.appendChild(iconHolder);
	r.appendChild(textHolder);
	modalLink.appendChild(r);
	card.appendChild(modalLink);
	card.appendChild(modalLink);
	row.appendChild(card);
	
	var cardInstance = {
		'name': name,
		'loc': loc,
		'properties': property,
		rowElem: row,
		cardElem: card,
		cardValueElem: cardValue,
		valueHistory: [],
		
		hasThreshold: function() {
			return this.properties.threshold != null;
		},
		
		isWithinThreshold: function() {
			if (!this.hasThreshold()) return true;
			return this.properties.value >= this.properties.threshold.min && this.properties.value <= this.properties.threshold.max;
		},
		
		isCritical: function() {
			if (!this.hasThreshold()) return false;
			if (this.properties.threshold.warn == null) return false;
			return this.properties.value >= this.properties.threshold.warn;
		},
		
		//Update card's DOM value
		setCardValue: function(value) {
			this.cardValueElem.innerText = value;
		},
		
		setCardColor: function(color) {
			this.cardElem.classList.add(color);
		},
		
		setCardColorSeverety: function(s) {
			this.cardElem.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-secondary");
			
			switch(s) {
				case -1:
					this.setCardColor("bg-secondary");
					break;
				case 0:
					this.setCardColor("bg-success");
					break;
				case 1:
					this.setCardColor("bg-warning");
					break;
				case 2:
					this.setCardColor("bg-danger");
					break;
			}
		},
		
		getSeverety: function() {
			if (!this.hasThreshold())
				return -1;
			else if (this.isWithinThreshold()) {
				//If value is reaching the end, give warning
				if (this.isCritical())
					return 1;
				else
					return 0;
			} else
				return 2;
		},
		
		//Colors card based on value
		updateValue: function() {
			this.setCardValue(this.properties.value);
			this.valueHistory.push({x: new Date(), y: this.properties.value});
			
			this.setCardColorSeverety(this.getSeverety());
		},
		
		setValue: function(v) {
			this.properties.value = v;
			this.updateValue();
		},
		
		getValue: function() {
			return this.properties.value;
		}
	};
	
	modalLink.addEventListener("click", function(e) {
		dataPoints.length = 0;
		for (var i=1;i<cardInstance.valueHistory.length; i++)
			dataPoints.push(cardInstance.valueHistory[i]);
		graphSource = cardInstance;
		chart.render();
	});
	
	cardInstance.updateValue();
	
	return cardInstance;
}

function addStatusCard(stat_elem, name, property, loc) {
	var card = createCard(name, property, loc);
	if (card == null) return;
	
	stat_elem.appendChild(card.rowElem);
	stat_elem.appendChild(document.createElement('br'));
	
	return card;
}

function setupMap(mapElem, location, zoom) {
	return L.map(mapElem).setView([location.lat, location.lon], zoom);
}

function createLocationListItem(name, fullTitle, icon="fa-map-pin", active=false) {
	var locationChooserLi = document.createElement("li");
	locationChooserLi.classList = "nav-item";
	var locationChooserElem = document.createElement("a");
	locationChooserElem.id="tab_btn_" + name;
	locationChooserElem.classList = "nav-link text-white " + (active ? "active" : "");
	locationChooserElem.href="#tab_" + name;
	addIcon(locationChooserElem, icon);
	locationChooserElem.append(fullTitle);
	locationChooserElem.dataset['toggle'] = "pill";
	locationChooserElem.dataset['city_name'] = name;
	locationChooserLi.appendChild(locationChooserElem);
	
	return locationChooserLi;
}

function resetAllCardsValues() {
	for (var i in allViewCards)
		allViewCards[i].properties.value = 0;
}

function updateAllView() {
	resetAllCardsValues();
	for (var i in allViewCards) {
		var maxSeverety = -1;
		var total = 0;
		
		for (var c in StatusCards.type[i]) {
			maxSeverety = Math.max(maxSeverety, StatusCards.type[i][c].getSeverety());
			total += StatusCards.type[i][c].getValue();
		}
		
		allViewCards[i].properties.value = total;
		allViewCards[i].updateValue();
		allViewCards[i].setCardColorSeverety(maxSeverety);
	}
}

function initMap(loc) {
	localMap = setupMap('mapid', loc.loc, loc.zoom);
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: ['a','b','c']
	}).addTo(localMap);
	
}

function chooseTab(id) {
	$(id).tab("show");
}

function initFromData(Data) {
	//All locations
	document.getElementById('locContainer').appendChild(createLocationListItem("All", "All Warehouses", "fa-home", true));
	
	//Loop through data
	for (var loc = 0; loc < Data.length; loc++) {
		var currLocation = Data[loc];
		
		//Add a marker on the map
		var marker = L.marker([currLocation.location.latitude, currLocation.location.longitude], {icon: greenIcon})
			.bindPopup('<a href="#" onclick="chooseTab(tab_btn_' + currLocation.location.city + '); return false;">' + currLocation.location.warehouse_name + ', ' + currLocation.location.city + '</a>')
			.addTo(localMap);
		
		AllMarkers.markers[currLocation.location.city] = marker;
		
		//Panel to show status
		var city_panel = document.createElement('div');
		city_panel.id = "tab_"+currLocation.location.city;
		city_panel.classList = "tab-pane fade";
		document.getElementById('statistic_data').appendChild(city_panel);
		
		document.getElementById('locContainer').appendChild(createLocationListItem(currLocation.location.city, currLocation.location.warehouse_name + ", " + currLocation.location.city));
		
		//Status cards
		var stat = currLocation.status;
		for (var prop in stat) {
			if (!stat.hasOwnProperty(prop)) continue;
			
			var card = addStatusCard(city_panel, prop, stat[prop], currLocation.location);
			
			if (!StatusCards.cities[currLocation.location.city])
				StatusCards.cities[currLocation.location.city] = [];
			if (!StatusCards.type[prop])
				StatusCards.type[prop] = [];
			
			//Categorize based on city, type or just all cards
			StatusCards["cities"][currLocation.location.city].push(card);
			StatusCards.type[prop].push(card);
			StatusCards.all.push(card);
			
			if (!allStatus[prop]) {
				allStatus[prop] = {
					value: 0,
					threshold: null,
					icon_class: stat[prop].icon_class
				};
			}
		}
	}
	
	for (var i in allStatus)
		allViewCards[i] = addStatusCard(document.getElementById('tab_All'), i, allStatus[i], "All");
}
