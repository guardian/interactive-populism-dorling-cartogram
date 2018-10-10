import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3geo from 'd3-geo'
import * as topojson from 'topojson'

let d3 = Object.assign({}, d3B, d3geo);

let dataURL = "<%= path %>/assets/yearbycountry.json";
let europeURL = "<%= path %>/assets/europe.json";


let width = 960
let height = 600

let interval = 2000
let maxSize = 140

let years = d3.range(1992, 2018 + 1, 1)
let yearIndex = -1
let year = years[0]

let projection = d3.geoMercator()
.center([23.106111,53.5775])
.scale(500)
.translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

let size = d3.scaleSqrt().range([0, maxSize])

let svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')

let yearLabel = svg.append('text')
    .attr('class', 'year')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')


let linkForce = d3.forceLink()
				.id(function (d) { return d.countryName })
				.distance(function (d) {
			        return (
			            size(d.source.populism.find(function (e) { return e.year === year }).pop) +
			            size(d.target.populism.find(function (e) { return e.year === year }).pop)
			        ) / 2
			    })
			    .strength(0.6)


let collisionForce = rectCollide()
    .size(function (d) {
        let l = size(d.populism.find(function (e) { return e.year === year }).pop)
        return [l, l]
    })
    .iterations(12)

let simulation = d3.forceSimulation()
			    .force('center', d3.forceCenter(width / 2, (height - maxSize) / 2))
			    .force('link', linkForce)
			    .force('collision', collisionForce)
			    .force('x', d3.forceX(function (d) { return d.xi }).strength(0.0125))
			    .force('y', d3.forceY(function (d) { return d.yi }).strength(0.0125))


Promise.all([
	d3.json(europeURL),
    d3.json(dataURL)
    ])
.then(ready)



function ready(arr)
{
	let data = arr[1];
	let europeMap = arr[0];
	let neighbors = topojson.neighbors(europeMap.objects.europe.geometries);

	let nodes = [];
	let links = [];

	topojson.feature(europeMap, europeMap.objects.europe).features.forEach(function(node) {

		let centroid = d3.geoPath().centroid(node);
		let countryName = node.properties.name_long;
		let countryData = data.find(d => d.country == countryName);
		let populism = [];

		if(countryData){
			countryData.years.forEach(y => {

				let pop = null;

				if(y.totalPopulist != 0){
					pop = y.totalPopulist.totalshare
				}

				populism.push({year:y.year, pop:pop})
			})

			nodes.push({countryName:countryName, lat:centroid[0], lon:centroid[1], populism:populism})

		}
	})

	neighbors.forEach((neighbor,i) => {
		let nLenght = neighbor.length
		if(nLenght > 0)
		{
			for (let j = 0; j<nLenght; j++) {
				links.push({
					source:europeMap.objects.europe.geometries[i].properties.name_long, 
					target:europeMap.objects.europe.geometries[neighbor[j]].properties.name_long
				})
			}
		}
	});


	size.domain([0, d3.max(nodes, function (d) {
        return d3.max(d.populism, function (e) { return e.pop })
    })])


    nodes.forEach(n => {
        let coords = projection([n.lat, n.lon])
        n.x = n.xi = coords[0]
        n.y = n.yi = coords[1]
    })

     
	let svg = d3.select(".map-wrapper svg")

  console.log(topojson.feature(europeMap, europeMap.objects.europe).features)


	svg.selectAll("path")
       .data(topojson.feature(europeMap, europeMap.objects.europe).features)
       .enter()
       .append("path")
       .attr("class", d => d.properties.name_long)
       .attr("d", path)
       .attr("fill", "none")
       .attr("stroke", "#C70000");

	let countries = svg.selectAll('.country')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'country')

    countries.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .text(function (d) { return d.countryName })

    countries.append('rect')
    

    simulation.nodes(nodes)
    simulation.force('link').links(links[0])
    simulation.on('tick', ticked)

    update()
    d3.interval(update, interval)

    function update() {
        year = years[++yearIndex >= years.length ? yearIndex = 0 : yearIndex]

        yearLabel.text(year)

        if (yearIndex === 0) { nodes.forEach(function (d) { d.x = d.xi; d.y = d.yi }) }

        simulation.nodes(nodes).alpha(1).restart()
    }



    function ticked() {
        let sizes = d3.local()

        countries
            .property(sizes, function (d) {
                return size(d.populism.find(function (e) { return e.year === year }).pop)
            })
            .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })

        countries.selectAll('rect')
            .attr('x', function (d) { return sizes.get(this) / -2 })
            .attr('y', function (d) { return sizes.get(this) / -2 })
            .attr('width', function (d) { return sizes.get(this) })
            .attr('height', function (d) { return sizes.get(this) })
    }	
}




function rectCollide() {
    let nodes, sizes, masses
    let size = constant([0, 0])
    let strength = 1
    let iterations = 1

    function force() {
        let node, size, mass, xi, yi
        let i = -1
        while (++i < iterations) { iterate() }

        function iterate() {
            let j = -1
            let tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare)

            while (++j < nodes.length) {
                node = nodes[j]
                size = sizes[j]
                mass = masses[j]
                xi = xCenter(node)
                yi = yCenter(node)

                tree.visit(apply)
            }
        }

        function apply(quad, x0, y0, x1, y1) {
            let data = quad.data
            let xSize = (size[0] + quad.size[0]) / 2
            let ySize = (size[1] + quad.size[1]) / 2
            if (data) {
                if (data.index <= node.index) { return }

                let x = xi - xCenter(data)
                let y = yi - yCenter(data)
                let xd = Math.abs(x) - xSize
                let yd = Math.abs(y) - ySize

                if (xd < 0 && yd < 0) {
                    let l = Math.sqrt(x * x + y * y)
                    let m = masses[data.index] / (mass + masses[data.index])

                    if (Math.abs(xd) < Math.abs(yd)) {	
                        node.vx -= (x *= xd / l * strength) * m
                        data.vx += x * (1 - m)
                    } else {
                        node.vy -= (y *= yd / l * strength) * m
                        data.vy += y * (1 - m)
                    }
                }
            }

            return x0 > xi + xSize || y0 > yi + ySize ||
                   x1 < xi - xSize || y1 < yi - ySize
        }

        function prepare(quad) {
            if (quad.data) {
                quad.size = sizes[quad.data.index]
            } else {
                quad.size = [0, 0]
                let i = -1
                while (++i < 4) {
                    if (quad[i] && quad[i].size) {
                        quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                        quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                    }
                }
            }
        }
    }

    function xCenter(d) { return d.x + d.vx }
    function yCenter(d) { return d.y + d.vy }

    force.initialize = function (_) {
        sizes = (nodes = _).map(size)
        masses = sizes.map(function (d) { return d[0] * d[1] })
    }

    force.size = function (_) {
        return (arguments.length
             ? (size = typeof _ === 'function' ? _ : constant(_), force)
             : size)
    }

    force.strength = function (_) {
        return (arguments.length ? (strength = +_, force) : strength)
    }

    force.iterations = function (_) {
        return (arguments.length ? (iterations = +_, force) : iterations)
    }

    return force
}

function constant(_) {
    return function () { return _ }
}



















