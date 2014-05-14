var disco = (function() {
	var margin = {top: 20, right: 30, bottom: 30, left: 50};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
    	.range([0, width])
    	.domain([-0.5, 0.5]);

	var y = d3.scale.linear()
    	.range([height, 0])
    	.domain([-0.5, 0.5]);
    	
    var radius = d3.scale.linear()
    	.range([20, 50])
    	.domain([0, 1]);
	
	var svg;
	
	var exitAnimation = {
		shrink: function(selection) {
			selection.transition()
				.attr('r', 0.0001)
				.remove();
		},
		fade: function(selection) {
			selection.transition()
				.style('opacity', 0.0001)
				.remove();
		},
		explode: function(selection) {
			var sR = parseFloat(selection.attr('r'));
			var sX = selection.data()[0].x;
			var dX = d3.random.normal(x(sX), sR);
			var sY = selection.data()[0].y;
			var dY = d3.random.normal(y(sY), sR);
			var fill = selection.style('fill');
			
			var nDebris = 10*Math.pow((sR), 2)/Math.pow((radius.range()[0]), 2);
			var debrisR = Math.sqrt( Math.pow(sR, 2)/nDebris )
			var debris = [];
			for (var i = 0; i < nDebris; i++) {
				debris.push({
					x: x.invert(dX()),
					y: y.invert(dY()),
					r: radius.invert(debrisR),
					fill: fill
				});
			}
			selection.remove();
			
			var debrisPoint = svg.selectAll('.debris').data(debris, function(d) {return 'd'+d.x+d.y+d.r});
			
			debrisPoint.enter()
				.append('circle')
				.attr('class', 'debris')
				.attr('cx', function(d) {return x(d.x)})
				.attr('cy', function(d) {return y(d.y)})
				.attr('r', function(d) {return radius(d.r)})
				.style('fill', fill)
				.style('opacity', 1);
			
			debrisPoint.transition()
				.ease('quad')
				.attr('cx', function(d) {return x((d.x-sX)*50)})
				.attr('cy', function(d) {return y((d.y-sY)*50)});
			debrisPoint.transition()
				.ease('quad-out')
				.style('opacity', 0)
				.remove();
		},
		leave: function(selection) {
			selection.transition()
				.attr('cx', function(d) {return x(d.x*10)})
				.attr('cy', function(d) {return y(d.y*10)})
				.remove();
		}
	}
	plot = {};
	
	plot.init = function() {
		svg = d3.select("body div#plot").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var dropshadow = svg.append('defs')
			.append('filter')
				.attr('id', 'drop-shadow')
				.attr('x', '-100%')
				.attr('y', '-100%')
				.attr('width', '400%')
				.attr('height', '400%');
		
		dropshadow.append('feGaussianBlur')
			.attr('in', 'SourceGraphic')
			.attr('stdDeviation', 10)
			.attr('result', 'blurOut');
		dropshadow.append('feBlend')
			.attr('in', 'SourceGraphic')
			.attr('in2', 'blurOut')
			.attr('mode', 'normal');
	}
	
	plot.data = function(data) {
		var points = svg.selectAll('.points').data([data], function(d) {return d.x+d.y+d.colour});
		points.enter()
			.append('circle')
			.attr('class', 'points')
			.attr('cx', function(d) {return x(d.x)})
			.attr('cy', function(d) {return y(d.y)})
			.attr('r', function(d) {return radius(d.radius)})
			.style('fill', function(d) {return d3.rgb(d.colour.r, d.colour.g, d.colour.b)})
			.style('opacity', 0)
			.style('filter', 'url(#drop-shadow)');
			
		d3.transition().duration(500)
			.each(function() {
				points.transition()
					.style('opacity', 1);
			})
			
		setTimeout(function() {
			d3.transition().duration(2000)
				.each(function() {
					points.call(exitAnimation[data.exit]);
				});
		}, 1500)
	}
	
	return plot;
})()

var plotOutput = new Shiny.OutputBinding();
$.extend(plotOutput, {
	find: function(scope) {
		return $(scope).find(".shiny-output-plot");
	},
	renderValue: function(el, data) {
		if (data) {
			console.log(data)
			disco.data(data);
		}
	}
});

Shiny.outputBindings.register(plotOutput, 'thomasp85.disco');