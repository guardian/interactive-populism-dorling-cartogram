import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import textures from 'textures'
import * as d3Swoopydrag from 'd3-swoopy-drag'
import * as d3Jetpack from 'd3-jetpack'
import { annotations } from '../assets/annotations.js'
import { makeGrid } from '../assets/Grid.js'

const d3 = Object.assign({}, d3B, d3Select, d3Swoopydrag, d3Jetpack);

const dataURL = "<%= path %>/assets/yearbycountry.json";

const svg = d3.select(".map-wrapper svg");

const chartsWrapper = d3.select(".charts-wrapper");

const defs = svg.append('defs')

let cartogramWidth = document.querySelector(".map-wrapper svg").clientWidth -10;
let cartogramHeight = document.querySelector(".map-wrapper svg").clientHeight -10;

let squares = 81;
let columns = 8;
let rows = 8;
let grid = makeGrid(squares,columns, rows,cartogramWidth, cartogramHeight);

let europe28 =[];
europe28[0]="Iceland"; europe28[3]="Norway"; europe28[4]="Sweden"; europe28[5]="Finland"; europe28[13]="Estonia"; europe28[16]="Ireland"; europe28[17]="United Kingdom"; europe28[19]="Denmark"; europe28[21]="Latvia"; europe28[26]="Netherlands"; europe28[27]="Germany"; europe28[28]="Poland"; europe28[29]="Lithuania"; europe28[33]="Belgium"; europe28[34]="Luxembourg"; europe28[35]="Austria"; europe28[36]="Czech Republic"; europe28[37]="Slovakia"; europe28[41]="France"; europe28[42]="Switzerland"; europe28[43]="Slovenia"; europe28[44]="Croatia"; europe28[45]="Hungary"; europe28[46]="Romania"; europe28[48]="Portugal"; europe28[49]="Spain"; europe28[51]="Italy"; europe28[54]="Bulgaria"; europe28[62]="Greece"; europe28[67]="Malta"; europe28[71]="Cyprus"; 

let names = [{name:"Austria", iso3:"AUS"},{name:"Belgium", iso3:"BEL"},{name:"Bulgaria", iso3:"BUL"},{name:"Switzerland", iso3:"SWI"},{name:"Cyprus", iso3:"CYP"},{name:"Czech Republic", iso3:"CZE"},{name:"Germany", iso3:"GER"},{name:"Denmark", iso3:"DEN"},{name:"Spain", iso3:"SPA"},{name:"Estonia", iso3:"EST"},{name:"Finland", iso3:"FIN"},{name:"France", iso3:"FRA"},{name:"United Kingdom", iso3:" UK"},{name:"Greece", iso3:"GRE"},{name:"Croatia", iso3:"CRO"},{name:"Hungary", iso3:"HUN"},{name:"Ireland", iso3:"IRE"},{name:"Iceland", iso3:"ICE"},{name:"Italy", iso3:"ITA"},{name:"Lithuania", iso3:"LIT"},{name:"Luxembourg", iso3:"LUX"},{name:"Latvia", iso3:"LAT"},{name:"Malta", iso3:"MAL"},{name:"Netherlands", iso3:"NET"},{name:"Norway", iso3:"NOR"},{name:"Poland", iso3:"POL"},{name:"Portugal", iso3:"POR"},{name:"Romania", iso3:"ROM"},{name:"Slovakia", iso3:"SVK"},{name:"Slovenia", iso3:"SVN"},{name:"Sweden", iso3:"SWE"}]

let populists = ['rightshare', 'leftshare', 'othershare'];

let classNames = [];

let europeCartogram = svg.selectAll('rect')
.data(grid)
.enter()
.filter((d,i) => {if(europe28[i] != undefined){classNames.push(europe28[i].split(" ").join("-"))}; return europe28[i] != undefined})
.append("g")
.attr("class", (d,i) => {return classNames[i]});

europeCartogram
.append("rect")
.attr("class", (d,i) => {let country = names.find(n => n.name.split(" ").join("-") == classNames[i]); return country.border})
.attr("transform" , (d) => {return "translate(" + d.x + "," + d.y + ")"} )
.attr("width" ,cartogramWidth  / columns)
.attr("height" ,cartogramWidth  / columns)

europeCartogram
.append('text')
.attr("transform" , (d) => {return "translate(" + (d.x + 5) + "," + d.y + ")"} )
.attr('text-anchor', 'start')
.attr('dy', '1.5em')
.attr('dx', '.2em')
.text( (d,i) => { let country = names.find(n => n.name.split(" ").join("-") == classNames[i]);  return country.iso3})

Promise.all([
  d3.json(dataURL)
  ])
.then(ready)

