
var force = d3.layout.force();
//console.log("Force may be with you");




function engine_init()
{
  // we draw the graph with a default dimensions to colorize

//console.log("Debug: canvaz size modes ");
//console.log(settings.canvas_size_modes);
            require("./js/plugins/bubbles/bubbles_config.js");
            
//console.log("Loaded plugin "+ settings.version);
            dataset_load(settings.apiserver + "weaknesses/query/all/");


//console.log(force);
            canvas_init();
            bubble_init();

            plotbackground();
//console.log("Plotting axis");
            plotaxis();
//console.log("initialising bubbles nodes");
            view = new View();
            legendarea = new Legend();

            bubble_init();


//console.log("initial bubble plot")    ;
            bubble_plot();

//console.log("initial select all bubbles");
            bubble_selectByDimensionValue();
            sendtoOort();
            force.gravity(0)
                .charge(.5)
                .friction(0)
                .nodes(activenodes)
                .size([chart_width, chart_height])
                .on("tick", tickconverge);
            force.start();

            colorizebydimension(view.currentDimension.dimensionpointcolour);
            view.currentView="riskmap";
            runFunction(settings.views[view.currentView]["function"],[view.currentDimension["dimensiongroup"]]);
            //arrangeriskmap();





};




      function filter_update(filterentry){

         var valToFilter=filterentry[1];
         var comparison=filterentry[2]; // -1 exact/equal , 0 includes less than or equal, 1 includes greater than or equal
         current_filter[filterentry[0]]=[valToFilter,comparison];

      };


function engine_refreshdata()
{
       dataset_load(settings.apiserver + "weaknesses/query/all/");


      bubble_init();
      bubble_plot(true);
      clearbubbleinfo();



            bubble_selectByDimensionValue();
            sendtoOort();
            force.gravity(0)
                .charge(.5)
                .friction(0)
                .nodes(activenodes)
                .size([chart_width, chart_height])
                .on("tick", tickconverge);
            force.start();

            colorizebydimension(view.currentDimension.dimensionpointcolour);




//console.log("Calling:"+ settings.views[view.currentView]["function"]+" dimension_key:"+view.currentDimension["dimensiongroup"]);
          runFunction(settings.views[view.currentView]["function"],[view.currentDimension["dimensiongroup"]]);



};





function bubble_init(){
//console.log("Initialising bubble nodes with the dataset values");
    nodes = [];
      x = d3.scale.linear()
    .rangeRound([0, chart_width])
    .domain([0, 5.5]).nice();
    y = d3.scale.linear()
       .rangeRound([chart_height, 0])
       .domain([0, 5.5]).nice();

    var default_radius = settings.bubble_size_modes[0][0];


    dataset.forEach(function (d) {

        var node = {
            y: y(d[settings.dimensiony[0]]),
            yori: y(d[settings.dimensiony[0]]),
            clusterfocusy: y(d[settings.dimensiony[0]]),
            clusterfocusyori: y(d[settings.dimensiony[0]]),
            clusterfocusyactive: y(d[settings.dimensiony[0]]),
            x: x(d[settings.dimensionx[0]]),
            xori: x(d[settings.dimensionx[0]]),
            clusterfocusx: x(d[settings.dimensionx[0]]),
            clusterfocusxori: x(d[settings.dimensionx[0]]),
            clusterfocusxactive: x(d[settings.dimensionx[0]]),
            clusterfocusxcurrent:x(d[settings.dimensionx[0]]),
            clusterfocusycurrent:y(d[settings.dimensiony[0]]),
            clusterfocusxwhenselected:x(d[settings.dimensionx[0]]),
            clusterfocusywhenselected:y(d[settings.dimensiony[0]]),
            label: d.label,
            ref: d.ref,
            weight: 1,
            radius: default_radius,
            id: d.id,
            description: d.description,
        };
        for (var key in settings.fields) {
            var type = settings.fields[key].type;
            switch (type) {
            case 'string':
                node[key] = d[key];
            case 'integer':
                node[key] = +d[key];
            case 'boolean':
            default:
                node[key] = d[key];
            };
        };
        nodes.push(node);

    });

    activenodes=nodes;


}

