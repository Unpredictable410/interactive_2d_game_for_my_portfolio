import React, { useState, useEffect, useRef } from 'react';
import './ExitGame.css';

// The updated story flow with natural time progression
const storyData = {
    start: {
        text: [
            "The world ended a long time ago.",
            "You are standing in the ruins of a crumbling city.",
            "The silence is deafening. You are completely alone.",
            "What do you do?"
        ],
        image: "/city_ruin.png",
        commands: { "walk": "bus", "explore": "bus", "leave": "bus" }
    },
    bus: {
        text: [
            "After days of endless walking, you find an abandoned school bus on a cracked highway.",
            "From underneath the rusted tires, you hear a faint 'meow'.",
            "What do you do?"
        ],
        image: "/school_bus.png",
        commands: { "look under bus": "found_cat", "find cat": "found_cat", "search": "found_cat" }
    },
    found_cat: {
        text: [
            "You bend down and peer under the rusted chassis.",
            "An orange kitten is cowering by the axle, staring at you with wide eyes.",
            "It looks hungry and terrified.",
            "What do you do?"
        ],
        image: "/kitten2.png",
        commands: { "pet cat": "treehouse", "pick up cat": "treehouse", "grab cat": "treehouse", "coax cat": "treehouse", "take cat": "treehouse" }
    },
    treehouse: {
        text: [
            "You gently pick up the small, scruffy cat. It purrs and rubs its head against you.",
            "After weeks of traveling together, you find a hidden treehouse to rest.",
            "For the first time in years, you don't feel alone.",
            "What do you do?"
        ],
        image: "/tree_house.png",
        commands: { "sleep": "invasion", "rest": "invasion", "look outside": "invasion", "wait": "invasion" }
    },
    invasion: {
        text: [
            "Months pass peacefully. But one night, a blinding purple light pierces the sky!",
            "A saucer descends. You dive into the bushes, but the terrified cat runs out into the open.",
            "The ship's tractor beam catches the kitten, gently lifting it toward the ship!",
            "If you grab the cat, you will be abducted too. Save the cat, or stay hidden?"
        ],
        image: "/cat ufo.png",
        commands: {
            "hide": "alone",
            "stay hidden": "alone",
            "save cat": "inside_ship",
            "grab cat": "inside_ship",
            "take cat": "inside_ship"
        }
    },
    alone: {
        text: [
            "You stay hidden in the shadows as the ships depart.",
            "The world is quiet again. You survived.",
            "But as you look at the empty space beside you, you realize...",
            "You will be alone forever."
        ],
        image: "/night_moon.png",
        commands: { "yes": "start", "play again": "start" }
    },
    inside_ship: {
        text: [
            "You dive into the light, grabbing the kitten tightly as the beam pulls you both up.",
            "You wake up in a bright, pristine room. The cat is purring on your lap.",
            "People approach you, smiling. 'We came back to observe the ruins,' they say.",
            "'We only save those who still have humanity.'",
            "Type 'wake up' to enter the portfolio."
        ],
        image: "/inside_ship.png",
        commands: {
            "wake up": "win",
            "wake": "win",
            "enter": "win"
        }
    }
};

