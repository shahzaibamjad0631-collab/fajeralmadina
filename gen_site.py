# -*- coding: utf-8 -*-
import os, json, urllib.parse, re

OUT = "/sessions/optimistic-quirky-hawking/mnt/outputs"
PHONE = "971558484022"

with open(os.path.join(OUT, "_categories.json")) as f:
    CATEGORIES = json.load(f)

with open(os.path.join(OUT, "_images.json")) as f:
    IMAGES = json.load(f)

def slugify(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def wa_link(text):
    msg = f"Hi Fajer Al Madina, I'm interested in {text}. Please share details and pricing."
    return "https://wa.me/{}?text={}".format(PHONE, urllib.parse.quote(msg))

def img_url(photo_id, w=800, h=600):
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w={w}&h={h}&q=80"

def subcat_images(subcat_name):
    return IMAGES.get(subcat_name, ["photo-1521791136064-7986c2920216"])

# Build a slug for every product, disambiguating collisions across categories
_seen_slugs = {}
PRODUCT_SLUGS = {}  # (cat_slug, subcat_name, item) -> slug
for cat in CATEGORIES:
    for s in cat["subcats"]:
        for item in s["items"]:
            base_slug = slugify(item)
            key = (cat["slug"], s["name"], item)
            if base_slug not in _seen_slugs:
                _seen_slugs[base_slug] = key
                PRODUCT_SLUGS[key] = base_slug
            else:
                PRODUCT_SLUGS[key] = f'{cat["slug"]}-{base_slug}'

# ---------------- SHARED HEAD/SCRIPTS (base-aware for subfolder pages) ----------------
def head_common(base=""):
    return f'''<link rel="icon" type="image/png" href="{base}assets/favicon-32.png">
<link rel="apple-touch-icon" href="{base}assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}style.css">'''

def scripts(base=""):
    return f'''<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="{base}app.js"></script>'''

TOP_CHROME = '''<div class="cursor-ring" id="cursorRing"></div>
<div class="cursor-dot" id="cursorDot"></div>
<div class="preloader" id="preloader">
  <div class="preloader-logo"><img src="{base}assets/logo.webp" alt="Fajer Al Madina Advertising LLC"></div>
</div>
<div class="progress-bar" id="progressBar"></div>'''

def top_chrome(base=""):
    return TOP_CHROME.format(base=base)

# ---------------- NAV: ONE "ALL CATEGORIES" MEGA MENU (scales to any number of categories) ----------------
def mega_panel_html(active_slug=None, base=""):
    cols = []
    for cat in CATEGORIES:
        subs = "\n".join(
            f'          <a href="{base}{cat["slug"]}.html#{slugify(s["name"])}" class="mega-sub">{s["name"]}</a>'
            for s in cat["subcats"]
        )
        cols.append(f'''        <div class="mega-col">
          <a href="{base}{cat["slug"]}.html" class="mega-col-title">{cat["label"]}</a>
{subs}
        </div>''')
    cols_html = "\n".join(cols)
    return f'''      <div class="mega-panel">
{cols_html}
        <a href="{base}shop.html" class="mega-viewall">View all categories →</a>
      </div>'''

def header_html(prefix, active=None, base=""):
    # prefix = "" if this page IS index.html, else "index.html" (or "../index.html") to link back to homepage sections
    # active = "home", a category slug (e.g. "signages"), or "shop"
    home_href = f"{base}index.html" if prefix else "#top"
    about_href = f"{prefix}#about" if prefix else "#about"
    portfolio_href = f"{prefix}#portfolio" if prefix else "#portfolio"
    packages_href = f"{prefix}#packages" if prefix else "#packages"
    contact_href = f"{prefix}#contact" if prefix else "#contact"
    def cur(name):
        return ' class="current"' if active == name else ''
    shop_active = active not in (None, "home")
    shop_cur = ' current' if shop_active else ''
    return f'''<header id="header">
  <nav>
    <a href="{home_href}" class="brand">
      <img src="{base}assets/logo.webp" alt="Fajer Al Madina Advertising LLC logo">
      <span class="brand-text"><b>Fajer Al Madina</b><span>ADVERTISING LLC</span></span>
    </a>
    <div class="nav-links" id="navLinks">
      <a href="{home_href}" data-link="top"{cur('home')}>Home</a>
      <div class="nav-item has-dropdown{shop_cur}">
        <a href="{base}shop.html" class="dropdown-toggle">All Categories <span class="chev"></span></a>
{mega_panel_html(active, base)}
      </div>
      <a href="{about_href}" data-link="about">About</a>
      <a href="{portfolio_href}" data-link="portfolio">Portfolio</a>
      <a href="{packages_href}" data-link="packages">Packages</a>
      <a href="{contact_href}" data-link="contact">Contact</a>
      <span class="nav-indicator" id="navIndicator"></span>
    </div>
    <div class="nav-cta">
      <a href="tel:+971558484022" class="btn btn-outline">Call Us</a>
      <a href="https://wa.me/971558484022" class="btn btn-primary">WhatsApp</a>
    </div>
    <button class="burger" id="burger" aria-label="Open menu"><span></span><span></span><span></span></button>
  </nav>
</header>'''

def footer_html(prefix, base=""):
    about_href = f"{prefix}#about" if prefix else "#about"
    portfolio_href = f"{prefix}#portfolio" if prefix else "#portfolio"
    packages_href = f"{prefix}#packages" if prefix else "#packages"
    contact_href = f"{prefix}#contact" if prefix else "#contact"
    cat_links = "\n".join(
        f'          <li><a href="{base}{cat["slug"]}.html">{cat["label"]}</a></li>' for cat in CATEGORIES
    )
    return f'''<footer id="contact">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="foot-brand">
          <img src="{base}assets/logo.webp" alt="Fajer Al Madina Advertising LLC logo">
          <b>Fajer Al Madina<br>Advertising LLC</b>
        </div>
        <p class="desc">Signage, large-format printing and interior fit-out — designed, produced and installed by one team in Dubai, UAE.</p>
      </div>
      <div>
        <h5>Shop Categories</h5>
        <ul>
{cat_links}
        </ul>
      </div>
      <div>
        <h5>Company</h5>
        <ul>
          <li><a href="{about_href}">About Us</a></li>
          <li><a href="{portfolio_href}">Portfolio</a></li>
          <li><a href="{packages_href}">Packages</a></li>
          <li><a href="{contact_href}">Contact</a></li>
        </ul>
      </div>
      <div>
        <h5>Contact</h5>
        <ul>
          <li>📍 Near Latifa Masjid, Frij Al Murar, Deira, Dubai</li>
          <li>📞 <a href="tel:+971558484022" style="color:inherit;">+971 55 848 4022</a></li>
          <li>☎️ <a href="tel:+971501551310" style="color:inherit;">+971 50 155 1310</a></li>
          <li>✉️ <a href="mailto:famadinasign@gmail.com" style="color:inherit;">famadinasign@gmail.com</a></li>
          <li>🕐 Sat–Thu, 9am–10pm</li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Fajer Al Madina Advertising LLC. All rights reserved.</span>
    </div>
  </div>
</footer>

<div class="float-bar">
  <a href="tel:+971558484022" class="call-float" title="Call us" aria-label="Call us">📞</a>
  <a href="https://wa.me/971558484022" class="wa-float" title="WhatsApp us" aria-label="WhatsApp us">🟢</a>
</div>'''

def cta_band():
    return '''<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Have a project in mind?</h2>
      <p>Send us your site details or brief on WhatsApp and get a quote within 24 hours.</p>
    </div>
    <div class="cta-actions">
      <a href="https://wa.me/971558484022" class="btn btn-light">WhatsApp Us →</a>
      <a href="mailto:famadinasign@gmail.com" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3);">Email Us</a>
    </div>
  </div>
</section>'''

# ---------------- CATEGORY PAGE BUILD ----------------
def build_category_page(cat):
    slug = cat["slug"]
    title = f'{cat["hero_title"]} | Fajer Al Madina Advertising LLC — Dubai'
    desc = cat["hero_desc"]

    subcat_blocks = []
    for s in cat["subcats"]:
        sub_id = slugify(s["name"])
        imgs = subcat_images(s["name"])
        cards = []
        for i, item in enumerate(s["items"]):
            item_desc = s["desc"].format(item=item)
            photo = imgs[i % len(imgs)]
            p_slug = PRODUCT_SLUGS[(cat["slug"], s["name"], item)]
            cards.append(f'''      <a href="products/{p_slug}.html" class="prod-card reveal">
        <div class="prod-thumb"><img src="{img_url(photo,500,375)}" alt="{item}" loading="lazy"></div>
        <div class="prod-body">
          <h4>{item}</h4>
          <p>{item_desc}</p>
          <span class="prod-enquire">View details →</span>
        </div>
      </a>''')
        cards_html = "\n".join(cards)
        subcat_blocks.append(f'''    <div class="subcat-block" id="{sub_id}">
      <div class="subcat-strip"><img src="{img_url(imgs[0],1200,450)}" alt="{s["name"]}" loading="lazy"></div>
      <div class="subcat-head reveal">
        <h2>{s["name"]}</h2>
        <span>{len(s["items"])} items</span>
      </div>
      <div class="prod-grid">
{cards_html}
      </div>
    </div>''')
    subcats_html = "\n".join(subcat_blocks)

    body = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#0F2A3D">
<meta name="robots" content="index, follow">
<meta name="author" content="Fajer Al Madina Advertising LLC">
<link rel="canonical" href="https://fajer-al-madina-e2k1.vercel.app/{slug}.html">
<title>{title}</title>
<meta name="description" content="{desc}">
{head_common()}
</head>
<body>
{top_chrome()}

{header_html("index.html", active=cat["slug"])}

<section class="cat-hero">
  <div class="wrap">
    <div class="cat-breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / {cat["label"]}</div>
    <h1>{cat["hero_title"]}</h1>
    <p>{desc}</p>
  </div>
</section>

<section>
  <div class="wrap">
{subcats_html}
  </div>
</section>

{cta_band()}

{footer_html("index.html")}

{scripts()}
</body>
</html>
'''
    with open(os.path.join(OUT, f"{slug}.html"), "w", encoding="utf-8") as f:
        f.write(body)
    return slug

# ---------------- SHOP.HTML (all categories overview) ----------------
def build_shop_page():
    cards = []
    for i, cat in enumerate(CATEGORIES, start=1):
        n_items = sum(len(s["items"]) for s in cat["subcats"])
        thumb = subcat_images(cat["subcats"][0]["name"])[0]
        cards.append(f'''      <a href="{cat["slug"]}.html" class="shop-cat-card reveal">
        <img class="cat-bg" src="{img_url(thumb,700,500)}" alt="{cat["label"]}" loading="lazy">
        <span class="n">{i:02d}</span>
        <h3>{cat["label"]}</h3>
        <p>{len(cat["subcats"])} subcategories · {n_items} items</p>
      </a>''')
    cards_html = "\n".join(cards)

    body = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#0F2A3D">
<meta name="robots" content="index, follow">
<meta name="author" content="Fajer Al Madina Advertising LLC">
<link rel="canonical" href="https://fajer-al-madina-e2k1.vercel.app/shop.html">
<title>Shop All Categories | Fajer Al Madina Advertising LLC — Dubai</title>
<meta name="description" content="Browse all signage, printing, branding and promotional product categories from Fajer Al Madina Advertising LLC, Dubai.">
{head_common()}
</head>
<body>
{top_chrome()}

{header_html("index.html", active="shop")}

<section class="cat-hero">
  <div class="wrap">
    <div class="cat-breadcrumb"><a href="index.html">Home</a> / Shop</div>
    <h1>Shop All Categories</h1>
    <p>Everything we produce, organised by category. Pick a category to see the full range and enquire on WhatsApp — every job is quoted individually, so send us the details and we'll get back to you fast.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="shop-grid">
{cards_html}
    </div>
  </div>
</section>

{cta_band()}

{footer_html("index.html")}

{scripts()}
</body>
</html>
'''
    with open(os.path.join(OUT, "shop.html"), "w", encoding="utf-8") as f:
        f.write(body)

# ---------------- INDIVIDUAL PRODUCT PAGES ----------------
def build_product_page(cat, subcat, item):
    p_slug = PRODUCT_SLUGS[(cat["slug"], subcat["name"], item)]
    imgs = subcat_images(subcat["name"])
    idx = subcat["items"].index(item)
    photo = imgs[idx % len(imgs)]
    item_desc = subcat["desc"].format(item=item)
    title = f'{item} | {cat["label"]} | Fajer Al Madina Advertising LLC — Dubai'
    meta_desc = f'{item} — {item_desc} Get a fast quote from Fajer Al Madina Advertising LLC, Dubai.'
    base = "../"

    # Related products: other items in the same subcategory
    related = [it for it in subcat["items"] if it != item][:4]
    if len(related) < 4:
        # top up from the same category's other subcats
        for s2 in cat["subcats"]:
            if s2["name"] == subcat["name"]:
                continue
            for it in s2["items"]:
                if len(related) >= 4:
                    break
                related.append((it, s2))
        related = related[:4]

    rel_cards = []
    for r in related:
        if isinstance(r, tuple):
            r_item, r_sub = r
        else:
            r_item, r_sub = r, subcat
        r_slug = PRODUCT_SLUGS[(cat["slug"], r_sub["name"], r_item)]
        r_imgs = subcat_images(r_sub["name"])
        r_idx = r_sub["items"].index(r_item)
        r_photo = r_imgs[r_idx % len(r_imgs)]
        rel_cards.append(f'''      <a href="{r_slug}.html" class="prod-card reveal">
        <div class="prod-thumb"><img src="{img_url(r_photo,500,375)}" alt="{r_item}" loading="lazy"></div>
        <div class="prod-body">
          <h4>{r_item}</h4>
          <p>{r_sub["desc"].format(item=r_item)}</p>
          <span class="prod-enquire">View details →</span>
        </div>
      </a>''')
    rel_html = "\n".join(rel_cards)

    body = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#0F2A3D">
<meta name="robots" content="index, follow">
<meta name="author" content="Fajer Al Madina Advertising LLC">
<link rel="canonical" href="https://fajer-al-madina-e2k1.vercel.app/products/{p_slug}.html">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
{head_common(base)}
</head>
<body>
{top_chrome(base)}

{header_html(f"{base}index.html", active=cat["slug"], base=base)}

<section class="cat-hero" style="padding:130px 0 40px;">
  <div class="wrap">
    <div class="cat-breadcrumb"><a href="{base}index.html">Home</a> / <a href="{base}shop.html">Shop</a> / <a href="{base}{cat["slug"]}.html">{cat["label"]}</a> / {item}</div>
  </div>
</section>

<section class="product-detail">
  <div class="wrap">
    <div class="product-layout">
      <div class="product-media reveal">
        <img src="{img_url(photo,900,675)}" alt="{item}">
      </div>
      <div class="product-info reveal">
        <div class="p-eyebrow">{subcat["name"]}</div>
        <h1>{item}</h1>
        <p class="p-desc">{item_desc} Every order is produced in-house in Dubai and quoted individually based on size, material and quantity — send us your requirements on WhatsApp for a fast, accurate quote.</p>
        <div class="p-actions">
          <a href="{wa_link(item)}" target="_blank" rel="noopener" class="btn btn-primary">Enquire on WhatsApp →</a>
          <a href="tel:+971558484022" class="btn btn-outline">Call Us</a>
        </div>
        <ul class="p-facts">
          <li><b>Category:</b> <a href="{base}{cat["slug"]}.html" style="color:inherit;">{cat["label"]}</a></li>
          <li><b>Subcategory:</b> {subcat["name"]}</li>
          <li><b>Pricing:</b> Quoted per project — share size, quantity &amp; material</li>
          <li><b>Location:</b> Deira, Dubai, UAE</li>
        </ul>
      </div>
    </div>

    <div class="related-wrap">
      <h3>You may also need</h3>
      <div class="related-grid">
{rel_html}
      </div>
    </div>
  </div>
</section>

{cta_band()}

{footer_html(f"{base}index.html", base=base)}

{scripts(base)}
</body>
</html>
'''
    prod_dir = os.path.join(OUT, "products")
    os.makedirs(prod_dir, exist_ok=True)
    with open(os.path.join(prod_dir, f"{p_slug}.html"), "w", encoding="utf-8") as f:
        f.write(body)
    return p_slug

for cat in CATEGORIES:
    build_category_page(cat)
build_shop_page()

n_products = 0
for cat in CATEGORIES:
    for s in cat["subcats"]:
        for item in s["items"]:
            build_product_page(cat, s, item)
            n_products += 1

print("Generated:", ", ".join(c["slug"]+".html" for c in CATEGORIES), "shop.html")
print("Generated", n_products, "individual product pages in products/")