function bubble_plot(flagResetFilter) {

//console.log("Bubble plot");
    flagResetFilter= flagResetFilter || false;
    activenodes=nodes;

    if ( flagResetFilter)
     {
//console.log("Resetting filter");
    current_filter=[];

    }
    else
    {
//console.log("Reapplying filters to activenodes");
    for (var filterentry in current_filter) {
      if (current_filter[filterentry][1]==1)
       { activenodes= activenodes.filter(function (d) {return (   current_filter[filterentry][0]== 0 || d[filterentry] >= current_filter[filterentry][0] );});
       }
      if (current_filter[filterentry][1]==-1)
       { activenodes= activenodes.filter(function (d) {return (   current_filter[filterentry][0] == 0 || d[filterentry] == current_filter[filterentry][0] );});
       }
     if (current_filter[filterentry][1]==0)
       { activenodes= activenodes.filter(function (d) {return (   current_filter[filterentry][0] == 0  || d[filterentry] <= current_filter[filterentry][0] );});
       }
     };
     };


//console.log(activenodes);

  var bubbles= svg.selectAll(".dot")
        .data(activenodes);
  bubbles.enter()
         .append("circle")
            .attr("class", function (d) {
                return "dot selected dot_unselected";
            }) // we could add here more custom classes based on the data
        .attr("id", function (d) {
            return d.id;
        })
            .attr("cy", function (d) {
                return d.x;
            })
            .attr("cx", function (d) {
                return d.y;
            })
            .attr("r", function (d) {
                return d.radius;
            })
            .call(force.drag)
            .on('mousedown', tip.show)
            .on('mouseup', tip.hide)
            .on('click', function (e) {
                    if (d3.select(this).classed("dot_selected")) {
                        d3.select(this).classed("dot_unselected", true);
                        d3.select(this).classed("dot_selected", false);
                        clearbubbleinfo();
                    } else {
                        d3.selectAll(".dot").classed("dot_selected", false);
                        d3.selectAll(".dot").classed("dot_unselected", true);
                        d3.select(this).classed("dot_unselected", false);
                        d3.select(this).classed("dot_selected", true);
                        d3.select(this).each(function (d) {
                            inspector_refresh(d);
                            tagcloud_refresh(d);
                                });
                            }
                        });
bubbles.exit().remove();

//console.log(view);
view.recalculate();
//console.log("Applying colour");
colorizebydimension(view.currentDimension["dimensionpointcolour"]);

//console.log("Reapplying nodes to force");
force.nodes(activenodes);
force.start();
force.alpha(.15);
//console.log("Started force");


}






function canvas_resize() {
    if (current_canvas_size === settings.canvas_size_modes.length - 1) {
        current_canvas_size = 0;
    } else {
        current_canvas_size++;
    };

    canvas_width = settings.canvas_size_modes[current_canvas_size][0];
    canvas_height = settings.canvas_size_modes[current_canvas_size][1];


    chart_width = canvas_width - margin.left - margin.right;
    chart_height = canvas_height - margin.top - margin.bottom;

    console.log("Resizing to:"+canvas_width+"/"+canvas_height);


    canvas_draw();
    plotbackground();
    plotaxis();
    bubble_init();
    bubble_plot();
    bubble_selectAll();

    runFunction(settings.views[view.currentView]["function"],[view.currentDimension["dimensiongroup"]]);


};


function canvas_init()
{

    canvas_width = settings.canvas_size_modes[0][0];
    canvas_height = settings.canvas_size_modes[0][1];

    chart_width = canvas_width - margin.left - margin.right;
    chart_height = canvas_height - margin.top - margin.bottom;
    canvas_draw();


};


