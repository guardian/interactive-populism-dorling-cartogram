import * as d3 from 'd3'
import textures from 'textures'


function makeStacked(rectWidth, rectHeight, domainX, domainY, data, group)
{
  const populists = ['leftshare', 'othershare', 'rightshare'];

  let x = d3.scaleTime()
  .range([0,rectWidth]).domain(domainX);

  let y = d3.scaleLinear()
  .range([rectHeight, 0]).domain(domainY);

  let area = d3.area()
  .curve(d3.curveStep)
  .x(function(d) { return x(d.data.date)})
  .y0(function(d) { return y(d[0]); })
  .y1(function(d) { return y(d[1]); })
  .defined( d => {return d[1] > 0 })

  let stack = d3.stack()
  .keys(populists)
  .offset(d3.stackOffsetNone);

   group.selectAll('g').remove()
   group.selectAll('defs').remove()
   group.selectAll('text').remove()
   group.selectAll('line').remove()
   group.selectAll('path').remove()
   group.selectAll('rect').remove()

  if(group.node().getAttributeNode("class").value == "area-group-shade")
  {
    let t = textures.lines()
    .size(4)
    .strokeWidth(1)
    .stroke("#B3B3B4");

    group.call(t);

    data.forEach(d => {

      let date = d.date;

      if(d.date.getFullYear() == 2018)
      {
        date = new Date(2017, 11, 30);;
      }

      if(d.cabinet)
      {
        group
       .append('rect')
       .attr("class", "shade y" + d.date.getFullYear())
       .attr("x", x(date))
       .attr("width", rectWidth / (domainX[1].getFullYear() - domainX[0].getFullYear()))
       .attr("height",rectHeight )
       .style("fill", t.url());
      }
    })
  }


  

  if(group.node().getAttributeNode("class").value == "area-group-fill")
  {
    let wings = group.selectAll(".wing")
    .data(stack(data))
    .enter()
    .append('g')
    .attr('class', "wing")

    wings
    .append("path")
    .attr("d", area)
    .attr('class', function(d) { return "area " + d.key; })
    //.attr("transform", "translate("+ marginX + "," + marginY + ")")

   /* group.append("g")
            .attr("transform", "translate(0," + (rectHeight) + ")")
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d3.timeFormat("%Y")));*/
  }

  if(group.node().getAttributeNode("class").value == "area-group-lines")
  {
    let year1 = group.append("text").html("1998");
    let year2 = group.append("text").html("2008");
    let year3 = group.append("text").html("2018");

    year1.attr("transform", "translate("+ 0 + "," + (rectHeight + 13) + ")")
    year2.attr("transform", "translate("+ (x(new Date(2008, 0, 1)) - (year2.node().getComputedTextLength() / 2)) + "," + (rectHeight + 13) + ")")
    year3.attr("transform", "translate("+ (x(new Date(2018, 11, 30)) - year3.node().getComputedTextLength()) + "," + (rectHeight + 13) + ")")

    let base = domainY[1] / 10;

    let className = 0;

    for (var i = 0; i <= base; i++) {

      className = i;
      if(className == base)className = "ast";

      group.append("line")
      .attr("class", "chart-dotted-line l" + className)
      .attr("x1", 0 )
      .attr("y1", i * (rectHeight / base))
      .attr("x2", rectWidth)
      .attr("y2", i * (rectHeight / base));

      let label = domainY[1] - (i*10);

      if(i> 0 && i%2 == 0)
      {
        if(i == 2)label += "%"; 
        group.append("text")
        .attr("class", "chart-label l" + className)
        .attr("transform", "translate("+ (rectWidth + 3) + ", "+ (i * (rectHeight / base)) +")")
        .html(label)
      }
    }

   
      group.append("line")
      .attr("class", "chart-dotted-line middle")
      .attr("x1", x(new Date(2008, 0, 1)) )
      .attr("y1", 0)
      .attr("x2", x(new Date(2008, 0, 1)))
      .attr("y2", rectHeight);

     

  }

  if(group.node().getAttributeNode("class").value == "area-group-stroke")
  {
    let wings = group.selectAll(".wing")
    .data(stack(data))
    .enter()
    .append('g')
    .attr('class', "wing")

    wings
    .append("path")
    .attr("d", area)
    .attr('class', function(d) { return "area " + d.key; })
    
  } 
}
export { makeStacked }