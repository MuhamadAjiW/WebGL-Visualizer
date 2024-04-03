export function lerp(a: number, b: number, alpha: number ) {
    return a < b? a + alpha * ( b - a ) : b + alpha * ( a - b )
}