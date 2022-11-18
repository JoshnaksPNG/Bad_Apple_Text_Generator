// Libraries
const ffmpeg = require("ffmpeg");
const fs = require("fs");
const Jimp = require("jimp");
const math = require("math.js");

// Frame Intervals
const EVERY_N_FRAME_SET = 1;
const vid_x = 1444;
const vid_y = 1080;
const resize_factor = 1 / 16;
const vertical_sample_offset = 2;
const invert_colors = true;
const COLOR_RANGE = 255;

let text_array = [];

const ASCII_CHARACTER_MAP = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`'. ";
//const ASCII_CHARACTER_MAP = "$@B%8&WM#oahkbdpqwmZO0QLCJUYXzcvunxrjft()1{}[]-_+~i!lI;,^`'. ";
// Extract Video To JPG frames
try {
    let process = new ffmpeg("video_input/input.mp4");
    process.then( (video) =>
    {
        video.fnExtractFrameToJPG("c://git/Bad_Apple_Text_Generator/frame_output", 
        {
            every_n_frames : EVERY_N_FRAME_SET
        }, text_output)
    }, function (err) 
    {
        console.log('Error: ' + err);
    });
} 
catch (e) 
{
    console.log(e.code);
    console.log(e.msg);
}

async function text_output(error, files)
{
    // Get Number of Frames
    let total_frames = files.length;

    // Resize Frames
    const PIXEL_WIDTH = math.round(vid_x * resize_factor);
    const PIXEL_HEIGHT = math.round(vid_y * resize_factor);

    for(let i = 1; !(i > total_frames); ++i)
    {
        const in_path = "c://git/Bad_Apple_Text_Generator/frame_output/input_" + i + ".jpg";
        const img = await Jimp.read(in_path);

        img.resize(PIXEL_WIDTH, PIXEL_HEIGHT);

        let output = "";


        for(let j = 0; j < math.round(PIXEL_HEIGHT / vertical_sample_offset); ++j)
        {
            for(let k = 0; k < PIXEL_WIDTH; ++k)
            {
                let sample = Jimp.intToRGBA(img.getPixelColor(k, j * vertical_sample_offset)).r;
                output += grayToAscii(sample, invert_colors);
            }
            output += "\n"
        }

        //console.log(output);
        text_array.push(output);
    }

    const outputJSON = JSON.stringify({array: text_array}, null, 4);
    fs.writeFileSync("output.json", outputJSON);
}

function grayToAscii (sample_value, invert)
{
    let rounded_sample = math.round(sample_value / ((COLOR_RANGE/ ASCII_CHARACTER_MAP.length) + 1));

    let index;
    if(invert)
    {
        index = -1 * ( rounded_sample + 1 )
    } else
    {
        index = rounded_sample;
    }

    return ASCII_CHARACTER_MAP.at(index);
}