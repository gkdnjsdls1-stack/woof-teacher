# -*- coding: utf-8 -*-
"""다운로드의 Gemini 원본 -> public/art/*.webp  (python3 scripts/import-art.py)

Gemini 의 "투명 배경"은 체크무늬가 **픽셀로 그려져** 있습니다(알파가 전부 불투명).
그대로 쓰면 배경 위에 회색 격자 네모가 뜹니다. 떼는 규칙:
 1) 가장자리에서 흘려넣어 바깥 배경 + 바닥 그림자를 지운다.
 2) 남은 갇힌 영역(다리 사이·목줄 고리 안) 중 아래 둘 중 하나면 지운다.
    - 회색 207 이 25% 이상  → 민무늬 체크
    - 격자 무늬가 30% 이상  → 물건 색에 물든 체크. 격자 한 칸이 16px 이라
      16px 옆은 색이 바뀌고(d16 큼) 32px 옆은 그대로(d32 작음)인 성질을 씁니다.
 느슨하게 잡으면 푸들 크림색 털에 구멍이 뚫리고, 좁게 잡으면 격자가 남습니다.

어느 파일이 무엇인지는 scripts/art-sources.json 에 있습니다 (Gemini 파일명이 난수라서).
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

DL = os.path.expanduser('~/Downloads')
MAP = json.load(open(os.path.join(os.path.dirname(__file__), 'art-sources.json')))
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'art')


def cutout(src, out):
    im = Image.open(src).convert('RGBA')
    a = np.asarray(im).astype(np.int16)
    rgb = a[:, :, :3]
    mx, mn = rgb.max(2), rgb.min(2)
    loose = ((mx - mn) <= 45) & (mn >= 115)          # 배경 + 바닥 그림자
    grey  = (np.abs(rgb - 207) <= 14).all(2)          # 체크무늬의 회색 칸

    # 색이 물든 체크무늬(반투명 날개·안경알·비누거품 속)를 무늬 자체로 찾습니다.
    # 격자 한 칸이 16px 이므로 16px 옆은 다른 칸(밝기가 바뀜), 32px 옆은 같은 칸(그대로).
    lum = rgb.mean(2)
    d16 = np.full(lum.shape, 0.0); d32 = np.full(lum.shape, 99.0)
    d16[:, :-16] = np.abs(lum[:, :-16] - lum[:, 16:])
    d32[:, :-32] = np.abs(lum[:, :-32] - lum[:, 32:])
    checker = (d16 > 7) & (d32 < 4)

    # 1) 가장자리에서 흘려넣기
    lab, n = ndimage.label(loose)
    edge = set(lab[0].tolist()) | set(lab[-1].tolist()) | set(lab[:,0].tolist()) | set(lab[:,-1].tolist())
    edge.discard(0)
    kill = np.isin(lab, list(edge)) if edge else np.zeros_like(loose)

    # 2) 남은 갇힌 영역 중 회색이 25% 이상인 것만
    for i in range(1, n + 1):
        if i in edge: continue
        m = lab == i
        if not m.sum(): continue
        if grey[m].mean() >= 0.25 or checker[m].mean() >= 0.30:
            kill |= m

    alpha = np.where(kill, 0, 255).astype(np.uint8)
    im.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    im = im.crop(im.getbbox())
    im.thumbnail((480, 480), Image.LANCZOS)
    im.save(out, 'WEBP', quality=82, method=4)


for name, fn in MAP['cutout'].items():
    p = os.path.join(ROOT, name + '.webp')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    cutout(os.path.join(DL, fn), p)
for name, fn in MAP['scene'].items():
    p = os.path.join(ROOT, name + '.webp')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im = Image.open(os.path.join(DL, fn)).convert('RGB')
    im.thumbnail((720, 1280), Image.LANCZOS)
    im.save(p, 'WEBP', quality=80, method=4)
print('완료 %d장' % (len(MAP['cutout']) + len(MAP['scene'])))
