export class Coordinates {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public p: number = 1;

    constructor(x=0, y=0, z=0, p=1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.p = p;
    }

    getComponents(): number[] {
        return [this.x, this.y, this.z, this.p]
    }
}