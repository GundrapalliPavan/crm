COLORS.md

Electrical Distribution CRM — Color System & Design Tokens

Version: 1.0
Status: Design System Specification
Category: Design System — Colors
Parent Document: PROJECT.md
Related Documents: CLAUDE.md, TYPOGRAPHY.md, COMPONENTS.md

⸻

1. Purpose

This document defines the authoritative color system for the Electrical Distribution CRM.

It governs color usage across:

* Web Application
* Future Mobile Application
* Design System
* Figma Designs
* Components
* Dashboards
* CRM
* Sales
* Inventory
* Purchase
* Billing
* Reports
* Communication
* Forms
* Tables
* Charts
* Notifications
* Interactive States

Claude must use this document as the source of truth for application colors.

Do not introduce arbitrary colors when designing or implementing screens.

⸻

2. Design Direction

The CRM should feel:

* Lightweight
* Premium
* Professional
* Modern
* Calm
* Trustworthy
* Efficient
* Business-focused

The application should NOT feel:

* Overly colorful
* Playful
* Consumer-app-like
* Visually noisy
* Like a generic admin template
* Like a dense ERP system
* Like a traditional accounting application

The primary visual experience should come from:

Neutral Surfaces
+
Strong Typography
+
Subtle Borders
+
Controlled Blue Accent
+
Semantic Color Only When Necessary

⸻

3. Core Color Principle

Color should communicate:

1. Brand / Action
2. Hierarchy
3. Interaction
4. Status
5. Risk
6. Feedback
7. Data meaning

Color should NOT be used simply to decorate interfaces.

A screen should remain understandable even when most of it is neutral.

⸻

4. Primary Color

The primary brand and interaction color is Blue.

Primary:

#2563EB

Token:

color.primary.600

Primary blue should communicate:

* Main Actions
* Selected States
* Active Navigation
* Links
* Focus
* Interactive Elements
* Important Brand Accents

It should not dominate entire screens.

⸻

5. Primary Blue Palette

Primary 50     #EFF6FF
Primary 100    #DBEAFE
Primary 200    #BFDBFE
Primary 300    #93C5FD
Primary 400    #60A5FA
Primary 500    #3B82F6
Primary 600    #2563EB
Primary 700    #1D4ED8
Primary 800    #1E40AF
Primary 900    #1E3A8A
Primary 950    #172554

Semantic tokens:

color.primary.50
color.primary.100
color.primary.200
color.primary.300
color.primary.400
color.primary.500
color.primary.600
color.primary.700
color.primary.800
color.primary.900
color.primary.950

⸻

6. Primary Color Usage

Primary 600

Use for:

* Primary Buttons
* Active Navigation Indicator
* Selected Tabs where appropriate
* Important Links
* Selected Controls
* Primary Interactive Elements

#2563EB

⸻

Primary 700

Use primarily for stronger interaction states such as:

* Primary Button Hover
* Stronger Interactive Emphasis

#1D4ED8

⸻

Primary 800

Use sparingly for:

* Primary Pressed State
* Strong Dark-blue Emphasis

#1E40AF

⸻

Primary 50

Use for:

* Selected Row Background
* Selected Navigation Background
* Informational Highlight
* Light Primary Badge
* Subtle Interactive Surface

#EFF6FF

⸻

Primary 100

Use for:

* Stronger Selected Surface
* Blue Badge Background
* Subtle Informational Emphasis

#DBEAFE

⸻

Primary 200

Useful for:

* Selected Borders
* Subtle Focus-related Surfaces
* Light Primary Separators

#BFDBFE

⸻

7. Neutral Palette

The neutral palette forms most of the application.

Use a cool-neutral slate family.

Neutral 0       #FFFFFF
Neutral 25      #FCFCFD
Neutral 50      #F8FAFC
Neutral 100     #F1F5F9
Neutral 200     #E2E8F0
Neutral 300     #CBD5E1
Neutral 400     #94A3B8
Neutral 500     #64748B
Neutral 600     #475569
Neutral 700     #334155
Neutral 800     #1E293B
Neutral 900     #0F172A
Neutral 950     #020617

Tokens:

color.neutral.0
color.neutral.25
color.neutral.50
color.neutral.100
color.neutral.200
color.neutral.300
color.neutral.400
color.neutral.500
color.neutral.600
color.neutral.700
color.neutral.800
color.neutral.900
color.neutral.950

