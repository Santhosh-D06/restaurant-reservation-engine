import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('docs/assets', exist_ok=True)

# -------------------------------------------------------------
# 1. System Architecture Diagram (Figure 4.1)
# -------------------------------------------------------------
def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 96, "TableEase System Architecture -- Layered Fullstack Framework",
            fontsize=13, fontweight='bold', ha='center', va='center', color='#1e293b')

    layers = [
        {
            "y": 74, "h": 17, "title": "Presentation Layer (Client-Side SPA)",
            "bg": "#f0fdf4", "border": "#16a34a",
            "boxes": [
                ("React 18 SPA\n(Vite 5 Build)", 5, 20),
                ("React Router v6\n(Client Routing)", 28, 20),
                ("Context State API\n(AuthContext & CartContext)", 51, 23),
                ("Responsive Styling\n(Vanilla CSS Engine)", 77, 18)
            ]
        },
        {
            "y": 51, "h": 17, "title": "API Gateway & Security Layer (Express 4)",
            "bg": "#eff6ff", "border": "#2563eb",
            "boxes": [
                ("Express Router\n(/api/* Routes)", 5, 20),
                ("Helmet & CORS\n(Security Headers)", 28, 20),
                ("JWT Authentication\n(HMAC-SHA256 Token)", 51, 21),
                ("RBAC Guards\n(Admin & Customer)", 75, 20)
            ]
        },
        {
            "y": 28, "h": 17, "title": "Business Logic & Service Controllers",
            "bg": "#fefce8", "border": "#ca8a04",
            "boxes": [
                ("Reservation Engine\n(Availability & Clashes)", 5, 21),
                ("Order Processor\n(Server Price Validation)", 29, 21),
                ("Slot Utility\n(Hourly Slots & Past Guard)", 53, 21),
                ("Admin Oversight\n(Status Mutations & Stats)", 77, 18)
            ]
        },
        {
            "y": 5, "h": 17, "title": "Data Persistence & Concurrency Layer (MongoDB & Mongoose)",
            "bg": "#faf5ff", "border": "#9333ea",
            "boxes": [
                ("User Collection\n(Bcryptjs Hash)", 5, 17),
                ("Restaurant & Table\n(Unique Table Number)", 25, 22),
                ("Menu Catalog\n(Categorized Dishes)", 50, 20),
                ("Partial Unique Index Guard\n({table, date, timeSlot, isActive:true})", 73, 22)
            ]
        }
    ]

    for layer in layers:
        # Layer bounding box
        rect = patches.FancyBboxPatch((3, layer["y"]), 94, layer["h"],
                                      boxstyle="round,pad=0.5,rounding_size=1.5",
                                      facecolor=layer["bg"], edgecolor=layer["border"],
                                      linewidth=1.8, linestyle='--')
        ax.add_patch(rect)
        ax.text(5, layer["y"] + layer["h"] - 2.5, layer["title"],
                fontsize=9.5, fontweight='bold', color=layer["border"])

        # Inner components
        for text, bx, bw in layer["boxes"]:
            box_rect = patches.FancyBboxPatch((bx, layer["y"] + 2), bw, layer["h"] - 6.5,
                                              boxstyle="round,pad=0.3,rounding_size=1.0",
                                              facecolor="#ffffff", edgecolor=layer["border"],
                                              linewidth=1.2)
            ax.add_patch(box_rect)
            ax.text(bx + bw / 2, layer["y"] + 2 + (layer["h"] - 6.5) / 2, text,
                    fontsize=8, ha='center', va='center', color='#334155', linespacing=1.2)

    # Inter-layer connection arrows
    arrow_props = dict(arrowstyle="<->", color="#475569", lw=1.8, mutation_scale=15)
    for y_arr in [72, 49, 26]:
        ax.annotate("", xy=(30, y_arr), xytext=(30, y_arr + 4), arrowprops=arrow_props)
        ax.annotate("", xy=(70, y_arr), xytext=(70, y_arr + 4), arrowprops=arrow_props)

    plt.tight_layout()
    plt.savefig('docs/assets/fig_4_1_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_4_1_architecture.png")


# -------------------------------------------------------------
# 2. UML Class Diagram (Figure 4.2)
# -------------------------------------------------------------
def create_class_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 7.2), dpi=300)
    ax.set_xlim(0, 105)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(52.5, 96.5, "TableEase UML Class Diagram -- Mongoose Schema Models & Associations",
            fontsize=12.5, fontweight='bold', ha='center', va='center', color='#0f172a')

    # Draw UML Class Box helper
    def draw_uml_class(x, y, w, h, title, fields, methods):
        # Header
        hdr_rect = patches.FancyBboxPatch((x, y + h - 5.5), w, 5.5,
                                          boxstyle="round,pad=0,rounding_size=0.8",
                                          facecolor="#1e3a8a", edgecolor="#1e3a8a", lw=1)
        ax.add_patch(hdr_rect)
        ax.text(x + w/2, y + h - 2.8, f"<<Document>>\n{title}", fontsize=8, fontweight='bold',
                color='#ffffff', ha='center', va='center', linespacing=1.1)

        # Body
        body_rect = patches.Rectangle((x, y), w, h - 5.5, facecolor="#f8fafc",
                                      edgecolor="#64748b", lw=1.2)
        ax.add_patch(body_rect)

        # Fields
        f_y = y + h - 8
        for f in fields:
            ax.text(x + 1.2, f_y, f, fontsize=6.8, color='#1e293b', fontfamily='monospace')
            f_y -= 2.6

        # Divider line
        div_y = f_y - 0.5
        ax.plot([x, x + w], [div_y, div_y], color='#cbd5e1', lw=0.8)

        # Methods
        m_y = div_y - 2.4
        for m in methods:
            ax.text(x + 1.2, m_y, m, fontsize=6.8, color='#0369a1', fontfamily='monospace', fontstyle='italic')
            m_y -= 2.6

    # 1. User
    draw_uml_class(3, 56, 30, 36, "User",
                   ["- _id: ObjectId", "- name: String", "- email: String [Unique]",
                    "- password: String (select:false)", "- phone: String",
                    "- role: 'customer'|'admin'", "- createdAt: Date"],
                   ["+ matchPassword(plain): Bool", "+ pre('save'): HashPassword"])

    # 2. Restaurant
    draw_uml_class(38, 56, 31, 36, "Restaurant",
                   ["- _id: ObjectId", "- name: String", "- description: String",
                    "- cuisine: String", "- address: String", "- city: String",
                    "- openTime: String (HH:MM)", "- closeTime: String (HH:MM)"],
                   ["+ index({name: 1})", "+ index({cuisine:1, city:1})"])

    # 3. Table
    draw_uml_class(74, 62, 28, 30, "Table",
                   ["- _id: ObjectId", "- restaurant: ObjectId [FK]",
                    "- tableNumber: String", "- capacity: Number (1-20)",
                    "- isAvailable: Boolean", "- createdAt: Date"],
                   ["+ index({restaurant, tableNumber},", "        {unique: true})"])

    # 4. Menu
    draw_uml_class(74, 25, 28, 32, "Menu",
                   ["- _id: ObjectId", "- restaurant: ObjectId [FK]",
                    "- name: String", "- description: String",
                    "- category: String", "- price: Number (min:0)",
                    "- isVeg: Boolean", "- isAvailable: Boolean"],
                   ["+ index({restaurant: 1})"])

    # 5. Reservation
    draw_uml_class(3, 8, 32, 40, "Reservation",
                   ["- _id: ObjectId", "- user: ObjectId [FK]",
                    "- restaurant: ObjectId [FK]", "- table: ObjectId [FK]",
                    "- date: String (YYYY-MM-DD)", "- timeSlot: String (HH:MM)",
                    "- guests: Number", "- status: 'pending'|'conf'|'canc'",
                    "- isActive: Boolean"],
                   ["+ pre('validate'): setActive()", "+ index({table, date, timeSlot},", "        unique, isActive:true)"])

    # 6. Order
    draw_uml_class(39, 8, 30, 40, "Order",
                   ["- _id: ObjectId", "- user: ObjectId [FK]",
                    "- restaurant: ObjectId [FK]", "- items: [OrderItem]",
                    "- subtotal: Number", "- total: Number",
                    "- orderType: 'pickup'|'delivery'", "- deliveryAddress: String",
                    "- status: OrderStatus", "- paymentStatus: 'simulated'"],
                   ["+ populateOrder(query)", "+ recalculatePricesFromDB()"])

    # Association Connectors
    # User -> Reservation (1 to N)
    ax.annotate("", xy=(16, 48), xytext=(16, 56),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(17.5, 52, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    # Restaurant -> Table (1 to N)
    ax.annotate("", xy=(74, 76), xytext=(69, 76),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(70, 77.5, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    # Restaurant -> Menu (1 to N)
    ax.annotate("", xy=(74, 43), xytext=(65, 56),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(68, 48, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    # Restaurant -> Reservation
    ax.annotate("", xy=(35, 30), xytext=(45, 56),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(37, 44, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    # User -> Order
    ax.annotate("", xy=(42, 48), xytext=(30, 56),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(33, 50, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    # Restaurant -> Order
    ax.annotate("", xy=(52, 48), xytext=(52, 56),
                arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.text(53.5, 51.5, "1..*", fontsize=7.5, fontweight='bold', color='#475569')

    plt.tight_layout()
    plt.savefig('docs/assets/fig_4_2_class_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_4_2_class_diagram.png")


# -------------------------------------------------------------
# 3. Sequence Diagram (Figure 4.3)
# -------------------------------------------------------------
def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 7.0), dpi=300)
    ax.set_xlim(0, 105)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(52.5, 96.5, "TableEase Sequence Diagram -- Atomic Table Reservation & Concurrency Guard",
            fontsize=12, fontweight='bold', ha='center', va='center', color='#0f172a')

    participants = [
        ("Customer\n(React SPA)", 12),
        ("Express Router\n& Middleware", 35),
        ("Reservation\nController", 58),
        ("Validation\n& Models", 80),
        ("MongoDB\n(Partial Unique)", 98)
    ]

    # Draw lifelines
    for name, x in participants:
        # Box
        box = patches.FancyBboxPatch((x - 8, 86), 16, 7, boxstyle="round,pad=0.3,rounding_size=1",
                                     facecolor="#1e293b", edgecolor="#0f172a")
        ax.add_patch(box)
        ax.text(x, 89.5, name, fontsize=7.5, fontweight='bold', color="#ffffff", ha='center', va='center')

        # Lifeline
        ax.plot([x, x], [86, 6], color="#cbd5e1", lw=1.5, linestyle="--")

    # Sequence steps
    def step_msg(y, x1, x2, text, is_reply=False, is_error=False):
        c = "#dc2626" if is_error else ("#2563eb" if is_reply else "#0f172a")
        ls = "--" if is_reply else "-"
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=c, lw=1.3, linestyle=ls))
        ax.text((x1 + x2)/2, y + 1.2, text, fontsize=6.8, ha='center', va='bottom',
                color=c, fontweight=('bold' if is_error else 'normal'))

    # Step 1: Client submits reservation
    step_msg(80, 12, 35, "1: POST /api/reservations (date, timeSlot, tableId, guests)")

    # Step 2: Auth check
    step_msg(73, 35, 35, "2: protect() verifies Bearer JWT token")

    # Step 3: Forward to controller
    step_msg(66, 35, 58, "3: Forward request payload to create()")

    # Step 4: Validate booking
    step_msg(59, 58, 80, "4: validateBooking() -> Check restaurant, capacity & hourly slots")

    # Step 5: Check existing clash
    step_msg(52, 80, 98, "5: Reservation.exists({table, date, timeSlot, isActive:true})")
    step_msg(46, 98, 80, "6: Return exists status (false)", is_reply=True)

    # Step 6: Save attempt
    step_msg(39, 58, 98, "7: doc.save() -> Evaluates Partial Unique Index")

    # Alt Frame: Success vs Race Condition
    alt_box = patches.Rectangle((4, 11), 97, 23, fill=False, edgecolor="#e2e8f0", lw=1.2, linestyle=":")
    ax.add_patch(alt_box)
    ax.text(6, 32, "[Alt: Concurrency Race Condition Guard]", fontsize=7, fontweight='bold', color="#64748b")

    # Clash condition
    step_msg(28, 98, 58, "[Race condition] E11000 Duplicate Key Error", is_reply=True, is_error=True)
    step_msg(22, 58, 12, "409 Conflict: 'Table already booked for selected slot'", is_reply=True, is_error=True)

    # Success condition
    step_msg(16, 98, 58, "[Unique slot] Index accepts -> Document inserted", is_reply=True)
    step_msg(10, 58, 12, "201 Created: { success: true, reservation: doc }", is_reply=True)

    plt.tight_layout()
    plt.savefig('docs/assets/fig_4_3_sequence_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_4_3_sequence_diagram.png")


if __name__ == '__main__':
    create_architecture_diagram()
    create_class_diagram()
    create_sequence_diagram()
