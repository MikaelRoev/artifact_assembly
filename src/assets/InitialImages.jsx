const images = [];

for (let i = 1; i <= 16; i++) {
	images.push(require(`../Images/vikingwebp/image${i}.webp`));
}

function getRandomCoordinates(padding = 80) {
	const { innerWidth, innerHeight } = window;
	return {
		x: Math.random() * (innerWidth - padding * 2) + padding,
		y: Math.random() * (innerHeight - padding * 2) + padding,
	};
}

const initialImages = images.map((image, i) => ({
	...getRandomCoordinates(),
	id: `image${i + 1}`,
	imageUrl: image,
}));

export { initialImages };