⸻

8. Application Background

Primary application background:

#F8FAFC

Token:

color.background.app

Maps to:

color.neutral.50

This provides slight separation from white cards and content surfaces.

⸻

9. Primary Surface

Primary content surfaces use:

#FFFFFF

Token:

color.background.surface

Use for:

* Cards
* Panels
* Modals
* Drawers
* Tables
* Forms
* Content Areas
* Dropdowns

⸻

10. Secondary Surface

Secondary/subtle surface:

#F8FAFC

Token:

color.background.subtle

Use for:

* Secondary Sections
* Table Header Background where needed
* Read-only Areas
* Grouped Content
* Nested Surfaces

⸻

11. Elevated Surface

Elevated overlays should remain white:

#FFFFFF

Token:

color.background.elevated

Use elevation/shadow rather than changing the surface color unnecessarily.

Examples:

* Dropdown
* Popover
* Modal
* Command Menu
* Floating Panel

⸻

12. Text Colors

Primary Text

#0F172A

Token:

color.text.primary

Use for:

* Page Titles
* Headings
* Primary Data
* Important Labels

⸻

Secondary Text

#475569

Token:

color.text.secondary

Use for:

* Supporting Text
* Descriptions
* Secondary Information
* Metadata

⸻

Tertiary Text

#64748B

Token:

color.text.tertiary

Use for:

* Less-important Metadata
* Timestamps
* Supporting Details

⸻

Placeholder Text

#94A3B8

Token:

color.text.placeholder

⸻

Disabled Text

#94A3B8

Token:

color.text.disabled

Disabled state must also be communicated through interaction/state, not color alone.

⸻

Text on Primary

#FFFFFF

Token:

color.text.on-primary

⸻

Link Text

#2563EB

Token:

color.text.link

Hover:

#1D4ED8

Token:

color.text.link-hover

⸻

13. Border Colors

Borders should remain subtle.

Default Border

#E2E8F0

Token:

color.border.default

Use for:

* Cards
* Tables
* Inputs
* Sections
* Dividers

⸻

Subtle Border

#F1F5F9

Token:

color.border.subtle

Use where very light separation is sufficient.

⸻

Strong Border

#CBD5E1

Token:

color.border.strong

Use for:

* Stronger Input Boundaries
* Important Separators
* Hovered Neutral Controls

⸻

Interactive Border

#2563EB

Token:

color.border.interactive

⸻

14. Focus Color

Focus ring:

#3B82F6

Token:

color.focus.ring

Recommended focus treatment:

2px focus ring
+
appropriate offset where required

Focus states must remain clearly visible for keyboard users.

⸻

15. Semantic Colors

Semantic colors communicate operational meaning.

The system supports:

* Success
* Warning
* Error / Danger
* Information

These colors should be used intentionally.

⸻

16. Success

Primary success:

#16A34A

Token:

color.success.600

Success palette:

Success 50      #F0FDF4
Success 100     #DCFCE7
Success 200     #BBF7D0
Success 500     #22C55E
Success 600     #16A34A
Success 700     #15803D
Success 800     #166534

Use for:

* Successful Operation
* Payment Completed
* Completed State
* Positive Confirmation
* Healthy Status
* In-stock where status color is useful

Do not turn every positive metric green.

⸻

17. Warning

Primary warning:

#D97706

Token:

color.warning.600

Warning palette:

Warning 50      #FFFBEB
Warning 100     #FEF3C7
Warning 200     #FDE68A
Warning 500     #F59E0B
Warning 600     #D97706
Warning 700     #B45309
Warning 800     #92400E

Use for:

* Attention Required
* Approaching Due Date
* Low Stock
* Pending Attention
* Partial Completion
* Potential Risk

Warning does not mean failure.

⸻

18. Error / Danger

Primary danger:

#DC2626

Token:

color.danger.600

Danger palette:

Danger 50       #FEF2F2
Danger 100      #FEE2E2
Danger 200      #FECACA
Danger 500      #EF4444
Danger 600      #DC2626
Danger 700      #B91C1C
Danger 800      #991B1B

Use for:

* Errors
* Failed Actions
* Destructive Actions
* Overdue Critical State
* Out of Stock where appropriate
* Blocked State
* Validation Failure

Do not use red for ordinary negative trends unless the context actually indicates a problem.