function canvas_draw() {


      x = d3.scale.linear()
                .rangeRound([0, chart_width]);
            x.domain([0, 5.5]).nice();
            y = d3.scale.linear()
                .rangeRound([chart_height, 0]);
            y.domain([0, 5.5]).nice();

    d3.select("#svg1").remove();


    svg = d3.select("#chartarea").append("svg")
        .attr("id", "svg1")
        .attr("width", canvas_width + margin.left + margin.right)
        .attr("height", canvas_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // We create here the tip object for the callout tips. The main object needs to be created under
    // the main svg  https://github.com/Caged/d3-tip/blob/master/docs/index.md
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([ 0, 0])
        .html(function (d) {
            return d.title.toWordWrap( 50);
        });
    svg.call(tip);






};

function legendpicker(dimension_key, dimension_value) {

    dimension_value = dimension_value.toLowerCase();
    dimension_key = dimension_key.toLowerCase();
    if (typeof settings.legend[dimension_key] === 'undefined') {
        if (dimension_value.length <= 3) {
            return dimension_value.toUpperCase();
        } else {
            return dimension_value.toTitleCase();
        }
    } else {
        if (typeof settings.legend[dimension_key][dimension_value] === 'undefined') {
            if (dimension_value.length <= 2) {
                return dimension_value.toUpperCase();
            } else {
                return dimension_value.toTitleCase();
            }
        } else {
            return settings.legend[dimension_key][dimension_value];
        }
    };
}

function opacitypicker(dimension_key, dimension_value) {
    if (settings.fields[dimension_key]["type"] === "integer") {
        var domain_start = settings.fields[dimension_key]["rangeStart"] || 0;
        var domain_end = settings.fields[dimension_key]["rangeEnd"] || 100;
        dimension_value = Math.min(dimension_value, domain_end);
        dimension_value = Math.max(dimension_value, domain_start);
        var opacity = d3.scale.linear()
            .domain([domain_start, domain_end / 4, domain_end * .75, domain_end])
            .range([ 1e-6+.1,1]);
        return opacity(dimension_value);
    };
};

function colorpicker(dimension_key, dimension_value) {

//console.log(serieslist[dimension_key]);

    if (typeof settings.colorscheme[dimension_key] === 'undefined') {
        if (settings.fields[dimension_key]["type"] === "integer") {
            var domain_start = settings.fields[dimension_key]["rangeStart"] || 0;
            var domain_end = settings.fields[dimension_key]["rangeEnd"] || 100;
            dimension_value = Math.min(dimension_value, domain_end);
            dimension_value = Math.max(dimension_value, domain_start);
            var color = d3.scale.linear()
                .domain([domain_start, domain_end / 4, domain_end * .75, domain_end])
                .range(["#2c7bb6", "#ffffbf", "#d7191c"])

                .interpolate(d3.interpolateHcl);
            return color(dimension_value);
        } else {
           // console.log("computing colour for "+dimension_key +"/"+ dimension_value)
            var color = d3.scale.category20();
            color.domain(serieslist[dimension_key]);
            return color(dimension_value);
        };
    } else {
        if (typeof settings.colorscheme[settings.fields[dimension_key].fieldname][dimension_value] === 'undefined') {
            return "#000000";
        } else {
            return settings.colorscheme[dimension_key][dimension_value];
        }
    };
}






function chart_reset_to_active() {
    bubble_selectByDimensionValue();

   view.recalculate();
   legendarea.recalculate();
    sendtoOort();
    force.resume();

};

function chart_reset() {
    bubble_plot(true);
    $(".cropSlider").val(0);
    $(".cropSlider").slider('refresh');
    bubble_selectByDimensionValue();

   view.recalculate();
   legendarea.recalculate();
    sendtoOort();
    force.resume();

};


function bubble_selectByDimensionValue(dimension_key, dimension_value, actioncode) {
    // actioncode=1 we bring ALL of that category in
    // actioncode=2 we remove ALL of that category to oort
    // actioncode=3 we bring ALL of that category in, but we send out all the rest
    // actioncode=4 we send out all the rest we dont bring the ones that are in the category but out before


    if (typeof dimension_key==='undefined'){ actioncode = 0; dimension_key=""; dimension_value="";};

    if (typeof actioncode === 'undefined') { actioncode = 3;};

//console.log("Selecting:"+dimension_key+"/"+dimension_value+"/"+actioncode);
    if (actioncode== 0)
    {

  		 svg.selectAll(".dot").classed("unselected", false).classed("selected", true).classed("unselectedx", false).classed("dot_selected", false).classed("dot_unselected", true);

    };


    if (actioncode === 3) {
        svg.selectAll(".dot").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] != dimension_value;
        }).classed("unselected", true).classed("selected", false);
        svg.selectAll(".dot").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselected", false).classed("selected", true);
        svg.selectAll(".dot").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselectedx", false);
    };
    if (actioncode === 4) {
        svg.selectAll(".unselected").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselectedx", true);
        svg.selectAll(".selected").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] != dimension_value;
        }).classed("unselected", true).classed("selected", false);
    };
    if (actioncode === 1) {
        svg.selectAll(".unselected").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselectedx", false);
        svg.selectAll(".dot").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselected", false).classed("selected", true);
        svg.selectAll(".dot").filter(function (d) {
            return d[settings.fields[dimension_key].fieldname] == dimension_value;
        }).classed("unselectedx", false);
    };
    if (actioncode === 2) {
        d3.selectAll(".dot").filter(
            function (d) {
                svg.selectAll(".unselected").filter(function (d) {
                    return d[settings.fields[dimension_key].fieldname] == dimension_value;
                }).classed("unselectedx", false);
                return d[settings.fields[dimension_key].fieldname] == dimension_value;
            }).classed("unselected", true).classed("selected", false);
    };
    sendtoOort();
    force.resume();
    view.recalculate();
    legendarea.recalculate();

};

