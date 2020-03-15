
height = 600
width= 800
var data;

data=
[
[
  ["Group","Red","Overall risks profile is getting worse"]],
[
  ["EMEA","Yellow","Delays due to budget shortages"],
  ["NA","Green","On track"],
  ["APAC",'Green','On track from previous months in yellow, reports need to be validated'],
  ["LATAM",'Red',"Significant delays in rolling out projects"]],
[
  ["SP","Yellow","Delays reported, negative trend"],
  ["PT","Green","On track"],
  ["US","Green","After trying everything else, doing the right thing"],
  ["BR","Red","Three months burning now"]]
];



function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
  };

  function get_data(col,row,z,i){
    var data_text
    var data_colour
    if (z<=2)
    {

      if(i <= data[z].length-1){

        data_text = " C: "+ col + " R: " +row +" Z "+ z + " N: " + i +" " + data[z][i][0]
        if (data[z][i].length>=2){
          data_text= data_text+" "+data[z][i][2]

        };
        data_colour = data[z][i][1]
      }
      else {
        data_text="N/A"
        data_colour="Grey"
      };
    } else {
      data_text=" "
      data_colour= "Grey"
    }
    return [data_text , data_colour]

};

function hilbert(x, y, z) {
  let n = 1 << z, rx, ry, s, d = 0;
  for (s = n >> 1; s > 0; s >>= 1) {
    rx = (x & s) > 0;
    ry = (y & s) > 0;
    d += s * s * ((3 * rx) ^ ry);
    [x, y] = rot(n, x, y, rx, ry);
  }
  return d / (1 << z * 2);
}

function rot(n, x, y, rx, ry) {
  if (!ry) {
    if (rx) {
      x = n - 1 - x;
      y = n - 1 - y;
    }
    return [y, x];
  }
  return [x, y];
}



function zoomed(transform) {
  const tiles = tiler(transform);

  tileGroup.attr("transform", `
    scale(${tiles.scale})
    translate(${tiles.translate.join(",")})
  `);

  tile = tile.data(tiles, d => d).join(
    enter => enter.append("g")
        .attr("transform", ([x, y]) => `translate(${x}, ${y}) scale(${1 / 256})`)
        .call(g => g.append("rect")
            .attr("fill", function (t,i) {
                     return get_data(t[0], t[1] ,t[2], i)[1];
                 })
            .attr("fill-opacity", 0.5)
            .attr("stroke", "black")
            .attr("width", 256)
            .attr("height", 256))
         .call(g => g.append("text")
          .attr("x", "0.4em")
          .attr("y", "1.2em")
          .text(function (t,i) {
                     return get_data(t[0], t[1] ,t[2], i)[0];
                 }))

  );
};

const svg = d3.select("body").append("svg")
.attr("height",height)
.attr("width",width)
.attr("viewBox", [0, 0, width, height]);

const tiler = d3.tile()
        .extent([[0, 0], [width, height]]);
zoom = d3.zoom()
    .scaleExtent([1 << 8, 1 << 22])
    .extent([[0, 0], [width, height]])
    .on("zoom", () => zoomed(d3.event.transform));

tileGroup = svg.append("g")
    .attr("pointer-events", "none")
    .attr("font-family", "var(--sans-serif)")
    .attr("font-size", 16);

let tile = tileGroup.selectAll("g");

svg
    .call(zoom)
    .call(zoom.transform,
        d3.zoomIdentity.translate(width >> 1, height >> 1).scale(1 << 10));
