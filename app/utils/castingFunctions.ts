export function bitwiseFloat32ToInt32(f: number): number {
    const buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = f;
    return (new Int32Array(buf))[0];
}

export function bitwiseInt32ToFloat32(i: number): number {
    const buf = new ArrayBuffer(4);
    (new Int32Array(buf))[0] = i;
    return (new Float32Array(buf))[0];
}