function sendtoOort(bubbles) {
    var clusterfocusscale = d3.scale.linear().domain([0, 4294967295]).range([1, 360]);

    if (typeof bubbles ==='undefined')
{
    svg.selectAll(".unselected").each(function (d, i) {
    	if (view.currentDimension.dimensiongroup != null)
    	{
    	angle= clusterfocusscale(d[view.currentDimension.dimensiongroup].hashCode());
}

else
{

	angle= clusterfocusscale(d[view.currentDimension.dimensionpointcolour].hashCode());
};

        nodes[d.id]["clusterfocusxcurrent"] = chart_width / 2 + 1500 * Math.cos(angle * (Math.PI / 180));
        nodes[d.id]["clusterfocusycurrent"] = chart_height / 2 + 1500 * Math.sin(angle * (Math.PI / 180));
              if (typeof activenodes[d.id]!= 'undefined')
                    {
                        activenodes[d.id]=nodes[d.id] ;
                    };



    });
    svg.selectAll(".selected").each(function (d, i) {

        nodes[d.id]["clusterfocusxcurrent"] = nodes[d.id]["clusterfocusxwhenselected"];
        nodes[d.id]["clusterfocusycurrent"] = nodes[d.id]["clusterfocusywhenselected"];
        nodes[d.id]["x"] = nodes[d.id]["clusterfocusxwhenselected"];//we may want to remove this to allow converging
        nodes[d.id]["y"] = nodes[d.id]["clusterfocusywhenselected"];//we may want to remove this to allow converging
              if (typeof activenodes[d.id]!= 'undefined')
                    {
                        activenodes[d.id]=nodes[d.id] ;
                    };
    });
}
else
{
	bubbles.each(function(d,i){
		  	//console.log("Hi");

		  	angle= clusterfocusscale(d[view.currentDimension.dimensiongroup].hashCode());


        nodes[d.id]["clusterfocusxcurrent"] = chart_width / 2 + 1500 * Math.cos(angle * (Math.PI / 180));
        nodes[d.id]["clusterfocusycurrent"] = chart_height / 2 + 1500 * Math.sin(angle * (Math.PI / 180));
              if (typeof activenodes[d.id]!= 'undefined')
                    {
                        activenodes[d.id]=nodes[d.id] ;
                    };

	});

};


};


