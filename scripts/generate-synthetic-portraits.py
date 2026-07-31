from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'synthetic-seed' / 'portraits'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 768, 960

profiles = [
    dict(name='yasmin', bg1='#d9a7a7', bg2='#7c948b', skin='#b9785e', face='oval', hijab=True, hijab_color='#7b3f59', hijab_accent='#d6a7b8', outfit='#4b2e4b', body='slim', expression='bright', pose='left', glasses=False, hair=None, beard=None, age=24),
    dict(name='bilal', bg1='#d5c2a5', bg2='#53727c', skin='#9d5f46', face='square', hijab=False, hair='short_fade', hair_color='#211b1a', outfit='#203b54', body='athletic', expression='confident', pose='right', glasses=False, beard='boxed', age=27),
    dict(name='amina', bg1='#d6b0a3', bg2='#768b72', skin='#c58a6d', face='heart', hijab=True, hijab_color='#355f64', hijab_accent='#9db8ad', outfit='#874f45', body='curvy', expression='calm', pose='front', glasses=True, hair=None, beard=None, age=29),
    dict(name='idris', bg1='#b8c7d0', bg2='#8e6e5d', skin='#7f4939', face='long', hijab=False, hair='shaved', hair_color='#1e1918', outfit='#3f4c3f', body='broad', expression='reserved', pose='left', glasses=False, beard='full', age=31),
    dict(name='maryam', bg1='#e2c5a8', bg2='#77709b', skin='#d6a184', face='round', hijab=True, hijab_color='#c58f3e', hijab_accent='#f1d09b', outfit='#5c426f', body='petite', expression='playful', pose='right', glasses=False, hair=None, beard=None, age=26),
    dict(name='samir', bg1='#b6a89b', bg2='#5f6f68', skin='#a96d52', face='square', hijab=False, hair='receding', hair_color='#2a211f', outfit='#654437', body='stocky', expression='warm', pose='front', glasses=False, beard='salt_pepper', age=33),
    dict(name='noura', bg1='#c5d1d5', bg2='#9b6d7b', skin='#8e5544', face='oval', hijab=False, hair='curly_bob', hair_color='#2c1d22', outfit='#265e63', body='average', expression='thoughtful', pose='left', glasses=True, beard=None, age=30),
    dict(name='youssef', bg1='#d3c4aa', bg2='#45666d', skin='#b17659', face='diamond', hijab=False, hair='wavy_crop', hair_color='#261d1c', outfit='#6d4d2f', body='lean', expression='energetic', pose='right', glasses=False, beard='stubble', age=28),
    dict(name='hafsa', bg1='#d9c4bd', bg2='#657b72', skin='#c18467', face='long', hijab=True, hijab_color='#574a7b', hijab_accent='#a99fc7', outfit='#8a5c62', body='tall', expression='serene', pose='front', glasses=False, hair=None, beard=None, age=32),
    dict(name='omar', bg1='#c6d1b8', bg2='#7f6474', skin='#80503f', face='round', hijab=False, hair='buzz', hair_color='#191817', outfit='#344f75', body='athletic', expression='friendly', pose='left', glasses=True, beard='goatee', age=25),
]

def hexrgb(value):
    value = value.lstrip('#')
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))

def blend(a, b, amount):
    return tuple(round(a[index] * (1 - amount) + b[index] * amount) for index in range(3))

def gradient(bg1, bg2):
    start, end = hexrgb(bg1), hexrgb(bg2)
    image = Image.new('RGB', (W, H), start)
    pixels = image.load()
    for y in range(H):
        for x in range(W):
            amount = 0.55 * y / H + 0.45 * x / W
            pixels[x, y] = blend(start, end, amount)
    return image

