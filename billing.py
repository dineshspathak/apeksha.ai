"""Apeksha AI - Billing & Subscription Management.

For production, integrate with:
- Stripe (international): https://stripe.com/docs
- Razorpay (India): https://razorpay.com/docs

This module provides the interface. Uncomment the provider you want to use.
"""

import json
import time
from pathlib import Path

# ═══════════════════════════════════════════════════════════════
# PRICING PLANS
# ═══════════════════════════════════════════════════════════════

PLANS = {
    "free": {
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "currency": "USD",
        "features": [
            "20 AI messages/day",
            "3 projects",
            "Basic tools (shell, file I/O)",
            "Llama 3.1 model only",
            "Community support",
        ],
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 12,
        "price_yearly": 99,
        "currency": "USD",
        "features": [
            "Unlimited AI messages",
            "Unlimited projects",
            "All tools (web search, code exec, etc.)",
            "All models (DeepSeek, Qwen, Mistral)",
            "Long-term memory",
            "Knowledge base (RAG)",
            "AI autocomplete",
            "Priority support",
        ],
    },
    "team": {
        "name": "Team",
        "price_monthly": 25,
        "price_yearly": 199,
        "currency": "USD",
        "per_user": True,
        "features": [
            "Everything in Pro",
            "Team workspace",
            "Admin dashboard",
            "Custom models",
            "Self-hosted option",
            "API access",
            "Dedicated support",
        ],
    },
}

# ═══════════════════════════════════════════════════════════════
# SUBSCRIPTION MANAGEMENT (File-based for MVP)
# ═══════════════════════════════════════════════════════════════

SUBSCRIPTIONS_FILE = Path("./apeksha_data/subscriptions.json")


def _load_subscriptions() -> dict:
    SUBSCRIPTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not SUBSCRIPTIONS_FILE.exists():
        SUBSCRIPTIONS_FILE.write_text("{}")
    return json.loads(SUBSCRIPTIONS_FILE.read_text())


def _save_subscriptions(subs: dict):
    SUBSCRIPTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    SUBSCRIPTIONS_FILE.write_text(json.dumps(subs, indent=2))


def get_subscription(user_id: str) -> dict:
    """Get user's subscription info."""
    subs = _load_subscriptions()
    return subs.get(user_id, {
        "plan": "free",
        "status": "active",
        "started_at": None,
        "expires_at": None,
    })


def upgrade_plan(user_id: str, plan: str, payment_id: str = None) -> dict:
    """Upgrade user to a new plan."""
    if plan not in PLANS:
        return {"error": f"Invalid plan: {plan}"}

    subs = _load_subscriptions()
    subs[user_id] = {
        "plan": plan,
        "status": "active",
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "payment_id": payment_id,
        "expires_at": None,  # Set based on billing cycle
    }
    _save_subscriptions(subs)

    return {"success": True, "plan": plan}


def cancel_plan(user_id: str) -> dict:
    """Cancel user's subscription (downgrade to free at period end)."""
    subs = _load_subscriptions()
    if user_id in subs:
        subs[user_id]["status"] = "canceling"
        _save_subscriptions(subs)
    return {"success": True, "message": "Subscription will cancel at end of period"}


def get_plans():
    """Get all available plans."""
    return PLANS


# ═══════════════════════════════════════════════════════════════
# STRIPE INTEGRATION (Uncomment for production)
# ═══════════════════════════════════════════════════════════════

"""
import stripe

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

STRIPE_PRICES = {
    "pro_monthly": "price_xxxxx",  # Create in Stripe Dashboard
    "pro_yearly": "price_xxxxx",
    "team_monthly": "price_xxxxx",
    "team_yearly": "price_xxxxx",
}

def create_checkout_session(user_id: str, plan: str, billing: str = "monthly"):
    price_key = f"{plan}_{billing}"
    price_id = STRIPE_PRICES.get(price_key)
    
    if not price_id:
        return {"error": "Invalid plan/billing combination"}
    
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="http://localhost:3000/billing?success=true",
        cancel_url="http://localhost:3000/billing?canceled=true",
        client_reference_id=user_id,
    )
    
    return {"url": session.url}

def handle_webhook(payload, sig_header):
    # Verify and process Stripe webhooks
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["client_reference_id"]
        # Upgrade user plan
        upgrade_plan(user_id, "pro", session["id"])
    
    elif event["type"] == "customer.subscription.deleted":
        # Downgrade to free
        pass
"""

# ═══════════════════════════════════════════════════════════════
# RAZORPAY INTEGRATION (Uncomment for India)
# ═══════════════════════════════════════════════════════════════

"""
import razorpay

client = razorpay.Client(auth=(
    os.environ.get("RAZORPAY_KEY_ID"),
    os.environ.get("RAZORPAY_KEY_SECRET"),
))

RAZORPAY_PLANS = {
    "pro_monthly": "plan_xxxxx",  # Create in Razorpay Dashboard
    "pro_yearly": "plan_xxxxx",
}

def create_razorpay_subscription(user_id: str, plan: str, billing: str = "monthly"):
    plan_key = f"{plan}_{billing}"
    plan_id = RAZORPAY_PLANS.get(plan_key)
    
    subscription = client.subscription.create({
        "plan_id": plan_id,
        "total_count": 12 if billing == "monthly" else 1,
    })
    
    return {"subscription_id": subscription["id"]}
"""
