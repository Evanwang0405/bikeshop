import type { CompatibilityResult, Component } from "@/types/bike";

export function checkCompatibility(frame?: Component, wheelset?: Component, groupset?: Component, components: Component[] = []): CompatibilityResult[] {
  if (!frame) return [{ status: "warning", message: "Choose a frame to start checking fit.", rule: "frame-required" }];

  const results: CompatibilityResult[] = [];
  const tires = components.find((component) => component.category === "tires");
  const cassette = components.find((component) => component.category === "cassette");
  const chain = components.find((component) => component.category === "chain");
  const handlebar = components.find((component) => component.category === "handlebar");
  const stem = components.find((component) => component.category === "stem");
  const seatpost = components.find((component) => component.category === "seatpost");

  if (tires) {
    if (frame.compatibility.wheelSize !== tires.compatibility.wheelSize) {
      results.push({ status: "incompatible", message: `Frame supports ${frame.compatibility.wheelSize}; tires are ${tires.compatibility.wheelSize}.`, rule: "tire-wheel-size" });
    } else if ((tires.compatibility.tireWidth ?? 0) > (frame.compatibility.tireClearance ?? Number.POSITIVE_INFINITY)) {
      results.push({ status: "incompatible", message: `${tires.compatibility.tireWidth}mm tires exceed the frame's ${frame.compatibility.tireClearance}mm clearance.`, rule: "tire-clearance" });
    } else {
      results.push({ status: "compatible", message: "Tire size fits the frame clearance.", rule: "tire-fit" });
    }
  }
  if (wheelset) {
    if (frame.compatibility.wheelSize !== wheelset.compatibility.wheelSize) {
      results.push({ status: "incompatible", message: `Frame supports ${frame.compatibility.wheelSize}; wheelset is ${wheelset.compatibility.wheelSize}.`, rule: "wheel-size" });
    } else if (frame.compatibility.axleStandard !== wheelset.compatibility.axleStandard) {
      results.push({ status: "incompatible", message: `Frame uses ${frame.compatibility.axleStandard} thru axle; wheelset uses ${wheelset.compatibility.axleStandard}.`, rule: "axle-standard" });
    } else {
      results.push({ status: "compatible", message: "Wheel size and axle standard match the frame.", rule: "wheel-fit" });
    }
  }

  if (groupset) {
    if (frame.compatibility.brakeType !== groupset.compatibility.brakeType) {
      results.push({ status: "incompatible", message: `Frame is designed for ${frame.compatibility.brakeType} brakes; groupset is ${groupset.compatibility.brakeType}.`, rule: "brake-type" });
    } else if (groupset.compatibility.bottomBracket !== frame.compatibility.bottomBracket) {
      results.push({ status: "warning", message: `Groupset needs ${groupset.compatibility.bottomBracket}; frame uses ${frame.compatibility.bottomBracket}. Check the crank interface.`, rule: "bottom-bracket" });
    } else {
      results.push({ status: "compatible", message: "Brake and bottom bracket standards line up.", rule: "groupset-fit" });
    }
    if (wheelset && groupset.compatibility.freehub !== wheelset.compatibility.freehub) {
      results.push({ status: "warning", message: `Wheelset uses ${wheelset.compatibility.freehub}; groupset cassette expects ${groupset.compatibility.freehub}. A freehub swap may be required.`, rule: "freehub" });
    }
  }

  if (groupset && cassette) {
    if (groupset.compatibility.drivetrainSpeed !== cassette.compatibility.drivetrainSpeed) {
      results.push({ status: "incompatible", message: `Groupset is ${groupset.compatibility.drivetrainSpeed}-speed; cassette is ${cassette.compatibility.drivetrainSpeed}-speed.`, rule: "cassette-speed" });
    } else if (wheelset && cassette.compatibility.freehub !== wheelset.compatibility.freehub) {
      results.push({ status: "warning", message: `Cassette needs a ${cassette.compatibility.freehub} freehub; selected wheels use ${wheelset.compatibility.freehub}.`, rule: "cassette-freehub" });
    } else {
      results.push({ status: "compatible", message: "Cassette speed and freehub match the drivetrain.", rule: "cassette-fit" });
    }
  }

  if (groupset && chain && groupset.compatibility.drivetrainSpeed !== chain.compatibility.drivetrainSpeed) {
    results.push({ status: "incompatible", message: `Chain is for ${chain.compatibility.drivetrainSpeed}-speed drivetrains; groupset is ${groupset.compatibility.drivetrainSpeed}-speed.`, rule: "chain-speed" });
  }

  if (handlebar && stem) {
    if (handlebar.compatibility.clampDiameter !== stem.compatibility.clampDiameter) {
      results.push({ status: "incompatible", message: `Handlebar is ${handlebar.compatibility.clampDiameter}mm; stem clamp is ${stem.compatibility.clampDiameter}mm.`, rule: "cockpit-clamp" });
    } else {
      results.push({ status: "compatible", message: "Handlebar and stem clamp diameters match.", rule: "cockpit-fit" });
    }
  }

  if (seatpost && frame.compatibility.seatpostDiameter !== seatpost.compatibility.seatpostDiameter) {
    results.push({ status: "incompatible", message: `Frame needs a ${frame.compatibility.seatpostDiameter}mm seatpost; selected post is ${seatpost.compatibility.seatpostDiameter}mm.`, rule: "seatpost-fit" });
  }

  return results;
}
