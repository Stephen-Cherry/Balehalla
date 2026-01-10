import { PearlColor } from "./PearlColor";
import { PearlSector } from "./PearlSector";

interface Pearl {
	id?: number;
	x: number;
	y: number;
	color: PearlColor;
	sector: PearlSector;
	user?: string;
	created_at?: Date;
}

export { Pearl };