function tagcloud_refresh(nodedata)
{
//console.log(nodedata.tags);
$('#tagcloud').empty();
for (var i=0; i< nodedata["tags"].length ;i++)
{

var tagtext=nodedata["tags"][i];
html_button="<button onclick=\"filterByTag(\'"+tagtext+"\');\" id=\""+ "button_tag"+i+"\">"+tagtext+"</button>";
//console.log(html_button);
 $("#tagcloud").append(html_button);


};

 $("#tagcloud").append("<button onclick=\"filterByTag();\" id=\"button_tagReset\">ClearTags</button>");



}


function inspector_refresh(nodedata) {
var detailtext="";

if (typeof nodedata==='undefined'){
   clearbubbleinfo();
   return;

};

  for (var i = 0; i < settings.detailfields.length; i++) {
   if (typeof nodedata[settings.detailfields[i]] != 'undefined')
        {
               detailtext= detailtext + "<br>"+ settings.fields[settings.detailfields[i]].label +": "+ nodedata[settings.detailfields[i]];
        };
    };
  for (var i = 0; i < settings.updatelogfields.length; i++) {
     detailtext= detailtext + "<br>"+ settings.fields[settings.updatelogfields[i]].label +":";
     updatefieldname=settings.updatelogfields[i];
     if (typeof nodedata[updatefieldname] != 'undefined'){
        for (var j = 0; j < nodedata[updatefieldname].length; j++) {

           detailtext= detailtext + "<br>"+ "Date:"+ nodedata[updatefieldname][j]["date"];
           detailtext= detailtext + "/"+ "User:"+ nodedata[updatefieldname][j]["user"];
           detailtext= detailtext + "/"+ "Update:"+ nodedata[updatefieldname][j]["update"];
    };
    };
   };

    document.getElementById('detail').innerHTML = detailtext;
    $("#detail").addClass('inspection_text');
};

function clearbubbleinfo() {
    document.getElementById('detail').innerHTML = "";
};

function plotbackground() {
    var imgs = svg.selectAll("image").data([0]);
    imgs.enter()
        .append("svg:image")
        .attr("class", "background backgroundxy ")
        .attr("xlink:href", settings.installpath+"background.png")
        .attr("x", "0")
        .attr("y", "0")
        .attr("preserveAspectRatio", "none")
        .attr("width", chart_width)
        .attr("height", chart_height);
};

function plotaxis() {

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues([0, 1, 2, 3, 4, 5])
        .tickFormat(d3.format("0f"))
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues([0, 1, 2, 3, 4, 5])
        .tickFormat(d3.format("0f"))
        .orient("left");


    svg.append("g")
        .attr("class", "axis yaxis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Impact");

    svg.append("g")
        .attr("class", "axis xaxis")
        .attr("transform", "translate(0," + chart_height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", chart_width - 6)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Likelihood");

};




function togglelabels() {
    if (d3.select(".dotlabel").empty()) {
        plotlabel();
        current_label_status = true;
    } else {
        d3.selectAll(".dotlabel").remove();
        current_label_status = false;
    };
};

function plotlabel(field_key) {
    var dotlabels = d3.selectAll(".dotlabel");
    current_label_status = true;
    if (dotlabels.empty()) {
        if (typeof field_key === 'undefined') {
            field_key = settings.labelfields[0];
        }
        current_label_key = field_key;
        svg.append("g").selectAll(".dotlabel")
            .data(nodes)
            .enter().append("text")
            .attr("class", "dotlabel")
            .attr("id", function (d) {
                return d.id;
            })
            .text(function (d) {
                return d[field_key];
            });
        force.start();
    } else {
        if (typeof field_key === 'undefined') {
            n = settings.labelfields.indexOf(current_label_key);
            if (n == settings.labelfields.length - 1) {
                field_key = settings.labelfields[0];
            } else {
                field_key = settings.labelfields[n + 1];
            }
        };
        current_label_key = field_key;
        dotlabels.each(function (d) {
            d3.select(this).text(legendpicker(field_key, d[field_key]));
        });
    };
};

