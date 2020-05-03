

  var dimension_color= "cluster"; //or "rag"


  var width = 800,
      height = 600,
      maxRadius = 12,
      padding = 1.5, // separation between same-color nodes
      clusterPadding = 6;



//unique cluster/group id's
var cs = [];
data.forEach(function(d){
              if(!cs.includes(d.group)) {
                  cs.push(d.group);
              }
      });
  var n = data.length, // total number of nodes
          m = cs.length; // number of distinct clusters

  var color_scheme = new Object();
   color_scheme["rag"] = d3.scaleOrdinal().domain([1,2,3,4]).range(["#7ac943", "#FEE350","#FEB500","#f21c23"]);
   color_scheme ["cluster"] = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(m));

  //create nodes
  var nodes = [];
  var clusters = new Array(m);

  for (var i = 0; i<n; i++){
      nodes.push(create_nodes(data,i));
  }

  function create_nodes(data,node_counter) {
    var i = cs.indexOf(data[node_counter].group),
        r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
        d = {
          cluster: i,
          r: data[node_counter].size * 10 ,
          text: data[node_counter].text,
          rag: data[node_counter].rag,
          group: data[node_counter].group
        };
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    return d;
  };



  let svg = d3.select('body')
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Define the div for the tooltip
  let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  let circles = svg
            .datum(nodes)
            .selectAll(".g")
            .data(d => d)
            .enter().append("g")

            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", function(d) {
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div .html( "System: " + d.text+ "<br/> Installed on... "  )
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          })
          .append("circle")
                .attr("r", function(d) { return d.r; })
                .attr("fill", function(d) { return color_scheme[dimension_color](d[dimension_color]); })
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .append("text")
                      .text(function(d) {return d.text;})
                      .attr("font-family", "Arial")
                      .attr("dy", ".3em")
                      .style("text-anchor", "middle")




  var simulation = d3.forceSimulation(nodes)
      .velocityDecay(0.2)
      .force("x", d3.forceX().strength(.002))
      .force("y", d3.forceY().strength(.002))
    //  .force("center", d3.forceCenter(width/2, height/2))
      .force("collide", collide)
      //.force('collide', d3.forceCollide(function (d) { return d.radius + padding; }).iterations(1))
      // .force("collide", d3.forceCollide().radius(d => d.r + 1) .strength(0.8)) //Original collide function
      //.force("collide", forceClusterCollision()
      //        .radius(d => d.r + 1)
      //        .strength(0.8)
      //        .clusterPadding(10) //new setting - important, the cluster id of the data has to be named "cluster")



     .force("cluster", clustering)
    //  .force("cluster", d3.forceCluster().centers(function (d) { return clusters[d.cluster]; }).strength(0.5))

      //.force("gravity", d3.forceManyBody(30))

      .on("tick", ticked);


function ticked() {
    //circles
       //.attr('cx', (d) => d.x)
       //.attr('cy', (d) => d.y);
    circles.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
  }



  // These are implementations of the custom forces.
   function clustering(alpha) {
       nodes.forEach(function(d) {
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
     nodes.forEach(function(d) {
       var r = d.r + maxRadius + Math.max(padding, clusterPadding),
           nx1 = d.x - r,
           nx2 = d.x + r,
           ny1 = d.y - r,
           ny2 = d.y + r;
       quadtree.visit(function(quad, x1, y1, x2, y2) {

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









  var collide2 = d3.forceCollide()
        .radius(function(d) { return d.radius + 2; })
        .iterations(1);





  function clustering2(alpha) {
    for (var i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
      node = nodes[i];
      cluster = clusters[node.cluster];
      node.vx -= (node.x - cluster.x) * k;
      node.vy -= (node.y - cluster.y) * k;
    }
};

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



var changeGrouping = function(grouping){
  dimension_color = grouping
  simulation.alpha(0.6).restart();
  simulation.alphaTarget(0);


}


function forceClusterCollision() {
  let nodes
  let radii
  let strength = 1
  let iterations = 1
  let clusterPadding = 0 //addition

  function radius(d) { return d.r }
  function x(d) { return d.x + d.vx }
  function y(d) { return d.y + d.vy }
  function constant(x) { return function() { return x } }
  function jiggle() { return 1e-6 } //change - PLEASE no Math.random() in there ಥ﹏ಥ
  // function jiggle() { return (Math.random() - 0.5) * 1e-6 }

  function force() {
    let i
    let n = nodes.length
    let tree
    let node
    let xi
    let yi
    let ri
    let ri2

    for (let k = 0; k < iterations; ++k) {
      tree = d3.quadtree(nodes, x, y).visitAfter(prepare)
      for (i = 0; i < n; ++i) {
        node = nodes[i]
        ri = radii[node.index]
        ri2 = ri * ri
        xi = node.x + node.vx
        yi = node.y + node.vy
        tree.visit(apply)
      }//for i
    }//for k

    function apply(quad, x0, y0, x1, y1) {
      let data = quad.data
      let rj = quad.r
      let r = ri + rj + clusterPadding //change
      if (data) {
        if (data.index > node.index) {
          let x = xi - data.x - data.vx
          let y = yi - data.y - data.vy
          let l = x * x + y * y
          r = ri + rj + (node.cluster !== quad.data.cluster ? clusterPadding : 0) //addition

          if (l < r * r) {
            if (x === 0) x = jiggle(), l += x * x
            if (y === 0) y = jiggle(), l += y * y
            l = (r - (l = Math.sqrt(l))) / l * strength
            node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj))
            node.vy += (y *= l) * r
            data.vx -= x * (r = 1 - r)
            data.vy -= y * r
          }//if
        }//if
        return
      }//if
        return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r
      }//apply
    }//force

    function prepare(quad) {
      if (quad.data) return quad.r = radii[quad.data.index];
      for (let i = quad.r = 0; i < 4; ++i) {
        if (quad[i] && quad[i].r > quad.r) {
          quad.r = quad[i].r
        }//if
      }//for i
    }

    function initialize() {
      if (!nodes) return;
      let i, n = nodes.length, node
      radii = new Array(n)
      for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes)
    }

    force.initialize = function (_) {
      nodes = _
      initialize()
      return force
    }

    force.iterations = function (_) {
      return arguments.length ? (iterations = +_, force) : iterations
    }

    //I wish strength could be a function of the node as well...
    force.strength = function (_) {
      return arguments.length ? (strength = +_, force) : strength
    }

    force.radius = function (_) {
      return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), force) : radius
    }

    //addition - the actual pixels of padding
    force.clusterPadding = function (_) {
      return arguments.length ? (clusterPadding = +_, force) : clusterPadding
    }

    return force
  }//function forceCollision