⸻

19. Information

Information uses the primary blue family.

Information Background    #EFF6FF
Information Border        #BFDBFE
Information Text          #1D4ED8
Information Icon          #2563EB

Tokens:

color.info.background
color.info.border
color.info.text
color.info.icon

Use for:

* Informational Messages
* System Guidance
* Non-critical Notices
* Helpful Context

⸻

20. Semantic Surface Tokens

Success:

color.success.background     #F0FDF4
color.success.border         #BBF7D0
color.success.text           #15803D
color.success.icon           #16A34A

Warning:

color.warning.background     #FFFBEB
color.warning.border         #FDE68A
color.warning.text           #B45309
color.warning.icon           #D97706

Danger:

color.danger.background      #FEF2F2
color.danger.border          #FECACA
color.danger.text            #B91C1C
color.danger.icon            #DC2626

Information:

color.info.background        #EFF6FF
color.info.border            #BFDBFE
color.info.text              #1D4ED8
color.info.icon              #2563EB

⸻

21. Status Color Philosophy

Statuses should not automatically receive unique colors.

Avoid:

New         Blue
Contacted   Purple
Qualified   Orange
Quotation   Yellow
Negotiation Pink
Won         Green
Lost        Red

This creates visual noise.

Instead, classify status by meaning.

⸻

22. Neutral Status

Most workflow states should remain neutral.

Examples:

* Draft
* New
* Open
* Contacted
* In Review
* Sent
* Scheduled

Recommended:

Background    #F1F5F9
Text          #475569
Border        #E2E8F0

⸻

23. Positive Status

Examples:

* Won
* Paid
* Completed
* Delivered
* Approved
* In Stock

Recommended:

Background    #F0FDF4
Text          #15803D
Border        #BBF7D0

⸻

24. Attention Status

Examples:

* Pending Approval
* Low Stock
* Partial Payment
* Partially Received
* Due Soon
* Awaiting Response

Recommended:

Background    #FFFBEB
Text          #B45309
Border        #FDE68A

Use only where the status genuinely requires attention.

⸻

25. Critical Status

Examples:

* Lost
* Failed
* Overdue
* Blocked
* Out of Stock
* Payment Failed

Recommended:

Background    #FEF2F2
Text          #B91C1C
Border        #FECACA

⸻

26. Informational Status

Use blue when a state benefits from informational emphasis.

Recommended:

Background    #EFF6FF
Text          #1D4ED8
Border        #BFDBFE

Do not default every active status to blue.

⸻

27. Lead Status Colors

Lead workflow should remain predominantly neutral.

Example:

New              Neutral
Contacted        Neutral
Qualified        Blue / Informational
Converted        Green
Lost             Red

Exact statuses must come from CRM.md.

⸻

28. Opportunity Status Colors

Prefer neutral stage indicators.

Example:

Qualification    Neutral
Quotation        Neutral
Negotiation      Blue where selected/current
Won              Green
Lost             Red

Pipeline stages should not resemble a rainbow.

⸻

29. Sales Order Status Colors

Example semantic treatment:

Draft                Neutral
Confirmed            Blue / Information
Processing           Neutral
Partially Fulfilled  Warning
Fulfilled            Success
Cancelled            Danger / Neutral based on context

Use status semantics consistently.

⸻

30. Inventory Status Colors

Recommended:

Healthy Stock      Neutral or Success
Low Stock          Warning
Out of Stock       Danger
Overstock          Information / Neutral
Reserved           Information

Healthy stock does not need green everywhere.

In large inventory tables, neutral healthy states reduce visual noise.

⸻

31. Purchase Status Colors

Recommended:

Draft                 Neutral
Approval Pending      Warning
Approved              Success
Sent                  Neutral / Information
Partially Received    Warning
Received              Success
Delayed               Danger
Cancelled             Neutral / Danger

⸻

32. Billing Status Colors

Recommended:

Draft              Neutral
Issued             Neutral / Information
Partially Paid     Warning
Paid               Success
Due Soon           Warning
Overdue            Danger
Payment Failed     Danger
Credited           Neutral

⸻

33. Communication Status Colors

Recommended:

Queued        Neutral
Sent          Neutral / Information
Delivered     Success or Neutral
Read          Information
Failed        Danger

Do not overuse green for ordinary delivery events in communication-heavy screens.

⸻

34. Button Colors

