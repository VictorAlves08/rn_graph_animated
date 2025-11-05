// Content.tsx
import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  RoundedRect,
  Skia,
  Image as SkiaImage, // ⬅️ novo
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
  // ---------- Layout Responsivo ----------
  const pad = 22;
  const W = width;
  const H = height;
  const gx = pad; // margem esquerda
  const gy = pad; // margem superior
  const GW = W - pad * 2; // largura útil
  const GH = H - pad * 2; // altura útil

  // Pontos "chave" (frações da área)
  const x0 = gx + GW * 0.03; // início das curvas
  const yBase = gy + GH * 0.62; // linha base (Now)
  const xEnd = gx + GW * 0.96; // fim das curvas
  const yTop = gy + GH * 0.26; // topo da curva verde
  const yNegEnd = gy + GH * 0.88; // final da curva negativa

  // Ponto final da curva verde (definido antes do path)
  const greenEnd = { x: gx + GW * 0.85, y: yTop };

  // ---------- Paths (Béziers) ----------
  const greenPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(x0, yBase);
    p.cubicTo(
      gx + GW * 0.3,
      yBase - GH * 0.1,
      gx + GW * 0.6,
      yBase - GH * 0.4,
      greenEnd.x,
      greenEnd.y
    );
    return p;
  }, [W, H, GH, GW, gx, x0, yBase, greenEnd]);

  const redPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(x0, yBase);
    p.cubicTo(
      gx + GW * 0.32,
      yBase + GH * 0.02,
      gx + GW * 0.58,
      yBase + GH * 0.1,
      gx + GW * 0.76,
      yBase + GH * 0.18
    );
    p.cubicTo(
      gx + GW * 0.88,
      yBase + GH * 0.26,
      gx + GW * 0.92,
      yBase + GH * 0.3,
      gx + GW * 0.95,
      yNegEnd
    );
    return p;
  }, [W, H]);

  // ---------- Eixos ----------
  const axisYTop = gy;
  const axisYBottom = gy + GH;
  const axisXLeft = gx;
  const axisXRight = gx + GW;

  // Seta do eixo Y
  const yArrowPath = useMemo(() => {
    const p = Skia.Path.Make();
    const baseX = axisXLeft;
    const tipY = axisYTop - 6;
    p.moveTo(baseX - 8, axisYTop + 6);
    p.lineTo(baseX + 8, axisYTop + 6);
    p.lineTo(baseX, tipY);
    p.close();
    return p;
  }, [W, H]);

  // ---------- Animações ----------
  const progGreen = useSharedValue(0);
  const progRed = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const arrowScale = useSharedValue(0.65);
  const pulseR = useSharedValue(14);
  const pulseOpacity = useSharedValue(0.2);

  useEffect(() => {
    // 1) Curva verde
    progGreen.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.cubic),
    });
    // 2) Curva vermelha (delay 300–500ms)
    progRed.value = withDelay(
      500,
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) })
    );
    // 3) Seta (fade) + “7x” (scale + fade)
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
    // 4) Pulso do ponto final
    pulseR.value = withRepeat(
      withTiming(24, { duration: 1000, easing: Easing.out(Easing.cubic) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.06, { duration: 1000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  // ---------- SETA (PNG) ----------
  // dimensões nativas do PNG (ajuste se seu arquivo for outro)
  const ARROW_SRC_W = 80;
  const ARROW_SRC_H = 50;

  const arrowGap = GH * 0.06; // distância entre o círculo e a PONTA da seta
  const headTipX = greenEnd.x; // ponta alinhada ao centro do ponto final
  const headTipY = greenEnd.y + arrowGap;

  const targetBottomY = yBase - GH * 0.04; // base da seta (pé) perto da linha tracejada
  const targetHeight = Math.max(48, targetBottomY - headTipY);
  const scaleArrowImg = targetHeight;
  const targetWidth = ARROW_SRC_W * scaleArrowImg;

  // carrega a imagem
  const arrowImg = useImage(require("../assets/images/arrowUp.png"));

  return (
    <View style={[styles.container, { width: W, height: H }]}>
      {/* ---------- Label "Sex duration" (gradiente vertical + ícone) ---------- */}
      <View
        style={[
          styles.sexLabel,
          {
            left: gx + 50,
            top: gy - 5,
            backgroundColor: "#000", // fundo sólido no lugar do gradiente
          },
        ]}
      >
        <Svg
          width={18}
          height={18}
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
        <Text style={styles.sexText}>Sex duration</Text>
      </View>

      {/* ---------- Label "Now" ---------- */}
      <View style={[styles.now, { left: 40, top: 110 }]}>
        <Text style={styles.nowText}>Now</Text>
      </View>

      {/* ---------- Canvas ---------- */}
      <Canvas style={{ width: W, height: H }}>
        {/* Glow radial */}
        <Group opacity={1}>
          <RadialGradient
            c={vec(W * 0.9, gy + GH * 0.4)}
            r={W * 0.95}
            colors={[
              "rgba(26,238,14,0.20)",
              "rgba(26,238,14,0.12)",
              "rgba(26,238,14,0.06)",
              "rgba(26,238,14,0.00)",
            ]}
            positions={[0, 0.35, 0.7, 1]}
          />
          <RoundedRect x={0} y={0} width={W} height={H} r={0} />
        </Group>

        {/* Eixo Y + seta */}
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

        {/* Eixo X com fade-out */}
        <Path
          path={
            Skia.Path.MakeFromSVGString(
              `M ${axisXLeft} ${axisYBottom} L ${
                axisXRight - 80
              } ${axisYBottom}`
            )!
          }
          color="white"
          style="stroke"
          strokeWidth={2}
        />
        <Group>
          <LinearGradient
            start={vec(axisXRight - 80, axisYBottom)}
            end={vec(axisXRight, axisYBottom)}
            colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
          />
          <RoundedRect
            x={axisXRight - 80}
            y={axisYBottom - 1}
            width={80}
            height={2}
            r={1}
          />
        </Group>

        {/* linhas leves */}
        {[0.3, 0.5, 0.7, 0.85, 0.1].map((f, i) => (
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

        {/* linha tracejada */}
        <Path
          path={
            Skia.Path.MakeFromSVGString(
              `M ${axisXLeft + 6} ${yBase} L ${axisXRight - 6} ${yBase}`
            )!
          }
          color="rgba(255,255,255,0.9)"
          style="stroke"
          strokeWidth={3}
          strokeCap="round"
        >
          <DashPathEffect intervals={[14, 10]} />
        </Path>

        {/* Curva POSITIVA (Mask + gradiente) */}
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
              end={progGreen}
            />
          }
        >
          <LinearGradient
            start={vec(x0, yBase)}
            end={vec(xEnd, yTop)}
            colors={["#00000000", "#1AEE0E", "#1AEE0E80"]}
            positions={[0.0, 0.55, 1.0]}
          />
          <RoundedRect x={gx} y={gy} width={GW} height={GH} r={0} />
        </Mask>

        {/* Pulso no ponto final */}
        <Circle
          cx={greenEnd.x}
          cy={greenEnd.y}
          r={pulseR as any}
          color="#1AEE0E"
          opacity={pulseOpacity as any}
        />
        {/* Ponto final sólido + anel */}
        <Group>
          <Circle
            cx={greenEnd.x}
            cy={greenEnd.y}
            r={14}
            color="rgba(26,238,14,0.25)"
          />
          <Circle cx={greenEnd.x} cy={greenEnd.y} r={9} color="#1AEE0E" />
          <Circle
            cx={greenEnd.x}
            cy={greenEnd.y}
            r={9}
            style="stroke"
            strokeWidth={2}
            color="#FFFFFF"
          />
        </Group>

        {/* Curva NEGATIVA (Mask + gradiente) */}
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
              end={progRed}
            />
          }
        >
          <LinearGradient
            start={vec(x0, yBase)}
            end={vec(xEnd, yNegEnd)}
            colors={["#00000000", "#1AEE0F", "#EE0F0F", "#EE0F0F00"]}
            positions={[0.0, 0.25, 0.7, 1.0]}
          />
          <RoundedRect x={gx} y={gy} width={GW} height={GH} r={0} />
        </Mask>

        {/* Ponto inicial (Now) */}
        <Group>
          <Circle cx={x0 + 30} cy={yBase} r={15} color="#2F353D" />
          <Circle cx={x0 + 30} cy={yBase} r={6} color="#FFFFFF" />
        </Group>

        {/* ======= SETA PNG (com gap do ponto final, fade + scale) ======= */}
        {arrowImg && (
          <Group
            opacity={arrowOpacity as any}
            transform={[
              { translateX: headTipX },
              { translateY: headTipY },
              // { scale: arrowScale as any }, // <-- REMOVER isto
              { translateX: -headTipX },
              { translateY: -headTipY },
            ]}
          >
            <SkiaImage
              image={arrowImg}
              x={headTipX - targetWidth / 2}
              y={headTipY}
              width={targetWidth}
              height={100}
            />
          </Group>
        )}
      </Canvas>

      {/* Texto “7x” – ao lado dos pés da seta, com scale + fade */}
      <Animated.Text
        style={[
          styles.mult,
          {
            left: headTipX + 15,
            top: targetBottomY - 25,
            opacity: arrowOpacity as any,
            transform: [{ scale: arrowScale as any }], // 👍 scale no RN, não no Skia
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
    overflow: "visible",
  },
  sexLabel: {
    position: "absolute",
    height: 32,
    width: 130,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  sexGrad: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  sexText: {
    backgroundColor: "#000",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  now: {
    position: "absolute",
    backgroundColor: "#3F4650",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nowText: { color: "#FFFFFF", fontWeight: "700" },
  mult: {
    position: "absolute",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
});

export default Content;
