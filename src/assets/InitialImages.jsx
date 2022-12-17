const images = [];

for (let i = 1; i <= 16; i++) {
	images.push(require(`../Images/viking/image${i}.png`));
}

const initialImages = images.map((image, i) => ({
	x: Math.random() * 1000,
	y: Math.random() * 700,
	id: `image${i + 1}`,
	imageUrl: image,
}));

export { initialImages };
