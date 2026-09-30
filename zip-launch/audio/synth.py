"""synth.py: a tiny offline synth + sampler-free drum machine in numpy. Everything is deterministic (seeded)."""
import numpy as np
from scipy import signal

SR = 44100
RNG = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


def tarr(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur, seed=None):
    r = np.random.default_rng(seed) if seed is not None else RNG
    return r.uniform(-1, 1, int(dur * SR))


def env_exp(dur, decay, attack=0.002):
    t = tarr(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def adsr(dur, a=0.005, d=0.1, s=0.7, r=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    rel = int(r * SR)
    if rel > 0:
        e = np.concatenate([e, e[-1] * np.linspace(1, 0, rel) ** 2]) if n > 0 else np.zeros(rel)
    return e


def phase_of(freq, dur, ph0=0.0):
    f = np.broadcast_to(np.asarray(freq, float), (int(dur * SR),)) if np.ndim(freq) == 0 else np.asarray(freq, float)
    return (ph0 + np.cumsum(f) / SR) % 1.0, f / SR


def polyblep(t, dt):
    y = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    y[m] = x + x - x * x - 1
    m2 = t > 1 - dt
    x = (t[m2] - 1) / dt[m2]
    y[m2] = x * x + x + x + 1
    return y


def saw(freq, dur, ph0=0.0):
    ph, dt = phase_of(freq, dur, ph0)
    return 2 * ph - 1 - polyblep(ph, dt)


def square(freq, dur, ph0=0.0, pw=0.5):
    ph, dt = phase_of(freq, dur, ph0)
    y = np.where(ph < pw, 1.0, -1.0)
    y += polyblep(ph, dt)
    y -= polyblep((ph + (1 - pw)) % 1, dt)
    return y


def sine(freq, dur, ph0=0.0):
    ph, _ = phase_of(freq, dur, ph0)
    return np.sin(2 * np.pi * ph)


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [max(lo, 20), min(hi, SR * 0.45)], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def peak(x, fc, q=4.0):
    b, a = signal.iirpeak(min(fc, SR * 0.45), q, fs=SR)
    return signal.lfilter(b, a, x)


def sweep_lp(x, fc_arr, q=0.9, block=256):
    """time-varying resonant low-pass (block-wise biquad, state carried)."""
    y = np.zeros_like(x)
    zi = np.zeros((1, 2))
    for i in range(0, len(x), block):
        fc = float(np.clip(fc_arr[min(i, len(fc_arr) - 1)], 30, SR * 0.45))
        w0 = 2 * np.pi * fc / SR
        alpha = np.sin(w0) / (2 * q)
        cw = np.cos(w0)
        b = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2]) / (1 + alpha)
        a = np.array([1, -2 * cw / (1 + alpha), (1 - alpha) / (1 + alpha)])
        sos = np.concatenate([b, a])[None]
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y


def sweep_bp(x, fc_arr, q=2.0, block=256):
    y = np.zeros_like(x)
    zi = np.zeros((1, 2))
    for i in range(0, len(x), block):
        fc = float(np.clip(fc_arr[min(i, len(fc_arr) - 1)], 40, SR * 0.45))
        w0 = 2 * np.pi * fc / SR
        alpha = np.sin(w0) / (2 * q)
        cw = np.cos(w0)
        b = np.array([alpha, 0, -alpha]) / (1 + alpha)
        a = np.array([1, -2 * cw / (1 + alpha), (1 - alpha) / (1 + alpha)])
        sos = np.concatenate([b, a])[None]
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y


def sat(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


def pan(x, p=0.0):
    """equal-power pan, p in [-1, 1] → (n, 2)"""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def reverb_ir(dur=2.2, decay=0.55, seed=3, bright=6000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    irs = []
    for ch in range(2):
        nz = r.normal(0, 1, n) * np.exp(-t / decay)
        nz = lp(nz, bright) * (1 - np.exp(-t / 0.01))
        irs.append(nz)
    ir = np.stack(irs, 1)
    return ir / np.sqrt((ir ** 2).sum() / 2)


def convolve_st(x, ir):
    """x (n, 2) or (n,), ir (m, 2) → (n + m - 1, 2)"""
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in range(2)], 1)


# ------------------------------------------------------------------ drums
def kick(v=1.0, dur=0.5, tone=48, punch=110):
    t = tarr(dur)
    f = tone + punch * np.exp(-t * 28) + 40 * np.exp(-t * 160)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    click = hp(noise(dur, 11), 3000) * np.exp(-t / 0.0025) * 0.5
    return sat((body + click) * v, 1.8) * 0.95


def snare(v=1.0, dur=0.35):
    t = tarr(dur)
    tone = (np.sin(2 * np.pi * 185 * t) * 0.6 + np.sin(2 * np.pi * 330 * t) * 0.3) * np.exp(-t / 0.06)
    nz = bp(noise(dur, 12), 1200, 9000) * np.exp(-t / 0.13)
    return sat((tone * 0.7 + nz) * v, 1.4) * 0.8


def clap(v=1.0, dur=0.4, seed=13):
    t = tarr(dur)
    nz = bp(noise(dur, seed), 900, 3200, 2)
    e = np.zeros_like(t)
    for k, d in enumerate([0, 0.009, 0.019, 0.03]):
        e += np.where(t >= d, np.exp(-(t - d) / 0.0065), 0) * (0.7 if k < 3 else 1.0)
    e += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.11), 0) * 0.55
    return nz * e * v * 1.3


