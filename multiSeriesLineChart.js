
// Source of script: http://bl.ocks.org/ChandrakantThakkarDigiCorp/be18bb176b5050b55a32c05060bad11e


function multiSeriesLineChart(config) {
  function setReSizeEvent(data) {
    var resizeTimer;
    window.removeEventListener('resize', function () {
    });
    window.addEventListener('resize', function (event) {

      if (resizeTimer !== false) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(function () {
        $(data.mainDiv).empty();
        drawmultiSeriesLineChartCharts(data);
        clearTimeout(resizeTimer);
      }, 500);
    });
  }

  drawmultiSeriesLineChartCharts(config);
  setReSizeEvent(config);
}

function createmultiSeriesLineChartLegend(mainDiv, columnsInfo, colorRange) {
  var z = d3.scaleOrdinal() // Could I instead change the scale here?
    .range(colorRange);
  var mainDivName = mainDiv.substr(1, mainDiv.length);
  $(mainDiv).before("<div id='Legend_" + mainDivName + "' class='pmd-card-body' style='margin-top:0; margin-bottom:0;'></div>");
  var keys = Object.keys(columnsInfo);
  keys.forEach(function (d) {
    var cloloCode = z(d);
    $("#Legend_" + mainDivName).append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;'>\
  			<span style='background:" + cloloCode + ";width: 10px;height: 10px;display: inline-block;vertical-align: middle;'>&nbsp;</span>\
  			<span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;'>" + columnsInfo[d] + " </span>\
  		</span>");
  });

}