Primary Button

Default:

Background    #2563EB
Text          #FFFFFF

Hover:

Background    #1D4ED8

Pressed:

Background    #1E40AF

Disabled:

Background    #E2E8F0
Text          #94A3B8

⸻

35. Secondary Button

Default:

Background    #FFFFFF
Text          #334155
Border        #CBD5E1

Hover:

Background    #F8FAFC
Border        #94A3B8

Pressed:

Background    #F1F5F9

⸻

36. Tertiary / Ghost Button

Default:

Background    Transparent
Text          #475569

Hover:

Background    #F1F5F9
Text          #334155

Use for lower-priority actions.

⸻

37. Destructive Button

Default:

Background    #DC2626
Text          #FFFFFF

Hover:

Background    #B91C1C

Use only for genuinely destructive actions such as:

* Delete
* Permanent Removal
* Critical Reversal where appropriate

Actions such as Cancel, Close, or Reject should not automatically use a solid red button.

⸻

38. Input Colors

Default:

Background    #FFFFFF
Border        #CBD5E1
Text          #0F172A
Placeholder   #94A3B8

Hover:

Border        #94A3B8

Focus:

Border        #2563EB
Focus Ring    #3B82F6

Disabled:

Background    #F8FAFC
Border        #E2E8F0
Text          #94A3B8

⸻

39. Input Error State

Border        #DC2626
Text          #0F172A
Error Text    #B91C1C

Optional subtle background:

#FEF2F2

Do not flood the entire form field with red.

⸻

40. Input Success State

Do not show green validation states for every valid input.

Success color should only appear when explicit confirmation provides value.

Example:

* Verified GSTIN
* Successfully Connected Integration
* Verified Email

⸻

41. Checkbox & Radio

Selected:

Background / Fill    #2563EB
Icon                 #FFFFFF

Unselected:

Background           #FFFFFF
Border               #CBD5E1

Hover:

Border               #94A3B8

Disabled:

Background           #F1F5F9
Border               #E2E8F0

⸻

42. Toggle

Active:

Track    #2563EB
Thumb    #FFFFFF

Inactive:

Track    #CBD5E1
Thumb    #FFFFFF

Disabled states should use neutral colors.

⸻

43. Navigation Colors

Sidebar background:

#FFFFFF

Default item:

Text    #475569
Icon    #64748B

Hover:

Background    #F8FAFC
Text          #334155

Active:

Background    #EFF6FF
Text          #1D4ED8
Icon          #2563EB

Use a restrained active state.

Avoid a large solid-blue navigation sidebar unless explicitly approved.

⸻

44. Top Navigation

Recommended:

Background       #FFFFFF
Border Bottom    #E2E8F0
Primary Text     #0F172A
Secondary Text   #64748B

The application shell should remain visually light.

⸻

45. Tabs

Inactive:

Text    #64748B

Hover:

Text    #334155

Active:

Text / Indicator    #2563EB

Avoid giving every tab a filled background unless the component specifically requires segmented-control behavior.

⸻

46. Tables

Table background:

#FFFFFF

Header:

Background    #F8FAFC
Text          #475569
Border        #E2E8F0

Body:

Text          #334155
Border        #F1F5F9

Hover:

#F8FAFC

Selected:

#EFF6FF

Tables should remain calm even when displaying large datasets.

⸻

47. Cards

Default card:

Background    #FFFFFF
Border        #E2E8F0

Cards should generally use neutral surfaces.

Do not assign different card colors merely to differentiate dashboard metrics.

⸻

48. KPI Cards

Default:

Background    #FFFFFF
Border        #E2E8F0
Label         #64748B
Value         #0F172A

Trend indicators may use semantic colors only when the business meaning is known.

Example:

An increase in overdue balance is negative.

An increase in sales is usually positive.

Do not automatically make every upward arrow green.

⸻

49. Modal & Drawer

Overlay:

rgba(15, 23, 42, 0.40)

Surface:

#FFFFFF

Border where required:

#E2E8F0

Avoid excessive dark overlays.

⸻

50. Dropdown & Popover

Background    #FFFFFF
Border        #E2E8F0
Text          #334155
Hover         #F8FAFC
Selected      #EFF6FF

Selected text may use:

#1D4ED8

⸻

51. Tooltip

Recommended:

Background    #0F172A
Text          #FFFFFF

