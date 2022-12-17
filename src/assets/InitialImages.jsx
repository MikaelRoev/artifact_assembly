const images = [];

for (let i = 1; i <= 16; i++) {
	images.push(require(`../Images/viking/image${i}.png`));
}

const getRandomCoordinates = () => ({
	x: Math.random() * 1000,
	y: Math.random() * 700,
});

const initialImages = images.map((image, i) => ({
	...getRandomCoordinates(),
	id: `image${i + 1}`,
	imageUrl: image,
}));

export { initialImages };
