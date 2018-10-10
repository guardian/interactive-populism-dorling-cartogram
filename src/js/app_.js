import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3geo from 'd3-geo'
import * as topojson from 'topojson'

let d3 = Object.assign({}, d3B, d3geo);


let mapURL = "<%= path %>/assets/world-simple.json";
let dataURL = "<%= path %>/assets/countrybyyear.json";
let eupeURL = "<%= path %>/assets/europe.json";

Promise.all([
    d3.json(mapURL),
    d3.json(dataURL),
    d3.json(europeURL)
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
}





























