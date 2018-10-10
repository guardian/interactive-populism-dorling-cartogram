//DEMERS

// Ratio of Obese (BMI >= 30) in U.S. Adults, CDC 2008
var valueById = [
    NaN, 2, 0.198,   NaN, 0.133, 0.175, 0.151,   NaN, 0.100, 0.125,
  0.171,   NaN, 0.172, 0.133,   NaN, 0.108, 0.142, 0.167, 0.201, 0.175,
  0.159, 0.169, 0.177, 0.141, 0.163, 0.117, 0.182, 0.153, 0.195, 0.189,
  0.134, 0.163, 0.133, 0.151, 0.145, 0.130, 0.139, 0.169, 0.164, 0.175,
  0.135, 0.152, 0.169,   NaN, 0.132, 0.167, 0.139, 0.184, 0.159, 0.140,
  0.146, 0.157,   NaN, 0.139, 0.183, 0.160, 0.143
];
var svg = d3.select(".circles-wrapper svg"),
    margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    padding = 3;
var projection = d3.geoAlbersUsa();
var radius = d3.scaleSqrt()
    .domain([0, d3.max(valueById)])
    .range([0, 30]);

let usamap = "<%= path %>/assets/us-state-centroids.json"

 Promise.all([
    d3.json(usamap)
    ])
.then(ready)


function ready(st){


	let states = st[0]

  var nodes = states.features
      .filter(function(d) { return !isNaN(valueById[+d.id]); })
      .map(function(d) {
        var point = projection(d.geometry.coordinates),
            value = valueById[+d.id];
        if (isNaN(value)) fail();
        return {
          x: point[0], y: point[1],
          x0: point[0], y0: point[1],
          r: radius(value),
          value: value
        };
      });
  var simulation = d3.forceSimulation()
      .force("x", d3.forceX(function(d) { return d.x0; }))
      .force("y", d3.forceY(function(d) { return d.y0; }))
      .force("collide", collide)
      .nodes(nodes)
      .on("tick", tick);

  var node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("rect")
      .attr("width", function(d) { return d.r * 2; })
      .attr("height", function(d) { return d.r * 2; });

  function tick(e) {
    node.attr("x", function(d) { return d.x - d.r; })
        .attr("y", function(d) { return d.y - d.r; });
  }

  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = nodes.length; i < n; ++i) {
        for (var a = nodes[i], j = i + 1; j < n; ++j) {
          var b = nodes[j],
              x = a.x + a.vx - b.x - b.vx,
              y = a.y + a.vy - b.y - b.vy,
              lx = Math.abs(x),
              ly = Math.abs(y),
              r = a.r + b.r + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              a.vx -= lx, b.vx += lx;
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              a.vy -= ly, b.vy += ly;
            }
          }
        }
      }
    }
  }
};