const images = [];

for (let i = 1; i <= 16; i++) {
	images.push(require(`../Images/viking/image${i}.png`));
}

const [
	viking1,
	viking2,
	viking3,
	viking4,
	viking5,
	viking6,
	viking7,
	viking8,
	viking9,
	viking10,
	viking11,
	viking12,
	viking13,
	viking14,
	viking15,
	viking16,
] = images;

const getRandomCoordinates = () => {
	return {
		x: Math.random() * 600,
		y: Math.random() * 700,
	};
};

export const initialImages = [
	{
		...getRandomCoordinates(),
		id: "image1",
		imageUrl: viking1,
	},
	{
		...getRandomCoordinates(),
		id: "image2",
		imageUrl: viking2,
	},
	{
		...getRandomCoordinates(),
		id: "image3",
		imageUrl: viking3,
	},
	{
		...getRandomCoordinates(),
		id: "image4",
		imageUrl: viking4,
	},
	{
		...getRandomCoordinates(),
		id: "image5",
		imageUrl: viking5,
	},
	{
		...getRandomCoordinates(),
		id: "image6",
		imageUrl: viking6,
	},
	{
		...getRandomCoordinates(),
		id: "image7",
		imageUrl: viking7,
	},
	{
		...getRandomCoordinates(),
		id: "image8",
		imageUrl: viking8,
	},
	{
		...getRandomCoordinates(),
		id: "image9",
		imageUrl: viking9,
	},
	{
		...getRandomCoordinates(),
		id: "image10",
		imageUrl: viking10,
	},
	{
		...getRandomCoordinates(),
		id: "image11",
		imageUrl: viking11,
	},
	{
		...getRandomCoordinates(),
		id: "image12",
		imageUrl: viking12,
	},
	{
		...getRandomCoordinates(),
		id: "image13",
		imageUrl: viking13,
	},
	{
		...getRandomCoordinates(),
		id: "image14",
		imageUrl: viking14,
	},
	{
		...getRandomCoordinates(),
		id: "image15",
		imageUrl: viking15,
	},
	{
		...getRandomCoordinates(),
		id: "image16",
		imageUrl: viking16,
	},
];