Tooltips should remain short and readable.

⸻

52. Toast / Notification

Success:

Background    #F0FDF4
Border        #BBF7D0
Icon          #16A34A
Text          #166534

Warning:

Background    #FFFBEB
Border        #FDE68A
Icon          #D97706
Text          #92400E

Error:

Background    #FEF2F2
Border        #FECACA
Icon          #DC2626
Text          #991B1B

Information:

Background    #EFF6FF
Border        #BFDBFE
Icon          #2563EB
Text          #1E40AF

⸻

53. Badge Colors

Badges should use subtle backgrounds.

Neutral:

Background    #F1F5F9
Text          #475569

Blue:

Background    #EFF6FF
Text          #1D4ED8

Green:

Background    #F0FDF4
Text          #15803D

Amber:

Background    #FFFBEB
Text          #B45309

Red:

Background    #FEF2F2
Text          #B91C1C

Avoid saturated filled badges for normal workflow states.

⸻

54. Avatar Colors

User avatars should prioritize:

1. Profile Image
2. Neutral Initial Avatar

Default initial avatar:

Background    #E2E8F0
Text          #475569

Do not assign random rainbow colors to users unless a future design decision explicitly requires it.

⸻

55. Icon Colors

Default:

#64748B

Strong:

#475569

Interactive:

#2563EB

Success:

#16A34A

Warning:

#D97706

Danger:

#DC2626

Icons should inherit semantic context where practical.

⸻

56. Charts

Reports should use a controlled chart palette.

Primary sequence:

Chart Blue        #2563EB
Chart Cyan        #0891B2
Chart Teal        #0D9488
Chart Green       #16A34A
Chart Amber       #D97706
Chart Orange      #EA580C
Chart Slate       #64748B

Additional muted tones may be introduced only when a visualization genuinely requires more categories.

⸻

57. Chart Palette Tokens

color.chart.1    #2563EB
color.chart.2    #0891B2
color.chart.3    #0D9488
color.chart.4    #16A34A
color.chart.5    #D97706
color.chart.6    #EA580C
color.chart.7    #64748B

Charts should use consistent ordering where practical.

⸻

58. Chart Color Rules

Do not automatically use semantic colors for categorical charts.

For example:

Sales by Product:

Product A    Blue
Product B    Cyan
Product C    Teal

is preferable to implying:

Green = Good
Red = Bad

when the colors only represent categories.

⸻

59. Positive / Negative Chart Meaning

When a chart genuinely represents semantic state:

Positive:

#16A34A

Negative:

#DC2626

Attention:

#D97706

Example:

Paid          Green
Overdue       Red
Due Soon      Amber

⸻

60. Single-Series Charts

Use primary blue:

#2563EB

for most single-series visualizations.

Supporting grid lines:

#E2E8F0

Axis text:

#64748B

This keeps reporting visually consistent.

⸻

61. Comparison Charts

For current vs previous period:

Current:

#2563EB

Previous:

#94A3B8

This creates hierarchy without unnecessary competing colors.

⸻

62. Progress Bars

Default progress:

Track    #E2E8F0
Fill     #2563EB

Success completion may use green only when completion itself communicates success.

⸻

63. Skeleton Loading

Recommended:

Base         #F1F5F9
Highlight    #F8FAFC

Skeletons should remain subtle.

⸻

64. Scrollbars

Where custom scrollbar styling is required:

Track    Transparent
Thumb    #CBD5E1
Hover    #94A3B8

Prefer native behavior unless customization adds meaningful value.

⸻

65. Dividers

Default divider:

#E2E8F0

Subtle divider:

#F1F5F9

Do not use dark dividers across large sections.

Whitespace should often provide separation instead.

⸻

66. Selected State

Generic selected surface:

Background    #EFF6FF
Border        #BFDBFE
Text          #1D4ED8

Use for:

* Selected List Item
* Selected Card
* Selected Filter
* Selected Table Row where appropriate

⸻

67. Hover State

Neutral hover:

#F8FAFC

Stronger neutral hover:

#F1F5F9

Hover should not dramatically change component appearance.

⸻

68. Disabled State

Recommended:

Background    #F8FAFC
Border        #E2E8F0
Text          #94A3B8
Icon          #94A3B8

Do not rely solely on reduced opacity when it compromises readability.

⸻

69. Read-Only State

Read-only and disabled are not identical.

