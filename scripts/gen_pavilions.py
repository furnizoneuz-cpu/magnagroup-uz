import urllib.request, urllib.parse, os
from io import BytesIO
from PIL import Image
OUT=r'D:\magnagroup.uz\public\pavilions'; os.makedirs(OUT,exist_ok=True)
CINE="cinematic architectural interior photograph, ultra realistic, wide angle 24mm, volumetric light, cinematic color grade, shot on Sony A7R IV, 8k hyper detailed, no text, no watermark, no people"
M={
 "paris":"luxury executive office, minimalist white oak desk, floor to ceiling panorama window with misty morning Paris skyline and faint Eiffel Tower silhouette, soft diffuse cool morning light, quiet luxury, brushed silver nickel accents, desert sand leather chair, "+CINE,
 "riyadh":"monumental executive office, royal dark smoked walnut desk with Nero Marquina black marble slab, gold bronze accents, huge window with vast desert and Riyadh skyline at golden hour, warm orange sunset light flooding in, powerful, "+CINE,
 "chicago":"hi-tech executive office, hardened steel frame desk with matte black carbon surface, floor to ceiling window with Chicago skyscrapers at night, cool blue 6000K ambient with a sharp warm focused desk light, engineering precision, "+CINE,
 "mercedis":"aerodynamic premium executive office, curved carbon fiber and brushed aluminium desk, metallic grey lacquered surface with light streaks, perforated nappa leather chair, overhead studio softbox lighting, automotive design aesthetic, "+CINE,
 "newyork":"grand corporate boardroom, long Calacatta gold marble conference table for twelve, dark gunmetal steel base, floor to ceiling window with Manhattan skyline at dusk, deep purple blue sky, warm 2700K hidden LED, monumental, "+CINE,
 "venice":"serene meeting room, bleached sand ash rounded organic table, frosted white acrylic glowing base, water caustics reflections shimmering on the ceiling from a reflecting pool, soft overcast light, calm, "+CINE,
 "milano":"vibrant creative collaborative workspace, modular desks in light grey and terracotta laminate, recycled felt acoustic dividers, colorful powder coated aluminium legs, bright neutral 4500K midday light, plants, energetic, "+CINE,
 "pittsburgh":"industrial premium workspace, distressed solid oak desk tops, raw black cast iron legs, high contrast directional warm spot lighting, cool industrial concrete ambience, sturdy, "+CINE,
 "lambo":"futuristic architectural wall system room, american walnut and matte black polymer geometric wall panels, thin running kinetic LED light lines 3000K, a hidden sliding door in the wall, deep shadow joints, sci-fi premium, "+CINE,
}
for n,p in M.items():
    try:
        enc=urllib.parse.quote(p,safe="")
        url=f"https://image.pollinations.ai/prompt/{enc}?width=1536&height=864&nologo=true&enhance=true&seed={abs(hash(n))%90000}"
        data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=220).read()
        Image.open(BytesIO(data)).convert('RGB').save(os.path.join(OUT,n+'.jpg'),quality=90,optimize=True)
        print("ok",n)
    except Exception as e: print("ERR",n,str(e)[:70])
print("DONE")
