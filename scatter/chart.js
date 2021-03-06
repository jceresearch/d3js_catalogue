
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    padding = 1, // separation between nodes
    radius = 6;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var controls = d3.select("body").append("label")
    .attr("id", "controls");
var checkbox = controls.append("input")
    .attr("id", "collisiondetection")
    .attr("type", "checkbox");
controls.append("span")
    .text("Collision detection");

d3.tsv("data.tsv", function(error, data) {
  var xVar = "sepalWidth",
      yVar = "sepalLength";

  data.forEach(function(d) {
    d[xVar] = +d[xVar];
    d[yVar] = +d[yVar];
  });

  var force = d3.layout.force()
    .nodes(data)
    .size([width, height])
    .on("tick", tick)
    .charge(-1)
    .gravity(0)
    .chargeDistance(20);

  x.domain(d3.extent(data, function(d) { return d[xVar]; })).nice();
  y.domain(d3.extent(data, function(d) { return d[yVar]; })).nice();

  // Set initial positions
  data.forEach(function(d) {
    d.x = x(d[xVar]);
    d.y = y(d[yVar]);
    d.color = color(d.species);
    d.radius = radius;
  });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sepal Width (cm)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sepal Length (cm)")

  var node = svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius)
      .attr("cx", function(d) { return x(d[xVar]); })
      .attr("cy", function(d) { return y(d[yVar]); })
      .style("fill", function(d) { return d.color; });

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  d3.select("#collisiondetection").on("change", function() {
    force.resume();
  });

  force.start();

  function tick(e) {
    node.each(moveTowardDataPosition(e.alpha));

    if (checkbox.node().checked) node.each(collide(e.alpha));

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function moveTowardDataPosition(alpha) {
    return function(d) {
      d.x += (x(d[xVar]) - d.x) * 0.1 * alpha;
      d.y += (y(d[yVar]) - d.y) * 0.1 * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(data);
    return function(d) {
      var r = d.radius + radius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

});
