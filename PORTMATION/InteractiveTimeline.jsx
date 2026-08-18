import React, { useEffect, useRef, useState } from 'react';
import kaplay from 'kaplay';

import bgImage from './assets/game_background.png';
import boyIdle from './assets/user_boy(breathing).png';
import boyWalk from './assets/user_boy(walking animation).png';
import girlIdle from './assets/user_girl(breathing).png';
import girlWalk from './assets/user_girl(walking).png';
import npcIdle from './assets/NPC(breathing).png';
import npcWalk from './assets/NPC(walking).png';
import npcSpeaking from './assets/NPC(speaking).png';
import floorTile from './assets/tile39.png';
import bldg10th from './assets/10th.png';
import bldg12th from './assets/12th.png';
import bldgBachelor from './assets/bachelor.png';
import bigGreenTree from './assets/big_green_tree.png';
import greenBush from './assets/green_bush.png';
import treeIdle from './assets/big_green_tree(idle).png';
import bushIdle from './assets/green_bush(idle).png';
import barricade from './assets/road_block.png';
import roadClosedSign from './assets/road_close.png';
import cone from './assets/cone.png';
import shovelMud from './assets/shovel_mud.png';
import cementTruck from './assets/cement_truck.png';
import birdImg from './assets/bird.png';
import cloudBird from './assets/cloud_bird.png';
import catIdle from './assets/cat(idle).png';
import catWalk from './assets/cat(walking).png';
import gameTitleImg from './assets/game_title.png';
import userBoyBreathing from './assets/user_boy(breathing).png';
import userBoyWalking from './assets/user_boy(walking animation).png';
import userGirlBreathing from './assets/user_girl(breathing).png';
import userGirlWalking from './assets/user_girl(walking).png';

