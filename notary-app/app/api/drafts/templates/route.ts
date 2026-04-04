import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Built-in system templates seeded on first access
const SYSTEM_TEMPLATES = [
    {
        id: "sys-home-sale",
        name: "Heshiis Guri (Home Sale Agreement)",
        description: "Heshiiska iibka guriga - Standard home purchase agreement",
        category: "real_estate",
        isDefault: true,
        content: `GURIGA IIB-IIBSI HESHIISKIISA
(HOME SALE AGREEMENT)

Taariikhdii: {{date}}

Iibiyaha (SELLER):
  Magaca: {{seller_name}}
  Cinwaanka: {{seller_address}}
  Lambarka Aqoonsiga: {{seller_id_number}}

Iibsadaha (BUYER):
  Magaca: {{buyer_name}}
  Cinwaanka: {{buyer_address}}
  Lambarka Aqoonsiga: {{buyer_id_number}}

HANTIDA (PROPERTY):
  Cinwaanka Guriga: {{property_address}}
  Gobolka / Degmada: {{property_city}}
  Cabbirka: {{property_size}} sq ft
  Qiimaha Suuqa: \${{market_value}}

QIIMAHA IIB-IIBSIGA:
  Qiimaha la Heshiiyay: \${{agreed_price}}
  Lacagta Hordhaca (Down Payment): \${{down_payment}}
  Hadhka (Balance Due): \${{balance_due}}

XAALADAHA HESHIISKA:
  1. Iibiyuhu wuxuu oggolaanayaa inuu guriga ku daro xaaladdii {{property_condition}}.
  2. Taariikhda Wareejinta: {{closing_date}}
  3. Guriga lama gaadhsiinayo intaan lacagta oo dhammi la bixinin.
  4. Heshiiskani wuxuu ku shaqeynayaa shuruucda {{jurisdiction}}.

SI AQOONSIGA NOTARY AH:
Heshiiskani waxaa hor-fadhiga notary-ga ee {{notary_name}} lagu saxeexay {{signing_date}}.

________________________        ________________________
Iibiyaha (Seller)                Iibsadaha (Buyer)
{{seller_name}}                  {{buyer_name}}

________________________
Notary Public
{{notary_name}}
`,
        fields: [
            { name: "date", label: "Taariikhdii Heshiiska", type: "date", required: true },
            { name: "seller_name", label: "Magaca Iibiyaha (Seller)", type: "text", required: true, placeholder: "Faarax Maxamed Cali" },
            { name: "seller_address", label: "Cinwaanka Iibiyaha", type: "text", required: true, placeholder: "123 Main St, Mogadishu" },
            { name: "seller_id_number", label: "ID Iibiyaha", type: "text", required: true, placeholder: "A1234567" },
            { name: "buyer_name", label: "Magaca Iibsadaha (Buyer)", type: "text", required: true, placeholder: "Axmed Cali Shire" },
            { name: "buyer_address", label: "Cinwaanka Iibsadaha", type: "text", required: true, placeholder: "456 Oak Ave, Hargeisa" },
            { name: "buyer_id_number", label: "ID Iibsadaha", type: "text", required: true, placeholder: "B7654321" },
            { name: "property_address", label: "Cinwaanka Guriga", type: "text", required: true, placeholder: "789 Property Lane" },
            { name: "property_city", label: "Gobol / Degmo", type: "text", required: true, placeholder: "Mogadishu" },
            { name: "property_size", label: "Cabbirka (sq ft)", type: "number", required: false, placeholder: "2000" },
            { name: "market_value", label: "Qiimaha Suuqa ($)", type: "number", required: true, placeholder: "250000" },
            { name: "agreed_price", label: "Qiimaha la Heshiiyay ($)", type: "number", required: true, placeholder: "240000" },
            { name: "down_payment", label: "Lacagta Hordhaca ($)", type: "number", required: true, placeholder: "48000" },
            { name: "balance_due", label: "Hadhka ($)", type: "number", required: true, placeholder: "192000" },
            { name: "property_condition", label: "Xaaladda Guriga", type: "text", required: false, placeholder: "As-Is condition" },
            { name: "closing_date", label: "Taariikhda Wareejinta", type: "date", required: true },
            { name: "jurisdiction", label: "Sharciga Degaanka", type: "text", required: false, placeholder: "Federal Republic of Somalia" },
            { name: "notary_name", label: "Magaca Notary-ga", type: "text", required: true, placeholder: "Notary Name" },
            { name: "signing_date", label: "Taariikhda Saxeexidda", type: "date", required: true },
        ],
    },
    {
        id: "sys-car-sale",
        name: "Iib Gaari (Vehicle Sale Agreement)",
        description: "Heshiiska iibka baabuurka - Standard vehicle/car sale agreement",
        category: "vehicle",
        isDefault: true,
        content: `BAABUURKA IIB-IIBSI HESHIISKIISA
(VEHICLE SALE AGREEMENT)

Taariikhdii: {{date}}

Iibiyaha (SELLER):
  Magaca: {{seller_name}}
  Lambarka Telefoonka: {{seller_phone}}
  Lambarka Aqoonsiga: {{seller_id_number}}

Iibsadaha (BUYER):
  Magaca: {{buyer_name}}
  Lambarka Telefoonka: {{buyer_phone}}
  Lambarka Aqoonsiga: {{buyer_id_number}}

FAAHFAAHINTA GAARIGA (VEHICLE DETAILS):
  Nooca Gaariga: {{vehicle_make}} {{vehicle_model}}
  Sanadka: {{vehicle_year}}
  Midabka: {{vehicle_color}}
  Lambarka Chassis/VIN: {{vin_number}}
  Lambarka Daabacaadda (Plate): {{license_plate}}
  Duulista (Mileage): {{mileage}} miles/km

QIIMAHA IIB-IIBSIGA:
  Qiimaha la Heshiiyay: \${{sale_price}}
  Hab-Bixinta: {{payment_method}}

XAALADAHA:
  1. Gaarigani waxaa lagu iibinaayaa {{sale_condition}}.
  2. Iibiyuhu wuxuu dammaanad qaadayaa in gaarigani aanay lahayn amaah qarstoon.
  3. Wareejinta waxay dhacaysaa: {{transfer_date}}

Waan ogahay in heshiiskani yahay mid sharciga ah.

________________________        ________________________
Iibiyaha (Seller)                Iibsadaha (Buyer)
{{seller_name}}                  {{buyer_name}}

________________________
Notary Public
{{notary_name}}
Taariikh: {{signing_date}}
`,
        fields: [
            { name: "date", label: "Taariikhdii", type: "date", required: true },
            { name: "seller_name", label: "Magaca Iibiyaha", type: "text", required: true, placeholder: "Faarax Maxamed" },
            { name: "seller_phone", label: "Tel. Iibiyaha", type: "text", required: false, placeholder: "+252 61 234 5678" },
            { name: "seller_id_number", label: "ID Iibiyaha", type: "text", required: true, placeholder: "A1234567" },
            { name: "buyer_name", label: "Magaca Iibsadaha", type: "text", required: true, placeholder: "Axmed Cali" },
            { name: "buyer_phone", label: "Tel. Iibsadaha", type: "text", required: false, placeholder: "+252 61 987 6543" },
            { name: "buyer_id_number", label: "ID Iibsadaha", type: "text", required: true, placeholder: "B9876543" },
            { name: "vehicle_make", label: "Nooca Gaariga (Make)", type: "text", required: true, placeholder: "Toyota" },
            { name: "vehicle_model", label: "Model-ka", type: "text", required: true, placeholder: "Land Cruiser" },
            { name: "vehicle_year", label: "Sanadka", type: "text", required: true, placeholder: "2020" },
            { name: "vehicle_color", label: "Midabka", type: "text", required: false, placeholder: "White" },
            { name: "vin_number", label: "VIN / Chassis Number", type: "text", required: true, placeholder: "1HGCM82633A123456" },
            { name: "license_plate", label: "Lambarka Daabacaadda", type: "text", required: false, placeholder: "MOG-1234" },
            { name: "mileage", label: "Duulista", type: "number", required: false, placeholder: "85000" },
            { name: "sale_price", label: "Qiimaha Iibka ($)", type: "number", required: true, placeholder: "15000" },
            { name: "payment_method", label: "Hab-Bixinta", type: "text", required: false, placeholder: "Cash / EVC Plus / Bank Transfer" },
            { name: "sale_condition", label: "Xaaladda Iibka", type: "text", required: false, placeholder: "As-Is, no warranty" },
            { name: "transfer_date", label: "Taariikhda Wareejinta", type: "date", required: true },
            { name: "notary_name", label: "Magaca Notary-ga", type: "text", required: true, placeholder: "Notary Name" },
            { name: "signing_date", label: "Taariikhda Saxeexidda", type: "date", required: true },
        ],
    },
    {
        id: "sys-poa",
        name: "Awood-siin / Power of Attorney",
        description: "Warqadda awood-siinta - General Power of Attorney document",
        category: "legal",
        isDefault: true,
        content: `WARQADDA AWOOD-SIINTA
(POWER OF ATTORNEY)

Taariikhdii: {{date}}

AWOOD-SIIYAHA (PRINCIPAL):
  Magaca: {{principal_name}}
  Cinwaanka: {{principal_address}}
  Lambarka Aqoonsiga: {{principal_id_number}}
  Lambarka Telefoonka: {{principal_phone}}

AWOOD-HAYAHA (ATTORNEY-IN-FACT / AGENT):
  Magaca: {{agent_name}}
  Cinwaanka: {{agent_address}}
  Lambarka Aqoonsiga: {{agent_id_number}}
  Xidhiidhka (Relationship): {{relationship}}

AWOODA LA SIINAYO (POWERS GRANTED):
{{powers_description}}

MUDDADA:
  Bilowga: {{start_date}}
  Dhamaadka: {{end_date}} (Haddii aanay jirin, waxay soconaysaa illaa la joojinayo)

SHURUUDAHA GAARKA AH:
{{special_conditions}}

Aniga {{principal_name}} waxaan u ogolaanayaa {{agent_name}} inuu/ay ii matalaan waxyaabaha kor ku xusan. Heshiiskani wuxuu saxeex u baahan yahay notary.

________________________
Awood-Siiyaha (Principal)
{{principal_name}}
Taariikh: {{signing_date}}

________________________
Markhaati (Witness)
{{witness_name}}

________________________
Notary Public
{{notary_name}}
Taariikhda Xaqiijinta: {{notarization_date}}
`,
        fields: [
            { name: "date", label: "Taariikhdii", type: "date", required: true },
            { name: "principal_name", label: "Magaca Awood-Siiyaha (Principal)", type: "text", required: true, placeholder: "Faarax Maxamed Cali" },
            { name: "principal_address", label: "Cinwaanka Awood-Siiyaha", type: "text", required: true, placeholder: "Mogadishu, Somalia" },
            { name: "principal_id_number", label: "ID Awood-Siiyaha", type: "text", required: true, placeholder: "P1234567" },
            { name: "principal_phone", label: "Tel. Awood-Siiyaha", type: "text", required: false, placeholder: "+252 61 234 5678" },
            { name: "agent_name", label: "Magaca Awood-Hayaha (Agent)", type: "text", required: true, placeholder: "Axmed Cali Shire" },
            { name: "agent_address", label: "Cinwaanka Awood-Hayaha", type: "text", required: true, placeholder: "Hargeisa, Somaliland" },
            { name: "agent_id_number", label: "ID Awood-Hayaha", type: "text", required: true, placeholder: "A9876543" },
            { name: "relationship", label: "Xidhiidhka", type: "text", required: false, placeholder: "walaal / father / cousin" },
            { name: "powers_description", label: "Awooda La Siinayo", type: "textarea", required: true, placeholder: "Inuu matalayo arrimaha lacagaha bangiyo, guryaha, iyo wixii la xidiidhay" },
            { name: "start_date", label: "Taariikhda Bilowga", type: "date", required: true },
            { name: "end_date", label: "Taariikhda Dhamaadka (Optional)", type: "date", required: false },
            { name: "special_conditions", label: "Shuruudaha Gaarka ah", type: "textarea", required: false, placeholder: "Wax sharci ah oo kale..." },
            { name: "signing_date", label: "Taariikhda Saxeexidda", type: "date", required: true },
            { name: "witness_name", label: "Magaca Markhaatiga", type: "text", required: false, placeholder: "Witness Full Name" },
            { name: "notary_name", label: "Magaca Notary-ga", type: "text", required: true, placeholder: "Notary Name" },
            { name: "notarization_date", label: "Taariikhda Xaqiijinta", type: "date", required: true },
        ],
    },
    {
        id: "sys-rental",
        name: "Heshiis Kiro (Rental Agreement)",
        description: "Heshiiska kirada guriga ama xafiiska - Lease / Rental Agreement",
        category: "real_estate",
        isDefault: true,
        content: `HESHIISKA KIRADA
(RENTAL / LEASE AGREEMENT)

Taariikhdii: {{date}}

MULKIILAHA (LANDLORD):
  Magaca: {{landlord_name}}
  Cinwaanka Xiriirka: {{landlord_contact}}

KIRAYSTE (TENANT):
  Magaca: {{tenant_name}}
  Lambarka Aqoonsiga: {{tenant_id}}
  Lambarka Telefoonka: {{tenant_phone}}

HANTIDA KIREYSAN (RENTAL PROPERTY):
  Cinwaanka: {{property_address}}
  Nooca: {{property_type}}
  Qolalka: {{num_rooms}} qol

QIIMAHA KIRADA:
  Kirada Bishii: \${{monthly_rent}}
  Deposit: \${{security_deposit}}
  Lacagta Hore: \${{advance_payment}}

MUDDADA HESHIISKA:
  Bilowga: {{lease_start}}
  Dhamaadka: {{lease_end}}

XAALADAHA GUUD:
  1. Kiraystuhu wuxuu bixi doonaa kiro bishkiiba marka ay tahay {{payment_due_day}} bisha.
  2. Xafiilada guriga (utilities) waxay ku jirtaa: {{utilities_included}}
  3. Xoolaha (Pets): {{pets_policy}}
  4. Haddii kirada waqtigeeda dhamaato, waa in kor loogu xiddigaa {{notice_period}} bisho horena.

________________________        ________________________
Mulkiilaha (Landlord)            Kirayste (Tenant)
{{landlord_name}}                {{tenant_name}}

________________________
Notary Public
{{notary_name}}
Taariikh: {{signing_date}}
`,
        fields: [
            { name: "date", label: "Taariikhdii", type: "date", required: true },
            { name: "landlord_name", label: "Magaca Mulkiilaha", type: "text", required: true, placeholder: "Faarax Maxamed" },
            { name: "landlord_contact", label: "Xiriirka Mulkiilaha", type: "text", required: false, placeholder: "+252 61 234 5678" },
            { name: "tenant_name", label: "Magaca Kiraystuhu", type: "text", required: true, placeholder: "Axmed Cali" },
            { name: "tenant_id", label: "ID Kiraystuhu", type: "text", required: true, placeholder: "T1234567" },
            { name: "tenant_phone", label: "Tel. Kiraystuhu", type: "text", required: false, placeholder: "+252 61 987 6543" },
            { name: "property_address", label: "Cinwaanka Hantida", type: "text", required: true, placeholder: "Km 4, Mogadishu" },
            { name: "property_type", label: "Nooca Hantida", type: "text", required: false, placeholder: "xafiska / guriga / dukaanka" },
            { name: "num_rooms", label: "Tirada Qolalka", type: "number", required: false, placeholder: "3" },
            { name: "monthly_rent", label: "Kirada Bishii ($)", type: "number", required: true, placeholder: "500" },
            { name: "security_deposit", label: "Deposit ($)", type: "number", required: false, placeholder: "1000" },
            { name: "advance_payment", label: "Lacagta Hore ($)", type: "number", required: false, placeholder: "500" },
            { name: "lease_start", label: "Bilowga Heshiiska", type: "date", required: true },
            { name: "lease_end", label: "Dhamaadka Heshiiska", type: "date", required: true },
            { name: "payment_due_day", label: "Maalinta Bixinta", type: "text", required: false, placeholder: "1aad" },
            { name: "utilities_included", label: "Xafiilada ku Jirta", type: "text", required: false, placeholder: "Biyo, korontada la mid ah" },
            { name: "pets_policy", label: "Xoolaha (Pets)", type: "text", required: false, placeholder: "Looma ogola" },
            { name: "notice_period", label: "Mudada Ogeysiiska", type: "text", required: false, placeholder: "2" },
            { name: "notary_name", label: "Magaca Notary-ga", type: "text", required: true, placeholder: "Notary Name" },
            { name: "signing_date", label: "Taariikhda Saxeexidda", type: "date", required: true },
        ],
    },
];

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Combine system templates with tenant-custom ones
        const tenantTemplates = await prisma.documentTemplate.findMany({
            where: {
                OR: [
                    { tenantId: session.user.tenantId },
                    { tenantId: null, isDefault: true },
                ],
                deletedAt: null,
                isActive: true,
            },
            orderBy: { createdAt: "asc" },
        });

        // If tenant has no custom templates at all, seed system templates
        if (tenantTemplates.length === 0) {
            await prisma.documentTemplate.createMany({
                data: SYSTEM_TEMPLATES.map((t) => ({
                    id: `${t.id}-${session.user.tenantId}`,
                    name: t.name,
                    description: t.description,
                    category: t.category,
                    content: t.content,
                    fields: t.fields,
                    isDefault: true,
                    tenantId: session.user.tenantId,
                })),
            });

            const seeded = await prisma.documentTemplate.findMany({
                where: { tenantId: session.user.tenantId, deletedAt: null },
                orderBy: { createdAt: "asc" },
            });
            return NextResponse.json(seeded);
        }

        return NextResponse.json(tenantTemplates);
    } catch (e: any) {
        console.error("GET /api/drafts/templates Error:", e);
        return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, category, content, fields } = body;

    if (!name || !content || !fields) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const template = await prisma.documentTemplate.create({
        data: {
            name,
            description,
            category: category || "general",
            content,
            fields,
            tenantId: session.user.tenantId,
        },
    });

    return NextResponse.json(template, { status: 201 });
}
