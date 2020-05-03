
<script src="https://unpkg.com/d3-force-cluster@latest"></script>
<script src="https://unpkg.com/d3-force-attract@latest"></script>


d3.text("word_groups.csv", function(error, text) {
  if (error) throw error;
  var colNames = "text,size,group\n" + text;
  var data = d3.csv.parse(colNames);

  data.forEach(function(d) {
    d.size = +d.size;
  });


  [
  {"text":"SWIFT", "size":8, "group":1,"rag":3},
  {"text":"SWAN", "size":4, "group":2,"rag":4},
  {"text":"POINT", "size":6, "group":1,"rag":4},
  {"text":"CRM", "size":4, "group":1,"rag":1},
  {"text":"PSI", "size":4, "group":2,"rag":4},
  {"text":"REMIX", "size":2, "group":1,"rag":4},
  ];


  Array.prototype.contains = function(v) {
      for(var i = 0; i < this.length; i++) {
          if(this[i] === v) return true;
      }
      return false;
  };

  var textlabels = circle.selectAll("text")
      .data(nodes)
      .enter().append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.text; });


  var circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d[dimension_color]); })
  //    TODO: Update for v4
  //    .call(force.drag);



  .append("text")
        .text(function(d) {return d.text;})
        .attr("font-family", "Arial")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")

  r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,



  // https://bl.ocks.org/Thanaporn-sk/c7f74cb5051a0cdf6cf077a9db332dfb

  var width = 900,
    height = 700,
    maxRadius = 50, // used for the clustering functions
    padding = 1, // separation between same-color nodes
    clusterPadding = 10; //separation between clusters

  //unique cluster/group id's



  //create nodes
  var nodes = [];
  var n = data.length; // total number of nodes
  for (var i = 0; i < n; i++) {
    d = {
      r: data[i].size * 10,
      text: data[i].text,
      rag: data[i].rag,
      group: data[i].group,
    };
    nodes.push(d);
  }

  var clustering_field = "group"
  var clusterunique = new Object();
  clusterunique["group"] = []

  data.forEach(function (d) {
    if (!clusterunique["group"].includes(d.group)) {
      clusterunique["group"].push(d.group);
    }
  });


  var color_scheme = new Object();
  color_scheme["group"] = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(clusterunique["group"].length));
  color_scheme["rag"] = d3.scaleOrdinal().domain([1, 2, 3, 4]).range(["#7ac943", "#FEE350", "#FEB500", "#f21c23"]);


  m = clusterunique[clustering_field].length
  for (var i = 0; i < n; i++) {
    nodes[i].cluster = clusterunique[clustering_field].indexOf(data[i][clustering_field]) //we add the cluster id
    r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius
    if (!clusters[clustering_field][i] || (r > clusters[clustering_field][i].radius)) clusters[clustering_field][i] = nodes[i];
  }



  function clusterise (nodes, clustering_field){
    let clusterunique=[]
    let clusters=[]
    let n = nodes.length; // total number of nodes
    nodes.forEach(function (d) {
      if (!clusterunique.includes(d[clustering_field])) {
        clusterunique.push(d[clustering_field]);
      }
    });
   let m = clusterunique.length
   for (var i = 0; i < n; i++) {
     nodes[i].cluster = clusterunique.indexOf(nodes[i][clustering_field]) //we add the cluster id
     r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius
     if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = nodes[i];
   }
   return clusters
  };

  var clusters =  clusterise(nodes, clustering_field )


  var changeColor = function (dimension) {
    gnodes.select("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .attr("fill", function (d) {
        switch (dimension) {
          case "rag":
            return color_scheme["rag"](d.rag)
            break;
          case "group":
            return color_scheme["group"](d.cluster)
            break;
          default:
            return color_scheme["rag"](d.rag)
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
    simulation.alpha(0.6).restart();
    simulation.alphaTarget(0);
  }

  var changeGrouping = function (dimension) {
    //TODO: Implement change of clustering
    simulation.alpha(0.6).restart();
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
      var cluster = clusters[d.cluster];
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
      var r = d.r + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
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
            l = (l - r) / l * alpha;
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
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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




  //Main routine

  //We create the SVG frame
  //TODO: How to make it bigger and pan/zoomable
  var svg = d3.select('body')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
  //.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //We create the "g" nodes bound to the data, we dont bound to circles
  //because we want to add labels and potentially other things.
  var gnodes = svg
    .datum(nodes)
    .selectAll(".g")
    .data(d => d)
    .enter().append("g")
    .attr("class", 'gnode')
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("mouseover", function (d) {
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html("System: " + d.text + "<br/> Installed on... ")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })


  var circles = gnodes.append("circle")
    .attr("r", function (d) {
      return d.r;
    })
    .attr("fill", "white")
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

  var labels = gnodes.append("text")
    .text(function (d) {
      return d.text;
    })
    .attr("font-family", "Arial")
    .attr("dy", ".3em")
    .style("text-anchor", "middle");




  var simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.2)
    .force("x", d3.forceX().strength(.0002))
    .force("y", d3.forceY().strength(.0002))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", collide)
    .force("cluster", clustering)
    //.force("gravity", d3.forceManyBody(50))
    .on("tick", ticked);

  changeColor("group");
