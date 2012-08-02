window.onload = function() {
	var cardHeight = 18;
	var cardVerticalMargin = 3;
	var cardBorderWidth = 1;
	var contentHeight = 0;
	var ticks = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1439];
	var minNumOfAirports = 2;
	var maxNumOfAirports = 1000;
	var minNumOfFlights = 100;
	var maxNumOfFlights = 300;
	var minNumOfStops = 0;
	var maxNumOfStops = 3;
	var minLayoverTime = 0;
	var maxLayoverTime = 200;
	var minDepartTime = 0;
	var maxArrivalTime = 1439;
	var airportChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var origin = "";
	var dest = "";
	var airports = [];
	var flights = [];

	//build random airport code array
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
	
	//build origin and destination aiports
	dest = origin = airports[randomMax(airports.length)];
	while (dest == origin) {
		dest = airports[randomMax(airports.length)];
	}

	//build random flights
	var numOfFlights = randomMinMax(minNumOfFlights, maxNumOfFlights);
	for (var i = 0; i < numOfFlights; i++) {
		var flight = {};
		var leg = {};
		var numOfLegs = randomMinMax(minNumOfStops, maxNumOfStops) + 1;
		var departTime = randomMinMax(minDepartTime, maxArrivalTime);
		var legAirports = [];
		var legDurationSum = 0;
		do {
			flight = {};
			flight.legs = [];
			leg = {};
			numOfLegs = randomMinMax(minNumOfStops, maxNumOfStops) + 1;
			departTime = randomMinMax(minDepartTime, maxArrivalTime);
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
				legAirports.push(dest);
				legDurationSum += distanceBetweenAirports(legAirports[j - 1], legAirports[j]);
			} while (legDurationSum > maxArrivalTime);
			leg.arrive = 0;
			for (var j = 0; j < numOfLegs; j++) {
				leg = buildLeg(legAirports[j], legAirports[j + 1], departTime); 
				departTime += leg.arrive + randomMinMax(minLayoverTime, maxLayoverTime);
				flight.legs.push(leg);
			}
		} while (leg.arrive > maxArrivalTime);
		flight = buildFlightInfo(flight);
		flights.push(flight);
	}
	
	function buildLeg(airport1, airport2, departTime) {
		var leg = {};
		leg.origin = airport1;
		leg.dest = airport2;
		leg.depart = departTime;
		leg.duration = distanceBetweenAirports(airport1, airport2);
		leg.arrive = leg.depart + leg.duration;
		return leg;
	}
	
	function buildFlightInfo(flight) {
		flight.origin = flight.legs[0].origin;
		flight.dest = flight.legs[flight.legs.length - 1].dest;
		flight.depart = flight.legs[0].depart;
		flight.arrive = flight.legs[flight.legs.length - 1].arrive;
		flight.duration = flight.arrive - flight.depart;
		var airTime = 0;
		for (var i = 0; i < flight.legs.length; i++) {
			airTime += flight.legs[i].duration;
		}
		flight.airTime = airTime;
		flight.layover = flight.duration - flight.airTime;
		flight.stops = flight.legs.length - 1;
		flight.distance = distanceBetweenAirports(flight.origin, flight.dest);
		flight.price = Math.ceil(flight.distance * flightPriceLegsFactor(flight) * flightPriceTimeFactor(flight) / 1000);
		return flight;
	}
	
	function flightPriceLegsFactor(flight) {
		return flight.distance / flight.duration / flight.legs.length;
	}
	
	function flightPriceTimeFactor(flight) {
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

	function showLeg(leg) {
		var s = "";
		for (var i in leg) {
			s += i + ": " + leg[i] + "\n";
		}
		alert (s);
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
	
	function draw(flights, attr) {
		d3.select("#fromTo").text(function() { return origin + " -> " + dest; });
		d3.select("#flightAttr").text(function() { return attr; });
		d3.selectAll("#ticks *").remove();
		d3.select("#ticks").selectAll("div.tick").data(ticks).enter().append("div")
			.attr("class", "tick")
			.transition()
			.duration(800)
			.style("left", function(d) { return d + "px"; })
			.text(function(d) { return to12(minToTime(d)); });
		d3.selectAll("#flights *").remove();
		d3.select("#flights").selectAll("div.flight").data(flights).enter().append("div")
			.attr("class", "flight")
			.style("height", function() { return cardHeight + cardBorderWidth * 2 + "px"; })
			.style("top", function(d, i) { var height = cardHeight + cardVerticalMargin + cardBorderWidth * 2; contentHeight += height; return 20 + i * (height) + "px"; })
			.text(function(d) { return d[attr]; })
			.selectAll("div.leg").data(function(d) { return d.legs; }).enter().append("div")
				.attr("class", "leg")
				.transition()
				.delay(function (d, i) { return i * d.duration; })
				.duration(function (d) { return d.duration * 2; })
				.style("left", function(d) { return d.depart + "px"; })
				.style("border-width", function() { return cardBorderWidth + "px"; })
				.style("height", function() { return cardHeight + "px"; })
				.style("width", function(d) { return d.arrive - d.depart + "px"; })
				.text(function(d) { return d.origin + " (" + to12(minToTime(d.depart)) + ") -> " + d.dest + " (" + to12(minToTime(d.arrive)) + ")";  });
		d3.selectAll(".flight")
			.on("mouseover", function() { this.className = "flight hover"; })
			.on("mouseout", function() { this.className = "flight"; })
		d3.selectAll(".flight .leg")
			.on("mouseover", function() { this.className = "leg hover"; })
			.on("mouseout", function() { this.className = "leg"; })
			.on("click", function(d) { showLeg(d); });
		d3.select("#content").style("height", function() { return contentHeight + 20 + "px"; });
	}
	
	function sortFlightsAscend(flights, attr) {
		flights.sort(function (a, b) { return a[attr] - b[attr]; });
	}
	
	function sortFlightsDescend(flights, attr) {
		flights.sort(function (a, b) { return b[attr] - a[attr]; });
	}
	
	sortFlightsAscend(flights, "price");
	draw(flights, "price");
			
}
