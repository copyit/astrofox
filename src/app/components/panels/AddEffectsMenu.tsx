import SectionAddMenu from "./SectionAddMenu";

const EFFECT_CATEGORIES = [
	{
		label: "Color",
		items: ["Color"],
	},
	{
		label: "Blur & Focus",
		items: ["Blur", "Bloom", "Depth of Field", "Tilt Shift"],
	},
	{
		label: "Distortion",
		items: ["Distortion", "Glitch", "Kaleidoscope", "Mirror", "RGB Shift"],
	},
	{
		label: "Pattern",
		items: [
			"ASCII",
			"Color Halftone",
			"Dot Screen",
			"LED",
			"Pixelate",
			"Scanline",
		],
	},
	{
		label: "Stylize",
		items: ["Noise", "Perlin Noise", "Vignette"],
	},
];

interface AddEffectsMenuProps {
	sceneId: string;
}

export default function AddEffectsMenu({ sceneId }: AddEffectsMenuProps) {
	return (
		<SectionAddMenu
			sceneId={sceneId}
			entityType="effects"
			categories={EFFECT_CATEGORIES}
			ariaLabel="Add effect"
		/>
	);
}
