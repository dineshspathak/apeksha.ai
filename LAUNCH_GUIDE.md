# 🚀 Apeksha AI — Launch Guide (Beginner Friendly)

Total cost to launch: ~₹1000-1500 (domain only)
Hosting: FREE (Vercel + GitHub)

---

## STEP 1: Create a GitHub Account (FREE)

1. Go to https://github.com
2. Sign up (free)
3. Create a new repository called `apeksha`
4. Make it **Public** (for open-source) or **Private** (if you want code hidden)

### Push your code to GitHub:

```bash
cd ~/Downloads/AI

# Initialize git
git init
git add .
git commit -m "Initial commit - Apeksha AI"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/apeksha.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy Website on Vercel (FREE)

1. Go to https://vercel.com
2. Click "Sign up" → Sign in with your GitHub account
3. Click "Add New Project"
4. Select your `apeksha` repository
5. Set the **Root Directory** to: `editor`
6. Click "Deploy"

✅ Done! Your website is live at: `https://apeksha-xxxxx.vercel.app`

### Connect Your Domain:
1. In Vercel dashboard → Your project → Settings → Domains
2. Add your domain (e.g., `apekshaai.com`)
3. Vercel will show you DNS settings
4. Go to your domain registrar (Namecheap/Porkbun) → DNS settings
5. Add the records Vercel shows you
6. Wait 5-10 minutes

✅ Now your site is live at `https://apekshaai.com`

---

## STEP 3: Set Up Payments (FREE until you sell)

### Option A: Gumroad (Easiest — 10 minutes)

1. Go to https://gumroad.com → Sign up
2. Click "New Product"
3. Name: "Apeksha AI - Pro License"
4. Type: Digital Product
5. Price: $15 (or ₹999)
6. Description: (copy below)

```
Apeksha AI - Your Local AI Code Editor

What you get:
✅ Full AI-powered code editor
✅ AI that builds complete applications
✅ Inline code editing (⌘K)
✅ AI autocomplete
✅ Long-term memory
✅ Knowledge base (learn from your docs)
✅ Web search
✅ 100% local - no cloud, no API keys
✅ Lifetime updates

Requirements:
- macOS, Windows, or Linux
- 8GB RAM minimum (16GB recommended)
- Python 3.10+
- Ollama (free, included in setup)
```

7. Upload your project as a ZIP file
8. Publish!
9. Copy the Gumroad link → Add to your landing page

### Option B: Razorpay (For Indian customers)

1. Go to https://razorpay.com → Sign up (need PAN card)
2. Complete KYC verification
3. Go to Payment Links → Create new
4. Amount: ₹999
5. Description: "Apeksha AI Pro License"
6. Copy the payment link → Add to your landing page

### Option C: Lemonsqueezy (Best for software)

1. Go to https://lemonsqueezy.com → Sign up
2. Create a "Product" → Digital Download
3. Set pricing (supports subscriptions too)
4. They handle taxes worldwide
5. Embed the checkout on your site

---

## STEP 4: Create GitHub Releases (For downloads)

1. Go to your GitHub repo → Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: "Apeksha AI v1.0.0"
4. Upload your ZIP file
5. Publish

Users can now download from:
`https://github.com/YOUR_USERNAME/apeksha/releases/latest`

---

## STEP 5: Package Your App for Download

### Create the ZIP:

```bash
cd ~/Downloads/AI

# Clean up unnecessary files
rm -rf venv __pycache__ apeksha_memory apeksha_data

# Create distribution ZIP
zip -r Apeksha-AI-v1.0.0.zip \
  agent.py config.py tools.py memory.py knowledge.py \
  file_manager.py web_ui.py auth.py billing.py main.py \
  requirements.txt setup.sh start.sh \
  static/ knowledge/ workspace/ editor/ \
  README.md LICENSE \
  -x "editor/node_modules/*" "editor/.next/*" "*.pyc"
```

---

## STEP 6: Marketing (FREE — This is how you get users)

### Day 1: Launch on Product Hunt
1. Go to https://producthunt.com
2. Schedule a launch
3. Title: "Apeksha AI - Local AI Code Editor that builds software for you"
4. Tagline: "100% local, 100% free, 100% private"

### Day 1: Post on Reddit
- r/programming
- r/LocalLLaMA
- r/SideProject
- r/IndianStartups

### Day 1: Post on Twitter/X

```
Introducing Apeksha AI

A local AI code editor that writes, debugs, and ships code.
Runs 100% on your machine. No cloud. No API keys.

Features:
- AI that builds complete apps
- Inline edit with ⌘K
- Long-term memory
- Learns from your docs

Free & open source 👇
[link]
```

### Day 1: Post on Hacker News

Title: "Show HN: Apeksha – Local AI code editor that builds software"

### Week 1-4: YouTube Videos
- "I built my own AI code editor"
- "Free alternative to Cursor/Copilot"
- "Watch AI build a full app locally"

### Ongoing: Write blog posts
- Dev.to
- Hashnode
- Medium

---

## STEP 7: Earn Revenue

### Revenue streams:

1. **Free tier** (get users) → Leads to:
2. **Pro license** ₹999 one-time → Core revenue
3. **Monthly subscription** ₹299/month → Recurring revenue
4. **Team license** ₹1999/user/month → High value

### What users get at each tier:

| | Free | Pro (₹999) | Team (₹1999/mo) |
|---|---|---|---|
| AI messages | 20/day | Unlimited | Unlimited |
| Projects | 3 | Unlimited | Unlimited |
| Models | Llama 3.1 only | All models | Custom models |
| Memory | Session only | Long-term | Shared team |
| Knowledge base | No | Yes | Yes |
| Autocomplete | No | Yes | Yes |
| Support | Community | Email | Dedicated |
| Updates | Major only | All | All + early access |

---

## YOUR LAUNCH CHECKLIST

- [ ] Create GitHub account
- [ ] Push code to GitHub
- [ ] Deploy on Vercel (free)
- [ ] Buy domain (~₹1000)
- [ ] Connect domain to Vercel
- [ ] Set up Gumroad/Razorpay
- [ ] Create ZIP download
- [ ] Upload to GitHub Releases
- [ ] Post on Twitter
- [ ] Post on Reddit
- [ ] Submit to Product Hunt
- [ ] Record a demo video (use phone if no camera)
- [ ] Write a blog post

---

## COSTS SUMMARY

| What | Cost | Frequency |
|------|------|-----------|
| Domain | ₹800-1500 | Yearly |
| Vercel hosting | ₹0 | FREE |
| GitHub | ₹0 | FREE |
| Gumroad | 10% per sale | Only when you earn |
| Marketing | ₹0 | Your time only |
| **TOTAL TO START** | **₹1000** | **One time** |

---

## EXPECTED TIMELINE

- **Day 1**: Site live, payments ready
- **Week 1**: 50-100 visitors (from Reddit/Twitter)
- **Week 2-4**: First 5-10 sales (₹5,000-10,000)
- **Month 2-3**: 30-50 sales (₹30,000-50,000)
- **Month 6**: 100+ sales (₹1,00,000+)
- **Year 1**: If you keep marketing → ₹5-10 lakh possible

---

## NEED HELP?

- Vercel docs: https://vercel.com/docs
- Gumroad: https://help.gumroad.com
- GitHub releases: https://docs.github.com/en/repositories/releasing-projects-on-github
- Ollama: https://ollama.ai

Good luck, Dinesh! 
Your daughter's name will be known in the AI world.
