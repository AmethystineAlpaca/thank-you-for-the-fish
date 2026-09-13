// Render representative palettes without opening or changing a real collection.
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

function stagePanel(b, x, y, w, h) {
    b.save();
    b.beginPath();
    b.roundRect(x, y, w, h, 12);
    b.clip();

    b.fillStyle = '#fffcf7';
    b.fillRect(x, y, w, h);

    const light = b.createRadialGradient(
        x + w * .46,
        y + h * .18,
        0,
        x + w * .46,
        y + h * .18,
        w * .8
    );

    light.addColorStop(0, '#53667b');
    light.addColorStop(.48, '#394b60');
    light.addColorStop(1, '#29384b');

    b.fillStyle = light;
    b.fillRect(x, y, w, h - 34);

    b.restore();
}

app.setPath(
    'userData',
    fs.mkdtempSync(
        path.join(os.tmpdir(), 'little-tide-appearances-')
    )
);

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: true
        }
    });

    try {
        await win.loadFile(
            path.join(__dirname, '../src/index.html')
        );

        // -------------------------------------------------------
        // Static appearance sheets
        // -------------------------------------------------------

        const sheets = await win.webContents.executeJavaScript(`(async()=>{
      await Art.ready;

      ${stagePanel.toString()}

      const sheets=[];

      for(const dark of [false,true]){
        const board=Object.assign(
          document.createElement('canvas'),
          {
            width:1280,
            height:1460
          }
        );

        const b=board.getContext('2d');

        b.fillStyle=dark ? '#29384b' : '#f7f4ee';
        b.fillRect(0,0,board.width,board.height);

        b.fillStyle=dark ? '#f3eadd' : '#455262';
        b.font='24px sans-serif';
        b.fillText(
          '小憩海湾 · 鱼的特别配色',
          28,
          42
        );

        Sea.traits.forEach((trait,col)=>{
          b.fillText(
            trait.name,
            30+col*320,
            88
          );
        });

        [0,1,10,20,49,93,98].forEach((id,row)=>{
          Sea.traits.forEach((trait,col)=>{
            const x=col*320+14;
            const y=108+row*190;

            stagePanel(
              b,
              x,
              y,
              292,
              180
            );

            const sample=Object.assign(
              document.createElement('canvas'),
              {
                width:384,
                height:240
              }
            );

            Art.fish(
              sample,
              Sea.fish[id],
              trait.id,
              2.8
            );

            b.save();
            b.beginPath();
            b.rect(
              x,
              y,
              292,
              146
            );
            b.clip();

            b.drawImage(
              sample,
              x,
              y-12,
              292,
              182.5
            );

            b.restore();

            b.fillStyle='#697582';
            b.font='15px sans-serif';

            b.fillText(
              Sea.fish[id].name,
              x+14,
              y+167
            );
          });
        });

        sheets.push(
          board.toDataURL()
        );
      }

      return sheets;
    })()`);

        fs.mkdirSync(
            path.join(__dirname, '../artifacts'),
            {
                recursive: true
            }
        );

        sheets.forEach((data, i) => {
            fs.writeFileSync(
                path.join(
                    __dirname,
                    '../artifacts/appearance-' +
                    (i ? 'dark' : 'light') +
                    '.png'
                ),
                Buffer.from(
                    data.split(',')[1],
                    'base64'
                )
            );
        });

        // -------------------------------------------------------
        // Animated comparison
        // 3 representative fish × every real Sea.traits appearance
        // -------------------------------------------------------

        if (process.argv.includes('--motion')) {

            const frames = await win.webContents.executeJavaScript(`(async()=>{

        await Art.ready;

        ${stagePanel.toString()}

        /*
         * Three representative species.
         *
         * 1   = early/common species
         * 49  = middle species
         * 93  = late species
         */
        const fishIds=[12,99,93];

        /*
         * IMPORTANT:
         *
         * Do NOT hard-code normal / variant / glow / prism here.
         *
         * Sea.traits is the real appearance definition used by
         * the application, so this preview automatically uses
         * the exact same four appearance IDs and names.
         */
        const traits=Sea.traits;

        const COL_W=300;
        const ROW_H=230;

        const board=Object.assign(
          document.createElement('canvas'),
          {
            width:1200,
            height:820
          }
        );

        const b=board.getContext('2d');

        const samples=Array.from(
          {
            length:fishIds.length*traits.length
          },
          ()=>Object.assign(
            document.createElement('canvas'),
            {
              width:384,
              height:240
            }
          )
        );

        const frames=[];

        /*
         * 72 frames / 15 fps = 4.8 seconds.
         */
        for(let frame=0;frame<72;frame++){

          // Main background
          b.fillStyle='#f7f4ee';
          b.fillRect(
            0,
            0,
            board.width,
            board.height
          );

          // Title
          b.fillStyle='#455262';
          b.font='22px sans-serif';

          b.fillText(
            '小憩海湾 · 鱼类外观展示',
            22,
            36
          );

          // Column headers — directly use the real trait names.
          traits.forEach((trait,col)=>{

            b.fillStyle='#455262';
            b.font='17px sans-serif';

            b.fillText(
              trait.name,
              col*COL_W+22,
              78
            );
          });

          // Fish rows
          fishIds.forEach((id,row)=>{

            traits.forEach((trait,col)=>{

              const x=col*COL_W+12;
              const y=98+row*ROW_H;

              const c=
                samples[
                  row*traits.length+col
                ];

              stagePanel(
                b,
                x,
                y,
                276,
                216
              );

              /*
               * This is the real application renderer.
               *
               * frame / 15 supplies continuously changing time,
               * so glow / prism / motion effects animate exactly
               * through the same Art.fish implementation.
               */
              Art.fish(
                c,
                Sea.fish[id],
                trait.id,
                frame/15
              );

              b.save();

              b.beginPath();
              b.rect(
                x,
                y,
                276,
                182
              );
              b.clip();

              b.drawImage(
                c,
                x-10,
                y+4,
                296,
                185
              );

              b.restore();

              // Species name
              b.fillStyle='#697582';
              b.font='15px sans-serif';

              b.fillText(
                Sea.fish[id].name,
                x+14,
                y+204
              );
            });
          });

          frames.push(
            board.toDataURL()
          );
        }

        return frames;

      })()`);

            const dir = path.join(
                __dirname,
                '../artifacts/appearance-frames'
            );

            // Clear old frames first so old GIF frames
            // can never accidentally mix with this render.
            fs.rmSync(
                dir,
                {
                    recursive: true,
                    force: true
                }
            );

            fs.mkdirSync(
                dir,
                {
                    recursive: true
                }
            );

            frames.forEach((data, i) => {

                fs.writeFileSync(
                    path.join(
                        dir,
                        String(i).padStart(3, '0') + '.png'
                    ),
                    Buffer.from(
                        data.split(',')[1],
                        'base64'
                    )
                );

            });

            console.log(
                'Rendered 72 animation frames at 15 fps.'
            );

            console.log(
                'Rendered 3 species × ' +
                4 +
                ' appearances using the real Sea.traits definitions.'
            );

            console.log(
                'Frames: artifacts/appearance-frames/'
            );
        }

        console.log(
            'Rendered 7 species × 4 appearances on light and dark backgrounds.'
        );

        app.exit(0);

    } catch (error) {

        console.error(error);
        app.exit(1);

    }
});