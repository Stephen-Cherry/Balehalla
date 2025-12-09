import { PearlColor } from "./PearlColor";
import { PearlSector } from "./PearlSector";

interface Pearl {
	x: number;
	y: number;
	color: PearlColor;
	sector: PearlSector;
}

export { Pearl };