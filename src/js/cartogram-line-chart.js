import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import textures from 'textures'

let d3 = Object.assign({}, d3B, d3Select);

let dataURL = "<%= path %>/assets/yearbycountry.json";

let svg = d3.select(".map-wrapper svg")

let svgWidth = document.querySelector(".map-wrapper svg").clientWidth;
let svgHeight = document.querySelector(".map-wrapper svg").clientHeight;

let width = svgWidth
let height = svgHeight

let squares = 81;
let columns = 9;
let rows = 9;
let grid = makeGrid(squares,columns, rows, width, height);

let europe28 =[];
europe28[49]="Austria";
europe28[47]="Belgium";
europe28[70]="Bulgaria";
europe28[57]="Switzerland";
europe28[80]="Cyprus";
europe28[50]="Czech Republic";
europe28[40]="Germany";
europe28[31]="Denmark";
europe28[65]="Spain";
europe28[15]="Estonia";
europe28[6]="Finland";
europe28[56]="France";
europe28[29]="United Kingdom";
europe28[79]="Greece";
europe28[68]="Croatia";
europe28[60]="Hungary";
europe28[27]="Ireland";
europe28[9]="Iceland";
europe28[58]="Italy";
europe28[33]="Lithuania";
europe28[48]="Luxembourg";
europe28[24]="Latvia";
europe28[76]="Malta";
europe28[39]="Netherlands";
europe28[4]="Norway";
europe28[41]="Poland";
europe28[64]="Portugal";
europe28[61]="Romania";
europe28[51]="Slovakia";
europe28[59]="Slovenia";
europe28[5]="Sweden";


let names = [{name:"Austria", iso3:"AUS"},
{name:"Belgium", iso3:"BEL"},
{name:"Bulgaria", iso3:"BUL"},
{name:"Switzerland", iso3:"SWI"},
{name:"Cyprus", iso3:"CYP"},
{name:"Czech Republic", iso3:"CZE"},
{name:"Germany", iso3:"GER"},
{name:"Denmark", iso3:"DEN"},
{name:"Spain", iso3:"SPA"},
{name:"Estonia", iso3:"EST"},
{name:"Finland", iso3:"FIN"},
{name:"France", iso3:"FRA"},
{name:"United Kingdom", iso3:" UK"},
{name:"Greece", iso3:"GRE"},
{name:"Croatia", iso3:"CRO"},
{name:"Hungary", iso3:"HUN"},
{name:"Ireland", iso3:"IRE"},
{name:"Iceland", iso3:"ICE"},
{name:"Italy", iso3:"ITA"},
{name:"Lithuania", iso3:"LIT"},
{name:"Luxembourg", iso3:"LUX"},
{name:"Latvia", iso3:"LAT"},
{name:"Malta", iso3:"MAL"},
{name:"Netherlands", iso3:"NET"},
{name:"Norway", iso3:"NOR"},
{name:"Poland", iso3:"POL"},
{name:"Portugal", iso3:"POR"},
{name:"Romania", iso3:"ROM"},
{name:"Slovakia", iso3:"SVK"},
{name:"Slovenia", iso3:"SVN"},
{name:"Sweden", iso3:"SWE"}]

let classNames = [];


// const texture = textures
//   .lines()
//   .orientation("horizontal")
//   .size(3)
//   .strokeWidth(1)
//   .stroke("darkorange");

 

// svg.call(texture);

let europeCartogram = svg.selectAll('rect')
    .data(grid)
    .enter()
    .filter((d,i) => {if(europe28[i] != undefined){classNames.push(europe28[i].split(" ").join("-"))}; return europe28[i] != undefined})
    .append("g")
    .attr("class", (d,i) => {return classNames[i]});

    europeCartogram
    .append("rect")
    .attr("transform" , (d) => {return "translate(" + d.x + "," + d.y + ")"} )
    .attr("width" , width  / columns)
    .attr("height" , width  / columns)
    //.style('fill', texture.url());


    europeCartogram
    .append('text')
    .attr("transform" , (d) => {return "translate(" + (d.x + 5) + "," + d.y + ")"} )
    .attr('text-anchor', 'start')
    .attr('dy', '1.5em')
    .attr('dx', '.2em')
    .text( (d,i) => { let country = names.find(n => n.name.split(" ").join("-") == classNames[i]);  return country.iso3})


