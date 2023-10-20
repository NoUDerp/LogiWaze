import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const acrithia = JSON.parse(
  await readFile(resolve("AcrithiaHex.json"), "utf-8")
);

const circles = [];
const tierOneRoad = [];
const tierTwoRoad = [];
const tierThreeRoad = [];

for (const component of acrithia) {
  const props = component.Properties;
  if (props === undefined) continue;
  const material = props.PhysMaterial;
  if (material !== undefined && component.Outer !== undefined) {
    if (material.ObjectName.includes("T1Road"))
      tierOneRoad.push(component.Outer);
    if (material.ObjectName.includes("T2Road"))
      tierTwoRoad.push(component.Outer);
    if (material.ObjectName.includes("T3Road"))
      tierThreeRoad.push(component.Outer);
  }
  const points = props.Points;
  if (points === undefined) continue;
  const localMesh = props.LocalMeshComponents;
  if (localMesh === undefined) continue;
  let tier = "t1";
  for (const local of localMesh) {
    for (const road of tierOneRoad) {
      if (local.ObjectName.includes(road)) {
        tier = "t1";
        continue;
      }
    }
    for (const road of tierTwoRoad) {
      if (local.ObjectName.includes(road)) {
        tier = "t2";
        continue;
      }
    }
    for (const road of tierThreeRoad) {
      if (local.ObjectName.includes(road)) {
        tier = "t3";
        continue;
      }
    }
  }
  for (const point of points) {
    circles.push({
      X: point.Center.X,
      Y: point.Center.Y,
      tier,
    });
  }
}

function buildVector() {
  let returnString = `<svg viewBox="0 0 200000 200000" xmlns="http://www.w3.org/2000/svg" >`;
  for (const circle of circles) {
    let color = "black";
    if (circle.tier === "t1") color = "lawngreen";
    if (circle.tier === "t2") color = "firebrick";
    if (circle.tier === "t3") color = "dodgerblue";
    returnString += `<circle cx="${circle.X}" cy="${circle.Y}" r="1000" fill="${color}" />`;
  }
  returnString += `</svg>`;
  return returnString;
}

await writeFile(resolve("AcrithiaHex.svg"), buildVector(), "utf-8");
