import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3geo from 'd3-geo'
import * as topojson from 'topojson'

let d3 = Object.assign({}, d3B, d3geo);


let mapUrl = "<%= path %>/assets/world-simple.json";
let dataUrl = "<%= path %>/assets/countrybyyear.json";

/*Promise.all([
    d3.json(mapUrl),
    d3.json(dataUrl)
    ])
.then(ready)

let margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    padding = 3;


let projection = d3.geoMercator()
.center([23.106111,53.5775])
.scale(500)
.translate([width / 2, height / 2]);

let mapPath = d3.geoPath().projection(projection);



let radius = d3.scaleSqrt()
.domain([0, 52])
.range([0, 22]);


function ready(arr)
{
	let data = arr[1];

	let data2018 = data.slice(data.length -1)[0];

	let world = topojson.feature(arr[0], arr[0].objects.ne_10m_admin_0_map_subunits).features;

	let europe = world.filter((country) => country.properties.continent == "Europe");

	let europeG = {type: "Topology", objects:{ne_10m_admin_0_map_subunits:{geometries:europe}}}

	var neighbors = topojson.neighbors(arr[0].objects.ne_10m_admin_0_map_subunits.geometries);


	console.log(arr[0].objects.ne_10m_admin_0_map_subunits.geometries, europe)


    

	world.forEach(function(node){
		node.x0 = d3.geoPath().centroid(node)[0];
		node.y0 = d3.geoPath().centroid(node)[1];
		node.value = getValue(node, data2018);
		node.radius = Math.sqrt(node.value) * 2;
		node.admin = node.properties.admin
	})

	var links = d3.merge(neighbors.map(function(neighborSet, i) {
      return neighborSet.filter(j => world[j]).map(function(j) {
        return {source: i, target: j, distance: world[i].radius + world[j].radius + 3};
      });
    }));

	let svg = d3.select(".map-wrapper svg")

	let map = svg.selectAll("path")
    .data(world)
    .enter()
    .append("path")
    .attr("d", mapPath)
    .attr('class', (d) => {return d.properties.admin})
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.5)
    .attr('fill', "none")

    let areas = svg.append('g')

    let area = areas.selectAll("circle")
    .data(world)
    .enter()
    .append('g')
    .append('circle')
    .attr('class', c =>{return c.admin})
    .attr('r', c =>{return  c.radius})
    .attr('cx', c => {return projection([c.x0, c.y0])[0]})
    .attr('cy', c => {return projection([c.x0, c.y0])[1]})
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.5)
    .attr('fill', "#C70000");

    let simulation = d3.forceSimulation(world)
        .force("cx", d3.forceX().x(d => width / 2).strength(0.02))
        .force("cy", d3.forceY().y(d => height / 2).strength(0.02))
        .force("link", d3.forceLink(links).distance(d => d.distance))
        .force("x", d3.forceX().x(d => d.x).strength(0.1))
        .force("y", d3.forceY().y(d => d.y).strength(0.1))
        .force("collide", d3.forceCollide().strength(0.8).radius(d => d.r + 3))

       
    function ticked() {
    	console.log("aa")
	  d3.selectAll("circle")
      .attr("cx", d => {console.log(d); return d.x})
      .attr("cy", d => d.y)
	}





}

function updateCartogram() {
    d3.selectAll("circle")
      .attr("cx", d => projection([d.x, d.y][0]))
      .attr("cy", d => projection([d.x, d.y][1]))
  }


function getValue(node, data){

	let country = data.countries.find(c => c.country == node.properties.admin);
	let value = 0;

	if(country)
	{
		value = country.totalPopulist.totalshare;
	}
	
	return value
}*/



// Ratio of Obese (BMI >= 30) in U.S. Adults, CDC 2008
var valueById = [
    NaN, 0.9, 0.198,   NaN, 0.133, 0.175, 0.151,   NaN, 0.100, 0.125,
  0.171,   NaN, 0.172, 0.133,   NaN, 0.108, 0.142, 0.167, 0.201, 0.175,
  0.159, 0.169, 0.177, 0.141, 0.163, 0.117, 0.182, 0.153, 0.195, 0.189,
  0.134, 0.163, 0.133, 0.151, 0.145, 0.130, 0.139, 0.169, 0.164, 0.175,
  0.135, 0.152, 0.169,   NaN, 0.132, 0.2, 0.139, 0.184, 0.159, 0.140,
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
    .enter().append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("fill", "none")
      .attr("stroke", "#C70000")
      

  function tick(e) {
    node.attr("cx", function(d) { return d.x - d.r; })
        .attr("cy", function(d) { return d.y - d.r; });
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




