Read-only fields may use:

Background    #F8FAFC
Text          #475569
Border        #E2E8F0

Read-only information should remain readable.

⸻

70. Destructive Surface

For destructive confirmations, use red sparingly.

Example:

Icon Background    #FEF2F2
Icon               #DC2626

The entire modal does not need to become red.

⸻

71. Premium Experience Rule

Premium does NOT mean:

* Gradients everywhere
* Dark backgrounds everywhere
* Neon colors
* Glassmorphism
* Excessive shadows
* Bright cards
* Multiple accent colors

Premium should come from:

Restraint
+
Spacing
+
Typography
+
Alignment
+
Consistent Components
+
Subtle Interaction

⸻

72. Gradient Usage

Gradients should generally be avoided in core application UI.

Possible exceptions:

* Authentication Illustration
* Marketing Surface
* Very Subtle Decorative Brand Area

Do not use gradients for:

* Buttons
* Tables
* Status Badges
* Navigation
* Forms
* Operational Cards

unless explicitly approved.

⸻

73. Purple Restriction

Purple should not be used as a primary or prominent application color.

Avoid:

* Purple Primary Buttons
* Purple Navigation
* Purple Brand Accent
* Purple-heavy Charts
* Purple Gradients

If a chart requires additional categorical colors in the future, any purple-family color must remain secondary and non-brand-defining.

⸻

74. Color Density

On most operational screens, approximately the visual majority should remain:

White
+
Neutral
+
Text

Blue should identify interaction.

Semantic colors should identify meaning.

This is essential to maintaining a lightweight experience.

⸻

75. Accessibility

Color combinations must target WCAG AA contrast requirements for normal application usage.

Critical information must not depend exclusively on color.

Example:

Do not show:

●

with red as the only indication that an invoice is overdue.

Prefer:

Overdue

with:

* Text
* Semantic Color
* Optional Icon

⸻

76. Color-Blind Accessibility

Charts and statuses should not rely solely on differences between:

* Red
* Green
* Orange

Use additional information such as:

* Labels
* Icons
* Patterns where appropriate
* Direct Values
* Tooltips

⸻

77. Focus Accessibility

Keyboard focus must remain visually clear.

Focus should not be removed for aesthetic reasons.

Recommended:

Focus Ring    #3B82F6

Use sufficient contrast against the surrounding surface.

⸻

78. Dark Mode Readiness

The initial application may prioritize light mode.

However, semantic token architecture should allow future dark mode.

Components should reference:

color.background.surface

rather than directly assuming:

#FFFFFF

where implementation architecture supports tokens.

⸻

79. Do Not Build Dark Mode Prematurely

Dark mode should not be implemented simply because token architecture supports it.

Initial priority:

Excellent Light Theme
↓
Tokenized Architecture
↓
Future Dark Theme if Required

⸻

80. Semantic Token Architecture

Components should consume semantic tokens.

Example:

Do not conceptually bind a component to:

#FFFFFF
#E2E8F0
#0F172A

Prefer:

color.background.surface
color.border.default
color.text.primary

This improves maintainability.

⸻

81. Foundation vs Semantic Tokens

Foundation token:

color.neutral.900 = #0F172A

Semantic token:

color.text.primary = color.neutral.900

Components should primarily consume semantic tokens.

⸻

82. Core Semantic Token Map

color.background.app           #F8FAFC
color.background.surface       #FFFFFF
color.background.subtle        #F8FAFC
color.background.elevated      #FFFFFF
color.text.primary             #0F172A
color.text.secondary           #475569
color.text.tertiary            #64748B
color.text.placeholder         #94A3B8
color.text.disabled            #94A3B8
color.text.on-primary          #FFFFFF
color.text.link                #2563EB
color.text.link-hover          #1D4ED8
color.border.default           #E2E8F0
color.border.subtle            #F1F5F9
color.border.strong            #CBD5E1
color.border.interactive       #2563EB
color.action.primary           #2563EB
color.action.primary-hover     #1D4ED8
color.action.primary-pressed   #1E40AF
color.focus.ring               #3B82F6

⸻

83. Semantic Feedback Token Map

