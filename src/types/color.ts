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
}