function filterByDimensionWithArray(dimension_key, csvlist)
{

  var  keywords= csvlist.split(",");
    keywords= toLowerCaseArray(keywords);
    keywords= toTrimArray(keywords);
//console.log("Filtering by :"+keywords);
    d3.selectAll(".dot").each(function (d) {

        if ( searchStringInArray(d[dimension_key],keywords) >= 0) {

        }
        else
        {
           if (d3.select(this).classed("selected"))
           {
            d3.select(this).classed("selected", false);
            d3.select(this).classed("unselected", true);
               d3.select(this).classed("unselectedx", true);
          };

        }

         ;

    });


     sendtoOort();
     force.resume();
     view.recalculate();
     legendarea.recalculate();



}



function filterByTag(tagtext){
if (typeof tagtext==='undefined')
{
$('#tagcloud').empty();
d3.selectAll(".dot").each(function (d) {

            d3.select(this).classed("dot_ghost", false);

});
return true;
};

opacitybydimension();

 d3.selectAll(".dot").each(function (d) {


        if ( searchStringInArray(tagtext,d["tags"]) >= 0) {
            d3.select(this).classed("dot_ghost", false);


        } else
        {
           d3.select(this).classed("dot_ghost", true);
        };


force.resume();


});

};

function colorizebydimension(dimension_key) {


//console.log("colorizing by"+dimension_key);

	view.currentDimension["dimensionpointcolour"]=dimension_key;


    if (typeof dimension_key === 'undefined' ) {
        svg.selectAll(".dot").style("fill", function (d) {
            return "#0000FF";
        });

    } else {

        svg.selectAll("circle").style("fill", function (d) {
            return colorpicker(dimension_key, d[settings.fields[dimension_key].fieldname]);

        });
    }

legendarea.recalculate();
};

function opacitybydimension(dimension_key) {
    if (typeof dimension_key === 'undefined') {
        svg.selectAll(".dot").style("opacity", null);
        console.log("resetting opacity");
        view.currentDimension["dimensiontransparency"]="";


    } else {
        if (view.currentDimension["dimensiontransparency"]===dimension_key){
                    svg.selectAll(".dot").style("opacity", null);
                    view.currentDimension["dimensiontransparency"]="";
                    console.log("toggling off opacity");
           }
            else
            {
            svg.selectAll(".dot").style("opacity", function (d) {
            view.currentDimension["dimensiontransparency"]=dimension_key;
            return opacitypicker(dimension_key, d[dimension_key]);

        });
        };
    }
};


function sizebydimension(dimension_key)
{
    var bubblesize; //d3 scale object, it will change depending on the size mode

   if (typeof dimension_key ==='undefined'){

       return false;
   }
   else
   {


           if (settings.dimensionpointsize.indexOf(dimension_key) == -1) {
              return false;
              } ;



           input_low= settings.fields[dimension_key].rangeStart;
           input_top=settings.fields[dimension_key].rangeEnd;

            bubblesize = d3.scale.pow().domain([input_low, input_top]).range([2, 15 ]);

            svg.selectAll(".dot").attr("r", function (d, i) {
                v= d[dimension_key];
                if (v> input_top)
                {v=input_top;
                    }
                else
                {
                if (v< input_low){
                    v=input_low;

                };
                };
                var bz= bubblesize(v);
                nodes[d.id]["radius"] = bz; //we are setting the node radius used for collission/force


                return bz; //we are setting the drawing radius


            });
            force.resume();


   };
};