function ready(data){
	
	let nodes = data[0];

	nodes.forEach((n) => {

    let countryChart = chartsWrapper.append('div').attr("class", "chart-wrapper " + n.country);
    let country = names.find(d => d.name == n.id);

    let countryName = n.country;
    if(countryName == "United Kingdom")countryName = "UK";
    countryChart.append('h3').html(countryName);

    let group = d3.select("." + n.country.split(" ").join("-"));
    let rect = group.select("rect");
    let marginX = parseInt(rect.attr("transform").split("translate(")[1].split(",")[0]);
    let marginY = parseInt(rect.attr("transform").split("translate(")[1].split(",")[1].split(")")[0]);

    let countryDataArea = [];
    let countryDataLine = [];

    n.years.forEach(y => {

     let rs = (isNaN(y.totalPopulist)) ? rs = y.totalPopulist.share.rightshare : rs = 0;
     let ls = (isNaN(y.totalPopulist)) ? ls = y.totalPopulist.share.leftshare : ls = 0;
     let os = (isNaN(y.totalPopulist)) ? os = y.totalPopulist.share.othershare : os = 0;

     countryDataArea.push({date:new Date(y.year), rightshare:rs, leftshare:ls, othershare:os});

   })

    countryDataLine.push({ id:n.country, values: n.years.map(d=>{
      let year = d.year;
      let leftShare;
      let rightShare;
      let otherShare;

      if(d.totalPopulist == 0){leftShare = null; rightShare = null; otherShare=null}
      else {
        let ls = (d.totalPopulist.share.leftshare == 0) ? leftShare = null : leftShare = d.totalPopulist.share.leftshare;
        let rs = (d.totalPopulist.share.rightshare == 0) ? rightShare = null : rightShare = d.totalPopulist.share.rightshare;
        let os = (d.totalPopulist.share.othershare == 0) ? otherShare = null : otherShare = d.totalPopulist.share.othershare;
        leftShare = ls;
        rightShare = rs;
        otherShare = os;
      }

      return {year:year, leftshare:leftShare, rightshare:rightShare, othershare:otherShare}
    })})

    let rectWidth = parseInt(rect.attr("width"))
    let rectHeight = parseInt(rect.attr("height"))

    let x = d3.scaleTime()
    .range([0,rectWidth]).domain([1992,2018]);

    let y = d3.scaleLinear()
    .range([rectHeight, 0]).domain([0,100]);

    let x2 = d3.scaleTime().range([0, 100]).domain([1992,2018]),
    y2 = d3.scaleLinear().range([100, 0]).domain([0,100]);

    let lineRight = d3.line()
    .curve(d3.curveBasis)
    .x(d => { return x2(d.year)})
    .y(d => { return y2(d.rightshare)})
    .defined(d => { return d.rightshare !== null });

    let lineLeft = d3.line()
    .curve(d3.curveBasis)
    .x(d => { return x2(d.year)})
    .y(d => { return y2(d.leftshare)})
    .defined(d => { return d.leftshare !== null });

    let lineOther = d3.line()
    .curve(d3.curveBasis)
    .x(d => { return x2(d.year)})
    .y(d => { return y2(d.othershare)})
    .defined(d => { return d.othershare !== null });

    let area = d3.area()
    .curve(d3.curveStep)
    .x(function(d) { return x(d.data.date)})
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })
    .defined( d => {return d[1] > 0 })

    let stack = d3.stack()
    .keys(populists)
    .offset(d3.stackOffsetNone);

    let wingPattern

    populists.forEach(d => {

      wingPattern = defs
      .append('pattern')
      .attr('id', 'wing-hatch--' + d)
      .attr('class', 'wing-hatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 4)
      .attr('height', 4)

      .append('path')
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('class', 'wing-hatch-stroke')
    })

    let wings = group.selectAll(".wing")
    .data(stack(countryDataArea))
    .enter()
    .append('g')
    .attr('class', "wing")

    wings
    .append("path")
    .attr("d", area)
    .attr('class', function(d) { return "area " + d.key; })
    .attr("transform", "translate("+ marginX + "," + marginY + ")")
    .style('fill', d => {return `url('#wing-hatch--${d.key}')`});

    let lines = countryChart.append('svg')
    .attr("width", "120px")
    .selectAll(".lines")
    .data(countryDataLine)
    .enter()
    .append('g')
    .attr('class', "lines")

    for (var i = 0; i<=10; i++) {

      lines.append("line")
      .attr("class", "chart-dotted-line")
      .attr("x1", 0 )
      .attr("y1", i*15)
      .attr("x2", 100)
      .attr("y2", i*15);
    }

    lines
    .append("path")
    .attr("class", "rightLine")
    .attr("d", d => { return lineRight(d.values)})
    .attr("fill", "none")

    lines
    .append("path")
    .attr("class", "leftLine")
    .attr("d", d => { return lineLeft(d.values)})
    .attr("fill", "none")

    lines
    .append("path")
    .attr("class", "otherLine")
    .attr("d", d => { return lineOther(d.values)})
    .attr("fill", "none")
  })

let swoopy = d3.swoopyDrag()
.x(d => d.annWidth)
.y(d => d.annLength)
.draggable(false)
.annotations(annotations)
.on("drag", d => window.annotations = annotations)

let swoopySel = svg.append('g').attr("class", "annotations-text").call(swoopy)

swoopySel.selectAll('text')
.attr("class", d => d.class)
.each(function(d){
  d3.select(this)
      .text('')                        //clear existing text
      .tspans(d3.wordwrap(d.text, 20), 18) //wrap after 20 char
    })

let markerDefs = svg.append('svg:defs')
.attr('id', "markerDefs");

markerDefs.append('marker')
.attr('id', 'arrow')
.attr('viewBox', '-10 -10 20 20')
.attr('markerWidth', 20)
.attr('markerHeight', 20)
.attr('orient', 'auto')
.append('path')
.attr('d', 'M-5,-4 L 0,0 L -5,4')

swoopySel.selectAll('path')
.filter(function(t){return t.class == 'arrow'})
.attr('marker-end', 'url(#arrow)');

swoopySel.selectAll('path').attr('stroke','white')

swoopySel.selectAll('path')
.filter(function(t){return t.class != 'arrow'})
.attr('stroke','grey')


swoopySel.selectAll('path').attr('fill','none')
}