color.success.background       #F0FDF4
color.success.border           #BBF7D0
color.success.text             #15803D
color.success.icon             #16A34A
color.warning.background       #FFFBEB
color.warning.border           #FDE68A
color.warning.text             #B45309
color.warning.icon             #D97706
color.danger.background        #FEF2F2
color.danger.border            #FECACA
color.danger.text              #B91C1C
color.danger.icon              #DC2626
color.info.background          #EFF6FF
color.info.border              #BFDBFE
color.info.text                #1D4ED8
color.info.icon                #2563EB

⸻

84. Figma Variables

In Figma, colors should be implemented using variables/styles rather than manually applying raw hex values.

Recommended variable structure:

Color/
├── Primary/
│   ├── 50
│   ├── 100
│   ├── 200
│   ├── 300
│   ├── 400
│   ├── 500
│   ├── 600
│   ├── 700
│   ├── 800
│   ├── 900
│   └── 950
│
├── Neutral/
│   ├── 0
│   ├── 25
│   ├── 50
│   ├── 100
│   └── ...
│
├── Semantic/
│   ├── Success
│   ├── Warning
│   ├── Danger
│   └── Info
│
├── Text/
├── Background/
├── Border/
├── Action/
└── Chart/

⸻

85. Figma Design Rule

When Claude creates Figma designs:

DO:

Use existing color variables.

DO NOT:

Create new local colors inside individual screens.

If an existing token does not satisfy a legitimate design need:

1. Identify the need.
2. Check existing tokens.
3. Determine whether a reusable semantic token is required.
4. Update the design system.
5. Then use the token.

Do not silently introduce another blue, gray, green, or red.

⸻

86. Development Token Rule

Application components should reference centralized design tokens.

Conceptually:

Primary Button
→ color.action.primary
Card
→ color.background.surface
→ color.border.default
Page Title
→ color.text.primary

Avoid scattering raw hex values throughout application code.

⸻

87. Tailwind / CSS Readiness

If Tailwind or CSS variables are used, token architecture should preserve semantic meaning.

Conceptual example:

--color-bg-app
--color-bg-surface
--color-text-primary
--color-text-secondary
--color-border-default
--color-action-primary
--color-action-primary-hover
--color-success
--color-warning
--color-danger

Exact implementation should follow PROJECT_SETUP.md.

⸻

88. Module Color Rule

Do not assign permanent colors to modules.

Avoid:

CRM          Blue
Sales        Green
Inventory    Orange
Purchase     Purple
Billing      Teal
Reports      Pink

This creates unnecessary visual fragmentation.

All modules belong to one product.

Use one coherent design system.

⸻

89. Brand Color vs Semantic Color

Blue is primarily:

* Brand
* Interaction
* Selection
* Information

Green is primarily:

* Success

Amber is primarily:

* Warning / Attention

Red is primarily:

* Danger / Error

Neutral is primarily:

* Structure
* Content
* Ordinary Workflow States

Do not interchange these meanings casually.

⸻

90. Sales Metric Color Rule

Example:

Sales
₹18,40,000
↑ 8.4%

Only make ↑ 8.4% green when an increase is contextually positive.

For metrics such as:

Outstanding
₹18,40,000
↑ 8.4%

the increase may be negative.

Color must represent business meaning rather than arrow direction.

⸻

91. Inventory Metric Color Rule

Example:

Available Stock
1,240

does not require green.

Use normal text.

Example:

Low Stock
24 Products

may use warning emphasis.

Example:

Out of Stock
8 Products

may use danger emphasis.

This reduces unnecessary color density.

⸻

92. Billing Metric Color Rule

Example:

Outstanding
₹8,40,000

should generally remain neutral.

Example:

Overdue
₹2,10,000

may use danger emphasis.

Example:

Due This Week
₹1,40,000

may use warning emphasis.

Do not make all money-related cards different colors.

⸻

93. Reports Color Rule

Reports should use:

* Blue as primary data color
* Neutral as comparison/support
* Controlled categorical palette when needed
* Semantic colors only for semantic meaning

Avoid dashboard rainbow effects.

⸻

94. Empty States

Empty states should remain mostly neutral.

Recommended:

Icon          #94A3B8
Title         #334155
Description   #64748B
Action        #2563EB

Do not use colorful illustrations by default.

⸻

95. Illustrations

If illustrations are introduced:

* Use restrained brand blue
* Use neutral shades
* Keep saturation low
* Avoid rainbow illustrations
* Avoid consumer-app aesthetics

Illustrations should remain secondary to application functionality.

⸻

