import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3Swoopydrag from 'd3-swoopy-drag'
import * as d3Jetpack from 'd3-jetpack'
import * as topojson from 'topojson'
import europe from '../assets/world-simple.json'
import { desktop, mobile } from '../assets/annotations.js'
import { makeGrid } from '../assets/Grid.js'
import { makeStacked } from '../assets/Stacked.js'
import { makeLines } from '../assets/Lines.js'
import { makeCartogram } from '../assets/Cartogram.js'

const d3 = Object.assign({}, d3B, d3Select, d3Swoopydrag, d3Jetpack);

const yearByCountry = "<%= path %>/assets/yearbycountry.json";
const countryByYear = "<%= path %>/assets/countrybyyear.json";

const isMobile = window.matchMedia('(max-width: 620px)').matches;

const svgCartogram = d3.select(".cartogram-wrapper svg");
const svgCartogramTotals = d3.select(".cartogram-wrapper.totals svg");

const mapsWrapper = d3.select(".maps-wrapper");

const chartsWrapper = d3.select(".charts-wrapper");
const defs = svgCartogram.append('defs')

let cartogramPadding = 10;
let cartogramWidth = 620 - cartogramPadding;
let cartogramHeight = 700 - cartogramPadding;
svgCartogram.attr("width" , 620)
svgCartogram.attr("height" , 700)
svgCartogramTotals.attr("width" , 620)
svgCartogramTotals.attr("height" , 700)

let linesWidth = 120 - cartogramPadding;
let linesHeight = 120 - cartogramPadding;

if(isMobile){
  cartogramWidth = window.innerWidth - 20;
  cartogramHeight = ( window.innerWidth * 850 / 620 );
  svgCartogram.attr("width" , window.innerWidth)
  svgCartogram.attr("height" , window.innerWidth * 850 / 620)
  svgCartogramTotals.attr("width" , window.innerWidth)
  svgCartogramTotals.attr("height" , window.innerWidth * 850 / 620)

  linesWidth = (window.innerWidth / 2) - 20;
  linesHeight = 120 - cartogramPadding;
}

let populists = ['rightshare', 'leftshare', 'othershare'];

let countryGroups = [
{country:"Austria", group:"alps"},
{country:"Belgium", group:"heart"},
{country:"Bulgaria", group:""},
{country:"Switzerland", group:"alps"},
{country:"Cyprus", group:""},
{country:"Czech Republic", group:"visegrad"},
{country:"Germany", group:"heart"},
{country:"Denmark", group:"scandinavia"},
{country:"Spain", group:"south"},
{country:"Estonia", group:""},
{country:"Finland", group:"scandinavia"},
{country:"France", group:"heart"},
{country:"United Kingdom", group:""},
{country:"Greece", group:"south"},
{country:"Croatia", group:""},
{country:"Hungary", group:"visegrad"},
{country:"Ireland", group:""},
{country:"Iceland", group:""},
{country:"Italy", group:"south"},
{country:"Lithuania", group:""},
{country:"Luxembourg", group:""},
{country:"Latvia", group:""},
{country:"Malta", group:""},
{country:"Netherlands", group:"heart"},
{country:"Norway", group:"scandinavia"},
{country:"Poland", group:"visegrad"},
{country:"Portugal", group:"south"},
{country:"Romania", group:""},
{country:"Slovakia", group:""},
{country:"Slovenia", group:""},
{country:"Sweden", group:"scandinavia"}
]

//CARTOGRAM======================================


makeCartogram(isMobile, makeGrid, svgCartogram, cartogramWidth, cartogramHeight, svgCartogramTotals)

//END CARTOGRAM=====================================

Promise.all([
  d3.json(yearByCountry),
  d3.json(countryByYear)
  ])
.then(ready)

