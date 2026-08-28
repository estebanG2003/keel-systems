"""Generate brand-name candidates and screen them for a free .com.

The bottleneck in naming was never generating names, it was checking them.
This does the checking, so a batch is 2000 candidates instead of five.

Three ways to make candidates, one shared availability check:
    --words FILE   real words (the Apple route: arbitrary, not descriptive)
    --roots N      real Latin stems blended (the Verizon route)
    --coined N     invented to spec (the Kodak route)

Generated names obey research findings, not taste: 6-8 characters for recall,
a plosive first letter, only letters that make the SAME sound in English,
French and Spanish, and no French nasal sequence -- so the name survives being
heard once on a referral call and spelled back correctly.

IT CHECKS DOMAINS, NOT COMPANIES. A free domain is not a free name: Mandolin,
Ribera, Linen and Cardamom all had free "<word>systems.com" and are all live
AI companies. Web-search the finalists before you commit to one.

Usage:
    python name_check.py --words nouns.txt --suffix systems   # X Systems
    python name_check.py --words nouns.txt --tld systems      # x.systems
    python name_check.py --roots 500 --tld ai
    python name_check.py --test                               # no network
"""

import argparse
import random
import socket
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Consonants that map to one sound across EN/FR/ES. Deliberately excludes
# j h z x w y c g q (each says something different in at least one language).
ONSETS = "ptkmnlfbdrsv"
VOWELS = "aeio"
PLOSIVES = "ptkbd"
CODAS = "lnrst"

# Clusters that are legal and identically pronounced in all three languages.
# Random CV-CV-CV alone reads as baby-babble (babenes, bafipot); clusters are
# what make a coined name sound built rather than burbled.
CLUSTERS = ("pr", "tr", "kr", "br", "dr", "fr", "pl", "kl", "bl", "fl")
FIRST = list(PLOSIVES) + [c for c in CLUSTERS if c[0] in PLOSIVES]
REST = list(ONSETS) + list(CLUSTERS)

# Real Latin/Romance roots, spelled so they read the same in EN/FR/ES.
# Verizon = veritas + horizon, Novartis = novae artes, Klarna = klar.
# The big invented names are recombined MEANING, not random letters -- so the
# generator builds from these and reports which root each name came from.
ROOTS = {
    "ver": "true", "fid": "trust", "kur": "care for", "tut": "safeguard",
    "val": "worth, strength", "firm": "steady", "salv": "keep safe",
    "kred": "believe", "pakt": "agreement", "port": "carry", "ten": "hold",
    "sta": "stand", "mod": "measure", "grat": "welcome, thanks",
    "lum": "light", "klar": "clear", "ord": "order", "fer": "carry",
    "plen": "full", "nov": "new", "vit": "life", "lev": "lift",
    "fund": "foundation", "par": "make ready", "sol": "whole", "dom": "home",
    "don": "give", "duk": "lead", "reg": "rule", "sen": "sense",
    "vis": "see", "aud": "hear", "prob": "prove", "apt": "fit, suited",
}
# Endings drawn from names that already work: Klarn-a, Verc-el, Fig-ma, Okt-a.
TAILS = ("a", "o", "el", "er", "is", "ar", "ia", "os", "et", "ur", "al", "ex")
# rdap.org bootstraps to whichever registry owns the TLD, so this works for
# .com and .ai alike. A 404 means genuinely unregistered.
RDAP = "https://rdap.org/domain/{}"


def readable(word):
    """No French nasal vowel.

    French nasalizes a vowel before n/m only when that n/m is NOT itself
    followed by a vowel. So 'sondel' (son-del) splits between a francophone
    and an anglophone, but 'peltano' (pel-ta-no) reads the same to both.
    """
    for i, ch in enumerate(word):
        if ch in "nm" and i > 0 and word[i - 1] in VOWELS:
            # Sentinel, not "", because "" is a substring of every string.
            nxt = word[i + 1] if i + 1 < len(word) else "#"
            if nxt not in VOWELS:
                return False
    return True


def in_spec(word):
    return 6 <= len(word) <= 8 and word[0] in PLOSIVES and readable(word)


def coin(rng):
    """One candidate: plosive-initial, no consonant reused, optional coda.

    Reusing a consonant is what produced babble in the first pass, so each
    consonant sound gets used once per word.
    """
    used, parts = set(), []
    for i in range(rng.choice([2, 3])):
        pool = FIRST if i == 0 else REST
        choices = [o for o in pool if not (set(o) & used)]
        if not choices:
            return ""
        onset = rng.choice(choices)
        used.update(onset)
        parts.append(onset + rng.choice(VOWELS))
    word = "".join(parts)
    if rng.random() < 0.6:
        coda = rng.choice([c for c in CODAS if c not in used] or [""])
        word += coda
    return word


def coin_rooted(rng):
    """A real root plus a working ending, or two roots. Returns (word, gloss).

    Shaped to the canon rather than to the raw recall research: Kodak, Xerox,
    Sonos, Figma, Okta, Brex, Klarna and Vercel are all 4-6 letters and two
    syllables. Seven-letter three-syllable strings read as babble.
    """
    r1 = rng.choice(list(ROOTS))
    if rng.random() < 0.45:
        r2 = rng.choice([r for r in ROOTS if r != r1])
        # Bridge with a vowel so it flows like Ver-i-zon / Nov-a-rtis. Jamming
        # two stems together gives consonant pileups (apttut, firmaud).
        bridge = "" if r1[-1] in VOWELS or r2[0] in VOWELS else rng.choice(VOWELS)
        word = r1 + bridge + r2 + rng.choice(("a", "o", ""))
        return word, f"{ROOTS[r1]} + {ROOTS[r2]}"
    return r1 + rng.choice(TAILS), ROOTS[r1]