96. Authentication Screens

Authentication may use slightly stronger branding than operational screens.

However:

* Primary action remains blue
* Main form surface remains neutral
* Background should remain light
* Avoid heavy gradients
* Avoid visually distracting artwork

⸻

97. Logo Area

The application should allow the brand logo to retain its approved brand colors.

Do not modify logo colors to match arbitrary screen states.

Logo usage should eventually follow dedicated brand guidelines if provided.

⸻

98. Integration Brand Colors

Third-party integration logos may use their official brand colors.

Examples include:

* WhatsApp
* Email Provider
* SMS Provider
* Payment Provider

However, application controls surrounding integrations should still use the CRM design system.

Do not recolor entire cards according to third-party brands.

⸻

99. WhatsApp Integration

The official WhatsApp logo may retain its recognizable brand treatment where appropriate.

But:

"Send via WhatsApp"

does not automatically require a large green button.

The standard application button hierarchy should generally be preserved.

⸻

100. Financial Documents

Invoice, PO, quotation, and receipt PDFs should use restrained color.

Recommended:

* Primary Blue for small branding accents
* Dark Neutral for important text
* Neutral Gray for secondary text
* Light Gray for tables/borders

Avoid highly colorful commercial documents.

⸻

101. Print Considerations

Documents intended for printing should remain understandable in grayscale.

Do not depend on color alone to communicate:

* Totals
* Status
* Tax
* Payment Information

⸻

102. Color Governance

New colors should only be introduced when:

1. Existing tokens cannot communicate the required meaning.
2. The requirement occurs across multiple components/screens or has a clear semantic purpose.
3. The color passes accessibility requirements.
4. The token can be documented.
5. The change is approved as a design-system update.

⸻

103. Forbidden Practices

Do not:

* Create random hex colors per screen
* Use purple as a primary accent
* Create module-specific palettes
* Create rainbow dashboards
* Use red for ordinary secondary actions
* Use green for every positive-looking number
* Use saturated backgrounds for large areas
* Use gradients for routine UI controls
* Use color as the only status indicator
* Use low-contrast gray text for important information
* Use excessive transparency to simulate disabled states
* Modify design tokens locally to solve one-screen problems

⸻

104. Claude Design Instruction

When designing any screen, Claude must:

1. Read COLORS.md.
2. Use defined Figma variables/tokens.
3. Use blue only for primary interaction, selection, brand, and information.
4. Keep most surfaces neutral.
5. Use semantic colors only when meaning requires them.
6. Avoid decorative colors.
7. Maintain accessible contrast.
8. Use neutral statuses wherever semantic emphasis is unnecessary.
9. Avoid creating new colors.
10. Keep dashboards restrained.
11. Keep tables visually calm.
12. Preserve consistent color meaning across modules.

⸻

105. Claude Development Instruction

When implementing UI, Claude must:

1. Read COLORS.md.
2. Inspect existing design tokens.
3. Reuse centralized semantic tokens.
4. Avoid raw hex values inside components where token usage is available.
5. Preserve hover, focus, pressed, disabled, error, and selected states.
6. Maintain accessible contrast.
7. Do not invent module-specific colors.
8. Do not modify the palette without an explicit design-system requirement.
9. Verify implementation against Figma.
10. Maintain future theme readiness.

⸻

106. Color Decision Hierarchy

When deciding which color to use, follow:

Does the element need color?
↓
No
→ Use Neutral
Yes
↓
Is it a primary interaction or selection?
→ Blue
Is it informational?
→ Blue
Is it successful/completed?
→ Green
Does it require attention?
→ Amber
Is it an error/danger/critical failure?
→ Red
Is it categorical data?
→ Chart Palette

When uncertain, prefer neutral.

⸻

107. Final Color Principle

The application should never depend on color to create visual quality.

The visual hierarchy should primarily come from:

Typography
+
Spacing
+
Layout
+
Borders
+
Surface Hierarchy
+
Component Structure

Color then adds meaning.

The desired visual result is:

A calm, premium business application where blue guides interaction, neutrals structure information, and semantic colors appear only when something genuinely requires the user’s attention.

The color system succeeds when users instinctively understand:

Blue → I can interact / this is selected / informational

Green → Successfully completed / healthy

Amber → Needs attention

Red → Problem / failure / critical

Neutral → Normal business information

without the interface becoming visually noisy.