const { DxfWriter, point3d, Units } = require("@tarikjabiri/dxf");
const fs = require("fs");
var Simplex = require("perlin-simplex");
var simplex = new Simplex();

const NUM_SHADES = 32;
const X_SHADE_WIDTH_MM = 80;
const Y_SHADE_WIDTH_MM = 0;
const UNIT_TO_MM = 1;

const dxf = new DxfWriter();
dxf.setUnits(Units.Millimeters);

const point3dmm = (x, y) => point3d(x * UNIT_TO_MM, y * UNIT_TO_MM);

// left side dimentions, see diagram
const a = 4;
const b = 4;
const c = 6;
const d = 140;

const h = 2 * a + 2 * c + d; // 160
const l = 70;
const n = 5.6;

// length of the shade
const Z_NOISE_OFFSET = 0.006;

// how similar shade values are to each other
const NOISE_RADIUS = 0.45;

const getCircleCoordinates = (i) => {
	const angleRad = (i / NUM_SHADES) * 2 * Math.PI;
	const x = NOISE_RADIUS * Math.cos(angleRad);
	const y = NOISE_RADIUS * Math.sin(angleRad);
	return { x, y };
};

// returns number btwn 0 and 1
const reduce = (x) => {
	const b = (h - 2) / 2;
	return Math.max(0, -1 * Math.pow((x - (b + 1)) / b, 2) + 1);
};

const NEG_BOUND = -10;
const POS_BOUND = 9;
// given x between 0 and 1
const map = (x) => {
	return x * (POS_BOUND - NEG_BOUND) + NEG_BOUND;
};

for (let i = 0; i < NUM_SHADES; i++) {
	// starting coordinates for shade
	const x = i * X_SHADE_WIDTH_MM;
	const y = i * Y_SHADE_WIDTH_MM;

	// left side
	dxf.addLine(point3dmm(x, y), point3dmm(x, y + a));
	dxf.addLine(point3dmm(x, y + a), point3dmm(x + b, y + a));
	dxf.addLine(point3dmm(x + b, y + a), point3dmm(x + b, y + a + c));
	dxf.addLine(point3dmm(x + b, y + a + c), point3dmm(x, y + a + c));
	dxf.addLine(point3dmm(x, y + a + c), point3dmm(x, y + a + c + d));
	dxf.addLine(point3dmm(x, y + a + c + d), point3dmm(x + b, y + a + c + d));
	dxf.addLine(
		point3dmm(x + b, y + a + c + d),
		point3dmm(x + b, y + a + c + d + c)
	);
	dxf.addLine(
		point3dmm(x + b, y + a + c + d + c),
		point3dmm(x, y + a + c + d + c)
	);
	dxf.addLine(
		point3dmm(x, y + a + c + d + c),
		point3dmm(x, y + a + c + d + c + a)
	);

	// right side
	const coords = getCircleCoordinates(i);
	let prev = { x, y };
	for (let m = 0; m < h; m += 0.5) {
		const x1 =
			l * Math.pow(1 - Math.pow(Math.abs((h / 2 - m) / (h / 2)), n), 1 / n);
		const xNoise =
			reduce(m) * map(simplex.noise3d(coords.x, coords.y, m * Z_NOISE_OFFSET)) +
			x +
			x1;
		dxf.addLine(point3dmm(prev.x, prev.y), point3dmm(xNoise, y + m));
		prev.x = xNoise;
		prev.y = y + m;
	}
	dxf.addLine(point3dmm(prev.x, prev.y), point3dmm(x, y + h));
}

fs.writeFile("lampshade.dxf", dxf.stringify(), (err) => console.error(err));
