// usage: node render.js page.html out.mp4 [fps] [audio]
//        node render.js page.html --frames t1,t2,... outdir
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{const [html,out,a3,a4]=process.argv.slice(2);const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+path.resolve(html));await pg.evaluate('window.ready||1');await pg.waitForTimeout(300);
if(out==='--frames'){for(const t of a3.split(',')){await pg.evaluate(t=>render(t),+t);await pg.screenshot({path:`${a4}/f_${t}.jpg`,type:'jpeg',quality:70});}await b.close();return}
const FPS=+(a3||60),D=await pg.evaluate('D');
const args=['-y','-f','image2pipe','-framerate',''+FPS,'-i','-'];if(a4)args.push('-i',a4,'-c:a','aac','-b:a','192k','-shortest');
args.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+FPS,'-movflags','+faststart',out);
const ff=spawn('ffmpeg',args,{stdio:['pipe','ignore','inherit']});
for(let f=0;f<Math.round(D*FPS);f++){await pg.evaluate(t=>render(t),f/FPS);const buf=await pg.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();
