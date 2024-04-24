function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max === min){
        h = 0; // achromatic
    } else {
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}

export function getHueData(imageDataURL) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, image.width, image.height);
            const data = imageData.data;

            let hueValues = []
            for (let i = 0; i < data.length; i += 4) {

                if (!(data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 0)) {
                    let hsv = rgbToHsv(data[i], data[i + 1], data[i + 2]);
                    hueValues.push(hsv[0]*360);
                }
            }
            resolve(hueValues);
        }
        image.onerror = reject;
        image.crossOrigin = "anonymous";
        image.src = imageDataURL;
    })
}