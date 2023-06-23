const { DxfWriter, point3d, Units } = require("@tarikjabiri/dxf");
const fs = require("fs");

const NUM_SHADES = 32;
const X_SHADE_WIDTH_MM = 75;
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

const h = 2 * a + 2 * c + d;
const l = 70;
const n = 5.6;

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
	let initial_x = x;
	let initial_y = y;
	for (let m = 0; m < h; m += 0.5) {
		const x1 =
			l * Math.pow(1 - Math.pow(Math.abs((h / 2 - m) / (h / 2)), n), 1 / n);
		dxf.addLine(point3dmm(initial_x, initial_y), point3dmm(x + x1, y + m));
		initial_x = x + x1;
		initial_y = y + m;
	}
	dxf.addLine(point3dmm(initial_x, initial_y), point3dmm(x, y + h));
}

fs.writeFile("lampshade.dxf", dxf.stringify(), (err) => console.error(err));
