const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{const FPS=60;const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+path.resolve(__dirname,'platform.html'));const D=await pg.evaluate('D');
const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+FPS,'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+FPS,process.argv[2]||'out.mp4'],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<D*FPS;f++){await pg.evaluate(t=>render(t),f/FPS);const buf=await pg.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();
