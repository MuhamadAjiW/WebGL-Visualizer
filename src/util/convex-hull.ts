import { BufferInfo } from "../types/buffer-info";

export function hull(bufPos: BufferInfo, bufCol: BufferInfo): [BufferInfo, BufferInfo] {

    let posArr = bufPos.data
    let colArr = bufCol.data

    let vPosArr: number[][] = []
    let vColArr: number[][] = []

    for (let i = 0; i< posArr.length; i+=4) {
        vPosArr.push([posArr[i], posArr[i+1]])
        vColArr.push([colArr[i], colArr[i+1], colArr[i+2], colArr[i+3]])
    }

    // console.log("vPosArr", vPosArr);
    // console.log("vColArr", vColArr);

    // TODO: Handle duplicate vertices
    // let uniqueVertexArray = removeDuplicateVertex(vertexArray)

    let leftMostIndex = leftMostVertIndex(vPosArr)

    let solPos: number[][] = []
    let solCol: number[][] = []

    let pOH = vPosArr[leftMostIndex]
    let pOHIndex = leftMostIndex
    
    let end = vPosArr[0]
    let endIndex = 0
    do {
        solPos.push(vPosArr[pOHIndex])
        solCol.push(vColArr[pOHIndex])
        end = vPosArr[0]
        endIndex = 0
        for (let i = 1; i < vPosArr.length; i++) {
            const src = solPos[solPos.length - 1]
            const ref = end
            const target = vPosArr[i]

            let isleft = isLeftOfLine(src, ref, target)
            let isSame = (end[0] === pOH[0]) && (end[1] === pOH[1])
            if (isSame || isleft) {
                end = vPosArr[i]
                endIndex = i
            }
        }
        pOHIndex = endIndex
        pOH = end
    } while ((end[0] !== solPos[0][0]) || (end[1] !== solPos[0][1]))

    // console.log("solPos", solPos);
    // console.log("solCol", solCol);

    let positionBuffer = new BufferInfo(solPos.length, flattenForPos(solPos))
    let colorBuffer = new BufferInfo(solCol.length, flattenForCol(solCol))

    return [positionBuffer, colorBuffer]
}

function removeDuplicateVertex(posBuf: BufferInfo, colBuf: BufferInfo) {
    
}

function leftMostVertIndex(arr: Number[][]): number {
    let leftMost = arr[0]
    let index = 0
    for (let i = 1; i < arr.length; i++) {
        if (arr[i][0] < leftMost[0]) {
            leftMost = arr[i]
            index = i
        }
    }
    return index
}

function isLeftOfLine(sourceVertex: Array<number>, comparisonVertex: Array<number>, targetVertex: Array<number>) {
    let comparisonLine = [comparisonVertex[0] - sourceVertex[0], comparisonVertex[1] - sourceVertex[1]]
    let targetLine = [targetVertex[0] - sourceVertex[0], targetVertex[1] - sourceVertex[1]]
    let cp = crossProduct(comparisonLine, targetLine)
    return cp > 0
}

function crossProduct (a: Array<number>, b: Array<number>) {
    return a[0] * b[1] - a[1] * b[0]
}

export function flattenForPos(vertexArray: Array<Array<number>>) {
    let flatVertexArray: number[] = []
    for (let i = 0; i < vertexArray.length; i++) {
        flatVertexArray.push(...vertexArray[i])
        flatVertexArray.push(...[0, 1])
    }
    return flatVertexArray
}

export function flattenForCol(vertexArray: Array<Array<number>>) {
    let flatVertexArray: number[] = []
    for (let i = 0; i < vertexArray.length; i++) {
        flatVertexArray.push(...vertexArray[i])
    }
    return flatVertexArray
}

