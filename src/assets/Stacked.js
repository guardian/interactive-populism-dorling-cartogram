import * as d3 from 'd3'


function makeStacked(rectWidth, rectHeight, domainX, domainY, data, group, populists, defs, marginX, marginY)
{

	let x = d3.scaleTime()
  .range([0,rectWidth]).domain(domainX);

  let y = d3.scaleLinear()
  .range([rectHeight, 0]).domain(domainY);

  let area = d3.area()
  .curve(d3.curveStep)
  .x(function(d) { return x(d.data.date.getFullYear())})
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
  .data(stack(data))
  .enter()
  .append('g')
  .attr('class', "wing")

  wings
  .append("path")
  .attr("d", area)
  .attr('class', function(d) { return "area " + d.key; })
  .attr("transform", "translate("+ marginX + "," + marginY + ")")
  .style('fill', d => {return `url('#wing-hatch--${d.key}')`});
}
export { makeStacked }