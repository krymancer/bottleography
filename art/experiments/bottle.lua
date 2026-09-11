-- Run through scripts/aseprite-smoke.py against a new 32 x 48 canvas.
-- Coordinates are native game pixels; the PNG preview is enlarged separately.
local spr = app.activeSprite
assert(spr and spr.width == 32 and spr.height == 48, 'Expected a 32x48 canvas')
local colors = {
  '#111c19', '#23382e', '#344e3a', '#50654a', '#7c8860',
  '#b6b77d', '#e1d49b', '#504737', '#807052', '#b5a078'
}
local function color(hex)
  return Color{r=tonumber(hex:sub(2,3),16), g=tonumber(hex:sub(4,5),16),
               b=tonumber(hex:sub(6,7),16), a=255}
end
local pal = Palette(#colors + 1)
pal:setColor(0, Color{r=0,g=0,b=0,a=0})
for i, hex in ipairs(colors) do pal:setColor(i, color(hex)) end
spr:setPalette(pal)
spr.layers[1].name = 'Glass'
local glass = Image(32,48)
local function rect(img, x, y, w, h, hex)
  for yy=y,y+h-1 do for xx=x,x+w-1 do
    img:drawPixel(xx, yy, color(hex))
  end end
end
local function r(x,y,w,h,c) rect(glass,x,y,w,h,colors[c]) end
-- Stepped shoulders, thick base, dark right edge, olive glass.
r(12,5,8,13,1); r(10,17,12,3,1); r(8,20,16,3,1)
r(7,23,18,20,1); r(9,43,14,2,1)
r(13,7,6,12,3); r(11,18,10,4,3); r(9,22,14,19,2)
r(10,22,10,19,3); r(10,23,3,17,4); r(13,21,6,19,3)
r(20,24,3,17,2); r(10,41,12,2,3); r(11,41,8,1,4)
r(13,9,2,10,4); r(12,19,2,3,4); r(10,23,1,6,5)
r(11,23,1,3,6); r(10,37,1,3,5); r(14,10,1,5,5)
-- Cork and lip.
r(12,3,8,5,1); r(13,3,6,4,8); r(13,3,5,1,10)
r(13,4,2,2,9); r(17,5,2,2,7)
r(11,7,10,3,1); r(12,7,8,1,5); r(12,8,8,1,3)
spr:newCel(spr.layers[1],1,glass,Point(0,0))
local label = spr:newLayer(); label.name = 'Worn paper label'
local paper = Image(32,48)
rect(paper,9,30,14,7,colors[8]); rect(paper,10,29,12,8,colors[9])
rect(paper,10,29,10,1,colors[10]); rect(paper,10,30,2,5,colors[10])
rect(paper,20,31,2,6,colors[8]); rect(paper,13,31,6,1,colors[7])
rect(paper,14,33,4,1,colors[7]); rect(paper,13,35,5,1,colors[8])
spr:newCel(label,1,paper,Point(0,0))
local shine = spr:newLayer(); shine.name = 'Lamp reflection'
local highlight = Image(32,48)
rect(highlight,11,23,1,2,colors[6]); rect(highlight,14,10,1,2,colors[6])
spr:newCel(shine,1,highlight,Point(0,0))
spr:saveAs(spr.filename)
print('BOTTLE_OK: 32x48, three editable layers, ten colors plus transparency')
