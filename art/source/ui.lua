-- Bottleography UI chrome: 9-slice frames, buttons, nameplate and an icon sheet.
-- Everything is drawn at 1x on the pixel grid; style.css scales it by --px (3px).
-- Run: ~/.local/bin/aseprite --batch --script-param root="$PWD" --script art/source/ui.lua
local root = app.params.root or '/home/junho/projects/bottleography'
local img
local colors = {}
local function col(hex, a)
 local key = hex .. (a or 255)
 if not colors[key] then colors[key] = Color{r=tonumber(hex:sub(1,2),16), g=tonumber(hex:sub(3,4),16), b=tonumber(hex:sub(5,6),16), a=a or 255} end
 return colors[key]
end
local function r(x,y,w,h,c,a)
 for yy=math.max(0,y),math.min(img.height-1,y+h-1) do
  for xx=math.max(0,x),math.min(img.width-1,x+w-1) do img:drawPixel(xx,yy,col(c,a)) end
 end
end
-- Concentric rings from the outside in. nil leaves a ring transparent.
local function rings(w,h,bands)
 for i,c in ipairs(bands) do
  local inset=i-1
  if c then
   r(inset,inset,w-inset*2,1,c); r(inset,h-1-inset,w-inset*2,1,c)
   r(inset,inset,1,h-inset*2,c); r(w-1-inset,inset,1,h-inset*2,c)
  end
 end
end
local function export(name,w,h,draw)
 local s=Sprite(w,h); img=Image(w,h); draw()
 s.cels[1].image=img
 img:saveAs(root..'/assets/'..name..'.png'); s:saveAs(root..'/art/source/'..name..'.aseprite')
 s:close()
end
local OUT,BRASS_HI,BRASS,BRASS_LO='060a07','e0bf79','c09159','76673f'
local WOOD_HI,WOOD,WOOD_LO='8a6540','5c4327','3a2a19'
local PAPER,LEATHER_HI,LEATHER,LEATHER_LO='c7c0a0','a79b72','625a39','4e4930'
local INK='282c20'

-- Dialogue panel: a thin brass band with riveted corners. Slice 6.
export('ui-frame',18,18,function()
 rings(18,18,{OUT,BRASS_HI,BRASS,BRASS_LO,OUT,'141e18'})
 for _,p in ipairs({{1,1},{14,1},{1,14},{14,14}}) do
  local x,y=p[1],p[2]
  r(x,y,3,3,BRASS_LO); r(x+1,y+1,1,1,BRASS_HI)
 end
 r(4,13,10,1,'0d1710'); r(13,4,1,10,'0d1710')
end)

-- Journal: stitched leather binding around the paper. Slice 6.
export('ui-frame-paper',18,18,function()
 rings(18,18,{'2a2417',LEATHER_HI,LEATHER,LEATHER_LO,LEATHER_HI,'2a2417',PAPER})
 for i=0,17 do
  if i%4<2 then r(i,2,1,1,'c7b98a'); r(i,15,1,1,'c7b98a'); r(2,i,1,1,'c7b98a'); r(15,i,1,1,'c7b98a') end
 end
 for _,p in ipairs({{0,0},{16,0},{0,16},{16,16}}) do r(p[1],p[2],2,2,LEATHER_HI) end
 r(6,6,6,6,PAPER)
end)

-- Small chrome for tool buttons and the journal close bar. Slice 4.
local function button(name,edge,fill,hi)
 export(name,12,12,function()
  rings(12,12,{OUT,edge,BRASS_LO,'1c2418'})
  r(4,4,4,4,fill)
  r(1,1,10,1,hi); r(1,1,1,10,hi)
  r(1,10,10,1,BRASS_LO); r(10,1,1,10,BRASS_LO)
 end)
end
button('ui-button',BRASS,'0f1a13',BRASS_HI)
button('ui-button-hover',BRASS_HI,'1a2a1d','f2dfa7')

-- Speaker nameplate: dark leather tag with a brass edge. Slice 5.
export('ui-nameplate',16,16,function()
 rings(16,16,{OUT,BRASS,BRASS_LO,'2a1f12','2a1f12','2a1f12','2a1f12','2a1f12'})
 r(1,1,14,1,BRASS_HI); r(1,1,1,14,BRASS_HI)
 r(3,3,10,1,'3b2c1a'); r(3,3,1,10,'3b2c1a')
end)

-- Choice row highlight: a soft brass bracket. Slice 4.
export('ui-choice',12,12,function()
 rings(12,12,{nil,BRASS_LO,nil,nil})
 r(1,1,1,1,BRASS_HI); r(10,1,1,1,BRASS_HI); r(1,10,1,1,BRASS_HI); r(10,10,1,1,BRASS_HI)
 r(4,4,4,4,'e0bf79',22)
end)

-- Stitched divider, repeats horizontally.
export('ui-divider',8,2,function()
 r(0,0,5,1,BRASS_LO); r(1,1,3,1,'2a1f12')
end)

-- Icon sheet: 8x8 cells. Rows: light brass, dim olive, ember orange, dark ink (for paper).
-- Columns: 0 arrow, 1 check, 2 pin, 3 diamond, 4 continue, 5 pen, 6 book, 7 close, 8 fullscreen, 9 replay
local icons = {
 arrow={'..#.....','..##....','..###...','..####..','..###...','..##....','..#.....','........'},
 check={'........','......#.','.....##.','.#..##..','.####...','..##....','........','........'},
 pin={'........','...####.','.....##.','....#.#.','...#..#.','..#.....','.#......','........'},
 diamond={'...#....','..###...','.#####..','#######.','.#####..','..###...','...#....','........'},
 continue={'........','.#####..','.#####..','..###...','..###...','...#....','...#....','........'},
 pen={'.....##.','....####','...####.','..####..','.####...','.###....','##......','#.......'},
 book={'.######.','.#....#.','.#.##.#.','.#....#.','.#.##.#.','.#....#.','.######.','........'},
 close={'........','.#....#.','..#..#..','...##...','...##...','..#..#..','.#....#.','........'},
 fullscreen={'###..###','#......#','#......#','........','........','#......#','#......#','###..###'},
 replay={'..####..','.#....#.','#......#','#...#..#','....#.#.','....###.','........','........'},
}
local order={'arrow','check','pin','diamond','continue','pen','book','close','fullscreen','replay'}
local rows={'e0bf79','8a9478','e7a56b','3b3526'}
export('ui-icons',80,32,function()
 for ri,c in ipairs(rows) do
  for ci,name in ipairs(order) do
   for y=1,8 do
    local row=icons[name][y]
    for x=1,8 do if row:sub(x,x)=='#' then r((ci-1)*8+x-1,(ri-1)*8+y-1,1,1,c) end end
   end
  end
 end
end)
print('UI_OK: frames, buttons, nameplate, choice, divider and icon sheet exported')
