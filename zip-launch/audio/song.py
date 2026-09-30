"""song.py: composes the 90 s track + SFX from ../cues.json and writes audio/mix.wav (and stems).
120 BPM, C major / A minor. Royal-road chorus (IVM7–V–iii7–vi), a 2-step garage switch-up for the Y2K bridge."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from synth import *

HERE = os.path.dirname(os.path.abspath(__file__))
CUES = json.load(open(os.path.join(HERE, '..', 'cues.json')))
DUR = CUES['duration'] + 0.6
N = int(DUR * SR)
BEAT = 60 / CUES['bpm']
BAR = BEAT * 4
S16 = BEAT / 4

bus = {k: np.zeros((N, 2)) for k in ['drums', 'bass', 'music', 'lead', 'sfx', 'verb_send']}
kicks = []  # times, for sidechain


def put(name, x, t, p=0.0, g=1.0, send=0.0):
    if t < 0 or t >= DUR:
        return
    x = pan(x, p) if x.ndim == 1 else x
    i = int(round(t * SR))
    n = min(len(x), N - i)
    if n <= 0:
        return
    bus[name][i:i + n] += x[:n] * g
    if send:
        bus['verb_send'][i:i + n] += x[:n] * g * send


# ------------------------------------------------------------------ harmony
CH = {
    'Am': [57, 60, 64, 67], 'F': [53, 57, 60, 64], 'G': [55, 59, 62, 67], 'Em': [52, 55, 59, 62], 'E7': [52, 56, 59, 62],
    'Dm9': [50, 53, 57, 60, 64], 'G13': [55, 65, 71, 76], 'Cmaj9': [48, 52, 55, 59, 62], 'Am9': [57, 60, 64, 67, 71], 'Fmaj9': [53, 57, 60, 64, 67],
    'C': [60, 64, 67, 71], 'Gsus': [55, 60, 62, 67],
}
ROOT = {'Am': 45, 'F': 41, 'G': 43, 'Em': 40, 'E7': 40, 'Dm9': 38, 'G13': 43, 'Cmaj9': 36, 'Am9': 45, 'Fmaj9': 41, 'C': 36, 'Gsus': 43}
# (start, end, chord)
PROG = [(0, 2, 'Am'), (2, 4, 'F'), (4, 6, 'Am'), (6, 8, 'E7'),
        (8, 10, 'F'), (10, 12, 'G'), (12, 14, 'Em'), (14, 16, 'Am'),
        (16, 18, 'Am'), (18, 20, 'F'), (20, 22, 'F'), (22, 24, 'G'),
        (24, 32, 'Am'), (32, 34, 'F'), (34, 36, 'G'),
        (36, 38, 'F'), (38, 40, 'G'), (40, 42, 'Em'), (42, 44, 'Am'), (44, 46, 'F'), (46, 48, 'G'),
        (48, 50, 'F'), (50, 52, 'G'), (52, 54, 'Em'), (54, 56, 'Am'), (56, 58, 'F'),
        (58, 60, 'Dm9'), (60, 62, 'G13'), (62, 64, 'Cmaj9'), (64, 66, 'Am9'), (66, 68, 'Fmaj9'),
        (68, 70, 'F'), (70, 72, 'Gsus'),
        (72, 74, 'F'), (74, 76, 'G'), (76, 78, 'Em'), (78, 80, 'Am'), (80, 82, 'F'), (82, 84, 'G'), (84, 86, 'C'),
        (86, 88, 'F'), (88, 90.5, 'C')]


def chord_at(t):
    for a, b, c in PROG:
        if a <= t < b:
            return c
    return 'C'


# ------------------------------------------------------------------ drum patterns (16 steps per bar)
def pattern(t0, t1, kick_steps, clap_steps=(), hat_steps=(), ohat_steps=(), snare_steps=(), vel=1.0, swing=0.0, hatv=0.5):
    b = t0
    while b < t1 - 1e-6:
        for s in range(16):
            t = b + s * S16 + (swing * S16 if s % 2 else 0)
            if t >= t1:
                continue
            if s in kick_steps:
                put('drums', kick(vel), t); kicks.append(t)
            if s in clap_steps:
                put('drums', clap(vel * 0.8, seed=13 + s), t, p=0.05, send=0.25)
            if s in snare_steps:
                put('drums', snare(vel * 0.8), t, send=0.2)
            if s in hat_steps:
                put('drums', hat(hatv * vel * (1.0 if s % 4 == 2 else 0.7)), t, p=0.3)
            if s in ohat_steps:
                put('drums', hat(hatv * vel * 0.8, open_=True), t, p=-0.25)
        b += BAR


FOUR = (0, 4, 8, 12)
EIGHTHS = tuple(range(0, 16, 2))
SIXT = tuple(range(16))
OFF = (2, 6, 10, 14)

# hook 0–4: four on the floor, claps on 2 & 4, 8th hats. last beat: kick 8ths
pattern(0, 3, FOUR, (4, 12), EIGHTHS, vel=1.0)
pattern(3, 4, (0, 2, 4, 6), (), SIXT[:8], vel=0.9)
for i in range(4):
    put('drums', snare(0.35 + i * 0.12), 3.0 + i * 0.25)
# 4–6 half time ("in half")
put('drums', kick(1.1), 4.0); kicks.append(4.0)
put('drums', snare(1.0), 5.0, send=0.35)
put('drums', kick(0.9), 5.75); kicks.append(5.75)
pattern(4, 6, (), (), (0, 4, 8, 12), hatv=0.35)
# 6–8 zipper build, fill
for i in range(8):
    put('drums', snare(0.25 + i * 0.09), 7.0 + i * 0.125)
# verse 8–14
VK = (0, 6, 8, 11)
pattern(8, 14, VK, (4, 12), EIGHTHS, (14,), vel=0.95)
# 14–16 zip-it: breakdown then whip
put('drums', kick(1.0), 14.0); kicks.append(14.0)
put('drums', crash(0.6), 14.0)
pattern(14.5, 15.25, (), (), SIXT, hatv=0.25)
# 16–17.5 inflate: heartbeat kicks
for t in (16.0, 16.5, 17.0, 17.25):
    put('drums', kick(0.7), t); kicks.append(t)
# 20–24 funk groove
pattern(20, 24, (0, 3, 8, 10), (4, 12), EIGHTHS, (6, 14), vel=0.9)
# race 24–36
put('drums', kick(1.0), 24.0); kicks.append(24.0)
put('drums', kick(1.0), 24.5); kicks.append(24.5)
pattern(25, 32, FOUR, (), SIXT, vel=0.85, hatv=0.35)
pattern(28, 32, (), (4, 12), (), vel=0.8)
pattern(32, 35, FOUR, (4, 12), EIGHTHS, OFF, vel=1.0)
for i in range(16):
    put('drums', snare(0.3 + i * 0.04), 35.0 + i * S16)
# chorus 36–48
pattern(36, 48, FOUR, (4, 12), SIXT, OFF, vel=1.0, hatv=0.4)
put('drums', crash(0.9), 36.0); put('drums', crash(0.6), 44.0)
# bench 48–57.5
pattern(48, 57.5, FOUR, (4, 12), EIGHTHS, OFF, vel=0.9, hatv=0.35)
put('drums', crash(0.6), 48.0)
# garage 58–67.4 (swung 2-step)
pattern(58, 66, (0, 10), (), EIGHTHS + (7, 15), (), (4, 12), vel=0.9, swing=0.22, hatv=0.45)
put('drums', crash(0.8), 64.5)
pattern(66, 67.4, (0, 10), (), SIXT, (), (4, 12), vel=0.85, swing=0.22, hatv=0.35)
# launch build 68–71.5
pattern(68, 71.5, FOUR, (), EIGHTHS, vel=1.0, hatv=0.4)
put('drums', crash(0.8), 68.0)
roll = [(69.0 + i * 0.25) for i in range(4)] + [(70.0 + i * S16) for i in range(8)] + [(71.0 + i * S16 / 2) for i in range(16)]
for i, t in enumerate(roll):
    put('drums', snare(0.25 + 0.75 * i / len(roll)), t)
# drop 72–86
pattern(72, 86, FOUR, (4, 12), SIXT, OFF, vel=1.05, hatv=0.42)
for t in (72.0, 76.0, 80.0, 84.0):
    put('drums', crash(1.0 if t == 72 else 0.7), t)
# end 86–90
put('drums', kick(1.0), 86.0); kicks.append(86.0); put('drums', crash(0.8), 86.0)
put('drums', kick(1.1), 88.0); kicks.append(88.0); put('drums', clap(0.9), 88.0, send=0.5); put('drums', crash(0.9), 88.0)

# ------------------------------------------------------------------ bass
def bassline(t0, t1, steps=(0, 3, 6, 8, 11, 14), dur=0.22, v=1.0, octave=0):
    b = t0
    while b < t1 - 1e-6:
        for s in steps:
            t = b + s * S16
            if t >= t1:
                continue
            c = chord_at(t + 0.01)
            put('bass', sub808(ROOT[c] + octave, dur, v), t)
        b += BAR


bassline(0, 4, (0, 6, 8, 14))
put('bass', sub808(33, 1.8, 1.1, glide_from=45), 4.0)  # "in half": octave drop
put('bass', sub808(40, 1.9, 0.8), 6.0)
bassline(8, 14)
put('bass', sub808(45, 1.0, 1.0), 14.0)
put('bass', sub808(33, 1.4, 0.7, glide_from=45), 16.0)
bassline(20, 24, (0, 3, 7, 8, 10, 14), 0.18)
for i in range(int((32 - 25) / (BEAT / 2))):   # race: driving 8ths on A
    put('bass', sub808(45 if i % 8 != 7 else 48, 0.2, 0.75), 25.0 + i * BEAT / 2)
bassline(32, 35, (0, 2, 4, 6, 8, 10, 12, 14), 0.2)
bassline(36, 48, (0, 3, 6, 8, 11, 14), 0.24)
bassline(48, 57.5, (0, 6, 8, 14), 0.3)
bassline(58, 66, (0, 7, 10), 0.4, 0.9)
bassline(66, 67.4, (0, 10), 0.4, 0.8)
bassline(68, 71.5, (0, 2, 4, 6, 8, 10, 12, 14), 0.2, 0.9)
bassline(72, 86, (0, 3, 6, 8, 11, 14), 0.26, 1.05)
put('bass', sub808(41, 1.9, 1.0), 86.0)
put('bass', sub808(36, 2.4, 1.1), 88.0)

# ------------------------------------------------------------------ chords & plucks
def pads(t0, t1, v=0.8, cutoff=4500):
    for a, b, c in PROG:
        s, e = max(a, t0), min(b, t1)
        if e - s > 0.05:
            put('music', supersaw(CH[c], e - s, v, cutoff=cutoff, seed=int(s * 10)), s, send=0.35)


def stabs(t0, t1, steps=(0, 3, 6, 10), v=0.8, cutoff=3500, length=0.18):
    b = t0
    while b < t1 - 1e-6:
        for s in steps:
            t = b + s * S16
            if t < t1:
                c = chord_at(t + 0.01)
                put('music', supersaw(CH[c], length, v, cutoff=cutoff, a=0.003, r=0.08, seed=int(t * 100)), t, send=0.3)
        b += BAR


def arp(t0, t1, step=S16, octave=12, v=0.7, bright=1.0, pattern_=(0, 1, 2, 3, 2, 1), sq=False, rise=0.0):
    t = t0
    i = 0
    while t < t1 - 1e-6:
        c = CH[chord_at(t + 0.01)]
        m = c[pattern_[i % len(pattern_)] % len(c)] + octave + (12 if rise and (t - t0) / (t1 - t0) > 0.5 else 0)
        put('music', pluck(m, 0.25, v, bright + rise * (t - t0) / (t1 - t0), sq), t, p=0.35 * (1 if i % 2 else -1), send=0.25)
        t += step
        i += 1


stabs(0, 3.0, (0, 4, 8, 12), 1.1, 4500)
arp(0, 3.0, S16 * 2, 24, 0.55, 1.0, (0, 2, 1, 3))
put('music', supersaw([m - 12 for m in CH['Am']], 1.9, 0.9, cutoff=900, seed=5), 4.0, send=0.5)   # "in half": an octave down, dark
put('music', supersaw(CH['E7'], 2.0, 0.6, cutoff=2500, a=0.8, seed=6), 6.0, send=0.4)
arp(8, 14, S16 * 2, 12, 0.65)
stabs(8, 14, (0, 6, 12), 0.5, 2500)
put('music', supersaw(CH['Am'], 1.9, 0.5, cutoff=2000, a=0.3, seed=9), 14.0, send=0.5)
# inflate drone rising
t = tarr(1.5); drone = saw(110 * 2 ** (t * 1.2), 1.5) * np.clip(t / 1.4, 0, 1) * 0.12
put('music', lp(drone, 1800), 16.0, send=0.3)
put('music', organ([57, 60, 64], 1.0, 1.0), 18.0, send=0.6)
put('music', organ([53, 57, 60], 0.95, 1.0), 19.0, send=0.6)
stabs(20, 24, (0, 3, 6, 10, 12), 0.6, 3000)
arp(25, 32, S16, 12, 0.5, 0.6, (0, 2, 1, 3), rise=1.0)
pads(32, 35, 0.6, 3000)
# chorus
pads(36, 48, 0.9, 5200)
arp(36, 48, S16 * 2, 24, 0.35, 0.8)
pads(48, 57.5, 0.65, 2600)
arp(48, 57.5, S16, 24, 0.3, 0.9, (0, 1, 2, 3))
# garage: rhodes on the 1 and the "and" of 2, swung
for a, b, c in PROG:
    if 58 <= a < 67.4:
        for off in (0, 0.75, 1.25):
            if a + off < min(b, 67.4):
                put('music', rhodes(CH[c], 0.6 if off else 0.9, 0.9 if off == 0 else 0.6), a + off, send=0.4)
# launch build: pads opening
tb = tarr(3.5)
build = supersaw(CH['F'], 2.0, 0.8, cutoff=3000, seed=21)
put('music', build, 68.0, send=0.3)
put('music', supersaw(CH['Gsus'], 1.5, 0.9, cutoff=5000, seed=22), 70.0, send=0.3)
# drop
pads(72, 86, 1.0, 6000)
arp(72, 86, S16, 24, 0.3, 1.0, (0, 1, 2, 3, 2, 1))
put('music', supersaw(CH['F'], 1.9, 0.9, cutoff=4000, seed=30), 86.0, send=0.6)
put('music', supersaw(CH['C'] + [72], 2.5, 1.0, cutoff=5000, r=1.0, seed=31), 88.0, send=0.8)

# ------------------------------------------------------------------ lead hook (chorus + drop)
HOOK = {  # eighth-note grid per bar, None = rest, ('~', m) = tie
    'F': [76, 76, None, 79, None, 81, 79, None],
    'G': [74, 74, None, 79, None, 76, 74, None],
    'Em': [71, 71, None, 76, None, 79, 76, None],
    'Am': [72, None, 74, None, 76, None, 79, None],
    'C': [79, None, 76, None, 72, None, None, None],
}


def hook(t0, t1, v=1.0, voxy=False):
    prev = None
    for a, b, c in PROG:
        if a < t0 or a >= t1:
            continue
        line = HOOK.get(c, HOOK['F'])
        for i, m in enumerate(line):
            if m is None:
                continue
            t = a + i * BEAT / 2
            d = BEAT / 2 * 0.85
            if i + 1 < len(line) and line[i + 1] is None:
                d = BEAT * 0.9
            put('lead', lead(m, d, v, glide_from=prev if prev and abs(prev - m) <= 5 else None), t, p=0.0, send=0.35)
            if voxy:
                put('lead', vox(m - 12, d, 'aoau'[i % 4] if i % 4 < 4 else 'a', 0.5), t, p=0.2 * (1 if i % 2 else -1), send=0.5)
            prev = m


hook(0, 3.0, 0.75)
hook(36, 48, 0.9)
hook(72, 86, 1.0, voxy=True)
# vocal "hey" chops on the pink set / drop entries
for t in (12.0, 36.0, 72.0):
    put('lead', vox(64, 0.35, 'e', 0.9, scoop=-5), t, send=0.6)

# ------------------------------------------------------------------ SFX
def s_slam(v):
    t = tarr(0.35)
    thump = np.sin(2 * np.pi * (70 + 90 * np.exp(-t * 40)) * t) * np.exp(-t / 0.09)
    slap = bp(noise(0.35, 41), 1200, 5000) * np.exp(-t / 0.025)
    return (thump * 0.8 + slap * 0.7) * v


def s_snip(v):
    t = tarr(0.18)
    click = hp(noise(0.18, 42), 5000) * (np.exp(-t / 0.002) + 0.8 * np.exp(-np.maximum(t - 0.05, 0) / 0.002) * (t > 0.05))
    ping = np.sin(2 * np.pi * 5200 * t) * np.exp(-t / 0.02) * 0.3 + np.sin(2 * np.pi * 7400 * t) * np.exp(-t / 0.012) * 0.2
    swish = bp(noise(0.18, 43), 2500, 9000) * np.sin(np.pi * np.clip(t / 0.06, 0, 1)) * (t < 0.06) * 0.5
    return (click + ping + swish) * v * 0.9


def s_bigcut(v):
    t = tarr(1.4)
    rip = sweep_bp(noise(1.4, 44), 1500 + 5000 * np.clip(t / 0.3, 0, 1), 1.5) * np.clip(1 - t / 0.35, 0, 1) * (0.6 + 0.4 * (noise(1.4, 45) > 0.2))
    boom = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 10)) / SR) * np.exp(-t / 0.5)
    return (rip * 1.1 + sat(boom * 1.4, 1.5)) * v


def s_coins(v):
    out = np.zeros(int(1.2 * SR))
    r = np.random.default_rng(46)
    for k in range(9):
        st = r.uniform(0, 0.8)
        t = tarr(0.35)
        f = r.uniform(2400, 3600)
        x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.51 * t) + 0.3 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t / 0.08)
        i = int(st * SR)
        out[i:i + len(x)] += x[:len(out) - i] * r.uniform(0.2, 0.5)
    return out * v


def s_zipper(v, d):
    n = int((d + 0.1) * SR)
    out = np.zeros(n)
    t = 0.0
    r = np.random.default_rng(47)
    click = hp(noise(0.006, 48), 1500) * np.exp(-tarr(0.006) / 0.0012)
    while t < d:
        k = t / d
        rate = 70 + 330 * np.sin(np.pi * min(1, k * 1.2)) ** 0.7
        i = int(t * SR)
        amp = (0.4 + 0.6 * np.sin(np.pi * k)) * r.uniform(0.7, 1.0)
        out[i:i + len(click)] += click[:n - i] * amp
        t += 1 / rate
    out = bp(out, 900, 7000) + 0.3 * peak(out, 3200, 5)
    return out * v * 1.2


def s_whoosh(v, d=0.6):
    t = tarr(d)
    fc = 400 + 3500 * np.sin(np.pi * t / d)
    x = sweep_bp(noise(d, 49), fc, 1.2) * np.sin(np.pi * t / d) ** 2
    return x * v * 1.4


def s_pop(v):
    t = tarr(0.25)
    return (np.sin(2 * np.pi * np.cumsum(380 + 900 * np.clip(t / 0.05, 0, 1)) / SR) * np.exp(-t / 0.05) + hp(noise(0.25, 50), 3000) * np.exp(-t / 0.004) * 0.5) * v * 0.8


def s_sparkle(v):
    out = np.zeros(int(1.2 * SR))
    for k, m in enumerate([84, 88, 91, 96, 100]):
        t = tarr(0.8)
        x = np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t / 0.25) + 0.3 * np.sin(2 * np.pi * mtof(m) * 3.01 * t) * np.exp(-t / 0.08)
        i = int(k * 0.045 * SR)
        out[i:i + len(x)] += x[:len(out) - i] * 0.35
    return out * v


def s_ticks(v, d):
    n = int((d + 0.05) * SR)
    out = np.zeros(n)
    t = 0.0
    c = hp(noise(0.01, 51), 2000) * np.exp(-tarr(0.01) / 0.0015)
    while t < d:
        i = int(t * SR)
        out[i:i + len(c)] += c[:n - i]
        t += 1 / 28
    return peak(out, 2800, 3) * v * 1.5


def s_stretch(v):
    t = tarr(0.7)
    f = 180 * 2 ** (np.clip(t / 0.5, 0, 1) * 1.2) * (1 + 0.04 * np.sin(2 * np.pi * 30 * t))
    x = sweep_bp(saw(f, 0.7), f * 3, 3) * np.exp(-np.maximum(t - 0.5, 0) / 0.05)
    return x * v * 0.8


def s_flip(v):
    t = tarr(0.15)
    return sweep_bp(noise(0.15, 52), 800 + 6000 * t / 0.15, 2) * np.sin(np.pi * t / 0.15) * v


def s_stamp(v):
    t = tarr(0.4)
    thump = np.sin(2 * np.pi * np.cumsum(60 + 120 * np.exp(-t * 50)) / SR) * np.exp(-t / 0.12)
    slap = bp(noise(0.4, 53), 600, 4000) * np.exp(-t / 0.03)
    return sat((thump + slap * 0.8) * v * 1.2, 1.3)


def s_inflate(v, d):
    t = tarr(d)
    hiss = sweep_bp(noise(d, 54), 600 + 2400 * t / d, 2) * 0.3
    squeak = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (t / d * 1.5) * (1 + 0.03 * np.sin(2 * np.pi * 13 * t))) / SR) * 0.25
    return (hiss + squeak) * np.clip(t / 0.1, 0, 1) * v


def s_balloonpop(v):
    t = tarr(0.6)
    return (noise(0.6, 55) * np.exp(-t / 0.012) * 1.2 + np.sin(2 * np.pi * 80 * t) * np.exp(-t / 0.08)) * v


def s_thud(v):
    t = tarr(0.6)
    return sat(np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-t * 20)) / SR) * np.exp(-t / 0.2) * 1.5 + lp(noise(0.6, 56), 400) * np.exp(-t / 0.05), 1.4) * v


def s_sadhorn(v):
    notes = [(67, 0.28), (66, 0.28), (65, 0.28), (64, 0.9)]
    out = np.zeros(int(2.2 * SR))
    st = 0
    for i, (m, d) in enumerate(notes):
        t = tarr(d + 0.05)
        vib = 1 + (0.015 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0)
        x = saw(mtof(m - 12) * vib, d + 0.05) * 0.6 + square(mtof(m - 12) * vib, d + 0.05) * 0.4
        wah = 400 + 1400 * np.sin(np.pi * np.clip(t / d, 0, 1))
        y = sweep_lp(x, wah, 3) * np.clip(t / 0.02, 0, 1) * np.clip((d + 0.05 - t) / 0.05, 0, 1)
        i0 = int(st * SR)
        out[i0:i0 + len(y)] += y
        st += d
    return out * v * 0.6


def s_slap(v):
    t = tarr(0.3)
    return (bp(noise(0.3, 57), 900, 4000) * np.exp(-t / 0.035) + np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.06) * 0.6) * v


def s_typing(v, d):
    n = int((d + 0.1) * SR)
    out = np.zeros(n)
    r = np.random.default_rng(58)
    t = 0.0
    while t < d:
        c = hp(noise(0.03, int(t * 1000)), 1500) * np.exp(-tarr(0.03) / 0.004) * r.uniform(0.5, 1)
        c = c + peak(c, r.uniform(2500, 4200), 6) * 0.5
        i = int(t * SR)
        out[i:i + len(c)] += c[:n - i]
        t += r.uniform(0.045, 0.12)
    return out * v


def s_ding(v):
    t = tarr(1.6)
    f = 1318.5
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.6) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.2) + 0.3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.06)) * v * 0.45


def s_chaching(v):
    t = tarr(1.4)
    ka = bp(noise(1.4, 59), 2000, 8000) * np.exp(-t / 0.02) * 0.7
    ring = np.zeros_like(t)
    for d0, f in [(0.09, 2093), (0.16, 2637)]:
        tt = np.maximum(t - d0, 0)
        ring += (t > d0) * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.02 * tt)) * np.exp(-tt / 0.5)
    return (ka + ring * 0.4) * v


def s_shred(v):
    t = tarr(0.6)
    return (bp(noise(0.6, 60), 300, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * t))) * 0.5 + saw(95, 0.6) * 0.15) * np.sin(np.pi * t / 0.6) * v


def s_rise(v):
    t = tarr(0.45)
    return np.sin(2 * np.pi * np.cumsum(300 * 2 ** (t / 0.45 * 2)) / SR) * np.sin(np.pi * t / 0.45) * v * 0.35


def s_squish(v):
    t = tarr(0.35)
    return (np.sin(2 * np.pi * np.cumsum(260 * 2 ** (-t / 0.35 * 1.5) * (1 + 0.1 * np.sin(2 * np.pi * 25 * t))) / SR) * np.exp(-t / 0.15) + lp(noise(0.35, 61), 1500) * np.exp(-t / 0.05) * 0.4) * v * 0.7


def s_rewind(v, d):
    t = tarr(d)
    f = 150 * 2 ** (t / d * 3.5)
    x = saw(f * (1 + 0.2 * np.sin(2 * np.pi * 18 * t)), d) * 0.3 + sweep_bp(noise(d, 62), f * 4, 2) * 0.6
    return x * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.05, 0, 1) * v


def s_dialup(v, d):
    t = tarr(d)
    out = np.zeros_like(t)
    seg_ = lambda a, b: (t >= a) & (t < b)
    # dtmf dial
    for k, (f1, f2) in enumerate([(697, 1209), (770, 1336), (852, 1477), (941, 1336)]):
        a = k * 0.09
        out += seg_(a, a + 0.07) * (np.sin(2 * np.pi * f1 * t) + np.sin(2 * np.pi * f2 * t)) * 0.3
    # handshake tones + screech
    out += seg_(0.4, 0.7) * np.sin(2 * np.pi * 2100 * t) * 0.35
    out += seg_(0.72, 0.95) * (np.sin(2 * np.pi * 1650 * t) + np.sin(2 * np.pi * 1850 * t)) * 0.25
    scr = bp(noise(d, 63), 1000, 3500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * t)))
    out += (t >= 1.0) * scr * 0.35 + (t >= 1.0) * np.sin(2 * np.pi * (1000 + 900 * np.sin(2 * np.pi * 7 * t)) * t) * 0.15
    return out * np.clip((d - t) / 0.08, 0, 1) * v


def s_firework(v):
    t = tarr(1.4)
    whistle = np.sin(2 * np.pi * np.cumsum(900 + 2200 * np.clip(t / 0.35, 0, 1)) / SR) * (t < 0.35) * 0.2
    tb = np.maximum(t - 0.35, 0)
    boom = (t >= 0.35) * (lp(noise(1.4, 64), 900) * np.exp(-tb / 0.2) * 1.2)
    crackle = (t >= 0.45) * hp(noise(1.4, 65), 3000) * (noise(1.4, 66) > 0.93) * np.exp(-tb / 0.5)
    return (whistle + boom + crackle) * v


def s_riser(v, d):
    t = tarr(d)
    x = sweep_bp(noise(d, 67), 300 + 7000 * (t / d) ** 2, 1.5) * (t / d) ** 1.5
    x += saw(110 * 2 ** (t / d * 3), d) * (t / d) ** 2 * 0.15
    return x * v


def s_impact(v):
    t = tarr(2.5)
    boom = sat(np.sin(2 * np.pi * np.cumsum(35 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t / 0.9) * 1.6, 1.6)
    nz = lp(noise(2.5, 68), 3000) * np.exp(-t / 0.12)
    return (boom + nz * 0.6) * v


def s_poweroff(v):
    t = tarr(0.5)
    return (np.sin(2 * np.pi * np.cumsum(15000 * 2 ** (-t / 0.5 * 5)) / SR) * 0.15 + lp(noise(0.5, 69), 800) * np.exp(-t / 0.06) * 0.6) * v


SFX = dict(slam=s_slam, snip=s_snip, bigcut=s_bigcut, coins=s_coins, zipper=s_zipper, whoosh=s_whoosh, pop=s_pop, sparkle=s_sparkle, ticks=s_ticks,
           stretch=s_stretch, flip=s_flip, stamp=s_stamp, inflate=s_inflate, balloonpop=s_balloonpop, thud=s_thud, sadhorn=s_sadhorn, slap=s_slap,
           typing=s_typing, ding=s_ding, chaching=s_chaching, shred=s_shred, rise=s_rise, squish=s_squish, rewind=s_rewind, dialup=s_dialup,
           firework=s_firework, riser=s_riser, impact=s_impact)
DURS = {'zipper', 'ticks', 'inflate', 'typing', 'rewind', 'dialup', 'riser'}
for e in CUES['sfx']:
    fn = SFX[e['s']]
    x = fn(e.get('v', 1.0), e['d']) if e['s'] in DURS else fn(e.get('v', 1.0))
    p = {'whoosh': 0.3, 'coins': -0.2, 'sparkle': 0.25, 'typing': -0.1}.get(e['s'], 0.0)
    put('sfx', x, e['t'], p=p, send=0.15)
put('sfx', s_poweroff(0.8), 67.45)

# ------------------------------------------------------------------ gaps: hard silences for drama
def mute(t0, t1, buses=('drums', 'bass', 'music', 'lead'), fade=0.01):
    i0, i1 = int(t0 * SR), int(t1 * SR)
    f = int(fade * SR)
    for b in buses:
        bus[b][i0:i1] *= 0
        bus[b][i0 - f:i0] *= np.linspace(1, 0, f)[:, None]


mute(17.5, 18.0)          # the POP: dead air
mute(71.5, 72.0)          # the half-beat before the drop: only the zipper
mute(67.45, 68.0)         # CRT off

# ------------------------------------------------------------------ mix
side = np.ones(N)
tt = np.arange(N) / SR
for k in kicks:
    i = int(k * SR)
    L = int(0.3 * SR)
    seg = np.arange(min(L, N - i)) / SR
    side[i:i + len(seg)] = np.minimum(side[i:i + len(seg)], 1 - 0.55 * np.exp(-seg / 0.09))
for b in ('music', 'lead'):
    bus[b] *= side[:, None]
bus['bass'] *= (0.35 + 0.65 * side)[:, None]

verb = convolve_st(bus['verb_send'], reverb_ir(2.4, 0.6))[:N] * 0.35
# phone translation: an octave-up, saturated copy of the bass so it is heard on small speakers
bass_mid = np.stack([bp(sat(bus['bass'][:, c] * 3, 3), 150, 1200) for c in range(2)], 1) * 0.35
# section dynamics for the music (sfx stay foreground)
auto = np.interp(tt, [0, 4, 4.01, 8, 8.01, 16, 16.01, 24, 24.01, 34, 36, 48, 48.01, 58, 58.01, 68, 71.5, 72, 86, 90.6],
                     [1.0, 1.0, .85, .85, .8, .8, .78, .78, .75, .95, 1.0, 1.0, .88, .88, .8, .8, 1.0, 1.12, 1.12, 1.0])[:, None]
mix = (bus['drums'] * 0.9 + bus['bass'] * 0.5 + bass_mid + bus['music'] * 1.5 + bus['lead'] * 0.9 + verb) * auto + bus['sfx'] * 0.95
mix = hp(mix.T, 28).T
# matching EQ toward a pop target curve (octave bands, zero-phase, capped ±6 dB)
TGT = {31: -9, 63: 0, 125: -1, 250: -5, 500: -8, 1000: -10, 2000: -12, 4000: -14, 8000: -17, 16000: -23}
F = np.fft.rfft(mix, axis=0)
fr = np.fft.rfftfreq(len(mix), 1 / SR)
pw = (np.abs(F) ** 2).mean(1)
cf = np.array(list(TGT))
cur = np.array([10 * np.log10(pw[(fr >= c / 2 ** .5) & (fr < c * 2 ** .5)].sum() + 1e-20) for c in cf])
cur -= cur.max()
corr = np.clip(np.array(list(TGT.values())) - cur, -6, 6)
corr -= corr.max() * 0  # keep absolute
g = 10 ** (np.interp(np.log2(np.maximum(fr, 20)), np.log2(cf), corr) / 20)
mix = np.fft.irfft(F * g[:, None], n=len(mix), axis=0)
print('EQ correction dB:', dict(zip(cf.tolist(), np.round(corr, 1).tolist())))
# glue + limiter: normalise so the 99.95th percentile sits at 0.95, soft clip, then -1 dBFS peak
q = np.quantile(np.abs(mix), 0.995)
mix = sat(mix / q * 0.92, 1.6)
mix = mix / np.max(np.abs(mix)) * 10 ** (-1 / 20)
# fade tail
f = int(1.2 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]
os.makedirs(HERE, exist_ok=True)
wavfile.write(os.path.join(HERE, 'mix.wav'), SR, (mix * 32767).astype(np.int16))
if '--stems' in sys.argv:
    for k in ('drums', 'bass', 'music', 'lead', 'sfx'):
        x = bus[k] / (np.max(np.abs(bus[k])) + 1e-9) * 0.8
        wavfile.write(os.path.join(HERE, f'stem_{k}.wav'), SR, (x * 32767).astype(np.int16))
rms = lambda a, b: 20 * np.log10(np.sqrt(np.mean(mix[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
print('wrote audio/mix.wav', f'{len(mix) / SR:.2f}s')
for s in CUES['sections']:
    print(f"  {s['id']:7s} {s['t']:5.1f}-{s['end']:5.1f}  rms {rms(s['t'], s['end']):6.1f} dB")
