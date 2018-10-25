import * as d3 from 'd3'
import textures from 'textures'


function makeStacked(rectWidth, rectHeight, domainX, domainY, data, group, populists, marginX, marginY)
{
  let parseYear = d3.timeParse("%Y");

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

   group.selectAll('g').remove()
   group.selectAll('defs').remove()

  if(group.node().getAttributeNode("class").value == "area-group-stroke")
  {
    let t = textures.lines()
    .size(4)
    .strokeWidth(1)
    .stroke("#B3B3B4");

    group.call(t);

    group.append('g').selectAll(".shade")
    .data(data)
    .enter().append("rect")
    .filter(d => d.cabinet)
    .attr("class", "shade")
    .attr("x", function (d) {
      return x(d.date.getFullYear());
    })
    .attr("width", rectWidth / 26)
    .attr("y", marginY)
    .attr("height",rectHeight)
    .style("fill", t.url());
  }

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
}
export { makeStacked }