def path_polygon(cx, cy, shape):
    shapes = {
        'square': [(-145,-145),(125,-150),(160,-85),(150,120),(85,175),(-80,175),(-150,115),(-160,-75)],
        'heart': [(-130,-145),(0,-175),(135,-140),(155,-55),(115,95),(0,190),(-115,95),(-155,-55)],
        'diamond': [(-115,-160),(0,-190),(120,-155),(160,0),(105,165),(0,205),(-105,165),(-160,0)],
        'long': [(-120,-185),(0,-205),(120,-180),(145,-75),(125,145),(55,210),(-55,210),(-125,145),(-145,-75)],
        'round': [(-140,-135),(0,-175),(145,-130),(175,0),(135,135),(0,175),(-135,135),(-175,0)],
        'oval': [(-130,-170),(0,-195),(130,-165),(160,-40),(135,130),(65,195),(-65,195),(-135,130),(-160,-40)]
    }
    return [(cx + x, cy + y) for x, y in shapes[shape]]

def draw_portrait(profile):
    image = gradient(profile['bg1'], profile['bg2']).convert('RGBA')
    draw = ImageDraw.Draw(image, 'RGBA')
    draw.ellipse((520, 65, 850, 395), fill=(255, 255, 255, 18))
    draw.ellipse((-170, 650, 270, 1090), fill=(255, 255, 255, 14))

    cx = 384 + {'left': -28, 'right': 30, 'front': 0}[profile['pose']]
    cy = 405
    body_width = {'slim':430,'petite':410,'lean':435,'average':470,'athletic':500,'tall':460,'curvy':525,'broad':550,'stocky':570}[profile['body']]
    draw.ellipse((cx-body_width//2, 675, cx+body_width//2, 1110), fill=hexrgb(profile['outfit']) + (255,))
    draw.polygon([(cx-85,655),(cx+85,655),(cx+135,780),(cx-135,780)], fill=(255,255,255,28))

    skin = hexrgb(profile['skin'])
    skin_shadow = blend(skin, (75,38,34), 0.18)
    draw.rounded_rectangle((cx-74,585,cx+74,760), radius=42, fill=skin_shadow + (255,))

    if profile['hijab']:
        hijab = hexrgb(profile['hijab_color'])
        accent = hexrgb(profile['hijab_accent'])
        draw.ellipse((cx-205,165,cx+205,700), fill=hijab + (255,))
        draw.polygon([(cx-205,390),(cx-255,725),(cx-40,760),(cx,625),(cx+40,760),(cx+255,725),(cx+205,390)], fill=hijab + (255,))
        draw.arc((cx-180,170,cx+180,535), 200, 340, fill=accent + (220,), width=42)
    else:
        hair = hexrgb(profile['hair_color'])
        if profile['hair'] == 'shaved':
            draw.ellipse((cx-146,195,cx+146,475), fill=blend(hair,skin,0.35) + (255,))
        elif profile['hair'] == 'buzz':
            draw.ellipse((cx-154,184,cx+154,470), fill=hair + (255,))
        elif profile['hair'] == 'receding':
            draw.ellipse((cx-150,190,cx+150,455), fill=hair + (255,))
            draw.ellipse((cx-70,186,cx+70,310), fill=skin + (255,))
        elif profile['hair'] == 'short_fade':
            draw.ellipse((cx-168,172,cx+168,475), fill=hair + (255,))
            draw.rectangle((cx-150,330,cx+150,480), fill=hair + (255,))
        elif profile['hair'] == 'wavy_crop':
            for index in range(13):
                x, y = cx - 145 + index * 24, 205 + (index % 3) * 11
                draw.ellipse((x-28,y-30,x+34,y+32), fill=hair + (255,))
        elif profile['hair'] == 'curly_bob':
            for y in range(205,530,45):
                for x in range(cx-180,cx+181,45):
                    if ((x-cx)/190)**2 + ((y-365)/200)**2 < 1.15:
                        draw.ellipse((x-34,y-34,x+34,y+34), fill=hair + (255,))

    draw.ellipse((cx-175,360,cx-115,470), fill=skin_shadow + (255,))
    draw.ellipse((cx+115,360,cx+175,470), fill=skin_shadow + (255,))
    draw.polygon(path_polygon(cx, cy, profile['face']), fill=skin + (255,))
    draw.ellipse((cx-125,420,cx-35,505), fill=(255,180,170,24))
    draw.ellipse((cx+40,420,cx+130,505), fill=(255,180,170,22))

    if profile['hijab']:
        hijab = hexrgb(profile['hijab_color'])
        accent = hexrgb(profile['hijab_accent'])
        draw.arc((cx-170,205,cx+170,610),195,345,fill=accent+(230,),width=30)
        draw.arc((cx-184,193,cx+184,628),188,352,fill=hijab+(255,),width=28)

    brow, eye = (70,45,42,255), (38,32,31,255)
    if profile['expression'] in ('bright','playful','friendly','energetic','warm'):
        draw.arc((cx-110,345,cx-25,405),195,340,fill=brow,width=9)
        draw.arc((cx+25,345,cx+110,405),200,345,fill=brow,width=9)
    else:
        draw.line((cx-108,372,cx-30,360),fill=brow,width=9)
        draw.line((cx+30,360,cx+108,372),fill=brow,width=9)
    draw.ellipse((cx-87,390,cx-57,420), fill=eye)
    draw.ellipse((cx+57,390,cx+87,420), fill=eye)
    draw.ellipse((cx-79,393,cx-70,402), fill=(255,255,255,210))
    draw.ellipse((cx+66,393,cx+75,402), fill=(255,255,255,210))
    draw.line((cx,405,cx-7,475,cx+18,485), fill=skin_shadow+(220,), width=8, joint='curve')

    beard = profile.get('beard')
    if beard:
        colour = (49,38,34,235) if beard != 'salt_pepper' else (72,65,61,235)
        if beard in ('boxed','full','salt_pepper'):
            draw.polygon([(cx-120,480),(cx-98,570),(cx-50,625),(cx,648),(cx+50,625),(cx+98,570),(cx+120,480),(cx+82,535),(cx,565),(cx-82,535)], fill=colour)
            if beard == 'salt_pepper':
                for index in range(55):
                    x, y = cx - 95 + (index * 37) % 190, 520 + (index * 53) % 105
                    draw.ellipse((x,y,x+5,y+5), fill=(185,180,174,155))
        elif beard == 'stubble':
            for index in range(140):
                x, y = cx - 115 + (index * 47) % 230, 490 + (index * 71) % 125
                if abs(x-cx) < 115 - 0.45 * max(0,y-535):
                    draw.ellipse((x,y,x+3,y+3), fill=colour)
        elif beard == 'goatee':
            draw.polygon([(cx-50,535),(cx+50,535),(cx+35,635),(cx,665),(cx-35,635)], fill=colour)
            draw.rounded_rectangle((cx-42,495,cx+42,522), radius=12, fill=colour)

    lip = (138,63,78,255)
    if profile['expression'] in ('bright','playful','friendly','energetic','warm'):
        draw.arc((cx-72,485,cx+72,565),5,175,fill=lip,width=12)
    elif profile['expression'] == 'confident':
        draw.arc((cx-65,500,cx+65,555),10,165,fill=lip,width=9)
    elif profile['expression'] == 'thoughtful':
        draw.line((cx-55,530,cx+48,525),fill=lip,width=10)
    else:
        draw.arc((cx-62,505,cx+62,550),15,165,fill=lip,width=8)

    if profile['glasses']:
        glasses = (39,38,42,235)
        draw.rounded_rectangle((cx-126,372,cx-25,438),radius=22,outline=glasses,width=9)
        draw.rounded_rectangle((cx+25,372,cx+126,438),radius=22,outline=glasses,width=9)
        draw.line((cx-25,402,cx+25,402),fill=glasses,width=8)

    if profile['pose'] == 'left':
        draw.ellipse((cx+160,710,cx+310,900), fill=skin+(180,))
    elif profile['pose'] == 'right':
        draw.ellipse((cx-310,715,cx-155,900), fill=skin+(175,))

    output = image.convert('RGB').filter(ImageFilter.GaussianBlur(radius=0.35))
    path = OUT / f"{profile['name']}.webp"
    output.save(path, 'WEBP', quality=90, method=6)
    return path

for profile in profiles:
    draw_portrait(profile)

print(f'Generated {len(profiles)} synthetic WebP portraits in {OUT}')
