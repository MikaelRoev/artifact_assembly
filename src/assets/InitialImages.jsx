const images = [];

// for (let i = 1; i <= 16; i++) {
// 	images.push(require(`./images/vikingwebp/image${i}.webp`));
// }

function getRandomCoordinates(padding = 280) {
	const { innerWidth, innerHeight } = window;
	return {
		x: Math.random() * (innerWidth - padding * 2) + padding,
		y: Math.random() * (innerHeight - padding * 2) + padding,
	};
}

images.push(require("./images/SegmentedImages/texrec013_segmented.png"));
images.push(require("./images/SegmentedImages/texrec004_segmented.png"));


const initialImages = images.map((image, i) => ({
	...getRandomCoordinates(),
	id: `image${i + 1}`,
	imageUrl: image,
}));

export { initialImages };
