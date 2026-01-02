import { PearlColor } from "./PearlColor";
import { PearlSector } from "./PearlSector";

interface Pearl {
	id?: number;
	x: number;
	y: number;
	color: PearlColor;
	sector: PearlSector;
	created_at?: Date;
}

export { Pearl };