const PORTMATION = () => {
    let globalPlayerName = "GUEST";
    let globalPlayerModel = "boy";
    const wrapperRef = useRef(null);
    const controlsRef = useRef({ left: false, right: false, interact: false });
    const [isGameScene, setIsGameScene] = useState(false);

    useEffect(() => {
        if (!wrapperRef.current) return;

        wrapperRef.current.innerHTML = '';

        // Create an inner wrapper that scales identically to the canvas using aspect-ratio
        const innerWrapper = document.createElement("div");
        innerWrapper.style.position = 'relative';
        innerWrapper.style.width = '100%';
        innerWrapper.style.height = '100%'; // Replaced aggressive aspectRatio and maxWidth limits to enforce full fullscreen!
        innerWrapper.style.margin = '0 auto';

        const canvas = document.createElement("canvas");
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        const uiLayer = document.createElement("div");
        uiLayer.style.position = 'absolute';
        uiLayer.style.top = '0';
        uiLayer.style.left = '0';
        uiLayer.style.width = '100%';
        uiLayer.style.height = '100%';
        uiLayer.style.pointerEvents = 'none';

        innerWrapper.appendChild(canvas);
        innerWrapper.appendChild(uiLayer);
        wrapperRef.current.appendChild(innerWrapper);

        // RPG Text Box
        const speechBubble = document.createElement('div');
        speechBubble.style.position = 'absolute';
        speechBubble.style.display = 'none';
        speechBubble.style.background = 'black';
        speechBubble.style.color = 'white';
        speechBubble.style.border = '4px solid white';
        speechBubble.style.padding = '20px';
        speechBubble.style.borderRadius = '8px';
        speechBubble.style.fontFamily = '"Courier New", Courier, monospace';
        speechBubble.style.fontSize = '18px';
        speechBubble.style.fontWeight = 'bold';
        speechBubble.style.width = '90%';
        speechBubble.style.maxWidth = '600px';
        speechBubble.style.zIndex = '1000';
        speechBubble.style.left = '50%';
        speechBubble.style.transform = 'translateX(-50%)';
        speechBubble.style.whiteSpace = 'pre-wrap';
        speechBubble.style.wordWrap = 'break-word';
        speechBubble.className = "speech-box";
        speechBubble.style.pointerEvents = 'auto';
        speechBubble.style.cursor = 'pointer';
        speechBubble.onclick = () => {
            // Re-use the master interact bus to advance pages when the dialog box is natively tapped
            controlsRef.current.interact = true;
            setTimeout(() => { controlsRef.current.interact = false; }, 150);
        };

        // Text Container
        const speechText = document.createElement('div');
        speechBubble.appendChild(speechText);

        // Blinking Down Arrow (RPG continue prompt)
        const speechArrow = document.createElement('div');
        speechArrow.style.position = 'absolute';
        speechArrow.style.bottom = '10px';
        speechArrow.style.right = '15px';
        speechArrow.style.display = 'none'; // Only shows when text finishes
        speechArrow.innerText = '▼';
        speechArrow.style.color = 'white';
        speechArrow.style.fontSize = '20px';
        speechArrow.style.animation = 'blink 1s steps(2, start) infinite';
        speechBubble.appendChild(speechArrow);

        // --- CHOICES UI ---
        const choicesContainer = document.createElement('div');
        choicesContainer.style.marginTop = '20px';
        choicesContainer.style.display = 'none';

        const choiceNo = document.createElement('div');
        choiceNo.style.padding = '8px 0';
        choiceNo.id = 'choice-no';

        const choiceYes = document.createElement('div');
        choiceYes.style.padding = '8px 0';
        choiceYes.id = 'choice-yes';

        // Override speechBubble default click explicitly on these choices!
        choiceNo.onclick = (e) => {
            e.stopPropagation();
            window.rpgChoiceSelection = 0;
            controlsRef.current.interact = true;
            setTimeout(() => { controlsRef.current.interact = false; }, 150);
        };
        choiceYes.onclick = (e) => {
            e.stopPropagation();
            window.rpgChoiceSelection = 1;
            controlsRef.current.interact = true;
            setTimeout(() => { controlsRef.current.interact = false; }, 150);
        };

        choicesContainer.appendChild(choiceNo);
        choicesContainer.appendChild(choiceYes);
        speechBubble.appendChild(choicesContainer);

        // Add CSS keyframes for blinking
        const styleSheet = document.createElement('style');
        styleSheet.innerText = '@keyframes blink { to { visibility: hidden; } }';
        document.head.appendChild(styleSheet);

        uiLayer.appendChild(speechBubble);

        // Interaction Prompt
        const enterPrompt = document.createElement('div');
        enterPrompt.style.position = 'absolute';
        enterPrompt.style.display = 'none';
        enterPrompt.style.background = 'rgba(0,0,0,0.8)';
        enterPrompt.style.color = 'yellow';
        enterPrompt.style.padding = '5px 10px';
        enterPrompt.style.borderRadius = '5px';
        enterPrompt.style.fontFamily = '"Courier New", Courier, monospace';
        enterPrompt.style.fontWeight = "bold";
        enterPrompt.style.cursor = "pointer";
        enterPrompt.style.pointerEvents = "auto";
        enterPrompt.onclick = () => {
            controlsRef.current.interact = true;
            setTimeout(() => { controlsRef.current.interact = false; }, 150);
        };
        enterPrompt.style.fontSize = '14px';
        enterPrompt.style.zIndex = '999';
        enterPrompt.style.transform = 'translate(-50%, -100%)';
        enterPrompt.innerText = "[ PRESS ENTER ]";
        uiLayer.appendChild(enterPrompt);



        const k = kaplay({
            canvas: canvas,
            width: window.innerWidth, // Natively bind directly to the hardware viewport size to obliterate pillars!
            height: window.innerHeight,
            global: false,
            background: [188, 210, 244], // Set native background to exactly match the top of game_background.png
            touchToMouse: true,
        });

        // Inject on-screen error reporter in case KAPLAY crashes
        k.onError((err) => {
            console.error("KAPLAY CRASH:", err);
            const errBox = document.createElement('div');
            errBox.style.position = 'absolute';
            errBox.style.top = '10px';
            errBox.style.left = '10px';
            errBox.style.color = 'red';
            errBox.style.background = 'black';
            errBox.style.padding = '10px';
            errBox.style.fontWeight = 'bold';
            errBox.innerText = "KAPLAY ERROR: " + String(err);
            if (wrapperRef.current) wrapperRef.current.appendChild(errBox);
        });

        try {
            // Scene Construction: Gravity
            k.setGravity(1600);

            // Background
            k.loadSprite("bg", bgImage);

            k.loadSprite("player_idle", userBoyBreathing, {
                sliceX: 2,
                sliceY: 1,
                anims: { idle: { from: 0, to: 1, loop: true, speed: 3 } }
            });

            // Cat and new Bird Animations
            k.loadSprite("cat_idle", catIdle, { sliceX: 1, sliceY: 4, anims: { idle: { from: 0, to: 3, loop: true, speed: 8 } } });
            k.loadSprite("cat_walk", catWalk, { sliceX: 2, sliceY: 3, anims: { walk: { from: 0, to: 4, loop: true, speed: 10 } } });
            k.loadSprite("cloud_bird", cloudBird, { sliceX: 2, sliceY: 2, anims: { fly: { from: 0, to: 3, loop: true, speed: 8 } } });

            // Main Player (Boy) Walk
            k.loadSprite("player_walk", userBoyWalking, {
                sliceX: 3,
                sliceY: 2,
                anims: { walk: { from: 0, to: 3, loop: true, speed: 10 } }
            });

            // Alternative Player (Girl) Idle
            k.loadSprite("girl_idle", userGirlBreathing, {
                sliceX: 2,
                sliceY: 1,
                anims: { idle: { from: 0, to: 1, loop: true, speed: 3 } }
            });

            // Alternative Player (Girl) Walk
            k.loadSprite("girl_walk", userGirlWalking, {
                sliceX: 3,
                sliceY: 2,
                anims: { walk: { from: 0, to: 3, loop: true, speed: 10 } }
            });

            // NPC Idle
            k.loadSprite("npc_idle", npcIdle, {
                sliceX: 2,
                sliceY: 1,
                anims: { idle: { from: 0, to: 1, loop: true, speed: 3 } }
            });

            // NPC Walk
            k.loadSprite("npc_walk", npcWalk, {
                sliceX: 3,
                sliceY: 2,
                anims: { walk: { from: 0, to: 3, loop: true, speed: 10 } }
            });

            // NPC Speaking
            k.loadSprite("npc_speaking", npcSpeaking, {
                sliceX: 2,
                sliceY: 1,
                anims: { talk: { from: 0, to: 1, loop: true, speed: 6 } }
            });
            k.loadSprite("dirt", floorTile);
            k.loadSprite("bldg_10th", bldg10th, {
                sliceX: 2, sliceY: 2, anims: { idle: { from: 0, to: 3, loop: true, speed: 4 } }
            });
            k.loadSprite("bldg_12th", bldg12th); // Single building frame!
            k.loadSprite("bldg_bachelor", bldgBachelor, {
                sliceX: 2, sliceY: 2, anims: { idle: { from: 0, to: 3, loop: true, speed: 4 } }
            });
            k.loadSprite("tree", bigGreenTree, {
                sliceX: 2, sliceY: 2, anims: { idle: { from: 0, to: 3, loop: true, speed: 4 } }
            });
            k.loadSprite("bush", greenBush, {
                sliceX: 2, sliceY: 2, anims: { idle: { from: 0, to: 3, loop: true, speed: 4 } }
            });
            k.loadSprite("tree_idle", treeIdle);
            k.loadSprite("bush_idle", bushIdle);
            k.loadSprite("barricade", barricade);
            k.loadSprite("sign", roadClosedSign);
            k.loadSprite("cone", cone);
            k.loadSprite("shovel", shovelMud);
            k.loadSprite("truck", cementTruck, {
                sliceX: 3, sliceY: 4, anims: { idle: { from: 0, to: 11, loop: true, speed: 6 } }
            });
            k.loadSprite("bird", birdImg, {
                sliceX: 1, sliceY: 3, anims: { fly: { from: 0, to: 2, loop: true, speed: 6 } }
            });
            k.loadSprite("game_title", gameTitleImg);

            // Custom Kaplay Component: Animates sprites intelligently only when currently visible on screen!
            function viewCuller(animSpriteName) {
                return {
                    id: "viewCuller",
                    isIdle: true,
                    update() { // Kaplay calls this natively every frame for ANY entity it is attached to!
                        const dist = Math.abs(this.pos.x - k.getCamPos().x);
                        // Trigger visually rich animations ONLY when entering a generous 1200px frustum radius
                        if (dist < 1200) {
                            if (this.isIdle) {
                                this.isIdle = false;
                                this.use(k.sprite(animSpriteName));
                                this.play("idle");
                            }
                        } else {
                            if (!this.isIdle) {
                                this.isIdle = true;
                                this.use(k.sprite(`${animSpriteName}_idle`));
                            }
                        }
                    }
                };
            }

            const isScaleMobile = window.innerWidth <= 768 || window.innerHeight <= 500;

            // Title Scene
            k.scene("title", () => {
                setIsGameScene(false);
                k.setGravity(0);

                // Add seamless sky background
                const isTinyMobile = window.innerWidth <= 768;
                const dynBgScale = isTinyMobile ? 1.0 : 1.8;

                const titleBgs = [];
                for (let i = 0; i < 5; i++) {
                    titleBgs.push(k.add([k.sprite("bg"), k.pos(0, 0), k.scale(dynBgScale), k.z(-1)]));
                }

                // Add procedural dirt to mirror game view
                for (let x = 0; x < 60; x++) {
                    k.add([k.sprite("dirt"), k.pos(x * 86.4, 530), k.scale(1.8), k.z(0)]);
                }

                // Add endless soil block
                k.add([k.rect(6000, 2000), k.pos(0, 580), k.color(27, 18, 30), k.z(-1)]);

                let tBgAligned = false;
                k.onUpdate(() => {
                    // Mobile-Aware Camera Auto-Zoom/Pan to flawlessly mirror Game Scene!
                    const isMobilePortrait = window.innerHeight > window.innerWidth && window.innerWidth <= 768;
                    const isMobileLandscape = window.innerHeight < window.innerWidth && window.innerHeight <= 500;
                    let targetZoom = 0.85;
                    let targetCamY = 270; // Slightly lower than default, perfectly concealing the black void!
                    if (isMobilePortrait) {
                        targetZoom = 1.35; targetCamY = 380;
                    } else if (isMobileLandscape) {
                        targetZoom = 0.75; targetCamY = 220;
                    }
                    k.setCamScale(k.vec2(targetZoom, targetZoom));
                    const visibleWidth = k.width() / targetZoom;
                    k.setCamPos(visibleWidth / 2, targetCamY);

                    // Align background tiles
                    if (!tBgAligned && titleBgs[0] && titleBgs[0].width > 0) {
                        const scaledW = titleBgs[0].width * dynBgScale;
                        const scaledH = titleBgs[0].height * dynBgScale;
                        titleBgs.forEach((bg, i) => {
                            bg.pos.x = i * (scaledW - 2);
                            bg.pos.y = 560 - scaledH;
                        });
                        tBgAligned = true;
                        tBgAligned = true;
                    }
                });

                // Add the visible dirt tiles right beneath the grass to cover the canvas floor seam exactly like the Game!
                for (let x = 0; x < 60; x++) {
                    k.add([k.sprite("dirt"), k.pos(x * 86.4, 530), k.scale(1.8), k.z(-1)]);
                }

                // Deep Soil
                k.add([k.rect(6000, 2000), k.pos(0, 580), k.color(27, 18, 30), k.z(-1)]);

                // Occasional Bird Flock logic
                const spawnTitleFlock = () => {
                    k.wait(k.rand(2, 5), () => {
                        const startY = k.rand(50, k.height() * 0.4);
                        const spawnTitleBird = (offsetY, delay, isLeader) => {
                            k.wait(delay, () => {
                                const isCloud = k.chance(0.5);
                                const b = k.add([
                                    k.sprite(isCloud ? "cloud_bird" : "bird", { flipX: true }), // Flipped to face right!
                                    k.pos(-100, startY + offsetY),
                                    k.scale(isScaleMobile ? (isCloud ? 1.5 : 0.9) : (isCloud ? 2.0 : 1.0)),
                                    k.z(-0.5) // Birds physically render natively BEHIND the Arcade Window!
                                ]);
                                b.play("fly");
                                b.onUpdate(() => {
                                    b.move(140, -10);
                                    const camRight = k.getCamPos().x + (k.width() / 2 / k.getCamScale().x) + 200;
                                    if (b.pos.x > camRight) {
                                        b.destroy();
                                        if (isLeader) spawnTitleFlock(); // Only leader triggers next flock
                                    }
                                });
                            });
                        };
                        spawnTitleBird(0, 0, true);
                        if (k.chance(0.4)) spawnTitleBird(k.rand(-120, 120), k.rand(1.2, 2.5), false);
                    });
                };
                spawnTitleFlock();

                // Milo wandering around Title Screen!
                const titleMilo = k.add([
                    k.sprite("cat_walk"),
                    k.pos(k.width() / 2, isScaleMobile ? 540 : 550),
                    k.scale(isScaleMobile ? 0.7 : 0.8),
                    k.anchor("bot"),
                    k.z(5),
                ]);
                titleMilo.play("walk");

                titleMilo.onUpdate(() => {
                    titleMilo.move(titleMilo.flipX ? -80 : 80, 0);
                    const camScale = k.getCamScale().x;
                    const camW = k.width() / camScale;
                    const camX = k.getCamPos().x;
                    const leftBound = camX - (camW / 2) + 50;
                    const rightBound = camX + (camW / 2) - 50;

                    if (titleMilo.pos.x > rightBound) titleMilo.flipX = true;
                    if (titleMilo.pos.x < leftBound) titleMilo.flipX = false;
                });

                // Title Graphic
                const targetTitleY = k.height() / 2 - (isScaleMobile ? 70 : 80);
                const titleGraphic = k.add([
                    k.sprite("game_title"),
                    k.pos(k.width() / 2, -200), // Start completely off-screen above!
                    k.anchor("center"),
                    k.scale(isScaleMobile ? 1.1 : 1.4),
                    k.fixed(),
                    k.z(20) // Forces the giant logo to be physically in front of all world objects
                ]);

                // 1. Drop from above with a bounce effect
                k.tween(-200, targetTitleY, 1.2, (val) => {
                    titleGraphic.pos.y = val;
                }, k.easings.easeOutBounce).onEnd(() => {
                    // 2. Seamlessly transition into an infinite hovering bob! (2px up/down)
                    titleGraphic.onUpdate(() => {
                        titleGraphic.pos.y = targetTitleY + Math.sin(k.time() * 4) * 3;
                    });
                });

                // Prompt
                const titlePrompt = k.add([
                    k.text(isScaleMobile ? "Tap to Start" : "Press ENTER to Start", { size: isScaleMobile ? 24 : 32 }),
                    k.pos(k.width() / 2, k.height() / 2 + (isScaleMobile ? 80 : 80)),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                    k.opacity(1),
                    k.fixed(),
                    k.z(20), // Stay on top of birds
                    {
                        update() {
                            this.opacity = Math.sin(k.time() * 6) > 0 ? 1 : 0;
                        }
                    }
                ]);

                let selectionState = "TITLE";

                const actionConfirm = () => {
                    if (selectionState === "TITLE") {
                        selectionState = "CHOOSE";
                        titleGraphic.hidden = true;
                        titlePrompt.hidden = true;
                    } else if (selectionState === "CHOOSE") {
                        selectionState = "NAME";
                    } else if (selectionState === "NAME") {
                        if (globalPlayerName === "" || globalPlayerName === "GUEST") globalPlayerName = "GUEST";
                        k.go("game");
                    }
                };

                k.onKeyPress("enter", actionConfirm);
                k.onClick((pos) => {
                    // If clicking anywhere in title, go to choose
                    if (selectionState === "TITLE") actionConfirm();
                });

                // Tag-based Native Hider!
                k.onUpdate("select_ui", (ui) => {
                    // The custom update loops natively overwrite this for the dynamic elements (like characters).
                    // But for the static rectangles (bg, shadow, etc), this serves as the global toggle!
                    if (selectionState === "TITLE") {
                        ui.hidden = true;
                    } else if (!ui.hasCustomUpdate) {
                        ui.hidden = false;
                    }
                });

                // --- 8-bit Window Setup ---
                const boxW = isScaleMobile ? Math.min(450, k.width() - 40) : 540;
                const boxH = isScaleMobile ? 250 : 330;

                const uiOffsetY = isScaleMobile ? 0 : -70; // Push UI completely off the grass dynamically for Desktop!
                const centerY = k.height() / 2 + uiOffsetY;

                const titleY = isScaleMobile ? -105 : -130;
                const arrowY = isScaleMobile ? -75 : -80;
                const charY = isScaleMobile ? -20 : -30;
                const labelY = isScaleMobile ? 55 : 45;
                const promptY = isScaleMobile ? 95 : 125; // Pull prompt up snugly interior to the box!

                const charOffsetX = isScaleMobile ? 70 : 100;

                // Drop shadow
                k.add([
                    k.rect(boxW, boxH),
                    k.pos(k.width() / 2 + 10, centerY + 10),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                    k.opacity(0.6),
                    k.fixed(),
                    k.z(0),
                    "select_ui",
                    { hasCustomUpdate: false } // Flag for global toggle!
                ]);

                // Main Window Background
                k.add([
                    k.rect(boxW, boxH),
                    k.pos(k.width() / 2, centerY),
                    k.anchor("center"),
                    k.color(10, 20, 60), // Deep rich Arcade Blue 
                    k.outline(6, k.rgb(255, 255, 255)),
                    k.fixed(),
                    k.z(1),
                    "select_ui",
                    { hasCustomUpdate: false }
                ]);

                // Title
                k.add([
                    k.text("CHOOSE CHARACTER", { size: isScaleMobile ? 24 : 36, font: "monospace" }),
                    k.pos(k.width() / 2, centerY + titleY),
                    k.anchor("center"),
                    k.color(255, 255, 0),
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    {
                        hasCustomUpdate: true, // Prevent universal toggle override
                        update() {
                            this.text = selectionState === "CHOOSE" ? "CHOOSE CHARACTER" : "WHO ARE YOU?";
                            this.hidden = selectionState === "TITLE";
                        }
                    }
                ]);

                const charScale = isScaleMobile ? 1.8 : 2.0;

                const plateW = isScaleMobile ? 80 : 100;
                const plateH = isScaleMobile ? 90 : 110;

                const boyPlate = k.add([
                    k.rect(plateW, plateH),
                    k.pos(k.width() / 2 - charOffsetX, centerY + charY),
                    k.anchor("center"),
                    k.color(10, 10, 50),
                    k.outline(4, k.rgb(100, 100, 100)),
                    k.area(), // Interactive!
                    k.fixed(),
                    k.z(2),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            if (selectionState === "TITLE") {
                                this.hidden = true;
                            } else if (selectionState === "NAME") {
                                this.hidden = globalPlayerModel !== "boy";
                                if (!this.hidden) this.pos.x = k.width() / 2;
                            } else {
                                this.hidden = false;
                                this.pos.x = k.width() / 2 - charOffsetX;
                            }

                            // Mouse Hover Support
                            if (this.isHovering() && selectionState === "CHOOSE") {
                                globalPlayerModel = "boy";
                            }

                            if (globalPlayerModel === "boy") {
                                this.use(k.outline(4, k.rgb(255, 255, 0))); // Golden Highlight
                                this.use(k.color(30, 30, 100)); // active blue inner
                            } else {
                                this.use(k.outline(4, k.rgb(100, 100, 100))); // dull border
                                this.use(k.color(10, 10, 50)); // dull inner
                            }
                        }
                    }
                ]);

                // Dedicated Click
                boyPlate.onClick(() => {
                    if (selectionState === "CHOOSE") {
                        globalPlayerModel = "boy";
                        selectionState = "NAME";
                    }
                });

                // Draw Models
                const boyGraphic = k.add([
                    k.sprite("player_idle"),
                    k.pos(k.width() / 2 - charOffsetX, centerY + charY),
                    k.anchor("center"),
                    k.scale(charScale),
                    k.fixed(),
                    k.z(3),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            if (selectionState === "TITLE") {
                                this.hidden = true;
                            } else if (selectionState === "NAME") {
                                this.anim = "walk";
                                this.hidden = globalPlayerModel !== "boy";
                                if (!this.hidden) this.pos.x = k.width() / 2;
                            } else {
                                this.anim = "idle";
                                this.hidden = false;
                                this.pos.x = k.width() / 2 - charOffsetX;
                            }
                        }
                    }
                ]);
                boyGraphic.play("idle");

                const boyLabel = k.add([
                    k.text("BOY", { size: 16 }), k.pos(k.width() / 2 - charOffsetX, centerY + labelY), k.anchor("center"), k.fixed(), k.z(5), "select_ui",
                    { hasCustomUpdate: true, update() { this.hidden = selectionState === "NAME" || selectionState === "TITLE"; } }
                ]);

                const girlPlate = k.add([
                    k.rect(plateW, plateH),
                    k.pos(k.width() / 2 + charOffsetX, centerY + charY),
                    k.anchor("center"),
                    k.color(10, 10, 50),
                    k.outline(4, k.rgb(100, 100, 100)),
                    k.area(), // Interactive!
                    k.fixed(),
                    k.z(2),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            if (selectionState === "TITLE") {
                                this.hidden = true;
                            } else if (selectionState === "NAME") {
                                this.hidden = globalPlayerModel !== "girl";
                                if (!this.hidden) this.pos.x = k.width() / 2;
                            } else {
                                this.hidden = false;
                                this.pos.x = k.width() / 2 + charOffsetX;
                            }

                            // Mouse Hover Support
                            if (this.isHovering() && selectionState === "CHOOSE") {
                                globalPlayerModel = "girl";
                            }

                            if (globalPlayerModel === "girl") {
                                this.use(k.outline(4, k.rgb(255, 255, 0))); // Golden Highlight
                                this.use(k.color(30, 30, 100)); // active blue inner
                            } else {
                                this.use(k.outline(4, k.rgb(100, 100, 100))); // dull border
                                this.use(k.color(10, 10, 50)); // dull inner
                            }
                        }
                    }
                ]);

                // Dedicated Click
                girlPlate.onClick(() => {
                    if (selectionState === "CHOOSE") {
                        globalPlayerModel = "girl";
                        selectionState = "NAME";
                    }
                });

                const girlGraphic = k.add([
                    k.sprite("girl_idle"),
                    k.pos(k.width() / 2 + charOffsetX, centerY + charY),
                    k.anchor("center"),
                    k.scale(charScale),
                    k.fixed(),
                    k.z(3),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            if (selectionState === "TITLE") {
                                this.hidden = true;
                            } else if (selectionState === "NAME") {
                                this.anim = "walk";
                                this.hidden = globalPlayerModel !== "girl";
                                if (!this.hidden) this.pos.x = k.width() / 2;
                            } else {
                                this.anim = "idle";
                                this.hidden = false;
                                this.pos.x = k.width() / 2 + charOffsetX;
                            }
                        }
                    }
                ]);
                girlGraphic.play("idle");

                const girlLabel = k.add([
                    k.text("GIRL", { size: 16 }), k.pos(k.width() / 2 + charOffsetX, centerY + labelY), k.anchor("center"), k.fixed(), k.z(5), "select_ui",
                    { hasCustomUpdate: true, update() { this.hidden = selectionState === "NAME" || selectionState === "TITLE"; } }
                ]);

                // Selector Arrow
                const selector = k.add([
                    k.text("▼", { size: 24 }),
                    k.pos(k.width() / 2 - charOffsetX, centerY + arrowY),
                    k.anchor("center"),
                    k.color(0, 255, 0),
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            this.hidden = selectionState === "NAME" || selectionState === "TITLE"; // Hide when naming!
                            if (!this.hidden) {
                                this.pos.y = (centerY + arrowY) + Math.sin(k.time() * 8) * 5;
                                this.pos.x = globalPlayerModel === "boy" ? (k.width() / 2 - charOffsetX) : (k.width() / 2 + charOffsetX);
                            }
                        }
                    }
                ]);

                const toggleSelection = () => {
                    if (selectionState === "CHOOSE") {
                        globalPlayerModel = globalPlayerModel === "boy" ? "girl" : "boy";
                    }
                };

                k.onKeyPress("left", toggleSelection);
                k.onKeyPress("right", toggleSelection);
                k.onKeyPress("a", toggleSelection);
                k.onKeyPress("d", toggleSelection);

                // Name Input section (Hidden initially)
                const nameLabel = k.add([
                    k.text("NAME:", { size: isScaleMobile ? 18 : 24, font: "monospace" }),
                    k.pos(k.width() / 2 - 120, centerY + 50),
                    k.anchor("left"),
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    { hasCustomUpdate: true, update() { this.hidden = selectionState === "CHOOSE" || selectionState === "TITLE"; } }
                ]);

                const nameText = k.add([
                    k.text(globalPlayerName === "GUEST" ? "" : globalPlayerName, { size: isScaleMobile ? 18 : 24, font: "monospace" }),
                    k.pos(k.width() / 2 - 40, centerY + 50),
                    k.anchor("left"),
                    k.color(0, 255, 255),
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    { hasCustomUpdate: true, update() { this.hidden = selectionState === "CHOOSE" || selectionState === "TITLE"; } }
                ]);

                k.onCharInput((ch) => {
                    if (selectionState === "NAME") {
                        if (globalPlayerName === "GUEST") globalPlayerName = "";
                        if (globalPlayerName.length < 12 && ch.length === 1 && /[a-zA-Z0-9 ]/.test(ch)) {
                            globalPlayerName += ch.toUpperCase();
                            nameText.text = globalPlayerName;
                        }
                    }
                });

                k.onKeyPress("backspace", () => {
                    // Quick state reversion: If you backspace an empty name, go back to character select!
                    if (selectionState === "NAME") {
                        if (globalPlayerName !== "GUEST" && globalPlayerName.length > 0) {
                            globalPlayerName = globalPlayerName.slice(0, -1);
                            nameText.text = globalPlayerName;
                        } else if (globalPlayerName.length === 0) {
                            selectionState = "CHOOSE";
                        }
                    }
                });

                // Blinking cursor
                k.add([
                    k.text("_", { size: isScaleMobile ? 18 : 24, font: "monospace" }),
                    k.pos(k.width() / 2, centerY + 50),
                    k.anchor("left"),
                    k.opacity(1),
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            this.hidden = selectionState === "CHOOSE" || selectionState === "TITLE";
                            if (!this.hidden) {
                                this.pos.x = k.width() / 2 - 40 + nameText.width + 2;
                                this.opacity = Math.sin(k.time() * 10) > 0 ? 1 : 0;
                            }
                        }
                    }
                ]);

                // Prompt
                const enterPromptTxt = k.add([
                    k.text("Press ENTER", { size: isScaleMobile ? 18 : 24, font: "monospace" }),
                    k.pos(k.width() / 2, centerY + promptY + (isScaleMobile ? 10 : 0)),
                    k.anchor("center"),
                    k.color(255, 255, 0),
                    k.opacity(1),
                    k.area({ cursor: "pointer" }), // Make it clickable!
                    k.fixed(),
                    k.z(5),
                    "select_ui",
                    {
                        hasCustomUpdate: true,
                        update() {
                            this.hidden = selectionState === "TITLE";
                            this.text = selectionState === "CHOOSE" ? "Select Character" : "Start Journey";
                            this.opacity = Math.sin(k.time() * 6) > 0 ? 1 : 0;

                            // Visual Hover feedback
                            if (this.isHovering()) {
                                this.color = k.rgb(255, 255, 255); // Flash white if hovering text!
                            } else {
                                this.color = k.rgb(255, 255, 0); // Revert to yellow
                            }
                        }
                    }
                ]);

                // Allow direct clicking on the prompt text!
                enterPromptTxt.onClick(actionConfirm);
            });

            k.scene("game", () => {
                setIsGameScene(true); // Show controls!
                k.setGravity(1600); // Re-establish physics scale since Title screen sets zero-gravity natively!

                // Background - creating a seamlessly repeating layer
                const isTinyMobile = window.innerWidth <= 768;
                const nativeBgScale = isTinyMobile ? 1.0 : 1.8; // Massively compress the background native asset vertically on mobile exclusively to organically reveal the sky!

                const bgs = [];
                for (let i = 0; i < 5; i++) {
                    bgs.push(k.add([
                        k.sprite("bg"),
                        k.pos(0, 0), // Will be aligned dynamically upon load
                        k.scale(nativeBgScale),
                        k.z(-1)
                    ]));
                }

                // Invisible Physics Floor
                k.add([
                    k.rect(6000, 100), // Hardcoded massive 6000px width so the physics floor natively survives the 4500px barricade even on microscopic mobile screens!
                    k.pos(0, 485), // Raised slightly to perfectly trace the upper edge of the grass!
                    k.opacity(0),
                    k.area(),
                    k.body({ isStatic: true })
                ]);

                // Add the visible dirt tiles right beneath the grass
                // Procedurally generating a 2D tile grid to prevent silent WebGL texture stretch failures
                for (let x = 0; x < 60; x++) {
                    // Just ONE row of dirt! The infinite deep soil background color naturally handles the rest flawlessly below it!
                    k.add([
                        k.sprite("dirt"),
                        // Since tile39.png is 48px, scaled by 1.8x (matching background scale) it renders exactly at 86.4px width!
                        k.pos(x * 86.4, 530), // Brought up to 530 to guarantee overlap with the background
                        k.scale(1.8),
                        k.z(0) // Render IN FRONT of the background layer (-1) to guarantee visibility!
                    ]);
                }

                // Paint an infinite physical block of deep soil underneath the single row of dirt tiles 
                // so the Kaplay engine background can be restored to sky blue without exposing the underground!
                k.add([
                    k.rect(6000, 2000), // Massive rectangle covering the entire horizontal boundary and stretching endlessly downwards
                    k.pos(0, 580), // Physically attached immediately below the single dirt tile slice
                    k.color(27, 18, 30), // Exact color swatch plucked directly from the darkest pixels of tile39.png!
                    k.z(-1)
                ]);

                // --- DECORATIVE VEGETATION (Z: 0.5 - Behind architecture!) ---
                // Reduced procedural density to optimize WebGL performance
                [400, 2800].forEach(tx => {
                    k.add([
                        k.sprite("tree_idle"), // Default to idle state to save ram
                        k.pos(tx, 485),
                        k.anchor("bot"),
                        k.scale(2.4), // Reduced tree size as requested
                        k.z(0.4), // Deep background, safely behind buildings (1.0)
                        viewCuller("tree") // Attach procedural occlusion culling engine!
                    ]);
                });

                [200, 1100, 1800, 3100, 3900].forEach(bx => {
                    k.add([
                        k.sprite("bush_idle"), // Default to idle state
                        k.pos(bx, 485),
                        k.anchor("bot"),
                        k.scale(1.6), // Scaled down massively from 2.8 so they look like actual small ground brush!
                        k.z(0.6), // Closer than trees, but still strictly behind buildings (1.0)
                        viewCuller("bush")
                    ]);
                });

                // Buildings (Interactive Timeline Nodes - Z: 1.0)

                // ==========================================
                // 🛠️ EDIT BUILDING SCALES HERE 🛠️
                // ==========================================
                // Adjust these numbers to comfortably change how large each building operates on different devices!

                const b10_DesktopScale = 1.9;
                const b10_MobileScale = 1.8;
                const b10Scale = isScaleMobile ? b10_MobileScale : b10_DesktopScale;

                const b12_DesktopScale = 1.9;
                const b12_MobileScale = 1.8;
                const b12Scale = isScaleMobile ? b12_MobileScale : b12_DesktopScale;

                const bBachelors_DesktopScale = 2.8;
                const bBachelors_MobileScale = 2.5;
                const bBachelorsScale = isScaleMobile ? bBachelors_MobileScale : bBachelors_DesktopScale;
                // ==========================================

                const b10 = k.add([
                    k.sprite("bldg_10th"), // Remove static frame lock to allow animation
                    k.pos(900, 487), // Lowered slightly by explicitly 2 pixels to perfectly embed the foundation in the grass
                    k.anchor("bot"), // In Kaplay 3000, `bot` is used instead of `bottom` occasionally, but `bot` is safest. Or `bottom`.
                    k.scale(b10Scale), // Scale relative to natively sliced chunks!
                    k.z(1)
                ]);
                b10.play("idle");

                const b12 = k.add([
                    k.sprite("bldg_12th"),
                    k.pos(2200, 498), // Lowered substantially to counteract transparent image padding and physically seat it in the grass
                    k.anchor("bot"),
                    k.scale(b12Scale),
                    k.z(1)
                ]);

                const bBachelorsY = isScaleMobile ? 573 : 584;
                const bBachelors = k.add([
                    k.sprite("bldg_bachelor"),
                    // Scale dynamically applied. Mobile offset requires Y-correction to keep foundation planted in grass!
                    k.pos(3700, bBachelorsY),
                    k.anchor("bot"),
                    k.scale(bBachelorsScale), // Massively scaled up the college to feel like a real institutional building!
                    k.z(1)
                ]);
                bBachelors.play("idle");

                // --- END OF TIMELINE ROADBLOCK ---
                const endX = 4580;
                const baseY = 495; // Pushed deep into the grass to visually "ground" them

                // Arranged perfectly matching the reference image layout left-to-right!
                // Massive Cement Truck anchoring the scene permanently into the background (Z: 1.5 forces it cleanly behind the cones but in front of buildings!)
                const constructionTruck = k.add([k.sprite("truck"), k.pos(endX + 380, baseY - 1), k.anchor("bot"), k.scale(1.3), k.z(1.5)]);
                constructionTruck.play("idle");

                const endBarricade = k.add([k.sprite("barricade"), k.pos(endX, baseY + 8), k.anchor("bot"), k.scale(0.9), k.z(3)]);
                k.add([k.sprite("sign"), k.pos(endX + 110, baseY - 14), k.anchor("bot"), k.scale(0.80), k.z(2)]); // Pulled UP (negative offset) and spaced right
                k.add([k.sprite("cone"), k.pos(endX + 180, baseY + 4), k.anchor("bot"), k.scale(0.80), k.z(4)]); // Pulled UP (negative offset) and separated
                k.add([k.sprite("shovel"), k.pos(endX + 250, baseY + 2), k.anchor("bot"), k.scale(0.90), k.z(3)]); // Pulled UP (negative offset) and separated
                k.add([k.sprite("cone"), k.pos(endX + 320, baseY + 4), k.anchor("bot"), k.scale(0.80), k.z(4)]); // Pulled UP (negative offset) and separated

                // UI Anchors pre-computed statically to avoid physics update memory leaks!
                const b10UIAnchor = b10.add([k.pos(0, -90)]);
                const b12UIAnchor = b12.add([k.pos(0, -110)]);
                const bBachelorUIAnchor = bBachelors.add([k.pos(0, -135)]);
                const blockadeUIAnchor = endBarricade.add([k.pos(0, -60)]);

                // Player Logic & Physics
                const characterScale = isScaleMobile ? 1.8 : 2.0;
                const player = k.add([
                    k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle"),
                    k.pos(100, 100),
                    k.scale(characterScale),
                    k.area({ collisionIgnore: ["npc"] }),
                    k.body(),
                    k.z(10), // Forces player to render completely IN FRONT of the NPC
                    "player"
                ]);

                // Play the "idle" animation by default
                player.play("idle");

                // NPC (Harshal)
                const npc = k.add([
                    k.sprite("npc_idle"),
                    k.pos(350, 100),
                    k.scale(characterScale),
                    k.area({ collisionIgnore: ["player"] }),
                    k.body(),
                    k.z(5), // Renders strictly behind the player model
                    "npc"
                ]);
                npc.play("idle");

                // Cat (Milo) - Physics bypassed to manually clamp through transparent vertical padding in the sprite!
                const cat = k.add([
                    k.sprite("cat_idle"),
                    k.pos(650, isScaleMobile ? 540 : 550),
                    k.scale(isScaleMobile ? 0.7 : 0.8),
                    k.anchor("bot"),
                    k.z(4),
                    "cat"
                ]);
                cat.play("idle");
                cat.isWalking = false;
                cat.flipX = false;

                // Attach an invisible anchor directly to the NPC's actual bounding box
                const npcUIAnchor = npc.add([
                    k.pos(npc.width / 2, -10), // Anchor to the horizontal center, slightly above the head!
                ]);

                let isWalking = false;
                let dialogActive = false;
                let npcFollowing = false;
                let typeLoopInterval = null;
                let activeEntity = null; // "npc" or "b10"
                let currentDialogPages = [];
                let currentDialogPageIndex = 0;
                let previousPlayerFlipX = false; // Cache to return player to default position when dialog ends

                let completedEntities = {};
                let isAwaitingChoice = false;
                window.rpgChoiceSelection = 0;

                const STORY_DATA = {
                    "b10": [
                        "I passed my 10th in this school.",
                        "It feels so nostalgic to be back here.",
                        "So many amazing memories in these halls!"
                    ],
                    "b12": [
                        "This is where I did my 12th grade.",
                        "It was a challenging but rewarding time!",
                        "I learned a lot that prepared me for college."
                    ],
                    "bBachelors": [
                        "And this is my college, R.N.G. Patel Institute of Technology.",
                        "This is where my journey in technology truly accelerated!",
                        "So many late night coding sessions happened here."
                    ],
                    "endBlockade": [
                        "Sorry, we can't go any further.",
                        "Because the work is still going on in my life!"
                    ]
                };

                const updateChoiceUI = () => {
                    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;
                    if (isMobile) {
                        choiceNo.innerText = window.rpgChoiceSelection === 0 ? "No" : "No";
                        choiceYes.innerText = window.rpgChoiceSelection === 1 ? "Yes" : "Yes";
                        choiceNo.style.color = "white";
                        choiceYes.style.color = "white";
                    } else {
                        choiceNo.innerText = window.rpgChoiceSelection === 0 ? "▶ No" : "  No";
                        choiceYes.innerText = window.rpgChoiceSelection === 1 ? "▶ Yes" : "  Yes";
                        choiceNo.style.color = "white";
                        choiceYes.style.color = "white";
                    }
                };

                // Mouse Hover Hooks (Desktop)
                choiceNo.onmouseenter = () => {
                    window.rpgChoiceSelection = 0;
                    updateChoiceUI();
                };
                choiceYes.onmouseenter = () => {
                    window.rpgChoiceSelection = 1;
                    updateChoiceUI();
                };

                k.onKeyPress("up", () => {
                    if (isAwaitingChoice && window.rpgChoiceSelection === 1) {
                        window.rpgChoiceSelection = 0;
                        updateChoiceUI();
                    }
                });
                k.onKeyPress("down", () => {
                    if (isAwaitingChoice && window.rpgChoiceSelection === 0) {
                        window.rpgChoiceSelection = 1;
                        updateChoiceUI();
                    }
                });

                const startTypingPage = () => {
                    if (typeLoopInterval) clearInterval(typeLoopInterval);
                    speechArrow.style.display = 'none';
                    speechText.textContent = "";
                    const pageText = currentDialogPages[currentDialogPageIndex];
                    let charIndex = 0;

                    // Harshal is the universal narrator! Play talking animation for all dialog events!
                    npc.use(k.sprite("npc_speaking", { flipX: npc.flipX }));
                    npc.play("talk");

                    typeLoopInterval = setInterval(() => {
                        speechText.textContent += pageText[charIndex];
                        charIndex++;
                        if (charIndex >= pageText.length) {
                            clearInterval(typeLoopInterval);
                            typeLoopInterval = null;

                            // Finish talking, revert to idle, flash continue arrow!
                            npc.use(k.sprite("npc_idle", { flipX: npc.flipX }));
                            npc.play("idle");

                            if (isAwaitingChoice) {
                                choicesContainer.style.display = 'block';
                                updateChoiceUI();
                            } else {
                                speechArrow.style.display = 'block';
                            }
                        }
                    }, 40);
                };

                let lastInteractTime = 0;
                const handleInteract = () => {
                    const now = Date.now();
                    if (now - lastInteractTime < 200) return;
                    lastInteractTime = now;

                    if (dialogActive) {
                        // Answer Choice Processor
                        if (isAwaitingChoice && !typeLoopInterval) {
                            choicesContainer.style.display = 'none';
                            isAwaitingChoice = false;

                            if (window.rpgChoiceSelection === 0) {
                                // "No" - Just close the dialog!
                                speechBubble.style.display = 'none';
                                speechText.textContent = "";
                                dialogActive = false;
                                player.flipX = previousPlayerFlipX;
                                player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: previousPlayerFlipX }));
                                activeEntity = null;
                                k.canvas.focus(); // Restore keyboard focus!
                            } else {
                                // "Yes" - Re-read the story!
                                currentDialogPages = STORY_DATA[activeEntity];
                                currentDialogPageIndex = 0;
                                startTypingPage();
                            }
                            return;
                        }

                        // Fast-Forward Logic: If text is actively typing out, finish it instantly!
                        if (typeLoopInterval) {
                            clearInterval(typeLoopInterval);
                            typeLoopInterval = null;
                            speechText.textContent = currentDialogPages[currentDialogPageIndex];

                            // Stop talking animation universally!
                            npc.use(k.sprite("npc_idle", { flipX: npc.flipX }));
                            npc.play("idle");

                            if (isAwaitingChoice) {
                                choicesContainer.style.display = 'block';
                                updateChoiceUI();
                            } else {
                                speechArrow.style.display = 'block';
                            }
                            return; // Wait for the NEXT input to advance the page
                        }

                        // Paging Logic: If there is another page, advance to it!
                        currentDialogPageIndex++;
                        if (currentDialogPageIndex < currentDialogPages.length) {
                            startTypingPage();
                            return;
                        }

                        // Otherwise, dialog is fully complete!
                        if (activeEntity && activeEntity !== "npc" && activeEntity !== "endBlockade") {
                            completedEntities[activeEntity] = true;
                        }

                        speechBubble.style.display = 'none';
                        speechText.textContent = "";
                        dialogActive = false;

                        // Restore player to their original facing position after listening!
                        player.flipX = previousPlayerFlipX;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: previousPlayerFlipX }));

                        if (activeEntity === "npc") {
                            npcFollowing = true;
                        }
                        activeEntity = null;
                        k.canvas.focus(); // Restore keyboard focus!
                        return;
                    }

                    if (player.pos.dist(npc.pos) < 200 && !npcFollowing) {
                        dialogActive = true;
                        activeEntity = "npc";
                        currentDialogPages = [
                            `Hey ${globalPlayerName}! I'm Harshal. Welcome to my interactive portfolio!`,
                            "Use 'A' and 'D' (or mobile buttons) to explore.",
                            "Oh, and this little guy following me is Milo, my cat!",
                            "Follow me, let's take a tour around the timeline!"
                        ];
                        currentDialogPageIndex = 0;

                        // Always turn to face each other when interacting!
                        npc.flipX = player.pos.x < npc.pos.x;

                        // Player looks at the NPC like they are listening!
                        previousPlayerFlipX = player.flipX;
                        player.flipX = npc.pos.x < player.pos.x;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));

                        speechBubble.style.display = 'block';
                        startTypingPage();
                    } else if (Math.abs(player.pos.x - b10.pos.x) < 150 && npcFollowing) {
                        dialogActive = true;
                        activeEntity = "b10";
                        if (completedEntities["b10"]) {
                            isAwaitingChoice = true;
                            window.rpgChoiceSelection = 0;
                            currentDialogPages = ["I have told you already about this place.\nDo you want to hear the story again?"];
                        } else {
                            currentDialogPages = STORY_DATA["b10"];
                        }
                        currentDialogPageIndex = 0;

                        // Player looks at Harshal while Harshal tells the story!
                        previousPlayerFlipX = player.flipX;
                        player.flipX = npc.pos.x < player.pos.x;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));

                        if (npcFollowing) {
                            npc.flipX = player.pos.x < npc.pos.x; // Have Harshal look at the player while reading building info
                        }

                        speechBubble.style.display = 'block';
                        startTypingPage();
                    } else if (Math.abs(player.pos.x - b12.pos.x) < 150 && npcFollowing) {
                        dialogActive = true;
                        activeEntity = "b12";
                        if (completedEntities["b12"]) {
                            isAwaitingChoice = true;
                            window.rpgChoiceSelection = 0;
                            currentDialogPages = ["I have told you already about this place.\nDo you want to hear the story again?"];
                        } else {
                            currentDialogPages = STORY_DATA["b12"];
                        }
                        currentDialogPageIndex = 0;

                        // Face-tracking dynamics
                        previousPlayerFlipX = player.flipX;
                        player.flipX = npc.pos.x < player.pos.x;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));
                        if (npcFollowing) npc.flipX = player.pos.x < npc.pos.x;

                        speechBubble.style.display = 'block';
                        startTypingPage();
                    } else if (Math.abs(player.pos.x - bBachelors.pos.x) < 150 && npcFollowing) {
                        dialogActive = true;
                        activeEntity = "bBachelors";
                        if (completedEntities["bBachelors"]) {
                            isAwaitingChoice = true;
                            window.rpgChoiceSelection = 0;
                            currentDialogPages = ["I have told you already about this place.\nDo you want to hear the story again?"];
                        } else {
                            currentDialogPages = STORY_DATA["bBachelors"];
                        }
                        currentDialogPageIndex = 0;

                        // Face-tracking dynamics
                        previousPlayerFlipX = player.flipX;
                        player.flipX = npc.pos.x < player.pos.x;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));
                        if (npcFollowing) npc.flipX = player.pos.x < npc.pos.x;

                        speechBubble.style.display = 'block';
                        startTypingPage();
                    } else if (Math.abs(player.pos.x - endBarricade.pos.x) < 150 && npcFollowing) {
                        dialogActive = true;
                        activeEntity = "endBlockade";
                        currentDialogPages = STORY_DATA["endBlockade"];
                        currentDialogPageIndex = 0;

                        // Face-tracking dynamics
                        previousPlayerFlipX = player.flipX;
                        player.flipX = npc.pos.x < player.pos.x;
                        player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));
                        if (npcFollowing) npc.flipX = player.pos.x < npc.pos.x;

                        speechBubble.style.display = 'block';
                        startTypingPage();
                    }
                };

                // Dialog Interaction Bindings
                k.onKeyPress("enter", handleInteract);
                k.onClick(() => {
                    if (dialogActive) handleInteract(); // Safely restrict global clicking strictly to fast-forwarding active text
                });
                k.onTouchStart(() => {
                    if (dialogActive) handleInteract(); // Safely restrict global touching strictly to fast-forwarding active text
                });

                // --- CINEMATIC OPENING VARIABLES ---
                let cinematicComplete = false;
                let cinematicTimer = 0;
                let introStage = 0;
                const cameraPanDuration = 4.5;
                const cinematicDuration = 4.5;

                const introExclamation = k.add([
                    k.text("!", { size: 48 }),
                    k.color(255, 255, 0),
                    k.anchor("center"),
                    k.pos(0, 0),
                    k.opacity(0),
                    k.z(20)
                ]);


                let blackOverlay = k.add([
                    k.rect(10000, 10000),
                    k.pos(-5000, -5000), // Massive rectangle to cover any possible viewport scale natively!
                    k.color(0, 0, 0),
                    k.opacity(1),
                    k.z(9999),
                    k.fixed()
                ]);

                let bgAligned = false;

                // Camera & Environment tracking
                k.onUpdate(() => {

                    // Keep player within world bounds so they can't fall off the edges
                    if (player.pos.x < 100) player.pos.x = 100; // Left wall
                    if (player.pos.x > 4500) player.pos.x = 4500; // Right wall adjusted to dynamically hit exactly right before the barricade!
                    
                    if(!npcFollowing && player.pos.x > 450) player.pos.x = 450;//progession wall: player can't go further without interacting with the npc first

                    // Kaplay-React Reactivity Bridge
                    if (controlsRef.current.interact) {
                        controlsRef.current.interact = false;
                        handleInteract();
                    }

                    // UNIFIED MOVEMENT LOGIC (Keyboard + Mobile Touch)
                    const wantsLeft = (k.isKeyDown("a") || k.isKeyDown("left") || controlsRef.current.left) && cinematicComplete;
                    const wantsRight = (k.isKeyDown("d") || k.isKeyDown("right") || controlsRef.current.right) && cinematicComplete;

                    if (!dialogActive) {
                        if (wantsLeft && !wantsRight) {
                            player.move(-250, 0);
                            player.flipX = true;

                            if (!isWalking) {
                                isWalking = true;
                                player.use(k.sprite(globalPlayerModel === "boy" ? "player_walk" : "girl_walk", { flipX: true }));
                                player.play("walk");
                            }
                        } else if (wantsRight && !wantsLeft) {
                            player.move(250, 0);
                            player.flipX = false;

                            if (!isWalking) {
                                isWalking = true;
                                player.use(k.sprite(globalPlayerModel === "boy" ? "player_walk" : "girl_walk", { flipX: false }));
                                player.play("walk");
                            }
                        } else {
                            // Neither or both held
                            if (isWalking) {
                                isWalking = false;
                                player.use(k.sprite(globalPlayerModel === "boy" ? "player_idle" : "girl_idle", { flipX: player.flipX }));
                                player.play("idle");
                            }
                        }
                    }

                    // Safety net in case of physics clipping
                    if (player.pos.y > 1000) {
                        player.pos = k.vec2(100, 100);
                    }

                    // Sync DOM UI to perfectly glued screen coordinates via the scenegraph!
                    const anchorScreen = k.toScreen(npcUIAnchor.worldPos());

                    // Dialog box no longer tracks character (it is a fixed RPG box)

                    // Prompt Tracking Logic (Closest Entity)
                    let nearest = null;
                    if (Math.abs(player.pos.x - npc.pos.x) < 150 && !npcFollowing) {
                        nearest = "npc";
                    } 
                    else if (npcFollowing) 
                        if (Math.abs(player.pos.x - b10.pos.x) < 150) {
                        nearest = "b10";
                    } else if (Math.abs(player.pos.x - b12.pos.x) < 150) {
                        nearest = "b12";
                    } else if (Math.abs(player.pos.x - bBachelors.pos.x) < 150) {
                        nearest = "bachelor";
                    } else if (Math.abs(player.pos.x - endBarricade.pos.x) < 150) {
                        nearest = "blockade";
                    }

                    if (nearest && !dialogActive) {
                        enterPrompt.style.display = 'block';

                        // Attach the UI prompt to whichever entity is closest via pre-computed anchors!
                        let targetEntity;
                        if (nearest === "npc") targetEntity = npcUIAnchor;
                        else if (nearest === "b10") targetEntity = b10UIAnchor;
                        else if (nearest === "b12") targetEntity = b12UIAnchor;
                        else if (nearest === "bachelor") targetEntity = bBachelorUIAnchor;
                        else if (nearest === "blockade") targetEntity = blockadeUIAnchor;

                        const anchorScreen = k.toScreen(targetEntity.worldPos());
                        enterPrompt.style.left = (anchorScreen.x / k.width()) * 100 + '%';
                        enterPrompt.style.top = (anchorScreen.y / k.height()) * 100 + '%';
                        const promptString = isScaleMobile ? "[Touch Here or Press A]" : "[ENTER]";
                        enterPrompt.textContent = nearest === "npc" ? `${promptString} to Talk` : `${promptString} to Read`;
                    } else {
                        enterPrompt.style.display = 'none';
                    }

                    // NPC FOLLOWER BEHAVIOR
                    if (npcFollowing && !dialogActive) {
                        const dist = Math.abs(npc.pos.x - player.pos.x);
                        if (dist > 110) { // Keep a polite distance
                            const moveDir = player.pos.x > npc.pos.x ? 1 : -1;
                            npc.move(240 * moveDir, 0);

                            const facingLeft = moveDir === -1;
                            if (!npc.isWalking) {
                                npc.isWalking = true;
                                npc.use(k.sprite("npc_walk", { flipX: facingLeft }));
                                npc.play("walk");
                            } else {
                                npc.flipX = facingLeft;
                            }
                        } else {
                            if (npc.isWalking) {
                                npc.isWalking = false;
                                npc.use(k.sprite("npc_idle", { flipX: npc.flipX }));
                                npc.play("idle");
                            }
                        }

                        // CAT FOLLOWER BEHAVIOR - HYSTERESIS TO PREVENT STATE FLICKERING
                        const distToNpc = Math.abs(cat.pos.x - npc.pos.x);

                        // Adjust the braking buffer dynamically! Both the Cat and NPC sprites are painted asymmetrically inside their 
                        // huge transparent bounding boxes. When Kaplay flips them to face left, their drawn pixels physically overlap.
                        // We use a wider collision boundary when the Cat is trailing on the right side!
                        const targetStopDist = (cat.pos.x > npc.pos.x) ? 120 : 60;

                        if (cat.isWalking) {
                            if (distToNpc < targetStopDist) {
                                // Reached target, completely stop!
                                cat.isWalking = false;
                                cat.use(k.sprite("cat_idle", { flipX: cat.flipX }));
                                cat.play("idle");
                            } else {
                                // Still walking to catch up
                                const moveDirCat = npc.pos.x > cat.pos.x ? 1 : -1;
                                cat.move(260 * moveDirCat, 0);
                                cat.flipX = moveDirCat === -1;
                            }
                        } else {
                            if (distToNpc > targetStopDist + 70) {
                                // Harshal moved far away, begin sprint!
                                cat.isWalking = true;
                                const moveDirCat = npc.pos.x > cat.pos.x ? 1 : -1;
                                cat.use(k.sprite("cat_walk", { flipX: moveDirCat === -1 }));
                                cat.play("walk");
                                cat.flipX = moveDirCat === -1;
                            }
                        }
                    }

                    // Lock Cat to flat grass coordinate unconditionally natively!
                    // The background grass compresses vertically to a thinner block on mobile (scale 1.0 vs 1.8), effectively shifting the visual crest of the hill lower.
                    // This ternary strictly pulls the cat up by 10 pixels rigidly on mobile viewports to stop it from sinking into the dirt!
                    cat.pos.y = isScaleMobile ? 540 : 550;

                    // Dynamically align background tiles once the image dimensions load
                    if (!bgAligned && bgs[0] && bgs[0].width > 0) {
                        const isTinyMobileDynamic = window.innerWidth <= 768;
                        const dynBgScale = isTinyMobileDynamic ? 1.0 : 1.8;

                        const scaledWidth = bgs[0].width * dynBgScale;
                        const scaledHeight = bgs[0].height * dynBgScale;
                        bgs.forEach((bg, i) => {
                            bg.pos.x = i * (scaledWidth - 2); // 2px overlap to prevent seams
                            bg.pos.y = 560 - scaledHeight;
                        });
                        bgAligned = true;
                    }

                    // Mobile-Aware Camera Auto-Zoom/Pan!
                    const isMobilePortrait = window.innerHeight > window.innerWidth && window.innerWidth <= 768;
                    const isMobileLandscape = window.innerHeight < window.innerWidth && window.innerHeight <= 500;

                    let targetZoom = 0.85; // ZOOMED OUT universally by 15% so the skyline is massive and clear!
                    let targetCamY = 250; // DRAGS THE GAMEPLAY DOWN: By locking the camera center high in the sky natively, the physical terrain (Y:485) gets slammed heavily into the bottom quadrant of the screen natively!

                    if (isMobilePortrait) {
                        targetZoom = 1.35; // Huge zoom for Character Focus in Portrait!
                        targetCamY = 380; // Adjusted for mobile visibility
                    } else if (isMobileLandscape) {
                        targetZoom = 0.75;
                        targetCamY = 220;
                    }

                    // CINEMATIC OPENING CAMERA OVERRIDE
                    if (!cinematicComplete) {
                        cinematicTimer += k.dt();
                        const progress = Math.min(cinematicTimer / cinematicDuration, 1);

                        // Apply Smooth Easing Math (easeOutCubic)
                        const easeOut = 1 - Math.pow(1 - progress, 3);

                        // Slowly fade the massive black overlay natively to 0 opacity
                        // slowly fade black overlay natively
                        if (blackOverlay) {
                            blackOverlay.opacity = 1 - easeOut;
                            if (progress === 1) {
                                blackOverlay.destroy();
                                blackOverlay = null; // Clean up safely
                            }
                        }

                        // Pan from Void down natively over 4.5s
                        const startCamY = -500;
                        targetCamY = startCamY + (targetCamY - startCamY) * Math.min(easeOut, 1);
                        if (enterPrompt) enterPrompt.style.display = 'none';

                        // CHOREOGRAPHED CUTSCENE SCRIPT (Syncs natively to camera drop at 4.5s)
                        if (cinematicTimer > 1.0 && cinematicTimer <= 2.5) {
                            if (introStage === 0) {
                                introStage = 1;
                                cat.use(k.sprite("cat_walk", { flipX: true }));
                                cat.play("walk");
                            }
                            cat.move(-300, 0); // Sprint Left towards Bush
                        }
                        else if (cinematicTimer > 2.5 && cinematicTimer <= 4.0) {
                            if (introStage === 1) {
                                introStage = 2;
                                cat.use(k.sprite("cat_walk", { flipX: false }));
                                cat.play("walk");
                            }
                            cat.move(300, 0); // Sprint Right towards Building
                        }
                        else if (cinematicTimer > 4.0 && cinematicTimer <= 5.5) {
                            if (introStage === 2) {
                                introStage = 3;
                                cat.use(k.sprite("cat_walk", { flipX: true }));
                                cat.play("walk");
                            }
                            cat.move(-300, 0); // Sprint Left back to Bush (camera lands at 4.5, player natively sees this sprint!)
                        }
                        else if (cinematicTimer > 5.5 && cinematicTimer <= 6.5) {
                            if (introStage === 3) {
                                introStage = 4;
                                cat.use(k.sprite("cat_idle", { flipX: true })); // FACE PLAYER
                                cat.play("idle");
                                introExclamation.opacity = 1; // STOP and SHOCK!
                            }
                            introExclamation.pos = cat.pos.add(0, -130); // Hover exclamation mark much higher!
                        }
                        else if (cinematicTimer > 6.5 && cinematicTimer <= 7.2) {
                            if (introStage === 4) {
                                introStage = 5;
                                introExclamation.opacity = 0;
                                cat.use(k.sprite("cat_walk", { flipX: false }));
                                cat.play("walk");
                            }
                            cat.move(300, 0); // Sprint aggressively RIGHT mathematically to x=410 (right of Harshal)
                        }
                        else if (cinematicTimer > 7.2 && cinematicTimer <= 8.2) {
                            if (introStage === 5) {
                                introStage = 6;
                                cat.use(k.sprite("cat_idle", { flipX: true })); // FACE HARSHAL (LEFT)
                                cat.play("idle");

                                // AUTO DIALOG VISUAL (Bypasses interaction logic so ENTER key does nothing!)
                                speechBubble.style.display = 'block';
                                speechText.textContent = "What happened, Milo?";
                                npc.flipX = player.pos.x < npc.pos.x; // Look at Player playfully natively while talking!
                            }
                        }
                        else if (cinematicTimer > 8.2) {
                            if (introStage === 6) {
                                introStage = 7;
                                speechBubble.style.display = 'none';
                                speechText.textContent = "";

                                cinematicComplete = true; // CONTROL RESTORED FINALLY
                                if (blackOverlay) {
                                    blackOverlay.destroy();
                                    blackOverlay = null;
                                }
                            }
                        }

                        npcFollowing = false;
                    } else if (!npcFollowing) {
                        // After the automated dialog finishes safely organically, flip the AI switch manually via ENTER
                    }

                    k.setCamScale(k.vec2(targetZoom, targetZoom));

                    let camX = player.pos.x;
                    // Clamp camera so we never see the left void
                    const visibleWidth = k.width() / targetZoom;
                    if (camX < visibleWidth / 2) {
                        camX = visibleWidth / 2;
                    }
                    k.setCamPos(camX, targetCamY);
                });

                // Occasional Bird Flock logic in Game Scene
                const spawnGameFlock = () => {
                    k.wait(k.rand(5, 12), () => {
                        const startY = k.rand(50, 300);
                        const spawnGameBird = (offsetY, delay, isLeader) => {
                            k.wait(delay, () => {
                                // Spawn just left of the current camera view
                                const camLeft = k.getCamPos().x - (k.width() / 2 / k.getCamScale().x) - 200;
                                const isCloud = k.chance(0.5);
                                const b = k.add([
                                    k.sprite(isCloud ? "cloud_bird" : "bird", { flipX: true }), // Flipped to face right!
                                    k.pos(camLeft, startY + offsetY),
                                    k.scale(isScaleMobile ? (isCloud ? 1.5 : 0.8) : (isCloud ? 2.0 : 1.0)),
                                    k.z(isCloud ? 0.2 : 1.2) // Cloud birds behind trees (0.4) & buildings (1.0). Regular birds in front of buildings (1.0).
                                ]);
                                b.play("fly");
                                b.onUpdate(() => {
                                    b.move(160, -5);
                                    // Destroy when it flies past the right side of the current camera view
                                    const camRight = k.getCamPos().x + (k.width() / 2 / k.getCamScale().x) + 200;
                                    if (b.pos.x > camRight) {
                                        b.destroy();
                                        if (isLeader) spawnGameFlock();
                                    }
                                });
                            });
                        };
                        spawnGameBird(0, 0, true);
                        const hasFollower = k.chance(0.5);
                        if (hasFollower) spawnGameBird(k.rand(-120, 120), k.rand(1.2, 2.5), false);
                    });
                };
                spawnGameFlock();

            }); // End of game scene

            k.go("title"); // Kick off the state machine!

        } catch (e) {
            console.error("KAPLAY SETUP ERR:", e);
        }

        // Cleanup
        return () => {
            try {
                k.quit();
            } catch (err) { }
            if (wrapperRef.current && wrapperRef.current.contains(canvas)) {
                wrapperRef.current.removeChild(canvas);
            }
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
            <style>{`
                .speech-box {
                    bottom: 30px;
                }
                .gamepad-container {
                    display: none;
                }
                @media (pointer: coarse) {
                    .gamepad-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 40px;
                        user-select: none;
                    }
                    /* Portrait Mode: Blocker Screen */
                    @media (orientation: portrait) {
                        .gamepad-container {
                            display: none !important; /* Hide controller in portrait */
                        }
                        .portrait-blocker {
                            display: flex !important;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background-color: rgba(0, 0, 0, 0.95);
                            color: white;
                            z-index: 9999;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 20px;
                            font-family: inherit;
                        }
                    }
                    /* Landscape Mode: Overlay invisibly on screen corners */
                    @media (orientation: landscape) {
                        .speech-box {
                            bottom: 110px !important; /* Push text safely above gamepad buttons! */
                        }
                        .gamepad-container {
                            position: absolute;
                            bottom: 20px;
                            left: 0;
                            width: 100%;
                            background: transparent;
                            pointer-events: none;
                            z-index: 2000;
                        }
                        .game-btn {
                            pointer-events: auto;
                            background: rgba(255, 255, 255, 0.3) !important; 
                        }
                    }
                }
                .portrait-blocker {
                    display: none;
                }
                .game-btn {
                    width: 70px;
                    height: 70px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 4px solid rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    user-select: none;
                    touch-action: none;
                }
                .game-btn:active {
                    background: rgba(255, 255, 255, 0.5);
                    transform: scale(0.95);
                }
            `}</style>

            <div ref={wrapperRef} style={{
                position: 'relative',
                width: '100%',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }} />

            {/* Portrait rotation warning overlay */}
            <div className="portrait-blocker">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱 ➡️ 📻</div>
                <h2>Please Rotate Your Device</h2>
                <p style={{ marginTop: '10px' }}>PORTMATION requires Landscape Mode for the optimal interactive experience.</p>
            </div>

            <div className="gamepad-container" style={{ display: isGameScene ? '' : 'none' }}>
                <div
                    className="game-btn"
                    onTouchStart={() => { controlsRef.current.left = true; }}
                    onTouchEnd={() => { controlsRef.current.left = false; }}
                >{"<"}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div
                        className="game-btn interact-btn"
                        onTouchStart={() => {
                            controlsRef.current.interact = true;
                            setTimeout(() => { controlsRef.current.interact = false; }, 150);
                        }}
                    >
                        A
                    </div>
                    <div
                        className="game-btn"
                        onTouchStart={() => { controlsRef.current.right = true; }}
                        onTouchEnd={() => { controlsRef.current.right = false; }}
                    >{">"}</div>
                </div>
            </div>
        </div>
    );
};

export default PORTMATION;
