# Master Feature Lists for Subscription Plans
# These features are based on actual functionality in each dashboard

INDIVIDUAL_FEATURES = [
    "Dashboard Overview",
    "Transaction Management",
    "Round-up Auto-Investing",
    "Portfolio Overview",
    "Portfolio Analytics & Statistics",
    "AI-Powered Spending Insights",
    "Investment Goals Tracking",
    "Notifications & Alerts",
    "Settings & Preferences",
    "Fractional Share Investing",
    "Merchant-to-Stock Mapping",
    "Secure Brokerage Integration"
]

FAMILY_FEATURES = [
    "Family Dashboard Overview",
    "Family Member Management",
    "Family Transaction Management",
    "Shared Portfolio Overview",
    "Family Round-up Auto-Investing",
    "Family Goals & Savings Tracking",
    "AI-Powered Family Insights",
    "Family Notifications",
    "Family Settings & Preferences",
    "Multi-Account Management",
    "Shared Investment Goals",
    "Family Financial Analytics"
]

BUSINESS_FEATURES = [
    "Business Dashboard Overview",
    "Team Member Management",
    "Business Transaction Management",
    "Business Analytics Dashboard",
    "Financial Reports & Statements",
    "Business Goals & Objectives",
    "Round-up Auto-Investing",
    "Business Portfolio Overview",
    "Business Notifications",
    "Business Settings & Preferences",
    "Multi-User Access Control",
    "Enterprise Financial Tools",
    "Advanced Reporting",
    "Team Performance Tracking"
]

# Feature availability by tier (Basic/Starter/Plus/Premium/Pro/Enterprise)
TIER_FEATURES = {
    'individual': {
        'basic': [
            "Dashboard Overview",
            "Transaction Management",
            "Round-up Auto-Investing",
            "Portfolio Overview",
            "Investment Goals Tracking",
            "Settings & Preferences",
            "Merchant-to-Stock Mapping"
        ],
        'starter': [
            "Dashboard Overview",
            "Transaction Management",
            "Round-up Auto-Investing",
            "Portfolio Overview",
            "Portfolio Analytics & Statistics",
            "AI-Powered Spending Insights",
            "Investment Goals Tracking",
            "Notifications & Alerts",
            "Settings & Preferences",
            "Fractional Share Investing",
            "Merchant-to-Stock Mapping"
        ],
        'premium': [
            "Dashboard Overview",
            "Transaction Management",
            "Round-up Auto-Investing",
            "Portfolio Overview",
            "Portfolio Analytics & Statistics",
            "AI-Powered Spending Insights",
            "Investment Goals Tracking",
            "Notifications & Alerts",
            "Settings & Preferences",
            "Fractional Share Investing",
            "Merchant-to-Stock Mapping",
            "Secure Brokerage Integration"
        ]
    },
    'family': {
        'starter': [
            "Family Dashboard Overview",
            "Family Member Management",
            "Family Transaction Management",
            "Shared Portfolio Overview",
            "Family Round-up Auto-Investing",
            "Family Goals & Savings Tracking",
            "Family Notifications",
            "Family Settings & Preferences",
            "Multi-Account Management"
        ],
        'plus': [
            "Family Dashboard Overview",
            "Family Member Management",
            "Family Transaction Management",
            "Shared Portfolio Overview",
            "Family Round-up Auto-Investing",
            "Family Goals & Savings Tracking",
            "AI-Powered Family Insights",
            "Family Notifications",
            "Family Settings & Preferences",
            "Multi-Account Management",
            "Shared Investment Goals"
        ],
        'premium': [
            "Family Dashboard Overview",
            "Family Member Management",
            "Family Transaction Management",
            "Shared Portfolio Overview",
            "Family Round-up Auto-Investing",
            "Family Goals & Savings Tracking",
            "AI-Powered Family Insights",
            "Family Notifications",
            "Family Settings & Preferences",
            "Multi-Account Management",
            "Shared Investment Goals",
            "Family Financial Analytics"
        ]
    },
    'business': {
        'professional': [
            "Business Dashboard Overview",
            "Team Member Management",
            "Business Transaction Management",
            "Business Analytics Dashboard",
            "Financial Reports & Statements",
            "Business Goals & Objectives",
            "Round-up Auto-Investing",
            "Business Portfolio Overview",
            "Business Notifications",
            "Business Settings & Preferences",
            "Multi-User Access Control"
        ]
    }
}

def get_default_features(account_type, tier):
    """Get default features for a plan based on account type and tier"""
    return TIER_FEATURES.get(account_type, {}).get(tier, [])

def get_all_features_for_account_type(account_type):
    """Get all available features for an account type"""
    if account_type == 'individual':
        return INDIVIDUAL_FEATURES
    elif account_type == 'family':
        return FAMILY_FEATURES
    elif account_type == 'business':
        return BUSINESS_FEATURES
    return []