const TypeWriter = ({ lines, onComplete, fastForward }) => {
    const [displayedLines, setDisplayedLines] = useState([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const speed = fastForward ? 2 : 40;

    useEffect(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
    }, [lines]);

    useEffect(() => {
        if (currentLineIndex >= lines.length) {
            if (onComplete) onComplete();
            return;
        }
        const currentLine = lines[currentLineIndex] || "";
        if (currentCharIndex < currentLine.length) {
            const timeout = setTimeout(() => {
                setDisplayedLines((prev) => {
                    const newLines = [...prev];
                    if (newLines[currentLineIndex] === undefined) newLines[currentLineIndex] = '';
                    newLines[currentLineIndex] += currentLine[currentCharIndex];
                    return newLines;
                });
                setCurrentCharIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setCurrentLineIndex(prev => prev + 1);
                setCurrentCharIndex(0);
            }, speed * 5);
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, currentCharIndex, lines, speed, onComplete]);

    return (
        <>
            {displayedLines.map((line, index) => (
                <p key={index}>{line}</p>
            ))}
        </>
    );
};

const ExitGame = ({ onWin, onClose }) => {
    const [isIntro, setIsIntro] = useState(true);
    const [isTyping, setIsTyping] = useState(true);
    const [fastForward, setFastForward] = useState(false);
    const [scene, setScene] = useState('start');
    const [input, setInput] = useState('');
    const [introCursor, setIntroCursor] = useState(0); // 0 = Start, 1 = Exit
    const [showWinModal, setShowWinModal] = useState(false);
    const inputRef = useRef(null);

    // Keep focus on the input or wrapper
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        } else {
            const wrapper = document.querySelector('.exit-game-wrapper');
            if (wrapper) wrapper.focus();
        }
    }, [scene, isIntro, isTyping]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (isIntro) {
            if (e.key === 'ArrowDown') {
                setIntroCursor(1);
            } else if (e.key === 'ArrowUp') {
                setIntroCursor(0);
            } else if (e.key === 'Enter') {
                if (introCursor === 0) {
                    setIsIntro(false);
                } else {
                    onClose();
                }
            }
            return;
        }

        if (isTyping) {
            setFastForward(true);
            return;
        }

        if (e.key === 'Enter') {

            const command = input.trim().toLowerCase();
            const currentSceneData = storyData[scene];

            if (currentSceneData.commands[command]) {
                const nextScene = currentSceneData.commands[command];

                if (nextScene === 'win') {
                    setShowWinModal(true);
                } else {
                    setScene(nextScene);
                    setInput('');
                    setIsTyping(true);
                    setFastForward(false);
                }
            } else {
                setInput('');
            }
        }
    };

    return (
        <div className="exit-game-wrapper" tabIndex={0} onKeyDown={handleKeyDown} onClick={() => {
            if (isTyping) {
                setFastForward(true);
            }
            const el = inputRef.current || document.querySelector('.exit-game-wrapper');
            if (el) el.focus();
        }}>
            {isIntro ? (
                <div className="exit-intro-screen crt-turn-on" style={{ position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
                    {/* Background Layers */}
                    <img src="/backgroun1.png" alt="BG" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} onError={(e) => { e.target.style.display = 'none'; }} />
                    <img src="/moon.png" alt="Moon" style={{ position: 'absolute', top: '2%', right: '-3%', width: 'clamp(200px, 60%, 850px)', zIndex: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />

                    {/* Foreground Content */}
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%', padding: '2rem 1rem' }}>

                        {/* Cat and Title Horizontally Aligned */}
                        <div className="exit-intro-header">
                            <img src="/cat.png" alt="Cat" className="exit-intro-cat" onError={(e) => { e.target.style.display = 'none'; }} />
                            <img src="/title.png" alt="Title" className="exit-intro-title" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>

                        {/* Menu Options container */}
                        <div className="exit-intro-menu">
                            {/* Start Option */}
                            <div className="exit-intro-option">
                                <img src="/start.png" alt="Start" className="exit-intro-option-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                {introCursor === 0 && (
                                    <img src="/point.png" alt="Cursor" className="exit-intro-cursor" onError={(e) => { e.target.style.display = 'none'; }} />
                                )}
                                {/* Hitbox */}
                                <div className="exit-intro-hitbox" onClick={() => setIsIntro(false)} onMouseEnter={() => setIntroCursor(0)} />
                            </div>

                            {/* Exit Option */}
                            <div className="exit-intro-option">
                                <img src="/exit.png" alt="Exit" className="exit-intro-option-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                {introCursor === 1 && (
                                    <img src="/point.png" alt="Cursor" className="exit-intro-cursor" onError={(e) => { e.target.style.display = 'none'; }} />
                                )}
                                {/* Hitbox */}
                                <div className="exit-intro-hitbox" onClick={onClose} onMouseEnter={() => setIntroCursor(1)} />
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="exit-game-container">
                    <div className="exit-image-section">
                        <img
                            key={scene}
                            src={storyData[scene].image}
                            alt="Game Graphic"
                            className="exit-background crt-turn-on"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>

                    <div className="exit-text-section">
                        <div className="exit-terminal-text">
                            <TypeWriter
                                key={scene}
                                lines={storyData[scene].text}
                                fastForward={fastForward}
                                onComplete={() => setIsTyping(false)}
                            />

                            {!isTyping && (
                                <>
                                    {/* 1. Conditionally flashes the red GAME OVER only on the 'alone' scene */}
                                    {scene === 'alone' && (
                                        <p className="game-over-text">GAME OVER</p>
                                    )}
                                    {/* (Win screen moved to absolute modal on 'wake up' command) */}

                                    <div className="exit-options" style={{ marginTop: '1rem', color: '#ffea00', opacity: 0.9, fontSize: '0.85em' }}>
                                        [ {Object.keys(storyData[scene].commands).join(' / ')} ]
                                    </div>

                                    <div className="exit-input-line">
                                        <span className="prompt-arrow">&gt; </span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown} /* Ensure this is here so Enter works! */
                                            className="exit-input"
                                            spellCheck="false"
                                            autoComplete="off"
                                        />
                                        <span className="exit-cursor">_</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '10px', right: '20px', color: '#4dfbca', fontSize: '0.8rem', opacity: 0.5, zIndex: 30 }}>
                        Press ESC to abort sequence
                    </div>
                </div>
            )}

            {showWinModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="terminal-block" style={{ backgroundColor: '#050505', border: '1px solid var(--term-green)', padding: '3rem', width: 'clamp(300px, 90%, 650px)', boxShadow: '0 0 30px rgba(77, 251, 202, 0.2)', position: 'relative', textAlign: 'center', boxSizing: 'border-box' }}>
                        <div className="terminal-block-title" style={{ top: '-12px', left: '20px', position: 'absolute', backgroundColor: '#050505', padding: '0 10px' }}>[ SUCCESS_OVERRIDE ]</div>
                        <p className="win-text" style={{ fontSize: '3.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>YOU WIN</p>
                        <div style={{ color: 'var(--term-green)', fontSize: '1.2rem', marginTop: '2rem', lineHeight: '1.8' }}>
                            &gt; ACCESS GRANTED: PROFILE IDENTIFIER RECOVERED<br /><br />
                            &gt; You may now see my true face.
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
                            <button className="transmit-btn" onClick={() => {
                                setScene('start');
                                setInput('');
                                setIsIntro(true);
                                setShowWinModal(false);
                                setIsTyping(true);
                                setFastForward(false);
                            }}>[ RESTART ]</button>
                            <button className="transmit-btn" onClick={onClose}>[ EXIT ]</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExitGame;