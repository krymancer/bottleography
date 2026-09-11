-- Bottleography production art. Run with Aseprite via the MCP run_lua_script tool.
-- All shapes are rasterized onto the native 480x240 pixel grid.
local root = app.params.root or '/home/junho/projects/bottleography'
local spr = Sprite(480,240)
local img, layer
local colors = {}
local function col(hex)
 if not colors[hex] then colors[hex]=Color{r=tonumber(hex:sub(1,2),16),g=tonumber(hex:sub(3,4),16),b=tonumber(hex:sub(5,6),16),a=255} end
 return colors[hex]
end
local function r(x,y,w,h,c)
 for yy=math.max(0,y),math.min(img.height-1,y+h-1) do
  for xx=math.max(0,x),math.min(img.width-1,x+w-1) do img:drawPixel(xx,yy,col(c)) end
 end
end
local function line(x,y,x2,y2,c)
 local n=math.max(math.abs(x2-x),math.abs(y2-y))
 for i=0,n do local t=n==0 and 0 or i/n; r(math.floor(x+(x2-x)*t),math.floor(y+(y2-y)*t),1,1,c) end
end
local function poly(p,c)
 local miny,maxy=999,-999
 for _,v in ipairs(p) do miny=math.min(miny,v[2]); maxy=math.max(maxy,v[2]) end
 for y=miny,maxy do
  local xs={}
  for i,a in ipairs(p) do
   local b=p[i%#p+1]
   if (a[2]<=y and b[2]>y) or (b[2]<=y and a[2]>y) then xs[#xs+1]=a[1]+(y-a[2])*(b[1]-a[1])/(b[2]-a[2]) end
  end
  table.sort(xs)
  for i=1,#xs-1,2 do local x=math.ceil(xs[i]); r(x,y,math.floor(xs[i+1])-x+1,1,c) end
 end
end
local function ellipse(x,y,w,h,c)
 for yy=y,y+h-1 do for xx=x,x+w-1 do
  if ((xx-x+.5-w/2)/(w/2))^2+((yy-y+.5-h/2)/(h/2))^2<=1 then r(xx,yy,1,1,c) end
 end end
end
local function begin(name,w,h)
 layer=spr:newLayer(); layer.name=name; img=Image(w or 480,h or 240)
end
-- Light is baked into each material, not spread evenly across the room.
-- Quantized falloff preserves the native pixel palette and stepped edges.
local function falloff(x,y,cx,cy,rx,ry)
 local d=((x-cx)/rx)^2+((y-cy)/ry)^2
 return math.max(0,1-d)^2
end
local function barPool(x,y)
 return falloff(x,y,275,194,142,48)
end
local function barCone(x,y)
 if y<47 or y>193 then return 0 end
 local half=19+(y-47)*0.36
 return math.max(0,1-math.abs(x-276)/half)^1.4
end
local function relight(name)
 if name~='room' and name~='bar' and name~='stranger' and name~='foreground' and name~='desk' then return end
 for px in img:pixels() do
  local v=px(); local a=app.pixelColor.rgbaA(v)
  if a>0 then
   local x,y=px.x,px.y
   local ambient,light=0.34,0
   if name=='room' then
    ambient=0.38
    if x>=25 and x<=149 and y>=24 and y<=138 then ambient=0.48 end
    light=0.20*barCone(x,y)+0.13*falloff(x,y,276,47,47,30)
   elseif name=='bar' then
    ambient=0.38; light=0.44*barCone(x,y)
    if y<48 and x>=252 and x<=301 then ambient=0.62; light=0.10 end
    if y>=44 and y<=47 and x>=255 and x<=298 then ambient=1; light=0 end
   elseif name=='stranger' then
    ambient=0.30; light=0.58*barCone(x,y)
    -- Face stays unlit. Only the lamp-side temple and shoulder catch a rim.
    if y<132 and x<248 then light=0; ambient=0.22 end
   elseif name=='foreground' then
    ambient=0.32; light=0.94*barPool(x,y)
   else
    ambient=0.32
    light=0.87*falloff(x,y,173,190,157,68)
    if y<151 then light=light*0.5 end
    if x>=90 and x<=168 and y>=60 and y<=94 then ambient=0.56; light=0.1 end
    if x>=94 and x<=164 and y>=90 and y<=94 then ambient=1; light=0 end
   end
   light=math.floor(light*12+0.5)/12
   local rr=app.pixelColor.rgbaR(v); local gg=app.pixelColor.rgbaG(v); local bb=app.pixelColor.rgbaB(v)
   px(app.pixelColor.rgba(math.min(255,math.floor(rr*(ambient+light*1.12))),
     math.min(255,math.floor(gg*(ambient+light))),
     math.min(255,math.floor(bb*(ambient+light*0.73))),a))
  end
 end
end
local function finish(name,visible)
 relight(name)
 spr:newCel(layer,1,img,Point(0,0)); layer.isVisible=visible~=false
 img:saveAs(root..'/assets/'..name..'.png')
 local source=Sprite(img.width,img.height)
 source.layers[1].name=name
 source:newCel(source.layers[1],1,img,Point(0,0))
 source:saveAs(root..'/art/source/'..name..'.aseprite')
end
local bottle=Image{fromFile=root..'/art/experiments/bottle/bottle.png'}
local function stampBottle(x,y,small)
 if small then local b=Image(bottle); b:resize(16,24); img:drawImage(b,Point(x,y))
 else img:drawImage(bottle,Point(x,y)) end
end
-- Draw each silhouette from its physical base, with no transparent-padding offset.
local function shelfBottle(cx,shelf,kind)
 local shapes={{7,25,3,8},{11,19,4,4},{8,31,3,11},{12,21,5,5},{6,28,2,10},{9,23,4,6}}
 local ramps={
  {'342b1e','6c4d2b','ae8955'}, {'253a2c','486047','879269'},
  {'203337','38555a','798f88'}, {'403020','7a5b32','af9460'},
  {'2b2d20','565d3c','8b9064'}, {'352524','64443a','a17e61'}
 }
 local sh=shapes[kind]; local c=ramps[kind]
 local w,h,neck,n=sh[1],sh[2],sh[3],sh[4]
 local x=math.floor(cx-w/2); local y=shelf-h; local nx=math.floor(cx-neck/2)
 r(nx-1,y,neck+2,2,'161e17'); r(nx,y,neck,1,c[3]); r(nx,y+2,neck,n,c[1])
 poly({{nx,y+n},{nx+neck-1,y+n},{x+w-1,y+n+4},{x+w-1,shelf-1},{x,shelf-1},{x,y+n+4}},c[1])
 r(x+1,y+n+5,w-2,h-n-6,c[2]); r(x+1,y+n+5,1,h-n-8,c[3])
 if kind%2==0 then r(x+2,shelf-8,w-4,4,'a49b71'); r(x+3,shelf-7,math.max(1,w-6),1,c[1])
 else r(x+1,shelf-10,w-2,2,c[3]) end
 -- Explicit opaque contact row. This is the same y for every silhouette.
 r(x,shelf-1,w,1,c[1])
end
local function journal(x,y)
 -- Same leather cover, folded spread, handwriting and pen as the bar notebook.
 poly({{x,y+9},{x+51,y+2},{x+83,y+27},{x+21,y+39}},'252c21')
 poly({{x+1,y+7},{x+51,y},{x+81,y+25},{x+20,y+36}},'9d936e')
 poly({{x+4,y+8},{x+28,y+5},{x+47,y+29},{x+21,y+33}},'c5ba90')
 poly({{x+31,y+5},{x+50,y+3},{x+77,y+23},{x+50,y+29}},'b6aa7d')
 line(x+29,y+6,x+49,y+29,'766c4d')
 for i=1,5 do line(x+9+i*2,y+11+i*3,x+25+i*3,y+9+i*3,'928668'); line(x+39+i*2,y+8+i*3,x+52+i*3,y+7+i*3,'827a5b') end
 line(x+34,y+1,x+68,y+32,'18271f'); line(x+35,y+1,x+69,y+32,'46533a'); r(x+65,y+28,2,3,'c4ae73')
end
local function wood(y,base)
 poly({{36,y},{444,y},{480,240},{0,240}},base)
 line(36,y,444,y,'918064'); line(35,y+1,445,y+1,'66563e')
 for i=1,70 do local xx=(i*79)%480; local yy=y+4+(i*29)%(237-y)
  r(xx,yy,8+(i*11)%47,1,i%3==0 and '6b573c' or '493c2c')
 end
 for i=1,5 do line(50+i*65,y+2,20+i*81,239,'302b22') end
end
begin('room')
r(0,0,480,240,'161f1c'); r(0,0,480,12,'0d1715')
for y=15,159,18 do
 r(0,y,480,1,'27332a'); r(0,y+1,480,1,'101b18')
 for x=(y%4)*18,480,57 do r(x,y+2,1,16,'101b18'); r(x+1,y+3,1,13,'202b24') end
end
-- Wooden pilasters and carved rails.
for _,x in ipairs({9,155,307,470}) do
 r(x,12,8,165,'101915'); r(x+1,13,2,165,'394332'); r(x+6,13,1,165,'202c23')
 r(x-2,12,12,5,'46503a'); r(x-1,17,10,2,'273024')
end
r(0,142,480,5,'414532'); r(0,147,480,2,'0c1613'); r(0,149,480,41,'1c2820')
for x=17,479,24 do r(x,153,1,34,'303b2b'); r(x+2,155,17,28,'18231c') end
-- Recessed window: wet blue-green town, individual reflected windows.
r(25,24,124,112,'0a1513'); r(28,26,118,108,'556249'); r(31,29,112,103,'142520')
r(35,33,104,95,'344d46')
for i=0,12 do
 local x=35+i*8; local y=74+(i*17)%34
 r(x,y,9,54,'1b302b'); poly({{x-3,y},{x+4,y-7},{x+12,y}},'172b26')
 r(x+2,y+6,2,3,i%3==0 and 'b3ab74' or '536654'); r(x+2,y+15,2,3,'425b4d')
end
for i=1,35 do local x=36+(i*31)%100; local y=35+(i*17)%86
 line(x,y,x-2,y+7,'496158') end
r(84,30,4,99,'101e19'); r(88,32,1,97,'748169'); r(32,80,110,4,'12231c'); r(33,80,109,1,'5d6d54')
r(23,131,128,4,'737259'); r(20,135,134,3,'323d2c'); r(25,138,125,3,'0d1815')
-- Heavy curtain, brass rings and folded edges.
r(20,23,133,2,'827659')
for x=24,46,5 do r(x,25,3,102,'263930'); r(x,25,1,103,'42533e') end
poly({{26,25},{48,25},{43,47},{33,85},{26,93}},'354735')
for i=1,5 do line(27+i*3,28,26+i,82,'536047') end
-- Wall print.
r(181,39,58,48,'101a15'); r(183,41,54,44,'766a4d'); r(185,43,50,40,'323e2e')
r(188,46,44,34,'19291f'); ellipse(202,50,15,15,'5a6344')
poly({{189,76},{199,64},{206,74},{214,61},{231,76}},'3b5037'); r(196,79,28,1,'8e835e')
finish('room')
begin('bar')
-- Mirrored backbar and shelves, with bottle silhouettes behind the glass.
r(325,26,131,111,'101b16'); r(328,29,125,105,'596049'); r(331,32,119,99,'263b2e')
for i=1,12 do line(334+i*9,33,327+i*9,130,'2d4233') end
for _,y in ipairs({66,116}) do
 for i=0,5 do shelfBottle(337+i*21,y,((i+(y==116 and 3 or 0))%6)+1) end
 r(323,y,136,3,'847351'); r(323,y+3,136,4,'4e4b34'); r(325,y+7,131,2,'0d1913')
 for _,x in ipairs({337,442}) do poly({{x,y+8},{x+8,y+8},{x,y+17}},'5c5a3e') end
end
r(317,145,153,5,'8b7652'); r(321,150,145,29,'263224')
for x=326,460,35 do r(x,154,28,22,'131f18'); r(x+2,155,24,1,'4c5038'); r(x+14,161,2,2,'8d7f52') end
-- Leather booth with worn seams and button tufting.
r(164,136,141,51,'0c1713'); r(168,138,133,48,'354131'); r(171,141,127,2,'71704d')
for x=176,294,19 do r(x,146,1,36,'1d2b21'); r(x+1,146,1,35,'45503a'); r(x+8,154,2,2,'101d17') end
-- Suspended green enamel light.
r(275,0,2,30,'827554'); r(271,26,10,4,'3a4830')
poly({{266,30},{286,30},{301,45},{252,45}},'111e17')
poly({{267,30},{285,30},{296,43},{257,43}},'516244'); r(266,32,13,1,'839065')
r(255,44,43,2,'a4aa70'); r(258,46,37,2,'e2d494')
finish('bar')
local function strangerPose(pose)
-- Slumped coat and an almost-lost face. The pendant is above his right shoulder.
poly({{191,187},{195,163},{204,146},{220,138},{223,126},{218,115},{214,98},{215,82},{222,71},{238,67},{251,73},{257,87},{254,108},{247,123},{248,137},{269,147},{279,162},{286,187}},'101a15')
poly({{222,74},{236,69},{249,74},{253,82},{241,75},{227,77},{218,90}},'1b261e')
-- Short broken highlights on the lamp-facing edge, never a full face outline.
line(250,79,253,86,'66664b'); line(254,91,253,99,'51543d')
poly({{251,104},{254,102},{251,114},{246,122},{242,123},{247,114}},'323c2b')
r(247,106,3,1,'55583e')
poly({{219,138},{229,145},{234,167},{224,158},{213,148}},'2c3627')
poly({{248,137},{258,144},{245,158},{236,176},{240,152}},'485039')
line(250,142,244,150,'666748')
poly({{201,153},{210,156},{216,180},{208,186},{194,183}},'19261e')

 local handPositions={{278,176},{267,151},{255,130},{248,118},{248,118},{263,144}}
 local hand=handPositions[math.min(pose,5)+1]
 if pose>=6 then hand=handPositions[1] end
 local hx,hy=hand[1],hand[2]
 -- Shoulder stays planted; the elbow pivots and the wrist follows the cigarette.
 if pose==0 or pose>=6 then
  poly({{263,151},{273,158},{280,174},{267,181},{250,178},{255,168}},'29372a')
  line(269,161,274,172,'4a5239')
 else
  poly({{264,150},{273,158},{281,178},{269,182},{hx-9,hy+10},{hx-7,hy+4},{hx+2,hy+9},{273,167}},'29372a')
  line(hx-6,hy+11,270,176,'444e36'); line(270,176,277,176,'50583d')
 end
 -- A small curled hand, two fingers together; no long, stretched fingers.
 poly({{hx-8,hy+2},{hx-5,hy-3},{hx+2,hy-4},{hx+7,hy-1},{hx+7,hy+4},{hx+1,hy+6},{hx-6,hy+5}},'464e36')
 poly({{hx-5,hy-2},{hx+1,hy-3},{hx+5,hy-1},{hx+2,hy+1},{hx-5,hy+1}},'727553')
 line(hx+1,hy+2,hx+6,hy+2,'92916a'); line(hx+2,hy+4,hx+5,hy+4,'5f6748')
 line(hx-9,hy+3,hx-6,hy+5,'657050')
 -- Cigarette points away from the mouth. Inhalation warms only its tiny tip.
 line(hx+3,hy-3,hx+17,hy-5,'c8bd98')
 r(hx+17,hy-5,2,2,pose==4 and 'ffd391' or 'bb7341')
 if pose==4 then r(hx+19,hy-5,1,1,'e7a56b') end
 r(232,176,2,2,'343f2b')
 -- Exhaled smoke separates, rises, and thins over the final four poses.
 if pose==5 then
  line(253,116,260,114,'66745c'); line(260,114,264,115,'4d5f49')
 elseif pose==6 then
  line(258,115,267,112,'66745c'); line(267,112,275,114,'566a51')
  line(275,114,280,109,'425840'); r(270,109,3,1,'4a6048')
 elseif pose==7 then
  line(266,109,273,107,'4f6249'); line(276,109,282,106,'596c52')
  line(282,106,281,99,'4a6147'); line(281,99,286,95,'3c523b')
  r(270,103,3,1,'41593f'); r(288,102,2,1,'41593f')
 elseif pose==8 then
  line(277,100,285,97,'344d37'); line(285,94,284,88,'3e5740')
  line(284,88,290,85,'304c36'); r(293,93,2,1,'304c36')
 end
end
begin('stranger')
strangerPose(0)
finish('stranger')
local puff=Sprite(480,240)
puff.layers[1].name='Body, hand, cigarette and exhalation'
local sheet=Image(480*9,240)
local durations={19,0.3,0.3,0.4,0.8,0.4,0.5,0.8,1.0}
for f=0,8 do
 img=Image(480,240); strangerPose(f); relight('stranger')
 if f>0 then puff:newEmptyFrame() end
 puff:newCel(puff.layers[1],f+1,img,Point(0,0))
 puff.frames[f+1].duration=durations[f+1]
 sheet:drawImage(img,Point(f*480,0))
end
puff:newEmptyFrame()
img=Image(480,240); strangerPose(0); relight('stranger')
puff:newCel(puff.layers[1],10,img,Point(0,0)); puff.frames[10].duration=3.5
local tag=puff:newTag(1,10); tag.name='Occasional puff'
puff:saveAs(root..'/art/source/stranger-puff.aseprite')
begin('stranger-puff-sheet',480*9,240); img=sheet; finish('stranger-puff-sheet',false)
begin('foreground')
wood(184,'584830')
-- Bottle shadow and the approved bottle itself.
ellipse(88,196,73,10,'302e22'); stampBottle(100,154,false)
-- Cut glass tumbler with amber liquid and crisp facets.
ellipse(162,197,45,6,'302c21'); r(173,169,21,28,'3c4a36')
r(175,174,17,20,'5c6448'); r(175,183,17,10,'8a7345'); r(177,185,13,7,'ac8950')
r(174,170,2,25,'9fa78b'); r(178,173,1,18,'77876b'); r(189,173,2,22,'b3b798')
r(174,168,19,2,'d0ceb0'); r(177,170,13,1,'6f7d60'); r(174,195,19,2,'b8b593')
-- Heavy brass ashtray, a matchbox, paper notebook and fountain pen.
ellipse(327,200,56,15,'262c21'); ellipse(326,197,54,15,'98916a'); ellipse(331,199,43,10,'5b6549'); ellipse(335,201,34,6,'26392b')
r(348,205,6,1,'70775a')
poly({{391,192},{416,190},{423,201},{397,205}},'292e21'); poly({{391,190},{415,188},{421,197},{398,201}},'a58b5a'); r(400,192,12,2,'504c34')
journal(44,203)
finish('foreground')
begin('desk',480,240)
-- Reading-room wall and framed botanical study.
r(0,0,480,240,'19251f')
for x=0,479,16 do r(x,0,1,155,'28382b'); r(x+2,0,1,151,'111e18') end
r(0,140,480,5,'536044'); r(0,146,480,10,'122018')
r(327,24,100,105,'0b1713'); r(330,27,94,99,'766e4f'); r(333,30,88,93,'253526'); r(337,34,80,85,'a2a181')
line(376,101,375,48,'596b48'); line(375,81,357,65,'596b48'); line(376,91,395,72,'596b48')
for i=0,4 do ellipse(363-i*2,55+i*8,11,5,'6e7d56'); ellipse(378+i*2,49+i*9,12,5,'7e8862') end
r(355,109,44,1,'7d8261'); r(365,113,23,1,'7d8261')
-- Short bookshelf and stitched books.
r(29,47,61,78,'101c16')
for i=0,5 do local x=34+i*8; r(x,56+i%3*4,6,61-i%3*4,i%2==0 and '566046' or '776e49'); r(x+1,62+i%3*4,4,1,'aaa077'); r(x+1,108,4,1,'aaa077') end
r(24,121,70,5,'877858'); r(27,126,65,3,'36432d')
wood(155,'625237')
-- Enamel desk lamp, articulated brass stem and pool of warm light.
ellipse(78,189,111,15,'756441'); ellipse(104,177,50,9,'253726'); ellipse(108,176,42,5,'68744b')
r(126,90,4,87,'8b8d5d'); r(126,91,1,84,'c1b27a'); r(124,109,8,7,'495d3a')
poly({{107,62},{148,62},{168,91},{90,91}},'172c20'); poly({{109,63},{146,63},{162,88},{97,88}},'687c50')
poly({{110,65},{122,65},{110,86},{100,86}},'869360'); r(94,90,70,3,'c7c488'); r(100,93,58,2,'ecdc9c')
-- Stack of manuscript pages under the carriage.
poly({{211,105},{291,105},{301,169},{200,169}},'68684b'); poly({{214,103},{288,103},{296,164},{203,164}},'dad0a7')
r(218,110,64,1,'b5aa83'); r(221,116,57,2,'797e5c')
for i=0,6 do r(218-i,124+i*5,55-i%3*9,1,'949375') end
-- Typewriter carriage, spool covers, typebars, metal body, round keys.
r(183,160,134,7,'16261b'); r(186,159,128,2,'a1a382'); r(191,162,116,3,'596c4a')
r(180,158,5,12,'9c9d7a'); r(177,160,4,8,'293c28'); r(317,158,5,12,'9c9d7a')
poly({{196,169},{306,169},{324,212},{180,212}},'10231a'); poly({{199,171},{303,171},{317,207},{188,207}},'3f563b')
line(199,171,303,171,'8d9973'); line(188,208,317,208,'71815b')
ellipse(203,174,25,9,'14291d'); ellipse(274,174,25,9,'14291d'); ellipse(210,176,11,4,'5a6e4a'); ellipse(281,176,11,4,'5a6e4a')
for j=0,2 do for i=0,10 do local x=198+i*10-j*2; local y=184+j*7
 ellipse(x,y,7,6,'162a1e'); ellipse(x,y,6,4,'b1b28d'); r(x+2,y+1,2,1,'526443') end end
r(220,205,59,3,'c5c39b'); r(218,209,63,2,'233a26'); r(240,174,23,3,'b1aa73')
-- Coffee cup and reference notes beside the same journal brought upstairs.
ellipse(367,181,38,10,'353c27'); ellipse(373,160,25,7,'a5ae87'); r(373,163,25,18,'7d916b'); ellipse(373,177,25,6,'7d916b'); ellipse(376,161,19,4,'28392a'); r(375,166,2,11,'bbc2a0')
ellipse(396,166,10,11,'a0ae84'); ellipse(398,168,6,7,'394a31')
poly({{336,198},{381,201},{369,227},{323,221}},'beb58c')
for i=1,4 do line(337-i*2,202+i*4,370-i*2,204+i*4,'827d5c') end
line(373,202,390,224,'243a29'); line(374,202,391,224,'727d51')
journal(76,192)
finish('desk',false)
-- Four frames packed horizontally. Rain is confined to the window opening.
begin('rain-sheet',1920,240)
for f=0,3 do for i=0,37 do
 local x=36+(i*29)%102; local y=34+(i*17+f*6)%91
 line(f*480+x,y,f*480+x-1,math.min(128,y+4),'78958a')
end end
finish('rain-sheet',false)
begin('smoke-sheet',1920,240)
for f=0,3 do for i=0,16 do
 local y=169-i*3; local x=296+math.floor(math.sin(i*.57+f*.8)*4)
 r(f*480+x,y,2,2,i%3==0 and '71806b' or '4b5f4e')
end end
finish('smoke-sheet',false)
-- A spatial dimming mask shared by the bulb and its cast light.
begin('bar-flicker')
for px in img:pixels() do
 local x,y=px.x,px.y
 local amount=y>=184 and barPool(x,y)*0.78 or barCone(x,y)*0.56
 if x>=255 and x<=298 and y>=44 and y<=47 then amount=0.92 end
 if amount>0 then px(app.pixelColor.rgba(5,9,7,math.floor(amount*255))) end
end
finish('bar-flicker',false)
-- Remove constructor's empty layer, save the editable scene collection.
spr:deleteLayer(spr.layers[1]); spr:saveAs(root..'/art/source/scenes.aseprite')
-- Small decorative assets, each also saved in editable Aseprite format.
local function small(name,w,h,draw)
 local s=Sprite(w,h); img=Image(w,h); draw()
 s:newCel(s.layers[1],1,img,Point(0,0)); s.layers[1].name=name
 img:saveAs(root..'/assets/'..name..'.png'); s:saveAs(root..'/art/source/'..name..'.aseprite')
end
local function parcel(open)
 r(0,0,480,240,'101710')
 for y=0,239 do
  local k=falloff(240,y,240,110,300,180)
  r(0,y,480,1,k>0.5 and '30291c' or k>0.2 and '231f16' or '181c13')
 end
 for i=1,85 do local x=(i*67)%480; local y=(i*31)%240; r(x,y,12+i%29,1,'343020') end
 for y=24,239,47 do r(0,y,480,2,'131a12'); r(0,y+2,480,1,'3b3423') end
 ellipse(113,157,265,27,'10150f')
 if not open then
  poly({{148,63},{303,51},{345,136},{184,158}},'8e7850')
  poly({{184,158},{345,136},{345,151},{184,176}},'473c29')
  poly({{148,63},{184,158},{184,176},{148,78}},'655537')
  line(150,64,303,53,'b2a177'); line(186,158,344,137,'ad9566')
  poly({{204,59},{211,58},{248,149},{241,151}},'c0b48b')
  poly({{161,96},{322,81},{325,87},{164,102}},'afa27a')
  poly({{253,67},{296,64},{309,90},{267,95}},'c4bb94')
  for i=0,3 do line(263+i*2,73+i*4,291+i*2,71+i*4,'7b7355') end
  ellipse(210,92,13,11,'704832'); ellipse(212,92,9,8,'9c6c43')
 else
  -- Folded flaps surround the dark interior; the diary is a discrete object.
  poly({{146,81},{309,68},{349,153},{177,174}},'745f3f')
  poly({{154,84},{305,74},{338,148},{182,166}},'28271b')
  poly({{146,81},{123,47},{282,32},{309,68}},'8c7750')
  line(125,47,281,34,'b4a073')
  poly({{146,81},{123,92},{151,183},{177,174}},'635035')
  poly({{309,68},{343,63},{378,142},{349,153}},'9b8356')
  poly({{177,174},{349,153},{369,183},{194,207}},'7a6441')
  line(194,207,369,183,'a78d61')
  -- Leather journal, ochre page block, worn corners and spine bands.
  poly({{184,94},{249,87},{279,149},{211,159}},'a79b72')
  poly({{180,87},{245,81},{274,143},{208,153}},'4e4930')
  poly({{184,89},{241,84},{268,139},{209,148}},'625a39')
  line(187,88,213,149,'aaa078'); line(190,91,214,144,'343825')
  r(210,109,30,2,'9b9061'); r(217,115,19,1,'9b9061')
  line(210,153,277,144,'cec19a'); line(213,156,278,147,'6f694a')
  -- Folded invitation tucked under the book, with its wax seal.
  poly({{260,95},{298,91},{318,133},{281,139}},'c2b68b')
  for i=0,4 do line(270+i*2,101+i*5,292+i*2,99+i*5,'817555') end
  ellipse(294,123,11,9,'9c6c43')
 end
end
small('parcel-closed',480,240,function() parcel(false) end)
small('parcel-open',480,240,function() parcel(true) end)
small('paper',64,64,function()
 r(0,0,64,64,'c7c0a0')
 for i=1,140 do r((i*37)%64,(i*23+math.floor(i/7))%64,i%3+1,1,i%2==0 and 'bfb897' or 'cfc8a8') end
end)
small('grain',64,64,function()
 r(0,0,64,64,'18221c')
 for i=1,140 do r((i*29)%64,(i*43+math.floor(i/9))%64,i%3+1,1,i%2==0 and '1d271f' or '141e18') end
end)
small('seal',48,48,function()
 ellipse(3,3,42,42,'47342a'); ellipse(3,1,40,42,'915c3a'); ellipse(5,3,35,37,'b07b4d'); ellipse(8,6,30,31,'714c32'); ellipse(10,8,26,27,'855a38')
 r(21,13,6,6,'c09159'); r(19,19,10,13,'c09159'); r(20,23,8,5,'744a30')
 line(10,37,14,40,'d0a16b'); line(7,16,7,26,'d0a16b')
end)
small('evidence-fire',24,24,function()
 poly({{4,20},{3,13},{9,8},{10,2},{16,9},{18,5},{21,15},{18,21}},'775638')
 poly({{8,20},{7,14},{12,9},{13,15},{17,12},{17,20}},'b3844e'); r(10,18,5,3,'e0bf79')
end)
small('evidence-key',24,24,function()
 ellipse(3,3,11,11,'76673f'); ellipse(5,5,7,7,'c5b276'); ellipse(7,7,3,3,'777a59')
 line(12,12,20,20,'76673f'); line(13,12,21,20,'b29c64'); r(17,18,2,4,'76673f'); r(20,20,2,3,'76673f')
end)
small('evidence-river',24,24,function()
 for i=0,2 do line(2,8+i*5,7,6+i*5,'65795f'); line(7,6+i*5,14,9+i*5,'65795f'); line(14,9+i*5,22,6+i*5,'65795f') end
end)
print('SCENES_OK: scene layers, three animation sheets, paper, grain, seal and three evidence icons exported')
