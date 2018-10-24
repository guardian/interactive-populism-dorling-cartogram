function makeCartogram(isMobile, makeGrid, svgCartogram, cartogramWidth, cartogramHeight, svgCartogramTotals)
{

let columns = 0;
let rows = 0;
let europe31 =[];
let classNames = [];
let names = [{name:"Austria", iso3:"AUS"},{name:"Belgium", iso3:"BEL"},{name:"Bulgaria", iso3:"BUL"},{name:"Switzerland", iso3:"SWI"},{name:"Cyprus", iso3:"CYP"},{name:"Czech Republic", iso3:"CZE"},{name:"Germany", iso3:"GER"},{name:"Denmark", iso3:"DEN"},{name:"Spain", iso3:"SPA"},{name:"Estonia", iso3:"EST"},{name:"Finland", iso3:"FIN"},{name:"France", iso3:"FRA"},{name:"United Kingdom", iso3:" UK"},{name:"Greece", iso3:"GRE"},{name:"Croatia", iso3:"CRO"},{name:"Hungary", iso3:"HUN"},{name:"Ireland", iso3:"IRE"},{name:"Iceland", iso3:"ICE"},{name:"Italy", iso3:"ITA"},{name:"Lithuania", iso3:"LIT"},{name:"Luxembourg", iso3:"LUX"},{name:"Latvia", iso3:"LAT"},{name:"Malta", iso3:"MAL"},{name:"Netherlands", iso3:"NET"},{name:"Norway", iso3:"NOR"},{name:"Poland", iso3:"POL"},{name:"Portugal", iso3:"POR"},{name:"Romania", iso3:"ROM"},{name:"Slovakia", iso3:"SVK"},{name:"Slovenia", iso3:"SVN"},{name:"Sweden", iso3:"SWE"}]

if(!isMobile)
{
  columns = 8;
  rows = 9;

  europe31[0]="Iceland";  europe31[3]="Norway";  europe31[4]="Sweden";  europe31[5]="Finland";  europe31[13]="Estonia";  europe31[16]="Ireland";  europe31[17]="United Kingdom";  europe31[19]="Denmark";  europe31[21]="Latvia";  europe31[26]="Netherlands";  europe31[27]="Germany";  europe31[28]="Poland";  europe31[29]="Lithuania";  europe31[33]="Belgium";  europe31[34]="Luxembourg";  europe31[35]="Austria";  europe31[36]="Czech Republic";  europe31[37]="Slovakia";  europe31[41]="France";  europe31[42]="Switzerland";  europe31[43]="Slovenia";  europe31[44]="Croatia";  europe31[45]="Hungary";  europe31[46]="Romania";  europe31[48]="Portugal";  europe31[49]="Spain";  europe31[51]="Italy";  europe31[54]="Bulgaria";  europe31[62]="Greece";  europe31[67]="Malta";  europe31[71]="Cyprus";
}
else
{
  columns = 6;
  rows = 9;

  europe31[0]="Iceland";  europe31[2]="Norway";  europe31[3]="Sweden";  europe31[4]="Finland";  europe31[10]="Estonia";  europe31[12]="Ireland";  europe31[13]="United Kingdom";  europe31[15]="Denmark";  europe31[16]="Latvia";  europe31[20]="Netherlands";  europe31[21]="Germany";  europe31[22]="Poland";  europe31[23]="Lithuania";  europe31[25]="Belgium";  europe31[26]="Luxembourg";  europe31[27]="Austria";  europe31[28]="Czech Republic";  europe31[29]="Slovakia";  europe31[30]="France";  europe31[31]="Switzerland";  europe31[32]="Slovenia";  europe31[33]="Croatia";  europe31[34]="Hungary";  europe31[35]="Romania";  europe31[36]="Portugal";  europe31[37]="Spain";  europe31[38]="Italy";  europe31[39]="Bulgaria";  europe31[40]="Greece";  europe31[44]="Malta";  europe31[47]="Cyprus";
}

let grid = makeGrid(columns, rows, cartogramWidth, cartogramHeight);
let grid2 = makeGrid(columns, rows, cartogramWidth, cartogramHeight);

let europeCartogram = svgCartogram.selectAll('rect')
.data(grid)
.enter()
.filter((d,i) => {if(europe31[i] != undefined){classNames.push(europe31[i].split(" ").join("-"))}; return europe31[i] != undefined})
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

let europeCartogramTotals = svgCartogramTotals.selectAll('rect')
.data(grid)
.enter()
.filter((d,i) => {if(europe31[i] != undefined){classNames.push(europe31[i].split(" ").join("-"))}; return europe31[i] != undefined})
.append("g")
.attr("class", (d,i) => {return classNames[i]});

europeCartogramTotals
.append("rect")
.attr("class", (d,i) => {let country = names.find(n => n.name.split(" ").join("-") == classNames[i]); return country.border})
.attr("transform" , (d) => {return "translate(" + d.x + "," + d.y + ")"} )
.attr("width" ,cartogramWidth  / columns)
.attr("height" ,cartogramWidth  / columns)

europeCartogramTotals
.append('text')
.attr("transform" , (d) => {return "translate(" + (d.x + 5) + "," + d.y + ")"} )
.attr('text-anchor', 'start')
.attr('dy', '1.5em')
.attr('dx', '.2em')
.text( (d,i) => { let country = names.find(n => n.name.split(" ").join("-") == classNames[i]);  return country.iso3})

}

export {makeCartogram}