def in_spec_rooted(word):
    return (4 <= len(word) <= 7 and readable(word)
            and all(c in ONSETS + VOWELS + "u" for c in word))


def generate_rooted(n, seed=None):
    rng = random.Random(seed)
    out = {}
    for _ in range(n * 200):
        if len(out) >= n:
            break
        word, gloss = coin_rooted(rng)
        if in_spec_rooted(word) and word not in ROOTS:
            out[word] = gloss
    return out


def generate(n, seed=None):
    rng = random.Random(seed)
    out = set()
    # Bounded so a too-narrow spec can't spin forever.
    for _ in range(n * 200):
        if len(out) >= n:
            break
        w = coin(rng)
        if in_spec(w):
            out.add(w)
    return sorted(out)


def has_dns(domain):
    try:
        socket.getaddrinfo(domain, None)
        return True
    except socket.gaierror:
        return False
    except Exception:
        return True  # unsure -> treat as taken, we only want confident misses


def is_registered(domain, tries=3):
    """Authoritative check: RDAP 404s on an unregistered domain.

    RDAP rate-limits, and a throttled request looks identical to a taken
    domain unless you retry -- two runs over the same words disagreed on
    cavern/bobbin/tassel until this backoff went in.
    """
    for attempt in range(tries):
        try:
            urllib.request.urlopen(RDAP.format(domain), timeout=15)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return False
            if e.code not in (429, 500, 502, 503):
                return True
        except Exception:
            pass
        time.sleep(1.5 * (attempt + 1))
    return True  # still unsure -> report taken rather than promise free


def screen(words, rdap_cap=80, tld="com"):
    """DNS-filter everything, then RDAP-confirm the survivors."""
    doms = [f"{w}.{tld}" for w in words]
    with ThreadPoolExecutor(max_workers=64) as pool:
        no_dns = [w for w, live in zip(words, pool.map(has_dns, doms)) if not live]

    # ponytail: DNS is a cheap proxy (a registered domain can have no A record),
    # so RDAP is the real answer. Capped because RDAP rate-limits; raise if the
    # first batch isn't enough. Sampled, not sliced -- slicing a sorted list
    # returns only the alphabetical head (every survivor starting "ba").
    checked = random.Random(0).sample(no_dns, min(rdap_cap, len(no_dns)))
    with ThreadPoolExecutor(max_workers=8) as pool:
        regs = pool.map(is_registered, [f"{w}.{tld}" for w in checked])
    return no_dns, [w for w, reg in zip(checked, regs) if not reg]


def test():
    assert readable("peltano")                      # pel-ta-no, n before a vowel
    assert not readable("sondel") and not readable("tanvel")
    assert not readable("amvela") and not readable("kadin")  # nasal at word end
    assert in_spec("peltano")
    assert not in_spec("talvo")        # 5 chars, under the recall window
    assert not in_spec("meltano")      # m is not a plosive
    assert not in_spec("pontero")      # nasal "on"
    assert all(in_spec(w) for w in generate(200, seed=1))
    assert generate(50, seed=7) == generate(50, seed=7)  # reproducible
    # no consonant reused within a word -- the anti-babble rule
    for w in generate(300, seed=3):
        cons = [c for c in w if c not in VOWELS]
        assert len(cons) == len(set(cons)), w
    print("ok")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--roots", type=int, metavar="N",
                    help="build N candidates from real roots (recommended)")
    ap.add_argument("--coined", type=int, metavar="N", help="invent N candidates")
    ap.add_argument("--words", metavar="FILE", help="screen real words from FILE")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--suffix", default="", help="append to each word, e.g. systems")
    ap.add_argument("--tld", default="com", help="com (default) or ai, co, ...")
    ap.add_argument("--rdap-cap", type=int, default=80)
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()

    if a.test:
        return test()

    gloss = {}
    if a.words:
        with open(a.words, encoding="utf-8") as f:
            words = [w.strip().lower() for w in f if w.strip()]
    elif a.roots:
        gloss = generate_rooted(a.roots, a.seed)
        words = sorted(gloss)
    elif a.coined:
        words = generate(a.coined, a.seed)
    else:
        ap.error("need --roots N, --coined N, --words FILE, or --test")

    # The suffix rides along for the domain check only; the name stays the word.
    probes = [w + a.suffix for w in words]
    print(f"{len(probes)} candidates -> checking .{a.tld}", file=sys.stderr)
    no_dns, free = screen(probes, a.rdap_cap, a.tld)
    print(f"{len(no_dns)} with no DNS, RDAP-confirmed {len(free)} free:\n", file=sys.stderr)
    cut = len(a.suffix) or None
    for p in sorted(free):
        w = p[:-cut] if cut else p
        print(f"{w:<10} {gloss[w]}" if w in gloss else w)


if __name__ == "__main__":
    main()
