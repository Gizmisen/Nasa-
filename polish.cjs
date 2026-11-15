const fs=require('fs');const p='src/surface.js';let s=fs.readFileSync(p,'utf8');
s=s.replace('s.x+Math.sin(i*2.1)*28,ty=s.y+i*23','s.x+(i%2)*48-24,ty=s.y+Math.floor(i/2)*48');
s=s.replace("ctx.fillText(ext.crew[i].name,0,-34);","ctx.fillText(String(i+1),0,13);");
s=s.replace("siteTitle(i),0,78)","siteTitle(i),0,-135)");
s=s.replace("s.y+=dy/distance*step;s.walked+=step;","s.y+=dy/distance*step;for(const [ox,oy] of surfaceConfig(m.target).sites){const rx=s.x-ox,ry=s.y-oy,r=Math.hypot(rx,ry);if(r<62&&r>0){s.x=ox+rx/r*62;s.y=oy+ry/r*62;}}s.walked+=step;");
fs.writeFileSync(p,s);