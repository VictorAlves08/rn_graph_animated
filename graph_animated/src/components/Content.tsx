import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  LinearGradient,
  Mask,
  Path,
  RoundedRect,
  Skia,
  Image as SkiaImage,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle as SvgCircle, Path as SvgPath } from "react-native-svg";

type Props = { width?: number; height?: number };

const Content: React.FC<Props> = ({ width = 412, height = 270 }) => {
  // ------- Responsive layout (safe drawing area) -------
  const pad = 22;
  const W = width;
  const H = height;
  const gx = pad;
  const gy = pad;
  const GW = W - pad * 2;
  const GH = H - pad * 2;

  // Key reference points (fractions of the safe area)
  const x0 = gx + GW * 0.03; // curves start (before "Now" offset)
  const yBase = gy + GH * 0.62; // dashed baseline ("Now")
  const xEnd = gx + GW * 0.96;
  const yTop = gy + GH * 0.08; // green curve top
  const yNegEnd = gy + GH * 0.88; // red curve bottom

  const greenEnd = { x: gx + GW * 0.85, y: yTop };
  const greenEndExtended = {
    x: gx + GW * 1.02, // slight overshoot for gradient fade
    y: greenEnd.y + 18,
  };

  // ------- Paths (Cubic Béziers) -------
  const x0Start = x0 + 60; // start after the "Now" dot

  const greenPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(x0Start, yBase);

    // Smooth ascent
    p.cubicTo(
      x0Start + GW * 0.2,
      yBase - GH * 0.15,
      gx + GW * 0.4,
      yBase - GH * 0.3,
      gx + GW * 0.6,
      yBase - GH * 0.42
    );

    // Landing near final point
    p.cubicTo(
      gx + GW * 0.7,
      yBase - GH * 0.48,
      gx + GW * 0.8,
      greenEnd.y + 18,
      greenEnd.x + 10,
      greenEnd.y + 18
    );

    // Linear extension for fade-out
    p.lineTo(greenEndExtended.x, greenEnd.y + 18);
    return p;
  }, [GW, GH, gx, x0Start, yBase, greenEnd, greenEndExtended]);

  const redPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(x0, yBase);

    // Gentle start, then transition to descent
    p.cubicTo(
      gx + GW * 0.25,
      yBase,
      gx + GW * 0.45,
      yBase + GH * 0.01,
      gx + GW * 0.6,
      yBase + GH * 0.05
    );

    p.cubicTo(
      gx + GW * 0.78,
      yBase + GH * 0.12,
      gx + GW * 0.85,
      yBase + GH * 0.35,
      gx + GW * 0.95,
      yNegEnd
    );

    return p;
  }, [GW, GH, gx, x0, yBase, yNegEnd]);

  // ------- Axes -------
  const axisYTop = gy;
  const axisYBottom = gy + GH;
  const axisXLeft = gx;
  const axisXRight = gx + GW;

  // Y-axis arrow head
  const yArrowPath = useMemo(() => {
    const p = Skia.Path.Make();
    const baseX = axisXLeft;
    const tipY = axisYTop - 6;
    p.moveTo(baseX - 8, axisYTop + 6);
    p.lineTo(baseX + 8, axisYTop + 6);
    p.lineTo(baseX, tipY);
    p.close();
    return p;
  }, [axisXLeft, axisYTop]);

  // ------- Animations -------
  const progGreen = useSharedValue(0);
  const progRed = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const arrowScale = useSharedValue(0.65);
  const pulseR = useSharedValue(9);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    // 1) Green curve draw
    progGreen.value = withTiming(1, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });

    // 2) Red curve draw (slight delay)
    progRed.value = withDelay(
      500,
      withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) })
    );

    // 3) Arrow fade + "7x" scale/fade
    arrowOpacity.value = withDelay(
      1500,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    arrowScale.value = withDelay(
      900,
      withSequence(
        withTiming(1.08, {
          duration: 320,
          easing: Easing.out(Easing.back(1.05)),
        }),
        withTiming(1, { duration: 140 })
      )
    );

    // 4) Pulse at green end
    pulseR.value = withRepeat(
      withTiming(20, { duration: 1000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  // ------- Arrow PNG (kept proportional) -------
  // Native dimensions of the PNG (adjust if your file differs)
  const ARROW_SRC_W = 80;
  const ARROW_SRC_H = 115;

  const arrowGap = GH * 0.06; // distance between end dot and arrow tip
  const headTipX = greenEnd.x;
  const headTipY = greenEnd.y + arrowGap;

  const targetBottomY = yBase - GH * 0.04; // base of the arrow near dashed line
  const targetHeight = Math.max(48, targetBottomY - headTipY);
  const arrowAspect = ARROW_SRC_W / ARROW_SRC_H;
  const arrowTargetH = targetHeight;
  const arrowTargetW = arrowTargetH * arrowAspect;

  // Load images once
  const arrowImg = useImage(require("../assets/images/arrowUp.png"));
  const glowImg = useImage(require("../assets/images/gradient.png"));

  return (
    <View style={[styles.container, { width: W, height: H }]}>
      {/* --------- "Sex Duration" badge --------- */}
      <View
        style={[
          styles.sexLabel,
          {
            left: gx + 35,
            top: gy - 5,
            backgroundColor: "#000",
          },
        ]}
      >
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          style={{ marginRight: 8 }}
        >
          <SvgCircle
            cx="12"
            cy="12"
            r="9"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
          />
          <SvgPath
            d="M12 7 v5 l3 2"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
        <Text style={styles.sexText}>Sex Duration</Text>
      </View>

      {/* --------- "Now" label --------- */}
      <View style={[styles.now, { left: 48, top: 110 }]}>
        <Text style={styles.nowText}>Now</Text>
      </View>

      {/* --------- Canvas --------- */}
      <Canvas style={{ width: W, height: H - 18 }}>
        {/* Background glow */}
        {glowImg && (
          <Group opacity={1}>
            <SkiaImage
              image={glowImg}
              x={0}
              y={0}
              width={W}
              height={H}
              fit="cover"
            />
          </Group>
        )}

        {/* Y axis + arrow head */}
        <Group>
          <Path
            path={
              Skia.Path.MakeFromSVGString(
                `M ${axisXLeft} ${axisYBottom} L ${axisXLeft} ${axisYTop}`
              )!
            }
            color="white"
            style="stroke"
            strokeWidth={2}
          />
          <Path path={yArrowPath} color="white" style="fill" />
        </Group>

        {/* X axis with right fade-out */}
        <Mask
          mode="luminance"
          mask={
            <Path
              path={
                Skia.Path.MakeFromSVGString(
                  `M ${axisXLeft} ${axisYBottom} L ${axisXRight} ${axisYBottom}`
                )!
              }
              color="white"
              style="stroke"
              strokeWidth={2}
            />
          }
        >
          <LinearGradient
            start={vec(axisXLeft, axisYBottom)}
            end={vec(axisXRight, axisYBottom)}
            colors={["#FFFFFF", "#FFFFFF", "#000"]}
            positions={[0, 0.75, 1.0]}
          />
          <RoundedRect x={gx} y={gy} width={GW} height={GH} r={0} />
        </Mask>

        {/* Light horizontal guides */}
        {[0.1, 0.3, 0.5, 0.7, 0.85].map((f, i) => (
          <Path
            key={i}
            path={
              Skia.Path.MakeFromSVGString(
                `M ${axisXLeft} ${gy + GH * f} L ${axisXRight} ${gy + GH * f}`
              )!
            }
            color="rgba(255,255,255,0.12)"
            style="stroke"
            strokeWidth={1}
          />
        ))}

        {/* RED curve (mask + gradient) */}
        <Mask
          mode="luminance"
          mask={
            <Path
              path={redPath}
              color="white"
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              start={0}
              end={progRed as any}
            />
          }
        >
          <LinearGradient
            start={vec(x0, yBase)}
            end={vec(xEnd, yNegEnd)}
            colors={["#00000000", "#15c50b", "#EE0F0F", "#EE0F0F00"]}
            positions={[0.0, 0.25, 0.7, 1.0]}
          />
          <RoundedRect x={gx} y={gy} width={GW} height={GH} r={0} />
        </Mask>

        {/* Dashed baseline */}
        <Path
          path={
            Skia.Path.MakeFromSVGString(
              `M ${axisXLeft + 6} ${yBase} L ${axisXRight - 6} ${yBase}`
            )!
          }
          color="rgba(255,255,255,0.9)"
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
        >
          <DashPathEffect intervals={[16, 16]} />
        </Path>

        {/* GREEN curve (mask + gradient) */}
        <Mask
          mode="luminance"
          mask={
            <Path
              path={greenPath}
              color="white"
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              start={0}
              end={progGreen as any}
            />
          }
        >
          <LinearGradient
            start={vec(x0, yBase)}
            end={vec(greenEndExtended.x, greenEndExtended.y)}
            colors={[
              "#00000000",
              "#15c50b",
              "#1AEE0E",
              "#1AEE0E80",
              "#17d60d20",
              "#17d60d00",
            ]}
            positions={[0.0, 0.3, 0.6, 0.9, 0.95, 1.0]}
          />
          <RoundedRect x={gx} y={gy} width={GW * 1.1} height={GH} r={0} />
        </Mask>

        {/* Pulse on green end */}
        <Circle
          cx={greenEnd.x - 10}
          cy={greenEnd.y + 16}
          r={pulseR as any}
          color="#17d60d"
          opacity={pulseOpacity as any}
        />

        {/* Solid end point + ring */}
        <Group>
          <Circle
            cx={greenEnd.x - 10}
            cy={greenEnd.y + 16}
            r={14}
            color="rgba(26,238,14,0.25)"
          />
          <Circle
            cx={greenEnd.x - 10}
            cy={greenEnd.y + 16}
            r={9}
            color="#ffff"
          />
          <Circle
            cx={greenEnd.x - 10}
            cy={greenEnd.y + 16}
            r={9}
            style="stroke"
            strokeWidth={5}
            color="#17d60d"
          />
        </Group>

        {/* Start point ("Now") */}
        <Group>
          <Circle cx={x0 + 45} cy={yBase} r={15} color="#2F353D" />
          <Circle cx={x0 + 45} cy={yBase} r={6} color="#FFFFFF" />
        </Group>

        {/* Arrow PNG (fade + slight scale handled outside via Animated.Text) */}
        {arrowImg && (
          <Group
            opacity={arrowOpacity as any}
            transform={[
              { translateX: headTipX },
              { translateY: headTipY },
              { translateX: -headTipX },
              { translateY: -headTipY },
            ]}
          >
            <SkiaImage
              image={arrowImg}
              x={headTipX - arrowTargetW / 2 - 11}
              y={headTipY + 28}
              width={arrowTargetW}
              height={arrowTargetH}
            />
          </Group>
        )}
      </Canvas>

      {/* "7x" label near arrow base */}
      <Animated.Text
        style={[
          styles.mult,
          {
            left: headTipX + 10,
            top: targetBottomY - 25,
            opacity: arrowOpacity as any,
            transform: [{ scale: arrowScale as any }],
          },
        ]}
      >
        7x
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  sexLabel: {
    position: "absolute",
    height: 45,
    width: 154,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#141518",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  sexText: {
    backgroundColor: "#000",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
  },
  now: {
    position: "absolute",
    backgroundColor: "#3F4650",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nowText: { color: "#FFFFFF", fontWeight: "700" },
  mult: {
    position: "absolute",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
  },
});

export default Content;