function makeGrid(squares, columns, rows, width, height)
{
  let positions = [];
  let heightAccum = 0,
    widthAccum = 0,
    count = 0,
    squareWidth = width / columns,
    squareheight = height / rows;

  for (let i = 0; i < squares; i++) {
    positions.push({x:widthAccum, y:heightAccum, center:[widthAccum + (width  / columns) / 2, heightAccum + (width / columns) / 2], width:squareWidth, height:squareheight});

    widthAccum += squareWidth;

    count++
    
    if(count % columns == 0)
    {
      heightAccum += squareWidth;
      widthAccum = 0;
      count = 0;
    }
  }

  return positions;
}

Promise.all([
    d3.json(dataURL)
    ])
.then(ready)


function ready(data){
	

	let nodes = data[0];

	nodes.forEach(n => {

		let group = d3.select("." + n.country.split(" ").join("-"));
		let rect = group.select("rect");
		let marginX = parseFloat(rect.attr("transform").split("translate(")[1].split(",")[0]);
		let marginY = parseFloat(rect.attr("transform").split("translate(")[1].split(",")[1].split(")")[0]);

		let countryData = [];

		let x = d3.scaleTime().range([0, rect.attr("width")]).domain([1992,2018]),
	    	y = d3.scaleLinear().range([rect.attr("height"), 0]).domain([0,100]);

		let lineRight = d3.line()
	    	.curve(d3.curveBasis)
	    	.x(d => { return x(d.year)})
	    	.y(d => { return y(d.rightShare)})
        .defined(d => { return d.rightShare !== null });

	   let lineLeft = d3.line()
	    	.curve(d3.curveBasis)
	    	.x(d => { return x(d.year)})
	    	.y(d => { return y(d.leftShare)})
        .defined(d => { return d.leftShare !== null });

    let lineOther = d3.line()
        .curve(d3.curveBasis)
        .x(d => { return x(d.year)})
        .y(d => { return y(d.otherShare)})
        .defined(d => { return d.otherShare !== null });
		
		 countryData.push({ id:n.country, values: n.years.map(d=>{
		 	let year = d.year;
		 	let leftShare;
      let rightShare;
		 	let otherShare;

		 	if(d.totalPopulist == 0){leftShare = null; rightShare = null; otherShare=null}
			else {
        let ls = (d.totalPopulist.leftshare == 0) ? leftShare = null : leftShare = d.totalPopulist.leftshare;
        let rs = (d.totalPopulist.rightshare == 0) ? rightShare = null : rightShare = d.totalPopulist.rightshare;
        let os = (d.totalPopulist.othershare == 0) ? otherShare = null : otherShare = d.totalPopulist.othershare;
        leftShare = ls;
        rightShare = rs;
        otherShare = os;
      }

		 	return {year:year, leftShare:leftShare, rightShare:rightShare, otherShare:otherShare}
		 })})

	    let wings = group.selectAll(".wing")
	    .data(countryData)
	    .enter()
	    .append('g')
	    .attr('class', "wing")

	    wings
	    .append("path")
	    .attr("class", "rightLine")
	    .attr("d", d => { return lineRight(d.values)})
      .attr("transform", "translate("+ marginX + "," + marginY + ")")
	    .attr("fill", "none")

	    wings
	    .append("path")
	    .attr("class", "leftLine")
	    .attr("d", d => { return lineLeft(d.values)})
	    .attr("transform", "translate("+ marginX + "," + marginY + ")")
      .attr("fill", "none")

       wings
      .append("path")
      .attr("class", "otherLine")
      .attr("d", d => { return lineOther(d.values)})
      .attr("transform", "translate("+ marginX + "," + marginY + ")")
      .attr("fill", "none")


	})




}
