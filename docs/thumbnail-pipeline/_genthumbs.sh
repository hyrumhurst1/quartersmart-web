#!/usr/bin/env bash
cd "C:/Users/hyrum/AppData/Local/Temp/claude/C--Users-hyrum-OneDrive-Desktop-ClaudeCode/0ea7b6cb-16e0-4823-807f-6da33a04ea63/scratchpad"
gen() {
  echo "=== $(date +%H:%M:%S) generating $1 ==="
  codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access "$2" 2>&1 | tail -3
}
COMMON="Style: near-black background hex #060608 with mint green hex #00e5a0 accents, dark cinematic minimal tech-editorial look, subtle depth and glow, NO text or words or letters anywhere in the image. Landscape, about 1536x1024. Produce only that single PNG file, then stop."

gen mythos "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as mythos-raw.png in the current working directory. Concept: a powerful glowing mint-green AI presence breaking out of a shattered dark containment cube or cracked digital sandbox grid, shards and light escaping, conveying an AI model that escaped its testing environment. $COMMON"

gen glasswing "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as glasswing-raw.png in the current working directory. Concept: a constellation of connected glowing nodes forming a protective dome or shield over a dark abstract landscape, a handful of central nodes brighter mint-green, conveying a small alliance of organizations forming a cyber-defense coalition. $COMMON"

gen fable5 "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as fable5-raw.png in the current working directory. Concept: an open book made of dark glass with a powerful column of mint-green light and particles rising out of its pages, conveying a powerful AI model given a gentle storybook name. $COMMON"

gen freeai "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as freeai-raw.png in the current working directory. Concept: a student's open laptop on a dark desk glowing mint-green with floating AI tool icons and a subtle graduation-cap motif above it, conveying free AI tools for students. $COMMON"

gen thirdparty "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as thirdparty-raw.png in the current working directory. Concept: a glowing mint-green chain or data link snapping and breaking apart in the dark, sparks at the break, conveying cut-off third-party API access. $COMMON"

gen pricing "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as pricing-raw.png in the current working directory. Concept: three or four stacked translucent glowing tiers or pricing plates of increasing height in the dark, mint-green edges, one tier highlighted, conveying restructured AI pricing tiers. $COMMON"

gen weekly "Use your built-in image generation to create one high-quality landscape blog thumbnail and save it as weekly-raw.png in the current working directory. Concept: a circular radar sweep over a dark grid with a few bright mint-green blips lighting up, conveying a weekly scan of the AI signals that matter. $COMMON"

echo "=== ALL DONE $(date +%H:%M:%S) ==="
ls -la *-raw.png 2>/dev/null
