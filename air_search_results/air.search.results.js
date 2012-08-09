window.onload = function() {
	var cardHeight = 18;
	var cardVerticalMargin = 3;
	var cardBorderWidth = 1;
	var contentHeight = 0;
	var ticks = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1439]; //in minutes
	var minNumOfAirports = 2;
	var maxNumOfAirports = 1000;
	var minNumOfFlights = 200;
	var maxNumOfFlights = 500;
	var minNumOfStops = 0;
	var maxNumOfStops = 3;
	var minLayoverTime = 0;
	var maxLayoverTime = 1439;
	var minDepartTime = 0;
	var maxArrivalTime = 1439;
	var airportChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var origin = "";
	var destination = "";
	var airports = [];
	var flights = [];
	var flightAttrs = [];
	var sortAscend = true;
	var initialAttr = "price";
	var lastAttr = "";

	//build random airport codes
	var numOfAirports = randomMinMax(minNumOfAirports, maxNumOfAirports);
	for (var i = 0; i < numOfAirports; i++) {
		var airport = "";
		for (var j = 0; j < 3; j++) {
			airport += airportChars.charAt(Math.floor(Math.random() * airportChars.length));
		}
		while (airports.indexOf(airport) != -1) {
			airport = "";
			for (var j = 0; j < 2; j++) {
				airport += airportChars.charAt(Math.floor(Math.random() * airportChars.length));
			}
		}
		airports.push(airport);
	}
	
	//pick random origin and destination aiports
	destination = origin = airports[randomMax(airports.length)];
	while (destination == origin) {
		destination = airports[randomMax(airports.length)];
	}

	//build random flights
	var numOfFlights = randomMinMax(minNumOfFlights, maxNumOfFlights);
	for (var i = 0; i < numOfFlights; i++) {
		//build a random flight
		var flight = {};
		var leg = {};
		var numOfLegs = randomMinMax(minNumOfStops, maxNumOfStops) + 1;
		var departTime = randomMinMax(minDepartTime, maxArrivalTime);
		var legAirports = [];
		var legDurationSum = 0;
		//build random legs
		do {
			flight = {};
			flight.legs = [];
			leg = {};
			numOfLegs = randomMinMax(minNumOfStops, maxNumOfStops) + 1;
			departTime = randomMinMax(minDepartTime, maxArrivalTime);
			//build a random leg
			do {
				legAirports = [];
				legDurationSum = 0; 
				legAirports.push(origin);
				for (var j = 1; j < numOfLegs; j++) {
					var airport = airports[randomMax(airports.length)];
					while (legAirports.indexOf(airport) != -1) {
						airport = airports[randomMax(airports.length)];
					}
					legAirports.push(airport);
					legDurationSum += distanceBetweenAirports(legAirports[j - 1], legAirports[j]);
				}
				legAirports.push(destination);
				legDurationSum += distanceBetweenAirports(legAirports[j - 1], legAirports[j]);
			} while (legDurationSum > maxArrivalTime); //redo if the leg is out of the timeline bound (24 hours)
			leg.arrive = 0;
			for (var j = 0; j < numOfLegs; j++) {
				leg = buildLeg(legAirports[j], legAirports[j + 1], departTime); 
				departTime += leg.arrive + randomMinMax(minLayoverTime, maxLayoverTime);
				flight.legs.push(leg);
			}
		} while (leg.arrive > maxArrivalTime); //redo if the flight is out of the timeline bound (24 hours)
		flight = buildFlightAttrs(flight);
		flights.push(flight);
	}
	//build flight sorting attributes
	if (flights.length > 0) {
		var supportedTypes = "number boolean";
		for (var attr in flights[0]) {
			if (supportedTypes.indexOf(typeof flights[0][attr]) != -1) {
				flightAttrs.push(attr);
			}
		}
	}
	
	function buildLeg(airport1, airport2, departTime) {
		var leg = {};
		leg.origin = airport1;
		leg.destination = airport2;
		leg.depart = departTime;
		leg.duration = distanceBetweenAirports(airport1, airport2);
		leg.arrive = leg.depart + leg.duration;
		return leg;
	}
	
	function buildFlightAttrs(flight) {
		flight.price = 0;
		flight.origin = flight.legs[0].origin;
		flight.destination = flight.legs[flight.legs.length - 1].destination;
		flight.depart = flight.legs[0].depart;
		flight.arrive = flight.legs[flight.legs.length - 1].arrive;
		flight.stops = flight.legs.length - 1;
		flight.duration = flight.arrive - flight.depart;
		var airTime = 0;
		for (var i = 0; i < flight.legs.length; i++) {
			airTime += flight.legs[i].duration;
		}
		flight.airTime = airTime;
		flight.layover = flight.duration - flight.airTime;
		//distance between origin and destination x legs factor x time factor
		flight.price = Math.ceil(distanceBetweenAirports(flight.origin, flight.destination) * flightPriceLegsFactor(flight) * flightPriceTimeFactor(flight) / 1000);
		flight.selected = false;
		return flight;
	}
	
	function flightPriceLegsFactor(flight) {
		//the longer of the entire flight duration and the more stops, the cheaper
		return distanceBetweenAirports(flight.origin, flight.destination) / flight.duration / flight.legs.length;
	}
	
	function flightPriceTimeFactor(flight) {
		//red-eye flights suck but are cheaper!
		return Math.min(Math.abs(flight.depart - 60 * 4) + Math.abs(flight.arrive - 60 * 4), Math.abs(flight.depart - 60 * 23) + Math.abs(flight.arrive - 60 * 23));
	}
	
	function distanceBetweenAirports(airport1, airport2) {
		var length = Math.min(airport1.length, airport2.length);
		var distance = 0;
		for (var i = 0; i < length; i++) {
			distance += Math.abs(airport1.charCodeAt(i) - airport2.charCodeAt(i));
		}
		return Math.floor(distance * (maxArrivalTime / (25 * length)));
	}
	
	function randomMax(max) {
		return Math.floor(Math.random() * max);
	}
	
	function randomMinMax(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function minToTime(minitue) {
		return ((minitue - minitue % 60) / 60) + ":" + (minitue % 60);
	}

	function to12(time) {
		var hourMin = time.split(":");
		var hour = parseInt(hourMin[0]);
		var minute = parseInt(hourMin[1]);
		var am = "a";
		var pm = "p";
		if (minute == 0) {
			minute = "";	
		} else {
			minute = ":" + minute;	
		}
		if (hour > 12) {
			hour -= 12;
			return hour + minute + pm;
		} else if (hour == 0) {
			hour += 12;
			return hour + minute + am;
		} else {
			return hour + minute + am;	
		}
	}
	
	function formatAttr(d, attr) {
		if(["depart", "arrive"].indexOf(attr) != -1) {
			return to12(minToTime(d[attr]));
		} else if(["duration", "airTime", "layover"].indexOf(attr) != -1) {
			return minToTime(d[attr]);
		} else {
			return d[attr];
		}	
	}
	
	function showFlight(flight) {
		var s = "";
		for (var attr in flight) {
			if (["depart", "arrive", "duration", "airTime", "layover", "price"].indexOf(attr) != -1) {
				s += attr + ": " + formatAttr(flight, attr) + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}
		}
		return s;
	}
	
	function toggleClass(targetClass, toggleClass) {
		var index = targetClass.indexOf(toggleClass);
		if (index == -1) {
			return targetClass + " " + toggleClass;	
		} else {
			return targetClass.substring(0, index - 1);	
		}
	}
	
	function draw(flights, attr) {
		contentHeight = 0;
		d3.select("#fromTo").text(function() { return origin + " → " + destination; });
		d3.select("#flightSorters").selectAll(".flightSorter").data(flightAttrs).enter().append("div")
			.attr("class", "flightSorter")
				.append("a")
					.attr("class", function(d) { if (d == lastAttr) { return "selected"; } else { return ""; } })
					.attr("href", "#")
					.attr("data-attr", function(d) { return d; })
					.text(function(d) { return d + ((d == lastAttr && d != "selected") ? (sortAscend ? "↑" : "↓") : ""); })
					.on("click", function() { 
						var attr = this.getAttribute("data-attr");
						sortFlights(flights, attr);
						d3.selectAll(".flightSorter a")
							.data(flightAttrs)
							.attr("class", "")
							.text(function(d) { return d; });
						this.setAttribute("class", "selected");
						this.innerHTML = attr + (attr != "selected" ? (sortAscend ? "↑" : "↓") : "");
						draw(flights, attr);
					});
		d3.select("#numOfFlights").text(function() { return flights.length + " flights"; });
		d3.selectAll("#ticks *").remove();
		d3.select("#ticks").selectAll(".tick").data(ticks).enter().append("div")
			.attr("class", "tick")
			.style("left", function(d) { return d + "px"; })
			.text(function(d) { return to12(minToTime(d)); });
		d3.selectAll("#flights *").remove();
		d3.select("#flights").selectAll(".flight").data(flights).enter().append("div")
			.attr("class", function(d) { return (d.selected ? "flight selected" : "flight"); })
			.style("height", function() { return cardHeight + cardBorderWidth * 2 + "px"; })
			.style("top", function(d, i) { var height = cardHeight + cardVerticalMargin + cardBorderWidth * 2; contentHeight += height; return 20 + i * (height) + "px"; })
			.html(function(d) { return formatAttr(d, attr) + "<div class='flightDetails'>" + showFlight(d) + "</div>"; })
			.selectAll(".leg").data(function(d) { return d.legs; }).enter().append("div")
				.attr("class", "leg")
				.style("left", function(d) { return d.depart + "px"; })
				.style("border-width", function() { return cardBorderWidth + "px"; })
				.style("height", function() { return cardHeight + "px"; })
				.style("width", function(d) { return d.arrive - d.depart + "px"; });
		d3.selectAll(".flight")
			.on("click", function(d) {
				resultClass = toggleClass(this.getAttribute("class"), "selected");
				this.setAttribute("class", resultClass);
				d.selected = resultClass.indexOf("selected") != -1;
			});
		d3.selectAll(".leg")
			.html(function(d) { return "<div style='float: left;'>" + d.origin + " [" + to12(minToTime(d.depart)) + "]" + "</div>" + minToTime(d.duration) + "<div style='float: right;'>" + "[" + to12(minToTime(d.arrive)) + "] " + d.destination + "</div>";  });
		d3.select("#content").style("height", function() { return contentHeight + 20 + "px"; });
	}
	
	function sortFlights(flights, attr) {
		if(attr != "selected" && attr == lastAttr) {
			sortAscend = !sortAscend;
		}
		flights.sort(function(a, b) {
			var result = a[attr] - b[attr];
			if (!sortAscend || attr == "selected") {
				return 0 - result;	
			}
			return result;
		});
		lastAttr = attr;
	}
	
	sortFlights(flights, initialAttr);
	draw(flights, initialAttr);
}
