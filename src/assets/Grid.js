function makeGrid(columns, rows, width, height)
{
  let positions = [];
  let heightAccum = 0,
  widthAccum = 0,
  count = 0,
  squareWidth = parseInt(width / columns),
  squareheight = parseInt(height / rows);

  for (let i = 0; i < columns * rows; i++) {
    positions.push({x:widthAccum , y:heightAccum, center:[widthAccum + (width  / columns) / 2, heightAccum + (width / columns) / 2], width:squareWidth, height:squareheight});

    widthAccum += squareWidth + 2;

    count++
    
    if(count % columns == 0)
    {
      heightAccum += squareWidth + 2;
      widthAccum = 0;
      count = 0;
    }
  }

  return positions;
}

export { makeGrid };