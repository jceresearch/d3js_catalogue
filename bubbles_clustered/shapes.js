// https://bl.ocks.org/Thanaporn-sk/c7f74cb5051a0cdf6cf077a9db332dfb
var width = 900;
var height = 700;
var padding = 1; // separation between same-color nodes
var clusterPadding = 10; //separation between clusters
var minRadius = 30;
var clustering_field = "group" //Initial grouping/clustering field
var current_cluster_size = 0
var data_field_names = ['size', 'text', 'rag', 'group', 'records'] //field list from data
var node_field_names = ['size', 'text', 'rag', 'group', 'records'] //translation
var node_field_labels = ['T-Shirt', 'Description', 'RAG', 'BU', 'Customer Records'] //nicer looking labels
var node_field_tooltip = ['size', 'text', 'rag', 'group']
var node_field_tooltip_label = ['T-Shirt', 'Description', 'RAG', 'BU'] //nicer looking labels
var colour_field = 'group'

function generate_html_tooltip(d) {
  let t = "Details:"
  var n = node_field_tooltip.length
  for (var i = 0; i < n; i++) {
    t = t + "<br/>" + node_field_tooltip_label[i] + ': ' + d[node_field_tooltip[i]]
  }
  return t
}

//*
 * Creates the data nodes from the data variable/json
 * @param  {array} data [flat array of dictionary objects]
 * @return {array}     [flat array of dictionary objects with new fieldnames]
 */
function createNodes(data) {
  let nodeArray = []
  let n = data.length; // count of nodes
  let m = data_field_names.length //count  of fields to import into the nodes
  for (var i = 0; i < n; i++) {
    d = []
    for (var j = 0; j < n; j++) {
      d[node_field_names[j]] = data[i][data_field_names[j]]
    }
    d.r = d.size * 10;
    d.curr_colour = ''
    nodeArray.push(d);
  }
  return nodeArray
}
// colour scheme will be a collection of objects, with a default one and custom ones
// create the custom ones below, ie for a specific RAG etc, associated to a hard coded
// input field in the data. Otherwise the default color scheme will be used
var colour_scheme = new Object();
colour_scheme["rag"] = d3.scaleOrdinal()
  .domain([1, 2, 3, 4])
  .range(["#7ac943", "#FEE350", "#FEB500", "#f21c23"]);

function recalculate_clusters(nodes, clustering_field) {
  let cl = [] //array, internal variable
  let n = nodes.length; // total number of nodes
  let result = nodes.map(a => a[clustering_field]);
  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }
  clusterunique = result.filter(unique)
  current_cluster_size = clusterunique.length //we update a global variable so that the colour scheme can workout the ranges
  for (var i = 0; i < n; i++) {
    let cid = clusterunique.indexOf(nodes[i][clustering_field])
    nodes[i].cluster = cid //we add the cluster id
    if (!cl[cid] || (nodes[i].r > cl[cid].r)) {
      cl[cid] = nodes[i]
    };
  }
  if (colour_scheme[clustering_field] == null) {
    if (current_cluster_size > 12) {
      colour_scheme[clustering_field] = function (v) {
        let t = d3.hsl((clusterunique.indexOf(v) / current_cluster_size) * 360, 1, 0.5)
          .toString();
        return t
      }
    } else {
      colour_scheme[clustering_field] = d3.scaleOrdinal(d3.schemePaired)
        .domain(d3.range(current_cluster_size));
    };
  }
  return cl
};

function changeColour(colour_dimension = colour_field) {
  gnodes.selectAll("circle")
    .attr("fill", function (d) {
      d.curr_colour = colour_scheme[colour_dimension](d[colour_dimension])
      return d.curr_colour
    })
  colour_field = colour_dimension;
}

function changeGrouping(dimension) {
  //TODO: Implement change of clustering
  clusters = recalculate_clusters(nodes, dimension)
  changeColour(dimension)
  simulation.alpha(0.6)
    .restart();
  simulation.alphaTarget(0);
}
// This is standard activity when the simulation is on
function ticked() {
  gnodes.attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  })
}
// These are implementations of the custom forces.
function clustering(alpha) {
  nodes.forEach(function (d) {
    let cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
      y = d.y - cluster.y,
      l = Math.sqrt(x * x + y * y),
      r = d.r + cluster.r;
    if (l !== r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  });
}

function collide(alpha) {
  var quadtree = d3.quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll(nodes);
  nodes.forEach(function (d) {
    var r = d.r + padding
    var nx1 = d.x - r,
      nx2 = d.x + r,
      ny1 = d.y - r,
      ny2 = d.y + r;
    quadtree.visit(function (quad, x1, y1, x2, y2) {
      if (quad.data && (quad.data !== d)) {
        var x = d.x - quad.data.x,
          y = d.y - quad.data.y,
          l = Math.sqrt(x * x + y * y),
          r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha * 1.9;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.data.x += x;
          quad.data.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  });
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3)
    .restart();
  d.fx = d.x;
  d.fy = d.y;
};

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
};

function tooltip_on(d) {
  d3.select(this)
    .select("circle")
    .style("fill",
      function (d) {
        return d3.rgb(d.curr_colour)
          .darker();
      })
  div.transition()
    .duration(200)
    .style("opacity", .9);
  div.html(generate_html_tooltip(d))
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
}

function tooltip_off(d) {
  d3.select(this)
    .select("circle")
    .style("fill", d.current_colour);
  div.transition()
    .duration(500)
    .style("opacity", 0);
}

function drawNodes(nodes) {
  gnodes = svg.datum(nodes)
    .selectAll(".g")
    .data(d => d)
    .enter()
    .append("g")
    .attr("class", 'gnode')
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("mouseover", tooltip_on)
    .on("mouseout", tooltip_off)
  circles = gnodes.append("circle")
    .attr("r", function (d) {
      return d.r;
    })
    .attr("fill", "white")
    .attr('stroke', 'none')
  labels = gnodes.append("text")
    .text(function (d) {
      return d.text;
    })
    .attr("font-family", "Arial")
    .attr("dy", ".3em")
    .style("text-anchor", "middle");
  gnodes.each(function () {
    var currCircle = d3.select(this)
      .select("circle")
    d3.select(this)
      .select("text")
      .style("visibility", function () {
        if (currCircle.attr("r") < minRadius) {
          return "hidden"
        } else {
          return "visible"
        };
      });
  });
  gnodes.transition()
    .delay((d, i) => Math.random() * 300)
    .duration(300)
    .attrTween("r", d => {
      const i = d3.interpolate(0, d.r)
      return t => d.r = i(t);
    })
}

function simulate() {
  return d3.forceSimulation(nodes)
    .velocityDecay(0.5)
    .force("x", d3.forceX()
      .strength(.007))
    .force("y", d3.forceY()
      .strength(.007))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", collide)
    .force("cluster", clustering)
    //.force("gravity", d3.forceManyBody(1))
    .on("tick", ticked);
}
//Main routine
//We create the SVG frame
//TODO: How to make it bigger and pan/zoomable
var gnodes
var circles
var labels
var nodes = createNodes(data)
var clusters = recalculate_clusters(nodes, clustering_field)
var svg = d3.select('body')
  .append('svg')
  .attr('height', height)
  .attr('width', width)
  .call(d3.zoom()
    .on("zoom", function () {
      svg.attr("transform", d3.event.transform)
    }))
  .append("g")
// Define the div for the tooltip
var div = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
//We create the "g" nodes bound to the data, we dont bound to circles
//because we want to add labels and potentially other things.
drawNodes(nodes)
changeColour(colour_field)
var simulation = simulate()
