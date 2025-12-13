enum PearlColor {
	White = "white",
	Black = "black",
	Red = "red",
	Yellow = "yellow",
	Green = "green",
	Blue = "blue",
	Cyan = "cyan",
	Magenta = "magenta"
}

const GetPearlHexColor = (color: PearlColor): number => {
	switch (color) {
		case PearlColor.White:
			return 0xffffff;
		case PearlColor.Black:
			return 0x000000;
		case PearlColor.Red:
			return 0xff0000;
		case PearlColor.Yellow:
			return 0xffff00;
		case PearlColor.Green:
			return 0x00ff00;
		case PearlColor.Blue:
			return 0x0000ff;
		case PearlColor.Cyan:
			return 0x00ffff;
		case PearlColor.Magenta:
			return 0xff00ff;
		default:
			return 0xffffff;
	}
}

export { PearlColor, GetPearlHexColor };
