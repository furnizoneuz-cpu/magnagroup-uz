import urllib.request, urllib.parse, os
from io import BytesIO
from PIL import Image
OUT=r'D:\magnagroup.uz\public\scenes'; os.makedirs(OUT,exist_ok=True)
CINE="cinematic architectural photograph, ultra realistic, wide angle 24mm, volumetric light, cinematic color grade, editorial architecture magazine, shot on Sony A7R IV, 8k hyper detailed, no text, no watermark, no people"
scenes={
 "arrival":"grand corporate headquarters exterior at blue hour dusk, monumental premium glass facade glowing warm from inside, natural stone cladding, long reflecting pool with mirror reflection, hidden LED light lines, dramatic moody sky, "+CINE,
 "atrium":"grand 18 meter tall corporate atrium, large sculptural tree in the center, glass skylight with god rays of sunlight, polished travertine floor with reflections, hidden fountain, floating balconies, dark walnut and brushed steel, "+CINE,
 "executive":"luxury executive office behind a floor to ceiling glass wall, dark walnut executive desk with side cabinet, moody low key lighting, dark stone floor, warm accent light, calm powerful atmosphere, "+CINE,
 "workspace":"bright modern open plan workspace behind a glass wall, rows of designer workstation desks with chairs, abundant green plants, floor to ceiling windows daylight, high ceiling, airy energetic, "+CINE,
 "meeting":"premium boardroom behind a glass wall, long meeting table with executive leather chairs, acoustic slatted wood walls, large wall screen, soft warm downlight, thick carpet, "+CINE,
 "storage":"elegant gallery hall of tall designer cabinets bookcases and shelving units behind glass, museum spotlights, dark walnut and glass doors, reflective floor, "+CINE,
 "seating":"luxury showroom of executive office chairs and armchairs displayed on illuminated podiums behind glass, dramatic spotlights, dark backdrop, "+CINE,
 "medical":"clean modern clinical medical furniture showroom behind glass wall, white cabinets, examination couch, stainless steel, bright soft even lighting, "+CINE,
 "student":"modern bright school classroom behind a glass wall, neat rows of wooden student desks and chairs, large windows with daylight, clean minimal, "+CINE,
 "children":"cheerful bright kindergarten playroom behind a glass wall, colorful rounded child furniture, low shelves with toys, soft daylight, warm inviting, "+CINE,
 "skylounge":"luxury rooftop sky lounge at golden hour, floor to ceiling glass with panoramic city skyline, lounge seating, warm sunset light flooding in, reflective floor, "+CINE,
}
for name,prompt in scenes.items():
    try:
        enc=urllib.parse.quote(prompt,safe="")
        url=f"https://image.pollinations.ai/prompt/{enc}?width=1536&height=864&nologo=true&enhance=true&seed={abs(hash(name))%90000}"
        data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=220).read()
        Image.open(BytesIO(data)).convert('RGB').save(os.path.join(OUT,name+'.jpg'),quality=90,optimize=True)
        print("ok",name)
    except Exception as e:
        print("ERR",name,str(e)[:70])
print("DONE")