function bubble_toggleSize(set_bubble_size) {
    var bubblesize; //d3 scale object, it will change depending on the size mode
//console.log("Debug bubble_size_modes");
//console.log(settings.bubble_size_modes);

    if (typeof set_bubble_size === 'undefined') {
        if (current_bubble_size >= (settings.bubble_size_modes.length - 1)) {
            current_bubble_size = 0;
        } else {
            current_bubble_size++;
        };
    } else {
        current_bubble_size = set_bubble_size;
    };
    var range_low = settings.bubble_size_modes[current_bubble_size][0];
    var range_top = settings.bubble_size_modes[current_bubble_size][1];
    if (settings.bubble_size_modes[current_bubble_size][2] == 0) {
        //Linear size scale
        bubblesize = d3.scale.linear().domain([1, 25]).range([range_low, range_top]);
    } else {
        //Power size scale
        bubblesize = d3.scale.pow().domain([1, 25]).range([range_low, range_top]);
    };
    svg.selectAll(".dot").attr("r", function (d, i) {
        nodes[d.id]["radius"] = bubblesize(d.impact * d.likelihood);
        return bubblesize(d.impact * d.likelihood);
    });
    force.resume();
};

function arrangebigblobbydimension(dimension_key) {
//console.log("Pie by"+dimension_key);
    force.stop();
 view.currentView="pie";
    view.currentDimension["dimensiongroup"]=dimension_key;

   view.currentDimension["dimensionpointcolour"]=dimension_key;
    colorizebydimension(view.currentDimension["dimensionpointcolour"]);

    var dimension_values = serieslist[dimension_key];
    var clusterfocusscale = d3.scale.ordinal().domain(dimension_values).rangeBands([1, 360]);
    svg.selectAll(".backgroundxy").attr("visibility", "hidden");
    svg.selectAll(".axis").attr("visibility", "hidden");
    svg.selectAll(".clusterlabel").remove();

    force.gravity(0)
        .charge(.5)
        .friction(.2);


         bubbles_selection= svg.selectAll(".dot") ;




            sendtoOort(bubbles_selection);
            force.resume();

        //we wait 1 seconds to set the new focus
    	setTimeout(function () {

         svg.selectAll(".selected").each(function (d) {

                    nodes[d.id]["clusterfocusxcurrent"] = chart_width/2;
                    nodes[d.id]["clusterfocusycurrent"] = chart_height / 2;
                    nodes[d.id]["clusterfocusxwhenselected"] = chart_width/2;
                    nodes[d.id]["clusterfocusywhenselected"] =  chart_height / 2;
                          if (typeof activenodes[d.id]!= 'undefined')
                    {
                    	activenodes[d.id]=nodes[d.id] ;
                    };

            });
                	   // we set also the target focus of the unselected ones in the Oort cloud so if they are activated afterwards by the user
					// they go to the right focus point in the current graph
					svg.selectAll(".unselected").each(function (d) {
					nodes[d.id]["clusterfocusxwhenselected"] = chart_width/2;
					nodes[d.id]["clusterfocusywhenselected"] = chart_height / 2;
					      if (typeof activenodes[d.id]!= 'undefined')
                    {
                    	activenodes[d.id]=nodes[d.id] ;
                    };
					});

               force.alpha(.17);


    	}, 1000);


};