function drawmultiSeriesLineChartCharts(config) {
  var keys = Object.keys(config.data[0]);
  var tempObj = {};
  keys.forEach(function (d) {
    tempObj[d] = 0;
  });
  config.data.splice(0, 0, tempObj);
  var data = config.data;
  var columnsInfo = config.columnsInfo;

var xAxis = config.xAxis;

// Trying to define a new variable for the x axis
// If this doesn't work, replace with var xAxis = config.xAxis;
    //var years = ["2013", "2014", "2015", "2016", "2017", "2018"];
    //var xScaleLabels = function(d) {
    //  return years
    //}
    //var xAxis = d3.svg.axis()
    //#.scale(x)
    //.orient("bottom")
    //.tickFormat(formatyear);

//  Could I instead set the range, as suggested by this site? https://www.sitepoint.com/creating-simple-line-bar-charts-using-d3-js/
// xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(2012, function(d) {
//      return d.x;
//    }), d3.max(2019, function(d) {
//      return d.x;
//      })]),

  var yAxis = config.yAxis;
  var colorRange = config.colorRange;
  var mainDiv = config.mainDiv;
  var mainDivName = mainDiv.substr(1, mainDiv.length);
  var label = config.label;
  var requireCircle = config.requireCircle || false;
  var requireLegend = config.requireLegend;
  var imageData = config.imageData;
  d3.select(mainDiv).append("svg").attr("width", $(mainDiv).width()).attr("height", $(mainDiv).height()*0.9);
  var svg = d3.select(mainDiv + " svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  if (requireLegend != null && requireLegend != undefined && requireLegend != false) {
    $("#Legend_" + mainDivName).remove();
    createmultiSeriesLineChartLegend(mainDiv, columnsInfo, colorRange);
  }

  var x = d3.scaleLinear().range([0, width]), // If I change this range 0 to 2000, then the x axis shifts right
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal()
      .range(colorRange);
  var line = d3.line()
    .x(function (d) {
      return x(d[xAxis]);
    })
    .y(function (d) {
      return y(d[yAxis]);
    });
  var columns = Object.keys(columnsInfo);
  var groupData = columns.map(function (id) {
    return {
      id: id,
      values: data.filter(function (d, i) {
        //CBT:remove last blank or value is 0 data to show only that much of line
        if ((d[id] != 0 && d[id] != null && d[id] != undefined) || i == 0) return d;
      }).map(function (d, i) {
        var tempObj = {};
        tempObj[xAxis] = d[xAxis];
        tempObj[yAxis] = d[id];
        return tempObj;
      })
    };
  });


// Using this website: https://stackoverflow.com/questions/16919280/how-to-update-axis-using-d3-js
// I will define a variable called "x" that holds the axis range I want for the x-axis
/// putting this in comments because it did not work
/////x = d3.scale.linear().domain([2013,2018]).range([margin,width-margin]),
/////x.domain(d3.extent(x, function (d) {
/////return d[xAxis];

//This also does not work:   x.domain(d3.extent([2013,2018], function (d) {
//This also doesn't work:   x.domain(d3.extent(['Year'], function (d) {

// What if I just set the whole domain manually?
////Nope: 
//  x.domain([2013,2018])
//    return d[xAxis]

//What if I do this?
///Nope.
//  x.domain(d3.scaleLinear().domain([2013, 2018]).range([0, 960]))

  x.domain(d3.extent(data, function (d) {
  return d[xAxis];
  }));
  y.domain([
    d3.min(groupData, function (c) {
      return d3.min(c.values, function (d) {
        return d[yAxis];
      });
    }),
    d3.max(groupData, function (c) {
      return d3.max(c.values, function (d) {
        return d[yAxis];
      });
    })
  ]);
  z.domain(groupData.map(function (c) {
    return c.id;
  }));

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("class", "title")
    .attr("transform", "translate(0," + height + ")") // If I change this 0 to 2000, the axis label becomes invisible
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.bottom * 0.9)
    .attr("dx", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text(label.xAxis);

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .text(label.yAxis);


  var city = g.selectAll(".city")
    .data(groupData)
    .enter().append("g")
    .attr("class", "city");

  city.append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line(d.values);
    })
    .style("stroke", function (d) {
      return z(d.id);
    }).style("fill", "none").style("stroke-width", "3px");

  //CBT:for wicket Circles in multiseries line chart
  var circleRadius = 6;
  var keys = Object.keys(columnsInfo);
  var element = g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d[xAxis]) + ",0)";
    });

  var circles = element.selectAll("circle")
    .data(function (d) {
      return keys.map(function (key) {
        return { key: key, value: d[key], Year: d.Year };
      });
    })
    .enter().append("circle")
    .attr("cx", function (d) {
      return 0;
    })
    .attr("cy", function (d) {
      return y(d.value);
    })
    .attr("r", circleRadius)
    .attr("fill", "#fff")
    .attr("stroke", function (d) {
      if (d.circles == undefined || d.circles.length <= 0) {
        return "#fff";
      } else {
        return z(d.key);
      }
    })
    .attr("data", function (d) {
      var data = {};
      data["Year"] = d.Year;
      console.log(d)
      data["Percent Supporting"] = d.value;
      return JSON.stringify(data);
    })
    .attr("stroke-width", "2px")
    .attr("fill-opacity", function (d) {
      return 0.05;
    })
    .attr("stroke-opacity", function (d) {
      return 0.05;
    });

  circles.on("mouseover", function () {
    var currentEl = d3.select(this);
    currentEl.attr("r", 7);
    var fadeInSpeed = 120;
    d3.select("#circletooltip_" + mainDivName)
      .transition()
      .duration(fadeInSpeed)
      .style("opacity", function () {
        return 1;
      });
    d3.select("#circletooltip_" + mainDivName).attr("transform", function (d) {
      var mouseCoords = d3.mouse(this.parentNode);
      var xCo = 0;
      if (mouseCoords[0] + 10 >= width * 0.80) {
        xCo = mouseCoords[0] - parseFloat(d3.selectAll("#circletooltipRect_" + mainDivName)
          .attr("width"));
      } else {
        xCo = mouseCoords[0] + 10;
      }
      var x = xCo;
      var yCo = 0;
      if (mouseCoords[0] + 10 >= width * 0.80) {
        yCo = mouseCoords[1] + 10;
      } else {
        yCo = mouseCoords[1];
      }
      var x = xCo;
      var y = yCo;
      return "translate(" + x + "," + y + ")";
    });
    //CBT:calculate tooltips text
    var tooltipData = JSON.parse(currentEl.attr("data"));
    console.log('DATA',tooltipData);
    var tooltipsText = "";
    d3.selectAll("#circletooltipText_" + mainDivName).text("");
    var yPos = 0;
    d3.selectAll("#circletooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(label.xAxis + ":  " + tooltipData['Year']);
    yPos = yPos + 1;
    d3.selectAll("#circletooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(label.yAxis + ":  " + tooltipData['Percent Supporting']);
    //CBT:calculate width of the text based on characters
    var dims = helpers.getDimensions("circletooltipText_" + mainDivName);
    d3.selectAll("#circletooltipText_" + mainDivName + " tspan")
      .attr("x", dims.w + 4);

    d3.selectAll("#circletooltipRect_" + mainDivName)
      .attr("width", dims.w + 10)
      .attr("height", dims.h + 20);

  });
  circles.on("mousemove", function () {
    var currentEl = d3.select(this);
    currentEl.attr("r", 7);
    d3.selectAll("#circletooltip_" + mainDivName)
      .attr("transform", function (d) {
        var mouseCoords = d3.mouse(this.parentNode);
        var xCo = 0;
        if (mouseCoords[0] + 10 >= width * 0.80) {
          xCo = mouseCoords[0] - parseFloat(d3.selectAll("#circletooltipRect_" + mainDivName)
            .attr("width"));
        } else {
          xCo = mouseCoords[0] + 10;
        }
        var x = xCo;
        var yCo = 0;
        if (mouseCoords[0] + 10 >= width * 0.80) {
          yCo = mouseCoords[1] + 10;
        } else {
          yCo = mouseCoords[1];
        }
        var x = xCo;
        var y = yCo;
        return "translate(" + x + "," + y + ")";
      });
  });
  circles.on("mouseout", function () {
    var currentEl = d3.select(this);
    currentEl.attr("r", 6);
    d3.select("#circletooltip_" + mainDivName)
      .style("opacity", function () {
        return 0;
      })
      .attr("transform", function (d, i) {
        // klutzy, but it accounts for tooltip padding which could push it onscreen
        var x = -500;
        var y = -500;
        return "translate(" + x + "," + y + ")";
      });
  });

  var circleTooltipg = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .attr("id", "circletooltip_" + mainDivName)
    .attr("style", "opacity:0")
    .attr("transform", "translate(-500,-500)");

  circleTooltipg.append("rect")
    .attr("id", "circletooltipRect_" + mainDivName)
    .attr("x", 0)
    .attr("width", 120)
    .attr("height", 80)
    .attr("opacity", 0.71)
    .style("fill", "#000000");

  circleTooltipg
    .append("text")
    .attr("id", "circletooltipText_" + mainDivName)
    .attr("x", 30)
    .attr("y", 15)
    .attr("fill", function () {
      return "#fff"
    })
    .style("font-size", function (d) {
      return 10;
    })
    .style("font-family", function (d) {
      return "arial";
    })
    .text(function (d, i) {
      return "";
    });



}

// Moved from the .html part
// Manually entered the data on democratic support for charter schools and voucher schools
    var groupChartData = [{ "2614": 42, "4449": 47, "Year": 2015 }, { "2614": 45, "4449": 42, "Year": 2016 }, { "2614": 34, "4449": 44, "Year": 2017 }, { "2614": 36, "4449": 47, "Year": 2018 }];

// New labels into the legend
    var columnsInfo = { "2614": "Support for Charters", "4449": "Support for Vouchers" };

    $("#chart").empty();
    var muliSeriesChartConfig = {
        mainDiv: "#chart",
        colorRange: ["#2a98cd", "#df7247"],
        data: groupChartData,
        columnsInfo: columnsInfo,
        xAxis: "Year",
        yAxis: "Percent Supporting",
        label: {
            xAxis: "Year",
            yAxis: "Percent Supporting"
        },
        requireCircle: false,
        requireLegend: true
    };
    var muliSeriesChart = new multiSeriesLineChart(muliSeriesChartConfig);

var helpers = {
  getDimensions: function (id) {
    var el = document.getElementById(id);
    var w = 0, h = 0;
    if (el) {
      var dimensions = el.getBBox();
      w = dimensions.width;
      h = dimensions.height;
    } else {
      console.log("error: getDimensions() " + id + " not found.");
    }
    return { w: w, h: h };
  }
};

window.addEventListener('resize', function (event) {
    $("#chart").width(window.innerWidth * 0.9);
    $("#chart").height(window.innerHeight);
});