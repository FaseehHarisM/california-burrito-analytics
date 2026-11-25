import { NextRequest, NextResponse } from "next/server";
import { getPaginatedOrders } from "@/lib/data-service";
import { FilterState } from "@/types/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const outlets = searchParams.get("outlets") ? searchParams.get("outlets")!.split(",") : undefined;
    const orderTypes = searchParams.get("orderTypes") ? searchParams.get("orderTypes")!.split(",") : undefined;
    const settlements = searchParams.get("settlements") ? searchParams.get("settlements")!.split(",") : undefined;

    const filters: Partial<FilterState> = {
      startDate,
      endDate,
      outlets,
      orderTypes,
      settlements,
    };

    const result = getPaginatedOrders(filters, page, limit, search);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("Orders API Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders", details: error.message },
      { status: 500 }
    );
  }
}