function arrangeblobsbydimension(dimension_key) {

//console.log("Grouping by"+dimension_key);
view.currentView="groupby";

    view.currentDimension["dimensiongroup"]=dimension_key;



    var dimension_values = serieslist[dimension_key];
    var clusterfocusscale = d3.scale.ordinal().domain(dimension_values).rangeBands([0, chart_width], 1);
    //var clusterfocusscaleexpanded = d3.scale.ordinal().domain(dimension_values).rangeBands([1, chart_width * 12]);
    svg.selectAll("image").attr("visibility", "hidden");
    svg.selectAll(".axis").attr("visibility", "hidden");
    svg.selectAll(".clusterlabel").remove();

    var label = svg.selectAll(".clusterlabel")
        .data(dimension_values)
        .enter().append("g");
    label.append("text")
        .attr("y", chart_height * .90)
        .attr("x", function (d) {
            return clusterfocusscale(d) - .2 * (chart_width / dimension_values.length);
        })
        .attr("class", "clusterlabel")
        .text(function (d) {
            return legendpicker(dimension_key, d);
        });



      force.stop();
       for (var i = 0; i < nodes.length; i++) {
       d=nodes[i];
                    nodes[d.id]["x"] = clusterfocusscale(d[dimension_key]);
                    nodes[d.id]["y"] = chart_height / 2;
                    nodes[d.id]["clusterfocusxcurrent"] = clusterfocusscale(d[dimension_key]);
                    nodes[d.id]["clusterfocusycurrent"] = chart_height / 2;
                    nodes[d.id]["clusterfocusxwhenselected"] =clusterfocusscale(d[dimension_key]);
                    nodes[d.id]["clusterfocusywhenselected"] = chart_height / 2;
                    if (typeof activenodes[d.id]!= 'undefined')
                    {
                        activenodes[d.id]=nodes[d.id] ;
                    };

       };


             sendtoOort();

                force.gravity(0)
                .charge(.5)
                .friction(.1)
                .alpha(.1);



};

function arrangeriskmap() {
	//console.log("Generating risk map");

    force.stop();
    bubble_toggleSize(0);
    view.currentView="riskmap";
    view.currentDimension["dimensiongroup"]= null;


    svg.selectAll(".axis").attr("visibility", "visible");

    svg.selectAll(".backgroundxy").attr("visibility", "visible");


    svg.selectAll(".clusterlabel").remove();

    force.gravity(0)
        .charge(-.01)
        .friction(.7);


    svg.selectAll(".selected").each(function (d) {
    	nodes[d.id]["x"] = x(d.likelihood);
        nodes[d.id]["y"] = y(d.impact);
        nodes[d.id]["clusterfocusxcurrent"] = x(d.likelihood);
        nodes[d.id]["clusterfocusycurrent"] = y(d.impact);
        nodes[d.id]["clusterfocusxwhenselected"] = x(d.likelihood);
        nodes[d.id]["clusterfocusywhenselected"] = y(d.impact);
          if (typeof activenodes[d.id]!= 'undefined')
                {
                	activenodes[d.id]=nodes[d.id] ;
                };
    });
    svg.selectAll(".unselected").each(function (d) {
        nodes[d.id]["clusterfocusxwhenselected"] = x(d.likelihood);
        nodes[d.id]["clusterfocusywhenselected"] = y(d.impact);
              if (typeof activenodes[d.id]!= 'undefined')
                    {
                    	activenodes[d.id]=nodes[d.id] ;
                    };
    });

  //  sendtoOort();

        force.alpha(.2);
};


function tickconverge(e) {
    // This is the main routine that makes the bubbles converge to multiple foci (plural of focus)
    //it also drags with it the labels, but note that the labels are just being moved, no colission
    //detection is happening for them.
    svg.selectAll(".dot")
        .each(gravity(.2 *e.alpha))
        .each(collide(.5))
        .attr("cx", function (d, i) {
            return d.x;
        })
        .attr("cy", function (d, i) {
            return d.y;
        });
    if (current_label_status) {
        svg.selectAll(".dotlabel")
            .attr("x", function (d, i) {
                return -d.radius + d.x;
            })
            .attr("y", function (d, i) {
                return d.radius + d.y + 10;
            });
    }
};
// Move nodes toward cluster focus.
function gravity(alpha) {
    return function (d) {
        d.y += (d.clusterfocusycurrent - d.y) * alpha;
        d.x += (d.clusterfocusxcurrent - d.x) * alpha;
    };
};
// Resolve collisions between nodes.
function collide(alpha) {
    var quadtree = d3.geom.quadtree(activenodes);
    return function (d) {
        var r = d.radius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
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
