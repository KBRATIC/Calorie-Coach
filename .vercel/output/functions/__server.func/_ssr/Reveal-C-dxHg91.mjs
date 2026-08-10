import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-CCQEfgNs.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Reveal-C-dxHg91.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Card com brilho que segue o cursor (estilo reactbits Spotlight Card). */
function SpotlightCard({ children, className }) {
	const ref = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		onMouseMove: (e) => {
			const el = ref.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
			el.style.setProperty("--my", `${e.clientY - rect.top}px`);
			el.style.setProperty("--spot-opacity", "1");
		},
		onMouseLeave: () => ref.current?.style.setProperty("--spot-opacity", "0"),
		className: cn("spotlight-card", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10",
			children
		})
	});
}
/** Número que anima até o valor final (estilo reactbits Count Up). */
function CountUp({ value, duration = 700, decimals = 0, className }) {
	const [display, setDisplay] = (0, import_react.useState)(value);
	const fromRef = (0, import_react.useRef)(value);
	const rafRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const from = fromRef.current;
		const start = performance.now();
		const tick = (now) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - t, 3);
			setDisplay(from + (value - from) * eased);
			if (t < 1) rafRef.current = requestAnimationFrame(tick);
			else fromRef.current = value;
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [value, duration]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: display.toFixed(decimals)
	});
}
/** Entrada suave ao montar (estilo reactbits Animated Content). */
function Reveal({ children, delay = 0, y = 18, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			delay,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className,
		children
	});
}
//#endregion
export { Reveal as n, SpotlightCard as r, CountUp as t };
