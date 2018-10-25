import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3Swoopydrag from 'd3-swoopy-drag'
import * as d3Jetpack from 'd3-jetpack'
import { makeStacked } from '../assets/Stacked.js'

const d3 = Object.assign({}, d3B, d3Select, d3Swoopydrag, d3Jetpack);

const yearByCountry = "<%= path %>/assets/yearbycountry.json";

let isMobile = window.matchMedia('(max-width: 619px)').matches;

let svgWidth

let svgHeight = 150;

let padding = 30;

if(isMobile)
{
  svgWidth = window.innerWidth - padding;
}
else
{
  svgWidth = 205;
}
 

const populists = ['rightshare', 'leftshare', 'othershare'];

const countryGroups = [
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

let countriesData = [];


Promise.all([
  d3.json(yearByCountry)
  ])
.then(ready)

function ready(elections){
	
	let countries = elections[0];

  countries.forEach((n) => {

    let countryGroup = countryGroups.find(c => c.country == n.country);

    if(countryGroup.group != "")
    {
      let countriesWrapper = d3.select(".countries-wrapper." + countryGroup.group)

      let countryName = n.country;

      let areaDiv = countriesWrapper.append('div').attr("class", "chart-wrapper " + countryName.replace(' ', "-"));
      areaDiv.append('h3').html(countryName)
      let areaGroup = areaDiv.append('svg').attr("width", svgWidth + padding).attr("height", svgHeight + padding);

      let countryDataArea = [];

      n.years.forEach(y => {

       let rs = (isNaN(y.totalPopulist)) ? rs = y.totalPopulist.share.rightshare : rs = 0;
       let ls = (isNaN(y.totalPopulist)) ? ls = y.totalPopulist.share.leftshare : ls = 0;
       let os = (isNaN(y.totalPopulist)) ? os = y.totalPopulist.share.othershare : os = 0;

       countryDataArea.push({date:new Date(+y.year+1, 0, 0), rightshare:rs, leftshare:ls, othershare:os, cabinet:y.cabinet, country:countryName});
     })

      countriesData[countryName] = countryDataArea

      let areaGroupFill = areaGroup.append('g').attr("class", "area-group-fill");
      let areaGroupLines = areaGroup.append('g').attr("class", "area-group-lines");
      let areaGroupStroke = areaGroup.append('g').attr("class", "area-group-stroke");

      makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countryDataArea, areaGroupFill, populists, padding, padding);
      makeLines(areaGroupLines, n.country, svgWidth, svgHeight)
      makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countryDataArea, areaGroupStroke, populists, padding, padding);

      if(countryName == "Austria")
      {
        let areaGroupAnnotations = areaGroup.append('g').attr("class", "area-group-annotation");

        areaGroupAnnotations
        .append("path")
        .attr("d","M2.378,35.495C4.158,19.499,17.705,7.081,34.18,7.081")
        .attr("class", "line")

        areaGroupAnnotations
        .append("path")
        .attr("class", "arrow")
        .attr("d","M4.974,34.952 2.18,39.081 0,34.597");

        areaGroupAnnotations
        .append("text")
        .attr("class", "text")
        .attr("transform", "translate(40,10)")
        .attr("width", "50px")
        .html("Populism reaches");

        areaGroupAnnotations
        .append("text")
        .attr("class", "text")
        .attr("transform", "translate(40,25)")
        .attr("width", "50px")
        .html("the goverment");


        if(isMobile)
        {
          svgWidth = window.innerWidth - padding;

          d3.select(".area-group-annotation").style("transform", "translate(" + (svgWidth/2) + "px, 10px)")
        }
        else
        {
          svgWidth = 200;

          d3.select(".area-group-annotation").style("transform", "translate(" + (svgWidth/3) + "px, 0px)")
        }
      }
      
    }

  })



  window.addEventListener("resize", resize, false);
}

function resize()
{
  
  isMobile = window.matchMedia('(max-width: 620px)').matches;



    d3.map(countryGroups, g => {

     

      if(countriesData[g.country])
      {
        let countryGroup = g.group;
        let country = g.country.replace(' ', "-");

        if(isMobile)
        {

          svgWidth = window.innerWidth - padding;

          d3.select(".area-group-annotation").style("transform", "translate(" + (svgWidth/2 ) + "px, 10px)")

          d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg").attr("width", svgWidth + padding)

          makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countriesData[g.country], d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-fill"), populists, padding, padding);
          makeLines( d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-lines"), country, svgWidth, svgHeight)
          makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countriesData[g.country], d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-stroke"), populists, padding, padding);
        }
        else
        {
          svgWidth = 200;

          d3.select(".area-group-annotation").style("transform", "translate(" + (svgWidth/3) + "px, 0px)")

          d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg").attr("width", svgWidth + padding)

          makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countriesData[g.country], d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-fill"), populists, padding, padding);
          makeLines( d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-lines"), country, 200, svgHeight)
          makeStacked(svgWidth - padding, svgHeight - padding, [1992,2018], [0,70], countriesData[g.country], d3.select(".countries-wrapper." + countryGroup + " .chart-wrapper." + country + " svg .area-group-stroke"), populists, padding, padding);
        }
      }
      
    })
}

function makeLines(areaGroupLines, country, width, height)
{
  areaGroupLines.selectAll('line').remove()
  areaGroupLines.selectAll('text').remove()

  let year1 = areaGroupLines.append("text").html("1992");
  let year2 = areaGroupLines.append("text").html("2004");
  let year3 = areaGroupLines.append("text").html("2018");

  year1.attr("transform", "translate("+ 0 + "," + (height + 15) + ")")
  year2.attr("transform", "translate("+ ((width / 2) - (year2.node().getComputedTextLength() / 2)) + "," + (height + 15) + ")")
  year3.attr("transform", "translate("+ (width - year1.node().getComputedTextLength()) + "," + (height + 15) + ")")

  for (var i = 0; i<=7; i++) {

        areaGroupLines.append("line")
        .attr("class", "chart-dotted-line l" + i)
        .attr("x1", 0 )
        .attr("y1", i* ((height - padding) / 7) + padding)
        .attr("x2", width)
        .attr("y2", i* ((height - padding) / 7) + padding);

        if(country == "Austria")
        {
          if(i > 1)areaGroupLines.append("text").html(70 - (i * 10)).attr("transform", "translate("+ (width + 5) + "," + (i * ((height - padding) / 7) + padding) + ")")
            else if(i == 1)areaGroupLines.append("text").html(70 - (i * 10) + "%").attr("transform", "translate("+ (width + 5) + "," + (i * ((height - padding) / 7) + padding) + ")")
        }
        
      }

      for (var i = 0; i<=2; i++) {

        areaGroupLines.append("line")
        .attr("class", "chart-dotted-line")
        .attr("x1", i* (width / 2) )
        .attr("y1", 0)
        .attr("x2", i* (width / 2))
        .attr("y2", height);
      }
}