def hat(v=1.0, open_=False, seed=14):
    dur = 0.35 if open_ else 0.08
    t = tarr(dur)
    ratios = [2, 3, 4.16, 5.43, 6.79, 8.21]
    metal = sum(square(205 * r, dur) for r in ratios)
    x = hp(metal * 0.3 + noise(dur, seed) * 0.6, 7000, 3)
    return x * np.exp(-t / (0.11 if open_ else 0.022)) * v * 0.55


def crash(v=1.0, dur=2.2):
    t = tarr(dur)
    ratios = [1, 1.47, 1.93, 2.53, 3.11, 3.87]
    metal = sum(square(410 * r, dur) for r in ratios)
    x = hp(metal * 0.2 + noise(dur, 15), 3500, 2)
    return x * np.exp(-t / 0.7) * (1 - np.exp(-t / 0.002)) * v * 0.45


def sub808(midi, dur, v=1.0, glide_from=None):
    t = tarr(dur)
    f1 = mtof(midi)
    f = np.full_like(t, f1)
    if glide_from is not None:
        f = mtof(glide_from) + (f1 - mtof(glide_from)) * np.clip(t / 0.08, 0, 1)
    f = f * (1 + 0.6 * np.exp(-t * 40))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.clip(t / 0.004, 0, 1) * np.exp(-t / max(dur * 0.9, 0.2))
    e *= np.clip((dur - t) / 0.02, 0, 1)
    return sat(x * e * v, 2.2) * 0.8


# ------------------------------------------------------------------ tonal
def supersaw(midis, dur, v=1.0, cutoff=5000, detune=0.18, voices=7, a=0.01, r=0.25, seed=0):
    rr = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros((n + int(r * SR), 2))
    e = adsr(dur, a, 0.3, 0.8, r)
    for m in midis:
        f = mtof(m)
        for k in range(voices):
            d = (k - (voices - 1) / 2) / ((voices - 1) / 2) * detune
            x = saw(f * 2 ** (d / 12), dur + r, rr.random())
            out += pan(x[:len(e)] * e, (k / (voices - 1)) * 1.6 - 0.8)[:len(out)]
    out = np.stack([lp(out[:, c], cutoff) for c in range(2)], 1)
    return out * v * 0.09 / max(1, len(midis) ** 0.5)


def pluck(midi, dur=0.3, v=1.0, bright=1.0, sq=False):
    t = tarr(dur)
    f = mtof(midi)
    x = (square(f, dur) * 0.5 + saw(f * 1.003, dur) * 0.5) if sq else saw(f, dur)
    fc = 300 + 5000 * bright * np.exp(-t / 0.06)
    y = sweep_lp(x, fc * np.ones_like(t) if np.ndim(fc) == 0 else fc, q=1.2)
    return y * np.exp(-t / 0.18) * np.clip(t / 0.002, 0, 1) * v * 0.5


def rhodes(midis, dur, v=1.0):
    t = tarr(dur + 0.4)
    out = np.zeros_like(t)
    for m in midis:
        f = mtof(m)
        out += np.sin(2 * np.pi * f * t) * np.exp(-t / 1.6) + 0.35 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.5) + 0.12 * np.sin(2 * np.pi * f * 14.1 * t) * np.exp(-t / 0.03)
    out *= (1 + 0.15 * np.sin(2 * np.pi * 5.2 * t)) * np.clip((dur + 0.4 - t) / 0.3, 0, 1) * np.clip(t / 0.003, 0, 1)
    return out * v * 0.18 / max(1, len(midis) ** 0.5)


def organ(midis, dur, v=1.0):
    t = tarr(dur)
    out = np.zeros_like(t)
    for m in midis:
        f = mtof(m) * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t))
        for h, a in [(1, 1), (2, .5), (3, .3), (4, .2), (6, .1)]:
            out += a * np.sin(2 * np.pi * np.cumsum(f * h) / SR)
    e = np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.2, 0, 1)
    return out * e * v * 0.07 / max(1, len(midis) ** 0.5)


def lead(midi, dur, v=1.0, glide_from=None, vib=0.25):
    t = tarr(dur + 0.15)
    f1 = mtof(midi)
    f = np.full_like(t, f1)
    if glide_from is not None:
        f = mtof(glide_from) + (f1 - mtof(glide_from)) * np.clip(t / 0.05, 0, 1)
    f = f * 2 ** (vib / 12 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.15) / 0.2, 0, 1))
    x = square(f, len(t) / SR, pw=0.3) * 0.6 + saw(f * 1.004, len(t) / SR) * 0.5
    x = lp(x, 3800)
    e = adsr(dur, 0.006, 0.08, 0.75, 0.15)[:len(t)]
    return x[:len(e)] * e * v * 0.2


FORMANTS = {'a': (800, 1150, 2900), 'o': (450, 800, 2830), 'u': (325, 700, 2530), 'e': (400, 1700, 2600), 'i': (300, 2200, 3000)}


def vox(midi, dur, vowel='a', v=1.0, scoop=-2):
    t = tarr(dur + 0.1)
    f1 = mtof(midi)
    f = f1 * 2 ** ((scoop * np.exp(-t / 0.04)) / 12) * 2 ** (0.2 / 12 * np.sin(2 * np.pi * 5.8 * t))
    src = saw(f, len(t) / SR) + 0.1 * noise(len(t) / SR, 31)
    F = FORMANTS[vowel]
    y = sum(peak(src, fc, q) * g for fc, q, g in zip(F, (6, 9, 11), (1.0, 0.6, 0.25)))
    e = adsr(dur, 0.01, 0.1, 0.8, 0.1)[:len(t)]
    return lp(y[:len(e)] * e, 6000) * v * 0.35
