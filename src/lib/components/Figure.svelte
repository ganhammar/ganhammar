<script lang="ts">
	/**
	 * Fig. 1 — the delivery path as an exploded technical drawing.
	 *
	 * The geometry is computed here rather than hand-drawn, so the stack can be
	 * re-described by editing PLATES alone. It runs once during prerender and
	 * ships as plain SVG markup: no client-side cost.
	 */
	const PLATES = [
		{ label: 'Viewer' },
		{ label: 'Edge cache' },
		{ label: 'Object store' },
		{ label: 'Build output' },
		{ label: 'Post source' }
	];

	// Dimetric rather than true isometric: flattening the vertical scale keeps
	// each plate's projected height under GAP, so the parts read as separated.
	const W = 190;
	const D = 118;
	const T = 8;
	const GAP = 112;
	const CX = 330;
	const CY0 = 64;
	const K = Math.cos(Math.PI / 6);
	const YS = 0.28;
	const LEADER_X = 690;
	// Horizontal run from the plate corner before the leader turns and heads
	// out to the numeral.
	const LEADER_STEP = 28;
	// SVG text cannot be measured at build time, so the right edge of the
	// viewBox allows a fixed span for the longest part label.
	const LABEL_SPAN = 120;
	const MARGIN = 20;

	const iso = (cy: number, x: number, y: number): [number, number] => [
		CX + (x - y) * K,
		cy + (x + y) * YS
	];
	const pt = ([x, y]: [number, number]) => `${x.toFixed(1)},${y.toFixed(1)}`;

	const plates = PLATES.map((plate, i) => {
		const cy = CY0 + i * GAP;
		const a = iso(cy, 0, 0);
		const b = iso(cy, W, 0);
		const c = iso(cy, W, D);
		const d = iso(cy, 0, D);
		const down = ([x, y]: [number, number]): [number, number] => [x, y + T];

		// c is the near-bottom corner of the plate; the arrow drops from just
		// under it into the gap above the next plate.
		const arrowTop = c[1] + T + 4;
		const arrowTip = arrowTop + GAP - ((W + D) * YS + T) - 6;
		const turn = b[1] - 16;

		return {
			...plate,
			n: i + 1,
			left: `${pt(d)} ${pt(c)} ${pt(down(c))} ${pt(down(d))}`,
			right: `${pt(b)} ${pt(c)} ${pt(down(c))} ${pt(down(b))}`,
			top: `${pt(a)} ${pt(b)} ${pt(c)} ${pt(d)}`,
			// Out from the corner, up, then straight across to the numeral.
			leader: `M${pt(b)} L${(b[0] + LEADER_STEP).toFixed(1)},${turn.toFixed(1)} L${LEADER_X},${turn.toFixed(1)}`,
			dot: b,
			labelY: b[1],
			arrow: i < PLATES.length - 1 ? { top: arrowTop, tip: arrowTip } : null
		};
	});

	const lastCy = CY0 + (PLATES.length - 1) * GAP;
	const top = CY0 - 26;
	const bottom = lastCy + (W + D) * YS + T + 30;
	const bounds = {
		x: CX - K * D - MARGIN,
		y: top - MARGIN,
		right: LEADER_X + LABEL_SPAN,
		bottom: bottom + MARGIN
	};
	const viewBox = `${bounds.x.toFixed(1)} ${bounds.y.toFixed(1)} ${(bounds.right - bounds.x).toFixed(1)} ${(bounds.bottom - bounds.y).toFixed(1)}`;
</script>

<figure class="figure">
	<svg {viewBox} role="img" aria-label="Exploded view of the delivery path for a page request">
		<g fill="none" stroke="#9ba1a7" stroke-width=".7" stroke-dasharray="14 4 2.5 4">
			<line x1={CX} y1={top} x2={CX} y2={bottom} />
		</g>

		{#each plates as plate (plate.n)}
			<polygon points={plate.left} fill="#eeeff0" stroke="#14161a" stroke-width="1" />
			<polygon points={plate.right} fill="#eeeff0" stroke="#14161a" stroke-width="1" />
			<polygon points={plate.top} fill="#fbfbf9" stroke="#14161a" stroke-width="1" />

			<path d={plate.leader} fill="none" stroke="#14161a" stroke-width=".6" />
			<circle cx={plate.dot[0]} cy={plate.dot[1]} r="2.1" fill="#14161a" />
			<text
				x={LEADER_X + 9}
				y={plate.labelY - 13}
				font-size="17"
				letter-spacing=".06em"
				fill="#14161a">{plate.n}</text
			>
			<text
				x={LEADER_X + 9}
				y={plate.labelY + 3}
				font-size="12.4"
				letter-spacing=".16em"
				fill="#565b62">{plate.label.toUpperCase()}</text
			>

			{#if plate.arrow}
				<path
					d="M{CX},{plate.arrow.top.toFixed(1)} L{CX},{plate.arrow.tip.toFixed(1)}"
					fill="none"
					stroke="#9ba1a7"
					stroke-width=".5"
				/>
				<path
					d="M{CX - 3.4},{(plate.arrow.tip - 5).toFixed(1)} L{CX + 3.4},{(
						plate.arrow.tip - 5
					).toFixed(1)} L{CX},{plate.arrow.tip.toFixed(1)} Z"
					fill="#14161a"
				/>
			{/if}
		{/each}
	</svg>
	<figcaption><b>Fig. 1</b> — Delivery path, request descending</figcaption>
</figure>

<style>
	svg text {
		font-family: 'Avenir Next Condensed', 'Helvetica Neue', 'Segoe UI', system-ui, sans-serif;
	}
</style>
