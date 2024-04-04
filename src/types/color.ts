export class Color {
    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public a: number = 1;

    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    getComponents(): number[] {
        return [this.r, this.g, this.b, this.a]
    }

    toHex(): string {
        let r = Math.round(this.r * 255).toString(16);
        let g = Math.round(this.g * 255).toString(16);
        let b = Math.round(this.b * 255).toString(16);
        return `#${r}${g}${b}`;
    }

    static fromHex(hex: string): Color {
        let r = parseInt(hex.substring(1, 3), 16) / 255;
        let g = parseInt(hex.substring(3, 5), 16) / 255;
        let b = parseInt(hex.substring(5, 7), 16) / 255;
        return new Color(r, g, b);
    }
}