function ready(elections){
	
	let countries = elections[0];
  let years = elections[1];

  countries.forEach((n) => {

    let countryGroup = countryGroups.find(c => c.country == n.country);

    if(countryGroup.group != "")
    {
      let areaChartsWrapper = d3.select(".countries-wrapper." + countryGroup.group)

      let countryName = n.country;
      if(countryName == "United Kingdom")countryName = "UK";

      let group = d3.select(".cartogram-wrapper ." + n.country.split(" ").join("-"));
      let rect = group.select("rect");

      let areaDiv = areaChartsWrapper.append('div').attr("class", "chart-wrapper");
      areaDiv.append('h3').html(countryName)
      let areaGroup = areaDiv.append('svg');

      let countryDataArea = [];

      n.years.forEach(y => {

       let rs = (isNaN(y.totalPopulist)) ? rs = y.totalPopulist.share.rightshare : rs = 0;
       let ls = (isNaN(y.totalPopulist)) ? ls = y.totalPopulist.share.leftshare : ls = 0;
       let os = (isNaN(y.totalPopulist)) ? os = y.totalPopulist.share.othershare : os = 0;

       countryDataArea.push({date:new Date(+y.year+1, 0, 0), rightshare:rs, leftshare:ls, othershare:os, cabinet:y.cabinet});

     })

      let areaGroupFill = areaGroup.append('g').attr("class", "area-group-fill");
      let areaGroupLines = areaGroup.append('g').attr("class", "area-group-lines");
      let areaGroupStroke = areaGroup.append('g').attr("class", "area-group-stroke");

      makeStacked(200, 200, [1992,2018], [0,70], countryDataArea, areaGroupFill, populists, defs, 10, 10);

      for (var i = 0; i<=7; i++) {

        areaGroupLines.append("line")
        .attr("class", "chart-dotted-line l" + i)
        .attr("x1", 0 )
        .attr("y1", i* (210 / 7))
        .attr("x2", 210)
        .attr("y2", i* (210 / 7));

        if(n.country == "Austria")
        {
          if(i > 1)areaGroupLines.append("text").html(70 - (i * 10)).attr("transform", "translate("+ 215 + "," + ((i * (210 / 7))) + ")")
          else if(i == 1)areaGroupLines.append("text").html(70 - (i * 10) + "%").attr("transform", "translate("+ 215 + "," + ((i * (210 / 7))) + ")")
        }
        
      }

    for (var i = 0; i<=2; i++) {

      areaGroupLines.append("line")
      .attr("class", "chart-dotted-line")
      .attr("x1", i* (210 / 2) )
      .attr("y1", 0)
      .attr("x2", i* (210 / 2))
      .attr("y2", 210);
    }

    let groupTotal = d3.select(".cartogram-wrapper.totals ." + n.country.split(" ").join("-"));
    let rectTotal = group.select("rect");
    let rectWidth = parseInt(rect.attr("width"));
    let rectHeight = parseInt(rect.attr("height"));
    let marginX = parseInt(rect.attr("transform").split("translate(")[1].split(",")[0]);
    let marginY = parseInt(rect.attr("transform").split("translate(")[1].split(",")[1].split(")")[0]);

    areaGroupLines.append("text").html("1992").attr("transform", "translate("+ 0 + "," + 225 + ")")
    areaGroupLines.append("text").html("2005").attr("transform", "translate("+ 92 + "," + 225 + ")")
    areaGroupLines.append("text").html("2018").attr("transform", "translate("+ 187 + "," + 225 + ")")


    makeStacked(200, 200, [1992,2018], [0,70], countryDataArea, areaGroupStroke, populists, defs, 10, 10);

    makeStacked(rectWidth, rectWidth, [1992,2018], [0,100], countryDataArea, group, populists, defs, marginX, marginY);

    let data2018 = countryDataArea.slice(countryDataArea.length -1)[0];

    let total2018 = data2018.leftshare + data2018.rightshare + data2018.othershare;

    let totalWidth = rectWidth * total2018 / 100;
    let marginXTotal = parseInt(rectTotal.attr("transform").split("translate(")[1].split(",")[0]) + rectWidth - totalWidth;
    let marginYTotal = parseInt(rectTotal.attr("transform").split("translate(")[1].split(",")[1].split(")")[0]) + rectHeight - totalWidth;

    groupTotal.append("rect")
    .attr("width", totalWidth)
    .attr("height", totalWidth)
    .attr("class", 'area')
    .attr("transform", "translate("+ marginXTotal + "," + marginYTotal + ")")
    .style('fill', `url('#wing-hatch--${'rightshare'}')`);


    if(n.country != "Malta" && n.country != "Portugal")
    {
      let countryChart = chartsWrapper.append('div').attr("class", "chart-wrapper " + n.country);
      countryChart.append('h3').html(countryName);
      let countryDataLine = [];

      countryDataLine.push({ id:n.country, values: n.years.map(d=>{
        let year = d.year;
        let leftShare=0;
        let rightShare=0;
        let otherShare=0;
        let accum=0;


        if(d.totalPopulist == 0){leftShare = null; rightShare = null; otherShare=null}
        else {
          let ls = (d.totalPopulist.share.leftshare == 0) ? leftShare = null : leftShare = d.totalPopulist.share.leftshare;
          let rs = (d.totalPopulist.share.rightshare == 0) ? rightShare = null : rightShare = d.totalPopulist.share.rightshare;
          let os = (d.totalPopulist.share.othershare == 0) ? otherShare = null : otherShare = d.totalPopulist.share.othershare;
          leftShare = ls;
          rightShare = rs;
          otherShare = os;
          accum = ls + rs+ os;
        }

        return {year:year, leftshare:leftShare, rightshare:rightShare, othershare:otherShare, accum:accum}
      })})

      makeLines(countryDataLine, linesWidth, linesHeight, countryChart, [1992,2018], [0,100])
      
    }
  }


})

const mapWidth = 120;
const mapHeight = 120;

years.forEach(y => {
  let mapWrapper = mapsWrapper.append('div').attr("class", "map-wrapper y" + y.year);
  let mapSvg = mapWrapper.append('svg');

  mapSvg.attr("width", linesWidth)
  mapSvg.attr("height", linesHeight)

  let map = makeMap(mapSvg,linesWidth,linesHeight);

  y.countries.forEach( c => {
    d3.selectAll(".map-wrapper.y" + y.year + " svg ." + c.country.split(" ").join("."))
    .style('fill', `url('#wing-hatch--${'rightshare'}')`)
    .attr("stroke", "black")
    .attr("stroke-width", 0)
    .style("opacity", +c.totalPopulist.share.totalshare / 100)
  })

})


function makeMap(wrapper, mapWidth, mapheight)
{
  let projection = d3.geoMercator()
  .center([6, 52])
  .translate([linesWidth / 2, linesHeight / 2])
  .scale(100)

  let path = d3.geoPath()
  .projection(projection);

  wrapper
  .append("path")
  .datum(topojson.feature(europe, europe.objects.ne_10m_admin_0_map_subunits))
  .attr("d", path)
  .attr("fill", "grey")

  wrapper
  .selectAll("path")
  .data(topojson.feature(europe, europe.objects.ne_10m_admin_0_map_subunits).features)
  .enter().append("path")
  .attr("d", path)
  .attr("class", d => {return d.properties.admin})
  .attr("fill", "grey")

  return wrapper
}
}
