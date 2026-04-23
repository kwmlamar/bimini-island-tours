
function getPointOnBezier(t, p0, p1, p2, p3) {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;
    const x = (ax * t * t * t) + (bx * t * t) + (cx * t) + p0.x;
    const y = (ay * t * t * t) + (by * t * t) + (cy * t) + p0.y;
    return { x, y };
}

function getTangentOnBezier(t, p0, p1, p2, p3) {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;
    const dx = (3 * ax * t * t) + (2 * bx * t) + cx;
    const dy = (3 * ay * t * t) + (2 * by * t) + cy;
    return { x: dx, y: dy };
}

const p0 = { x: 50, y: 650 };
const p1 = { x: 120, y: 580 };
const p2 = { x: 280, y: 420 };
const p3 = { x: 460, y: 60 };

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700">\n`;
svg += `<g fill="none" stroke="#0A1628">\n`;
svg += `  <path d="M${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" stroke-width="2" stroke-opacity="0.15" />\n`;

let leafletsLeft = "";
let leafletsRight = "";
let subVeinsLeft = "";
let subVeinsRight = "";

const numLeaflets = 32;
for (let i = 0; i < numLeaflets; i++) {
    const t = 0.05 + (i / numLeaflets) * 0.92;
    const start = getPointOnBezier(t, p0, p1, p2, p3);
    const tangent = getTangentOnBezier(t, p0, p1, p2, p3);
    const angle = Math.atan2(tangent.y, tangent.x);
    
    const lengthBase = 120 + Math.sin(t * Math.PI) * 80;
    const lengthLeft = lengthBase * (0.9 + Math.random() * 0.2);
    const lengthRight = lengthBase * (0.9 + Math.random() * 0.2);

    // Left
    const angleLeft = angle - Math.PI/2 - 0.5;
    const endLeft = { x: start.x + Math.cos(angleLeft) * lengthLeft, y: start.y + Math.sin(angleLeft) * lengthLeft + (lengthLeft * 0.3) };
    const cpLeft = { x: start.x + Math.cos(angleLeft) * lengthLeft * 0.5, y: start.y + Math.sin(angleLeft) * lengthLeft * 0.5 - 5 };
    leafletsLeft += `  <path d="M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${cpLeft.x.toFixed(1)},${cpLeft.y.toFixed(1)} ${endLeft.x.toFixed(1)},${endLeft.y.toFixed(1)}" />\n`;

    // Left Sub
    const subOffset = 3.5;
    subVeinsLeft += `  <path d="M${(start.x + Math.cos(angle)*subOffset).toFixed(1)},${(start.y + Math.sin(angle)*subOffset).toFixed(1)} Q${(cpLeft.x + Math.cos(angle)*subOffset).toFixed(1)},${(cpLeft.y + Math.sin(angle)*subOffset).toFixed(1)} ${(endLeft.x - 1).toFixed(1)},${(endLeft.y - 1).toFixed(1)}" />\n`;
    subVeinsLeft += `  <path d="M${(start.x + Math.cos(angle)*subOffset*2).toFixed(1)},${(start.y + Math.sin(angle)*subOffset*2).toFixed(1)} Q${(cpLeft.x + Math.cos(angle)*subOffset*2).toFixed(1)},${(cpLeft.y + Math.sin(angle)*subOffset*2).toFixed(1)} ${(endLeft.x - 2).toFixed(1)},${(endLeft.y - 2).toFixed(1)}" />\n`;

    // Right
    const angleRight = angle + Math.PI/2 + 0.5;
    const endRight = { x: start.x + Math.cos(angleRight) * lengthRight, y: start.y + Math.sin(angleRight) * lengthRight + (lengthRight * 0.3) };
    const cpRight = { x: start.x + Math.cos(angleRight) * lengthRight * 0.5, y: start.y + Math.sin(angleRight) * lengthRight * 0.5 - 5 };
    leafletsRight += `  <path d="M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${cpRight.x.toFixed(1)},${cpRight.y.toFixed(1)} ${endRight.x.toFixed(1)},${endRight.y.toFixed(1)}" />\n`;

    // Right Sub
    subVeinsRight += `  <path d="M${(start.x - Math.cos(angle)*subOffset).toFixed(1)},${(start.y - Math.sin(angle)*subOffset).toFixed(1)} Q${(cpRight.x - Math.cos(angle)*subOffset).toFixed(1)},${(cpRight.y - Math.cos(angle)*subOffset).toFixed(1)} ${(endRight.x + 1).toFixed(1)},${(endRight.y - 1).toFixed(1)}" />\n`;
    subVeinsRight += `  <path d="M${(start.x - Math.cos(angle)*subOffset*2).toFixed(1)},${(start.y - Math.sin(angle)*subOffset*2).toFixed(1)} Q${(cpRight.x - Math.cos(angle)*subOffset*2).toFixed(1)},${(cpRight.y - Math.cos(angle)*subOffset*2).toFixed(1)} ${(endRight.x + 2).toFixed(1)},${(endRight.y - 2).toFixed(1)}" />\n`;
}

svg += `<g stroke-width="1.2" stroke-opacity="0.10">\n${leafletsLeft}${leafletsRight}</g>\n`;
svg += `<g stroke-width="0.5" stroke-opacity="0.06">\n${subVeinsLeft}${subVeinsRight}</g>\n`;
svg += `</g>\n</svg>`;
console.log(svg);
