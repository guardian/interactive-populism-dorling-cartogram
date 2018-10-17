import * as d3 from 'd3'

function makeLines(data, rectWidth, rectHeight, countryChart, domainX, domainY)
{
		let x2 = d3.scaleTime().range([0, rectWidth]).domain(domainX),
      y2 = d3.scaleLinear().range([rectHeight, 0]).domain(domainY);

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

      let lineAccum = d3.line()
      .curve(d3.curveBasis)
      .x(d => { return x2(d.year)})
      .y(d => { return y2(d.accum)})
      .defined(d => { return d.accum !== null });

      let lines = countryChart.append('svg')
      .attr("width", rectWidth + "px")
      .attr("height", rectHeight + "px")
      .selectAll(".lines")
      .data(data)
      .enter()
      .append('g')
      .attr('class', "lines")

      for (var i = 0; i<=10; i++) {

        lines.append("line")
        .attr("class", "chart-dotted-line")
        .attr("x1", 0 )
        .attr("y1", i* (rectHeight / 10))
        .attr("x2", rectWidth)
        .attr("y2", i* (rectHeight / 10));
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

      lines
      .append("path")
      .attr("class", "accumLine")
      .attr("d", d => { return lineAccum(d.values)})
      .attr("fill", "none")
}

export {makeLines}